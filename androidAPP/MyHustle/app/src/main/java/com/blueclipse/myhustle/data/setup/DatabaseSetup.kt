package com.blueclipse.myhustle.data.setup

import android.util.Log
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

/**                "displayName" to "Demo Business Owner"                  mapOf(
                "shopId" to "demo_coffee_shop",
                "ownerId" to actualOwnerId,
                "name" to "Artisan Espresso Blend", Create sample products
        val sampleProducts = listOf(
            mapOf(
                "shopId" to "demo_coffee_shop",
                "ownerId" to actualOwnerId,
                "name" to "Premium Ethiopian Coffee",             "userType" to "BUSINESS_OWNER",
                "createdAt" to System.currentTimeMillis(),
                "isVerified" to true
            )
            
            firestore.collection("users").document("sample_owner_123").set(sampleUser).await()
        }
        
        // Create sample shop
        val sampleShop = mapOf(
            "id" to "demo_coffee_shop",
            "ownerId" to actualOwnerId, // Use the actual owner ID
            "name" to "Coffee Corner Demo", Setup Utility
 * Call this once to initialize your production database structure
 */
object DatabaseSetup {
    
    private val firestore = FirebaseFirestore.getInstance()
    
    /**
     * Initialize the database with collections and sample data
     */
    suspend fun initializeDatabase(ownerId: String = ""): Result<Unit> {
        return try {
            Log.d("DatabaseSetup", "🏗️ Initializing MyHustle database structure...")
            
            // Step 1: Create core collections
            createCoreCollections()
            
            // Step 2: Check if sample data already exists before uploading
            val shopsSnapshot = firestore.collection("shops").limit(1).get().await()
            if (shopsSnapshot.isEmpty) {
                Log.d("DatabaseSetup", "📊 No existing shops found, uploading sample data...")
                uploadSampleData(ownerId)
            } else {
                Log.d("DatabaseSetup", "✅ Sample data already exists, skipping upload")
            }
            
            // Step 3: Set up app configuration
            setupAppConfiguration()
            
            Log.d("DatabaseSetup", "✅ Database initialization completed successfully!")
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e("DatabaseSetup", "❌ Database initialization failed", e)
            Result.failure(e)
        }
    }
    
    /**
     * Create core collections with initial documents
     */
    private suspend fun createCoreCollections() {
        Log.d("DatabaseSetup", "📁 Creating core collections...")
        
        // Create a placeholder document in each collection
        // This ensures the collections exist in Firebase Console
        
        // Users collection
        firestore.collection("users").document("_placeholder").set(
            mapOf(
                "placeholder" to true,
                "createdAt" to System.currentTimeMillis()
            )
        ).await()
        
        // Shops collection  
        firestore.collection("shops").document("_placeholder").set(
            mapOf(
                "placeholder" to true,
                "createdAt" to System.currentTimeMillis()
            )
        ).await()
        
        // Products collection
        firestore.collection("products").document("_placeholder").set(
            mapOf(
                "placeholder" to true,
                "createdAt" to System.currentTimeMillis()
            )
        ).await()
        
        // Services collection
        firestore.collection("services").document("_placeholder").set(
            mapOf(
                "placeholder" to true,
                "createdAt" to System.currentTimeMillis()
            )
        ).await()
        
        // Orders collection
        firestore.collection("orders").document("_placeholder").set(
            mapOf(
                "placeholder" to true,
                "createdAt" to System.currentTimeMillis()
            )
        ).await()
        
        // Bookings collection
        firestore.collection("bookings").document("_placeholder").set(
            mapOf(
                "placeholder" to true,
                "createdAt" to System.currentTimeMillis()
            )
        ).await()
        
        // Conversations collection
        firestore.collection("conversations").document("_placeholder").set(
            mapOf(
                "placeholder" to true,
                "createdAt" to System.currentTimeMillis()
            )
        ).await()
        
        // Messages collection
        firestore.collection("messages").document("_placeholder").set(
            mapOf(
                "placeholder" to true,
                "createdAt" to System.currentTimeMillis()
            )
        ).await()
        
        // Reviews collection
        firestore.collection("reviews").document("_placeholder").set(
            mapOf(
                "placeholder" to true,
                "createdAt" to System.currentTimeMillis()
            )
        ).await()
        
        // Favorites collection
        firestore.collection("favorites").document("_placeholder").set(
            mapOf(
                "placeholder" to true,
                "createdAt" to System.currentTimeMillis()
            )
        ).await()
        
        // Notifications collection
        firestore.collection("notifications").document("_placeholder").set(
            mapOf(
                "placeholder" to true,
                "createdAt" to System.currentTimeMillis()
            )
        ).await()
        
        Log.d("DatabaseSetup", "✅ Core collections created")
    }
    
