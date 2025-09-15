package com.blueclipse.myhustle.data.repository

import com.blueclipse.myhustle.data.model.Shop
import kotlinx.coroutines.flow.StateFlow

/**
 * Main repository interface that delegates to Firebase implementation.
 * This maintains compatibility with existing code while using Firebase backend.
 */
class ShopRepository private constructor() {
    
    private val firebaseRepository = FirebaseShopRepository.instance
    
    /** Public flow of current shop list */
    val shops: StateFlow<List<Shop>> = firebaseRepository.shops
    
    /** Loading state */
    val isLoading: StateFlow<Boolean> = firebaseRepository.isLoading
    
    /** Retrieve a shop by its unique ID */
    suspend fun getShopById(id: String): Shop? = 
        firebaseRepository.getShopById(id)
    
    /** Toggle the 'favorite' status of a shop */
    suspend fun toggleFavorite(id: String): Result<Unit> = 
        firebaseRepository.toggleFavorite(id)
    
    /** Fetch all shops from Firebase */
    suspend fun fetchShops(): Result<List<Shop>> = 
        firebaseRepository.fetchShops()
    
    /** Add a new shop */
    suspend fun addShop(shop: Shop): Result<String> = 
        firebaseRepository.addShop(shop)
    
    /** Update an existing shop */
    suspend fun updateShop(shop: Shop): Result<Unit> = 
        firebaseRepository.updateShop(shop)
    
    /** Delete a shop */
    suspend fun deleteShop(id: String): Result<Unit> = 
        firebaseRepository.deleteShop(id)
    
    companion object {
        @Volatile
        private var INSTANCE: ShopRepository? = null
        
        val instance: ShopRepository
            get() = INSTANCE ?: synchronized(this) {
                INSTANCE ?: ShopRepository().also { INSTANCE = it }
            }
    }
}
