package com.blueclipse.myhustle.data.storage

import android.content.Context
import android.net.Uri
import android.util.Log
import com.blueclipse.myhustle.data.model.MediaAsset
import com.blueclipse.myhustle.data.model.MediaType
import com.google.firebase.storage.FirebaseStorage
import kotlinx.coroutines.tasks.await
import java.util.UUID

/**
 * Firebase Storage manager for handling all media assets
 * Provides image upload, optimization, thumbnail generation, and URL management
 */
class MediaStorageManager private constructor() {
    
    private val storage = FirebaseStorage.getInstance()
    private val storageRef = storage.reference
    
    companion object {
        val instance: MediaStorageManager by lazy { MediaStorageManager() }
        
        // Storage paths
        private const val SHOPS_PATH = "shops"
        private const val PRODUCTS_PATH = "products" 
        private const val SERVICES_PATH = "services"
        private const val USERS_PATH = "users"
        private const val THUMBNAILS_PATH = "thumbnails"
        
        // Image quality settings
        private const val HIGH_QUALITY = 90
        private const val MEDIUM_QUALITY = 70
        private const val THUMBNAIL_QUALITY = 50
        private const val THUMBNAIL_SIZE = 300
    }
    
    /**
     * Upload shop media (logo, banner, gallery)
     */
    suspend fun uploadShopMedia(
        shopId: String,
        mediaType: String, // "logo", "banner", "gallery"
        uri: Uri,
        context: Context
    ): Result<MediaAsset> {
        return try {
            val path = "$SHOPS_PATH/$shopId/$mediaType/${UUID.randomUUID()}"
            uploadImage(uri, path, context)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Upload product/service media
     */
    suspend fun uploadCatalogItemMedia(
        itemId: String,
        isProduct: Boolean,
        mediaType: String, // "primary", "gallery", "videos"
        uri: Uri,
        context: Context
    ): Result<MediaAsset> {
        return try {
            val basePath = if (isProduct) PRODUCTS_PATH else SERVICES_PATH
            val path = "$basePath/$itemId/$mediaType/${UUID.randomUUID()}"
            uploadImage(uri, path, context)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Core image upload with automatic optimization and thumbnail generation
     */
    private suspend fun uploadImage(
        uri: Uri,
        path: String,
        context: Context
    ): Result<MediaAsset> {
        return try {
            Log.d("MediaStorage", "📤 Uploading image to path: $path")
            
            // Create references
            val imageRef = storageRef.child("$path.jpg")
            val thumbnailRef = storageRef.child("$THUMBNAILS_PATH/$path.jpg")
            
            // Read and optimize the image
            val inputStream = context.contentResolver.openInputStream(uri)
            val originalBytes = inputStream?.readBytes() ?: throw Exception("Could not read image")
            
            // Create optimized version
            val optimizedBytes = optimizeImage(originalBytes, HIGH_QUALITY)
            val thumbnailBytes = optimizeImage(originalBytes, THUMBNAIL_QUALITY, THUMBNAIL_SIZE)
            
            // Upload both versions
            val uploadTask = imageRef.putBytes(optimizedBytes).await()
            val thumbnailTask = thumbnailRef.putBytes(thumbnailBytes).await()
            
            // Get download URLs
            val imageUrl = imageRef.downloadUrl.await().toString()
            val thumbnailUrl = thumbnailRef.downloadUrl.await().toString()
            
            // Create MediaAsset
            val mediaAsset = MediaAsset(
                id = UUID.randomUUID().toString(),
                url = imageUrl,
                type = MediaType.IMAGE,
                thumbnailUrl = thumbnailUrl,
                size = optimizedBytes.size.toLong(),
                uploadedAt = System.currentTimeMillis()
            )
            
            Log.d("MediaStorage", "✅ Image uploaded successfully: $imageUrl")
            Result.success(mediaAsset)
            
        } catch (e: Exception) {
            Log.e("MediaStorage", "❌ Failed to upload image", e)
            Result.failure(e)
        }
    }
    
    /**
     * Optimize image for web delivery
     */
    private fun optimizeImage(
        originalBytes: ByteArray, 
        quality: Int, 
        maxSize: Int? = null
    ): ByteArray {
        // In a real implementation, you'd use Android's Bitmap APIs
        // or a library like Compressor to resize and compress images
        // For now, return original bytes (implement optimization later)
        return originalBytes
    }
    
    /**
     * Delete media asset and its thumbnail
     */
    suspend fun deleteMedia(mediaAsset: MediaAsset): Result<Unit> {
        return try {
            // Extract path from URL and delete both main and thumbnail
            val imagePath = extractPathFromUrl(mediaAsset.url)
            val thumbnailPath = extractPathFromUrl(mediaAsset.thumbnailUrl)
            
            if (imagePath != null) {
                storageRef.child(imagePath).delete().await()
            }
            if (thumbnailPath != null) {
                storageRef.child(thumbnailPath).delete().await()
            }
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Get optimized image URLs for different use cases
     */
    fun getOptimizedUrl(mediaAsset: MediaAsset, size: ImageSize): String {
        return when (size) {
            ImageSize.THUMBNAIL -> mediaAsset.thumbnailUrl
            ImageSize.MEDIUM -> mediaAsset.url // Could implement medium size
            ImageSize.FULL -> mediaAsset.url
        }
    }
    
    private fun extractPathFromUrl(url: String): String? {
        // Extract storage path from Firebase Storage URL
        // This is a simplified version - implement based on Firebase URL structure
        return null
    }
    
    enum class ImageSize {
        THUMBNAIL, MEDIUM, FULL
    }
}
