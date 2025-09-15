@file:kotlin.OptIn(ExperimentalMaterial3Api::class)

package com.example.myhustle.ui.screens

import android.view.ViewGroup
import android.view.ViewGroup.LayoutParams.MATCH_PARENT
import androidx.annotation.OptIn
import androidx.annotation.RawRes
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Message
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material3.*
import androidx.compose.runtime.*
import kotlinx.coroutines.launch
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ExperimentalGraphicsApi
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.media3.common.util.UnstableApi
import coil.compose.AsyncImage
import com.example.myhustle.R
import com.example.myhustle.data.model.CatalogItem
import com.example.myhustle.data.model.Shop
import com.example.myhustle.data.repository.ShopRepository
import com.example.myhustle.data.repository.ChatRepository
import com.example.myhustle.ui.components.RatingBar
import com.example.myhustle.ui.components.AGSLVideoBackground
import com.example.myhustle.ui.theme.HustleShapes
import com.example.myhustle.ui.theme.HustleColors
import me.nikhilchaudhari.library.NeuInsets
import me.nikhilchaudhari.library.neumorphic
import me.nikhilchaudhari.library.shapes.Punched
import me.nikhilchaudhari.library.shapes.Pressed
import com.example.myhustle.data.model.ReviewTargetType
import com.example.myhustle.ui.components.ReviewsPanel
import com.google.firebase.auth.FirebaseAuth
import android.util.Log


