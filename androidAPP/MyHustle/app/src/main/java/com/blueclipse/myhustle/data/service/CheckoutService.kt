package com.blueclipse.myhustle.data.service

import android.util.Log
import com.blueclipse.myhustle.data.model.*
import com.blueclipse.myhustle.data.repository.*
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import java.util.*

/**
 * Service class to handle checkout operations including cart-to-order/booking conversion
 * Manages inventory updates, order creation, and data persistence
 */
class CheckoutService private constructor() {
    
    private val auth = FirebaseAuth.getInstance()
    private val firestore = FirebaseFirestore.getInstance()
    private val cartRepository = CartRepository.instance
    private val orderRepository = OrderRepository.instance
    private val bookingRepository = BookingRepository.instance
    private val productRepository = ProductRepository.instance
    private val transactionRepository = TransactionRepository.instance
    
    // Use application-scoped coroutine to prevent composition lifecycle issues
    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    
    companion object {
        @Volatile
        private var INSTANCE: CheckoutService? = null
        
        val instance: CheckoutService
            get() = INSTANCE ?: synchronized(this) {
                INSTANCE ?: CheckoutService().also { INSTANCE = it }
            }
    }
    
    /**
     * Process checkout asynchronously without relying on caller's coroutine scope
     * This method starts the checkout process and returns immediately
     * Results are communicated via callback
     */
    fun processCheckoutAsync(
        onSuccess: (CheckoutResult) -> Unit,
        onFailure: (Exception) -> Unit
    ) {
        serviceScope.launch {
            try {
                val result = processCheckout()
                if (result.isSuccess) {
                    val checkoutResult = result.getOrNull()
                    if (checkoutResult != null) {
                        onSuccess(checkoutResult)
                    } else {
                        onFailure(Exception("Checkout result was null"))
                    }
                } else {
                    val throwable = result.exceptionOrNull()
                    onFailure(
                        if (throwable is Exception) throwable 
                        else Exception("Unknown checkout error", throwable)
                    )
                }
            } catch (e: Exception) {
                Log.e("CheckoutService", "Checkout failed in async processing", e)
                onFailure(e)
            }
        }
    }

    /**
     * Process the checkout - converts cart items to orders/bookings and updates inventory
     * Returns success/failure result with details
     */
    suspend fun processCheckout(): Result<CheckoutResult> {
        return try {
            val currentUser = auth.currentUser
            if (currentUser == null) {
                return Result.failure(Exception("User not authenticated"))
            }
            
            val cartItems = cartRepository.cartItems.value
            if (cartItems.isEmpty()) {
                return Result.failure(Exception("Cart is empty"))
            }
            
            Log.d("CheckoutService", "Processing checkout for ${cartItems.size} items")
            
            val orderIds = mutableListOf<String>()
            val bookingIds = mutableListOf<String>()
            val inventoryUpdates = mutableListOf<InventoryUpdate>()
            
            // Group cart items by shop and type
            val productItems = cartItems.filter { it.type == CartItemType.PRODUCT }
            val serviceItems = cartItems.filter { it.type == CartItemType.SERVICE }
            
            // Process product orders (grouped by shop)
            val productsByShop = productItems.groupBy { it.shopId }
            for ((shopId, shopProducts) in productsByShop) {
                val orderId = createOrderForShop(shopId, shopProducts, currentUser)
                orderIds.add(orderId)
                
                // Prepare inventory updates
                for (item in shopProducts) {
                    if (item.productId != null) {
                        inventoryUpdates.add(
                            InventoryUpdate(
                                productId = item.productId,
                                quantitySold = item.quantity,
                                variantId = item.selectedVariant?.id,
                                sizeId = item.selectedSize?.id
                            )
                        )
                    }
                }
            }
            
            // Process service bookings
            for (serviceItem in serviceItems) {
                if (serviceItem.serviceId != null) {
                    val bookingId = createBookingForService(serviceItem, currentUser)
                    bookingIds.add(bookingId)
                }
            }
            
            // Update product inventory and sales tracking
            updateInventoryAndSales(inventoryUpdates)
            
            // Clear the cart after successful checkout
            cartRepository.clearCart()
            
            // Refresh accounting data to reflect new orders/bookings
            try {
                transactionRepository.refreshAccountingData()
            } catch (e: Exception) {
                Log.w("CheckoutService", "Failed to refresh accounting data, but checkout was successful", e)
                // Don't fail the entire checkout for this
            }
            
            Log.d("CheckoutService", "Checkout successful - Orders: ${orderIds.size}, Bookings: ${bookingIds.size}")
            
            Result.success(
                CheckoutResult(
                    success = true,
                    orderIds = orderIds,
                    bookingIds = bookingIds,
                    message = "Checkout completed successfully"
                )
            )
            
        } catch (e: Exception) {
            Log.e("CheckoutService", "Checkout failed", e)
            Result.failure(e)
        }
    }
    
