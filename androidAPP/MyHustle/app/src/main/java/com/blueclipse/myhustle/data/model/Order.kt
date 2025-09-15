package com.blueclipse.myhustle.data.model

/**
 * Represents an order in the MyHustle platform
 */
data class Order(
    val id: String = "",
    val orderNumber: String = "",
    val customerId: String = "",
    val shopId: String = "",
    val ownerId: String = "",
    
    // Order Items
    val items: List<OrderItem> = emptyList(),
    
    // Pricing
    val subtotal: Double = 0.0,
    val tax: Double = 0.0,
    val taxRate: Double = 0.0,
    val shippingFee: Double = 0.0,
    val deliveryFee: Double = 0.0,
    val serviceFee: Double = 0.0,
    val discount: Double = 0.0,
    val discountCode: String = "",
    val total: Double = 0.0,
    val currency: String = "USD",
    
    // Status
    val status: OrderStatus = OrderStatus.PENDING,
    val paymentStatus: PaymentStatus = PaymentStatus.PENDING,
    val fulfillmentStatus: FulfillmentStatus = FulfillmentStatus.PENDING,
    
    // Customer Info
    val customerInfo: CustomerInfo = CustomerInfo(),
    
    // Shipping
    val shippingMethod: ShippingMethod = ShippingMethod.PICKUP,
    val shippingAddress: ShippingAddress = ShippingAddress(),
    val trackingNumber: String = "",
    val carrier: String = "",
    val estimatedDelivery: Long = 0,
    
    // Payment
    val paymentMethod: String = "",
    val paymentReference: String = "",
    
    // Notes
    val customerNotes: String = "",
    val internalNotes: String = "",
    
    // Timestamps
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val confirmedAt: Long = 0,
    val shippedAt: Long = 0,
    val deliveredAt: Long = 0,
    val cancelledAt: Long = 0
) {
    constructor() : this(
        "", "", "", "", "", emptyList(), 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, "", 0.0, "USD",
        OrderStatus.PENDING, PaymentStatus.PENDING, FulfillmentStatus.PENDING,
        CustomerInfo(), ShippingMethod.PICKUP, ShippingAddress(), "", "", 0,
        "", "", "", "", System.currentTimeMillis(), System.currentTimeMillis(), 0, 0, 0, 0
    )
}

/**
 * Order item details
 */
data class OrderItem(
    val productId: String = "",
    val name: String = "",
    val sku: String = "",
    val price: Double = 0.0,
    val quantity: Int = 1,
    val imageUrl: String = "",
    val variantId: String = "",
    val variantName: String = "",
    val specifications: Map<String, String> = emptyMap()
) {
    constructor() : this("", "", "", 0.0, 1, "", "", "", emptyMap())
}

/**
 * Customer information for orders
 */
data class CustomerInfo(
    val name: String = "",
    val email: String = "",
    val phone: String = ""
) {
    constructor() : this("", "", "")
}

/**
 * Shipping address information
 */
data class ShippingAddress(
    val recipientName: String = "",
    val street: String = "",
    val city: String = "",
    val state: String = "",
    val zipCode: String = "",
    val country: String = "",
    val phone: String = "",
    val instructions: String = ""
) {
    constructor() : this("", "", "", "", "", "", "", "")
}

/**
 * Order status enum
 */
enum class OrderStatus {
    PENDING,
    CONFIRMED,
    PREPARING,
    READY,
    SHIPPED,
    DELIVERED,
    CANCELLED,
    REFUNDED
}

/**
 * Payment status enum
 */
enum class PaymentStatus {
    PENDING,
    PAID,
    FAILED,
    REFUNDED,
    PARTIAL_REFUND
}

/**
 * Fulfillment status enum
 */
enum class FulfillmentStatus {
    PENDING,
    PROCESSING,
    SHIPPED,
    DELIVERED
}

/**
 * Shipping method enum
 */
enum class ShippingMethod {
    PICKUP,
    DELIVERY,
    SHIPPING
}
