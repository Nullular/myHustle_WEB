package com.blueclipse.myhustle.data.setup

import android.util.Log
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

/**
 * Manual Database Setup
 * Use this to set up your database step by step
 */
object ManualDatabaseSetup {
    
    private val firestore = FirebaseFirestore.getInstance()
    private val auth = FirebaseAuth.getInstance()
    
    /**
     * Step 1: Test Firebase connection
     */
    suspend fun testFirebaseConnection(): Result<String> {
        return try {
            Log.d("ManualSetup", "🔥 Testing Firebase connection...")
            
            val testDoc = firestore.collection("test").document("connection")
            testDoc.set(mapOf(
                "timestamp" to System.currentTimeMillis(),
                "message" to "Firebase connection successful!"
            )).await()
            
            val result = testDoc.get().await()
            val message = result.getString("message") ?: "No message"
            
            // Clean up test document
            testDoc.delete().await()
            
            Log.d("ManualSetup", "✅ Firebase connection successful")
            Result.success(message)
        } catch (e: Exception) {
            Log.e("ManualSetup", "❌ Firebase connection failed", e)
            Result.failure(e)
        }
    }
    
    /**
     * Step 2: Create your first user account
     */
    suspend fun createFirstUser(email: String, password: String): Result<String> {
        return try {
            Log.d("ManualSetup", "👤 Creating first user account...")
            
            val authResult = auth.createUserWithEmailAndPassword(email, password).await()
            val user = authResult.user
            
            if (user != null) {
                // Create user profile in Firestore
                val userProfile = mapOf(
                    "id" to user.uid,
                    "email" to email,
                    "displayName" to "Business Owner",
                    "userType" to "BUSINESS_OWNER",
                    "createdAt" to System.currentTimeMillis(),
                    "isVerified" to true
                )
                
                firestore.collection("users").document(user.uid).set(userProfile).await()
                
                Log.d("ManualSetup", "✅ User created: ${user.email}")
                Result.success(user.uid)
            } else {
                Result.failure(Exception("User creation failed"))
            }
        } catch (e: Exception) {
            Log.e("ManualSetup", "❌ User creation failed", e)
            Result.failure(e)
        }
    }
    
    /**
     * Step 3: Create your first shop
     */
    suspend fun createFirstShop(ownerId: String): Result<String> {
        return try {
            Log.d("ManualSetup", "🏪 Creating first shop...")
            
            val shop = mapOf(
                "ownerId" to ownerId,
                "name" to "My First Shop",
                "description" to "Welcome to my business on MyHustle!",
                "category" to "General",
                "rating" to 5.0f,
                "totalReviews" to 1,
                "isActive" to true,
                "isVerified" to true,
                "isPremium" to false,
                "responseTime" to "Usually responds within 1 hour",
                "createdAt" to System.currentTimeMillis(),
                "address" to mapOf(
                    "street" to "123 Business Street",
                    "city" to "Your City",
                    "state" to "Your State",
                    "zipCode" to "12345",
                    "country" to "USA"
                ),
                "availability" to mapOf(
                    "monday" to mapOf("open" to "09:00", "close" to "17:00", "closed" to false),
                    "tuesday" to mapOf("open" to "09:00", "close" to "17:00", "closed" to false),
                    "wednesday" to mapOf("open" to "09:00", "close" to "17:00", "closed" to false),
                    "thursday" to mapOf("open" to "09:00", "close" to "17:00", "closed" to false),
                    "friday" to mapOf("open" to "09:00", "close" to "17:00", "closed" to false),
                    "saturday" to mapOf("open" to "10:00", "close" to "16:00", "closed" to false),
                    "sunday" to mapOf("closed" to true)
                )
            )
            
            val docRef = firestore.collection("shops").add(shop).await()
            
            Log.d("ManualSetup", "✅ Shop created with ID: ${docRef.id}")
            Result.success(docRef.id)
        } catch (e: Exception) {
            Log.e("ManualSetup", "❌ Shop creation failed", e)
            Result.failure(e)
        }
    }
    
