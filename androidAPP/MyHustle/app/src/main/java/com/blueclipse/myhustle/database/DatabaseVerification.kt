package com.blueclipse.myhustle.database

import android.util.Log
import com.blueclipse.myhustle.data.model.*
import com.blueclipse.myhustle.data.repository.*
import kotlinx.coroutines.delay

/**
 * Comprehensive database testing and verification utility
 * This will test all aspects of the database schema implementation
 */
class DatabaseVerification {
    private val userRepository = UserRepository.instance
    private val shopRepository = ShopRepository.instance
    private val productRepository = ProductRepository.instance
    private val serviceRepository = ServiceRepository.instance
    private val orderRepository = OrderRepository.instance
    private val reviewRepository = ReviewRepository.instance
    private val favoriteRepository = FavoriteRepository.instance
    private val notificationRepository = NotificationRepository.instance
    
    companion object {
        private const val TAG = "DatabaseVerification"
    }
    
    /**
     * Run comprehensive database verification tests
     */
    suspend fun runFullVerification(): VerificationResult {
        Log.i(TAG, "Starting comprehensive database verification...")
        
        val results = mutableListOf<TestResult>()
        
        try {
            // Test 1: User Management
            results.add(testUserManagement())
            delay(1000)
            
            // Test 2: Shop Management
            results.add(testShopManagement())
            delay(1000)
            
            // Test 3: Product Management
            results.add(testProductManagement())
            delay(1000)
            
            // Test 4: Service Management
            results.add(testServiceManagement())
            delay(1000)
            
            // Test 5: Order Management
            results.add(testOrderManagement())
            delay(1000)
            
            // Test 6: Review System
            results.add(testReviewSystem())
            delay(1000)
            
            // Test 7: Favorites System
            results.add(testFavoritesSystem())
            delay(1000)
            
            // Test 8: Notification System
            results.add(testNotificationSystem())
            delay(1000)
            
            // Test 9: Data Relationships
            results.add(testDataRelationships())
            delay(1000)
            
            // Test 10: Performance Tests
            results.add(testPerformance())
            
            val passedTests = results.count { it.passed }
            val totalTests = results.size
            
            Log.i(TAG, "Database verification completed: $passedTests/$totalTests tests passed")
            
            return VerificationResult(
                success = passedTests == totalTests,
                totalTests = totalTests,
                passedTests = passedTests,
                failedTests = totalTests - passedTests,
                testResults = results,
                summary = "Database verification completed with $passedTests/$totalTests tests passing"
            )
            
        } catch (e: Exception) {
            Log.e(TAG, "Database verification failed with exception", e)
            return VerificationResult(
                success = false,
                totalTests = results.size,
                passedTests = results.count { it.passed },
                failedTests = results.count { !it.passed } + 1,
                testResults = results + TestResult(
                    testName = "Exception Handling",
                    passed = false,
                    message = "Verification failed with exception: ${e.message}",
                    duration = 0
                ),
                summary = "Database verification failed due to unexpected error"
            )
        }
    }
    
    private suspend fun testUserManagement(): TestResult {
        val startTime = System.currentTimeMillis()
        return try {
            Log.i(TAG, "Testing user management...")
            
            // Test user creation
            val testUser = User(
                email = "test@verification.com",
                displayName = "Test User",
                userType = UserType.CUSTOMER,
                verified = true,  // Fixed field name
                createdAt = System.currentTimeMillis()
            )
            
            val createResult = userRepository.createUser(testUser)
            if (createResult.isFailure) {
                return TestResult(
                    testName = "User Management",
                    passed = false,
                    message = "Failed to create user: ${createResult.exceptionOrNull()?.message}",
                    duration = System.currentTimeMillis() - startTime
                )
            }
            
            val userId = createResult.getOrThrow()
            
            // Test user retrieval
            val getUserResult = userRepository.getUserById(userId)
            if (getUserResult.isFailure || getUserResult.getOrNull() == null) {
                return TestResult(
                    testName = "User Management",
                    passed = false,
                    message = "Failed to retrieve created user",
                    duration = System.currentTimeMillis() - startTime
                )
            }
            
            Log.i(TAG, "User management test passed")
            TestResult(
                testName = "User Management",
                passed = true,
                message = "Successfully created and retrieved user",
                duration = System.currentTimeMillis() - startTime
            )
            
        } catch (e: Exception) {
            Log.e(TAG, "User management test failed", e)
            TestResult(
                testName = "User Management",
                passed = false,
                message = "Exception: ${e.message}",
                duration = System.currentTimeMillis() - startTime
            )
        }
    }
    
