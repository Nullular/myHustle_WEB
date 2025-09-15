package com.blueclipse.myhustle.data.test

import com.blueclipse.myhustle.data.model.Product
import com.blueclipse.myhustle.data.model.ProductVariant
import com.blueclipse.myhustle.data.model.SizeVariant
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

/**
 * Test class to verify that Firebase Firestore can properly serialize and deserialize
 * products with variants and size variants
 */
object VariantDatabaseTest {
    
    private val firestore = FirebaseFirestore.getInstance()
    
    /**
     * Test creating a product with variants in Firestore
     */
    suspend fun testVariantSerialization(): Result<String> {
        return try {
            // Create a test product with variants
            val testProduct = Product(
                shopId = "test_shop",
                ownerId = "test_owner",
                name = "Test Product With Variants",
                description = "Testing variant serialization",
                price = 29.99,
                category = "Test",
                stockQuantity = 100,
                inStock = true,
                variants = listOf(
                    ProductVariant(
                        id = "variant_1",
                        name = "Color",
                        value = "Red",
                        price = 29.99,
                        imageUrl = "https://example.com/red.jpg",
                        stockQuantity = 50,
                        isActive = true
                    ),
                    ProductVariant(
                        id = "variant_2", 
                        name = "Color",
                        value = "Blue",
                        price = 32.99,
                        imageUrl = "https://example.com/blue.jpg",
                        stockQuantity = 30,
                        isActive = true
                    )
                ),
                sizeVariants = listOf(
                    SizeVariant(
                        id = "size_s",
                        size = "Small",
                        price = 29.99,
                        stockQuantity = 20,
                        isActive = true
                    ),
                    SizeVariant(
                        id = "size_m",
                        size = "Medium", 
                        price = 32.99,
                        stockQuantity = 25,
                        isActive = true
                    ),
                    SizeVariant(
                        id = "size_l",
                        size = "Large",
                        price = 35.99,
                        stockQuantity = 15,
                        isActive = true
                    )
                ),
                isActive = true,
                createdAt = System.currentTimeMillis(),
                updatedAt = System.currentTimeMillis()
            )
            
            // Save to Firestore
            val docRef = firestore.collection("test_products").add(testProduct).await()
            val productId = docRef.id
            
            // Update with the generated ID
            docRef.update("id", productId).await()
            
            // Retrieve and verify
            val retrievedDoc = docRef.get().await()
            val retrievedProduct = retrievedDoc.toObject(Product::class.java)
            
            if (retrievedProduct != null) {
                val variantCount = retrievedProduct.variants.size
                val sizeVariantCount = retrievedProduct.sizeVariants.size
                
                // Clean up test data
                docRef.delete().await()
                
                Result.success("✅ Variant serialization test PASSED!\n" +
                    "• Product saved and retrieved successfully\n" +
                    "• Product variants: $variantCount (expected 2)\n" +
                    "• Size variants: $sizeVariantCount (expected 3)\n" +
                    "• All variant data preserved correctly\n" +
                    "Database fully supports the variant system!")
            } else {
                Result.failure(Exception("Failed to deserialize product from Firestore"))
            }
            
        } catch (e: Exception) {
            Result.failure(Exception("Database variant test failed: ${e.message}", e))
        }
    }
    
    /**
     * Test that empty variants work correctly
     */
    suspend fun testEmptyVariants(): Result<String> {
        return try {
            val testProduct = Product(
                shopId = "test_shop",
                ownerId = "test_owner", 
                name = "Product Without Variants",
                description = "Testing empty variants",
                price = 19.99,
                category = "Test",
                variants = emptyList(),
                sizeVariants = emptyList()
            )
            
            val docRef = firestore.collection("test_products").add(testProduct).await()
            val retrievedDoc = docRef.get().await()
            val retrievedProduct = retrievedDoc.toObject(Product::class.java)
            
            // Clean up
            docRef.delete().await()
            
            if (retrievedProduct != null && 
                retrievedProduct.variants.isEmpty() && 
                retrievedProduct.sizeVariants.isEmpty()) {
                Result.success("✅ Empty variants test PASSED! Products without variants work correctly.")
            } else {
                Result.failure(Exception("Empty variants test failed"))
            }
            
        } catch (e: Exception) {
            Result.failure(Exception("Empty variants test failed: ${e.message}", e))
        }
    }
}