    /**
     * Step 4: Create sample products
     */
    suspend fun createSampleProducts(shopId: String, ownerId: String): Result<List<String>> {
        return try {
            Log.d("ManualSetup", "📦 Creating sample products...")
            
            val products = listOf(
                mapOf(
                    "shopId" to shopId,
                    "ownerId" to ownerId,
                    "name" to "Sample Product 1",
                    "description" to "This is your first product on MyHustle",
                    "price" to 29.99,
                    "currency" to "USD",
                    "category" to "General",
                    "inStock" to true,
                    "stockQuantity" to 10,
                    "rating" to 4.5f,
                    "totalReviews" to 5,
                    "isActive" to true,
                    "isFeatured" to true,
                    "tags" to listOf("new", "popular", "sample"),
                    "createdAt" to System.currentTimeMillis()
                ),
                mapOf(
                    "shopId" to shopId,
                    "ownerId" to ownerId,
                    "name" to "Sample Product 2",
                    "description" to "Another great product for your customers",
                    "price" to 19.99,
                    "currency" to "USD",
                    "category" to "General",
                    "inStock" to true,
                    "stockQuantity" to 15,
                    "rating" to 4.2f,
                    "totalReviews" to 3,
                    "isActive" to true,
                    "isFeatured" to false,
                    "tags" to listOf("affordable", "quality", "sample"),
                    "createdAt" to System.currentTimeMillis()
                )
            )
            
            val productIds = mutableListOf<String>()
            for (product in products) {
                val docRef = firestore.collection("products").add(product).await()
                productIds.add(docRef.id)
                Log.d("ManualSetup", "✅ Product created: ${product["name"]}")
            }
            
            Result.success(productIds)
        } catch (e: Exception) {
            Log.e("ManualSetup", "❌ Product creation failed", e)
            Result.failure(e)
        }
    }
    
    /**
     * Step 5: Create sample services
     */
    suspend fun createSampleServices(shopId: String, ownerId: String): Result<List<String>> {
        return try {
            Log.d("ManualSetup", "🛠️ Creating sample services...")
            
            val services = listOf(
                mapOf(
                    "shopId" to shopId,
                    "ownerId" to ownerId,
                    "name" to "Consultation Service",
                    "description" to "Professional consultation for your needs",
                    "basePrice" to 50.0,
                    "currency" to "USD",
                    "category" to "Consultation",
                    "estimatedDuration" to 60,
                    "isBookable" to true,
                    "rating" to 4.8f,
                    "totalReviews" to 8,
                    "isActive" to true,
                    "isFeatured" to true,
                    "tags" to listOf("consultation", "professional", "expert"),
                    "createdAt" to System.currentTimeMillis()
                ),
                mapOf(
                    "shopId" to shopId,
                    "ownerId" to ownerId,
                    "name" to "Custom Service",
                    "description" to "Tailored service to meet your specific requirements",
                    "basePrice" to 75.0,
                    "currency" to "USD",
                    "category" to "Custom",
                    "estimatedDuration" to 90,
                    "isBookable" to true,
                    "rating" to 5.0f,
                    "totalReviews" to 12,
                    "isActive" to true,
                    "isFeatured" to false,
                    "tags" to listOf("custom", "personalized", "premium"),
                    "createdAt" to System.currentTimeMillis()
                )
            )
            
            val serviceIds = mutableListOf<String>()
            for (service in services) {
                val docRef = firestore.collection("services").add(service).await()
                serviceIds.add(docRef.id)
                Log.d("ManualSetup", "✅ Service created: ${service["name"]}")
            }
            
            Result.success(serviceIds)
        } catch (e: Exception) {
            Log.e("ManualSetup", "❌ Service creation failed", e)
            Result.failure(e)
        }
    }
    
