// app/src/main/java/com/example/myhustle/utils/SampleDataPopulator.kt
package com.blueclipse.myhustle.utils

import android.util.Log
import com.blueclipse.myhustle.data.model.*
import com.blueclipse.myhustle.data.repository.*
import kotlinx.coroutines.delay

class SampleDataPopulator(
    private val shopRepository: FirebaseShopRepository,
    private val productRepository: ProductRepository,
    private val serviceRepository: ServiceRepository
) {
    
    suspend fun populateSampleData(): Result<Unit> {
        return try {
            Log.d("SampleDataPopulator", "Starting sample data population...")
            
            // Create sample shops first
            val sampleShops = createSampleShops()
            
            for (shop in sampleShops) {
                Log.d("SampleDataPopulator", "Creating shop: ${shop.name}")
                
                // Create the shop
                val shopResult = shopRepository.addShop(shop)
                if (shopResult.isFailure) {
                    Log.e("SampleDataPopulator", "Failed to create shop ${shop.name}: ${shopResult.exceptionOrNull()}")
                    continue
                }
                
                val shopId = shopResult.getOrNull()
                if (shopId == null) {
                    Log.e("SampleDataPopulator", "Created shop has null ID")
                    continue
                }
                
                // Add products for this shop
                val products = getProductsForShop(shop.name, shopId)
                for (product in products) {
                    val productResult = productRepository.createProduct(product)
                    if (productResult.isFailure) {
                        Log.e("SampleDataPopulator", "Failed to add product ${product.name}: ${productResult.exceptionOrNull()}")
                    } else {
                        Log.d("SampleDataPopulator", "Added product: ${product.name}")
                    }
                    delay(100) // Small delay to avoid overwhelming Firestore
                }
                
                // Add services for this shop
                val services = getServicesForShop(shop.name, shopId)
                for (service in services) {
                    val serviceResult = serviceRepository.createService(service)
                    if (serviceResult.isFailure) {
                        Log.e("SampleDataPopulator", "Failed to add service ${service.name}: ${serviceResult.exceptionOrNull()}")
                    } else {
                        Log.d("SampleDataPopulator", "Added service: ${service.name}")
                    }
                    delay(100) // Small delay to avoid overwhelming Firestore
                }
                
                delay(500) // Delay between shops
            }
            
            Log.d("SampleDataPopulator", "Sample data population completed successfully!")
            Result.success(Unit)
            
        } catch (e: Exception) {
            Log.e("SampleDataPopulator", "Error populating sample data", e)
            Result.failure(e)
        }
    }
    
    private fun createSampleShops(): List<Shop> {
        return listOf(
            Shop(
                name = "Coffee Corner",
                description = "Artisanal coffee and fresh pastries in a cozy atmosphere. We source our beans directly from sustainable farms and roast them in-house daily.",
                category = "Food & Beverage",
                location = "Downtown Business District",
                imageUrl = "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800",
                rating = 4.6,
                isActive = true,
                ownerId = "sample_owner_coffee",
                openTime24 = "06:00",
                closeTime24 = "20:00",
                availability = "", // Deprecated field
                tags = listOf("Coffee", "Pastries", "Breakfast", "Cozy", "Artisanal"),
                socialMedia = mapOf(
                    "phone" to "+1 (555) 123-4567",
                    "email" to "hello@coffeecorner.com"
                )
            ),
            Shop(
                name = "TechFix Pro",
                description = "Professional device repair services with same-day turnaround. Specializing in smartphones, laptops, tablets, and gaming consoles with certified technicians.",
                category = "Technology",
                location = "Tech Hub Plaza",
                imageUrl = "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800",
                rating = 4.8,
                isActive = true,
                ownerId = "sample_owner_tech",
                openTime24 = "09:00",
                closeTime24 = "19:00",
                availability = "", // Deprecated field
                tags = listOf("Repair", "Electronics", "Fast Service", "Certified", "Warranty"),
                socialMedia = mapOf(
                    "phone" to "+1 (555) 234-5678",
                    "email" to "support@techfixpro.com"
                )
            ),
            Shop(
                name = "Artisan Soap Co",
                description = "Handcrafted natural soaps and skincare products made with organic ingredients. Each product is carefully crafted in small batches for quality and freshness.",
                category = "Beauty & Wellness",
                location = "Artisan Market Square",
                imageUrl = "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800",
                rating = 4.7,
                isActive = true,
                ownerId = "sample_owner_soap",
                openTime24 = "10:00",
                closeTime24 = "18:00",
                availability = "", // Deprecated field
                tags = listOf("Natural", "Organic", "Handmade", "Skincare", "Eco-friendly"),
                socialMedia = mapOf(
                    "phone" to "+1 (555) 345-6789",
                    "email" to "contact@artisansoapco.com"
                )
            )
        )
    }
    
    private fun getProductsForShop(shopName: String, shopId: String): List<Product> {
        return when (shopName) {
            "Coffee Corner" -> listOf(
                Product(
                    name = "Signature Blend Coffee",
                    description = "Our house special blend with notes of chocolate and caramel. Medium roast.",
                    price = 12.99,
                    category = "Coffee",
                    primaryImageUrl = "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400",
                    shopId = shopId,
                    isActive = true,
                    tags = listOf("Coffee", "Medium Roast", "Signature", "Chocolate Notes")
                ),
                Product(
                    name = "Fresh Croissant",
                    description = "Buttery, flaky croissant baked fresh daily. Perfect with your morning coffee.",
                    price = 3.50,
                    category = "Pastry",
                    primaryImageUrl = "https://images.unsplash.com/photo-1555507036-ab794f1fe65d?w=400",
                    shopId = shopId,
                    isActive = true,
                    tags = listOf("Pastry", "Fresh", "Buttery", "Morning")
                ),
                Product(
                    name = "Espresso Beans",
                    description = "Premium espresso beans for home brewing. Dark roast with rich, bold flavor.",
                    price = 18.99,
                    category = "Coffee",
                    primaryImageUrl = "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400",
                    shopId = shopId,
                    isActive = true,
                    tags = listOf("Coffee", "Dark Roast", "Espresso", "Premium")
                ),
                Product(
                    name = "Blueberry Muffin",
                    description = "Moist blueberry muffin with fresh berries and a hint of lemon zest.",
                    price = 4.25,
                    category = "Pastry",
                    primaryImageUrl = "https://images.unsplash.com/photo-1506459225024-1428097a7e18?w=400",
                    shopId = shopId,
                    isActive = true,
                    tags = listOf("Muffin", "Blueberry", "Fresh Berries", "Lemon")
                ),
                Product(
                    name = "Travel Mug",
                    description = "Insulated travel mug with Coffee Corner logo. Keeps drinks hot for hours.",
                    price = 15.99,
                    category = "Merchandise",
                    primaryImageUrl = "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400",
                    shopId = shopId,
                    isActive = true,
                    tags = listOf("Mug", "Travel", "Insulated", "Merchandise")
                )
            )
            "TechFix Pro" -> listOf(
                Product(
                    name = "Phone Screen Protector",
                    description = "Tempered glass screen protector with 9H hardness. Fits most smartphone models.",
                    price = 19.99,
                    category = "Accessories",
                    primaryImageUrl = "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=400",
                    shopId = shopId,
                    isActive = true,
                    tags = listOf("Screen Protector", "Tempered Glass", "Protection", "Smartphone")
                ),
                Product(
                    name = "USB-C Cable",
                    description = "High-quality USB-C charging cable with fast charging support. 6-foot length.",
                    price = 12.99,
                    category = "Cables",
                    primaryImageUrl = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
                    shopId = shopId,
                    isActive = true,
                    tags = listOf("Cable", "USB-C", "Fast Charging", "6 Feet")
                ),
                Product(
                    name = "Laptop Cooling Pad",
                    description = "Adjustable laptop cooling pad with dual fans. Prevents overheating during intensive use.",
                    price = 34.99,
                    category = "Accessories",
                    primaryImageUrl = "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400",
                    shopId = shopId,
                    isActive = true,
                    tags = listOf("Cooling Pad", "Laptop", "Dual Fans", "Adjustable")
                ),
                Product(
                    name = "Wireless Mouse",
                    description = "Ergonomic wireless mouse with precision tracking. Long battery life.",
                    price = 24.99,
                    category = "Accessories",
                    primaryImageUrl = "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
                    shopId = shopId,
                    isActive = true,
                    tags = listOf("Mouse", "Wireless", "Ergonomic", "Long Battery")
                ),
                Product(
                    name = "Phone Case",
                    description = "Durable phone case with shock absorption. Available for multiple phone models.",
                    price = 16.99,
                    category = "Cases",
                    primaryImageUrl = "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400",
                    shopId = shopId,
                    isActive = true,
                    tags = listOf("Phone Case", "Durable", "Shock Absorption", "Protection")
                )
            )
            "Artisan Soap Co" -> listOf(
                Product(
                    name = "Lavender Soap Bar",
                    description = "Handmade soap with organic lavender oil. Calming and moisturizing properties.",
                    price = 8.99,
                    category = "Soap",
                    primaryImageUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
                    shopId = shopId,
                    isActive = true,
                    tags = listOf("Soap", "Lavender", "Organic", "Handmade", "Calming")
                ),
                Product(
                    name = "Shea Butter Lotion",
                    description = "Rich moisturizing lotion with pure shea butter. Perfect for dry skin.",
                    price = 14.99,
                    category = "Skincare",
                    primaryImageUrl = "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400",
                    shopId = shopId,
                    isActive = true,
                    tags = listOf("Lotion", "Shea Butter", "Moisturizing", "Dry Skin")
                ),
                Product(
                    name = "Eucalyptus Body Wash",
                    description = "Invigorating body wash with eucalyptus essential oil. Refreshing and cleansing.",
                    price = 11.99,
                    category = "Body Care",
                    primaryImageUrl = "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400",
                    shopId = shopId,
                    isActive = true,
                    tags = listOf("Body Wash", "Eucalyptus", "Invigorating", "Essential Oil")
                ),
                Product(
                    name = "Honey Oat Scrub",
                    description = "Gentle exfoliating scrub with natural honey and oats. Removes dead skin cells.",
                    price = 13.99,
                    category = "Skincare",
                    primaryImageUrl = "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400",
                    shopId = shopId,
                    isActive = true,
                    tags = listOf("Scrub", "Honey", "Oat", "Exfoliating", "Natural")
                ),
                Product(
                    name = "Gift Set Bundle",
                    description = "Complete skincare gift set with soap, lotion, and body wash. Perfect for gifting.",
                    price = 32.99,
                    category = "Gift Sets",
                    primaryImageUrl = "https://images.unsplash.com/photo-1549298916-acc8271f8b8e?w=400",
                    shopId = shopId,
                    isActive = true,
                    tags = listOf("Gift Set", "Bundle", "Complete", "Skincare", "Perfect Gift")
                )
            )
            else -> emptyList()
        }
    }
    
    private fun getServicesForShop(shopName: String, shopId: String): List<Service> {
        return when (shopName) {
            "Coffee Corner" -> listOf(
                Service(
                    name = "Coffee Tasting Session",
                    description = "Guided coffee tasting with our expert barista. Learn about different roasts and brewing methods.",
                    basePrice = 25.0,
                    estimatedDuration = 60,
                    category = "Experience",
                    primaryImageUrl = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
                    shopId = shopId,
                    isActive = true,
                    tags = listOf("Coffee Tasting", "Expert Barista", "Educational", "Experience")
                ),
                Service(
                    name = "Private Event Catering",
                    description = "Coffee and pastry catering for private events. Includes setup and professional service.",
                    basePrice = 150.0,
                    estimatedDuration = 180,
                    category = "Catering",
                    primaryImageUrl = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
                    shopId = shopId,
                    isActive = true,
                    tags = listOf("Catering", "Private Events", "Professional Service", "Setup")
                ),
                Service(
                    name = "Barista Training",
                    description = "Learn professional barista skills including espresso preparation and latte art.",
                    basePrice = 75.0,
                    estimatedDuration = 120,
                    category = "Training",
                    primaryImageUrl = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
                    shopId = shopId,
                    isActive = true,
                    tags = listOf("Barista Training", "Professional Skills", "Latte Art", "Espresso")
                )
            )
            "TechFix Pro" -> listOf(
                Service(
                    name = "Screen Repair",
                    description = "Professional screen replacement for smartphones and tablets. Same-day service available.",
                    basePrice = 89.99,
                    estimatedDuration = 60,
                    category = "Repair",
                    primaryImageUrl = "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=400",
                    shopId = shopId,
                    isActive = true,
                    tags = listOf("Screen Repair", "Same-day", "Professional", "Smartphones", "Tablets")
                ),
                Service(
                    name = "Laptop Diagnostics",
                    description = "Comprehensive laptop diagnostic to identify hardware and software issues.",
                    basePrice = 49.99,
                    estimatedDuration = 45,
                    category = "Diagnostics",
                    primaryImageUrl = "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400",
                    shopId = shopId,
                    isActive = true,
                    tags = listOf("Laptop", "Diagnostics", "Hardware", "Software", "Comprehensive")
                ),
                Service(
                    name = "Data Recovery",
                    description = "Professional data recovery service for damaged drives and devices. No data, no charge guarantee.",
                    basePrice = 199.99,
                    estimatedDuration = 240,
                    category = "Data Services",
                    primaryImageUrl = "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400",
                    shopId = shopId,
                    isActive = true,
                    tags = listOf("Data Recovery", "Professional", "No Data No Charge", "Damaged Drives")
                )
            )
            "Artisan Soap Co" -> listOf(
                Service(
                    name = "Custom Soap Making Workshop",
                    description = "Learn to make your own natural soap with our expert guidance. Take home your creations.",
                    basePrice = 45.0,
                    estimatedDuration = 90,
                    category = "Workshop",
                    primaryImageUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
                    shopId = shopId,
                    isActive = true,
                    tags = listOf("Workshop", "Custom Soap", "Expert Guidance", "Take Home", "Natural")
                ),
                Service(
                    name = "Skincare Consultation",
                    description = "Personalized skincare consultation to find the perfect products for your skin type.",
                    basePrice = 30.0,
                    estimatedDuration = 30,
                    category = "Consultation",
                    primaryImageUrl = "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400",
                    shopId = shopId,
                    isActive = true,
                    tags = listOf("Skincare", "Consultation", "Personalized", "Skin Type", "Expert Advice")
                ),
                Service(
                    name = "Gift Wrapping Service",
                    description = "Beautiful eco-friendly gift wrapping for any purchase. Perfect for special occasions.",
                    basePrice = 5.0,
                    estimatedDuration = 10,
                    category = "Service",
                    primaryImageUrl = "https://images.unsplash.com/photo-1549298916-acc8271f8b8e?w=400",
                    shopId = shopId,
                    isActive = true,
                    tags = listOf("Gift Wrapping", "Eco-friendly", "Beautiful", "Special Occasions")
                )
            )
            else -> emptyList()
        }
    }
}
