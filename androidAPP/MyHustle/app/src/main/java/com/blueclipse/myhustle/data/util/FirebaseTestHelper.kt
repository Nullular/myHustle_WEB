package com.blueclipse.myhustle.data.util

import android.util.Log
import com.blueclipse.myhustle.data.model.CatalogItem
import com.google.firebase.firestore.FirebaseFirestore

class FirebaseTestHelper {
    
    companion object {
        fun testCatalogItemCreation() {
            Log.d("FirebaseTest", "=== Testing CatalogItem Creation ===")
            
            // Test creating a product
            val product = CatalogItem(
                id = "test_product",
                name = "Test Latte",
                imageUrl = "https://example.com/latte.png",
                description = "Test latte product",
                isProduct = true,  // Explicitly set as product
                rating = 4.5f
            )
            
            // Test creating a service
            val service = CatalogItem(
                id = "test_service",
                name = "Test Catering",
                imageUrl = "https://example.com/catering.png", 
                description = "Test catering service",
                isProduct = false,  // Explicitly set as service
                rating = 4.8f
            )
            
            Log.d("FirebaseTest", "Product: ${product.name}, isProduct: ${product.isProduct}")
            Log.d("FirebaseTest", "Service: ${service.name}, isProduct: ${service.isProduct}")
            
            // Test Firebase serialization by uploading and reading back
            testFirebaseRoundTrip(product, service)
        }
        
        private fun testFirebaseRoundTrip(product: CatalogItem, service: CatalogItem) {
            val db = FirebaseFirestore.getInstance()
            
            // Upload the test items
            Log.d("FirebaseTest", "📤 Uploading test items...")
            
            db.collection("test_items").document("product")
                .set(product)
                .addOnSuccessListener {
                    Log.d("FirebaseTest", "✅ Product uploaded successfully")
                    
                    // Read it back
                    db.collection("test_items").document("product")
                        .get()
                        .addOnSuccessListener { document ->
                            val retrievedProduct = document.toObject(CatalogItem::class.java)
                            Log.d("FirebaseTest", "📥 Retrieved product: ${retrievedProduct?.name}, isProduct: ${retrievedProduct?.isProduct}")
                        }
                        .addOnFailureListener { e ->
                            Log.e("FirebaseTest", "❌ Failed to retrieve product", e)
                        }
                }
                .addOnFailureListener { e ->
                    Log.e("FirebaseTest", "❌ Failed to upload product", e)
                }
            
            db.collection("test_items").document("service")
                .set(service)
                .addOnSuccessListener {
                    Log.d("FirebaseTest", "✅ Service uploaded successfully")
                    
                    // Read it back
                    db.collection("test_items").document("service")
                        .get()
                        .addOnSuccessListener { document ->
                            val retrievedService = document.toObject(CatalogItem::class.java)
                            Log.d("FirebaseTest", "📥 Retrieved service: ${retrievedService?.name}, isProduct: ${retrievedService?.isProduct}")
                        }
                        .addOnFailureListener { e ->
                            Log.e("FirebaseTest", "❌ Failed to retrieve service", e)
                        }
                }
                .addOnFailureListener { e ->
                    Log.e("FirebaseTest", "❌ Failed to upload service", e)
                }
        }
        
        fun cleanupTestData() {
            val db = FirebaseFirestore.getInstance()
            Log.d("FirebaseTest", "🧹 Cleaning up test data...")
            
            db.collection("test_items").document("product").delete()
            db.collection("test_items").document("service").delete()
        }
    }
}
