package com.blueclipse.myhustle.data.repository

import com.blueclipse.myhustle.data.model.Service
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.tasks.await

/**
 * Repository for managing service data in Firebase
 */
class ServiceRepository private constructor() {
    private val firestore = FirebaseFirestore.getInstance()
    private val servicesCollection = firestore.collection("services")
    
    private val _services = MutableStateFlow<List<Service>>(emptyList())
    val services: StateFlow<List<Service>> = _services.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    companion object {
        @Volatile
        private var INSTANCE: ServiceRepository? = null
        
        val instance: ServiceRepository
            get() = INSTANCE ?: synchronized(this) {
                INSTANCE ?: ServiceRepository().also { INSTANCE = it }
            }
    }
    
    /**
     * Create a new service
     */
    suspend fun createService(service: Service): Result<String> {
        return try {
            _isLoading.value = true
            val documentRef = servicesCollection.add(service).await()
            val serviceId = documentRef.id
            
            // Update the service with its ID
            documentRef.update("id", serviceId).await()
            
            Result.success(serviceId)
        } catch (e: Exception) {
            Result.failure(e)
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * Get services for a specific shop
     */
    suspend fun getServicesForShop(shopId: String): Result<List<Service>> {
        return try {
            _isLoading.value = true
            val snapshot = servicesCollection
                .whereEqualTo("shopId", shopId)
                .whereEqualTo("isActive", true)
                .orderBy("createdAt", Query.Direction.DESCENDING)
                .get()
                .await()
            
            val services = snapshot.documents.mapNotNull { document ->
                try {
                    document.toObject(Service::class.java)?.copy(id = document.id)
                } catch (e: Exception) {
                    null
                }
            }
            
            _services.value = services
            Result.success(services)
        } catch (e: Exception) {
            Result.failure(e)
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * Get all active services
     */
    suspend fun getAllServices(): Result<List<Service>> {
        return try {
            _isLoading.value = true
            val snapshot = servicesCollection
                .whereEqualTo("isActive", true)
                .orderBy("createdAt", Query.Direction.DESCENDING)
                .get()
                .await()
            
            val services = snapshot.documents.mapNotNull { document ->
                try {
                    document.toObject(Service::class.java)?.copy(id = document.id)
                } catch (e: Exception) {
                    null
                }
            }
            
            Result.success(services)
        } catch (e: Exception) {
            Result.failure(e)
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * Get service by ID
     */
    suspend fun getServiceById(serviceId: String): Result<Service?> {
        return try {
            val document = servicesCollection.document(serviceId).get().await()
            if (document.exists()) {
                val service = document.toObject(Service::class.java)?.copy(id = document.id)
                Result.success(service)
            } else {
                Result.success(null)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Update service
     */
    suspend fun updateService(service: Service): Result<Unit> {
        return try {
            val updateData = service.copy(updatedAt = System.currentTimeMillis())
            servicesCollection.document(service.id).set(updateData).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Delete service
     */
    suspend fun deleteService(serviceId: String): Result<Unit> {
        return try {
            servicesCollection.document(serviceId).delete().await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Get services by category
     */
    suspend fun getServicesByCategory(category: String): Result<List<Service>> {
        return try {
            val snapshot = servicesCollection
                .whereEqualTo("category", category)
                .whereEqualTo("isActive", true)
                .orderBy("createdAt", Query.Direction.DESCENDING)
                .get()
                .await()
            
            val services = snapshot.documents.mapNotNull { document ->
                try {
                    document.toObject(Service::class.java)?.copy(id = document.id)
                } catch (e: Exception) {
                    null
                }
            }
            
            Result.success(services)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
