package com.blueclipse.myhustle.data.repository

import android.util.Log
import com.blueclipse.myhustle.data.model.Order
import com.blueclipse.myhustle.data.model.OrderStatus
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.tasks.await

/**
 * Repository for managing order data in Firebase
 */
class OrderRepository private constructor() {
    private val firestore = FirebaseFirestore.getInstance()
    private val ordersCollection = firestore.collection("orders")
    private val auth = FirebaseAuth.getInstance()
    
    // StateFlow for customer orders (orders where current user is the customer)
    private val _orders = MutableStateFlow<List<Order>>(emptyList())
    val orders: StateFlow<List<Order>> = _orders.asStateFlow()
    
    // StateFlow for shop owner orders (orders where current user is the owner)
    private val _shopOwnerOrders = MutableStateFlow<List<Order>>(emptyList())
    val shopOwnerOrders: StateFlow<List<Order>> = _shopOwnerOrders.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private var listenerErrorCount = 0
    private var lastErrorTime = 0L
    private val maxRetries = 3
    private val errorCooldownMs = 30000L // 30 seconds
    
    // Callback for when orders are created/updated
    private var onOrderCreatedCallback: (() -> Unit)? = null
    
    init {
        // Start listening for current user's orders (as customer)
        startOrdersListener()
        // Start listening for orders where current user is the shop owner
        startShopOwnerOrdersListener()
    }
    
    /**
     * Set callback to be triggered when orders are created or updated
     */
    fun setOnOrderCreatedCallback(callback: () -> Unit) {
        onOrderCreatedCallback = callback
    }
    
    private fun startOrdersListener() {
        val currentUser = auth.currentUser
        if (currentUser != null && shouldRetryListener()) {
            Log.d("OrderRepo", "Starting orders listener for user: ${currentUser.uid}")
            
            // Listen for orders by customer ID WITHOUT orderBy to avoid index requirement
            ordersCollection
                .whereEqualTo("customerId", currentUser.uid)
                .addSnapshotListener { snapshot, error ->
                    if (error != null) {
                        listenerErrorCount++
                        lastErrorTime = System.currentTimeMillis()
                        Log.e("OrderRepo", "Orders listener error (attempt $listenerErrorCount)", error)
                        
                        // Don't restart if we've hit max retries
                        if (listenerErrorCount >= maxRetries) {
                            Log.e("OrderRepo", "Max retries reached, stopping listener to prevent infinite loop")
                            return@addSnapshotListener
                        }
                        return@addSnapshotListener
                    }
                    
                    if (snapshot != null) {
                        // Reset error count on successful response
                        listenerErrorCount = 0
                        
                        Log.d("OrderRepo", "Orders listener update - ${snapshot.documents.size} orders")
                        val userOrders = snapshot.documents.mapNotNull { document ->
                            try {
                                document.toObject(Order::class.java)?.copy(id = document.id)
                            } catch (e: Exception) {
                                Log.e("OrderRepo", "Error parsing order", e)
                                null
                            }
                        }.sortedByDescending { it.createdAt } // Sort in memory instead of Firestore
                        
                        _orders.value = userOrders
                        Log.d("OrderRepo", "Updated orders state with ${userOrders.size} orders")
                    }
                }
        }
        
        // Listen for auth state changes
        auth.addAuthStateListener { firebaseAuth ->
            if (firebaseAuth.currentUser == null) {
                Log.d("OrderRepo", "User logged out, clearing orders")
                _orders.value = emptyList()
                _shopOwnerOrders.value = emptyList()
                resetErrorCounting()
            } else if (firebaseAuth.currentUser != currentUser) {
                Log.d("OrderRepo", "Different user logged in, resetting and restarting listener")
                resetErrorCounting()
                startOrdersListener()
                startShopOwnerOrdersListener()
            }
        }
    }
    
    /**
     * Start real-time listener for orders where current user is the shop owner
     */
    private fun startShopOwnerOrdersListener() {
        val currentUser = auth.currentUser
        if (currentUser != null && shouldRetryListener()) {
            Log.d("OrderRepo", "Starting shop owner orders listener for user: ${currentUser.uid}")
            
            // Listen for orders by owner ID
            ordersCollection
                .whereEqualTo("ownerId", currentUser.uid)
                .addSnapshotListener { snapshot, error ->
                    if (error != null) {
                        listenerErrorCount++
                        lastErrorTime = System.currentTimeMillis()
                        Log.e("OrderRepo", "Shop owner orders listener error (attempt $listenerErrorCount)", error)
                        
                        // Don't restart if we've hit max retries
                        if (listenerErrorCount >= maxRetries) {
                            Log.e("OrderRepo", "Max retries reached, stopping shop owner listener")
                            return@addSnapshotListener
                        }
                        return@addSnapshotListener
                    }
                    
                    if (snapshot != null) {
                        // Reset error count on successful response
                        listenerErrorCount = 0
                        
                        Log.d("OrderRepo", "Shop owner orders listener update - ${snapshot.documents.size} orders")
                        val ownerOrders = snapshot.documents.mapNotNull { document ->
                            try {
                                document.toObject(Order::class.java)?.copy(id = document.id)
                            } catch (e: Exception) {
                                Log.e("OrderRepo", "Error parsing shop owner order", e)
                                null
                            }
                        }.sortedByDescending { it.createdAt }
                        
                        _shopOwnerOrders.value = ownerOrders
                        Log.d("OrderRepo", "Updated shop owner orders state with ${ownerOrders.size} orders")
                    }
                }
        }
    }
    
