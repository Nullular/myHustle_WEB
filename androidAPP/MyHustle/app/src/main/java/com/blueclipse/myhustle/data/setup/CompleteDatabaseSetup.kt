package com.blueclipse.myhustle.data.setup

import android.util.Log
import com.blueclipse.myhustle.data.model.*
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

/**
 * Complete Database Initialization
 * Sets up all collections and sample data for your MyHustle app
 */
object CompleteDatabaseSetup {
    private val firestore = FirebaseFirestore.getInstance()
    private val auth = FirebaseAuth.getInstance()
    
    /**
     * Initialize complete database with all collections
     */
    suspend fun initializeCompleteDatabase(): Result<String> {
        return try {
            Log.d("DatabaseSetup", "🚀 Starting complete database initialization...")
            
            // Step 1: Verify Firebase connection
            testFirebaseConnection().getOrThrow()
            
            // Step 2: Get current user or create one
            val currentUser = auth.currentUser
            if (currentUser == null) {
                throw Exception("No user is currently authenticated. Please log in first.")
            }
            
            val userId = currentUser.uid
            val userEmail = currentUser.email ?: "Unknown"
            
            Log.d("DatabaseSetup", "✅ Using authenticated user: $userEmail")
            
            // Step 3: Create/update user profile
            setupUserProfile(userId, userEmail).getOrThrow()
            
            // Step 4: Create sample shops
            val shopIds = createSampleShops(userId).getOrThrow()
            
            // Step 5: Create sample products for each shop
            createSampleProducts(shopIds, userId).getOrThrow()
            
            // Step 6: Create sample services for each shop
            createSampleServices(shopIds, userId).getOrThrow()
            
            // Step 7: Create sample orders
            createSampleOrders(shopIds, userId).getOrThrow()
            
            // Step 8: Create sample bookings
            createSampleBookings(shopIds, userId).getOrThrow()
            
            // Step 9: Create sample reviews
            createSampleReviews(shopIds, userId).getOrThrow()
            
            // Step 10: Create sample notifications
            createSampleNotifications(userId).getOrThrow()
            
            // Step 11: Verify all collections
            val verification = verifyAllCollections().getOrThrow()
            
            val summary = """
                🎉 Complete Database Initialization Successful!
                
                📊 Collections Created:
                ${verification.entries.joinToString("\n") { "   • ${it.key}: ${it.value} documents" }}
                
                👤 User: $userEmail
                🏪 Shops: ${shopIds.size} created
                
                Your MyHustle database is ready for production! 🚀
            """.trimIndent()
            
            Log.d("DatabaseSetup", summary)
            Result.success(summary)
            
        } catch (e: Exception) {
            Log.e("DatabaseSetup", "❌ Database initialization failed", e)
            Result.failure(e)
        }
    }
    
