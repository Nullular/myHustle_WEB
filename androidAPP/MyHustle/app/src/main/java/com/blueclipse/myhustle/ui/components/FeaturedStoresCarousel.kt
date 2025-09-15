package com.blueclipse.myhustle.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.blueclipse.myhustle.data.model.Shop
import kotlinx.coroutines.delay

@Composable
fun FeaturedStoresCarousel(
    stores: List<Shop>,
    onStoreClick: (String) -> Unit,
    onFavoriteToggled: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val listState = rememberLazyListState()
    
    // Auto-scroll effect for infinite repeating carousel
    LaunchedEffect(stores) {
        if (stores.isNotEmpty()) {
            // Start from the middle of the repeating list to allow seamless scrolling
            val startIndex = stores.size * 25 // Start in the middle
            listState.scrollToItem(startIndex)
            
            while (true) {
                delay(30) // Smoother and faster - 30ms intervals (1.5x faster than 100ms / 2.33)
                
                try {
                    val currentIndex = listState.firstVisibleItemIndex
                    val currentOffset = listState.firstVisibleItemScrollOffset
                    
                    // Smoothly scroll to the next position with more pixels for smoother movement
                    listState.scrollToItem(currentIndex, currentOffset + 3) // Move 3 pixels at a time (1.5x faster)
                    
                    // Reset to beginning when we get too far to prevent memory issues
                    if (currentIndex > stores.size * 40) {
                        listState.scrollToItem(stores.size * 10)
                    }
                } catch (e: Exception) {
                    // Handle any scroll exceptions gracefully
                }
            }
        }
    }
    
    // Create repeating list for infinite effect
    val repeatingStores = if (stores.isNotEmpty()) {
        // Repeat the stores list multiple times for infinite scrolling effect
        List(stores.size * 50) { index -> stores[index % stores.size] }
    } else {
        emptyList()
    }
    
    LazyRow(
        state = listState,
        contentPadding = PaddingValues(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        modifier = modifier
    ) {
        items(repeatingStores) { shop ->
            FeaturedStoreCard(
                shop = shop,
                onStoreClick = { onStoreClick(shop.id) },
                onFavoriteToggled = { onFavoriteToggled(shop.id) },
                modifier = Modifier.width(200.dp)
            )
        }
    }
}

@Composable
private fun FeaturedStoreCard(
    shop: Shop,
    onStoreClick: () -> Unit,
    onFavoriteToggled: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .height(280.dp)
            .clickable { onStoreClick() },
        shape = RoundedCornerShape(16.dp),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.2f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            // Banner section (top third)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(80.dp)
                    .clip(RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp))
            ) {
                if (shop.bannerUrl.isNotEmpty()) {
                    AsyncImage(
                        model = shop.bannerUrl,
                        contentDescription = "${shop.name} banner",
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                    // Gradient overlay for better text readability
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(
                                Brush.verticalGradient(
                                    colors = listOf(
                                        Color.Transparent,
                                        Color.Black.copy(alpha = 0.3f)
                                    )
                                )
                            )
                    )
                } else {
                    // Fallback gradient background
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(
                                Brush.linearGradient(
                                    colors = listOf(
                                        MaterialTheme.colorScheme.primaryContainer,
                                        MaterialTheme.colorScheme.secondaryContainer
                                    )
                                )
                            )
                    )
                }
                
                // Favorite button
                IconButton(
                    onClick = onFavoriteToggled,
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(4.dp)
                ) {
                    Icon(
                        imageVector = if (shop.isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                        contentDescription = if (shop.isFavorite) "Remove from favorites" else "Add to favorites",
                        tint = if (shop.isFavorite) Color.Red else Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
            
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(12.dp),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    // Store logo and info
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        AsyncImage(
                            model = shop.logoUrl,
                            contentDescription = "${shop.name} logo",
                            modifier = Modifier
                                .size(64.dp)
                                .clip(RoundedCornerShape(8.dp)),
                            contentScale = ContentScale.Crop
                        )
                        
                        Spacer(modifier = Modifier.width(8.dp))
                        
                        Column(
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(
                                text = shop.name,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            
                            // Rating
                            Row(
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Star,
                                    contentDescription = null,
                                    tint = Color(0xFFFFB000),
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(2.dp))
                                Text(
                                    text = String.format("%.1f", shop.rating),
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                                )
                            }
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    // Description
                    Text(
                        text = shop.description,
                        style = MaterialTheme.typography.bodySmall,
                        maxLines = 3,
                        overflow = TextOverflow.Ellipsis,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f)
                    )
                }
                
                // Hours
                Text(
                    text = "${shop.openTime24} - ${shop.closeTime24}",
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.primary,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
}
