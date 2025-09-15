package com.blueclipse.myhustle.data.model

/**
 * Represents a review in the MyHustle platform
 */
data class Review(
    val id: String = "",
    val customerId: String = "",
    val shopId: String = "",
    
    // Review Target
    val targetType: ReviewTargetType = ReviewTargetType.SHOP,
    val targetId: String = "",
    val targetName: String = "",
    
    // Review Content
    val rating: Float = 0f,
    val title: String = "",
    val content: String = "",
    
    // Detailed Ratings
    val detailedRatings: DetailedRatings = DetailedRatings(),
    
    // Media
    val imageUrls: List<String> = emptyList(),
    val videoUrls: List<String> = emptyList(),
    
    // Context
    val orderId: String = "",
    val bookingId: String = "",
    val verifiedPurchase: Boolean = false,
    
    // Owner Response
    val ownerResponse: OwnerResponse? = null,
    
    // Helpfulness
    val helpfulVotes: Int = 0,
    val unhelpfulVotes: Int = 0,
    val votedBy: List<String> = emptyList(),
    
    // Moderation
    val visible: Boolean = true,
    val flagged: Boolean = false,
    val moderationStatus: ModerationStatus = ModerationStatus.APPROVED,
    val moderationNotes: String = "",
    
    // Timestamps
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
) {
    constructor() : this(
        "", "", "", ReviewTargetType.SHOP, "", "", 0f, "", "",
        DetailedRatings(), emptyList(), emptyList(), "", "", false,
        null, 0, 0, emptyList(), true, false, ModerationStatus.APPROVED, "",
        System.currentTimeMillis(), System.currentTimeMillis()
    )
}

/**
 * Detailed ratings for services
 */
data class DetailedRatings(
    val quality: Float = 0f,
    val communication: Float = 0f,
    val timeliness: Float = 0f,
    val value: Float = 0f,
    val professionalism: Float = 0f
) {
    constructor() : this(0f, 0f, 0f, 0f, 0f)
}

/**
 * Owner response to review
 */
data class OwnerResponse(
    val content: String = "",
    val respondedAt: Long = System.currentTimeMillis(),
    val ownerId: String = ""
) {
    constructor() : this("", System.currentTimeMillis(), "")
}

/**
 * Review target type enum
 */
enum class ReviewTargetType {
    SHOP,
    PRODUCT,
    SERVICE
}

/**
 * Moderation status enum
 */
enum class ModerationStatus {
    PENDING,
    APPROVED,
    REJECTED
}
