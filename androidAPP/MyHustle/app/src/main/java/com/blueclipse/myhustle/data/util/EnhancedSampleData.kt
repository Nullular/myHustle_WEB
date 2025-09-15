package com.blueclipse.myhustle.data.util

import android.util.Log
import com.blueclipse.myhustle.data.model.*
import com.blueclipse.myhustle.data.repository.EnhancedShopRepository

/**
 * Enhanced sample data with proper media structure
 * Shows the recommended approach for organizing store assets and catalog information
 */
object EnhancedSampleData {
    
    private val repository = EnhancedShopRepository.instance
    
    /**
     * Upload structured sample data with proper media organization
     */
    suspend fun uploadEnhancedSampleData(): Result<Unit> {
        return try {
            val sampleShops = createEnhancedSampleShops()
            
            Log.d("EnhancedSampleData", "📤 Uploading ${sampleShops.size} enhanced shops...")
            
            for (shop in sampleShops) {
                Log.d("EnhancedSampleData", "🏪 Processing shop: ${shop.name}")
                Log.d("EnhancedSampleData", "  📊 Category: ${shop.category}")
                Log.d("EnhancedSampleData", "  📦 Catalog items: ${shop.catalog.size}")
                
                // In a real app, you'd pass actual URIs for media upload
                // For now, we'll create the shop without uploading media
                // repository.createShop(shop, logoUri, bannerUri, galleryUris, context)
            }
            
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e("EnhancedSampleData", "❌ Failed to upload enhanced sample data", e)
            Result.failure(e)
        }
    }
    
