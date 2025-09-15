package com.blueclipse.myhustle.data.util

import com.blueclipse.myhustle.data.model.CatalogItem
import com.blueclipse.myhustle.data.model.Product
import com.blueclipse.myhustle.data.model.ProductVariant
import com.blueclipse.myhustle.data.model.SizeVariant
import com.blueclipse.myhustle.data.model.Service
import com.blueclipse.myhustle.data.model.Shop
import com.blueclipse.myhustle.data.repository.FirebaseShopRepository
import com.blueclipse.myhustle.data.repository.ProductRepository
import com.blueclipse.myhustle.data.repository.ServiceRepository
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.delay

/**
 * Utility class to populate the database with sample data for testing and demonstration
 */
class SampleDataPopulator {
    
    private val shopRepository = FirebaseShopRepository.instance
    private val productRepository = ProductRepository.instance
    private val serviceRepository = ServiceRepository.instance
    private val auth = FirebaseAuth.getInstance()
    
    /**
     * Populate the database with comprehensive sample data
     */
    suspend fun populateAllSampleData(): Result<String> {
        return try {
            val currentUser = auth.currentUser
            if (currentUser == null) {
                return Result.failure(Exception("No user logged in"))
            }
            
            val userId = currentUser.uid
            println("🎭 Starting sample data population for user: $userId")
            
            // Create sample shops with products and services
            val coffeeShop = createCoffeeCornerShop(userId)
            val techShop = createTechRepairShop(userId)
            val beautyShop = createArtisanSoapShop(userId)
            
            println("🎭 Sample data population completed successfully!")
            Result.success("Successfully populated database with 3 sample shops, 15 products, and 9 services")
            
        } catch (e: Exception) {
            println("❌ Error populating sample data: ${e.message}")
            e.printStackTrace()
            Result.failure(e)
        }
    }
    
