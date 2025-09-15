package com.blueclipse.myhustle.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.blueclipse.myhustle.ui.theme.HustleColors
import me.nikhilchaudhari.library.neumorphic
import me.nikhilchaudhari.library.NeuInsets
import me.nikhilchaudhari.library.shapes.Pressed
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.lifecycle.viewmodel.compose.viewModel
import com.blueclipse.myhustle.ui.screens.business.MyStoresScreen
import com.blueclipse.myhustle.ui.screens.business.StoreManagementScreen
import com.blueclipse.myhustle.ui.viewmodel.AuthViewModel

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
    currentUser: com.google.firebase.auth.FirebaseUser? = null,
    authViewModel: AuthViewModel = viewModel()
) {
    var selectedTabIndex by rememberSaveable { mutableStateOf(1) } // Start with Hustles (marketplace)
    var selectedStoreId by rememberSaveable { mutableStateOf<String?>(null) } // Persist selected store across nav
    var storeRefreshTrigger by remember { mutableStateOf(0) } // Trigger to refresh stores
    
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
            // Profile tab
            2 -> {
                // From Profile tab, go to Hustles tab
                selectedTabIndex = 1
            }
        }
    }
    
    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.background
            ) {
                val items = listOf(
                    BottomNavItem.MyHustle,
                    BottomNavItem.Hustles,
                    BottomNavItem.Profile
                )
                
                items.forEachIndexed { index, item ->
                    NavigationBarItem(
                        icon = {
                            if (selectedTabIndex == index) {
                                // Selected item with pressed neumorphic style - EXACT copy from StoreProfileScreen
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(12.dp))
                                        .neumorphic(
                                            lightShadowColor = HustleColors.lightShadow,
                                            darkShadowColor = HustleColors.darkShadow,
                                            elevation = 8.dp,
                                            neuInsets = NeuInsets(6.dp, 6.dp),
                                            strokeWidth = 4.dp,
                                            neuShape = Pressed.Rounded(radius = 8.dp)
                                        )
                                        .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(12.dp))
                                        .padding(horizontal = 12.dp, vertical = 8.dp)
                                ) {
                                    Icon(
                                        imageVector = item.selectedIcon,
                                        contentDescription = item.title,
                                        tint = Color.Black
                                    )
                                }
                            } else {
                                Icon(
                                    imageVector = item.unselectedIcon,
                                    contentDescription = item.title
                                )
                            }
                        },
                        label = { 
                            if (selectedTabIndex == index) {
                                Text(
                                    item.title,
                                    color = Color.Black
                                )
                            } else {
                                Text(
                                    item.title,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        },
                        selected = false,
                        onClick = {
                            selectedTabIndex = index
                            // Clear selected store when changing tabs
                            selectedStoreId = null
                        }
                    )
                }
            }
        }
    ) { paddingValues ->
        Box(modifier = Modifier.padding(paddingValues)) {
            when (selectedTabIndex) {
                0 -> {
                    // My Hustle tab
                    if (selectedStoreId != null) {
                        StoreManagementScreen(
                            shopId = selectedStoreId,
                            onBack = { selectedStoreId = null },
                            onInventoryClick = onInventoryClick,
                            onAnalyticsClick = onAnalyticsClick,
                            onAccountingClick = onAccountingClick,
                            onBookingManagementClick = { onShopSpecificBookingManagementClick(selectedStoreId!!) },
                            onOrderManagementClick = { onShopSpecificOrderManagementClick(selectedStoreId!!) },
                            onAddProductClick = { onShopSpecificAddProductClick(selectedStoreId!!) },
                            onAddServiceClick = { onShopSpecificAddServiceClick(selectedStoreId!!) }
                        )
                    } else {
                        MyStoresScreen(
                            onStoreSelect = { store ->
                                selectedStoreId = store.id
                            },
                            onCreateStoreClick = {
                                onCreateStoreClick()
                                // Trigger refresh after potential store creation
                                storeRefreshTrigger += 1
                            },
                            onLoginClick = onSignInClick,
                            refreshTrigger = storeRefreshTrigger
                        )
                    }
                }
                1 -> {
                    // Hustles tab (marketplace)
                    MainScreen(
                        onStoreClick = onStoreClick,
                        onSignInClick = onSignInClick,
                        onCreateStoreClick = onCreateStoreClick,
                        onCheckoutClick = onCheckoutClick,
                        onProfileClick = { selectedTabIndex = 2 }, // Navigate to profile tab
                        onStoreManagementClick = { selectedTabIndex = 0 }, // Navigate to my hustle tab
                        currentUser = currentUser,
                        authViewModel = authViewModel
                    )
                }
                2 -> {
                    // Profile tab
                    ProfileScreen(
                        onBackClick = { }, // Not needed in tab context
                        onMessagesClick = onMessagesClick
                    )
                }
            }
        }
    }
}