    private fun shouldRetryListener(): Boolean {
        if (listenerErrorCount >= maxRetries) {
            val timeSinceLastError = System.currentTimeMillis() - lastErrorTime
            if (timeSinceLastError > errorCooldownMs) {
                Log.d("OrderRepo", "Cooldown period elapsed, allowing listener restart")
                resetErrorCounting()
                return true
            }
            Log.d("OrderRepo", "Still in cooldown period, not starting listener")
            return false
        }
        return true
    }
    
    private fun resetErrorCounting() {
        listenerErrorCount = 0
        lastErrorTime = 0L
    }
    
    /**
     * Manually refresh orders from Firestore
     */
    fun refreshOrders() {
        Log.d("OrderRepo", "Manual orders refresh requested")
        if (shouldRetryListener()) {
            startOrdersListener()
        } else {
            Log.w("OrderRepo", "Refresh blocked due to too many errors")
        }
    }
    
    companion object {
        @Volatile
        private var INSTANCE: OrderRepository? = null
        
        val instance: OrderRepository
            get() = INSTANCE ?: synchronized(this) {
                INSTANCE ?: OrderRepository().also { INSTANCE = it }
            }
    }
    
    /**
     * Create a new order
     */
    suspend fun createOrder(order: Order): Result<String> {
        return try {
            _isLoading.value = true
            Log.d("OrderRepo", "Creating order: ${order.orderNumber}")
            val documentRef = ordersCollection.add(order).await()
            val orderId = documentRef.id
            
            // Update the order with its ID
            documentRef.update("id", orderId).await()
            Log.d("OrderRepo", "Order created successfully with ID: $orderId")
            
            // Trigger callback to refresh accounting data
            onOrderCreatedCallback?.invoke()
            
            Result.success(orderId)
        } catch (e: Exception) {
            Log.e("OrderRepo", "Error creating order", e)
            Result.failure(e)
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * Get orders for a specific customer
     */
    suspend fun getOrdersForCustomer(customerId: String): Result<List<Order>> {
        return try {
            _isLoading.value = true
            val snapshot = ordersCollection
                .whereEqualTo("customerId", customerId)
                .get()
                .await()
            
            val orders = snapshot.documents.mapNotNull { document ->
                try {
                    document.toObject(Order::class.java)?.copy(id = document.id)
                } catch (e: Exception) {
                    null
                }
            }.sortedByDescending { it.createdAt } // Sort in memory instead
            
            _orders.value = orders
            Result.success(orders)
        } catch (e: Exception) {
            Log.e("OrderRepo", "Error getting orders for customer", e)
            Result.failure(e)
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * Get orders for a specific shop owner
     */
    suspend fun getOrdersForShopOwner(ownerId: String): Result<List<Order>> {
        return try {
            _isLoading.value = true
            val snapshot = ordersCollection
                .whereEqualTo("ownerId", ownerId)
                .get()
                .await()
            
            val orders = snapshot.documents.mapNotNull { document ->
                try {
                    document.toObject(Order::class.java)?.copy(id = document.id)
                } catch (e: Exception) {
                    null
                }
            }.sortedByDescending { it.createdAt } // Sort in memory instead
            
            Result.success(orders)
        } catch (e: Exception) {
            Log.e("OrderRepo", "Error getting orders for shop owner", e)
            Result.failure(e)
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * Update order status
     */
    suspend fun updateOrderStatus(orderId: String, status: OrderStatus): Result<Unit> {
        return try {
            val updateData = mapOf(
                "status" to status,
                "updatedAt" to System.currentTimeMillis()
            )
            
            when (status) {
                OrderStatus.CONFIRMED -> updateData + ("confirmedAt" to System.currentTimeMillis())
                OrderStatus.SHIPPED -> updateData + ("shippedAt" to System.currentTimeMillis())
                OrderStatus.DELIVERED -> updateData + ("deliveredAt" to System.currentTimeMillis())
                OrderStatus.CANCELLED -> updateData + ("cancelledAt" to System.currentTimeMillis())
                else -> updateData
            }
            
            ordersCollection.document(orderId).update(updateData).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Get order by ID
     */
    suspend fun getOrderById(orderId: String): Result<Order?> {
        return try {
            val document = ordersCollection.document(orderId).get().await()
            if (document.exists()) {
                val order = document.toObject(Order::class.java)?.copy(id = document.id)
                Result.success(order)
            } else {
                Result.success(null)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Update tracking information
     */
    suspend fun updateTracking(
        orderId: String,
        trackingNumber: String,
        carrier: String
    ): Result<Unit> {
        return try {
            val updateData = mapOf(
                "trackingNumber" to trackingNumber,
                "carrier" to carrier,
                "updatedAt" to System.currentTimeMillis()
            )
            
            ordersCollection.document(orderId).update(updateData).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