    private suspend fun createCoffeeCornerShop(ownerId: String): String {
        println("☕ Creating Coffee Corner shop...")
        
        // Create the shop
        val shop = Shop(
            name = "Coffee Corner",
            description = "Premium artisan coffee and fresh pastries made daily. Your neighborhood's favorite coffee destination.",
            ownerId = ownerId,
            category = "Food & Beverage",
            location = "Downtown District",
            address = "123 Main Street, Coffee District",
            phone = "+1 (555) 123-CAFE",
            email = "hello@coffeecorner.com",
            website = "www.coffeecorner.com",
            imageUrl = "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
            logoUrl = "https://images.unsplash.com/photo-1559056199-641a0ac8b55e",
            bannerUrl = "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
            rating = 4.7,
            totalReviews = 234,
            isVerified = true,
            isPremium = true,
            availability = "", // Deprecated; using openTime24/closeTime24 now
            openTime24 = "06:00",
            closeTime24 = "20:00",
            responseTime = "Usually responds within 30 minutes",
            operatingHours = mapOf(
                "Monday" to "6:00 AM - 8:00 PM",
                "Tuesday" to "6:00 AM - 8:00 PM",
                "Wednesday" to "6:00 AM - 8:00 PM",
                "Thursday" to "6:00 AM - 8:00 PM",
                "Friday" to "6:00 AM - 9:00 PM",
                "Saturday" to "7:00 AM - 9:00 PM",
                "Sunday" to "7:00 AM - 7:00 PM"
            ),
            tags = listOf("coffee", "pastries", "breakfast", "wifi", "study-friendly"),
            specialties = listOf("Artisan Coffee", "Fresh Pastries", "Custom Blends"),
            priceRange = "$$",
            deliveryOptions = listOf("Pickup", "Delivery", "Dine-in"),
            paymentMethods = listOf("Cash", "Card", "Mobile Pay"),
            catalog = emptyList() // Will be populated after products/services are created
        )
        
        val shopResult = shopRepository.addShop(shop)
        val shopId = shopResult.getOrThrow()
        
        // Create products
        val products = listOf(
            Product(
                shopId = shopId,
                ownerId = ownerId,
                name = "Espresso Blend",
                description = "Rich and bold espresso blend with notes of chocolate and caramel",
                primaryImageUrl = "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a",
                price = 12.99,
                category = "Coffee Beans",
                stockQuantity = 50,
                expensePerUnit = 6.50, // Cost to produce each bag
                inStock = true,
                tags = listOf("espresso", "dark-roast", "premium")
            ),
            Product(
                shopId = shopId,
                ownerId = ownerId,
                name = "Fresh Croissants",
                description = "Buttery, flaky croissants baked fresh every morning",
                primaryImageUrl = "https://images.unsplash.com/photo-1555507036-ab794f27bb5b",
                price = 3.50,
                category = "Pastries",
                stockQuantity = 24,
                expensePerUnit = 1.25, // Cost of ingredients per croissant
                inStock = true,
                tags = listOf("pastry", "breakfast", "fresh")
            ),
            Product(
                shopId = shopId,
                ownerId = ownerId,
                name = "Cold Brew Coffee",
                description = "Smooth cold brew coffee, perfect for hot days",
                primaryImageUrl = "https://images.unsplash.com/photo-1461023058943-07fcbe16d735",
                price = 4.99,
                category = "Beverages",
                stockQuantity = 30,
                inStock = true,
                tags = listOf("cold-brew", "iced", "refreshing")
            ),
            Product(
                shopId = shopId,
                ownerId = ownerId,
                name = "Artisan Muffins",
                description = "Homemade muffins with seasonal fruits and premium ingredients",
                primaryImageUrl = "https://images.unsplash.com/photo-1586985289906-406988974504",
                price = 4.25,
                category = "Pastries",
                stockQuantity = 18,
                inStock = true,
                tags = listOf("muffin", "homemade", "seasonal"),
                variants = listOf(
                    ProductVariant(
                        id = "muffin_blueberry",
                        name = "Flavor",
                        value = "Blueberry",
                        price = 4.25,
                        imageUrl = "https://images.unsplash.com/photo-1586985289906-406988974504",
                        stockQuantity = 8,
                        isActive = true
                    ),
                    ProductVariant(
                        id = "muffin_chocolate",
                        name = "Flavor",
                        value = "Chocolate Chip",
                        price = 4.50,
                        imageUrl = "https://images.unsplash.com/photo-1603532648955-039310d9ed75",
                        stockQuantity = 6,
                        isActive = true
                    ),
                    ProductVariant(
                        id = "muffin_banana",
                        name = "Flavor",
                        value = "Banana Walnut",
                        price = 4.75,
                        imageUrl = "https://images.unsplash.com/photo-1571197776089-12f1e6e2fc89",
                        stockQuantity = 4,
                        isActive = true
                    )
                )
            ),
            Product(
                shopId = shopId,
                ownerId = ownerId,
                name = "Premium Coffee Mug",
                description = "Ceramic coffee mug with Coffee Corner logo",
                primaryImageUrl = "https://images.unsplash.com/photo-1544787219-7f47ccb76574",
                price = 15.99,
                category = "Merchandise",
                stockQuantity = 25,
                inStock = true,
                tags = listOf("mug", "merchandise", "ceramic"),
                sizeVariants = listOf(
                    SizeVariant(
                        id = "mug_small",
                        size = "Small (8 oz)",
                        price = 12.99,
                        stockQuantity = 10,
                        isActive = true
                    ),
                    SizeVariant(
                        id = "mug_medium",
                        size = "Medium (12 oz)",
                        price = 15.99,
                        stockQuantity = 10,
                        isActive = true
                    ),
                    SizeVariant(
                        id = "mug_large",
                        size = "Large (16 oz)",
                        price = 18.99,
                        stockQuantity = 5,
                        isActive = true
                    )
                )
            )
        )
        
        // Create services
        val services = listOf(
            Service(
                shopId = shopId,
                ownerId = ownerId,
                name = "Coffee Tasting Event",
                description = "Join our monthly coffee tasting events to explore different origins and brewing methods",
                primaryImageUrl = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
                basePrice = 25.00,
                category = "Events",
                estimatedDuration = 120,
                expensePerUnit = 8.50, // Cost of coffee samples and materials per person
                isBookable = true,
                tags = listOf("tasting", "event", "education")
            ),
            Service(
                shopId = shopId,
                ownerId = ownerId,
                name = "Private Barista Training",
                description = "Learn professional barista skills in a one-on-one training session",
                primaryImageUrl = "https://images.unsplash.com/photo-1442512595331-e89e73853f31",
                basePrice = 75.00,
                category = "Training",
                estimatedDuration = 180,
                isBookable = true,
                tags = listOf("training", "barista", "private")
            ),
            Service(
                shopId = shopId,
                ownerId = ownerId,
                name = "Coffee Catering",
                description = "Professional coffee catering for your events and meetings",
                primaryImageUrl = "https://images.unsplash.com/photo-1497636577773-f1231844b336",
                basePrice = 150.00,
                category = "Catering",
                estimatedDuration = 240,
                isBookable = true,
                tags = listOf("catering", "events", "professional")
            )
        )
        
        // Save products and services, then update shop catalog
        val catalogItems = mutableListOf<CatalogItem>()
        
        products.forEach { product ->
            val productResult = productRepository.createProduct(product)
            productResult.onSuccess { productId ->
                catalogItems.add(
                    CatalogItem(
                        id = productId,
                        name = product.name,
                        imageUrl = product.primaryImageUrl,
                        description = product.description,
                        isProduct = true,
                        rating = 4.5f
                    )
                )
            }
            delay(100) // Small delay to avoid overwhelming Firebase
        }
        
        services.forEach { service ->
            val serviceResult = serviceRepository.createService(service)
            serviceResult.onSuccess { serviceId ->
                catalogItems.add(
                    CatalogItem(
                        id = serviceId,
                        name = service.name,
                        imageUrl = service.primaryImageUrl,
                        description = service.description,
                        isProduct = false,
                        rating = 4.7f
                    )
                )
            }
            delay(100)
        }
        
        // Update shop with catalog
        val updatedShop = shop.copy(id = shopId, catalog = catalogItems)
        shopRepository.updateShop(updatedShop)
        
        println("☕ Coffee Corner shop created with ${catalogItems.size} catalog items")
        return shopId
    }
    
