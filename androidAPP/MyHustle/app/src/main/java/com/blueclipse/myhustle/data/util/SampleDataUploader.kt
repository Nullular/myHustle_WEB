package com.blueclipse.myhustle.data.util

import android.util.Log
import com.blueclipse.myhustle.data.model.CatalogItem
import com.blueclipse.myhustle.data.model.Shop
import com.blueclipse.myhustle.data.repository.FirebaseShopRepository

/**
 * Utility class to upload sample data to Firebase.
 * Call this once to populate your Firestore database with initial data.
 */
object SampleDataUploader {
    
    private val repository = FirebaseShopRepository.instance
    
    /**
     * Upload sample shops to Firebase.
     * Call this method once when you want to initialize your database.
     */
    suspend fun uploadSampleData(ownerId: String = ""): Result<Unit> {
        return try {
            val sampleShops = createSampleShops(ownerId)
            
            Log.d("SampleDataUploader", "📤 Uploading ${sampleShops.size} shops to Firebase...")
            if (ownerId.isNotEmpty()) {
                Log.d("SampleDataUploader", "👑 Setting owner ID: $ownerId for all shops")
            }
            
            for (shop in sampleShops) {
                Log.d("SampleDataUploader", "🏪 Uploading shop: ${shop.name}")
                for (item in shop.catalog) {
                    Log.d("SampleDataUploader", "  📦 Item: ${item.name}, isProduct: ${item.isProduct}")
                }
                val result = repository.addShop(shop)
                if (result.isSuccess) {
                    Log.d("SampleDataUploader", "✅ Successfully uploaded: ${shop.name}")
                } else {
                    Log.e("SampleDataUploader", "❌ Failed to upload: ${shop.name}", result.exceptionOrNull())
                }
            }
            
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e("SampleDataUploader", "💥 Error during upload", e)
            Result.failure(e)
        }
    }
    
    private fun createSampleShops(ownerId: String = ""): List<Shop> = listOf(
        Shop(
            id           = "", // Firebase will generate this
            name         = "Coffee Corner",
            description  = "Best coffee in town with freshly roasted beans and artisan pastries",
            ownerId      = ownerId, // Set the owner
            logoUrl      = "file:///android_asset/shop_assets/coffee corner/store_assets/logo/logo.jpg",
            bannerUrl    = "file:///android_asset/shop_assets/coffee corner/store_assets/banner/banner.jpg",
            rating       = 4.5,
            isFavorite   = false,
            availability = "Open Now, 6 AM – 8 PM",
            catalog      = listOf(
                // PRODUCTS (physical items you can buy)
                CatalogItem(
                    id          = "c1",
                    name        = "Espresso",
                    imageUrl    = "file:///android_asset/shop_assets/coffee corner/store_assets/catalog/espresso.jpeg",
                    description = "A short, strong coffee brewed by forcing hot water through finely ground beans.",
                    isProduct   = true, // PRODUCT - you can buy this
                    rating      = 4.8f
                ),
                CatalogItem(
                    id          = "c2",
                    name        = "Latte",
                    imageUrl    = "file:///android_asset/shop_assets/coffee corner/store_assets/catalog/latte.jpg",
                    description = "Espresso with steamed milk, topped with a light layer of foam.",
                    isProduct   = true, // PRODUCT - you can buy this
                    rating      = 4.6f
                ),
                // SERVICES (things they do for you)
                CatalogItem(
                    id          = "s1",
                    name        = "Wedding Catering",
                    imageUrl    = "file:///android_asset/shop_assets/coffee corner/store_assets/catalog/wedding_catering.jpg",
                    description = "Full-service coffee catering for weddings & special events.",
                    isProduct   = false, // SERVICE - they provide this service
                    rating      = 4.8f
                ),
                CatalogItem(
                    id          = "s2",
                    name        = "Home Delivery",
                    imageUrl    = "https://example.com/delivery.png",
                    description = "Get your favorite brews delivered hot to your doorstep.",
                    isProduct   = false, // SERVICE - they provide this service
                    rating      = 4.3f
                )
            )
        ),
        Shop(
            id           = "", // Firebase will generate this
            name         = "Artisan Soaps",
            description  = "Natural, handcrafted soaps made with organic ingredients",
            ownerId      = ownerId, // Set the owner
            logoUrl      = "file:///android_asset/shop_assets/artisan soaps/store_assets/logo/logo.webp",
            bannerUrl    = "file:///android_asset/shop_assets/artisan soaps/store_assets/banner/banner.jpg",
            rating       = 4.7,
            isFavorite   = false,
            availability = "Open Now, 10 AM – 7 PM",
            catalog      = listOf(
                // PRODUCTS (physical items you can buy)
                CatalogItem(
                    id          = "c3",
                    name        = "Lavender Bar",
                    imageUrl    = "file:///android_asset/shop_assets/artisan soaps/store_assets/catalog/lavendar_bar.webp",
                    description = "Relaxing lavender-scented cold-process soap with organic oils.",
                    isProduct   = true, // PRODUCT - physical soap bar
                    rating      = 4.9f
                ),
                // SERVICES (things they do for you)
                CatalogItem(
                    id          = "s3",
                    name        = "Custom Scent Soap",
                    imageUrl    = "file:///android_asset/shop_assets/artisan soaps/store_assets/catalog/custom_soaps.webp",
                    description = "Choose your own blend of fragrance oils for a unique soap bar.",
                    isProduct   = false, // SERVICE - custom creation service
                    rating      = 4.8f
                )
            )
        ),
        Shop(
            id           = "", // Firebase will generate this
            name         = "Tech Repairs",
            description  = "Professional phone and laptop repair services with warranty",
            ownerId      = ownerId, // Set the owner
            logoUrl      = "file:///android_asset/shop_assets/tech repairs/store_assets/logo/logo.png",
            bannerUrl    = "file:///android_asset/shop_assets/tech repairs/store_assets/banner/banner.webp",
            rating       = 4.8,
            isFavorite   = false,
            availability = "Open Now, 8 AM – 8 PM",
            catalog      = listOf(
                // SERVICES (things they do for you)
                CatalogItem(
                    id          = "c4",
                    name        = "Screen Repair",
                    imageUrl    = "file:///android_asset/shop_assets/tech repairs/store_assets/catalog/screen_repair.jpg",
                    description = "Professional screen replacement for all phone models with genuine parts.",
                    isProduct   = false, // SERVICE - repair service
                    rating      = 4.9f
                ),
                // PRODUCTS (physical items you can buy)
                CatalogItem(
                    id          = "c5",
                    name        = "Battery Replacement",
                    imageUrl    = "file:///android_asset/shop_assets/tech repairs/store_assets/catalog/battery_replacement.jpg",
                    description = "Original quality batteries with 1-year warranty and installation.",
                    isProduct   = true, // PRODUCT - physical battery
                    rating      = 4.7f
                )
            )
        )
    )
}
