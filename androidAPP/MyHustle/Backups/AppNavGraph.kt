// app/src/main/java/com/example/myhustle/navigation/AppNavGraph.kt
package com.example.myhustle.navigation

import ServiceScreen
import android.app.Activity
import android.os.Build
import android.util.Log
import androidx.activity.compose.BackHandler
import androidx.annotation.RequiresApi
import androidx.compose.ui.platform.LocalContext
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import com.example.myhustle.data.model.CatalogItem
import com.example.myhustle.data.model.Product
import com.example.myhustle.data.model.ProductVariant
import com.example.myhustle.data.model.SizeVariant
import com.example.myhustle.data.model.Service
import com.example.myhustle.data.repository.ProductRepository
import com.example.myhustle.data.repository.ServiceRepository
import com.example.myhustle.data.repository.FirebaseShopRepository
import com.example.myhustle.ui.screens.*
import com.example.myhustle.ui.screens.auth.LoginScreen
import com.example.myhustle.ui.screens.auth.SignUpScreen
import com.example.myhustle.ui.screens.business.*
import com.example.myhustle.ui.screens.business.booking.*
import com.example.myhustle.ui.screens.business.order.*
import com.example.myhustle.ui.screens.messaging.*
import com.example.myhustle.ui.screens.setup.SetupScreen
import com.example.myhustle.ui.theme.HustleColors
import com.example.myhustle.ui.viewmodel.AuthViewModel
import com.example.myhustle.data.util.SampleDataPopulator
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.launch

object Destinations {
    const val LOGIN_ROUTE       = "login"
    const val SIGNUP_ROUTE      = "signup"
    const val HOME_ROUTE        = "home"
    const val STORE_ROUTE       = "store"
    const val CATALOG_ROUTE     = "catalog"
    const val PRODUCT_ROUTE     = "product"
    const val SERVICE_ROUTE     = "service"
    const val BOOKING_ROUTE     = "booking"
    const val CREATE_STORE_ROUTE = "create_store"
    const val CHECKOUT_ROUTE    = "checkout"
    const val PROFILE_ROUTE     = "profile"
    const val MESSAGES_ROUTE    = "messages"
    const val CHAT_ROUTE        = "chat"
    const val SETUP_ROUTE       = "setup"
    
    // Business Management Routes
    const val STORE_MANAGEMENT_ROUTE = "store_management"
    const val ADD_PRODUCT_ROUTE = "add_product/{shopId}"
    const val ADD_SERVICE_ROUTE = "add_service/{shopId}"
    const val INVENTORY_ROUTE = "inventory"
    const val CHANGE_LISTING_ROUTE = "change_listing/{listingId}/{listingType}"
    const val ANALYTICS_ROUTE = "analytics"
    const val ACCOUNTING_ROUTE = "accounting"
    const val BOOKING_MANAGEMENT_ROUTE = "booking_management"
    const val ORDER_MANAGEMENT_ROUTE = "order_management"
    const val BOOKING_REQUESTS_ROUTE = "booking_requests"
    const val ALL_BOOKINGS_ROUTE = "all_bookings"
    const val CALENDAR_VIEW_ROUTE = "calendar_view"
}