    private suspend fun createTechRepairShop(ownerId: String): String {
        println("🔧 Creating TechFix Pro shop...")
        
        val shop = Shop(
            name = "TechFix Pro",
            description = "Professional phone and computer repair services. Fast, reliable, and affordable tech solutions.",
            ownerId = ownerId,
            category = "Technology",
            location = "Tech Hub District",
            address = "456 Innovation Avenue, Tech Quarter",
            phone = "+1 (555) 789-TECH",
            email = "support@techfixpro.com",
            website = "www.techfixpro.com",
            imageUrl = "https://images.unsplash.com/photo-1581092160562-40aa08e78837",
            logoUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af2176",
            bannerUrl = "https://images.unsplash.com/photo-1581092160562-40aa08e78837",
            rating = 4.8,
            totalReviews = 156,
            isVerified = true,
            availability = "", // Deprecated; using openTime24/closeTime24 now
            openTime24 = "09:00",
            closeTime24 = "19:00",
            responseTime = "Usually responds within 1 hour",
            operatingHours = mapOf(
                "Monday" to "9:00 AM - 7:00 PM",
                "Tuesday" to "9:00 AM - 7:00 PM",
                "Wednesday" to "9:00 AM - 7:00 PM",
                "Thursday" to "9:00 AM - 7:00 PM",
                "Friday" to "9:00 AM - 7:00 PM",
                "Saturday" to "10:00 AM - 6:00 PM",
                "Sunday" to "Closed"
            ),
            tags = listOf("repair", "phone", "computer", "warranty", "fast-service"),
            specialties = listOf("Phone Repair", "Computer Diagnostics", "Data Recovery"),
            priceRange = "$$",
            deliveryOptions = listOf("Pickup", "On-site"),
            paymentMethods = listOf("Cash", "Card", "Mobile Pay", "Crypto"),
            catalog = emptyList()
        )
        
        val shopResult = shopRepository.addShop(shop)
        val shopId = shopResult.getOrThrow()
        
        // Create products
        val products = listOf(
            Product(
                shopId = shopId,
                ownerId = ownerId,
                name = "iPhone Screen Protector",
                description = "Premium tempered glass screen protector for iPhone",
                primaryImageUrl = "https://images.unsplash.com/photo-1592750475338-74b7b21085ab",
                price = 19.99,
                category = "Accessories",
                stockQuantity = 40,
                inStock = true,
                tags = listOf("iphone", "protection", "glass")
            ),
            Product(
                shopId = shopId,
                ownerId = ownerId,
                name = "Phone Case Collection",
                description = "Durable phone cases for various smartphone models",
                primaryImageUrl = "https://images.unsplash.com/photo-1556656793-08538906a9f8",
                price = 24.99,
                category = "Accessories",
                stockQuantity = 60,
                inStock = true,
                tags = listOf("case", "protection", "durable")
            ),
            Product(
                shopId = shopId,
                ownerId = ownerId,
                name = "Wireless Charger",
                description = "Fast wireless charging pad compatible with all Qi devices",
                primaryImageUrl = "https://images.unsplash.com/photo-1583394838336-acd977736f90",
                price = 35.99,
                category = "Charging",
                stockQuantity = 25,
                inStock = true,
                tags = listOf("wireless", "charging", "qi")
            ),
            Product(
                shopId = shopId,
                ownerId = ownerId,
                name = "USB-C Cable",
                description = "High-quality USB-C charging and data transfer cable",
                primaryImageUrl = "https://images.unsplash.com/photo-1558618866-fcd25c85cd64",
                price = 12.99,
                category = "Cables",
                stockQuantity = 35,
                inStock = true,
                tags = listOf("usb-c", "cable", "charging")
            ),
            Product(
                shopId = shopId,
                ownerId = ownerId,
                name = "Bluetooth Earbuds",
                description = "Wireless earbuds with noise cancellation and long battery life",
                primaryImageUrl = "https://images.unsplash.com/photo-1590658268037-6bf12165a8df",
                price = 89.99,
                category = "Audio",
                stockQuantity = 15,
                inStock = true,
                tags = listOf("bluetooth", "earbuds", "wireless")
            )
        )
        
        // Create services
        val services = listOf(
            Service(
                shopId = shopId,
                ownerId = ownerId,
                name = "Phone Screen Repair",
                description = "Professional screen replacement for all smartphone models with warranty",
                primaryImageUrl = "https://images.unsplash.com/photo-1621768216002-5ac171876625",
                basePrice = 129.99,
                category = "Repair",
                estimatedDuration = 45,
                isBookable = true,
                tags = listOf("screen", "repair", "warranty")
            ),
            Service(
                shopId = shopId,
                ownerId = ownerId,
                name = "Computer Diagnostics",
                description = "Comprehensive computer health check and performance optimization",
                primaryImageUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af2176",
                basePrice = 49.99,
                category = "Diagnostics",
                estimatedDuration = 90,
                isBookable = true,
                tags = listOf("computer", "diagnostics", "optimization")
            ),
            Service(
                shopId = shopId,
                ownerId = ownerId,
                name = "Data Recovery",
                description = "Professional data recovery service for damaged or corrupted devices",
                primaryImageUrl = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43",
                basePrice = 199.99,
                category = "Data Recovery",
                estimatedDuration = 240,
                isBookable = true,
                tags = listOf("data", "recovery", "professional")
            )
        )
        
        // Save and create catalog
        val catalogItems = mutableListOf<CatalogItem>()
        
        products.forEach { product ->
            val productResult = productRepository.createProduct(product)
            productResult.onSuccess { productId ->
                catalogItems.add(
                    CatalogItem(
                        id = productId,
                        name = product.name,
                        imageUrl = product.primaryImageUrl,
                        description = product.description,
                        isProduct = true,
                        rating = 4.6f
                    )
                )
            }
            delay(100)
        }
        
        services.forEach { service ->
            val serviceResult = serviceRepository.createService(service)
            serviceResult.onSuccess { serviceId ->
                catalogItems.add(
                    CatalogItem(
                        id = serviceId,
                        name = service.name,
                        imageUrl = service.primaryImageUrl,
                        description = service.description,
                        isProduct = false,
                        rating = 4.8f
                    )
                )
            }
            delay(100)
        }
        
        val updatedShop = shop.copy(id = shopId, catalog = catalogItems)
        shopRepository.updateShop(updatedShop)
        
        println("🔧 TechFix Pro shop created with ${catalogItems.size} catalog items")
        return shopId
    }
    
