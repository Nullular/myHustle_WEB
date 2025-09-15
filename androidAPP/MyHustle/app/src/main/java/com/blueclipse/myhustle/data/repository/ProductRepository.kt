package com.blueclipse.myhustle.data.repository

import com.blueclipse.myhustle.data.model.Product
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.tasks.await

/**
 * Repository for managing product data in Firebase
 */
class ProductRepository private constructor() {
    private val firestore = FirebaseFirestore.getInstance()
    private val productsCollection = firestore.collection("products")
    
    private val _products = MutableStateFlow<List<Product>>(emptyList())
    val products: StateFlow<List<Product>> = _products.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    companion object {
        @Volatile
        private var INSTANCE: ProductRepository? = null
        
        val instance: ProductRepository
            get() = INSTANCE ?: synchronized(this) {
                INSTANCE ?: ProductRepository().also { INSTANCE = it }
            }
    }
    
    /**
     * Create a new product
     */
    suspend fun createProduct(product: Product): Result<String> {
        return try {
            _isLoading.value = true
            
            val documentRef = productsCollection.add(product).await()
            val productId = documentRef.id
            
            // Update the product with its ID
            documentRef.update("id", productId).await()
            
            Result.success(productId)
        } catch (e: Exception) {
            println("Error creating product: ${e.message}")
            e.printStackTrace()
            Result.failure(e)
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * Get products for a specific shop
     */
    suspend fun getProductsForShop(shopId: String): Result<List<Product>> {
        return try {
            _isLoading.value = true
            val snapshot = productsCollection
                .whereEqualTo("shopId", shopId)
                .get()
                .await()
            
            val products = snapshot.documents.mapNotNull { document ->
                try {
                    val product = document.toObject(Product::class.java)?.copy(id = document.id)
                    // Filter active products in code instead of query to avoid index requirement
                    if (product?.isActive == true) product else null
                } catch (e: Exception) {
                    null
                }
            }.sortedByDescending { it.createdAt } // Sort in code instead of query
            
            _products.value = products
            Result.success(products)
        } catch (e: Exception) {
            Result.failure(e)
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * Get all active products
     */
    suspend fun getAllProducts(): Result<List<Product>> {
        return try {
            _isLoading.value = true
            val snapshot = productsCollection
                .whereEqualTo("isActive", true)
                .orderBy("createdAt", Query.Direction.DESCENDING)
                .get()
                .await()
            
            val products = snapshot.documents.mapNotNull { document ->
                try {
                    document.toObject(Product::class.java)?.copy(id = document.id)
                } catch (e: Exception) {
                    null
                }
            }
            
            Result.success(products)
        } catch (e: Exception) {
            Result.failure(e)
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * Get product by ID
     */
    suspend fun getProductById(productId: String): Result<Product?> {
        return try {
            val document = productsCollection.document(productId).get().await()
            if (document.exists()) {
                val product = document.toObject(Product::class.java)?.copy(id = document.id)
                Result.success(product)
            } else {
                Result.success(null)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Update product
     */
    suspend fun updateProduct(product: Product): Result<Unit> {
        return try {
            val updateData = product.copy(updatedAt = System.currentTimeMillis())
            productsCollection.document(product.id).set(updateData).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Delete product
     */
    suspend fun deleteProduct(productId: String): Result<Unit> {
        return try {
            productsCollection.document(productId).delete().await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Update product stock
     */
    suspend fun updateStock(productId: String, newQuantity: Int): Result<Unit> {
        return try {
            val updateData = mapOf(
                "stockQuantity" to newQuantity,
                "inStock" to (newQuantity > 0),
                "updatedAt" to System.currentTimeMillis()
            )
            
            productsCollection.document(productId).update(updateData).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
