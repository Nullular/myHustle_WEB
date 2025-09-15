package com.blueclipse.myhustle.data.model

import com.google.firebase.firestore.PropertyName
import com.google.firebase.Timestamp

/**
 * Shop data class representing a business/store in the marketplace
 */
data class Shop(
    val id: String = "",
    val name: String = "",
    val description: String = "",
    val ownerId: String = "",
    val category: String = "",
    val location: String = "",
    val address: String = "",
    val phone: String = "",
    val email: String = "",
    val website: String = "",
    val imageUrl: String = "",
    val coverImageUrl: String = "",
    val logoUrl: String = "",
    val bannerUrl: String = "",
    val rating: Double = 0.0,
    val totalReviews: Int = 0,
    val isVerified: Boolean = false,
    val isPremium: Boolean = false,
    @PropertyName("active")
    val isActive: Boolean = true,
    val availability: String = "Available",
    // 24h operating window for daily hours, format "HH:mm" (supports "24:00" for end-of-day)
    @get:PropertyName("openTime24") @set:PropertyName("openTime24")
    var openTime24: String = "08:00",
    @get:PropertyName("closeTime24") @set:PropertyName("closeTime24")
    var closeTime24: String = "18:00",
    val responseTime: String = "Within 24 hours",
    val operatingHours: Map<String, String> = emptyMap(),
    val socialMedia: Map<String, String> = emptyMap(),
    val tags: List<String> = emptyList(),
    val specialties: List<String> = emptyList(),
    val priceRange: String = "$$",
    val deliveryOptions: List<String> = emptyList(),
    val paymentMethods: List<String> = emptyList(),
    val catalog: List<CatalogItem> = emptyList(),
    @PropertyName("created_at")
    val createdAt: Timestamp = Timestamp.now(),
    @PropertyName("updated_at")
    val updatedAt: Timestamp = Timestamp.now(),
    var isFavorite: Boolean = false,
    val featured: Boolean = false
) {
    constructor() : this(
        id = "",
        name = "",
        description = "",
        ownerId = "",
        category = "",
        location = "",
        address = "",
        phone = "",
        email = "",
        website = "",
        imageUrl = "",
        coverImageUrl = "",
        logoUrl = "",
        bannerUrl = "",
        rating = 0.0,
        totalReviews = 0,
        isVerified = false,
        isPremium = false,
        isActive = true,
    availability = "Available",
    openTime24 = "08:00",
    closeTime24 = "18:00",
        responseTime = "Within 24 hours",
        operatingHours = emptyMap(),
        socialMedia = emptyMap(),
        tags = emptyList(),
        specialties = emptyList(),
        priceRange = "$$",
        deliveryOptions = emptyList(),
        paymentMethods = emptyList(),
        catalog = emptyList(),
        createdAt = Timestamp.now(),
        updatedAt = Timestamp.now(),
        isFavorite = false
    )
}
