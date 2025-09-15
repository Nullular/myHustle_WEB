import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.blueclipse.myhustle.data.model.Service
import com.blueclipse.myhustle.data.repository.ServiceRepository
import com.blueclipse.myhustle.data.repository.CartRepository
import com.blueclipse.myhustle.ui.components.ColoredTopBar
import com.blueclipse.myhustle.ui.theme.HustleColors
import com.blueclipse.myhustle.data.model.ReviewTargetType
import com.blueclipse.myhustle.ui.components.ReviewsPanel
import com.blueclipse.myhustle.ui.theme.fontFamily
import me.nikhilchaudhari.library.NeuInsets
import me.nikhilchaudhari.library.neumorphic
import me.nikhilchaudhari.library.shapes.Punched
import me.nikhilchaudhari.library.shapes.Pressed

// Data class for enhanced service details
data class ServiceDetails(
    val id: String,
    val name: String,
    val description: String,
    val price: String,
    val duration: String,
    val rating: Float,
    val reviewCount: Int,
    val providerName: String,
    val features: List<String>,
    val gallery: List<Int>,
    val isAvailable: Boolean
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ServiceScreen(
    itemId: String,
    onNext: (shopId: String, serviceId: String, serviceName: String, shopName: String, shopOwnerId: String) -> Unit,
    onBack: () -> Unit = {}
) {
    // Load service data from ServiceRepository
    val serviceRepository = ServiceRepository.instance
    var service by remember { mutableStateOf<Service?>(null) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    // UI state
    var quantity by rememberSaveable { mutableStateOf(1) }
    var selectedDuration by rememberSaveable { mutableStateOf("Standard") }
    var isFavorite by rememberSaveable { mutableStateOf(false) }

    // Coroutine scope for async operations
    val coroutineScope = rememberCoroutineScope()

    // Load service data
    LaunchedEffect(itemId) {
        isLoading = true
        try {
            serviceRepository.getServiceById(itemId).onSuccess { serviceData ->
                service = serviceData
                isLoading = false
            }.onFailure { error ->
                errorMessage = "Failed to load service: ${error.message}"
                isLoading = false
            }
        } catch (e: Exception) {
            errorMessage = "Error loading service: ${e.message}"
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

    if (errorMessage != null || service == null) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = errorMessage ?: "Service not found",
                    color = if (errorMessage != null) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface
                )
                Button(onClick = onBack) {
                    Text("Go Back")
                }
            }
        }
        return
    }

    // Duration options based on service type
    val durationOptions = listOf("${service!!.estimatedDuration} min")
    selectedDuration = "${service!!.estimatedDuration} min"

    Scaffold(
        topBar = {
            ColoredTopBar(
                title = "Service Details",
                onBack = onBack,
                cornerRadius = 0.dp
            )
        },
        bottomBar = {
            ServiceBottomBar(
                service = service!!,
                selectedDuration = selectedDuration,
                quantity = quantity,
                onBookNow = { 
                    // For now, use service info directly - in real app would get shop info
                    onNext(service!!.shopId, service!!.id, service!!.name, "Service Provider", service!!.shopId)
                }
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Hero Image Section
            item {
                ServiceHeroSection(
                    service = service!!,
                    isFavorite = isFavorite,
                    onFavoriteToggle = { isFavorite = !isFavorite }
                )
            }
            
            // Service Information Card (consolidated)
            item {
                ServiceInformationCard(service = service!!)
            }
            
            // Pricing & Duration Info
            item {
                PricingDurationSection(service = service!!, selectedDuration = selectedDuration)
            }
            
            // Quantity Selector
            item {
                QuantitySelectionSection(
                    quantity = quantity,
                    onQuantityChanged = { quantity = it }
                )
            }
            
            // Reviews Section (live data)
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
                        targetType = ReviewTargetType.SERVICE,
                        targetId = service!!.id,
                        targetName = service!!.name,
                        shopId = service!!.shopId,
                        headerTitle = "Customer Reviews",
                        currentRating = service!!.rating,
                        currentTotalReviews = service!!.totalReviews,
                        showWriteButton = true,
                        showHelpful = false,
                        wrapInSectionCard = false
                    )
                }
            }
            
            // Add bottom spacing for the bottom bar
            item {
                Spacer(modifier = Modifier.height(80.dp))
            }
        }
    }
}

