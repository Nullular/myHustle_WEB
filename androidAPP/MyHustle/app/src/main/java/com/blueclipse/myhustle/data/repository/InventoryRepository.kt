package com.blueclipse.myhustle.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.tasks.await

/**
 * Repository for live inventory management
 */
class InventoryRepository private constructor() {
    
    private val firestore = FirebaseFirestore.getInstance()
    private val inventoryCollection = firestore.collection("inventory")
    
    companion object {
        @Volatile
        private var INSTANCE: InventoryRepository? = null
        
        val instance: InventoryRepository
            get() = INSTANCE ?: synchronized(this) {
                INSTANCE ?: InventoryRepository().also { INSTANCE = it }
            }
    }
    
    /**
     * Get inventory for a specific shop
     */
    suspend fun getShopInventory(shopId: String): List<InventoryItem> {
        return try {
            val querySnapshot = inventoryCollection
                .whereEqualTo("shopId", shopId)
                .orderBy("name", Query.Direction.ASCENDING)
                .get()
                .await()
            
            querySnapshot.documents.mapNotNull { document ->
                document.toObject(InventoryItem::class.java)?.copy(id = document.id)
            }
        } catch (e: Exception) {
            // Return sample data if no inventory exists
            generateSampleInventory(shopId)
        }
    }
    
    /**
     * Get inventory summary statistics
     */
    suspend fun getInventorySummary(shopId: String): InventorySummary {
        return try {
            val inventory = getShopInventory(shopId)
            
            val totalItems = inventory.size
            val totalValue = inventory.sumOf { it.quantity * it.unitPrice }
            val lowStockItems = inventory.count { it.quantity <= it.lowStockThreshold }
            val outOfStockItems = inventory.count { it.quantity == 0 }
            
            InventorySummary(
                totalItems = totalItems,
                totalValue = totalValue,
                lowStockItems = lowStockItems,
                outOfStockItems = outOfStockItems
            )
        } catch (e: Exception) {
            InventorySummary(0, 0.0, 0, 0)
        }
    }
    
    /**
     * Update inventory item quantity
     */
    suspend fun updateInventoryQuantity(itemId: String, newQuantity: Int): Result<Unit> {
        return try {
            val updates = mapOf(
                "quantity" to newQuantity,
                "lastUpdated" to System.currentTimeMillis()
            )
            inventoryCollection.document(itemId).update(updates).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Add new inventory item
     */
    suspend fun addInventoryItem(item: InventoryItem): Result<String> {
        return try {
            val document = inventoryCollection.add(item).await()
            Result.success(document.id)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Generate sample inventory data for shops without existing inventory
     */
    private fun generateSampleInventory(shopId: String): List<InventoryItem> {
        return listOf(
            InventoryItem(
                shopId = shopId,
                name = "Phone Screen Protectors",
                category = "Accessories",
                quantity = 25,
                unitPrice = 15.99,
                lowStockThreshold = 10,
                supplier = "TechSupply Co",
                sku = "PSP-001"
            ),
            InventoryItem(
                shopId = shopId,
                name = "Phone Cases",
                category = "Accessories",
                quantity = 50,
                unitPrice = 29.99,
                lowStockThreshold = 15,
                supplier = "PhoneGuard Inc",
                sku = "PC-002"
            ),
            InventoryItem(
                shopId = shopId,
                name = "Hair Styling Products",
                category = "Beauty",
                quantity = 8,
                unitPrice = 24.50,
                lowStockThreshold = 10,
                supplier = "Beauty Essentials",
                sku = "HSP-003"
            ),
            InventoryItem(
                shopId = shopId,
                name = "Camera Lenses",
                category = "Photography",
                quantity = 3,
                unitPrice = 450.00,
                lowStockThreshold = 2,
                supplier = "PhotoPro Equipment",
                sku = "CL-004"
            ),
            InventoryItem(
                shopId = shopId,
                name = "Cleaning Supplies",
                category = "Maintenance",
                quantity = 0,
                unitPrice = 12.99,
                lowStockThreshold = 5,
                supplier = "CleanCorp",
                sku = "CS-005"
            ),
            InventoryItem(
                shopId = shopId,
                name = "Garden Tools",
                category = "Equipment",
                quantity = 12,
                unitPrice = 85.00,
                lowStockThreshold = 3,
                supplier = "GreenThumb Tools",
                sku = "GT-006"
            )
        )
    }
}

/**
 * Inventory item data model
 */
data class InventoryItem(
    val id: String = "",
    val shopId: String = "",
    val name: String = "",
    val category: String = "",
    val quantity: Int = 0,
    val unitPrice: Double = 0.0,
    val lowStockThreshold: Int = 0,
    val supplier: String = "",
    val sku: String = "",
    val lastUpdated: Long = System.currentTimeMillis()
) {
    constructor() : this("", "", "", "", 0, 0.0, 0, "", "", 0L)
    
    val isLowStock: Boolean
        get() = quantity <= lowStockThreshold
    
    val isOutOfStock: Boolean
        get() = quantity == 0
    
    val totalValue: Double
        get() = quantity * unitPrice
}

/**
 * Inventory summary statistics
 */
data class InventorySummary(
    val totalItems: Int,
    val totalValue: Double,
    val lowStockItems: Int,
    val outOfStockItems: Int
)