    private suspend fun createOrderForShop(
        shopId: String,
        cartItems: List<CartItem>,
        currentUser: com.google.firebase.auth.FirebaseUser
    ): String {
        // Generate order number
        val orderNumber = "ORD-${Date().time}"
        
        // Convert cart items to order items
        val orderItems = cartItems.map { cartItem ->
            OrderItem(
                productId = cartItem.productId ?: "",
                name = cartItem.name,
                sku = "", // Could be enhanced to include SKU
                price = cartItem.price,
                quantity = cartItem.quantity,
                imageUrl = cartItem.imageUrl,
                variantId = cartItem.selectedVariant?.id ?: "",
                variantName = cartItem.selectedVariant?.value ?: "",
                specifications = mapOf()
            )
        }
        
        // Calculate totals
        val subtotal = cartItems.sumOf { it.price * it.quantity }
        val deliveryFee = 2.99 // As shown in CheckoutScreen
        val total = subtotal + deliveryFee
        
        // Get shop owner information
        val shopOwnerId = getShopOwnerId(shopId)
        
        val order = Order(
            id = "", // Will be set by Firestore
            orderNumber = orderNumber,
            customerId = currentUser.uid,
            shopId = shopId,
            ownerId = shopOwnerId,
            items = orderItems,
            subtotal = subtotal,
            tax = 0.0,
            taxRate = 0.0,
            shippingFee = 0.0,
            deliveryFee = deliveryFee,
            serviceFee = 0.0,
            discount = 0.0,
            discountCode = "",
            total = total,
            currency = "USD",
            status = OrderStatus.PENDING,
            paymentStatus = PaymentStatus.PENDING,
            fulfillmentStatus = FulfillmentStatus.PENDING,
            customerInfo = CustomerInfo(
                name = currentUser.displayName ?: "",
                email = currentUser.email ?: "",
                phone = ""
            ),
            shippingMethod = ShippingMethod.DELIVERY,
            shippingAddress = ShippingAddress(),
            trackingNumber = "",
            carrier = "",
            estimatedDelivery = 0,
            paymentMethod = "Card", // Default, could be enhanced
            paymentReference = "",
            customerNotes = "",
            internalNotes = "",
            createdAt = System.currentTimeMillis(),
            updatedAt = System.currentTimeMillis()
        )
        
        val result = orderRepository.createOrder(order)
        return result.getOrThrow()
    }
    
    private suspend fun createBookingForService(
        serviceItem: CartItem,
        currentUser: com.google.firebase.auth.FirebaseUser
    ): String {
        val booking = Booking(
            id = "", // Will be set by Firestore
            customerId = currentUser.uid,
            shopId = serviceItem.shopId,
            shopOwnerId = getShopOwnerId(serviceItem.shopId),
            serviceId = serviceItem.serviceId ?: "",
            serviceName = serviceItem.name,
            shopName = serviceItem.shopName,
            customerName = currentUser.displayName ?: "",
            customerEmail = currentUser.email ?: "",
            requestedDate = "", // Could be enhanced to include date/time selection
            requestedTime = "",
            status = BookingStatus.PENDING,
            notes = serviceItem.notes ?: "",
            responseMessage = "",
            createdAt = System.currentTimeMillis(),
            updatedAt = System.currentTimeMillis()
        )
        
        val result = bookingRepository.createBooking(booking)
        return result.getOrThrow()
    }
    
