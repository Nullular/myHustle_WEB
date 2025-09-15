package com.blueclipse.myhustle.ui.screens.business

import android.util.Log
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Store
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.blueclipse.myhustle.data.model.Shop
import com.blueclipse.myhustle.data.repository.FirebaseShopRepository
import com.blueclipse.myhustle.ui.components.StoreCard
import com.blueclipse.myhustle.ui.theme.HustleColors
import com.google.firebase.auth.FirebaseAuth

/**
 * Screen showing stores owned by the current user
 * User selects which store to manage
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MyStoresScreen(
    onStoreSelect: (Shop) -> Unit = {},
    onCreateStoreClick: () -> Unit = {},
    onLoginClick: () -> Unit = {},
    refreshTrigger: Int = 0 // Add trigger to force refresh
) {
    var ownedStores by remember { mutableStateOf<List<Shop>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    
    val currentUser = FirebaseAuth.getInstance().currentUser
    val repository = FirebaseShopRepository.instance

    // Load owned stores - refresh when user or trigger changes
    LaunchedEffect(currentUser?.uid, refreshTrigger) {
        val userId = currentUser?.uid
        if (userId != null) {
            try {
                isLoading = true
                errorMessage = null
                val stores = repository.getShopsByOwner(userId)
                ownedStores = stores
                Log.d("MyStoresScreen", "Loaded ${stores.size} stores for user $userId")
            } catch (e: Exception) {
                errorMessage = "Failed to load your stores: ${e.message}"
                Log.e("MyStoresScreen", "Error loading stores", e)
            } finally {
                isLoading = false
            }
        } else {
            errorMessage = "Please log in to view your stores"
            isLoading = false
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        text = "My Stores",
                        color = HustleColors.Primary,
                        fontWeight = FontWeight.Bold
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = HustleColors.LightestBlue
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onCreateStoreClick,
                containerColor = HustleColors.Primary
            ) {
                Icon(
                    Icons.Default.Store,
                    contentDescription = "Create Store",
                    tint = HustleColors.OnSurface
                )
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when {
                isLoading -> {
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center),
                        color = HustleColors.Primary
                    )
                }
                
                errorMessage != null -> {
                    Column(
                        modifier = Modifier.align(Alignment.Center),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = errorMessage!!,
                            color = MaterialTheme.colorScheme.error,
                            modifier = Modifier.padding(16.dp)
                        )
                        Button(
                            onClick = {
                                if (currentUser?.uid == null) {
                                    // Not logged in - redirect to login instead of retry
                                    onLoginClick()
                                } else {
                                    // Retry loading
                                    isLoading = true
                                    errorMessage = null
                                    // Trigger recomposition to retry
                                }
                            }
                        ) {
                            Text(if (currentUser?.uid == null) "Login" else "Retry")
                        }
                    }
                }
                
                ownedStores.isEmpty() -> {
                    Column(
                        modifier = Modifier
                            .align(Alignment.Center)
                            .padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            Icons.Default.Store,
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            tint = HustleColors.Secondary.copy(alpha = 0.6f)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "No Stores Yet",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold,
                            color = HustleColors.Primary
                        )
                        Text(
                            text = "Create your first store to start managing your business",
                            style = MaterialTheme.typography.bodyMedium,
                            color = HustleColors.Secondary,
                            modifier = Modifier.padding(top = 8.dp)
                        )
                        Spacer(modifier = Modifier.height(24.dp))
                        Button(
                            onClick = onCreateStoreClick,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = HustleColors.Primary
                            )
                        ) {
                            Icon(Icons.Default.Store, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Create Store")
                        }
                    }
                }
                
                else -> {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        item {
                            Text(
                                text = "Select a store to manage:",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.SemiBold,
                                color = HustleColors.Primary,
                                modifier = Modifier.padding(bottom = 8.dp)
                            )
                        }
                        
                        items(ownedStores) { store ->
                            StoreCard(
                                logoUrl = store.logoUrl,
                                name = store.name,
                                desc = store.description,
                                rating = store.rating.toFloat(),
                                openTime24 = store.openTime24,
                                closeTime24 = store.closeTime24,
                                isFavorited = false, // Not relevant for owner view
                                onFavoriteToggled = { /* Not needed for owner view */ },
                                onClick = { onStoreSelect(store) }
                            )
                        }
                    }
                }
            }
        }
    }
}