@Composable
private fun ServiceHeroSection(
    service: Service,
    isFavorite: Boolean,
    onFavoriteToggle: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(280.dp)
    ) {
        AsyncImage(
            model = service.primaryImageUrl,
            contentDescription = service.name,
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop
        )
        
        // Gradient overlay
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
        
        // Favorite button (top right)
        IconButton(
            onClick = onFavoriteToggle,
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(16.dp)
                .size(48.dp)
                .background(
                    MaterialTheme.colorScheme.surface,
                    CircleShape
                )
        ) {
            Icon(
                imageVector = if (isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                contentDescription = null,
                tint = if (isFavorite) Color.Red else MaterialTheme.colorScheme.onSurface
            )
        }
        
        // Availability badge
        Surface(
            modifier = Modifier
                .align(Alignment.TopStart)
                .padding(16.dp),
            shape = RoundedCornerShape(20.dp),
            color = Color(0xFF2E7D32).copy(alpha = 0.9f)
        ) {
            Text(
                text = "Available",
                color = Color.White,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
            )
        }
        
        // Rating badge
        Surface(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(16.dp),
            shape = RoundedCornerShape(20.dp),
            color = Color.Black.copy(alpha = 0.7f)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
            ) {
                Icon(
                    imageVector = Icons.Filled.Star,
                    contentDescription = "Rating",
                    tint = Color(0xFFFFD700),
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = String.format("%.1f", service.rating),
                    color = Color.White,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium
                )
                Text(
                    text = " (${service.totalReviews})",
                    color = Color.White.copy(alpha = 0.8f),
                    fontSize = 12.sp
                )
            }
        }
    }
}