@RequiresApi(Build.VERSION_CODES.O) // because BookingScreen uses java.time
@Composable
fun AppNavGraph() {
    val navController = rememberNavController()
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    
    Log.d("OrderNavDebug", "🚀 AppNavGraph: ORDER_MANAGEMENT_ROUTE = '${Destinations.ORDER_MANAGEMENT_ROUTE}'")
    
    // Rely on screen-scoped BackHandlers and explicit onBack lambdas per destination

    val authViewModel: AuthViewModel = viewModel()
    val currentUser by authViewModel.currentUser.collectAsState()

    NavHost(
        navController = navController,
        startDestination = Destinations.HOME_ROUTE  // Start with main app
    ) {
        // Authentication Routes (accessible from main screen)
        composable(Destinations.LOGIN_ROUTE) {
            LoginScreen(
                onNavigateToSignUp = {
                    navController.navigate(Destinations.SIGNUP_ROUTE)
                },
                onLoginSuccess = {
                    navController.popBackStack()  // Return to previous screen
                },
                authViewModel = authViewModel
            )
        }
        
        composable(Destinations.SIGNUP_ROUTE) {
            SignUpScreen(
                onNavigateToLogin = {
                    navController.popBackStack()
                },
                onSignUpSuccess = {
                    navController.popBackStack(Destinations.HOME_ROUTE, false)  // Return to home
                },
                authViewModel = authViewModel
            )
        }
        
        // Main App Routes (now accessible without authentication)
        composable(Destinations.HOME_ROUTE) {
            val coroutineScope = rememberCoroutineScope()
            var isPopulating by remember { mutableStateOf(false) }
            var populationResult by remember { mutableStateOf<String?>(null) }
            
            MainNavScreen(
                onStoreClick = { shopId ->
                    navController.navigate("${Destinations.STORE_ROUTE}/$shopId")
                },
                onCreateStoreClick = {
                    if (currentUser != null) {
                        navController.navigate(Destinations.CREATE_STORE_ROUTE)
                    } else {
                        // Redirect to login if not authenticated
                        navController.navigate(Destinations.LOGIN_ROUTE)
                    }
                },
                onSignInClick = {
                    navController.navigate(Destinations.LOGIN_ROUTE)
                },
                onCheckoutClick = {
                    navController.navigate(Destinations.CHECKOUT_ROUTE)
                },
                onStoreManagementClick = {
                    if (currentUser != null) {
                        navController.navigate(Destinations.STORE_MANAGEMENT_ROUTE)
                    } else {
                        navController.navigate(Destinations.LOGIN_ROUTE)
                    }
                },
                onInventoryClick = {
                    navController.navigate(Destinations.INVENTORY_ROUTE)
                },
                onAnalyticsClick = {
                    navController.navigate(Destinations.ANALYTICS_ROUTE)
                },
                onAccountingClick = {
                    navController.navigate(Destinations.ACCOUNTING_ROUTE)
                },
                onBookingManagementClick = {
                    navController.navigate(Destinations.BOOKING_MANAGEMENT_ROUTE)
                },
                onShopSpecificBookingManagementClick = { shopId ->
                    navController.navigate("${Destinations.BOOKING_MANAGEMENT_ROUTE}/$shopId")
                },
                onOrderManagementClick = {
                    Log.d("OrderNavDebug", "🏁 MainNavScreen -> navigate to ORDER_MANAGEMENT_ROUTE")
                    navController.navigate(Destinations.ORDER_MANAGEMENT_ROUTE)
                },
                onShopSpecificOrderManagementClick = { shopId ->
                    Log.d("OrderNavDebug", "🏁 MainNavScreen -> navigate to ORDER_MANAGEMENT_ROUTE with shopId=$shopId")
                    navController.navigate("${Destinations.ORDER_MANAGEMENT_ROUTE}/$shopId")
                },
                onAddProductClick = {
                    // For generic add product, navigate without shopId (handled by fallback logic in composable)
                    navController.navigate("add_product/null")
                },
                onAddServiceClick = {
                    // For generic add service, navigate without shopId (handled by fallback logic in composable)
                    navController.navigate("add_service/null")
                },
                onShopSpecificAddProductClick = { shopId ->
                    navController.navigate("add_product/$shopId")
                },
                onShopSpecificAddServiceClick = { shopId ->
                    navController.navigate("add_service/$shopId")
                },
                onMessagesClick = {
                    navController.navigate(Destinations.MESSAGES_ROUTE)
                },
                onSetupClick = {
                    navController.navigate(Destinations.SETUP_ROUTE)
                },
                onPopulateSampleDataClick = {
                    coroutineScope.launch {
                        try {
                            Log.d("SampleDataPopulator", "🎭 Starting sample data population from MainNavScreen...")
                            isPopulating = true
                            
                            // Use SampleDataPopulator utility
                            val populator = SampleDataPopulator()
                            val result = populator.populateAllSampleData()
                            
                            if (result.isSuccess) {
                                populationResult = "✅ Successfully populated sample data!\n\n" +
                                        "Added 3 sample shops:\n" +
                                        "• Coffee Corner ☕\n" +
                                        "• TechFix Pro 🔧\n" +
                                        "• Artisan Soap Co 🧼\n\n" +
                                        "Each with products, services, and sample data!"
                                
                                Log.d("SampleDataPopulator", "🎭 Sample data population completed successfully!")
                            } else {
                                val error = result.exceptionOrNull()
                                populationResult = "❌ Error populating sample data: ${error?.message ?: "Unknown error"}"
                                Log.e("SampleDataPopulator", "🎭 Error during sample data population", error)
                            }
                            
                        } catch (e: Exception) {
                            Log.e("SampleDataPopulator", "🎭 Error during sample data population", e)
                            populationResult = "❌ Error populating sample data: ${e.message}"
                        } finally {
                            isPopulating = false
                        }
                    }
                },
                currentUser = currentUser,
                authViewModel = authViewModel
            )
            
            // Show population status dialog
            if (isPopulating || populationResult != null) {
                AlertDialog(
                    onDismissRequest = { 
                        if (!isPopulating) populationResult = null 
                    },
                    title = { 
                        Text(if (isPopulating) "Populating Database..." else "Population Complete") 
                    },
                    text = { 
                        if (isPopulating) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                CircularProgressIndicator(color = HustleColors.BlueAccent)
                                Spacer(modifier = Modifier.height(16.dp))
                                Text("Creating sample shops, products, and services...")
                            }
                        } else {
                            Text(populationResult ?: "")
                        }
                    },
                    confirmButton = {
                        if (!isPopulating) {
                            TextButton(onClick = { populationResult = null }) {
                                Text("OK")
                            }
                        }
                    }
                )
            }
        }

        // create store screen
        composable(Destinations.CREATE_STORE_ROUTE) {
            CreateStoreScreen(
                onBack = { navController.popBackStack() },
                onSave = { 
                    // Navigate back to home after saving
                    navController.popBackStack()
                }
            )
        }

        // store detail
        composable(
            route = "${Destinations.STORE_ROUTE}/{shopId}",
            arguments = listOf(navArgument("shopId") {
                type = NavType.StringType
            })
        ) { backStack ->
            val shopId = backStack.arguments!!.getString("shopId")!!
            StoreProfileScreen(
                shopId             = shopId,
                onBack             = { navController.popBackStack() },

                onCatalogItemClick = { item ->
                    Log.d("Navigation", "=== NAVIGATION CLICK DEBUG ===")
                    Log.d("Navigation", "🔍 Item clicked: '${item.name}'")
                    Log.d("Navigation", "🔍 Item ID: '${item.id}'")
                    Log.d("Navigation", "🔍 Item description: '${item.description}'")
                    Log.d("Navigation", "🔍 isProduct field: ${item.isProduct}")
                    Log.d("Navigation", "🔍 isProduct type: ${item.isProduct::class.java}")
                    
                    // Explicit check for debugging
                    when {
                        item.isProduct == true -> {
                            Log.d("Navigation", "📦 CONFIRMED: Going to PRODUCT route for: ${item.name}")
                            val route = "${Destinations.PRODUCT_ROUTE}/${item.id}"
                            Log.d("Navigation", "🚀 Product route: $route")
                            navController.navigate(route)
                        }
                        item.isProduct == false -> {
                            Log.d("Navigation", "🔧 CONFIRMED: Going to SERVICE route for: ${item.name}")
                            val route = "${Destinations.SERVICE_ROUTE}/${item.id}"
                            Log.d("Navigation", "🚀 Service route: $route")
                            navController.navigate(route)
                        }
                        else -> {
                            Log.e("Navigation", "❌ ERROR: isProduct is neither true nor false! Value: ${item.isProduct}")
                            Log.e("Navigation", "❌ Defaulting to SERVICE for safety")
                            navController.navigate("${Destinations.SERVICE_ROUTE}/${item.id}")
                        }
                    }
                }
            )
        }

        // catalog
        composable(Destinations.CATALOG_ROUTE) {
            CatalogScreen(onBack = { navController.popBackStack() })
        }

        // product detail
        composable(
            route = "${Destinations.PRODUCT_ROUTE}/{itemId}",
            arguments = listOf(navArgument("itemId") {
                type = NavType.StringType
            })
        ) { backStack ->
            val itemId = backStack.arguments!!.getString("itemId")!!
            ProductScreen(
                itemId = itemId,
                onBack = { navController.popBackStack() }
            )
        }

        // service detail
        composable(
            route = "${Destinations.SERVICE_ROUTE}/{itemId}",
            arguments = listOf(navArgument("itemId") {
                type = NavType.StringType
            })
        ) { backStack ->
            val itemId = backStack.arguments!!.getString("itemId")!!
            ServiceScreen(
                itemId = itemId,
                onNext = { shopId, serviceId, serviceName, shopName, shopOwnerId ->
                    // navigate to booking screen with service details
                    navController.navigate("${Destinations.BOOKING_ROUTE}/$shopId/$serviceId?serviceName=${serviceName}&shopName=${shopName}&shopOwnerId=${shopOwnerId}")
                }
            )
        }

        // booking screen with service details
        composable(
            route = "${Destinations.BOOKING_ROUTE}/{shopId}/{serviceId}?serviceName={serviceName}&shopName={shopName}&shopOwnerId={shopOwnerId}",
            arguments = listOf(
                navArgument("shopId") { type = NavType.StringType },
                navArgument("serviceId") { type = NavType.StringType },
                navArgument("serviceName") { type = NavType.StringType; defaultValue = "" },
                navArgument("shopName") { type = NavType.StringType; defaultValue = "" },
                navArgument("shopOwnerId") { type = NavType.StringType; defaultValue = "" }
            )
        ) { backStack ->
            val shopId = backStack.arguments?.getString("shopId") ?: ""
            val serviceId = backStack.arguments?.getString("serviceId") ?: ""
            val serviceName = backStack.arguments?.getString("serviceName") ?: ""
            val shopName = backStack.arguments?.getString("shopName") ?: ""
            val shopOwnerId = backStack.arguments?.getString("shopOwnerId") ?: ""
            
            BookingScreen(
                shopId = shopId,
                serviceId = serviceId,
                serviceName = serviceName,
                shopName = shopName,
                shopOwnerId = shopOwnerId,
                onBack = { navController.popBackStack() },
                onSave = { selectedDateMillis: Long ->
                    // Navigate back after successful booking
                    navController.popBackStack()
                }
            )
        }

        // Legacy booking route (no args) - for backward compatibility
        composable(Destinations.BOOKING_ROUTE) {
            BookingScreen(
                onBack = { navController.popBackStack() },
                onSave = { selectedDateMillis: Long ->
                    // you might pass this back into your repository / viewModel…
                    // then pop back to wherever makes sense
                    navController.popBackStack()
                }
            )
        }

        // checkout screen
        composable(Destinations.CHECKOUT_ROUTE) {
            CheckoutScreen(
                onBack = { 
                    Log.d("Navigation", "🔵 Checkout onBack called!")
                    val popped = navController.popBackStack()
                    Log.d("Navigation", "🔵 Checkout onBack popBackStack result: $popped")
                    if (!popped) {
                        navController.navigate(Destinations.HOME_ROUTE) {
                            popUpTo(navController.graph.startDestinationId) { inclusive = true }
                            launchSingleTop = true
                        }
                    }
                },
                onCheckout = { 
                    // Navigate back to previous screen after successful checkout
                    // Use popBackStack with inclusive to ensure we go back properly
                    navController.popBackStack(
                        route = Destinations.CHECKOUT_ROUTE,
                        inclusive = true
                    )
                }
            )
        }

        // profile screen
        composable(Destinations.PROFILE_ROUTE) {
            ProfileScreen(
                onBackClick = { navController.popBackStack() },
                onMessagesClick = { navController.navigate(Destinations.MESSAGES_ROUTE) },
                onSetupClick = { navController.navigate(Destinations.SETUP_ROUTE) }
            )
        }
        
        // Business Management Routes
        composable(Destinations.STORE_MANAGEMENT_ROUTE) {
            val coroutineScope = rememberCoroutineScope()
            var isPopulating by remember { mutableStateOf(false) }
            var populationResult by remember { mutableStateOf<String?>(null) }
            var testClick by remember { mutableStateOf(false) }
            
            // Show a simple test dialog if button was clicked
            if (testClick) {
                AlertDialog(
                    onDismissRequest = { testClick = false },
                    title = { Text("Button Test") },
                    text = { Text("Button click detected!") },
                    confirmButton = {
                        TextButton(onClick = { testClick = false }) {
                            Text("OK")
                        }
                    }
                )
            }
            
            Log.d("OrderNavDebug", "🏗️ AppNavGraph: About to create StoreManagementScreen with callbacks")
            StoreManagementScreen(
                shopId = null, // No specific shop ID in general management
                onBack = { 
                    // Store management should always go back to Home (My Hustles)
                    navController.navigate(Destinations.HOME_ROUTE) {
                        popUpTo(Destinations.HOME_ROUTE) { inclusive = false }
                        launchSingleTop = true
                    }
                },
                onAddProductClick = { shopId ->
                    if (shopId != null) {
                        navController.navigate("add_product/$shopId")
                    } else {
                        navController.navigate("add_product/default")
                    }
                },
                onAddServiceClick = { shopId ->
                    if (shopId != null) {
                        navController.navigate("add_service/$shopId")
                    } else {
                        navController.navigate("add_service/default")
                    }
                },
                onInventoryClick = {
                    navController.navigate(Destinations.INVENTORY_ROUTE)
                },
                onAnalyticsClick = {
                    navController.navigate(Destinations.ANALYTICS_ROUTE)
                },
                onAccountingClick = {
                    navController.navigate(Destinations.ACCOUNTING_ROUTE)
                },
                onBookingManagementClick = {
                    Log.d("OrderNavDebug", "🟢 AppNavGraph: BookingManagement callback called")
                    navController.navigate(Destinations.BOOKING_MANAGEMENT_ROUTE)
                    Log.d("OrderNavDebug", "🟢 AppNavGraph: BookingManagement navigation completed")
                },
                onOrderManagementClick = {
                    Log.d("OrderNavDebug", "🟠 AppNavGraph: OrderManagement callback called - FIXED!")
                    navController.navigate(Destinations.ORDER_MANAGEMENT_ROUTE)
                    Log.d("OrderNavDebug", "🟠 AppNavGraph: OrderManagement navigation completed - TO ORDER MANAGEMENT!")
                },
                onPopulateSampleDataClick = {
                    println("🎭🎭🎭 APPNAVGRAPH CALLBACK EXECUTED! 🎭🎭🎭")
                    Log.d("SampleDataPopulator", "🎭 AppNavGraph: START - Populate Sample Data button clicked!")
                    testClick = true
                    Log.d("SampleDataPopulator", "🎭 AppNavGraph: END - testClick set to true")
                },
                onPopulateSampleReviewsClick = {
                    Log.d("OrderNavDebug", "📝 AppNavGraph: PopulateSampleReviews callback called")
                    // Empty for now - this was the missing parameter!
                },
                onTestMessagingClick = {
                    coroutineScope.launch {
                        try {
                            Log.d("MessageTest", "💬 Creating test conversation...")
                            val helper = com.example.myhustle.data.util.MessageTestHelper()
                            val result = helper.createSampleConversation()
                            if (result.isSuccess) {
                                Log.d("MessageTest", "✅ Test conversation created successfully")
                                navController.navigate(Destinations.MESSAGES_ROUTE)
                            } else {
                                Log.e("MessageTest", "❌ Failed to create test conversation: ${result.exceptionOrNull()?.message}")
                            }
                        } catch (e: Exception) {
                            Log.e("MessageTest", "❌ Error creating test conversation", e)
                        }
                    }
                }
            )
            
            // Show population status dialog
            if (isPopulating || populationResult != null) {
                AlertDialog(
                    onDismissRequest = { 
                        if (!isPopulating) populationResult = null 
                    },
                    title = { 
                        Text(if (isPopulating) "Populating Database..." else "Population Complete") 
                    },
                    text = { 
                        if (isPopulating) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                CircularProgressIndicator(color = HustleColors.BlueAccent)
                                Spacer(modifier = Modifier.height(16.dp))
                                Text("Creating sample shops, products, and services...")
                            }
                        } else {
                            Text(populationResult ?: "")
                        }
                    },
                    confirmButton = {
                        if (!isPopulating) {
                            TextButton(onClick = { populationResult = null }) {
                                Text("OK")
                            }
                        }
                    }
                )
            }
        }
        
        composable(Destinations.ADD_PRODUCT_ROUTE) {
            val coroutineScope = rememberCoroutineScope()
            val currentUser = FirebaseAuth.getInstance().currentUser
            val shopId = it.arguments?.getString("shopId") // Extract shopId from navigation arguments
            AddProductScreen(
                onBack = { navController.popBackStack() },
                onSaveProduct = { productData ->
                    coroutineScope.launch {
                        try {
                            val userId = currentUser?.uid
                            if (userId == null) {
                                println("No user logged in")
                                return@launch
                            }
                            
                            // Use the shopId from navigation arguments
                            val targetShopId = shopId ?: run {
                                // Fallback to user's first shop if shopId is not provided
                                val shopRepository = FirebaseShopRepository.instance
                                val userShops = shopRepository.getShopsByOwner(userId)
                                userShops.firstOrNull()?.id
                            }
                            
                            if (targetShopId != null) {
                                // Convert ProductData to Product model
                                val product = Product(
                                    shopId = targetShopId,
                                    ownerId = userId,
                                    name = productData.name,
                                    description = productData.description,
                                    price = productData.price,
                                    category = productData.category,
                                    stockQuantity = productData.stockQuantity,
                                    expensePerUnit = productData.expensePerUnit,
                                    inStock = productData.stockQuantity > 0,
                                    isActive = true,
                                    variants = productData.variants.map { variant ->
                                        ProductVariant(
                                            id = java.util.UUID.randomUUID().toString(),
                                            name = variant.name,
                                            value = variant.value,
                                            price = variant.price,
                                            imageUrl = variant.imageUrl,
                                            stockQuantity = variant.stockQuantity,
                                            isActive = true
                                        )
                                    },
                                    sizeVariants = productData.sizeVariants.map { sizeVariant ->
                                        SizeVariant(
                                            id = java.util.UUID.randomUUID().toString(),
                                            size = sizeVariant.size,
                                            price = sizeVariant.price,
                                            stockQuantity = sizeVariant.stockQuantity,
                                            isActive = true
                                        )
                                    },
                                    createdAt = System.currentTimeMillis(),
                                    updatedAt = System.currentTimeMillis()
                                    // Note: SKU field from form is not included as Product model doesn't have it
                                )
                                
                                // Save to repository
                                val productRepository = ProductRepository.instance
                                productRepository.createProduct(product).onSuccess { productId ->
                                    println("Product saved successfully with ID: $productId")
                                    
                                    // CRITICAL FIX: Also add to shop's catalog
                                    coroutineScope.launch {
                                        try {
                                            val shopRepository = FirebaseShopRepository.instance
                                            val targetShop = shopRepository.getShopById(targetShopId)
                                            
                                            if (targetShop != null) {
                                                val catalogItem = CatalogItem(
                                                    id = productId,
                                                    name = product.name,
                                                    imageUrl = product.primaryImageUrl,
                                                    description = product.description,
                                                    isProduct = true,
                                                    rating = 0f
                                                )
                                                
                                                // Update shop's catalog
                                                val updatedShop = targetShop.copy(
                                                    catalog = targetShop.catalog + catalogItem
                                                )
                                                
                                                shopRepository.updateShop(updatedShop).onSuccess {
                                                    println("Shop catalog updated successfully")
                                                }.onFailure { error ->
                                                    println("Error updating shop catalog: ${error.message}")
                                                }
                                            }
                                        } catch (e: Exception) {
                                            println("Exception updating shop catalog: ${e.message}")
                                        }
                                    }
                                    
                                    navController.popBackStack()
                                }.onFailure { error ->
                                    println("Error saving product: ${error.message}")
                                    error.printStackTrace()
                                    // TODO: Show error to user
                                }
                            } else {
                                println("No shops found for user")
                                // TODO: Show error to user - need to create a shop first
                            }
                        } catch (e: Exception) {
                            println("Exception in product save: ${e.message}")
                            e.printStackTrace()
                            // TODO: Show error to user
                        }
                    }
                }
            )
        }
        
        composable(Destinations.ADD_SERVICE_ROUTE) {
            val coroutineScope = rememberCoroutineScope()
            val currentUser = FirebaseAuth.getInstance().currentUser
            val shopId = it.arguments?.getString("shopId") // Extract shopId from navigation arguments
            AddServiceScreen(
                onBack = { navController.popBackStack() },
                onSaveService = { serviceData ->
                    coroutineScope.launch {
                        try {
                            val userId = currentUser?.uid ?: return@launch
                            
                            // Use the shopId from navigation arguments
                            val targetShopId = shopId ?: run {
                                // Fallback to user's first shop if shopId is not provided
                                val shopRepository = FirebaseShopRepository.instance
                                val userShops = shopRepository.getShopsByOwner(userId)
                                userShops.firstOrNull()?.id
                            }
                            
                            if (targetShopId != null) {
                                // Convert ServiceData to Service model
                                val service = Service(
                                    shopId = targetShopId,
                                    ownerId = userId,
                                    name = serviceData.name,
                                    description = serviceData.description,
                                    basePrice = serviceData.basePrice,
                                    category = serviceData.category,
                                    estimatedDuration = serviceData.duration.toIntOrNull() ?: 60,
                                    expensePerUnit = serviceData.expensePerUnit,
                                    isBookable = serviceData.isAvailable,
                                    isActive = true,
                                    createdAt = System.currentTimeMillis(),
                                    updatedAt = System.currentTimeMillis()
                                )
                                
                                // Save to repository
                                val serviceRepository = ServiceRepository.instance
                                serviceRepository.createService(service).onSuccess { serviceId ->
                                    println("Service saved successfully with ID: $serviceId")
                                    
                                    // CRITICAL FIX: Also add to shop's catalog
                                    coroutineScope.launch {
                                        try {
                                            val shopRepository = FirebaseShopRepository.instance
                                            val targetShop = shopRepository.getShopById(targetShopId)
                                            
                                            if (targetShop != null) {
                                                val catalogItem = CatalogItem(
                                                    id = serviceId,
                                                    name = service.name,
                                                    imageUrl = service.primaryImageUrl,
                                                    description = service.description,
                                                    isProduct = false, // This is a service
                                                    rating = 0f
                                                )
                                                
                                                // Update shop's catalog
                                                val updatedShop = targetShop.copy(
                                                    catalog = targetShop.catalog + catalogItem
                                                )
                                                
                                                shopRepository.updateShop(updatedShop).onSuccess {
                                                    println("Shop catalog updated successfully with service")
                                                }.onFailure { error ->
                                                    println("Error updating shop catalog with service: ${error.message}")
                                                }
                                            }
                                        } catch (e: Exception) {
                                            println("Exception updating shop catalog with service: ${e.message}")
                                        }
                                    }
                                    
                                    navController.popBackStack()
                                }.onFailure { error ->
                                    println("Error saving service: ${error.message}")
                                    // TODO: Show error to user
                                }
                            } else {
                                println("No shops found for user")
                                // TODO: Show error to user - need to create a shop first
                            }
                        } catch (e: Exception) {
                            println("Error saving service: ${e.message}")
                            // TODO: Show error to user
                        }
                    }
                }
            )
        }
        
        // TODO: Add inventory, analytics, and accounting screens
        composable(Destinations.INVENTORY_ROUTE) {
            // Handle system back gesture
            BackHandler {
                navController.popBackStack()
            }
            
            val currentUser = FirebaseAuth.getInstance().currentUser
            var userShopId by remember { mutableStateOf<String?>(null) }
            
            LaunchedEffect(currentUser) {
                val userId = currentUser?.uid
                if (userId != null) {
                    try {
                        // Get user's first shop (for now - can be enhanced to select specific shop)
                        val shopRepository = FirebaseShopRepository.instance
                        val userShops = shopRepository.getShopsByOwner(userId)
                        
                        if (userShops.isNotEmpty()) {
                            val firstShop = userShops.first()
                            userShopId = firstShop.id
                            println("InventoryNavigation: Found shop ${firstShop.id} for user $userId")
                        } else {
                            println("InventoryNavigation: No shops found for user $userId")
                        }
                    } catch (e: Exception) {
                        println("InventoryNavigation: Error loading user shops: ${e.message}")
                    }
                }
            }
            
            userShopId?.let { shopId ->
                InventoryScreen(
                    shopId = shopId,
                    onBack = { navController.popBackStack() },
                    onNavigateToChangeListing = { listingId, listingType ->
                        navController.navigate("change_listing/$listingId/$listingType")
                    }
                )
            } ?: Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = HustleColors.BlueAccent)
            }
        }
        
        composable(
            route = "change_listing/{listingId}/{listingType}",
            arguments = listOf(
                navArgument("listingId") { type = NavType.StringType },
                navArgument("listingType") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val listingId = backStackEntry.arguments?.getString("listingId") ?: ""
            val listingType = backStackEntry.arguments?.getString("listingType") ?: ""
            
            ChangeListingScreen(
                listingId = listingId,
                listingType = listingType,
                onBack = { navController.popBackStack() }
            )
        }
        
        composable(Destinations.ANALYTICS_ROUTE) {
            // Handle system back gesture
            BackHandler {
                navController.popBackStack()
            }
            
            AnalyticsScreen(
                onBack = { navController.popBackStack() }
            )
        }
        
        composable(Destinations.ACCOUNTING_ROUTE) {
            // Handle system back gesture
            BackHandler {
                navController.popBackStack()
            }
            
            AccountingScreen(
                onBack = { navController.popBackStack() }
            )
        }
        
        // Booking Management
        composable(Destinations.BOOKING_MANAGEMENT_ROUTE) {
            BookingManagementScreen(
                onBack = {
                    Log.d("Navigation", "🟢 BookingManagement onBack called - popping back stack")
                    val popped = navController.popBackStack()
                    if (!popped) {
                        // Fallback only if no previous destination exists
                        navController.navigate(Destinations.HOME_ROUTE) {
                            popUpTo(navController.graph.startDestinationId) { inclusive = true }
                            launchSingleTop = true
                        }
                    }
                },
                onBookingRequestsClick = { navController.navigate(Destinations.BOOKING_REQUESTS_ROUTE) },
                onAllBookingsClick = { navController.navigate(Destinations.ALL_BOOKINGS_ROUTE) },
                onCalendarViewClick = { navController.navigate(Destinations.CALENDAR_VIEW_ROUTE) }
            )
        }
        
        // Booking Management with shop context
        composable(
            route = "${Destinations.BOOKING_MANAGEMENT_ROUTE}/{shopId}",
            arguments = listOf(navArgument("shopId") {
                type = NavType.StringType
            })
        ) { backStack ->
            val shopId = backStack.arguments!!.getString("shopId")!!
            BookingManagementScreen(
                shopId = shopId,
                onBack = {
                    Log.d("Navigation", "🟢 BookingManagement (with shopId) onBack called - popping back stack")
                    val popped = navController.popBackStack()
                    if (!popped) {
                        // Fallback only if no previous destination exists
                        navController.navigate(Destinations.HOME_ROUTE) {
                            popUpTo(navController.graph.startDestinationId) { inclusive = true }
                            launchSingleTop = true
                        }
                    }
                },
                onBookingRequestsClick = { navController.navigate("${Destinations.BOOKING_REQUESTS_ROUTE}/$shopId") },
                onAllBookingsClick = { navController.navigate("${Destinations.ALL_BOOKINGS_ROUTE}/$shopId") },
                onCalendarViewClick = { navController.navigate("${Destinations.CALENDAR_VIEW_ROUTE}/$shopId") }
            )
        }
        
        // Order Management
        composable(Destinations.ORDER_MANAGEMENT_ROUTE) {
            Log.d("OrderNavDebug", "🎯 ORDER MANAGEMENT COMPOSABLE - Starting to render")
            Log.d("OrderNavDebug", "🎯 ORDER MANAGEMENT COMPOSABLE - About to call OrderManagementScreen")
            OrderManagementScreen(
                onBack = { 
                    Log.d("OrderNavDebug", "🎯 ORDER MANAGEMENT SCREEN - Back button pressed")
                    Log.d("Navigation", "🟠 OrderManagement onBack called!")
                    navController.popBackStack() 
                }
            )
            Log.d("OrderNavDebug", "🎯 ORDER MANAGEMENT COMPOSABLE - OrderManagementScreen called")
        }
        
        // Order Management with shop context
        composable(
            route = "${Destinations.ORDER_MANAGEMENT_ROUTE}/{shopId}",
            arguments = listOf(navArgument("shopId") {
                type = NavType.StringType
            })
        ) { backStack ->
            val shopId = backStack.arguments!!.getString("shopId")!!
            OrderManagementScreen(
                shopId = shopId,
                onBack = { navController.popBackStack() }
            )
        }
        
        composable(Destinations.BOOKING_REQUESTS_ROUTE) {
            BookingRequestsScreen(
                onBack = { navController.popBackStack() },
                onNavigateToChat = { conversationId, customerName ->
                    navController.navigate("${Destinations.CHAT_ROUTE}/$conversationId/$customerName")
                }
            )
        }
        
        // Booking Requests with shop context
        composable(
            route = "${Destinations.BOOKING_REQUESTS_ROUTE}/{shopId}",
            arguments = listOf(navArgument("shopId") {
                type = NavType.StringType
            })
        ) { backStack ->
            val shopId = backStack.arguments!!.getString("shopId")!!
            BookingRequestsScreen(
                shopId = shopId,
                onBack = { navController.popBackStack() },
                onNavigateToChat = { conversationId, customerName ->
                    navController.navigate("${Destinations.CHAT_ROUTE}/$conversationId/$customerName")
                }
            )
        }
        
        composable(Destinations.ALL_BOOKINGS_ROUTE) {
            AllBookingsScreen(
                onBack = { navController.popBackStack() }
            )
        }
        
        // All Bookings with shop context
        composable(
            route = "${Destinations.ALL_BOOKINGS_ROUTE}/{shopId}",
            arguments = listOf(navArgument("shopId") {
                type = NavType.StringType
            })
        ) { backStack ->
            val shopId = backStack.arguments!!.getString("shopId")!!
            AllBookingsScreen(
                shopId = shopId,
                onBack = { navController.popBackStack() }
            )
        }
        
        composable(Destinations.CALENDAR_VIEW_ROUTE) {
            CalendarViewScreen(
                onBack = { navController.popBackStack() }
            )
        }
        
        // Calendar View with shop context
        composable(
            route = "${Destinations.CALENDAR_VIEW_ROUTE}/{shopId}",
            arguments = listOf(navArgument("shopId") {
                type = NavType.StringType
            })
        ) { backStack ->
            val shopId = backStack.arguments!!.getString("shopId")!!
            CalendarViewScreen(
                shopId = shopId,
                onBack = { navController.popBackStack() }
            )
        }
        
        // Messaging Routes
        composable(Destinations.MESSAGES_ROUTE) {
            MessagingScreen(
                onBack = {
                    Log.d("Navigation", "🔴 Messages onBack called!")
                    // Prefer to return to Profile if it exists in stack
                    val poppedToProfile = navController.popBackStack(
                        route = Destinations.PROFILE_ROUTE,
                        inclusive = false
                    )
                    if (!poppedToProfile) {
                        val popped = navController.popBackStack()
                        Log.d("Navigation", "🔴 Messages onBack generic pop result: $popped")
                        if (!popped) {
                            navController.navigate(Destinations.HOME_ROUTE) {
                                popUpTo(navController.graph.startDestinationId) { inclusive = true }
                                launchSingleTop = true
                            }
                        }
                    }
                },
                onConversationClick = { conversationId, otherUserName ->
                    navController.navigate("${Destinations.CHAT_ROUTE}/$conversationId/${java.net.URLEncoder.encode(otherUserName, "UTF-8")}")
                }
            )
        }
        
        composable(
            route = "${Destinations.CHAT_ROUTE}/{conversationId}/{otherUserName}",
            arguments = listOf(
                navArgument("conversationId") {
                    type = NavType.StringType
                },
                navArgument("otherUserName") {
                    type = NavType.StringType
                }
            )
        ) { backStackEntry ->
            val conversationId = backStackEntry.arguments?.getString("conversationId") ?: ""
            val otherUserName = backStackEntry.arguments?.getString("otherUserName")?.let {
                java.net.URLDecoder.decode(it, "UTF-8")
            } ?: "Unknown User"
            ChatScreen(
                conversationId = conversationId,
                otherUserName = otherUserName,
                onBack = { navController.popBackStack() }
            )
        }
        
        // Database Setup Screen
        composable(Destinations.SETUP_ROUTE) {
            SetupScreen(
                onBack = { navController.popBackStack() }
            )
        }
    }
}