    private suspend fun testShopManagement(): TestResult {
        val startTime = System.currentTimeMillis()
        return try {
            Log.i(TAG, "Testing shop management...")
            
            val testShop = Shop(
                name = "Test Shop",
                description = "A test shop for verification",
                ownerId = "test-owner-id",
                category = "Test Category",
                location = "Test Location",
                address = "123 Shop Street",
                phone = "+0987654321",
                email = "shop@test.com",
                isVerified = true,
                isActive = true,
                rating = 4.5
            )
            
            val createResult = shopRepository.addShop(testShop)
            if (createResult.isFailure) {
                return TestResult(
                    testName = "Shop Management",
                    passed = false,
                    message = "Failed to create shop: ${createResult.exceptionOrNull()?.message}",
                    duration = System.currentTimeMillis() - startTime
                )
            }
            
            val shopId = createResult.getOrThrow()
            
            // Test shop retrieval
            val getShopResult = shopRepository.getShopById(shopId)
            if (getShopResult == null) {
                return TestResult(
                    testName = "Shop Management",
                    passed = false,
                    message = "Failed to retrieve created shop",
                    duration = System.currentTimeMillis() - startTime
                )
            }
            
            Log.i(TAG, "Shop management test passed")
            TestResult(
                testName = "Shop Management",
                passed = true,
                message = "Successfully created and retrieved shop",
                duration = System.currentTimeMillis() - startTime
            )
            
        } catch (e: Exception) {
            Log.e(TAG, "Shop management test failed", e)
            TestResult(
                testName = "Shop Management",
                passed = false,
                message = "Exception: ${e.message}",
                duration = System.currentTimeMillis() - startTime
            )
        }
    }
    
    private suspend fun testProductManagement(): TestResult {
        val startTime = System.currentTimeMillis()
        return try {
            Log.i(TAG, "Testing product management...")
            
            val testProduct = Product(
                shopId = "test-shop-id",
                name = "Test Product",
                description = "A test product for verification",
                price = 29.99,
                category = "Test Category",
                expensePerUnit = 12.50, // Testing new expense per unit field
                inStock = true,
                stockQuantity = 100,
                isActive = true,
                rating = 4.0f
            )
            
            val createResult = productRepository.createProduct(testProduct)
            if (createResult.isFailure) {
                return TestResult(
                    testName = "Product Management",
                    passed = false,
                    message = "Failed to create product: ${createResult.exceptionOrNull()?.message}",
                    duration = System.currentTimeMillis() - startTime
                )
            }
            
            val productId = createResult.getOrThrow()
            
            // Test product retrieval
            val getProductResult = productRepository.getProductById(productId)
            if (getProductResult.isFailure || getProductResult.getOrNull() == null) {
                return TestResult(
                    testName = "Product Management",
                    passed = false,
                    message = "Failed to retrieve created product",
                    duration = System.currentTimeMillis() - startTime
                )
            }
            
            // Validate expensePerUnit field is properly saved and retrieved
            val retrievedProduct = getProductResult.getOrThrow()
            if (retrievedProduct?.expensePerUnit != 12.50) {
                return TestResult(
                    testName = "Product Management",
                    passed = false,
                    message = "expensePerUnit field not properly saved/retrieved. Expected: 12.50, Got: ${retrievedProduct?.expensePerUnit}",
                    duration = System.currentTimeMillis() - startTime
                )
            }
            
            // Test stock update
            val stockUpdateResult = productRepository.updateStock(productId, 50)
            if (stockUpdateResult.isFailure) {
                return TestResult(
                    testName = "Product Management",
                    passed = false,
                    message = "Failed to update product stock",
                    duration = System.currentTimeMillis() - startTime
                )
            }
            
            Log.i(TAG, "Product management test passed")
            TestResult(
                testName = "Product Management",
                passed = true,
                message = "Successfully created, retrieved, and updated product",
                duration = System.currentTimeMillis() - startTime
            )
            
        } catch (e: Exception) {
            Log.e(TAG, "Product management test failed", e)
            TestResult(
                testName = "Product Management",
                passed = false,
                message = "Exception: ${e.message}",
                duration = System.currentTimeMillis() - startTime
            )
        }
    }
    
