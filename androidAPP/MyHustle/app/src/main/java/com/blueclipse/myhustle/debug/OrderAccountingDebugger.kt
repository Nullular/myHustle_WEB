package com.blueclipse.myhustle.debug

import android.util.Log
import com.blueclipse.myhustle.data.repository.*
import com.blueclipse.myhustle.data.service.CheckoutService
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.flow.first

/**
 * Debug helper to verify cart-to-order conversion and accounting integration
 * This can be called to test the full flow from cart to database
 */
class OrderAccountingDebugger {
    
    private val auth = FirebaseAuth.getInstance()
    private val cartRepository = CartRepository.instance
    private val orderRepository = OrderRepository.instance
    private val transactionRepository = TransactionRepository.instance
    private val checkoutService = CheckoutService.instance
    
    fun debugOrderFlow() {
        runBlocking {
            try {
                Log.d("OrderDebug", "=== STARTING ORDER FLOW DEBUG ===")
                
                // Check authentication
                val currentUser = auth.currentUser
                if (currentUser == null) {
                    Log.e("OrderDebug", "❌ User not authenticated")
                    return@runBlocking
                }
                Log.d("OrderDebug", "✅ User authenticated: ${currentUser.email}")
                
                // Check cart state before checkout
                val cartItemsBefore = cartRepository.cartItems.first()
                Log.d("OrderDebug", "📦 Cart items before checkout: ${cartItemsBefore.size}")
                cartItemsBefore.forEach { item ->
                    Log.d("OrderDebug", "   - ${item.name} x${item.quantity} ($${item.price}) [${item.type}]")
                }
                
                if (cartItemsBefore.isEmpty()) {
                    Log.w("OrderDebug", "⚠️  Cart is empty - cannot test checkout")
                    return@runBlocking
                }
                
                // Check order state before checkout
                val ordersBefore = orderRepository.orders.first()
                Log.d("OrderDebug", "📋 Customer orders before checkout: ${ordersBefore.size}")
                
                // Check accounting data before checkout
                val accountingBefore = transactionRepository.accountingOverviewState.first()
                Log.d("OrderDebug", "💰 Accounting before - Income: $${accountingBefore.totalIncome}, Expenses: $${accountingBefore.totalExpenses}")
                
                // Process checkout
                Log.d("OrderDebug", "🚀 Processing checkout...")
                val checkoutResult = checkoutService.processCheckout()
                
                if (checkoutResult.isSuccess) {
                    val result = checkoutResult.getOrNull()
                    if (result?.success == true) {
                        Log.d("OrderDebug", "✅ Checkout successful!")
                        Log.d("OrderDebug", "   - Orders created: ${result.orderIds.size}")
                        Log.d("OrderDebug", "   - Bookings created: ${result.bookingIds.size}")
                        Log.d("OrderDebug", "   - Message: ${result.message}")
                        
                        // Give time for real-time listeners to update
                        kotlinx.coroutines.delay(2000)
                        
                        // Check cart state after checkout
                        val cartItemsAfter = cartRepository.cartItems.first()
                        Log.d("OrderDebug", "📦 Cart items after checkout: ${cartItemsAfter.size}")
                        if (cartItemsAfter.isEmpty()) {
                            Log.d("OrderDebug", "✅ Cart cleared successfully")
                        } else {
                            Log.e("OrderDebug", "❌ Cart not cleared properly")
                        }
                        
                        // Check order state after checkout
                        val ordersAfter = orderRepository.orders.first()
                        Log.d("OrderDebug", "📋 Customer orders after checkout: ${ordersAfter.size}")
                        if (ordersAfter.size > ordersBefore.size) {
                            Log.d("OrderDebug", "✅ New orders created and visible in customer orders")
                            ordersAfter.take(3).forEach { order ->
                                Log.d("OrderDebug", "   - Order ${order.orderNumber}: $${order.total} (${order.status})")
                            }
                        } else {
                            Log.e("OrderDebug", "❌ No new orders visible in customer orders")
                        }
                        
                        // Force accounting data refresh
                        transactionRepository.refreshAccountingData()
                        kotlinx.coroutines.delay(1000)
                        
                        // Check accounting data after checkout
                        val accountingAfter = transactionRepository.accountingOverviewState.first()
                        Log.d("OrderDebug", "💰 Accounting after - Income: $${accountingAfter.totalIncome}, Expenses: $${accountingAfter.totalExpenses}")
                        
                        val incomeIncrease = accountingAfter.totalIncome - accountingBefore.totalIncome
                        if (incomeIncrease > 0) {
                            Log.d("OrderDebug", "✅ Income increased by $${incomeIncrease}")
                        } else {
                            Log.e("OrderDebug", "❌ Income not increased in accounting")
                        }
                        
                        // Check recent transactions
                        Log.d("OrderDebug", "📊 Recent transactions (${accountingAfter.recentTransactions.size}):")
                        accountingAfter.recentTransactions.take(5).forEach { transaction ->
                            val type = if (transaction.type == TransactionType.INCOME) "💚" else "❤️"
                            Log.d("OrderDebug", "   $type ${transaction.description}: $${transaction.amount}")
                        }
                        
                        Log.d("OrderDebug", "✅ ORDER FLOW DEBUG COMPLETED SUCCESSFULLY!")
                        
                    } else {
                        Log.e("OrderDebug", "❌ Checkout failed: ${result?.message}")
                    }
                } else {
                    Log.e("OrderDebug", "❌ Checkout error: ${checkoutResult.exceptionOrNull()?.message}")
                }
                
            } catch (e: Exception) {
                Log.e("OrderDebug", "❌ Debug exception", e)
            }
        }
    }
    
    fun logCurrentState() {
        runBlocking {
            try {
                Log.d("OrderDebug", "=== CURRENT STATE SNAPSHOT ===")
                
                val currentUser = auth.currentUser
                if (currentUser != null) {
                    Log.d("OrderDebug", "👤 User: ${currentUser.email}")
                    
                    val cartItems = cartRepository.cartItems.first()
                    Log.d("OrderDebug", "🛒 Cart: ${cartItems.size} items")
                    
                    val orders = orderRepository.orders.first()
                    Log.d("OrderDebug", "📋 Orders: ${orders.size} orders")
                    
                    val accounting = transactionRepository.accountingOverviewState.first()
                    Log.d("OrderDebug", "💰 Accounting: Income=$${accounting.totalIncome}, Expenses=$${accounting.totalExpenses}")
                    
                } else {
                    Log.d("OrderDebug", "❌ No authenticated user")
                }
                
                Log.d("OrderDebug", "=== END STATE SNAPSHOT ===")
            } catch (e: Exception) {
                Log.e("OrderDebug", "Error getting current state", e)
            }
        }
    }
    
    companion object {
        fun runDebug() {
            val debugger = OrderAccountingDebugger()
            debugger.logCurrentState()
            debugger.debugOrderFlow()
        }
    }
}

/**
 * Call OrderAccountingDebugger.runDebug() from any screen or activity
 * to verify the cart-to-order flow is working correctly
 */
