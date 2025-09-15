package com.blueclipse.myhustle.data.model

/**
 * Represents a booking request in the MyHustle platform
 */
data class Booking(
    val id: String = "",
    val customerId: String = "",           // Who made the booking
    val shopId: String = "",               // Which shop it's for
    val shopOwnerId: String = "",          // Owner of the shop (for queries)
    val serviceId: String = "",            // Which service was booked
    val serviceName: String = "",          // Service name for display
    val shopName: String = "",             // Shop name for display
    val customerName: String = "",         // Customer name for display
    val customerEmail: String = "",        // Customer email for contact
    val requestedDate: String = "",        // Requested booking date
    val requestedTime: String = "",        // Requested booking time
    val status: BookingStatus = BookingStatus.PENDING,
    val notes: String = "",                // Customer notes
    val responseMessage: String = "",      // Shop owner response
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
) {
    constructor() : this("", "", "", "", "", "", "", "", "", "", "", BookingStatus.PENDING, "", "", 0L, 0L)
}

/**
 * Status of a booking request
 */
enum class BookingStatus {
    PENDING,     // Awaiting shop owner response
    ACCEPTED,    // Shop owner accepted
    DENIED,      // Shop owner denied
    MODIFIED,    // Shop owner proposed different time/date
    COMPLETED,   // Service completed
    CANCELLED    // Cancelled by customer or shop
}

/**
 * Service definition for bookings
 */
data class BookingService(
    val id: String = "",
    val shopId: String = "",
    val name: String = "",
    val description: String = "",
    val duration: Int = 60,              // Duration in minutes
    val price: Double = 0.0,             // Service price
    val isActive: Boolean = true,        // Whether service is available for booking
    val availableDays: List<String> = emptyList(), // Days available (e.g., ["Monday", "Tuesday"])
    val availableHours: List<String> = emptyList() // Hours available (e.g., ["9:00", "10:00"])
) {
    constructor() : this("", "", "", "", 60, 0.0, true, emptyList(), emptyList())
}