    /**
     * Upload sample data for demo purposes
     */
    private suspend fun uploadSampleData(ownerId: String = "") {
        Log.d("DatabaseSetup", "📊 Uploading sample data...")
        
        // Use provided ownerId or fall back to demo owner
        val actualOwnerId = ownerId.ifEmpty { "sample_owner_123" }
        
        if (ownerId.isNotEmpty()) {
            Log.d("DatabaseSetup", "👑 Using current user ($ownerId) as shop owner")
        }
        
        // Create sample business categories
        val categories = listOf(
            "Food & Beverage",
            "Beauty & Wellness", 
            "Tech Services",
            "Home Services",
            "Professional Services",
            "Retail & Shopping",
            "Health & Fitness",
            "Education & Training"
        )
        
        // Create sample user (business owner) - only if using demo owner
        if (ownerId.isEmpty()) {
            val sampleUser = mapOf(
                "id" to "sample_owner_123",
                "email" to "demo@myhustle.com",
                "displayName" to "Demo Business Owner",
                "userType" to "BUSINESS_OWNER",
                "createdAt" to System.currentTimeMillis(),
                "isVerified" to true
            )
            
            firestore.collection("users").document("sample_owner_123").set(sampleUser).await()
        }
        
        // Create sample shop
        val sampleShop = mapOf(
            "id" to "demo_coffee_shop",
            "ownerId" to actualOwnerId, // Use the actual owner ID
            "name" to "Coffee Corner Demo",
            "description" to "Best coffee in town with freshly roasted beans and artisan pastries",
            "category" to "Food & Beverage",
            "rating" to 4.5f,
            "totalReviews" to 127,
            "isActive" to true,
            "isVerified" to true,
            "isPremium" to false,
            "responseTime" to "Usually responds within 1 hour",
            "createdAt" to System.currentTimeMillis(),
            "address" to mapOf(
                "street" to "123 Main Street",
                "city" to "Demo City",
                "state" to "Demo State",
                "zipCode" to "12345",
                "country" to "USA"
            ),
            "availability" to mapOf(
                "monday" to mapOf("open" to "07:00", "close" to "19:00", "closed" to false),
                "tuesday" to mapOf("open" to "07:00", "close" to "19:00", "closed" to false),
                "wednesday" to mapOf("open" to "07:00", "close" to "19:00", "closed" to false),
                "thursday" to mapOf("open" to "07:00", "close" to "19:00", "closed" to false),
                "friday" to mapOf("open" to "07:00", "close" to "19:00", "closed" to false),
                "saturday" to mapOf("open" to "08:00", "close" to "20:00", "closed" to false),
                "sunday" to mapOf("open" to "08:00", "close" to "18:00", "closed" to false)
            )
        )
        
        firestore.collection("shops").document("demo_coffee_shop").set(sampleShop).await()
        
        // Create sample products
        val sampleProducts = listOf(
            mapOf(
                "shopId" to "demo_coffee_shop",
                "ownerId" to "sample_owner_123",
                "name" to "Premium Espresso Blend",
                "description" to "Rich, full-bodied espresso blend with notes of chocolate and caramel",
                "price" to 12.99,
                "currency" to "USD",
                "category" to "Coffee",
                "inStock" to true,
                "stockQuantity" to 50,
                "rating" to 4.7f,
                "totalReviews" to 23,
                "isActive" to true,
                "isFeatured" to true,
                "tags" to listOf("coffee", "espresso", "premium", "beans"),
                "createdAt" to System.currentTimeMillis()
            ),
            mapOf(
                "shopId" to "demo_coffee_shop",
                "ownerId" to "sample_owner_123",
                "name" to "Artisan Croissant",
                "description" to "Freshly baked buttery croissant made with French butter",
                "price" to 3.50,
                "currency" to "USD",
                "category" to "Pastry",
                "inStock" to true,
                "stockQuantity" to 25,
                "rating" to 4.4f,
                "totalReviews" to 18,
                "isActive" to true,
                "isFeatured" to false,
                "tags" to listOf("pastry", "croissant", "fresh", "french"),
                "createdAt" to System.currentTimeMillis()
            )
        )
        
        for (product in sampleProducts) {
            firestore.collection("products").add(product).await()
        }
        
        // Create sample services
        val sampleServices = listOf(
            mapOf(
                "shopId" to "demo_coffee_shop",
                "ownerId" to actualOwnerId,
                "name" to "Coffee Tasting Session",
                "description" to "Learn about different coffee varieties and brewing methods in our guided tasting session",
                "basePrice" to 25.0,
                "currency" to "USD",
                "category" to "Education",
                "estimatedDuration" to 60,
                "isBookable" to true,
                "rating" to 4.8f,
                "totalReviews" to 15,
                "isActive" to true,
                "isFeatured" to true,
                "tags" to listOf("coffee", "tasting", "education", "experience"),
                "createdAt" to System.currentTimeMillis()
            ),
            mapOf(
                "shopId" to "demo_coffee_shop",
                "ownerId" to actualOwnerId,
                "name" to "Private Barista Training",
                "description" to "One-on-one barista training session to master espresso and latte art",
                "basePrice" to 75.0,
                "currency" to "USD",
                "category" to "Training",
                "estimatedDuration" to 120,
                "isBookable" to true,
                "rating" to 5.0f,
                "totalReviews" to 8,
                "isActive" to true,
                "isFeatured" to false,
                "tags" to listOf("barista", "training", "espresso", "latte art"),
                "createdAt" to System.currentTimeMillis()
            )
        )
        
        for (service in sampleServices) {
            firestore.collection("services").add(service).await()
        }
        
        Log.d("DatabaseSetup", "✅ Sample data uploaded")
    }
    
