package com.example.myhustle.ui.screens

import android.util.Log
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.example.myhustle.data.repository.ShopRepository
import com.example.myhustle.ui.components.SearchBar
import com.example.myhustle.ui.components.ChipsRow
import com.example.myhustle.ui.components.StoreCard
import com.example.myhustle.ui.viewmodel.AuthViewModel
import androidx.compose.ui.Alignment

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
            "Open Now" -> shop.availability.contains("Open Now", ignoreCase = true)
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
                                onDismissRequest = { showDropdownMenu = false }
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
                options = listOf("All", "Featured", "Popular"),
                onSelect = { selectedCategory = it },
                showMoreDropdown = true,
                moreOptions = listOf("Coffee", "Tech", "Beauty", "Services", "Products", "Open Now"),
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
                    items(filteredShops) { shop ->
                        StoreCard(
                            logoUrl           = shop.logoUrl,
                            name              = shop.name,
                            desc              = shop.description,
                            rating            = shop.rating.toFloat(),
                            availability      = shop.availability.split(", "),
                            isFavorited       = shop.isFavorite,
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