    /**
     * Step 6: Verify database setup
     */
    suspend fun verifyDatabaseSetup(): Result<Map<String, Int>> {
        return try {
            Log.d("ManualSetup", "🔍 Verifying database setup...")
            
            val stats = mutableMapOf<String, Int>()
            
            // Count documents in each collection
            stats["users"] = firestore.collection("users").get().await().size()
            stats["shops"] = firestore.collection("shops").get().await().size()
            stats["products"] = firestore.collection("products").get().await().size()
            stats["services"] = firestore.collection("services").get().await().size()
            
            Log.d("ManualSetup", "📊 Database Statistics:")
            stats.forEach { (collection, count) ->
                Log.d("ManualSetup", "   $collection: $count documents")
            }
            
            Result.success(stats)
        } catch (e: Exception) {
            Log.e("ManualSetup", "❌ Database verification failed", e)
            Result.failure(e)
        }
    }
    
    /**
     * Complete setup workflow using current authenticated user
     */
    suspend fun runCompleteSetupWithCurrentUser(): Result<String> {
        return try {
            Log.d("ManualSetup", "🚀 Running complete database setup with current user...")
            
            // Step 1: Test connection
            testFirebaseConnection().getOrThrow()
            
            // Step 2: Get current user
            val currentUser = auth.currentUser
            if (currentUser == null) {
                throw Exception("No user is currently authenticated. Please log in first.")
            }
            
            val userId = currentUser.uid
            val userEmail = currentUser.email ?: "Unknown"
            Log.d("ManualSetup", "✅ Using current user: $userEmail (ID: $userId)")
            
            // Step 3: Create/update user profile in Firestore
            val userProfile = mapOf(
                "email" to userEmail,
                "displayName" to (currentUser.displayName ?: userEmail.split("@")[0]),
                "userType" to "BUSINESS_OWNER",
                "createdAt" to System.currentTimeMillis(),
                "isVerified" to currentUser.isEmailVerified,
                "lastLoginAt" to System.currentTimeMillis()
            )
            firestore.collection("users").document(userId).set(userProfile).await()
            Log.d("ManualSetup", "✅ User profile updated in Firestore")
            
            // Step 4: Clear existing shops and create fresh ones with proper ownership
            Log.d("ManualSetup", "🧹 Clearing existing sample data...")
            val result = com.blueclipse.myhustle.data.util.FirebaseDataCleaner.clearAndReloadData(userId)
            result.getOrThrow()
            
            // Step 5: Verify setup
            val stats = verifyDatabaseSetup().getOrThrow()
            
            val summary = "🎉 Database setup completed successfully!\n" +
                    "User: $userEmail\n" +
                    "User ID: $userId\n" +
                    "Sample shops created with you as owner\n" +
                    "Collections: ${stats.keys.joinToString()}"
            
            Log.d("ManualSetup", summary)
            Result.success(summary)
        } catch (e: Exception) {
            Log.e("ManualSetup", "❌ Complete setup failed", e)
            Result.failure(e)
        }
    }

    /**
     * Complete setup workflow
     */
    suspend fun runCompleteSetup(email: String, password: String): Result<String> {
        return try {
            Log.d("ManualSetup", "🚀 Running complete database setup...")
            
            // Step 1: Test connection
            testFirebaseConnection().getOrThrow()
            
            // Step 2: Create user
            val userId = createFirstUser(email, password).getOrThrow()
            
            // Step 3: Create shop
            val shopId = createFirstShop(userId).getOrThrow()
            
            // Step 4: Create products
            createSampleProducts(shopId, userId).getOrThrow()
            
            // Step 5: Create services
            createSampleServices(shopId, userId).getOrThrow()
            
            // Step 6: Verify setup
            val stats = verifyDatabaseSetup().getOrThrow()
            
            val summary = "🎉 Database setup completed successfully!\n" +
                    "User ID: $userId\n" +
                    "Shop ID: $shopId\n" +
                    "Collections created: ${stats.keys.joinToString()}"
            
            Log.d("ManualSetup", summary)
            Result.success(summary)
        } catch (e: Exception) {
            Log.e("ManualSetup", "❌ Complete setup failed", e)
            Result.failure(e)
        }
    }
}
