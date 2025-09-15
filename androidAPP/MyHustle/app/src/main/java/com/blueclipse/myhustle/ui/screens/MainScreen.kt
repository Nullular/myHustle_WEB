package com.blueclipse.myhustle.ui.screens

import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.filled.Store
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.launch
import com.blueclipse.myhustle.data.repository.ShopRepository
import com.blueclipse.myhustle.ui.components.SearchBar
import com.blueclipse.myhustle.ui.components.ChipsRow
import com.blueclipse.myhustle.data.Constants.Categories.MAIN_FILTER_OPTIONS
import com.blueclipse.myhustle.data.Constants.Categories.MORE_FILTER_OPTIONS
import com.blueclipse.myhustle.ui.components.StoreCard
import com.blueclipse.myhustle.ui.components.FeaturedStoresCarousel
import com.blueclipse.myhustle.ui.viewmodel.AuthViewModel
import androidx.compose.ui.Alignment
import androidx.compose.ui.text.font.FontWeight

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    onStoreClick: (String) -> Unit,
    onCreateStoreClick: () -> Unit = {},
    onSignInClick: () -> Unit = {},
    onCheckoutClick: () -> Unit = {},
    onProfileClick: () -> Unit = {},
    onStoreManagementClick: () -> Unit = {},
    currentUser: com.google.firebase.auth.FirebaseUser? = null,
    authViewModel: AuthViewModel = viewModel()
) {
    val repository = ShopRepository.instance
    val shops by repository.shops.collectAsState()
    val isLoading by repository.isLoading.collectAsState()
    var query by rememberSaveable { mutableStateOf("") }
    var selectedCategory by rememberSaveable { mutableStateOf("All") }
    val coroutineScope = rememberCoroutineScope()
    var showDropdownMenu by remember { mutableStateOf(false) }
    var showMoreFiltersDropdown by remember { mutableStateOf(false) }
    
    // Load data when screen first appears
    LaunchedEffect(Unit) {
        repository.fetchShops()
    }

    val filteredShops = shops.filter { shop ->
        val matchesQuery = shop.name.contains(query, ignoreCase = true) || 
                          shop.description.contains(query, ignoreCase = true)
        val matchesCategory = when (selectedCategory) {
            "All" -> true
            "Featured" -> shop.isFavorite
            "Popular" -> shop.rating >= 4.5
            "Coffee" -> shop.name.contains("Coffee", ignoreCase = true)
            "Tech" -> shop.name.contains("Tech", ignoreCase = true) || shop.name.contains("Repair", ignoreCase = true)
            "Beauty" -> shop.name.contains("Soap", ignoreCase = true) || shop.name.contains("Beauty", ignoreCase = true)
            "Services" -> shop.catalog.any { !it.isProduct }
            "Products" -> shop.catalog.any { it.isProduct }
            "Open Now" -> {
                // Check if shop is currently open based on operating hours
                try {
                    val now = java.util.Calendar.getInstance()
                    val currentHour = now.get(java.util.Calendar.HOUR_OF_DAY)
                    val currentMinute = now.get(java.util.Calendar.MINUTE)
                    val currentMinutes = currentHour * 60 + currentMinute

                    val (openH, openM) = shop.openTime24.split(":").map { it.toIntOrNull() ?: 8 }
                    val (closeH, closeM) = shop.closeTime24.split(":").map { it.toIntOrNull() ?: 18 }
                    val openMinutes = openH * 60 + openM
                    val closeMinutes = if (closeH == 24 && closeM == 0) 24 * 60 else closeH * 60 + closeM

                    currentMinutes >= openMinutes && currentMinutes < closeMinutes
                } catch (e: Exception) {
                    false
                }
            }
            else -> true
        }
        matchesQuery && matchesCategory
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text("MyHustle")
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background,
                    titleContentColor = MaterialTheme.colorScheme.onBackground,
                    actionIconContentColor = MaterialTheme.colorScheme.onBackground
                ),
                actions = {
                    // Cart button (always visible)
                    IconButton(onClick = onCheckoutClick) {
                        Icon(
                            imageVector = Icons.Default.ShoppingCart,
                            contentDescription = "Cart"
                        )
                    }
                    
                    if (currentUser != null) {
                        // Signed in - show profile and user menu
                        IconButton(onClick = onProfileClick) {
                            Icon(
                                imageVector = Icons.Default.Person,
                                contentDescription = "Profile"
                            )
                        }
                        
                        Box {
                            IconButton(onClick = { showDropdownMenu = true }) {
                                Icon(
                                    imageVector = Icons.Default.MoreVert,
                                    contentDescription = "More Options"
                                )
                            }
                            DropdownMenu(
                                expanded = showDropdownMenu,
                                onDismissRequest = { showDropdownMenu = false },
                                modifier = Modifier.background(androidx.compose.ui.graphics.Color.White)
                            ) {
                                DropdownMenuItem(
                                    text = { 
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Icon(
                                                imageVector = Icons.Default.Store,
                                                contentDescription = "Store Management",
                                                modifier = Modifier.padding(end = 8.dp)
                                            )
                                            Text("Store Management")
                                        }
                                    },
                                    onClick = {
                                        showDropdownMenu = false
                                        onStoreManagementClick()
                                    }
                                )
                                DropdownMenuItem(
                                    text = { 
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Icon(
                                                imageVector = Icons.Default.ExitToApp,
                                                contentDescription = "Sign Out",
                                                modifier = Modifier.padding(end = 8.dp)
                                            )
                                            Text("Sign Out")
                                        }
                                    },
                                    onClick = {
                                        showDropdownMenu = false
                                        authViewModel.signOut()
                                    }
                                )
                            }
                        }
                    } else {
                        // Not signed in - show sign in button
                        TextButton(onClick = onSignInClick) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.Person,
                                    contentDescription = "Sign In",
                                    modifier = Modifier.padding(end = 4.dp)
                                )
                                Text("Sign In")
                            }
                        }
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onCreateStoreClick,
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = "Create New Store"
                )
            }
        }
    ) { innerPadding ->
        Column(Modifier.padding(innerPadding)) {
            // Search bar - full width at top
            SearchBar(
                query = query,
                onQueryChange = { query = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            )
            
            // Filter chips below search bar
            ChipsRow(
                selected = selectedCategory,
                options = MAIN_FILTER_OPTIONS,
                onSelect = { selectedCategory = it },
                showMoreDropdown = true,
                moreOptions = MORE_FILTER_OPTIONS,
                showMoreFiltersDropdown = showMoreFiltersDropdown,
                onMoreDropdownToggle = { showMoreFiltersDropdown = it }
            )

            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                if (isLoading && shops.isEmpty()) {
                    item {
                        Box(
                            modifier = Modifier.fillMaxWidth().padding(32.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator()
                        }
                    }
                } else {
                    // Featured stores carousel at the top
                    val featuredStores = shops.filter { it.featured }
                    if (featuredStores.isNotEmpty()) {
                        item {
                            Column {
                                Text(
                                    text = "Featured Stores",
                                    style = MaterialTheme.typography.headlineSmall,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 16.dp),
                                    color = MaterialTheme.colorScheme.onBackground
                                )
                                Spacer(modifier = Modifier.height(12.dp))
                                
                                FeaturedStoresCarousel(
                                    stores = featuredStores,
                                    onStoreClick = onStoreClick,
                                    onFavoriteToggled = { shopId ->
                                        coroutineScope.launch {
                                            val result = repository.toggleFavorite(shopId)
                                            if (result.isFailure) {
                                                Log.e("MainScreen", "Failed to toggle favorite: ${result.exceptionOrNull()}")
                                            }
                                        }
                                    }
                                )
                                
                                Spacer(modifier = Modifier.height(16.dp))
                            }
                        }
                    }
                    
                    // All filtered shops
                    items(filteredShops) { shop ->
                        StoreCard(
                            logoUrl           = shop.logoUrl,
                            name              = shop.name,
                            desc              = shop.description,
                            rating            = shop.rating.toFloat(),
                            openTime24        = shop.openTime24,
                            closeTime24       = shop.closeTime24,
                            isFavorited       = shop.isFavorite,
                            bannerUrl         = shop.bannerUrl,
                            onFavoriteToggled = { 
                                coroutineScope.launch {
                                    val result = repository.toggleFavorite(shop.id)
                                    if (result.isFailure) {
                                        Log.e("MainScreen", "Failed to toggle favorite: ${result.exceptionOrNull()}")
                                    }
                                }
                            },
                            onClick           = { onStoreClick(shop.id) },
                            modifier          = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
        }
    }
}