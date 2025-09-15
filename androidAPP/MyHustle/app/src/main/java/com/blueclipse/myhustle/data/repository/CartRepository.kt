package com.blueclipse.myhustle.data.repository

import android.util.Log
import com.blueclipse.myhustle.data.model.*
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Repository class for managing shopping cart operations with Firebase Firestore backend
 * Provides real-time cart state management and persistence
 */
class CartRepository private constructor() {
    
    private val db = Firebase.firestore
    private val auth = FirebaseAuth.getInstance()
    
    // Local cart state
    private val _cartItems = MutableStateFlow<List<CartItem>>(emptyList())
    val cartItems: StateFlow<List<CartItem>> = _cartItems.asStateFlow()
    
    private val _totalPrice = MutableStateFlow(0.0)
    val totalPrice: StateFlow<Double> = _totalPrice.asStateFlow()
    
    private val _itemCount = MutableStateFlow(0)
    val itemCount: StateFlow<Int> = _itemCount.asStateFlow()
    
    init {
        // Load cart from Firestore on initialization
        loadCartFromFirestore()
        
        // Listen for authentication state changes
        auth.addAuthStateListener { firebaseAuth ->
            if (firebaseAuth.currentUser != null) {
                Log.d("CartRepo", "User authenticated, loading cart")
                loadCartFromFirestore()
            } else {
                Log.d("CartRepo", "User not authenticated, clearing cart")
                clearLocalCart()
            }
        }
    }
    
    suspend fun addProduct(
        product: Product,
        quantity: Int = 1,
        selectedVariant: ProductVariant? = null,
        selectedSize: SizeVariant? = null
    ): Result<Unit> {
        return try {
            Log.d("CartRepo", "Adding product: ${product.name} with quantity: $quantity")
            
            val existingItems = _cartItems.value.toMutableList()
            
            // Check if item already exists with same variant/size combo
            val existingItemIndex = existingItems.indexOfFirst { item ->
                item.productId == product.id &&
                item.selectedVariant?.id == selectedVariant?.id &&
                item.selectedSize?.id == selectedSize?.id
            }
            
            if (existingItemIndex >= 0) {
                // Update quantity for existing item
                val existingItem = existingItems[existingItemIndex]
                existingItems[existingItemIndex] = existingItem.copy(
                    quantity = existingItem.quantity + quantity
                )
                Log.d("CartRepo", "Updated existing item quantity: ${existingItems[existingItemIndex].quantity}")
            } else {
                // Add new item
                val newItem = CartItem(
                    id = generateCartItemId(product.id, selectedVariant?.id, selectedSize?.id),
                    productId = product.id,
                    serviceId = null,
                    name = product.name,
                    imageUrl = product.primaryImageUrl,
                    price = getProductPrice(product, selectedVariant, selectedSize),
                    quantity = quantity,
                    shopId = product.shopId,
                    shopName = "Unknown Shop",
                    type = CartItemType.PRODUCT,
                    selectedVariant = selectedVariant,
                    selectedSize = selectedSize,
                    notes = null
                )
                existingItems.add(newItem)
                Log.d("CartRepo", "Added new item: ${newItem.name}")
            }
            
            // Update local state
            _cartItems.value = existingItems
            updateCartTotals()
            
            // Save to Firestore
            saveCartToFirestore()
            
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e("CartRepo", "Error adding product to cart", e)
            Result.failure(e)
        }
    }
    
    suspend fun addService(
        service: Service,
        quantity: Int = 1,
        notes: String? = null
    ): Result<Unit> {
        return try {
            Log.d("CartRepo", "Adding service: ${service.name} with quantity: $quantity")
            
            val existingItems = _cartItems.value.toMutableList()
            
            // Check if service already exists
            val existingItemIndex = existingItems.indexOfFirst { item ->
                item.serviceId == service.id
            }
            
            if (existingItemIndex >= 0) {
                // Update quantity for existing service
                val existingItem = existingItems[existingItemIndex]
                existingItems[existingItemIndex] = existingItem.copy(
                    quantity = existingItem.quantity + quantity,
                    notes = notes ?: existingItem.notes
                )
                Log.d("CartRepo", "Updated existing service quantity: ${existingItems[existingItemIndex].quantity}")
            } else {
                // Add new service
                val newItem = CartItem(
                    id = generateCartItemId(service.id, null, null),
                    productId = null,
                    serviceId = service.id,
                    name = service.name,
                    imageUrl = service.primaryImageUrl,
                    price = service.basePrice,
                    quantity = quantity,
                    shopId = service.shopId,
                    shopName = "Unknown Shop",
                    type = CartItemType.SERVICE,
                    selectedVariant = null,
                    selectedSize = null,
                    notes = notes
                )
                existingItems.add(newItem)
                Log.d("CartRepo", "Added new service: ${newItem.name}")
            }
            
            // Update local state
            _cartItems.value = existingItems
            updateCartTotals()
            
            // Save to Firestore
            saveCartToFirestore()
            
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e("CartRepo", "Error adding service to cart", e)
            Result.failure(e)
        }
    }
    
    suspend fun updateQuantity(itemId: String, quantity: Int): Result<Unit> {
        return try {
            Log.d("CartRepo", "Updating quantity for item: $itemId to $quantity")
            
            val existingItems = _cartItems.value.toMutableList()
            val itemIndex = existingItems.indexOfFirst { it.id == itemId }
            
            if (itemIndex >= 0) {
                if (quantity <= 0) {
                    existingItems.removeAt(itemIndex)
                    Log.d("CartRepo", "Removed item: $itemId")
                } else {
                    existingItems[itemIndex] = existingItems[itemIndex].copy(quantity = quantity)
                    Log.d("CartRepo", "Updated item quantity: $quantity")
                }
                
                _cartItems.value = existingItems
                updateCartTotals()
                saveCartToFirestore()
            }
            
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e("CartRepo", "Error updating quantity", e)
            Result.failure(e)
        }
    }
    
