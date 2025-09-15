package com.blueclipse.myhustle.data.model

/**
 * Represents a notification in the MyHustle platform
 */
data class Notification(
    val id: String = "",
    val userId: String = "",
    
    // Notification Content
    val type: NotificationType = NotificationType.SYSTEM,
    val title: String = "",
    val message: String = "",
    
    // Rich Content
    val imageUrl: String = "",
    val iconType: String = "",
    
    // Context
    val relatedId: String = "",
    val relatedType: String = "",
    
    // Action
    val actionUrl: String = "",
    val actionLabel: String = "",
    
    // Targeting
    val audience: NotificationAudience = NotificationAudience.ALL,
    val priority: NotificationPriority = NotificationPriority.NORMAL,
    
    // Delivery
    val channels: List<String> = emptyList(),
    val sentChannels: List<String> = emptyList(),
    val deliveryStatus: DeliveryStatus = DeliveryStatus(),
    
    // Status
    val isRead: Boolean = false,
    val readAt: Long = 0,
    val isActionTaken: Boolean = false,
    val actionTakenAt: Long = 0,
    
    // Timestamps
    val createdAt: Long = System.currentTimeMillis(),
    val expiresAt: Long = 0
) {
    constructor() : this(
        "", "", NotificationType.SYSTEM, "", "", "", "", "", "", "", "",
        NotificationAudience.ALL, NotificationPriority.NORMAL, emptyList(), emptyList(),
        DeliveryStatus(), false, 0, false, 0, System.currentTimeMillis(), 0
    )
}

/**
 * Delivery status for different channels
 */
data class DeliveryStatus(
    val push: String = "PENDING",
    val email: String = "PENDING",
    val sms: String = "PENDING"
) {
    constructor() : this("PENDING", "PENDING", "PENDING")
}

/**
 * Notification type enum
 */
enum class NotificationType {
    ORDER_UPDATE,
    BOOKING_UPDATE,
    NEW_MESSAGE,
    REVIEW_RECEIVED,
    PAYMENT_RECEIVED,
    SHOP_UPDATE,
    SYSTEM,
    PROMOTIONAL
}

/**
 * Notification audience enum
 */
enum class NotificationAudience {
    CUSTOMER,
    BUSINESS_OWNER,
    ALL
}

/**
 * Notification priority enum
 */
enum class NotificationPriority {
    LOW,
    NORMAL,
    HIGH,
    URGENT
}