    private suspend fun testServiceManagement(): TestResult {
        val startTime = System.currentTimeMillis()
        return try {
            Log.i(TAG, "Testing service management...")
            
            val testService = Service(
                shopId = "test-shop-id",
                name = "Test Service",
                description = "A test service for verification",
                basePrice = 49.99,
                estimatedDuration = 60,
                category = "Test Category",
                expensePerUnit = 18.75, // Testing new expense per unit field
                isActive = true,
                isBookable = true,
                rating = 4.2f
            )
            
            val createResult = serviceRepository.createService(testService)
            if (createResult.isFailure) {
                return TestResult(
                    testName = "Service Management",
                    passed = false,
                    message = "Failed to create service: ${createResult.exceptionOrNull()?.message}",
                    duration = System.currentTimeMillis() - startTime
                )
            }
            
            val serviceId = createResult.getOrThrow()
            
            // Test service retrieval
            val getServiceResult = serviceRepository.getServiceById(serviceId)
            if (getServiceResult.isFailure || getServiceResult.getOrNull() == null) {
                return TestResult(
                    testName = "Service Management",
                    passed = false,
                    message = "Failed to retrieve created service",
                    duration = System.currentTimeMillis() - startTime
                )
            }
            
            // Validate expensePerUnit field is properly saved and retrieved
            val retrievedService = getServiceResult.getOrThrow()
            if (retrievedService?.expensePerUnit != 18.75) {
                return TestResult(
                    testName = "Service Management",
                    passed = false,
                    message = "expensePerUnit field not properly saved/retrieved. Expected: 18.75, Got: ${retrievedService?.expensePerUnit}",
                    duration = System.currentTimeMillis() - startTime
                )
            }
            
            Log.i(TAG, "Service management test passed")
            TestResult(
                testName = "Service Management",
                passed = true,
                message = "Successfully created and retrieved service",
                duration = System.currentTimeMillis() - startTime
            )
            
        } catch (e: Exception) {
            Log.e(TAG, "Service management test failed", e)
            TestResult(
                testName = "Service Management",
                passed = false,
                message = "Exception: ${e.message}",
                duration = System.currentTimeMillis() - startTime
            )
        }
    }
    
    private suspend fun testOrderManagement(): TestResult {
        val startTime = System.currentTimeMillis()
        return try {
            Log.i(TAG, "Testing order management...")
            
            val testOrderItem = OrderItem(
                productId = "test-product-id",
                name = "Test Product",
                price = 29.99,
                quantity = 2
            )
            
            val testOrder = Order(
                customerId = "test-customer-id",
                shopId = "test-shop-id",
                items = listOf(testOrderItem),
                subtotal = 59.98,
                tax = 5.40,
                shippingFee = 9.99,
                total = 75.37,
                status = OrderStatus.PENDING
            )
            
            val createResult = orderRepository.createOrder(testOrder)
            if (createResult.isFailure) {
                return TestResult(
                    testName = "Order Management",
                    passed = false,
                    message = "Failed to create order: ${createResult.exceptionOrNull()?.message}",
                    duration = System.currentTimeMillis() - startTime
                )
            }
            
            val orderId = createResult.getOrThrow()
            
            // Test order status update
            val statusUpdateResult = orderRepository.updateOrderStatus(orderId, OrderStatus.CONFIRMED)
            if (statusUpdateResult.isFailure) {
                return TestResult(
                    testName = "Order Management",
                    passed = false,
                    message = "Failed to update order status",
                    duration = System.currentTimeMillis() - startTime
                )
            }
            
            Log.i(TAG, "Order management test passed")
            TestResult(
                testName = "Order Management",
                passed = true,
                message = "Successfully created order and updated status",
                duration = System.currentTimeMillis() - startTime
            )
            
        } catch (e: Exception) {
            Log.e(TAG, "Order management test failed", e)
            TestResult(
                testName = "Order Management",
                passed = false,
                message = "Exception: ${e.message}",
                duration = System.currentTimeMillis() - startTime
            )
        }
    }
    