    private suspend fun updateInventoryAndSales(updates: List<InventoryUpdate>) {
        for (update in updates) {
            try {
                // Get current product data
                val product = getProductById(update.productId)
                if (product != null) {
                    // Calculate new values
                    val newStockQuantity = (product.stockQuantity - update.quantitySold).coerceAtLeast(0)
                    val newUnitsSold = product.unitsSold + update.quantitySold
                    val newInStock = newStockQuantity > 0
                    
                    // Update product in Firestore
                    val productRef = firestore.collection("products").document(update.productId)
                    val updateData = mapOf(
                        "stockQuantity" to newStockQuantity,
                        "unitsSold" to newUnitsSold,
                        "inStock" to newInStock,
                        "updatedAt" to System.currentTimeMillis()
                    )
                    
                    productRef.update(updateData).await()
                    Log.d("CheckoutService", "Updated inventory for product ${update.productId}: stock=$newStockQuantity, sold=$newUnitsSold")
                    
                    // Also update variant inventory if applicable
                    if (update.variantId != null) {
                        updateVariantInventory(update.productId, update.variantId, update.quantitySold)
                    }
                    
                    if (update.sizeId != null) {
                        updateSizeVariantInventory(update.productId, update.sizeId, update.quantitySold)
                    }
                }
            } catch (e: Exception) {
                Log.e("CheckoutService", "Error updating inventory for product ${update.productId}", e)
                // Continue with other updates even if one fails
            }
        }
    }
    
    private suspend fun getProductById(productId: String): Product? {
        return try {
            val doc = firestore.collection("products").document(productId).get().await()
            doc.toObject(Product::class.java)
        } catch (e: Exception) {
            Log.e("CheckoutService", "Error getting product $productId", e)
            null
        }
    }
    
    private suspend fun getShopOwnerId(shopId: String): String {
        return try {
            val doc = firestore.collection("shops").document(shopId).get().await()
            doc.getString("ownerId") ?: ""
        } catch (e: Exception) {
            Log.e("CheckoutService", "Error getting shop owner for $shopId", e)
            ""
        }
    }
    
    private suspend fun updateVariantInventory(productId: String, variantId: String, quantitySold: Int) {
        try {
            val productRef = firestore.collection("products").document(productId)
            val product = productRef.get().await().toObject(Product::class.java)
            
            if (product != null) {
                val updatedVariants = product.variants.map { variant ->
                    if (variant.id == variantId) {
                        variant.copy(
                            stockQuantity = (variant.stockQuantity - quantitySold).coerceAtLeast(0),
                            isActive = (variant.stockQuantity - quantitySold) > 0
                        )
                    } else {
                        variant
                    }
                }
                
                productRef.update("variants", updatedVariants).await()
            }
        } catch (e: Exception) {
            Log.e("CheckoutService", "Error updating variant inventory", e)
        }
    }
    
    private suspend fun updateSizeVariantInventory(productId: String, sizeId: String, quantitySold: Int) {
        try {
            val productRef = firestore.collection("products").document(productId)
            val product = productRef.get().await().toObject(Product::class.java)
            
            if (product != null) {
                val updatedSizeVariants = product.sizeVariants.map { sizeVariant ->
                    if (sizeVariant.id == sizeId) {
                        sizeVariant.copy(
                            stockQuantity = (sizeVariant.stockQuantity - quantitySold).coerceAtLeast(0),
                            isActive = (sizeVariant.stockQuantity - quantitySold) > 0
                        )
                    } else {
                        sizeVariant
                    }
                }
                
                productRef.update("sizeVariants", updatedSizeVariants).await()
            }
        } catch (e: Exception) {
            Log.e("CheckoutService", "Error updating size variant inventory", e)
        }
    }
}

/**
 * Data class for tracking inventory updates during checkout
 */
data class InventoryUpdate(
    val productId: String,
    val quantitySold: Int,
    val variantId: String? = null,
    val sizeId: String? = null
)

/**
 * Result data class for checkout operations
 */
data class CheckoutResult(
    val success: Boolean,
    val orderIds: List<String> = emptyList(),
    val bookingIds: List<String> = emptyList(),
    val message: String = ""
)
