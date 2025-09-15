package com.blueclipse.myhustle.data.model

/**
 * Represents a user's favorite item
 */
data class Favorite(
    val id: String = "",
    val userId: String = "",
    
    // Favorite Target
    val targetType: FavoriteTargetType = FavoriteTargetType.SHOP,
    val targetId: String = "",
    val targetName: String = "",
    val targetImageUrl: String = "",
    
    // Context
    val shopId: String = "",
    val shopName: String = "",
    
    // Metadata
    val notes: String = "",
    val tags: List<String> = emptyList(),
    
    // Timestamps
    val createdAt: Long = System.currentTimeMillis()
) {
    constructor() : this(
        "", "", FavoriteTargetType.SHOP, "", "", "", "", "", "", emptyList(),
        System.currentTimeMillis()
    )
}

/**
 * Favorite target type enum
 */
enum class FavoriteTargetType {
    SHOP,
    PRODUCT,
    SERVICE
}