    private suspend fun createArtisanSoapShop(ownerId: String): String {
        println("🧴 Creating Artisan Soap Co shop...")
        
        val shop = Shop(
            name = "Artisan Soap Co",
            description = "Handcrafted natural soaps and beauty products made with organic ingredients and essential oils.",
            ownerId = ownerId,
            category = "Beauty & Wellness",
            location = "Artisan Quarter",
            address = "789 Wellness Boulevard, Natural District",
            phone = "+1 (555) 456-SOAP",
            email = "contact@artisansoapco.com",
            website = "www.artisansoapco.com",
            imageUrl = "https://images.unsplash.com/photo-1556228720-195a672e8a03",
            logoUrl = "https://images.unsplash.com/photo-1571781926291-c477ebfd024b",
            bannerUrl = "https://images.unsplash.com/photo-1556228720-195a672e8a03",
            rating = 4.9,
            totalReviews = 89,
            isVerified = true,
            availability = "", // Deprecated; using openTime24/closeTime24 now
            openTime24 = "10:00",
            closeTime24 = "18:00",
            responseTime = "Usually responds within 2 hours",
            operatingHours = mapOf(
                "Monday" to "10:00 AM - 6:00 PM",
                "Tuesday" to "10:00 AM - 6:00 PM",
                "Wednesday" to "10:00 AM - 6:00 PM",
                "Thursday" to "10:00 AM - 6:00 PM",
                "Friday" to "10:00 AM - 7:00 PM",
                "Saturday" to "9:00 AM - 7:00 PM",
                "Sunday" to "11:00 AM - 5:00 PM"
            ),
            tags = listOf("handmade", "natural", "organic", "cruelty-free", "vegan"),
            specialties = listOf("Natural Soaps", "Essential Oils", "Skincare"),
            priceRange = "$",
            deliveryOptions = listOf("Pickup", "Delivery", "Shipping"),
            paymentMethods = listOf("Cash", "Card", "PayPal"),
            catalog = emptyList()
        )
        
        val shopResult = shopRepository.addShop(shop)
        val shopId = shopResult.getOrThrow()
        
        // Create products
        val products = listOf(
            Product(
                shopId = shopId,
                ownerId = ownerId,
                name = "Lavender Dreams Soap",
                description = "Relaxing lavender soap with organic oils and dried lavender flowers",
                primaryImageUrl = "https://images.unsplash.com/photo-1571781926291-c477ebfd024b",
                price = 8.99,
                category = "Soap",
                stockQuantity = 30,
                inStock = true,
                tags = listOf("lavender", "relaxing", "organic")
            ),
            Product(
                shopId = shopId,
                ownerId = ownerId,
                name = "Citrus Burst Body Wash",
                description = "Energizing citrus body wash with orange and lemon essential oils",
                primaryImageUrl = "https://images.unsplash.com/photo-1556228720-195a672e8a03",
                price = 12.99,
                category = "Body Care",
                stockQuantity = 25,
                inStock = true,
                tags = listOf("citrus", "energizing", "essential-oils")
            ),
            Product(
                shopId = shopId,
                ownerId = ownerId,
                name = "Honey Oat Exfoliating Bar",
                description = "Gentle exfoliating soap with natural honey and oat flakes",
                primaryImageUrl = "https://images.unsplash.com/photo-1585652757232-0e3fda0eca84",
                price = 9.99,
                category = "Soap",
                stockQuantity = 20,
                inStock = true,
                tags = listOf("honey", "oat", "exfoliating")
            ),
            Product(
                shopId = shopId,
                ownerId = ownerId,
                name = "Rose Hip Face Moisturizer",
                description = "Anti-aging face moisturizer with rose hip oil and vitamin E",
                primaryImageUrl = "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a",
                price = 24.99,
                category = "Skincare",
                stockQuantity = 15,
                inStock = true,
                tags = listOf("rose-hip", "anti-aging", "moisturizer")
            ),
            Product(
                shopId = shopId,
                ownerId = ownerId,
                name = "Essential Oil Gift Set",
                description = "Collection of 5 premium essential oils in a beautiful gift box",
                primaryImageUrl = "https://images.unsplash.com/photo-1608181078509-cfb3c373eb27",
                price = 39.99,
                category = "Essential Oils",
                stockQuantity = 12,
                inStock = true,
                tags = listOf("essential-oils", "gift-set", "premium")
            )
        )
        
        // Create services
        val services = listOf(
            Service(
                shopId = shopId,
                ownerId = ownerId,
                name = "Custom Soap Making Workshop",
                description = "Learn to make your own natural soaps in our hands-on workshop",
                primaryImageUrl = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
                basePrice = 45.00,
                category = "Workshop",
                estimatedDuration = 150,
                isBookable = true,
                tags = listOf("workshop", "soap-making", "hands-on")
            ),
            Service(
                shopId = shopId,
                ownerId = ownerId,
                name = "Skincare Consultation",
                description = "Personalized skincare consultation with product recommendations",
                primaryImageUrl = "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a",
                basePrice = 35.00,
                category = "Consultation",
                estimatedDuration = 60,
                isBookable = true,
                tags = listOf("skincare", "consultation", "personalized")
            ),
            Service(
                shopId = shopId,
                ownerId = ownerId,
                name = "Aromatherapy Session",
                description = "Relaxing aromatherapy session with custom essential oil blends",
                primaryImageUrl = "https://images.unsplash.com/photo-1608181078509-cfb3c373eb27",
                basePrice = 55.00,
                category = "Aromatherapy",
                estimatedDuration = 90,
                isBookable = true,
                tags = listOf("aromatherapy", "relaxing", "essential-oils")
            )
        )
        
        // Save and create catalog
        val catalogItems = mutableListOf<CatalogItem>()
        
        products.forEach { product ->
            val productResult = productRepository.createProduct(product)
            productResult.onSuccess { productId ->
                catalogItems.add(
                    CatalogItem(
                        id = productId,
                        name = product.name,
                        imageUrl = product.primaryImageUrl,
                        description = product.description,
                        isProduct = true,
                        rating = 4.8f
                    )
                )
            }
            delay(100)
        }
        
        services.forEach { service ->
            val serviceResult = serviceRepository.createService(service)
            serviceResult.onSuccess { serviceId ->
                catalogItems.add(
                    CatalogItem(
                        id = serviceId,
                        name = service.name,
                        imageUrl = service.primaryImageUrl,
                        description = service.description,
                        isProduct = false,
                        rating = 4.9f
                    )
                )
            }
            delay(100)
        }
        
        val updatedShop = shop.copy(id = shopId, catalog = catalogItems)
        shopRepository.updateShop(updatedShop)
        
        println("🧴 Artisan Soap Co shop created with ${catalogItems.size} catalog items")
        return shopId
    }
}
