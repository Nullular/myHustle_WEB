package com.blueclipse.myhustle.data.repository

import com.blueclipse.myhustle.data.model.Shop
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.tasks.await

/**
 * Firebase-powered repository for Shop data.
 * Provides real-time synchronization with Firestore.
 */
class FirebaseShopRepository private constructor() {
    
    private val firestore: FirebaseFirestore = Firebase.firestore
    private val shopsCollection = firestore.collection("shops")
    private val auth = FirebaseAuth.getInstance()
    
    // Internal mutable state
    private val _shops = MutableStateFlow<List<Shop>>(emptyList())
    /** Public flow of current shop list */
    val shops: StateFlow<List<Shop>> = _shops.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private var shopsListener: ListenerRegistration? = null
    
    init {
        // Start listening to Firestore changes for public shop data
        startRealtimeListener()
        
        // Listen for auth changes - but keep showing active shops for everyone
        auth.addAuthStateListener { firebaseAuth ->
            val user = firebaseAuth.currentUser
            android.util.Log.d("FirebaseShopRepo", "Auth state changed: ${user?.email ?: "signed out"}")
            
            if (user == null) {
                // User signed out - but still show active shops (public data)
                android.util.Log.d("FirebaseShopRepo", "🚪 User signed out, maintaining public shop view")
                // Don't clear data - shops are public and should remain visible
            } else {
                // User signed in - refresh data
                android.util.Log.d("FirebaseShopRepo", "🔐 User signed in, refreshing shop data")
                startRealtimeListener()
            }
        }
    }
    
    /**
     * Clear all cached data (called on sign out)
     */
    private fun clearData() {
        _shops.value = emptyList()
        _isLoading.value = false
        // Remove existing listener
        shopsListener?.remove()
        shopsListener = null
    }
    
    /**
     * Set up real-time listener for shop updates
     * Only listens to active shops to comply with security rules
     */
    private fun startRealtimeListener() {
        // Remove existing listener first
        shopsListener?.remove()
        
        // Query for active shops only (using "active" field, not "isActive")
        val query = shopsCollection.whereEqualTo("active", true)
        
        shopsListener = query.addSnapshotListener { snapshot, error ->
            if (error != null) {
                android.util.Log.e("FirebaseShopRepo", "Error in shop listener", error)
                return@addSnapshotListener
            }
            
            if (snapshot != null) {
                android.util.Log.d("FirebaseShopRepo", "Processing ${snapshot.documents.size} active shop documents")
                val shopList = snapshot.documents.mapNotNull { document ->
                    try {
                        val shop = document.toObject(Shop::class.java)?.copy(id = document.id)
                        android.util.Log.d("FirebaseShopRepo", "Successfully parsed active shop: ${shop?.name}")
                        shop
                    } catch (e: Exception) {
                        android.util.Log.e("FirebaseShopRepo", "Failed to parse shop document ${document.id}", e)
                        null // Skip invalid documents
                    }
                }
                android.util.Log.d("FirebaseShopRepo", "Successfully parsed ${shopList.size} active shops")
                _shops.value = shopList
            }
        }
    }
    
    /**
     * Retrieve all active shops from Firestore
     */
    suspend fun fetchShops(): Result<List<Shop>> {
        return try {
            _isLoading.value = true
            android.util.Log.d("FirebaseShopRepo", "Fetching active shops from Firestore")
            
            // Query only active shops to comply with security rules (using "active" field)
            val snapshot = shopsCollection.whereEqualTo("active", true).get().await()
            android.util.Log.d("FirebaseShopRepo", "Fetched ${snapshot.documents.size} active shop documents")
            
            val shops = snapshot.documents.mapNotNull { document ->
                try {
                    val shop = document.toObject(Shop::class.java)?.copy(id = document.id)
                    android.util.Log.d("FirebaseShopRepo", "Successfully parsed active shop in fetch: ${shop?.name}")
                    shop
                } catch (e: Exception) {
                    android.util.Log.e("FirebaseShopRepo", "Failed to parse shop document ${document.id} in fetch", e)
                    null
                }
            }
            android.util.Log.d("FirebaseShopRepo", "Successfully parsed ${shops.size} active shops in fetch")
            _shops.value = shops
            Result.success(shops)
        } catch (e: Exception) {
            android.util.Log.e("FirebaseShopRepo", "Error fetching active shops", e)
            Result.failure(e)
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * Retrieve a shop by its unique ID
     */
    suspend fun getShopById(id: String): Shop? {
        return try {
            val document = shopsCollection.document(id).get().await()
            document.toObject(Shop::class.java)?.copy(id = document.id)
        } catch (e: Exception) {
            null
        }
    }
    
    /**
     * Add a new shop to Firestore
     */
    suspend fun addShop(shop: Shop): Result<String> {
        return try {
            val docRef = shopsCollection.add(shop).await()
            Result.success(docRef.id)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Update an existing shop
     */
    suspend fun updateShop(shop: Shop): Result<Unit> {
        return try {
            shopsCollection.document(shop.id).set(shop).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Toggle the 'favorite' status of a shop
     */
    suspend fun toggleFavorite(id: String): Result<Unit> {
        return try {
            val shop = getShopById(id)
            if (shop != null) {
                val updatedShop = shop.copy(isFavorite = !shop.isFavorite)
                updateShop(updatedShop)
            } else {
                Result.failure(Exception("Shop not found"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Get shops owned by a specific user
     */
    suspend fun getShopsByOwner(ownerId: String): List<Shop> {
        return try {
            val snapshot = shopsCollection
                .whereEqualTo("ownerId", ownerId)
                .whereEqualTo("active", true) // Only get active shops
                .get()
                .await()
            
            android.util.Log.d("FirebaseShopRepo", "Fetched ${snapshot.documents.size} active shops for owner $ownerId")
            
            val shops = snapshot.documents.mapNotNull { document ->
                try {
                    val shop = document.toObject(Shop::class.java)?.copy(id = document.id)
                    android.util.Log.d("FirebaseShopRepo", "Successfully parsed owner shop: ${shop?.name}")
                    shop
                } catch (e: Exception) {
                    android.util.Log.e("FirebaseShopRepo", "Failed to parse owner shop document ${document.id}", e)
                    null // Skip invalid documents
                }
            }
            
            android.util.Log.d("FirebaseShopRepo", "Successfully parsed ${shops.size} active shops for owner $ownerId")
            shops
        } catch (e: Exception) {
            android.util.Log.e("FirebaseShopRepo", "Error fetching shops for owner $ownerId", e)
            emptyList() // Return empty list on error
        }
    }

    /**
     * Delete a shop from Firestore
     */
    suspend fun deleteShop(id: String): Result<Unit> {
        return try {
            shopsCollection.document(id).delete().await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    companion object {
        /** Singleton instance */
        val instance: FirebaseShopRepository by lazy { FirebaseShopRepository() }
    }
}
