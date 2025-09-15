package com.blueclipse.myhustle.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.activity.compose.BackHandler
import coil.compose.AsyncImage
import com.blueclipse.myhustle.ui.theme.HustleColors
import com.blueclipse.myhustle.data.repository.CartRepository
import com.blueclipse.myhustle.data.model.CartItem
import com.blueclipse.myhustle.data.service.CheckoutService
import kotlinx.coroutines.launch
import me.nikhilchaudhari.library.neumorphic
import me.nikhilchaudhari.library.NeuInsets
import me.nikhilchaudhari.library.shapes.Punched
import me.nikhilchaudhari.library.shapes.Pressed

// Remove the old CartItem data class since we're importing it from model

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CheckoutScreen(
    onBack: () -> Unit,
    onCheckout: () -> Unit
) {
    // Use live cart data from CartRepository
    val cartRepository = CartRepository.instance
    val checkoutService = CheckoutService.instance
    val cartItems by cartRepository.cartItems.collectAsState()
    val cartTotal by cartRepository.totalPrice.collectAsState()
    val coroutineScope = rememberCoroutineScope()
    
    // State for checkout processing
    var isProcessingCheckout by remember { mutableStateOf(false) }
    var checkoutError by remember { mutableStateOf<String?>(null) }
    var shouldTriggerCheckout by remember { mutableStateOf(false) }
    
    // Handle system back gesture
    BackHandler {
        onBack()
    }
    var checkoutSuccess by remember { mutableStateOf(false) }
    
    // Refresh cart when screen is opened
    LaunchedEffect(Unit) {
        cartRepository.refreshCart()
    }
    
    // Handle checkout trigger without using composition-scoped coroutines
    LaunchedEffect(shouldTriggerCheckout) {
        if (shouldTriggerCheckout && cartItems.isNotEmpty() && !isProcessingCheckout) {
            isProcessingCheckout = true
            checkoutError = null
            shouldTriggerCheckout = false
            
            // Use async checkout to avoid composition scope issues
            checkoutService.processCheckoutAsync(
                onSuccess = { checkoutResult ->
                    if (checkoutResult.success) {
                        checkoutSuccess = true
                    } else {
                        checkoutError = checkoutResult.message
                        isProcessingCheckout = false
                    }
                },
                onFailure = { exception ->
                    checkoutError = exception.message ?: "Checkout failed"
                    isProcessingCheckout = false
                }
            )
        }
    }
    
    // Handle navigation after successful checkout
    LaunchedEffect(checkoutSuccess) {
        if (checkoutSuccess) {
            // Small delay to ensure UI updates are visible
            kotlinx.coroutines.delay(500)
            isProcessingCheckout = false
            onCheckout()
        }
    }
    
    val total = cartTotal
    
    // Handle checkout processing trigger
    val handleCheckout: () -> Unit = {
        if (cartItems.isNotEmpty() && !isProcessingCheckout) {
            shouldTriggerCheckout = true
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Checkout") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
        ) {
            if (cartItems.isEmpty()) {
                // Empty cart state
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "Your cart is empty",
                            style = MaterialTheme.typography.headlineSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Add some items to get started!",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            } else {
                // Your Items container with pressed neumorphic style
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f)
                        .neumorphic(
                            lightShadowColor = HustleColors.lightShadow,
                            darkShadowColor = HustleColors.darkShadow,
                            elevation = 8.dp,
                            neuInsets = NeuInsets(4.dp, 4.dp),
                            strokeWidth = 2.dp,
                            neuShape = Pressed.Rounded(radius = 20.dp)
                        ),
                    shape = RoundedCornerShape(20.dp),
                    color = Color.White
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp)
                    ) {
                        // Cart items header
                        Text(
                            text = "Your Items",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold,
                            color = Color.Black,
                            modifier = Modifier.padding(bottom = 16.dp)
                        )
                        
                        LazyColumn(
                            modifier = Modifier.weight(1f),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            items(cartItems) { item ->
                                CartItemCard(
                                    item = item,
                                    onRemove = { itemToRemove ->
                                        coroutineScope.launch {
                                            cartRepository.removeItem(itemToRemove.id)
                                        }
                                    },
                                    onUpdateQuantity = { itemId, newQuantity ->
                                        coroutineScope.launch {
                                            cartRepository.updateQuantity(itemId, newQuantity)
                                        }
                                    }
                                )
                            }
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(20.dp))
                
                // Order summary with pressed neumorphic style
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .neumorphic(
                            lightShadowColor = HustleColors.lightShadow,
                            darkShadowColor = HustleColors.darkShadow,
                            elevation = 6.dp,
                            neuInsets = NeuInsets(3.dp, 3.dp),
                            strokeWidth = 2.dp,
                            neuShape = Pressed.Rounded(radius = 16.dp)
                        ),
                    shape = RoundedCornerShape(16.dp),
                    color = Color.White
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp)
                    ) {
                        Text(
                            text = "Order Summary",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = Color.Black
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        
                        HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "Total:",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = Color.Black
                            )
                            Text(
                                text = "$${String.format("%.2f", total)}",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = HustleColors.Primary
                            )
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(20.dp))
                
                // Show error message if checkout failed
                checkoutError?.let { error ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 8.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = Color.Red.copy(alpha = 0.1f)
                        )
                    ) {
                        Text(
                            text = error,
                            color = Color.Red,
                            modifier = Modifier.padding(16.dp),
                            fontSize = 14.sp
                        )
                    }
                }
                
                // Checkout button
                Button(
                    onClick = handleCheckout,
                    enabled = cartItems.isNotEmpty() && !isProcessingCheckout,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = HustleColors.Primary
                    )
                ) {
                    if (isProcessingCheckout) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(20.dp),
                                color = Color.White,
                                strokeWidth = 2.dp
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Processing...",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    } else {
                        Text(
                            text = "Request Order",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun CartItemCard(
    item: CartItem,
    onRemove: (CartItem) -> Unit,
    onUpdateQuantity: (String, Int) -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .neumorphic(
                lightShadowColor = HustleColors.lightShadow,
                darkShadowColor = HustleColors.darkShadow,
                elevation = 4.dp,
                neuInsets = NeuInsets(2.dp, 2.dp),
                strokeWidth = 2.dp,
                neuShape = Punched.Rounded(radius = 12.dp)
            ),
        shape = RoundedCornerShape(12.dp),
        color = Color.White
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Product image
            AsyncImage(
                model = item.imageUrl,
                contentDescription = item.name,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(60.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color.White)
            )
            
            Spacer(modifier = Modifier.width(16.dp))
            
            // Product details
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = item.name,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                Text(
                    text = item.shopName,
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray
                )
                Text(
                    text = "$${String.format("%.2f", item.price)}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = HustleColors.Primary,
                    fontWeight = FontWeight.Bold
                )
            }
            
            // Quantity controls
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    modifier = Modifier
                        .size(32.dp)
                        .neumorphic(
                            lightShadowColor = HustleColors.lightShadow,
                            darkShadowColor = HustleColors.darkShadow,
                            elevation = 2.dp,
                            neuInsets = NeuInsets(1.dp, 1.dp),
                            strokeWidth = 1.dp,
                            neuShape = Punched.Rounded(radius = 8.dp)
                        ),
                    shape = RoundedCornerShape(8.dp),
                    color = Color.White
                ) {
                    IconButton(
                        onClick = {
                            if (item.quantity > 1) {
                                onUpdateQuantity(item.id, item.quantity - 1)
                            }
                        },
                        modifier = Modifier.size(32.dp)
                    ) {
                        Text(
                            text = "-", 
                            fontSize = 18.sp, 
                            fontWeight = FontWeight.Bold,
                            color = Color.Black
                        )
                    }
                }
                
                Text(
                    text = item.quantity.toString(),
                    modifier = Modifier.padding(horizontal = 12.dp),
                    style = MaterialTheme.typography.titleMedium,
                    color = Color.Black
                )
                
                Surface(
                    modifier = Modifier
                        .size(32.dp)
                        .neumorphic(
                            lightShadowColor = HustleColors.lightShadow,
                            darkShadowColor = HustleColors.darkShadow,
                            elevation = 2.dp,
                            neuInsets = NeuInsets(1.dp, 1.dp),
                            strokeWidth = 1.dp,
                            neuShape = Punched.Rounded(radius = 8.dp)
                        ),
                    shape = RoundedCornerShape(8.dp),
                    color = Color.White
                ) {
                    IconButton(
                        onClick = {
                            onUpdateQuantity(item.id, item.quantity + 1)
                        },
                        modifier = Modifier.size(32.dp)
                    ) {
                        Text(
                            text = "+", 
                            fontSize = 18.sp, 
                            fontWeight = FontWeight.Bold,
                            color = Color.Black
                        )
                    }
                }
            }
            
            // Remove button
            IconButton(onClick = { onRemove(item) }) {
                Icon(
                    Icons.Default.Delete,
                    contentDescription = "Remove item",
                    tint = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}