    /**
     * Test Firebase connection
     */
    private suspend fun testFirebaseConnection(): Result<Unit> {
        return try {
            Log.d("DatabaseSetup", "🔥 Testing Firebase connection...")
            val testDoc = firestore.collection("_test").document("connection")
            testDoc.set(mapOf(
                "timestamp" to System.currentTimeMillis(),
                "message" to "Connection successful"
            )).await()
            
            testDoc.delete().await()
            Log.d("DatabaseSetup", "✅ Firebase connection verified")
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Setup user profile
     */
    private suspend fun setupUserProfile(userId: String, email: String): Result<Unit> {
        return try {
            Log.d("DatabaseSetup", "👤 Setting up user profile...")
            
            val user = User(
                id = userId,
                email = email,
                displayName = email.split("@")[0],
                userType = UserType.BUSINESS_OWNER,
                verified = true,  // Fixed field name
                active = true,    // Fixed field name
                createdAt = System.currentTimeMillis(),
                lastLoginAt = System.currentTimeMillis()
            )
            
            firestore.collection("users").document(userId).set(user).await()
            Log.d("DatabaseSetup", "✅ User profile created")
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Create sample shops
     */
    private suspend fun createSampleShops(ownerId: String): Result<List<String>> {
        return try {
            Log.d("DatabaseSetup", "🏪 Creating sample shops...")
            
            val shops = listOf(
                Shop(
                    name = "Coffee Corner",
                    description = "Premium coffee and artisanal beverages",
                    ownerId = ownerId,
                    category = "Food & Beverage",
                    location = "Downtown",
                    address = "123 Main St, City, State 12345",
                    phone = "(555) 123-4567",
                    email = "info@coffeecorner.com",
                    imageUrl = "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
                    rating = 4.5,
                    totalReviews = 127,
                    isVerified = true,
                    isActive = true,
                    operatingHours = mapOf(
                        "Monday" to "7:00 AM - 8:00 PM",
                        "Tuesday" to "7:00 AM - 8:00 PM",
                        "Wednesday" to "7:00 AM - 8:00 PM",
                        "Thursday" to "7:00 AM - 8:00 PM",
                        "Friday" to "7:00 AM - 9:00 PM",
                        "Saturday" to "8:00 AM - 9:00 PM",
                        "Sunday" to "8:00 AM - 6:00 PM"
                    ),
                    tags = listOf("coffee", "espresso", "pastries", "wifi"),
                    priceRange = "$$"
                ),
                Shop(
                    name = "Tech Repairs Plus",
                    description = "Professional device repair and tech services",
                    ownerId = ownerId,
                    category = "Technology",
                    location = "Tech District",
                    address = "456 Tech Ave, City, State 12345",
                    phone = "(555) 987-6543",
                    email = "support@techrepairs.com",
                    imageUrl = "https://images.unsplash.com/photo-1581092160562-40aa08e78837",
                    rating = 4.8,
                    totalReviews = 89,
                    isVerified = true,
                    isActive = true,
                    operatingHours = mapOf(
                        "Monday" to "9:00 AM - 6:00 PM",
                        "Tuesday" to "9:00 AM - 6:00 PM",
                        "Wednesday" to "9:00 AM - 6:00 PM",
                        "Thursday" to "9:00 AM - 6:00 PM",
                        "Friday" to "9:00 AM - 6:00 PM",
                        "Saturday" to "10:00 AM - 4:00 PM",
                        "Sunday" to "Closed"
                    ),
                    tags = listOf("repair", "smartphone", "laptop", "warranty"),
                    priceRange = "$$$"
                ),
                Shop(
                    name = "Artisan Soaps & Co",
                    description = "Handcrafted natural soaps and skincare products",
                    ownerId = ownerId,
                    category = "Beauty & Personal Care",
                    location = "Arts Quarter",
                    address = "789 Craft Lane, City, State 12345",
                    phone = "(555) 456-7890",
                    email = "hello@artisansoaps.com",
                    imageUrl = "https://images.unsplash.com/photo-1556228578-dd339b4d0b70",
                    rating = 4.7,
                    totalReviews = 156,
                    isVerified = true,
                    isActive = true,
                    operatingHours = mapOf(
                        "Monday" to "10:00 AM - 7:00 PM",
                        "Tuesday" to "10:00 AM - 7:00 PM",
                        "Wednesday" to "10:00 AM - 7:00 PM",
                        "Thursday" to "10:00 AM - 7:00 PM",
                        "Friday" to "10:00 AM - 8:00 PM",
                        "Saturday" to "9:00 AM - 8:00 PM",
                        "Sunday" to "11:00 AM - 6:00 PM"
                    ),
                    tags = listOf("natural", "handmade", "organic", "skincare"),
                    priceRange = "$$"
                )
            )
            
            val shopIds = mutableListOf<String>()
            
            for (shop in shops) {
                val docRef = firestore.collection("shops").add(shop).await()
                docRef.update("id", docRef.id).await()
                shopIds.add(docRef.id)
                Log.d("DatabaseSetup", "   ✅ Created shop: ${shop.name}")
            }
            
            Log.d("DatabaseSetup", "✅ ${shopIds.size} shops created")
            Result.success(shopIds)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Create sample products
     */
    private suspend fun createSampleProducts(shopIds: List<String>, ownerId: String): Result<Unit> {
        return try {
            Log.d("DatabaseSetup", "📦 Creating sample products...")
            
            val productsData = mapOf(
                shopIds[0] to listOf( // Coffee Corner
                    Product(
                        shopId = shopIds[0],
                        ownerId = ownerId,
                        name = "Premium Coffee Beans - Dark Roast",
                        description = "Rich, full-bodied dark roast coffee beans",
                        price = 15.99,
                        category = "Coffee",
                        inStock = true,
                        stockQuantity = 50,
                        rating = 4.6f,
                        totalReviews = 23,
                        isActive = true,
                        primaryImageUrl = "https://images.unsplash.com/photo-1559056199-641a0ac8b55e"
                    ),
                    Product(
                        shopId = shopIds[0],
                        ownerId = ownerId,
                        name = "Artisan Pastries Box",
                        description = "Assorted fresh pastries made daily",
                        price = 12.50,
                        category = "Pastries",
                        inStock = true,
                        stockQuantity = 20,
                        rating = 4.8f,
                        totalReviews = 15,
                        isActive = true,
                        primaryImageUrl = "https://images.unsplash.com/photo-1509440159596-0249088772ff"
                    )
                ),
                shopIds[2] to listOf( // Artisan Soaps
                    Product(
                        shopId = shopIds[2],
                        ownerId = ownerId,
                        name = "Lavender Chamomile Soap",
                        description = "Relaxing natural soap with lavender and chamomile",
                        price = 8.99,
                        category = "Soap",
                        inStock = true,
                        stockQuantity = 100,
                        rating = 4.9f,
                        totalReviews = 34,
                        isActive = true,
                        primaryImageUrl = "https://images.unsplash.com/photo-1556228578-8c89e6adf883"
                    ),
                    Product(
                        shopId = shopIds[2],
                        ownerId = ownerId,
                        name = "Organic Shampoo Bar",
                        description = "Zero-waste shampoo bar for all hair types",
                        price = 12.99,
                        category = "Hair Care",
                        inStock = true,
                        stockQuantity = 75,
                        rating = 4.7f,
                        totalReviews = 28,
                        isActive = true,
                        primaryImageUrl = "https://images.unsplash.com/photo-1556228578-8c89e6adf883"
                    )
                )
            )
            
            var totalProducts = 0
            for ((shopId, products) in productsData) {
                for (product in products) {
                    val docRef = firestore.collection("products").add(product).await()
                    docRef.update("id", docRef.id).await()
                    totalProducts++
                }
            }
            
            Log.d("DatabaseSetup", "✅ $totalProducts products created")
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Create sample services
     */
    private suspend fun createSampleServices(shopIds: List<String>, ownerId: String): Result<Unit> {
        return try {
            Log.d("DatabaseSetup", "🛎️ Creating sample services...")
            
            val servicesData = mapOf(
                shopIds[0] to listOf( // Coffee Corner
                    Service(
                        shopId = shopIds[0],
                        ownerId = ownerId,
                        name = "Coffee Catering Service",
                        description = "Professional coffee catering for events",
                        basePrice = 250.0,
                        category = "Catering",
                        estimatedDuration = 240, // 4 hours
                        isBookable = true,
                        rating = 4.7f,
                        totalReviews = 12,
                        isActive = true,
                        primaryImageUrl = "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb"
                    )
                ),
                shopIds[1] to listOf( // Tech Repairs
                    Service(
                        shopId = shopIds[1],
                        ownerId = ownerId,
                        name = "Smartphone Screen Repair",
                        description = "Professional screen replacement for all phone models",
                        basePrice = 75.0,
                        category = "Repair",
                        estimatedDuration = 60,
                        isBookable = true,
                        rating = 4.9f,
                        totalReviews = 45,
                        isActive = true,
                        primaryImageUrl = "https://images.unsplash.com/photo-1581092160562-40aa08e78837"
                    ),
                    Service(
                        shopId = shopIds[1],
                        ownerId = ownerId,
                        name = "Laptop Diagnostic & Repair",
                        description = "Complete laptop diagnosis and repair service",
                        basePrice = 120.0,
                        category = "Repair",
                        estimatedDuration = 180,
                        isBookable = true,
                        rating = 4.8f,
                        totalReviews = 31,
                        isActive = true,
                        primaryImageUrl = "https://images.unsplash.com/photo-1581092160562-40aa08e78837"
                    )
                ),
                shopIds[2] to listOf( // Artisan Soaps
                    Service(
                        shopId = shopIds[2],
                        ownerId = ownerId,
                        name = "Custom Soap Making Workshop",
                        description = "Learn to make your own natural soaps",
                        basePrice = 85.0,
                        category = "Workshop",
                        estimatedDuration = 180,
                        isBookable = true,
                        rating = 4.9f,
                        totalReviews = 18,
                        isActive = true,
                        primaryImageUrl = "https://images.unsplash.com/photo-1556228578-dd339b4d0b70"
                    )
                )
            )
            
            var totalServices = 0
            for ((shopId, services) in servicesData) {
                for (service in services) {
                    val docRef = firestore.collection("services").add(service).await()
                    docRef.update("id", docRef.id).await()
                    totalServices++
                }
            }
            
            Log.d("DatabaseSetup", "✅ $totalServices services created")
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Create sample orders (for demonstration)
     */
    private suspend fun createSampleOrders(shopIds: List<String>, ownerId: String): Result<Unit> {
        return try {
            Log.d("DatabaseSetup", "🛒 Creating sample orders...")
            
            // Create a few sample orders
            val sampleOrder = Order(
                orderNumber = "ORD-001",
                customerId = ownerId, // Using owner as customer for demo
                shopId = shopIds[0],
                ownerId = ownerId,
                items = listOf(
                    OrderItem(
                        productId = "sample-product-1",
                        name = "Premium Coffee Beans",
                        price = 15.99,
                        quantity = 2
                    )
                ),
                subtotal = 31.98,
                total = 31.98,
                status = OrderStatus.DELIVERED,
                paymentStatus = PaymentStatus.PAID
            )
            
            val docRef = firestore.collection("orders").add(sampleOrder).await()
            docRef.update("id", docRef.id).await()
            
            Log.d("DatabaseSetup", "✅ Sample orders created")
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Create sample bookings
     */
    private suspend fun createSampleBookings(shopIds: List<String>, ownerId: String): Result<Unit> {
        return try {
            Log.d("DatabaseSetup", "📅 Creating sample bookings...")
            
            val sampleBooking = Booking(
                customerId = ownerId, // Using owner as customer for demo
                shopId = shopIds[1],
                shopOwnerId = ownerId,
                serviceId = "sample-service-1",
                serviceName = "Smartphone Screen Repair",
                shopName = "Tech Repairs Plus",
                customerName = "Demo Customer",
                customerEmail = auth.currentUser?.email ?: "",
                requestedDate = "2024-12-20",
                requestedTime = "10:00",
                status = BookingStatus.COMPLETED
            )
            
            val docRef = firestore.collection("bookings").add(sampleBooking).await()
            docRef.update("id", docRef.id).await()
            
            Log.d("DatabaseSetup", "✅ Sample bookings created")
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Create sample reviews
     */
    private suspend fun createSampleReviews(shopIds: List<String>, ownerId: String): Result<Unit> {
        return try {
            Log.d("DatabaseSetup", "⭐ Creating sample reviews...")
            
            val sampleReview = Review(
                customerId = ownerId, // Using owner as customer for demo
                shopId = shopIds[0],
                targetType = ReviewTargetType.SHOP,
                targetId = shopIds[0],
                targetName = "Coffee Corner",
                rating = 5.0f,
                title = "Excellent coffee!",
                content = "Great quality coffee and friendly service. Highly recommended!",
                verifiedPurchase = true,
                visible = true
            )
            
            val docRef = firestore.collection("reviews").add(sampleReview).await()
            docRef.update("id", docRef.id).await()
            
            Log.d("DatabaseSetup", "✅ Sample reviews created")
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Create sample notifications
     */
    private suspend fun createSampleNotifications(userId: String): Result<Unit> {
        return try {
            Log.d("DatabaseSetup", "🔔 Creating sample notifications...")
            
            val welcomeNotification = Notification(
                userId = userId,
                type = NotificationType.SYSTEM,
                title = "Welcome to MyHustle!",
                message = "Your marketplace is ready. Start exploring shops and services!",
                priority = NotificationPriority.NORMAL,
                isRead = false
            )
            
            val docRef = firestore.collection("notifications").add(welcomeNotification).await()
            docRef.update("id", docRef.id).await()
            
            Log.d("DatabaseSetup", "✅ Sample notifications created")
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Verify all collections exist and have data
     */
    private suspend fun verifyAllCollections(): Result<Map<String, Int>> {
        return try {
            Log.d("DatabaseSetup", "🔍 Verifying all collections...")
            
            val collections = listOf(
                "users", "shops", "products", "services", 
                "orders", "bookings", "reviews", "notifications"
            )
            
            val verification = mutableMapOf<String, Int>()
            
            for (collection in collections) {
                val snapshot = firestore.collection(collection).get().await()
                verification[collection] = snapshot.size()
                Log.d("DatabaseSetup", "   ✅ $collection: ${snapshot.size()} documents")
            }
            
            Result.success(verification)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Clear all data (use with caution!)
     */
    suspend fun clearAllData(): Result<Unit> {
        return try {
            Log.d("DatabaseSetup", "🧹 Clearing all data...")
            
            val collections = listOf(
                "users", "shops", "products", "services", 
                "orders", "bookings", "reviews", "notifications",
                "conversations", "messages", "favorites", "analytics"
            )
            
            for (collection in collections) {
                val snapshot = firestore.collection(collection).get().await()
                for (document in snapshot.documents) {
                    document.reference.delete().await()
                }
                Log.d("DatabaseSetup", "   🗑️ Cleared $collection")
            }
            
            Log.d("DatabaseSetup", "✅ All data cleared")
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
