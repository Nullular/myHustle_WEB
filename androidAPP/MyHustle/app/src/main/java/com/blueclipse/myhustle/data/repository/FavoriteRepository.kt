package com.blueclipse.myhustle.data.repository

import com.blueclipse.myhustle.data.model.Favorite
import com.blueclipse.myhustle.data.model.FavoriteTargetType
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.tasks.await

/**
 * Repository for managing favorite data in Firebase
 */
class FavoriteRepository private constructor() {
    private val firestore = FirebaseFirestore.getInstance()
    private val favoritesCollection = firestore.collection("favorites")
    private val auth = FirebaseAuth.getInstance()
    
    private val _favorites = MutableStateFlow<List<Favorite>>(emptyList())
    val favorites: StateFlow<List<Favorite>> = _favorites.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    init {
        // Listen for auth changes and clear data on sign out
        auth.addAuthStateListener { firebaseAuth ->
            val user = firebaseAuth.currentUser
            android.util.Log.d("FavoriteRepository", "Auth state changed: ${user?.email ?: "signed out"}")
            
            if (user == null) {
                // User signed out - clear all cached favorites for security
                android.util.Log.d("FavoriteRepository", "🚪 User signed out, clearing favorite data")
                clearData()
            }
        }
    }
    
    /**
     * Clear all cached data (called on sign out)
     */
    private fun clearData() {
        _favorites.value = emptyList()
        _isLoading.value = false
    }
    
    companion object {
        @Volatile
        private var INSTANCE: FavoriteRepository? = null
        
        val instance: FavoriteRepository
            get() = INSTANCE ?: synchronized(this) {
                INSTANCE ?: FavoriteRepository().also { INSTANCE = it }
            }
    }
    
    /**
     * Add item to favorites
     */
    suspend fun addToFavorites(favorite: Favorite): Result<String> {
        return try {
            _isLoading.value = true
            
            // Check if already favorited
            val existing = favoritesCollection
                .whereEqualTo("userId", favorite.userId)
                .whereEqualTo("targetType", favorite.targetType)
                .whereEqualTo("targetId", favorite.targetId)
                .get()
                .await()
            
            if (existing.documents.isNotEmpty()) {
                return Result.failure(Exception("Item already in favorites"))
            }
            
            val documentRef = favoritesCollection.add(favorite).await()
            val favoriteId = documentRef.id
            
            // Update the favorite with its ID
            documentRef.update("id", favoriteId).await()
            
            Result.success(favoriteId)
        } catch (e: Exception) {
            Result.failure(e)
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * Remove item from favorites
     */
    suspend fun removeFromFavorites(
        userId: String,
        targetType: FavoriteTargetType,
        targetId: String
    ): Result<Unit> {
        return try {
            _isLoading.value = true
            
            val snapshot = favoritesCollection
                .whereEqualTo("userId", userId)
                .whereEqualTo("targetType", targetType)
                .whereEqualTo("targetId", targetId)
                .get()
                .await()
            
            snapshot.documents.forEach { document ->
                document.reference.delete().await()
            }
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * Get all favorites for a user
     */
    suspend fun getFavoritesForUser(userId: String): Result<List<Favorite>> {
        return try {
            _isLoading.value = true
            val snapshot = favoritesCollection
                .whereEqualTo("userId", userId)
                .orderBy("createdAt", Query.Direction.DESCENDING)
                .get()
                .await()
            
            val favorites = snapshot.documents.mapNotNull { document ->
                try {
                    document.toObject(Favorite::class.java)?.copy(id = document.id)
                } catch (e: Exception) {
                    null
                }
            }
            
            _favorites.value = favorites
            Result.success(favorites)
        } catch (e: Exception) {
            Result.failure(e)
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * Get favorites by type for a user
     */
    suspend fun getFavoritesByType(
        userId: String,
        targetType: FavoriteTargetType
    ): Result<List<Favorite>> {
        return try {
            val snapshot = favoritesCollection
                .whereEqualTo("userId", userId)
                .whereEqualTo("targetType", targetType)
                .orderBy("createdAt", Query.Direction.DESCENDING)
                .get()
                .await()
            
            val favorites = snapshot.documents.mapNotNull { document ->
                try {
                    document.toObject(Favorite::class.java)?.copy(id = document.id)
                } catch (e: Exception) {
                    null
                }
            }
            
            Result.success(favorites)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Check if item is favorited by user
     */
    suspend fun isFavorited(
        userId: String,
        targetType: FavoriteTargetType,
        targetId: String
    ): Result<Boolean> {
        return try {
            val snapshot = favoritesCollection
                .whereEqualTo("userId", userId)
                .whereEqualTo("targetType", targetType)
                .whereEqualTo("targetId", targetId)
                .get()
                .await()
            
            Result.success(snapshot.documents.isNotEmpty())
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Toggle favorite status
     */
    suspend fun toggleFavorite(
        userId: String,
        targetType: FavoriteTargetType,
        targetId: String,
        targetName: String,
        targetImageUrl: String,
        shopId: String = "",
        shopName: String = ""
    ): Result<Boolean> {
        return try {
            val isFavoritedResult = isFavorited(userId, targetType, targetId)
            if (isFavoritedResult.isFailure) {
                return Result.failure(isFavoritedResult.exceptionOrNull()!!)
            }
            
            val isFavorited = isFavoritedResult.getOrNull() ?: false
            
            if (isFavorited) {
                removeFromFavorites(userId, targetType, targetId)
                Result.success(false)
            } else {
                val favorite = Favorite(
                    userId = userId,
                    targetType = targetType,
                    targetId = targetId,
                    targetName = targetName,
                    targetImageUrl = targetImageUrl,
                    shopId = shopId,
                    shopName = shopName
                )
                addToFavorites(favorite)
                Result.success(true)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Update favorite notes
     */
    suspend fun updateFavoriteNotes(favoriteId: String, notes: String): Result<Unit> {
        return try {
            val updateData = mapOf(
                "notes" to notes
            )
            
            favoritesCollection.document(favoriteId).update(updateData).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
