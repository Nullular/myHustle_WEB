package com.blueclipse.myhustle.data.repository

import android.content.Context
import android.net.Uri
import android.util.Log
import com.blueclipse.myhustle.data.model.*
import com.blueclipse.myhustle.data.storage.MediaStorageManager
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.tasks.await

/**
 * Enhanced repository with media management capabilities
 * Handles both data and media assets for shops and catalog items
 */
class EnhancedShopRepository private constructor() {
    
    private val firestore = FirebaseFirestore.getInstance()
    private val mediaManager = MediaStorageManager.instance
    private val shopsCollection = firestore.collection("shops")
    
    // State management
    private val _shops = MutableStateFlow<List<EnhancedShop>>(emptyList())
    val shops: StateFlow<List<EnhancedShop>> = _shops.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    companion object {
        val instance: EnhancedShopRepository by lazy { EnhancedShopRepository() }
    }
    
    /**
     * Create a new shop with media assets
     */
    suspend fun createShop(
        shop: EnhancedShop,
        logoUri: Uri?,
        bannerUri: Uri?,
        galleryUris: List<Uri>,
        context: Context
    ): Result<String> {
        return try {
            Log.d("EnhancedRepo", "🏪 Creating shop with media: ${shop.name}")
            
            var updatedShop = shop
            
            // Upload logo
            logoUri?.let { uri ->
                val logoResult = mediaManager.uploadShopMedia(shop.id, "logo", uri, context)
                if (logoResult.isSuccess) {
                    updatedShop = updatedShop.copy(logo = logoResult.getOrNull())
                }
            }
            
            // Upload banner
            bannerUri?.let { uri ->
                val bannerResult = mediaManager.uploadShopMedia(shop.id, "banner", uri, context)
                if (bannerResult.isSuccess) {
                    updatedShop = updatedShop.copy(banner = bannerResult.getOrNull())
                }
            }
            
            // Upload gallery images
            val galleryAssets = mutableListOf<MediaAsset>()
            galleryUris.forEach { uri ->
                val galleryResult = mediaManager.uploadShopMedia(shop.id, "gallery", uri, context)
                galleryResult.getOrNull()?.let { asset ->
                    galleryAssets.add(asset)
                }
            }
            updatedShop = updatedShop.copy(gallery = galleryAssets)
            
            // Save to Firestore
            val docRef = shopsCollection.add(updatedShop).await()
            Result.success(docRef.id)
            
        } catch (e: Exception) {
            Log.e("EnhancedRepo", "❌ Failed to create shop", e)
            Result.failure(e)
        }
    }
    
    /**
     * Add catalog item with media
     */
    suspend fun addCatalogItemWithMedia(
        shopId: String,
        item: EnhancedCatalogItem,
        primaryImageUri: Uri?,
        galleryUris: List<Uri>,
        context: Context
    ): Result<Unit> {
        return try {
            Log.d("EnhancedRepo", "📦 Adding catalog item with media: ${item.name}")
            
            var updatedItem = item
            
            // Upload primary image
            primaryImageUri?.let { uri ->
                val primaryResult = mediaManager.uploadCatalogItemMedia(
                    item.id, item.isProduct, "primary", uri, context
                )
                if (primaryResult.isSuccess) {
                    updatedItem = updatedItem.copy(primaryImage = primaryResult.getOrNull())
                }
            }
            
            // Upload gallery images
            val galleryAssets = mutableListOf<MediaAsset>()
            galleryUris.forEach { uri ->
                val galleryResult = mediaManager.uploadCatalogItemMedia(
                    item.id, item.isProduct, "gallery", uri, context
                )
                galleryResult.getOrNull()?.let { asset ->
                    galleryAssets.add(asset)
                }
            }
            updatedItem = updatedItem.copy(images = galleryAssets)
            
            // Add to shop's catalog
            val shopDoc = shopsCollection.document(shopId)
            val currentShop = shopDoc.get().await().toObject(EnhancedShop::class.java)
            
            currentShop?.let { shop ->
                val updatedCatalog = shop.catalog + updatedItem
                shopDoc.update("catalog", updatedCatalog).await()
            }
            
            Result.success(Unit)
            
        } catch (e: Exception) {
            Log.e("EnhancedRepo", "❌ Failed to add catalog item", e)
            Result.failure(e)
        }
    }
    
    /**
     * Search shops and catalog items
     */
    suspend fun searchShops(
        query: String,
        category: String? = null,
        minRating: Float? = null
    ): Result<List<EnhancedShop>> {
        return try {
            var queryRef: Query = shopsCollection
            
            // Add filters
            category?.let {
                queryRef = queryRef.whereEqualTo("category", it)
            }
            
            minRating?.let {
                queryRef = queryRef.whereGreaterThanOrEqualTo("rating", it)
            }
            
            val snapshot = queryRef.get().await()
            val shops = snapshot.documents.mapNotNull { doc ->
                doc.toObject(EnhancedShop::class.java)?.copy(id = doc.id)
            }
            
            // Filter by search query (client-side for now)
            val filteredShops = if (query.isNotBlank()) {
                shops.filter { shop ->
                    shop.name.contains(query, ignoreCase = true) ||
                    shop.description.contains(query, ignoreCase = true) ||
                    shop.catalog.any { item ->
                        item.name.contains(query, ignoreCase = true) ||
                        item.description.contains(query, ignoreCase = true) ||
                        item.tags.any { tag -> tag.contains(query, ignoreCase = true) }
                    }
                }
            } else {
                shops
            }
            
            Result.success(filteredShops)
            
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Get featured/trending items
     */
    suspend fun getFeaturedItems(): Result<List<EnhancedCatalogItem>> {
        return try {
            val snapshot = shopsCollection.get().await()
            val allItems = mutableListOf<EnhancedCatalogItem>()
            
            snapshot.documents.forEach { doc ->
                val shop = doc.toObject(EnhancedShop::class.java)
                shop?.catalog?.filter { it.featured }?.let { featuredItems ->
                    allItems.addAll(featuredItems)
                }
            }
            
            // Sort by rating and recent updates
            val sortedItems = allItems.sortedWith(
                compareByDescending<EnhancedCatalogItem> { it.rating }
                    .thenByDescending { it.updatedAt }
            )
            
            Result.success(sortedItems.take(20)) // Return top 20
            
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Analytics: Get popular categories
     */
    suspend fun getPopularCategories(): Result<Map<String, Int>> {
        return try {
            val snapshot = shopsCollection.get().await()
            val categoryCount = mutableMapOf<String, Int>()
            
            snapshot.documents.forEach { doc ->
                val shop = doc.toObject(EnhancedShop::class.java)
                shop?.catalog?.forEach { item ->
                    if (item.category.isNotBlank()) {
                        categoryCount[item.category] = (categoryCount[item.category] ?: 0) + 1
                    }
                }
            }
            
            Result.success(categoryCount)
            
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