    private suspend fun testReviewSystem(): TestResult {
        val startTime = System.currentTimeMillis()
        return try {
            Log.i(TAG, "Testing review system...")
            
            val testReview = Review(
                customerId = "test-customer-id",
                shopId = "test-shop-id",
                targetType = ReviewTargetType.PRODUCT,
                targetId = "test-product-id",
                targetName = "Test Product",
                rating = 5.0f,
                title = "Great Product!",
                content = "Excellent product! Highly recommended.",
                verifiedPurchase = true
            )
            
            val createResult = reviewRepository.createReview(testReview)
            if (createResult.isFailure) {
                return TestResult(
                    testName = "Review System",
                    passed = false,
                    message = "Failed to create review: ${createResult.exceptionOrNull()?.message}",
                    duration = System.currentTimeMillis() - startTime
                )
            }
            
            val reviewId = createResult.getOrThrow()
            
            // Test review retrieval
            val getReviewsResult = reviewRepository.getReviewsForTarget(ReviewTargetType.PRODUCT, "test-product-id")
            if (getReviewsResult.isFailure) {
                return TestResult(
                    testName = "Review System",
                    passed = false,
                    message = "Failed to retrieve reviews",
                    duration = System.currentTimeMillis() - startTime
                )
            }
            
            Log.i(TAG, "Review system test passed")
            TestResult(
                testName = "Review System",
                passed = true,
                message = "Successfully created and retrieved review",
                duration = System.currentTimeMillis() - startTime
            )
            
        } catch (e: Exception) {
            Log.e(TAG, "Review system test failed", e)
            TestResult(
                testName = "Review System",
                passed = false,
                message = "Exception: ${e.message}",
                duration = System.currentTimeMillis() - startTime
            )
        }
    }
    
    private suspend fun testFavoritesSystem(): TestResult {
        val startTime = System.currentTimeMillis()
        return try {
            Log.i(TAG, "Testing favorites system...")
            
            val testFavorite = Favorite(
                userId = "test-user-id",
                targetType = FavoriteTargetType.PRODUCT,
                targetId = "test-product-id",
                shopId = "test-shop-id"
            )
            
            val createResult = favoriteRepository.addToFavorites(testFavorite)
            if (createResult.isFailure) {
                return TestResult(
                    testName = "Favorites System",
                    passed = false,
                    message = "Failed to add favorite: ${createResult.exceptionOrNull()?.message}",
                    duration = System.currentTimeMillis() - startTime
                )
            }
            
            // Test favorites retrieval
            val getFavoritesResult = favoriteRepository.getFavoritesForUser("test-user-id")
            if (getFavoritesResult.isFailure) {
                return TestResult(
                    testName = "Favorites System",
                    passed = false,
                    message = "Failed to retrieve user favorites",
                    duration = System.currentTimeMillis() - startTime
                )
            }
            
            Log.i(TAG, "Favorites system test passed")
            TestResult(
                testName = "Favorites System",
                passed = true,
                message = "Successfully added and retrieved favorite",
                duration = System.currentTimeMillis() - startTime
            )
            
        } catch (e: Exception) {
            Log.e(TAG, "Favorites system test failed", e)
            TestResult(
                testName = "Favorites System",
                passed = false,
                message = "Exception: ${e.message}",
                duration = System.currentTimeMillis() - startTime
            )
        }
    }
    