    /**
     * Set up app configuration
     */
    private suspend fun setupAppConfiguration() {
        Log.d("DatabaseSetup", "⚙️ Setting up app configuration...")
        
        val appConfig = mapOf(
            "businessCategories" to listOf(
                "Food & Beverage",
                "Beauty & Wellness", 
                "Tech Services",
                "Home Services",
                "Professional Services",
                "Retail & Shopping",
                "Health & Fitness",
                "Education & Training"
            ),
            "productCategories" to listOf(
                "Coffee", "Pastry", "Food", "Beverage", "Merchandise", "Equipment"
            ),
            "serviceCategories" to listOf(
                "Education", "Training", "Consultation", "Repair", "Installation", "Design"
            ),
            "supportedCurrencies" to listOf("USD", "EUR", "GBP", "CAD"),
            "appVersion" to "1.0.0",
            "minSupportedVersion" to "1.0.0",
            "maintenanceMode" to false
        )
        
        firestore.collection("app_config").document("main").set(appConfig).await()
        
        Log.d("DatabaseSetup", "✅ App configuration set up")
    }
    
    /**
     * Clean up placeholder documents
     */
    suspend fun cleanupPlaceholders(): Result<Unit> {
        return try {
            Log.d("DatabaseSetup", "🧹 Cleaning up placeholder documents...")
            
            val collections = listOf(
                "users", "shops", "products", "services", "orders", 
                "bookings", "conversations", "messages", "reviews", 
                "favorites", "notifications"
            )
            
            for (collection in collections) {
                firestore.collection(collection).document("_placeholder").delete().await()
            }
            
            Log.d("DatabaseSetup", "✅ Placeholder cleanup completed")
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e("DatabaseSetup", "❌ Placeholder cleanup failed", e)
            Result.failure(e)
        }
    }
}
