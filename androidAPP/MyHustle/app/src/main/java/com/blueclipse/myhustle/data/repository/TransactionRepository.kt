package com.blueclipse.myhustle.data.repository

import android.util.Log
import com.blueclipse.myhustle.data.model.*
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

/**
 * Repository for managing accounting transactions
 * Aggregates data from Orders, Bookings, Products, and Services
 */
class TransactionRepository private constructor() {
    
    private val firestore = FirebaseFirestore.getInstance()
    private val auth = FirebaseAuth.getInstance()
    private val bookingRepository = BookingRepository.instance
    private val orderRepository = OrderRepository.instance
    private val productRepository = ProductRepository.instance
    private val serviceRepository = ServiceRepository.instance
    private val shopRepository = FirebaseShopRepository.instance
    
    // StateFlow for real-time accounting data
    private val _accountingOverview = MutableStateFlow(AccountingOverview(0.0, 0.0, 0.0, emptyList()))
    val accountingOverviewState: StateFlow<AccountingOverview> = _accountingOverview.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    init {
        // Start monitoring for changes
        startAccountingDataListener()
        
        // Set up callback to refresh accounting when orders are created
        orderRepository.setOnOrderCreatedCallback {
            // Use coroutine to refresh data
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    refreshAccountingData()
                } catch (e: Exception) {
                    Log.w("TransactionRepo", "Failed to refresh accounting after order creation", e)
                }
            }
        }
    }
    
    private fun startAccountingDataListener() {
        // Listen for auth changes
        auth.addAuthStateListener { firebaseAuth ->
            if (firebaseAuth.currentUser != null) {
                // Refresh data when user logs in
                Log.d("TransactionRepo", "User authenticated, refreshing accounting data")
            } else {
                _accountingOverview.value = AccountingOverview(0.0, 0.0, 0.0, emptyList())
            }
        }
    }
    
    /**
     * Refresh accounting data manually and update StateFlow
     */
    suspend fun refreshAccountingData() {
        try {
            _isLoading.value = true
            Log.d("TransactionRepo", "Refreshing accounting data...")
            val overview = getAccountingOverview()
            _accountingOverview.value = overview
            Log.d("TransactionRepo", "Accounting data refreshed: Income=${overview.totalIncome}, Expenses=${overview.totalExpenses}, Transactions=${overview.recentTransactions.size}")
        } catch (e: Exception) {
            Log.e("TransactionRepo", "Error refreshing accounting data", e)
            // Don't crash, just log and continue
        } finally {
            _isLoading.value = false
        }
    }
    
    companion object {
        @Volatile
        private var INSTANCE: TransactionRepository? = null
        
        val instance: TransactionRepository
            get() = INSTANCE ?: synchronized(this) {
                INSTANCE ?: TransactionRepository().also { INSTANCE = it }
            }
    }
    
    /**
     * Get accounting overview for current user's shops
     */
    suspend fun getAccountingOverview(): AccountingOverview {
        return try {
            val currentUser = FirebaseAuth.getInstance().currentUser
                ?: return AccountingOverview(0.0, 0.0, 0.0, emptyList())
            
            val userId = currentUser.uid
            
            // Get user's shops
            val userShops = shopRepository.getShopsByOwner(userId)
            if (userShops.isEmpty()) {
                Log.d("TransactionRepo", "No shops found for user $userId")
                return AccountingOverview(0.0, 0.0, 0.0, emptyList())
            }
            
            val shopIds = userShops.map { it.id }
            Log.d("TransactionRepo", "Found ${userShops.size} shops for user $userId: ${shopIds.joinToString()}")
            
            // Get recent transactions from orders and bookings
            val recentTransactions = mutableListOf<Transaction>()
            var totalIncome = 0.0
            var totalExpenses = 0.0
            
            // Process orders for all user shops
            // Get all orders for this shop owner once
            val allOrders = orderRepository.getOrdersForShopOwner(userId).getOrNull() ?: emptyList()
            Log.d("TransactionRepo", "Found ${allOrders.size} total orders for user $userId")
            
            for (shopId in shopIds) {
                val shopOrders = allOrders.filter { it.shopId == shopId }
                Log.d("TransactionRepo", "Processing shop $shopId: ${shopOrders.size} orders")
                
                for (order in shopOrders) {
                    Log.d("TransactionRepo", "Processing order ${order.orderNumber} with status ${order.status}")
                    // Include all orders except CANCELLED ones in accounting
                    if (order.status != OrderStatus.CANCELLED) {
                        // Add income from order
                        totalIncome += order.total
                        
                        // Add status indicator to transaction description
                        val statusText = when (order.status) {
                            OrderStatus.PENDING -> "(Pending)"
                            OrderStatus.CONFIRMED -> "(Confirmed)"
                            OrderStatus.SHIPPED -> "(Shipped)"
                            OrderStatus.DELIVERED -> "(Delivered)"
                            else -> ""
                        }
                        
                        recentTransactions.add(
                            Transaction(
                                id = "order_${order.id}",
                                description = "Product Sale - Order #${order.orderNumber} $statusText",
                                amount = order.total,
                                type = TransactionType.INCOME,
                                date = formatTimestamp(order.createdAt),
                                orderId = order.id
                            )
                        )
                        
                        // Calculate and add expenses from order items
                        val orderExpenses = calculateOrderExpenses(order.items)
                        if (orderExpenses > 0) {
                            totalExpenses += orderExpenses
                            recentTransactions.add(
                                Transaction(
                                    id = "expense_order_${order.id}",
                                    description = "Product Expenses - Order #${order.orderNumber} $statusText",
                                    amount = -orderExpenses,
                                    type = TransactionType.EXPENSE,
                                    date = formatTimestamp(order.createdAt),
                                    orderId = order.id
                                )
                            )
                        }
                    }
                }
                
                // Process bookings for this shop
                val bookings = bookingRepository.getBookingsForShop(shopId)
                for (booking in bookings) {
                    if (booking.status == BookingStatus.COMPLETED) {
                        // Get service details to calculate income and expenses
                        val service = serviceRepository.getServiceById(booking.serviceId).getOrNull()
                        if (service != null) {
                            // Add income from booking
                            totalIncome += service.basePrice
                            recentTransactions.add(
                                Transaction(
                                    id = "booking_${booking.id}",
                                    description = "Service Revenue - ${booking.serviceName}",
                                    amount = service.basePrice,
                                    type = TransactionType.INCOME,
                                    date = formatTimestamp(booking.createdAt),
                                    orderId = null // Bookings don't have orderIds but could add bookingId if needed
                                )
                            )
                            
                            // Add expense from service
                            val serviceExpense = service.expensePerUnit
                            if (serviceExpense > 0) {
                                totalExpenses += serviceExpense
                                recentTransactions.add(
                                    Transaction(
                                        id = "expense_service_${booking.id}",
                                        description = "Service Expenses - ${booking.serviceName}",
                                        amount = -serviceExpense,
                                        type = TransactionType.EXPENSE,
                                        date = formatTimestamp(booking.createdAt),
                                        orderId = null // Service expenses don't link to orders
                                    )
                                )
                            }
                        }
                    }
                }
            }
            
            // Sort transactions by date (most recent first) and take recent ones
            val sortedTransactions = recentTransactions
                .sortedByDescending { parseDate(it.date) }
                .take(10) // Get most recent 10 transactions
            
            val netProfit = totalIncome - totalExpenses
            
            AccountingOverview(
                totalIncome = totalIncome,
                totalExpenses = totalExpenses,
                netProfit = netProfit,
                recentTransactions = sortedTransactions
            )
            
        } catch (e: Exception) {
            e.printStackTrace()
            AccountingOverview(0.0, 0.0, 0.0, emptyList())
        }
    }
    
    /**
     * Calculate total expenses for order items based on their expense per unit
     */
    private suspend fun calculateOrderExpenses(orderItems: List<OrderItem>): Double {
        var totalExpenses = 0.0
        
        for (item in orderItems) {
            try {
                // Get product to find its expense per unit
                val product = productRepository.getProductById(item.productId).getOrNull()
                if (product != null) {
                    val expensePerUnit = product.expensePerUnit
                    totalExpenses += expensePerUnit * item.quantity
                }
            } catch (e: Exception) {
                // If we can't find the product, skip its expense calculation
                continue
            }
        }
        
        return totalExpenses
    }
    
    /**
     * Format timestamp to date string
     */
    private fun formatTimestamp(timestamp: Long): String {
        val date = Date(timestamp)
        val formatter = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        return formatter.format(date)
    }
    
    /**
     * Parse date string to timestamp for sorting
     */
    private fun parseDate(dateString: String): Long {
        return try {
            val formatter = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            formatter.parse(dateString)?.time ?: 0L
        } catch (e: Exception) {
            0L
        }
    }
}

/**
 * Data classes for accounting data
 */
data class AccountingOverview(
    val totalIncome: Double,
    val totalExpenses: Double,
    val netProfit: Double,
    val recentTransactions: List<Transaction>
)

data class Transaction(
    val id: String,
    val description: String,
    val amount: Double,
    val type: TransactionType,
    val date: String,
    val orderId: String? = null
)

enum class TransactionType {
    INCOME, EXPENSE
}