@Composable
private fun ServiceInformationCard(service: Service) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp),
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 6.dp
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Service Title
            Text(
                text = service.name,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black,
                fontFamily = fontFamily,
                lineHeight = 34.sp
            )
            
            // Provider Information
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Filled.Person,
                    contentDescription = "Provider",
                    tint = HustleColors.BlueAccent,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "by Service Provider", // Default since service doesn't have providerName field
                    fontSize = 16.sp,
                    color = HustleColors.BlueAccent,
                    fontWeight = FontWeight.Medium,
                    fontFamily = fontFamily
                )
            }
            
            // Service Description
            if (service.description.isNotEmpty()) {
                Text(
                    text = service.description,
                    fontSize = 16.sp,
                    color = Color.Black.copy(alpha = 0.8f),
                    lineHeight = 24.sp,
                    fontFamily = fontFamily
                )
            }
            
            // Features/Tags (if available)
            if (service.tags.isNotEmpty()) {
                Column {
                    Text(
                        text = "Features & Highlights",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black,
                        fontFamily = fontFamily
                    )
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    service.tags.forEach { feature ->
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(vertical = 2.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Filled.CheckCircle,
                                contentDescription = "Feature",
                                tint = Color(0xFF2E7D32),
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = feature,
                                fontSize = 14.sp,
                                color = Color.Black.copy(alpha = 0.8f),
                                fontFamily = fontFamily
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ServiceTitleSection(
    service: Service
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
    ) {
        Text(
            text = service.name,
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black,
            fontFamily = fontFamily
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Filled.Person,
                contentDescription = "Provider",
                tint = HustleColors.BlueAccent,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "by Service Provider", // Default since service doesn't have providerName field
                fontSize = 16.sp,
                color = HustleColors.BlueAccent,
                fontWeight = FontWeight.Medium
            )
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = service.description,
            fontSize = 16.sp,
            color = Color.Gray,
            lineHeight = 24.sp
        )
    }
}

@Composable
private fun PricingDurationSection(
    service: Service,
    selectedDuration: String
) {
    val price = service.basePrice // Use base price since no variants exist
    
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp),
        horizontalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Price Card
        Surface(
            modifier = Modifier
                .weight(1f),
            shape = RoundedCornerShape(16.dp),
            color = MaterialTheme.colorScheme.surface,
            shadowElevation = 4.dp
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    imageVector = Icons.Filled.AttachMoney,
                    contentDescription = "Price",
                    tint = HustleColors.BlueAccent,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Price",
                    fontSize = 12.sp,
                    color = Color.Gray,
                    fontWeight = FontWeight.Medium
                )
                Text(
                    text = "R${String.format("%.2f", price)}",
                    fontSize = 16.sp,
                    color = Color.Black,
                    fontWeight = FontWeight.Bold
                )
            }
        }
        
        // Duration Card
        Surface(
            modifier = Modifier
                .weight(1f),
            shape = RoundedCornerShape(16.dp),
            color = MaterialTheme.colorScheme.surface,
            shadowElevation = 4.dp
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    imageVector = Icons.Filled.Schedule,
                    contentDescription = "Duration",
                    tint = HustleColors.BlueAccent,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Duration",
                    fontSize = 12.sp,
                    color = Color.Gray,
                    fontWeight = FontWeight.Medium
                )
                Text(
                    text = selectedDuration.ifEmpty { "N/A" },
                    fontSize = 16.sp,
                    color = Color.Black,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
private fun QuantitySelectionSection(
    quantity: Int,
    onQuantityChanged: (Int) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
    ) {
        Text(
            text = "Quantity",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black,
            modifier = Modifier.padding(bottom = 12.dp)
        )
        
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.fillMaxWidth()
        ) {
            // Decrease Button
            Button(
                onClick = { if (quantity > 1) onQuantityChanged(quantity - 1) },
                modifier = Modifier
                    .size(48.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.surface
                ),
                contentPadding = PaddingValues(0.dp),
                shape = RoundedCornerShape(16.dp),
                elevation = ButtonDefaults.buttonElevation(
                    defaultElevation = 4.dp
                )
            ) {
                Text(
                    text = "-",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
            
            Spacer(modifier = Modifier.width(24.dp))
            
            // Quantity Display
            Text(
                text = quantity.toString(),
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black,
                modifier = Modifier.weight(1f),
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.width(24.dp))
            
            // Increase Button
            Button(
                onClick = { onQuantityChanged(quantity + 1) },
                modifier = Modifier
                    .size(48.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.surface
                ),
                contentPadding = PaddingValues(0.dp),
                shape = RoundedCornerShape(16.dp),
                elevation = ButtonDefaults.buttonElevation(
                    defaultElevation = 4.dp
                )
            ) {
                Text(
                    text = "+",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
        }
    }
}

@Composable
private fun DurationSelectionSection(
    durationOptions: List<String>,
    selectedDuration: String,
    onDurationSelected: (String) -> Unit,
    service: Service
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
    ) {
        Text(
            text = "Duration",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black,
            modifier = Modifier.padding(bottom = 12.dp)
        )
        
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // For now show single duration option since Service model doesn't have variants
            item {
                val isSelected = selectedDuration.contains("${service.estimatedDuration}")
                
                Surface(
                    modifier = Modifier
                        .clickable { onDurationSelected("${service.estimatedDuration} min") },
                    shape = RoundedCornerShape(16.dp),
                    color = if (isSelected) HustleColors.BlueAccent.copy(alpha = 0.1f) else MaterialTheme.colorScheme.surface,
                    shadowElevation = 4.dp
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "${service.estimatedDuration} min",
                            fontSize = 14.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSelected) HustleColors.BlueAccent else Color.Black
                        )
                        Text(
                            text = "R${String.format("%.2f", service.basePrice)}",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = if (isSelected) HustleColors.BlueAccent else Color.Gray
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ServiceDescriptionSection(description: String) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
    ) {
        Text(
            text = "Description",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        
        Text(
            text = description,
            fontSize = 16.sp,
            color = Color.Black,
            lineHeight = 24.sp
        )
    }
}

@Composable
private fun ServiceFeaturesSection(features: List<String>) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
    ) {
        Text(
            text = "Features & Highlights",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black,
            modifier = Modifier.padding(bottom = 12.dp)
        )
        
        features.forEach { feature ->
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(vertical = 4.dp)
            ) {
                Icon(
                    imageVector = Icons.Filled.CheckCircle,
                    contentDescription = "Feature",
                    tint = Color(0xFF2E7D32),
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = feature,
                    fontSize = 16.sp,
                    color = Color.Black
                )
            }
        }
    }
}

@Composable
private fun ServiceGallerySection(gallery: List<Int>) {
    Column(
        modifier = Modifier.fillMaxWidth()
    ) {
        Text(
            text = "Gallery",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black,
            modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp)
        )
        
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(horizontal = 20.dp)
        ) {
            items(gallery) { imageRes ->
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    shadowElevation = 4.dp
                ) {
                    Image(
                        painter = painterResource(id = imageRes),
                        contentDescription = "Gallery Image",
                        modifier = Modifier
                            .size(120.dp)
                            .clip(RoundedCornerShape(12.dp)),
                        contentScale = ContentScale.Crop
                    )
                }
            }
        }
    }
}

