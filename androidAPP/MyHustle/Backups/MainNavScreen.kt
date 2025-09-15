package com.example.myhustle.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Store
import androidx.compose.material.icons.filled.Storefront
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Store
import androidx.compose.material.icons.outlined.Storefront
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.myhustle.data.model.Shop
import com.example.myhustle.ui.screens.business.MyStoresScreen
import com.example.myhustle.ui.screens.business.StoreManagementScreen
import com.example.myhustle.ui.viewmodel.AuthViewModel

sealed class BottomNavItem(
    val route: String,
    val title: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
) {
    object MyHustle : BottomNavItem(
        route = "my_hustle",
        title = "My Hustle",
        selectedIcon = Icons.Filled.Store,
        unselectedIcon = Icons.Outlined.Store
    )
    
    object Hustles : BottomNavItem(
        route = "hustles",
        title = "Hustles",
        selectedIcon = Icons.Filled.Storefront,
        unselectedIcon = Icons.Outlined.Storefront
    )
    
    object Profile : BottomNavItem(
        route = "profile",
        title = "Profile",
        selectedIcon = Icons.Filled.Person,
        unselectedIcon = Icons.Outlined.Person
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainNavScreen(
    onStoreClick: (String) -> Unit,
    onCreateStoreClick: () -> Unit = {},
    onSignInClick: () -> Unit = {},
    onCheckoutClick: () -> Unit = {},
    onStoreManagementClick: () -> Unit = {},
    onInventoryClick: () -> Unit = {},
    onAnalyticsClick: () -> Unit = {},
    onAccountingClick: () -> Unit = {},
    onBookingManagementClick: () -> Unit = {},
    onShopSpecificBookingManagementClick: (String) -> Unit = {},
    onOrderManagementClick: () -> Unit = {},
    onShopSpecificOrderManagementClick: (String) -> Unit = {},
    onAddProductClick: () -> Unit = {},
    onAddServiceClick: () -> Unit = {},
    onShopSpecificAddProductClick: (String) -> Unit = {},
    onShopSpecificAddServiceClick: (String) -> Unit = {},
    onMessagesClick: () -> Unit = {},
    onSetupClick: () -> Unit = {},
    onPopulateSampleDataClick: () -> Unit = {},
    currentUser: com.google.firebase.auth.FirebaseUser? = null,
    authViewModel: AuthViewModel = viewModel()
) {
    var selectedTabIndex by rememberSaveable { mutableStateOf(1) } // Start with Hustles (marketplace)
    var selectedStoreId by rememberSaveable { mutableStateOf<String?>(null) } // Persist selected store across nav
    // Intercept OS back to align with desired UX. Only enable when we actually handle it.
    val shouldHandleBack = selectedTabIndex != 1
    BackHandler(enabled = shouldHandleBack) {
        when (selectedTabIndex) {
            // My Hustle tab
            0 -> {
                if (selectedStoreId != null) {
                    // From Store Management back to store list
                    selectedStoreId = null
                } else {
                    // From My Hustle store list, go to Hustles tab
                    selectedTabIndex = 1
                }
            }
            // Profile tab → go to Hustles tab (instead of closing app)
            2 -> selectedTabIndex = 1
        }
    }

    
    val bottomNavItems = listOf(
        BottomNavItem.MyHustle,
        BottomNavItem.Hustles,
        BottomNavItem.Profile
    )

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                contentColor = MaterialTheme.colorScheme.onSurface
            ) {
                bottomNavItems.forEachIndexed { index, item ->
                    NavigationBarItem(
                        selected = selectedTabIndex == index,
                        onClick = { selectedTabIndex = index },
                        icon = {
                            Icon(
                                imageVector = if (selectedTabIndex == index) item.selectedIcon else item.unselectedIcon,
                                contentDescription = item.title
                            )
                        },
                        label = {
                            Text(
                                text = item.title,
                                style = MaterialTheme.typography.labelSmall
                            )
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = MaterialTheme.colorScheme.primary,
                            selectedTextColor = MaterialTheme.colorScheme.primary,
                            unselectedIconColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                            unselectedTextColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                            indicatorColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
                        )
                    )
                }
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when (selectedTabIndex) {
                0 -> {
                    // My Hustle - Store selection or management
            if (selectedStoreId == null) {
                        // Show store selection screen
                        MyStoresScreen(
                            onStoreSelect = { store ->
                selectedStoreId = store.id
                            },
                            onCreateStoreClick = onCreateStoreClick
                        )
                    } else {
                        // Show store management for selected store
            val currentStoreId = selectedStoreId
            if (currentStoreId != null) {
                            StoreManagementScreen(
                shopId = currentStoreId, // Pass the current shop ID
                onBack = { selectedStoreId = null }, // Go back to store selection
                                onInventoryClick = onInventoryClick,
                                onAnalyticsClick = onAnalyticsClick,
                                onAccountingClick = onAccountingClick,
                                onBookingManagementClick = { 
                                    // Use shop-specific booking management when a store is selected
                    onShopSpecificBookingManagementClick(currentStoreId)
                                },
                                onOrderManagementClick = {
                                    // Use shop-specific order management when a store is selected
                    onShopSpecificOrderManagementClick(currentStoreId)
                                },
                                onAddProductClick = { shopId -> 
                                    if (shopId != null) {
                                        onShopSpecificAddProductClick(shopId)
                                    } else {
                                        onAddProductClick() 
                                    }
                                },
                                onAddServiceClick = { shopId -> 
                                    if (shopId != null) {
                                        onShopSpecificAddServiceClick(shopId)
                                    } else {
                                        onAddServiceClick() 
                                    }
                                },
                                onPopulateSampleDataClick = onPopulateSampleDataClick
                            )
                        }
                    }
                }
                1 -> {
                    // Hustles - All stores marketplace
                    MainScreen(
                        onStoreClick = onStoreClick,
                        onCreateStoreClick = onCreateStoreClick,
                        onSignInClick = onSignInClick,
                        onCheckoutClick = onCheckoutClick,
                        onProfileClick = { selectedTabIndex = 2 }, // Navigate to profile tab
                        onStoreManagementClick = { selectedTabIndex = 0 }, // Navigate to my hustle tab
                        currentUser = currentUser,
                        authViewModel = authViewModel
                    )
                }
                2 -> {
                    // Profile - User profile, settings, messages
                    ProfileScreen(
                        onBackClick = { /* No back action needed in tab navigation */ },
                        onMessagesClick = onMessagesClick,
                        onSetupClick = onSetupClick
                    )
                }
            }
        }
    }
}
