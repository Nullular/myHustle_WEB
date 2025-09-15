package com.blueclipse.myhustle.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.blueclipse.myhustle.ui.theme.HustleColors
import com.blueclipse.myhustle.ui.viewmodel.AuthViewModel
import com.blueclipse.myhustle.data.repository.OrderRepository
import com.blueclipse.myhustle.data.repository.BookingRepository
import com.blueclipse.myhustle.data.repository.MessageRepository
import com.blueclipse.myhustle.data.repository.ReviewRepository
import com.blueclipse.myhustle.data.model.Order
import com.blueclipse.myhustle.data.model.Booking
import me.nikhilchaudhari.library.neumorphic
import me.nikhilchaudhari.library.NeuInsets
import me.nikhilchaudhari.library.shapes.Punched
import me.nikhilchaudhari.library.shapes.Pressed

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    onBackClick: () -> Unit,
    onMessagesClick: () -> Unit
) {
    BackHandler { onBackClick() }
    val authViewModel: AuthViewModel = viewModel()
    val currentUser by authViewModel.currentUser.collectAsState()
    var selectedTab by remember { mutableIntStateOf(0) }

    // Real data from repositories
    val orderRepository = remember { OrderRepository.instance }
    val bookingRepository = remember { BookingRepository.instance }
    val messageRepository = remember { MessageRepository.instance }
    val reviewRepository = remember { ReviewRepository.instance }
    
    // Live data from database
    val orderHistory by orderRepository.orders.collectAsState()
    val bookedServices by bookingRepository.bookings.collectAsState()
    val conversations by messageRepository.conversations.collectAsState()
    
    // User rating state
    var userRating by remember { mutableFloatStateOf(0f) }
    
    // Load user bookings and orders when screen opens
    LaunchedEffect(currentUser?.uid) {
        currentUser?.uid?.let { userId ->
            bookingRepository.refreshUserBookings()
            orderRepository.refreshOrders()
            
            // Load user rating
            val ratingResult = reviewRepository.getUserAverageRating(userId)
            if (ratingResult.isSuccess) {
                userRating = ratingResult.getOrNull() ?: 0f
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        // Header with Sign Out
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBackClick) {
                Icon(
                    Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Back",
                    tint = HustleColors.BlueAccent
                )
            }
            Text(
                text = "Profile",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = Color.Black,
                modifier = Modifier.weight(1f)
            )
            
            // Sign Out Button
            IconButton(onClick = { 
                authViewModel.signOut()
                onBackClick() // Go back after signing out
            }) {
                Icon(
                    Icons.Default.ExitToApp,
                    contentDescription = "Sign Out",
                    tint = Color.Red.copy(alpha = 0.8f)
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // User Profile Section
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .neumorphic(
                    lightShadowColor = HustleColors.lightShadow,
                    darkShadowColor = HustleColors.darkShadow,
                    elevation = 6.dp,
                    neuInsets = NeuInsets(3.dp, 3.dp),
                    strokeWidth = 2.dp,
                    neuShape = Pressed.Rounded(radius = 24.dp)
                ),
            shape = RoundedCornerShape(24.dp),
            color = Color.White
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Avatar
                Surface(
                    modifier = Modifier
                        .size(120.dp)
                        .neumorphic(
                            lightShadowColor = HustleColors.lightShadow,
                            darkShadowColor = HustleColors.darkShadow,
                            elevation = 8.dp,
                            neuInsets = NeuInsets(4.dp, 4.dp),
                            strokeWidth = 3.dp,
                            neuShape = Punched.Rounded(radius = 60.dp)
                        ),
                    shape = CircleShape,
                    color = Color.White
                ) {
                    val userPhotoUrl = currentUser?.photoUrl
                    if (userPhotoUrl != null) {
                        AsyncImage(
                            model = userPhotoUrl,
                            contentDescription = "Profile Picture",
                            modifier = Modifier
                                .fillMaxSize()
                                .clip(CircleShape),
                            contentScale = ContentScale.Crop
                        )
                    } else {
                        Icon(
                            Icons.Default.Person,
                            contentDescription = "Default Profile",
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(24.dp),
                            tint = HustleColors.BlueAccent
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = currentUser?.displayName ?: "User",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )

                Text(
                    text = currentUser?.email ?: "",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.Gray
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Stats Cards Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    ProfileStatCard(
                        label = "Orders",
                        value = orderHistory.size.toString(),
                        icon = Icons.Default.ShoppingBag
                    )
                    ProfileStatCard(
                        label = "Bookings",
                        value = bookedServices.size.toString(),
                        icon = Icons.Default.CalendarToday
                    )
                    ProfileStatCard(
                        label = "Rating",
                        value = if (userRating > 0) String.format("%.1f", userRating) else "N/A",
                        icon = Icons.Default.Star
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Tab Section
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .neumorphic(
                    lightShadowColor = HustleColors.lightShadow,
                    darkShadowColor = HustleColors.darkShadow,
                    elevation = 4.dp,
                    neuInsets = NeuInsets(2.dp, 2.dp),
                    strokeWidth = 2.dp,
                    neuShape = Pressed.Rounded(radius = 20.dp)
                ),
            shape = RoundedCornerShape(20.dp),
            color = Color.White
        ) {
            Column(modifier = Modifier.padding(4.dp)) {
                TabRow(
                    selectedTabIndex = selectedTab,
                    modifier = Modifier.fillMaxWidth(),
                    containerColor = Color.Transparent,
                    contentColor = HustleColors.BlueAccent,
                    divider = {}
                ) {
                    Tab(
                        selected = selectedTab == 0,
                        onClick = { selectedTab = 0 },
                        text = {
                            Text(
                                "Orders",
                                fontWeight = if (selectedTab == 0) FontWeight.Bold else FontWeight.Normal,
                                color = if (selectedTab == 0) HustleColors.BlueAccent else Color.Gray
                            )
                        },
                        icon = {
                            Icon(
                                Icons.Default.ShoppingBag,
                                contentDescription = null,
                                tint = if (selectedTab == 0) HustleColors.BlueAccent else Color.Gray
                            )
                        }
                    )
                    
                    Tab(
                        selected = selectedTab == 1,
                        onClick = { selectedTab = 1 },
                        text = {
                            Text(
                                "Bookings",
                                fontWeight = if (selectedTab == 1) FontWeight.Bold else FontWeight.Normal,
                                color = if (selectedTab == 1) HustleColors.BlueAccent else Color.Gray
                            )
                        },
                        icon = {
                            Icon(
                                Icons.Default.CalendarToday,
                                contentDescription = null,
                                tint = if (selectedTab == 1) HustleColors.BlueAccent else Color.Gray
                            )
                        }
                    )
                    
                    Tab(
                        selected = selectedTab == 2,
                        onClick = { selectedTab = 2 },
                        text = {
                            Text(
                                "Messages",
                                fontWeight = if (selectedTab == 2) FontWeight.Bold else FontWeight.Normal,
                                color = if (selectedTab == 2) HustleColors.BlueAccent else Color.Gray
                            )
                        },
                        icon = {
                            Icon(
                                Icons.Default.Message,
                                contentDescription = null,
                                tint = if (selectedTab == 2) HustleColors.BlueAccent else Color.Gray
                            )
                        }
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Tab content - this will expand to fill remaining space
        when (selectedTab) {
            0 -> OrderHistoryTab(orderHistory = orderHistory)
            1 -> BookingsTab(bookedServices = bookedServices)
            2 -> {
                // Navigate to messages screen immediately
                LaunchedEffect(Unit) {
                    onMessagesClick()
                }
                // Show loading while navigating
                Box(
                    modifier = Modifier.fillMaxWidth().height(200.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text("Opening Messages...")
                }
            }
        }
        
        // Add bottom padding for scrolling
        Spacer(modifier = Modifier.height(100.dp))
    }
}

@Composable
private fun ProfileStatCard(
    label: String,
    value: String,
    icon: ImageVector
) {
    Surface(
        modifier = Modifier
            .size(80.dp)
            .neumorphic(
                lightShadowColor = HustleColors.lightShadow,
                darkShadowColor = HustleColors.darkShadow,
                elevation = 3.dp,
                neuInsets = NeuInsets(1.5.dp, 1.5.dp),
                strokeWidth = 1.dp,
                neuShape = Punched.Rounded(radius = 16.dp)
            ),
        shape = RoundedCornerShape(16.dp),
        color = Color.White
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = HustleColors.BlueAccent,
                modifier = Modifier.size(24.dp)
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = value,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
            
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall,
                color = Color.Gray
            )
        }
    }
}

@Composable
private fun OrderHistoryTab(orderHistory: List<Order>) {
    if (orderHistory.isEmpty()) {
        EmptyStateCard(
            icon = Icons.Default.ShoppingBag,
            title = "No Orders Yet",
            subtitle = "Your order history will appear here"
        )
    } else {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            orderHistory.forEach { order ->
                OrderHistoryCard(order = order)
            }
        }
    }
}

@Composable
private fun BookingsTab(bookedServices: List<Booking>) {
    if (bookedServices.isEmpty()) {
        EmptyStateCard(
            icon = Icons.Default.CalendarToday,
            title = "No Bookings Yet",
            subtitle = "Your booked services will appear here"
        )
    } else {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            bookedServices.forEach { booking ->
                BookingCard(booking = booking)
            }
        }
    }
}

@Composable
private fun OrderHistoryCard(order: Order) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .neumorphic(
                lightShadowColor = HustleColors.lightShadow,
                darkShadowColor = HustleColors.darkShadow,
                elevation = 4.dp,
                neuInsets = NeuInsets(2.dp, 2.dp),
                strokeWidth = 2.dp,
                neuShape = Pressed.Rounded(radius = 16.dp)
            ),
        shape = RoundedCornerShape(16.dp),
        color = Color.White
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Order #${order.id.take(8)}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                StatusChip(status = order.status.name)
            }
            
            Text(
                text = "${order.items.size} items • $${String.format("%.2f", order.total)}",
                style = MaterialTheme.typography.bodyMedium,
                color = Color.Gray
            )
            
            Text(
                text = java.text.SimpleDateFormat("MMM dd, yyyy", java.util.Locale.getDefault()).format(java.util.Date(order.createdAt)),
                style = MaterialTheme.typography.bodySmall,
                color = Color.Gray.copy(alpha = 0.8f)
            )
        }
    }
}

@Composable
private fun BookingCard(booking: Booking) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .neumorphic(
                lightShadowColor = HustleColors.lightShadow,
                darkShadowColor = HustleColors.darkShadow,
                elevation = 4.dp,
                neuInsets = NeuInsets(2.dp, 2.dp),
                strokeWidth = 2.dp,
                neuShape = Pressed.Rounded(radius = 16.dp)
            ),
        shape = RoundedCornerShape(16.dp),
        color = Color.White
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = booking.serviceName,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                StatusChip(status = booking.status.name)
            }
            
            Text(
                text = "Provider: ${booking.shopName}",
                style = MaterialTheme.typography.bodyMedium,
                color = Color.Gray
            )
            
            Text(
                text = "${booking.requestedDate} at ${booking.requestedTime}",
                style = MaterialTheme.typography.bodyMedium,
                color = HustleColors.BlueAccent
            )
            
            Text(
                text = "Service Price: Contact Provider",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
        }
    }
}

