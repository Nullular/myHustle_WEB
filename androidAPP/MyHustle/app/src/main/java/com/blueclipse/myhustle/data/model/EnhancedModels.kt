package com.blueclipse.myhustle.data.model

/**
 * Enhanced data models for media-rich e-commerce
 */

// Media asset representation
data class MediaAsset(
    val id: String = "",
    val url: String = "",                    // Firebase Storage URL
    val type: MediaType = MediaType.IMAGE,
    val thumbnailUrl: String = "",           // Optimized thumbnail
    val size: Long = 0,                      // File size in bytes
    val width: Int = 0,                      // Image dimensions
    val height: Int = 0,
    val uploadedAt: Long = System.currentTimeMillis(),
    val tags: List<String> = emptyList()     // For categorization/search
)

enum class MediaType {
    IMAGE, VIDEO, DOCUMENT, AUDIO
}

// Enhanced CatalogItem with rich media support
data class EnhancedCatalogItem(
    val id: String = "",
    val name: String = "",
    val description: String = "",
    val isProduct: Boolean = false,
    val rating: Float = 0f,
    
    // Rich media support
    val primaryImage: MediaAsset? = null,              // Main product image
    val images: List<MediaAsset> = emptyList(),        // Gallery images
    val videos: List<MediaAsset> = emptyList(),        // Product videos
    val documents: List<MediaAsset> = emptyList(),     // PDFs, manuals, etc.
    
    // E-commerce specific
    val price: Double = 0.0,
    val currency: String = "USD",
    val category: String = "",
    val tags: List<String> = emptyList(),
    val inStock: Boolean = true,
    val stockQuantity: Int = 0,
    
    // SEO and discovery
    val keywords: List<String> = emptyList(),
    val featured: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

// Enhanced Shop with better media management
data class EnhancedShop(
    val id: String = "",
    val name: String = "",
    val description: String = "",
    val rating: Float = 0f,
    val isFavorite: Boolean = false,
    val availability: List<String> = emptyList(),
    
    // Rich media
    val logo: MediaAsset? = null,
    val banner: MediaAsset? = null,
    val gallery: List<MediaAsset> = emptyList(),
    
    // Business info
    val category: String = "",
    val address: String = "",
    val phone: String = "",
    val email: String = "",
    val website: String = "",
    val socialMedia: Map<String, String> = emptyMap(), // platform -> URL
    
    // Catalog
    val catalog: List<EnhancedCatalogItem> = emptyList(),
    
    // Business metrics
    val verified: Boolean = false,
    val established: String = "",
    val totalSales: Int = 0,
    val responseTime: String = ""
)
