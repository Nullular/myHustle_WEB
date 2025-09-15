package com.blueclipse.myhustle.test

import android.util.Log
import com.blueclipse.myhustle.data.model.Product
import com.blueclipse.myhustle.data.model.Service
import com.blueclipse.myhustle.data.repository.ProductRepository
import com.blueclipse.myhustle.data.repository.ServiceRepository
import kotlinx.coroutines.delay

/**
 * Test class to verify that expensePerUnit field works with Firebase database
 * Run this to confirm database integration is working
 */
object ExpensePerUnitDatabaseTest {
    
    private val productRepository = ProductRepository.instance
    private val serviceRepository = ServiceRepository.instance
    
    /**
     * Test that expensePerUnit field is properly saved and retrieved for products
     */
    suspend fun testProductExpensePerUnit(): Boolean {
        return try {
            Log.d("ExpenseTest", "🧪 Testing Product expensePerUnit database integration...")
            
            // Create a test product with expensePerUnit
            val testProduct = Product(
                shopId = "test-shop-123",
                ownerId = "test-owner-456", 
                name = "Test Product with Expense",
                description = "Testing expensePerUnit database field",
                price = 25.00,
                category = "Test",
                stockQuantity = 10,
                expensePerUnit = 12.75, // This is what we're testing
                inStock = true,
                isActive = true
            )
            
            // Save to database
            val createResult = productRepository.createProduct(testProduct)
            if (createResult.isFailure) {
                Log.e("ExpenseTest", "❌ Failed to create product: ${createResult.exceptionOrNull()?.message}")
                return false
            }
            
            val productId = createResult.getOrThrow()
            Log.d("ExpenseTest", "✅ Product created with ID: $productId")
            
            // Wait a moment for database consistency
            delay(1000)
            
            // Retrieve from database
            val getResult = productRepository.getProductById(productId)
            if (getResult.isFailure) {
                Log.e("ExpenseTest", "❌ Failed to retrieve product: ${getResult.exceptionOrNull()?.message}")
                return false
            }
            
            val retrievedProduct = getResult.getOrNull()
            if (retrievedProduct == null) {
                Log.e("ExpenseTest", "❌ Retrieved product is null")
                return false
            }
            
            // Check if expensePerUnit was saved correctly
            if (retrievedProduct.expensePerUnit == 12.75) {
                Log.d("ExpenseTest", "✅ SUCCESS! expensePerUnit saved and retrieved correctly: ${retrievedProduct.expensePerUnit}")
                return true
            } else {
                Log.e("ExpenseTest", "❌ FAIL! expensePerUnit not correct. Expected: 12.75, Got: ${retrievedProduct.expensePerUnit}")
                return false
            }
            
        } catch (e: Exception) {
            Log.e("ExpenseTest", "❌ Exception during product test: ${e.message}", e)
            false
        }
    }
    
    /**
     * Test that expensePerUnit field is properly saved and retrieved for services
     */
    suspend fun testServiceExpensePerUnit(): Boolean {
        return try {
            Log.d("ExpenseTest", "🧪 Testing Service expensePerUnit database integration...")
            
            // Create a test service with expensePerUnit
            val testService = Service(
                shopId = "test-shop-123",
                ownerId = "test-owner-456",
                name = "Test Service with Expense",
                description = "Testing expensePerUnit database field for services",
                basePrice = 50.00,
                category = "Test",
                estimatedDuration = 60,
                expensePerUnit = 18.25, // This is what we're testing
                isBookable = true,
                isActive = true
            )
            
            // Save to database
            val createResult = serviceRepository.createService(testService)
            if (createResult.isFailure) {
                Log.e("ExpenseTest", "❌ Failed to create service: ${createResult.exceptionOrNull()?.message}")
                return false
            }
            
            val serviceId = createResult.getOrThrow()
            Log.d("ExpenseTest", "✅ Service created with ID: $serviceId")
            
            // Wait a moment for database consistency
            delay(1000)
            
            // Retrieve from database
            val getResult = serviceRepository.getServiceById(serviceId)
            if (getResult.isFailure) {
                Log.e("ExpenseTest", "❌ Failed to retrieve service: ${getResult.exceptionOrNull()?.message}")
                return false
            }
            
            val retrievedService = getResult.getOrNull()
            if (retrievedService == null) {
                Log.e("ExpenseTest", "❌ Retrieved service is null")
                return false
            }
            
            // Check if expensePerUnit was saved correctly
            if (retrievedService.expensePerUnit == 18.25) {
                Log.d("ExpenseTest", "✅ SUCCESS! expensePerUnit saved and retrieved correctly: ${retrievedService.expensePerUnit}")
                return true
            } else {
                Log.e("ExpenseTest", "❌ FAIL! expensePerUnit not correct. Expected: 18.25, Got: ${retrievedService.expensePerUnit}")
                return false
            }
            
        } catch (e: Exception) {
            Log.e("ExpenseTest", "❌ Exception during service test: ${e.message}", e)
            false
        }
    }
    
    /**
     * Run all expensePerUnit database tests
     */
    suspend fun runAllTests(): Boolean {
        Log.d("ExpenseTest", "🚀 Starting expensePerUnit database integration tests...")
        
        val productTestResult = testProductExpensePerUnit()
        val serviceTestResult = testServiceExpensePerUnit()
        
        val allTestsPassed = productTestResult && serviceTestResult
        
        if (allTestsPassed) {
            Log.d("ExpenseTest", "🎉 ALL TESTS PASSED! expensePerUnit field is fully working with Firebase database!")
        } else {
            Log.e("ExpenseTest", "😞 Some tests failed. Check logs above for details.")
        }
        
        return allTestsPassed
    }
}
