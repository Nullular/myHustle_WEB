package com.blueclipse.myhustle.data.model

/**
 * Represents a product in the MyHustle platform
 */
data class Product(
    val id: String = "",
    val shopId: String = "",
    val ownerId: String = "",
    val name: String = "",
    val description: String = "",
    val primaryImageUrl: String = "",
    val imageUrls: List<String> = emptyList(),
    val price: Double = 0.0,
    val currency: String = "USD",
    val category: String = "",
    val inStock: Boolean = true,
    val stockQuantity: Int = 0,
    val unitsSold: Int = 0,
    val expensePerUnit: Double = 0.0,
    val rating: Float = 0f,
    val totalReviews: Int = 0,
    val isActive: Boolean = true,
    val isFeatured: Boolean = false,
    val tags: List<String> = emptyList(),
    val specifications: Map<String, String> = emptyMap(),
    val weight: Double = 0.0,
    val dimensions: ProductDimensions = ProductDimensions(),
    val variants: List<ProductVariant> = emptyList(),
    val sizeVariants: List<SizeVariant> = emptyList(),
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
) {
    constructor() : this(
        "", "", "", "", "", "", emptyList(), 0.0, "USD", "", true, 0, 0, 0.0, 0f, 0, 
        true, false, emptyList(), emptyMap(), 0.0, ProductDimensions(), 
        emptyList(), emptyList(), 
        System.currentTimeMillis(), System.currentTimeMillis()
    )
}

/**
 * Represents a product variant (e.g., color, material, style)
 */
data class ProductVariant(
    val id: String = "",
    val name: String = "",
    val value: String = "",
    val price: Double = 0.0,
    val imageUrl: String = "",
    val stockQuantity: Int = 0,
    val isActive: Boolean = true
) {
    constructor() : this("", "", "", 0.0, "", 0, true)
}

/**
 * Represents a size variant for products
 */
data class SizeVariant(
    val id: String = "",
    val size: String = "",
    val price: Double = 0.0,
    val stockQuantity: Int = 0,
    val isActive: Boolean = true
) {
    constructor() : this("", "", 0.0, 0, true)
}

/**
 * Product dimensions
 */
data class ProductDimensions(
    val length: Double = 0.0,
    val width: Double = 0.0,
    val height: Double = 0.0,
    val unit: String = "cm"
) {
    constructor() : this(0.0, 0.0, 0.0, "cm")
}
