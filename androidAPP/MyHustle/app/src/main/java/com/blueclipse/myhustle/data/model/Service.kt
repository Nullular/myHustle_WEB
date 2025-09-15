package com.blueclipse.myhustle.data.model

/**
 * Represents a service in the MyHustle platform
 */
data class Service(
    val id: String = "",
    val shopId: String = "",
    val ownerId: String = "",
    val name: String = "",
    val description: String = "",
    val primaryImageUrl: String = "",
    val imageUrls: List<String> = emptyList(),
    val basePrice: Double = 0.0,
    val currency: String = "USD",
    val category: String = "",
    val estimatedDuration: Int = 60, // minutes
    val isBookable: Boolean = true,
    val allowsMultiDayBooking: Boolean = false,
    val expensePerUnit: Double = 0.0,
    val rating: Float = 0f,
    val totalReviews: Int = 0,
    val isActive: Boolean = true,
    val isFeatured: Boolean = false,
    val tags: List<String> = emptyList(),
    val requirements: List<String> = emptyList(),
    val includes: List<String> = emptyList(),
    val availability: ServiceAvailability = ServiceAvailability(),
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
) {
    constructor() : this(
        "", "", "", "", "", "", emptyList(), 0.0, "USD", "", 60, true, false, 0.0, 0f, 0,
        true, false, emptyList(), emptyList(), emptyList(), ServiceAvailability(),
        System.currentTimeMillis(), System.currentTimeMillis()
    )
}

/**
 * Service availability settings
 */
data class ServiceAvailability(
    val daysAvailable: List<String> = listOf("Monday", "Tuesday", "Wednesday", "Thursday", "Friday"),
    val startTime: String = "09:00",
    val endTime: String = "17:00",
    val timeSlotDuration: Int = 60, // minutes
    val advanceBookingDays: Int = 30,
    val cancellationPolicy: String = "24 hours advance notice required"
) {
    constructor() : this(
        listOf("Monday", "Tuesday", "Wednesday", "Thursday", "Friday"),
        "09:00", "17:00", 60, 30, "24 hours advance notice required"
    )
}