    private suspend fun testNotificationSystem(): TestResult {
        val startTime = System.currentTimeMillis()
        return try {
            Log.i(TAG, "Testing notification system...")
            
            val sendResult = notificationRepository.sendNotification(
                userId = "test-user-id",
                type = NotificationType.ORDER_UPDATE,
                title = "Test Notification",
                message = "This is a test notification for database verification",
                priority = NotificationPriority.NORMAL
            )
            
            if (sendResult.isFailure) {
                return TestResult(
                    testName = "Notification System",
                    passed = false,
                    message = "Failed to send notification: ${sendResult.exceptionOrNull()?.message}",
                    duration = System.currentTimeMillis() - startTime
                )
            }
            
            // Test notification retrieval
            val getNotificationsResult = notificationRepository.getNotificationsForUser("test-user-id")
            if (getNotificationsResult.isFailure) {
                return TestResult(
                    testName = "Notification System",
                    passed = false,
                    message = "Failed to retrieve notifications",
                    duration = System.currentTimeMillis() - startTime
                )
            }
            
            Log.i(TAG, "Notification system test passed")
            TestResult(
                testName = "Notification System",
                passed = true,
                message = "Successfully sent and retrieved notification",
                duration = System.currentTimeMillis() - startTime
            )
            
        } catch (e: Exception) {
            Log.e(TAG, "Notification system test failed", e)
            TestResult(
                testName = "Notification System",
                passed = false,
                message = "Exception: ${e.message}",
                duration = System.currentTimeMillis() - startTime
            )
        }
    }
    
    private suspend fun testDataRelationships(): TestResult {
        val startTime = System.currentTimeMillis()
        return try {
            Log.i(TAG, "Testing data relationships...")
            
            // This test verifies that related data can be retrieved correctly
            // In a real scenario, we would test shop->products, user->orders, etc.
            
            val testShopId = "test-shop-id"
            
            // Test getting products for a shop
            val productsResult = productRepository.getProductsForShop(testShopId)
            if (productsResult.isFailure) {
                return TestResult(
                    testName = "Data Relationships",
                    passed = false,
                    message = "Failed to get products for shop",
                    duration = System.currentTimeMillis() - startTime
                )
            }
            
            // Test getting services for a shop
            val servicesResult = serviceRepository.getServicesForShop(testShopId)
            if (servicesResult.isFailure) {
                return TestResult(
                    testName = "Data Relationships",
                    passed = false,
                    message = "Failed to get services for shop",
                    duration = System.currentTimeMillis() - startTime
                )
            }
            
            Log.i(TAG, "Data relationships test passed")
            TestResult(
                testName = "Data Relationships",
                passed = true,
                message = "Successfully tested data relationships",
                duration = System.currentTimeMillis() - startTime
            )
            
        } catch (e: Exception) {
            Log.e(TAG, "Data relationships test failed", e)
            TestResult(
                testName = "Data Relationships",
                passed = false,
                message = "Exception: ${e.message}",
                duration = System.currentTimeMillis() - startTime
            )
        }
    }
    
    private suspend fun testPerformance(): TestResult {
        val startTime = System.currentTimeMillis()
        return try {
            Log.i(TAG, "Testing performance...")
            
            // Test multiple rapid operations
            val operationStartTime = System.currentTimeMillis()
            
            // Simulate multiple quick operations
            repeat(5) {
                productRepository.getAllProducts()
                delay(100)
            }
            
            val operationDuration = System.currentTimeMillis() - operationStartTime
            
            if (operationDuration > 10000) { // 10 seconds threshold
                return TestResult(
                    testName = "Performance",
                    passed = false,
                    message = "Operations took too long: ${operationDuration}ms",
                    duration = System.currentTimeMillis() - startTime
                )
            }
            
            Log.i(TAG, "Performance test passed")
            TestResult(
                testName = "Performance",
                passed = true,
                message = "Performance test completed in ${operationDuration}ms",
                duration = System.currentTimeMillis() - startTime
            )
            
        } catch (e: Exception) {
            Log.e(TAG, "Performance test failed", e)
            TestResult(
                testName = "Performance",
                passed = false,
                message = "Exception: ${e.message}",
                duration = System.currentTimeMillis() - startTime
            )
        }
    }
}

/**
 * Result of a single test
 */
data class TestResult(
    val testName: String,
    val passed: Boolean,
    val message: String,
    val duration: Long
)

/**
 * Overall verification result
 */
data class VerificationResult(
    val success: Boolean,
    val totalTests: Int,
    val passedTests: Int,
    val failedTests: Int,
    val testResults: List<TestResult>,
    val summary: String
)