    suspend fun removeItem(itemId: String): Result<Unit> {
        return try {
            Log.d("CartRepo", "Removing item: $itemId")
            
            val existingItems = _cartItems.value.toMutableList()
            val removed = existingItems.removeIf { it.id == itemId }
            
            if (removed) {
                _cartItems.value = existingItems
                updateCartTotals()
                saveCartToFirestore()
                Log.d("CartRepo", "Item removed successfully")
            }
            
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e("CartRepo", "Error removing item", e)
            Result.failure(e)
        }
    }
    
    suspend fun clearCart(): Result<Unit> {
        return try {
            Log.d("CartRepo", "Clearing cart")
            
            _cartItems.value = emptyList()
            updateCartTotals()
            saveCartToFirestore()
            
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e("CartRepo", "Error clearing cart", e)
            Result.failure(e)
        }
    }
    
    private fun updateCartTotals() {
        val items = _cartItems.value
        _totalPrice.value = items.sumOf { it.price * it.quantity }
        _itemCount.value = items.sumOf { it.quantity }
        
        Log.d("CartRepo", "Updated totals - Items: ${_itemCount.value}, Total: $${_totalPrice.value}")
    }
    
    private fun generateCartItemId(
        itemId: String, 
        variantId: String?, 
        sizeId: String?
    ): String {
        return buildString {
            append(itemId)
            if (variantId != null) append("_$variantId")
            if (sizeId != null) append("_$sizeId")
        }
    }
    
    private fun getProductPrice(
        product: Product,
        selectedVariant: ProductVariant?,
        selectedSize: SizeVariant?
    ): Double {
        return when {
            selectedSize != null -> selectedSize.price
            selectedVariant != null -> selectedVariant.price
            else -> product.price
        }
    }
    
    private fun loadCartFromFirestore() {
        try {
            val userId = auth.currentUser?.uid
            if (userId == null) {
                Log.d("CartRepo", "No authenticated user, using empty cart")
                clearLocalCart()
                return
            }
            
            Log.d("CartRepo", "Loading cart for user: $userId")
            
            db.collection("carts")
                .document(userId)
                .get()
                .addOnSuccessListener { document ->
                    if (document.exists()) {
                        try {
                            Log.d("CartRepo", "Cart document found, parsing data")
                            val data = document.data
                            Log.d("CartRepo", "Raw cart data: $data")
                            
                            val cart = document.toObject(Cart::class.java)
                            if (cart != null) {
                                _cartItems.value = cart.items
                                updateCartTotals()
                                Log.d("CartRepo", "Successfully loaded cart with ${cart.items.size} items")
                                Log.d("CartRepo", "Cart items: ${cart.items.map { "${it.name} x${it.quantity}" }}")
                            } else {
                                Log.w("CartRepo", "Failed to parse cart object")
                                clearLocalCart()
                            }
                        } catch (e: Exception) {
                            Log.e("CartRepo", "Error parsing cart data", e)
                            clearLocalCart()
                        }
                    } else {
                        Log.d("CartRepo", "No cart document found in Firestore for user $userId")
                        clearLocalCart()
                    }
                }
                .addOnFailureListener { e ->
                    Log.e("CartRepo", "Error loading cart from Firestore", e)
                    clearLocalCart()
                }
        } catch (e: Exception) {
            Log.e("CartRepo", "Exception loading cart", e)
            clearLocalCart()
        }
    }
    
    /**
     * Manually refresh cart data from Firestore
     * Useful for ensuring cart is synced when app becomes active
     */
    fun refreshCart() {
        Log.d("CartRepo", "Manual cart refresh requested")
        loadCartFromFirestore()
    }
    
    private fun clearLocalCart() {
        _cartItems.value = emptyList()
        updateCartTotals()
        Log.d("CartRepo", "Local cart cleared")
    }
    
    private fun saveCartToFirestore() {
        try {
            val userId = auth.currentUser?.uid
            if (userId == null) {
                Log.w("CartRepo", "Cannot save cart - no authenticated user")
                return
            }
            
            val cartItems = _cartItems.value
            Log.d("CartRepo", "Saving cart with ${cartItems.size} items for user: $userId")
            
            val cart = Cart(
                userId = userId,
                items = cartItems,
                totalAmount = _totalPrice.value,
                itemCount = _itemCount.value,
                updatedAt = System.currentTimeMillis()
            )
            
            db.collection("carts")
                .document(userId)
                .set(cart)
                .addOnSuccessListener {
                    Log.d("CartRepo", "Cart saved to Firestore successfully with ${cartItems.size} items")
                    Log.d("CartRepo", "Saved items: ${cartItems.map { "${it.name} x${it.quantity}" }}")
                }
                .addOnFailureListener { e ->
                    Log.e("CartRepo", "Error saving cart to Firestore", e)
                }
        } catch (e: Exception) {
            Log.e("CartRepo", "Exception saving cart", e)
        }
    }
    
    companion object {
        @Volatile
        private var INSTANCE: CartRepository? = null
        
        val instance: CartRepository
            get() = INSTANCE ?: synchronized(this) {
                INSTANCE ?: CartRepository().also { INSTANCE = it }
            }
    }
}
