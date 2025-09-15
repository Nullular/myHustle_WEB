package com.blueclipse.myhustle.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import kotlinx.coroutines.launch
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.blueclipse.myhustle.data.model.Product
import com.blueclipse.myhustle.data.repository.ProductRepository
import com.blueclipse.myhustle.data.repository.CartRepository
import com.google.firebase.auth.FirebaseAuth
import com.blueclipse.myhustle.ui.theme.HustleColors
import me.nikhilchaudhari.library.NeuInsets
import me.nikhilchaudhari.library.neumorphic
import me.nikhilchaudhari.library.shapes.Punched
import me.nikhilchaudhari.library.shapes.Pressed
import com.blueclipse.myhustle.data.model.ReviewTargetType
import com.blueclipse.myhustle.ui.components.ReviewsPanel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductScreen(
    itemId: String,
    onBack: () -> Unit,
    onLoginClick: (() -> Unit)? = null,
    onCheckoutClick: (() -> Unit)? = null
) {
    // Load product data from ProductRepository
    val productRepository = ProductRepository.instance
    val cartRepository = CartRepository.instance
    val auth = FirebaseAuth.getInstance()
    val currentUser = auth.currentUser
    var product by remember { mutableStateOf<Product?>(null) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    // Load product data
    LaunchedEffect(itemId) {
        isLoading = true
        try {
            productRepository.getProductById(itemId).onSuccess { productData ->
                product = productData
                isLoading = false
            }.onFailure { error ->
                errorMessage = "Failed to load product: ${error.message}"
                isLoading = false
            }
        } catch (e: Exception) {
            errorMessage = "Error loading product: ${e.message}"
            isLoading = false
        }
    }

    if (isLoading) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator()
        }
        return
    }

    if (errorMessage != null || product == null) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = errorMessage ?: "Product not found",
                    color = if (errorMessage != null) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface
                )
                Button(onClick = onBack) {
                    Text("Go Back")
                }
            }
        }
        return
    }

    // Coroutine scope for async operations
    val coroutineScope = rememberCoroutineScope()

    // UI state
    var selectedVariant by rememberSaveable { mutableStateOf(0) }
    var quantity by rememberSaveable { mutableStateOf(1) }
    var selectedSize by rememberSaveable { mutableStateOf("M") }
    var isFavorite by rememberSaveable { mutableStateOf(false) }

    // Use actual product variants or fallback to basic variants
    val variants = if (product!!.variants.isNotEmpty()) {
        product!!.variants
    } else {
        listOf() // No variants available
    }
    
    val sizes = if (product!!.sizeVariants.isNotEmpty()) {
        product!!.sizeVariants.map { it.size }
    } else {
        listOf("XS", "S", "M", "L", "XL") // Default sizes
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Product Details",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { /* Share product */ }) {
                        Icon(
                            imageVector = Icons.Default.Share,
                            contentDescription = "Share"
                        )
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(paddingValues)
        ) {
            Spacer(modifier = Modifier.height(16.dp))

            // Product Image
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(400.dp)
                    .padding(horizontal = 16.dp)
                    .clip(RoundedCornerShape(24.dp))
                    .neumorphic(
                        lightShadowColor = HustleColors.lightShadow,
                        darkShadowColor = HustleColors.darkShadow,
                        elevation = 8.dp,
                        neuInsets = NeuInsets(8.dp, 8.dp),
                        strokeWidth = 2.dp,
                        neuShape = Punched.Rounded(radius = 24.dp)
                    )
                    .background(MaterialTheme.colorScheme.surface)
            ) {
                AsyncImage(
                    model = product!!.primaryImageUrl,
                    contentDescription = product!!.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxSize()
                        .clip(RoundedCornerShape(20.dp))
                )
                
                // Favorite button
                IconButton(
                    onClick = { isFavorite = !isFavorite },
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(16.dp)
                        .size(48.dp)
                        .neumorphic(
                            lightShadowColor = HustleColors.lightShadow,
                            darkShadowColor = HustleColors.darkShadow,
                            elevation = 4.dp,
                            neuInsets = NeuInsets(2.dp, 2.dp),
                            strokeWidth = 2.dp,
                            neuShape = if (isFavorite) 
                                Pressed.Rounded(radius = 12.dp)
                            else 
                                Punched.Rounded(radius = 12.dp)
                        )
                        .background(
                            MaterialTheme.colorScheme.surface,
                            CircleShape
                        )
                ) {
                    Icon(
                        imageVector = if (isFavorite) Icons.Default.Favorite else Icons.Outlined.FavoriteBorder,
                        contentDescription = null,
                        tint = if (isFavorite) Color.Red else MaterialTheme.colorScheme.onSurface
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Variant selector (only show if variants exist)
            if (variants.isNotEmpty()) {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    contentPadding = PaddingValues(horizontal = 16.dp)
                ) {
                    items(variants.size) { index ->
                        val variant = variants[index]
                        Box(
                            modifier = Modifier
                                .size(80.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .neumorphic(
                                    lightShadowColor = HustleColors.lightShadow,
                                    darkShadowColor = HustleColors.darkShadow,
                                    elevation = if (selectedVariant == index) 8.dp else 4.dp,
                                    neuInsets = NeuInsets(4.dp, 4.dp),
                                    strokeWidth = if (selectedVariant == index) 8.dp else 2.dp,
                                    neuShape = if (selectedVariant == index) 
                                        Pressed.Rounded(radius = 4.dp)
                                    else 
                                        Punched.Rounded(radius = 16.dp)
                                )
                                .background(MaterialTheme.colorScheme.surface)
                                .clickable { selectedVariant = index }
                                .padding(8.dp)
                        ) {
                            AsyncImage(
                                model = if (variant.imageUrl.isNotEmpty()) variant.imageUrl else product!!.primaryImageUrl,
                                contentDescription = variant.value,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier
                                    .fillMaxSize()
                                    .clip(RoundedCornerShape(8.dp))
                            )
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(24.dp))
            }

            // Product Info Card
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
                    // Product name and rating
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.Top
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = product!!.name,
                                style = MaterialTheme.typography.headlineMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = product!!.category,
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                            )
                        }
                        
                        // Rating
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Star,
                                contentDescription = null,
                                tint = Color(0xFFFFD700),
                                modifier = Modifier.size(20.dp)
                            )
                            Text(
                                text = String.format("%.1f", product!!.rating),
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.Medium,
                                modifier = Modifier.padding(start = 4.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Price section - Calculate based on selected variant
                    val currentPrice = if (variants.isNotEmpty() && selectedVariant < variants.size) {
                        variants[selectedVariant].price
                    } else {
                        product!!.price
                    }
                    
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "$${String.format("%.2f", currentPrice)}",
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold,
                            color = HustleColors.BlueAccent
                        )
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // Size selector (only show if size variants exist)
                    if (product!!.sizeVariants.isNotEmpty()) {
                        Text(
                            text = "Size",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Medium
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            items(product!!.sizeVariants) { sizeVariant ->
                                Box(
                                    modifier = Modifier
                                        .size(48.dp)
                                        .clip(RoundedCornerShape(12.dp))
                                        .neumorphic(
                                            lightShadowColor = HustleColors.lightShadow,
                                            darkShadowColor = HustleColors.darkShadow,
                                            elevation = if (selectedSize == sizeVariant.size) 8.dp else 4.dp,
                                            neuInsets = NeuInsets(4.dp, 4.dp),
                                            strokeWidth = if (selectedSize == sizeVariant.size) 8.dp else 2.dp,
                                            neuShape = if (selectedSize == sizeVariant.size) 
                                                Pressed.Rounded(radius = 4.dp)
                                            else 
                                                Punched.Rounded(radius = 12.dp)
                                        )
                                        .background(MaterialTheme.colorScheme.surface)
                                        .clickable { selectedSize = sizeVariant.size },
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = sizeVariant.size,
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontWeight = if (selectedSize == sizeVariant.size) FontWeight.Bold else FontWeight.Normal,
                                        color = if (selectedSize == sizeVariant.size) 
                                            MaterialTheme.colorScheme.primary 
                                        else 
                                            MaterialTheme.colorScheme.onSurface
                                    )
                                }
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(20.dp))
                    }

                    // Quantity selector
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Quantity",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Medium
                        )
                        
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(
                                onClick = { if (quantity > 1) quantity-- },
                                modifier = Modifier
                                    .size(40.dp)
                                    .neumorphic(
                                        neuShape = Punched.Rounded(radius = 16.dp),
                                        lightShadowColor = HustleColors.lightShadow,
                                        darkShadowColor = HustleColors.darkShadow,
                                        elevation = 4.dp,
                                        neuInsets = NeuInsets(4.dp, 4.dp),
                                        strokeWidth = 2.dp
                                    )
                                    .background(MaterialTheme.colorScheme.surface, CircleShape)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Remove,
                                    contentDescription = "Decrease"
                                )
                            }
                            
                            Text(
                                text = quantity.toString(),
                                style = MaterialTheme.typography.titleLarge,
                                modifier = Modifier.padding(horizontal = 20.dp)
                            )
                            
                            IconButton(
                                onClick = { quantity++ },
                                modifier = Modifier
                                    .size(40.dp)
                                    .neumorphic(
                                        neuShape = Punched.Rounded(radius = 16.dp),
                                        lightShadowColor = HustleColors.lightShadow,
                                        darkShadowColor = HustleColors.darkShadow,
                                        elevation = 4.dp,
                                        neuInsets = NeuInsets(4.dp, 4.dp),
                                        strokeWidth = 2.dp
                                    )
                                    .background(MaterialTheme.colorScheme.surface, CircleShape)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Add,
                                    contentDescription = "Increase"
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // Description
                    Text(
                        text = "Description",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Medium
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = product!!.description,
                        style = MaterialTheme.typography.bodyMedium,
                        lineHeight = 20.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Reviews Section (live, styled like StoreProfileScreen)
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
                    targetType = ReviewTargetType.PRODUCT,
                    targetId = product!!.id,
                    targetName = product!!.name,
                    shopId = product!!.shopId,
                    headerTitle = "Customer Reviews",
                    currentRating = product!!.rating,
                    currentTotalReviews = product!!.totalReviews,
                    showWriteButton = true,
                    showHelpful = false,
                    wrapInSectionCard = false
                )
            }

            // Add to Cart Button
            val finalPrice = if (product!!.sizeVariants.isNotEmpty()) {
                product!!.sizeVariants.find { it.size == selectedSize }?.price ?: 
                (if (variants.isNotEmpty() && selectedVariant < variants.size) variants[selectedVariant].price else product!!.price)
            } else if (variants.isNotEmpty() && selectedVariant < variants.size) {
                variants[selectedVariant].price
            } else {
                product!!.price
            }
            
            // Add to Cart Button with persistent pressed state after adding
            val interactionSource = remember { MutableInteractionSource() }
            val isPressed by interactionSource.collectIsPressedAsState()
            var isAddedToCart by remember { mutableStateOf(false) }
            
            Button(
                onClick = {
                    // Check authentication first
                    if (currentUser == null) {
                        // Redirect to login
                        onLoginClick?.invoke()
                    } else {
                        coroutineScope.launch {
                            // Add to cart logic with real functionality
                            val result = cartRepository.addProduct(
                                product = product!!,
                                quantity = quantity,
                                selectedVariant = if (variants.isNotEmpty() && selectedVariant < variants.size) {
                                    variants[selectedVariant]
                                } else null,
                                selectedSize = if (product!!.sizeVariants.isNotEmpty()) {
                                    product!!.sizeVariants.find { it.size == selectedSize }
                                } else null
                            )
                            
                            if (result.isSuccess) {
                                isAddedToCart = true
                                // Show success message only, no auto navigation
                                kotlinx.coroutines.delay(1500) // Show confirmation for 1.5 seconds
                                isAddedToCart = false // Reset the state
                            }
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .padding(horizontal = 16.dp)
                    .then(
                        if (isPressed || isAddedToCart) {
                            Modifier
                                .clip(RoundedCornerShape(16.dp))
                                .neumorphic(
                                    neuShape = Pressed.Rounded(radius = 4.dp),
                                    lightShadowColor = HustleColors.lightShadow,
                                    darkShadowColor = HustleColors.darkShadow,
                                    elevation = 8.dp,
                                    neuInsets = NeuInsets(4.dp, 4.dp),
                                    strokeWidth = 8.dp
                                )
                        } else {
                            Modifier
                                .neumorphic(
                                    neuShape = Punched.Rounded(radius = 16.dp),
                                    lightShadowColor = HustleColors.lightShadow,
                                    darkShadowColor = HustleColors.darkShadow,
                                    elevation = 4.dp,
                                    neuInsets = NeuInsets(4.dp, 4.dp),
                                    strokeWidth = 2.dp
                                )
                        }
                    ),
                interactionSource = interactionSource,
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    contentColor = Color(0xFF4CAF50) // Green text color
                )
            ) {
                Icon(
                    imageVector = if (isAddedToCart) Icons.Default.Check else Icons.Default.ShoppingCart,
                    contentDescription = null,
                    modifier = Modifier.padding(end = 8.dp),
                    tint = Color(0xFF4CAF50) // Green icon color
                )
                Text(
                    text = if (currentUser == null) {
                        "Login to Add • $${String.format("%.2f", finalPrice * quantity)}"
                    } else if (isAddedToCart) {
                        "Added! Going to Cart..."
                    } else {
                        "Add to Cart • $${String.format("%.2f", finalPrice * quantity)}"
                    },
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF4CAF50) // Green text color
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