@Composable
private fun ReviewsSection(
    rating: Float,
    reviewCount: Int
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp),
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 4.dp
    ) {
        Column(
            modifier = Modifier.padding(20.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "Reviews & Ratings",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Filled.Star,
                        contentDescription = "Rating",
                        tint = Color(0xFFFFD700),
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "$rating",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                    Text(
                        text = " ($reviewCount reviews)",
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Sample review
            Text(
                text = "\"Excellent service! Professional, timely, and exceeded expectations. Highly recommended!\"",
                fontSize = 14.sp,
                color = Color.Gray,
                fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "- Sarah M.",
                fontSize = 12.sp,
                color = Color.Gray,
                textAlign = TextAlign.End,
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

@Composable
private fun ServiceBottomBar(
    service: Service,
    selectedDuration: String,
    quantity: Int,
    onBookNow: () -> Unit
) {
    val cartRepository = CartRepository.instance
    val coroutineScope = rememberCoroutineScope()
    val unitPrice = service.basePrice // Use base price since no variants
    val totalPrice = unitPrice * quantity

    Surface(
        modifier = Modifier
            .fillMaxWidth(),
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 8.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            // Price display
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Total Price",
                        fontSize = 12.sp,
                        color = Color.Gray,
                        fontFamily = fontFamily
                    )
                    Text(
                        text = "R${String.format("%.2f", totalPrice)}",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = HustleColors.BlueAccent,
                        fontFamily = fontFamily
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Request Booking Button
            val requestBookingInteractionSource = remember { MutableInteractionSource() }
            val isRequestBookingPressed by requestBookingInteractionSource.collectIsPressedAsState()
            
            Button(
                onClick = onBookNow,
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    contentColor = HustleColors.BlueAccent
                ),
                shape = RoundedCornerShape(25.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
                    .then(
                        if (isRequestBookingPressed) {
                            Modifier
                                .clip(RoundedCornerShape(25.dp))
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
                                    neuShape = Punched.Rounded(radius = 25.dp),
                                    lightShadowColor = HustleColors.lightShadow,
                                    darkShadowColor = HustleColors.darkShadow,
                                    elevation = 4.dp,
                                    neuInsets = NeuInsets(4.dp, 4.dp),
                                    strokeWidth = 2.dp
                                )
                        }
                    ),
                interactionSource = requestBookingInteractionSource,
                elevation = ButtonDefaults.buttonElevation(0.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.CalendarMonth,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp),
                    tint = HustleColors.BlueAccent
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Request Booking",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    fontFamily = fontFamily
                )
            }
            
            // Bottom padding to prevent button cutoff
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}