@Composable
private fun StatusChip(status: String) {
    Surface(
        modifier = Modifier
            .neumorphic(
                lightShadowColor = HustleColors.lightShadow,
                darkShadowColor = HustleColors.darkShadow,
                elevation = 2.dp,
                neuInsets = NeuInsets(1.dp, 1.dp),
                strokeWidth = 1.dp,
                neuShape = Pressed.Rounded(radius = 12.dp)
            ),
        shape = RoundedCornerShape(12.dp),
        color = when (status.lowercase()) {
            "delivered", "completed", "confirmed" -> Color(0xFFE8F5E8)
            "pending" -> Color(0xFFFFF3E0)
            else -> Color(0xFFE3F2FD)
        }
    ) {
        Text(
            text = status,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Medium,
            color = when (status.lowercase()) {
                "delivered", "completed", "confirmed" -> Color(0xFF2E7D32)
                "pending" -> Color(0xFFE65100)
                else -> HustleColors.BlueAccent
            }
        )
    }
}

@Composable
private fun EmptyStateCard(
    icon: ImageVector,
    title: String,
    subtitle: String
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
                neuShape = Pressed.Rounded(radius = 20.dp)
            ),
        shape = RoundedCornerShape(20.dp),
        color = Color.White
    ) {
        Column(
            modifier = Modifier.padding(40.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                modifier = Modifier.size(48.dp),
                tint = Color.Gray.copy(alpha = 0.6f)
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodyMedium,
                color = Color.Gray,
                textAlign = TextAlign.Center
            )
        }
    }
}