@OptIn(UnstableApi::class)
@Composable
fun StoreProfileScreen(
    shopId: String,
    onBack: () -> Unit,
    onCatalogItemClick: (CatalogItem) -> Unit,
    onNavigateToChat: (String, String) -> Unit = { _, _ -> } // chatId, chatTitle
) {
    val shops by ShopRepository.instance.shops.collectAsState(initial = emptyList())
    val shop: Shop? = shops.firstOrNull { it.id == shopId }
    val coroutineScope = rememberCoroutineScope()
    
    // State for messaging functionality
    var showMessageDialog by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    val currentUser = FirebaseAuth.getInstance().currentUser

    if (shop == null) {
        Box(
            Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator()
        }
        return
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header with banner and store info
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(320.dp)
                    .neumorphic(
                        lightShadowColor = HustleColors.lightShadow,
                        darkShadowColor = HustleColors.darkShadow,
                        elevation = 8.dp,
                        neuInsets = NeuInsets(6.dp, 6.dp),
                        strokeWidth = 3.dp,
                        neuShape = Punched.Rounded(radius = 0.dp)
                    )
                    .background(MaterialTheme.colorScheme.surface)
            ) {
                // Banner image
                AsyncImage(
                    model = shop.bannerUrl,
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp)
                        .clip(RoundedCornerShape(bottomStart = 20.dp, bottomEnd = 20.dp))
                )
                
                // Top navigation
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    // Back button
                    IconButton(
                        onClick = onBack,
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .neumorphic(
                                lightShadowColor = HustleColors.lightShadow,
                                darkShadowColor = HustleColors.darkShadow,
                                elevation = 4.dp,
                                neuInsets = NeuInsets(4.dp, 4.dp),
                                strokeWidth = 2.dp,
                                neuShape = Punched.Rounded(radius = 24.dp)
                            )
                            .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.9f))
                    ) {
                        Icon(
                            Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = MaterialTheme.colorScheme.onSurface
                        )
                    }

                    // Action buttons
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        IconButton(
                            onClick = { /* Share */ },
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                                .neumorphic(
                                    lightShadowColor = HustleColors.lightShadow,
                                    darkShadowColor = HustleColors.darkShadow,
                                    elevation = 4.dp,
                                    neuInsets = NeuInsets(4.dp, 4.dp),
                                    strokeWidth = 2.dp,
                                    neuShape = Punched.Rounded(radius = 24.dp)
                                )
                                .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.9f))
                        ) {
                            Icon(
                                Icons.Default.Share,
                                contentDescription = "Share",
                                tint = MaterialTheme.colorScheme.onSurface
                            )
                        }

                        IconButton(
                            onClick = { 
                                coroutineScope.launch {
                                    val result = ShopRepository.instance.toggleFavorite(shop.id)
                                    if (result.isFailure) {
                                        // Handle error - could show a toast or snackbar
                                    }
                                }
                            },
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                                .neumorphic(
                                    lightShadowColor = HustleColors.lightShadow,
                                    darkShadowColor = HustleColors.darkShadow,
                                    elevation = if (shop.isFavorite) 8.dp else 4.dp,
                                    neuInsets = NeuInsets(4.dp, 4.dp),
                                    strokeWidth = if (shop.isFavorite) 8.dp else 2.dp,
                                    neuShape = if (shop.isFavorite) 
                                        Pressed.Rounded(radius = 4.dp)
                                    else 
                                        Punched.Rounded(radius = 24.dp)
                                )
                                .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.9f))
                        ) {
                            Icon(
                                if (shop.isFavorite) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                                contentDescription = "Favorite",
                                tint = if (shop.isFavorite) Color.Red else MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }

                // Store logo and info
                Column(
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .padding(start = 20.dp, end = 20.dp, top = 20.dp, bottom = 32.dp),
                    horizontalAlignment = Alignment.Start
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        // Store logo
                        Box(
                            modifier = Modifier
                                .size(80.dp)
                                .neumorphic(
                                    lightShadowColor = HustleColors.lightShadow,
                                    darkShadowColor = HustleColors.darkShadow,
                                    elevation = 6.dp,
                                    neuInsets = NeuInsets(4.dp, 4.dp),
                                    strokeWidth = 2.dp,
                                    neuShape = Punched.Rounded(radius = 20.dp)
                                )
                                .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(20.dp))
                                .padding(8.dp)
                        ) {
                            AsyncImage(
                                model = shop.logoUrl,
                                contentDescription = null,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier
                                    .fillMaxSize()
                                    .clip(RoundedCornerShape(12.dp))
                            )
                        }

                        // Store name and rating
                        Column {
                            Text(
                                text = shop.name,
                                style = MaterialTheme.typography.headlineMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Icon(
                                    Icons.Default.Star,
                                    contentDescription = null,
                                    tint = Color(0xFFFFD700),
                                    modifier = Modifier.size(20.dp)
                                )
                                Text(
                                    text = String.format("%.1f", shop.rating),
                                    style = MaterialTheme.typography.bodyLarge,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                    }
                }
            }
        }

        // Availability section - right under main banner
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
            ) {
                Text(
                    text = "Availability",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                    modifier = Modifier.padding(bottom = 12.dp)
                )
                
                // Operating hours display
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Compute current status based on operating hours
                    val statusList = try {
                        val now = java.util.Calendar.getInstance()
                        val currentHour = now.get(java.util.Calendar.HOUR_OF_DAY)
                        val currentMinute = now.get(java.util.Calendar.MINUTE)
                        val currentMinutes = currentHour * 60 + currentMinute

                        val (openH, openM) = shop.openTime24.split(":").map { it.toIntOrNull() ?: 8 }
                        val (closeH, closeM) = shop.closeTime24.split(":").map { it.toIntOrNull() ?: 18 }
                        val openMinutes = openH * 60 + openM
                        val closeMinutes = if (closeH == 24 && closeM == 0) 24 * 60 else closeH * 60 + closeM

                        val isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes
                        
                        if (isOpen) {
                            val closeTimeFormatted = if (closeH == 24 && closeM == 0) {
                                "12:00 AM"
                            } else {
                                val hour12 = if (closeH == 0) 12 else if (closeH > 12) closeH - 12 else closeH
                                val amPm = if (closeH < 12) "AM" else "PM"
                                String.format("%d:%02d %s", hour12, closeM, amPm)
                            }
                            listOf("Open Now", "Closes at $closeTimeFormatted")
                        } else {
                            val openTimeFormatted = run {
                                val hour12 = if (openH == 0) 12 else if (openH > 12) openH - 12 else openH
                                val amPm = if (openH < 12) "AM" else "PM"
                                String.format("%d:%02d %s", hour12, openM, amPm)
                            }
                            listOf("Closed", "Opens at $openTimeFormatted")
                        }
                    } catch (e: Exception) {
                        listOf("Hours unavailable")
                    }
                    
                    items(statusList) { slot ->
                        Box(
                            modifier = Modifier
                                .background(
                                    color = when {
                                        slot.contains("Open Now", ignoreCase = true) -> androidx.compose.ui.graphics.Color(0xFF4CAF50)
                                        slot.contains("Closed", ignoreCase = true) -> androidx.compose.ui.graphics.Color(0xFFF44336)
                                        else -> MaterialTheme.colorScheme.surface
                                    },
                                    shape = RoundedCornerShape(12.dp)
                                )
                                .padding(horizontal = 12.dp, vertical = 8.dp)
                        ) {
                            Text(
                                text = slot,
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.Medium,
                                color = when {
                                    slot.contains("Open Now", ignoreCase = true) || slot.contains("Closed", ignoreCase = true) -> 
                                        androidx.compose.ui.graphics.Color.White
                                    else -> MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f)
                                }
                            )
                        }
                    }
                }
            }
        }

        // About section
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .neumorphic(
                        lightShadowColor = HustleColors.lightShadow,
                        darkShadowColor = HustleColors.darkShadow,
                        elevation = 6.dp,
                        neuInsets = NeuInsets(4.dp, 4.dp),
                        strokeWidth = 2.dp,
                        neuShape = Punched.Rounded(radius = 20.dp)
                    )
                    .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(20.dp))
                    .padding(20.dp)
            ) {
                Column {
                    Text(
                        text = "About",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = shop.description,
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f),
                        lineHeight = 24.sp
                    )
                }
            }
        }

        // Products & Services
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .neumorphic(
                        lightShadowColor = HustleColors.lightShadow,
                        darkShadowColor = HustleColors.darkShadow,
                        elevation = 8.dp,
                        neuInsets = NeuInsets(6.dp, 6.dp),
                        strokeWidth = 4.dp,
                        neuShape = Pressed.Rounded(radius = 8.dp)
                    )
                    .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(20.dp))
                    .padding(24.dp)
            ) {
                Column {
                    Text(
                        text = "Products & Services",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        contentPadding = PaddingValues(bottom = 16.dp),
                        modifier = Modifier.heightIn(max = 400.dp)
                    ) {
                        items(shop.catalog) { item ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .neumorphic(
                                        lightShadowColor = HustleColors.lightShadow,
                                        darkShadowColor = HustleColors.darkShadow,
                                        elevation = 4.dp,
                                        neuInsets = NeuInsets(4.dp, 4.dp),
                                        strokeWidth = 2.dp,
                                        neuShape = Punched.Rounded(radius = 16.dp)
                                    )
                                    .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(16.dp))
                                    .clickable { onCatalogItemClick(item) }
                                    .padding(16.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(16.dp)
                            ) {
                                // Product image
                                AsyncImage(
                                    model = item.imageUrl,
                                    contentDescription = item.name,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier
                                        .size(80.dp)
                                        .clip(RoundedCornerShape(12.dp))
                                )
                                
                                // Product details
                                Column(
                                    modifier = Modifier.weight(1f),
                                    verticalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Text(
                                        text = item.name,
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.Bold,
                                        maxLines = 2,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                                    ) {
                                        Icon(
                                            Icons.Default.Star,
                                            contentDescription = null,
                                            tint = Color(0xFFFFD700),
                                            modifier = Modifier.size(16.dp)
                                        )
                                        Text(
                                            text = String.format("%.1f", item.rating),
                                            style = MaterialTheme.typography.bodyMedium,
                                            fontWeight = FontWeight.Medium,
                                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f)
                                        )
                                    }
                                    
                                    if (item.description.isNotEmpty()) {
                                        Text(
                                            text = item.description,
                                            style = MaterialTheme.typography.bodySmall,
                                            maxLines = 2,
                                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Contact Details - Last section
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .neumorphic(
                        lightShadowColor = HustleColors.lightShadow,
                        darkShadowColor = HustleColors.darkShadow,
                        elevation = 6.dp,
                        neuInsets = NeuInsets(4.dp, 4.dp),
                        strokeWidth = 2.dp,
                        neuShape = Punched.Rounded(radius = 20.dp)
                    )
                    .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(20.dp))
                    .padding(20.dp)
            ) {
                Column {
                    Text(
                        text = "Contact Details",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Icon(
                            Icons.Default.LocationOn,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(20.dp)
                        )
                        Text(
                            text = "123 Business Street, City",
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Icon(
                            Icons.Default.Phone,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(20.dp)
                        )
                        Text(
                            text = "+1 (555) 123-4567",
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    // Contact Owner Button
                    Button(
                        onClick = {
                            if (currentUser != null && shop.ownerId.isNotEmpty()) {
                                showMessageDialog = true
                            } else {
                                errorMessage = "Please log in to contact the store owner"
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = HustleColors.BlueAccent
                        )
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                Icons.Default.Message,
                                contentDescription = null,
                                tint = Color.White
                            )
                            Text(
                                text = "Contact Store Owner",
                                color = Color.White,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }
            }
        }

        // Store Reviews Section
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .neumorphic(
                        lightShadowColor = HustleColors.lightShadow,
                        darkShadowColor = HustleColors.darkShadow,
                        elevation = 8.dp,
                        neuInsets = NeuInsets(6.dp, 6.dp),
                        strokeWidth = 4.dp,
                        neuShape = Pressed.Rounded(radius = 8.dp)
                    )
                    .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(20.dp))
                    .padding(24.dp)
            ) {
                ReviewsPanel(
                    targetType = ReviewTargetType.SHOP,
                    targetId = shop.id,
                    targetName = shop.name,
                    shopId = shop.id,
                    headerTitle = "Customer Reviews",
                    currentRating = shop.rating.toFloat(),
                    currentTotalReviews = shop.totalReviews,
                    showWriteButton = true,
                    showHelpful = false,
                    wrapInSectionCard = false
                )
            }
        }

        // Bottom spacing
        item {
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
    
    // Error message snackbar
    errorMessage?.let { message ->
        LaunchedEffect(message) {
            // Show error and clear after 3 seconds
            kotlinx.coroutines.delay(3000)
            errorMessage = null
        }
        
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            contentAlignment = Alignment.BottomCenter
        ) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.Red.copy(alpha = 0.9f)),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(
                    text = message,
                    color = Color.White,
                    modifier = Modifier.padding(16.dp),
                    style = MaterialTheme.typography.bodyMedium
                )
            }
        }
    }
    
    // Message Dialog
    if (showMessageDialog && shop != null) {
        StoreOwnerMessageDialog(
            storeName = shop.name,
            onDismiss = { 
                showMessageDialog = false
            },
            onSendMessage = { message, navigateToChat ->
                coroutineScope.launch {
                    try {
                        val currentUserId = currentUser?.uid
                        if (currentUserId == null) {
                            errorMessage = "User not authenticated"
                            return@launch
                        }
                        
                        if (shop.ownerId.isEmpty()) {
                            errorMessage = "Store owner information not available"
                            return@launch
                        }
                        
                        Log.d("StoreProfile", "Creating chat with store owner: ${shop.ownerId}")
                        
                        val chatRepository = ChatRepository.instance
                        
                        // Create or get existing chat with the store owner
                        val chatResult = chatRepository.createOrGetDirectChat(shop.ownerId)
                        
                        if (chatResult.isSuccess) {
                            val chatId = chatResult.getOrNull()!!
                            
                            // Send the message about the store
                            val messageResult = chatRepository.sendMessage(
                                chatId = chatId,
                                content = "Hi! I'm interested in your store '${shop.name}'. $message"
                            )
                            
                            if (messageResult.isSuccess) {
                                Log.d("StoreProfile", "Message sent successfully")
                                showMessageDialog = false
                                
                                if (navigateToChat) {
                                    Log.d("StoreProfile", "Navigating to chat screen")
                                    onNavigateToChat(chatId, shop.name)
                                }
                            } else {
                                Log.e("StoreProfile", "Failed to send message: ${messageResult.exceptionOrNull()?.message}")
                                errorMessage = "Failed to send message. Please try again."
                            }
                        } else {
                            Log.e("StoreProfile", "Failed to create/get chat: ${chatResult.exceptionOrNull()?.message}")
                            errorMessage = "Failed to create chat. Please try again."
                        }
                    } catch (e: Exception) {
                        Log.e("StoreProfile", "Exception sending message", e)
                        errorMessage = "Failed to send message: ${e.message}"
                    } finally {
                        showMessageDialog = false
                    }
                }
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun StoreOwnerMessageDialog(
    storeName: String,
    onDismiss: () -> Unit,
    onSendMessage: (String, Boolean) -> Unit
) {
    var message by remember { mutableStateOf("") }
    
    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = Color.White
        ) {
            Column(
                modifier = Modifier.padding(20.dp)
            ) {
                Text(
                    text = "Contact Store Owner",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Text(
                    text = "Send a message about '$storeName'",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                OutlinedTextField(
                    value = message,
                    onValueChange = { message = it },
                    label = { Text("Your Message") },
                    placeholder = { Text("Ask about products, services, or store hours...") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(120.dp),
                    maxLines = 4,
                    shape = RoundedCornerShape(12.dp)
                )
                
                Spacer(modifier = Modifier.height(20.dp))
                
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Cancel")
                    }
                    
                    Button(
                        onClick = { 
                            onSendMessage(message, false) // Send only, don't navigate
                        },
                        enabled = message.isNotBlank(),
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = HustleColors.BlueAccent
                        )
                    ) {
                        Text("Send")
                    }
                    
                    Button(
                        onClick = { 
                            onSendMessage(message, true) // Send and navigate to chat
                        },
                        enabled = message.isNotBlank(),
                        modifier = Modifier.weight(1.2f),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF4CAF50) // Success green
                        )
                    ) {
                        Text("Send & Chat", fontSize = 13.sp)
                    }
                }
            }
        }
    }
}
