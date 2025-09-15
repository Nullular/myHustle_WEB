package com.blueclipse.myhustle.data.model

data class CartItem(
    val id: String = "",
    val productId: String? = null, // For products
    val serviceId: String? = null, // For services
    val name: String = "",
    val imageUrl: String = "",
    val price: Double = 0.0,
    val quantity: Int = 0,
    val shopId: String = "",
    val shopName: String = "",
    val type: CartItemType = CartItemType.PRODUCT,
    val selectedVariant: ProductVariant? = null, // For product variants
    val selectedSize: SizeVariant? = null, // For size variants
    val notes: String? = null // For services or special requests
)

enum class CartItemType {
    PRODUCT,
    SERVICE
}

data class Cart(
    val userId: String = "",
    val items: List<CartItem> = emptyList(),
    val totalAmount: Double = 0.0,
    val itemCount: Int = 0,
    val updatedAt: Long = 0L
)