    /**
     * Create enhanced sample shops with proper data structure
     */
    private fun createEnhancedSampleShops(): List<EnhancedShop> = listOf(
        
        // Coffee Shop with rich media and detailed catalog
        EnhancedShop(
            id = "",
            name = "Coffee Corner",
            description = "Artisanal coffee roasted daily with locally sourced beans",
            category = "Food & Beverage",
            rating = 4.5f,
            isFavorite = false,
            address = "123 Main St, Downtown",
            phone = "+1 (555) 123-4567",
            email = "hello@coffeecorner.com",
            website = "www.coffeecorner.com",
            socialMedia = mapOf(
                "instagram" to "@coffeecorner",
                "facebook" to "CoffeeCornerOfficial"
            ),
            availability = listOf("Open Now", "6 AM – 8 PM"),
            verified = true,
            established = "2018",
            totalSales = 1250,
            responseTime = "Usually responds within 1 hour",
            
            // Media assets (URLs would be populated after upload)
            logo = MediaAsset(
                id = "coffee_logo_1",
                url = "https://firebasestorage.googleapis.com/shops/coffee-corner/logo.jpg",
                type = MediaType.IMAGE,
                thumbnailUrl = "https://firebasestorage.googleapis.com/thumbnails/shops/coffee-corner/logo.jpg"
            ),
            banner = MediaAsset(
                id = "coffee_banner_1", 
                url = "https://firebasestorage.googleapis.com/shops/coffee-corner/banner.jpg",
                type = MediaType.IMAGE,
                thumbnailUrl = "https://firebasestorage.googleapis.com/thumbnails/shops/coffee-corner/banner.jpg"
            ),
            
            catalog = listOf(
                // High-end coffee products
                EnhancedCatalogItem(
                    id = "espresso_premium",
                    name = "Premium Espresso Blend",
                    description = "Our signature espresso blend with notes of chocolate and caramel. Roasted daily from Ethiopian and Colombian beans.",
                    isProduct = true,
                    category = "Hot Beverages",
                    price = 4.50,
                    currency = "USD",
                    rating = 4.8f,
                    inStock = true,
                    stockQuantity = 50,
                    tags = listOf("coffee", "espresso", "premium", "hot", "caffeinated"),
                    keywords = listOf("espresso", "coffee", "premium", "blend", "ethiopian", "colombian"),
                    featured = true,
                    
                    primaryImage = MediaAsset(
                        id = "espresso_main",
                        url = "https://firebasestorage.googleapis.com/products/espresso/main.jpg",
                        type = MediaType.IMAGE,
                        thumbnailUrl = "https://firebasestorage.googleapis.com/thumbnails/products/espresso/main.jpg"
                    ),
                    images = listOf(
                        MediaAsset(
                            id = "espresso_brewing",
                            url = "https://firebasestorage.googleapis.com/products/espresso/brewing.jpg",
                            type = MediaType.IMAGE,
                            thumbnailUrl = "https://firebasestorage.googleapis.com/thumbnails/products/espresso/brewing.jpg",
                            tags = listOf("brewing", "process")
                        ),
                        MediaAsset(
                            id = "espresso_beans",
                            url = "https://firebasestorage.googleapis.com/products/espresso/beans.jpg", 
                            type = MediaType.IMAGE,
                            thumbnailUrl = "https://firebasestorage.googleapis.com/thumbnails/products/espresso/beans.jpg",
                            tags = listOf("beans", "raw")
                        )
                    )
                ),
                
                EnhancedCatalogItem(
                    id = "latte_artisan",
                    name = "Artisan Latte",
                    description = "Creamy steamed milk perfectly balanced with our premium espresso, topped with intricate latte art.",
                    isProduct = true,
                    category = "Hot Beverages",
                    price = 5.25,
                    currency = "USD", 
                    rating = 4.6f,
                    inStock = true,
                    stockQuantity = 35,
                    tags = listOf("coffee", "latte", "milk", "hot", "artisan"),
                    keywords = listOf("latte", "coffee", "milk", "steamed", "art"),
                    featured = true,
                    
                    primaryImage = MediaAsset(
                        id = "latte_main",
                        url = "https://firebasestorage.googleapis.com/products/latte/main.jpg",
                        type = MediaType.IMAGE,
                        thumbnailUrl = "https://firebasestorage.googleapis.com/thumbnails/products/latte/main.jpg"
                    )
                ),
                
                // Coffee services
                EnhancedCatalogItem(
                    id = "wedding_catering",
                    name = "Wedding Coffee Service",
                    description = "Full-service coffee bar for your special day. Includes barista, equipment, and premium coffee selection for up to 100 guests.",
                    isProduct = false,
                    category = "Catering Services",
                    price = 850.00,
                    currency = "USD",
                    rating = 4.9f,
                    tags = listOf("catering", "wedding", "service", "barista", "events"),
                    keywords = listOf("wedding", "catering", "coffee", "service", "events", "barista"),
                    featured = true,
                    
                    primaryImage = MediaAsset(
                        id = "wedding_service_main",
                        url = "https://firebasestorage.googleapis.com/services/wedding-catering/main.jpg",
                        type = MediaType.IMAGE,
                        thumbnailUrl = "https://firebasestorage.googleapis.com/thumbnails/services/wedding-catering/main.jpg"
                    ),
                    images = listOf(
                        MediaAsset(
                            id = "wedding_setup",
                            url = "https://firebasestorage.googleapis.com/services/wedding-catering/setup.jpg",
                            type = MediaType.IMAGE,
                            thumbnailUrl = "https://firebasestorage.googleapis.com/thumbnails/services/wedding-catering/setup.jpg",
                            tags = listOf("setup", "equipment")
                        )
                    )
                )
            )
        ),
        
        // Artisan Soap Shop
        EnhancedShop(
            id = "",
            name = "Pure Elements Soap Co.",
            description = "Handcrafted natural soaps using traditional cold-process methods",
            category = "Beauty & Personal Care",
            rating = 4.7f,
            address = "456 Artisan Lane, Arts District",
            phone = "+1 (555) 234-5678",
            email = "contact@pureelements.com",
            verified = true,
            established = "2020",
            
            catalog = listOf(
                EnhancedCatalogItem(
                    id = "lavender_soap_bar",
                    name = "Organic Lavender Soap Bar",
                    description = "Luxurious cold-process soap infused with organic lavender essential oil and dried lavender flowers.",
                    isProduct = true,
                    category = "Bath & Body",
                    price = 12.00,
                    currency = "USD",
                    rating = 4.8f,
                    inStock = true,
                    stockQuantity = 25,
                    tags = listOf("soap", "lavender", "organic", "handmade", "natural"),
                    keywords = listOf("lavender", "soap", "organic", "essential oil", "cold process"),
                    featured = true
                ),
                
                EnhancedCatalogItem(
                    id = "custom_soap_service",
                    name = "Custom Soap Creation",
                    description = "Work with our artisan to create your perfect custom soap blend with your choice of oils, fragrances, and botanicals.",
                    isProduct = false,
                    category = "Custom Services",
                    price = 45.00,
                    currency = "USD",
                    rating = 4.9f,
                    tags = listOf("custom", "service", "consultation", "personalized"),
                    keywords = listOf("custom", "soap", "consultation", "personalized", "artisan")
                )
            )
        )
    )
    
    /**
     * Recommended folder structure for Firebase Storage:
     * 
     * /shops/
     *   ├── {shop-id}/
     *   │   ├── logo/
     *   │   ├── banner/
     *   │   └── gallery/
     * /products/
     *   ├── {product-id}/
     *   │   ├── primary/
     *   │   ├── gallery/
     *   │   ├── videos/
     *   │   └── documents/
     * /services/
     *   ├── {service-id}/
     *   │   ├── primary/
     *   │   ├── gallery/
     *   │   └── videos/
     * /thumbnails/
     *   ├── shops/
     *   ├── products/
     *   └── services/
     * /users/
     *   └── {user-id}/
     *       └── profile/
     */
}
