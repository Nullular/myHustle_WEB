package com.blueclipse.myhustle.ui.screens.business.booking

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.blueclipse.myhustle.data.model.Booking
import com.blueclipse.myhustle.data.model.BookingStatus
import com.blueclipse.myhustle.data.repository.BookingRepository
import com.blueclipse.myhustle.ui.components.ColoredTopBar
import com.blueclipse.myhustle.ui.theme.HustleColors
import com.google.firebase.auth.FirebaseAuth
import me.nikhilchaudhari.library.NeuInsets
import me.nikhilchaudhari.library.neumorphic
import me.nikhilchaudhari.library.shapes.Punched
import me.nikhilchaudhari.library.shapes.Pressed

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AllBookingsScreen(
    shopId: String? = null, // Optional shop filter
    onBack: () -> Unit = {}
) {
    var selectedFilter by remember { mutableStateOf("All") }
    var selectedBooking by remember { mutableStateOf<Booking?>(null) }
    var showBookingDetails by remember { mutableStateOf(false) }
    var acceptedBookings by remember { mutableStateOf<List<Booking>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    
    val currentUser = FirebaseAuth.getInstance().currentUser
    val coroutineScope = rememberCoroutineScope()
    
    // Safely initialize the repository
    val bookingRepository = try {
        BookingRepository.instance
    } catch (e: Exception) {
        null
    }

    // Load accepted bookings
    LaunchedEffect(currentUser?.uid, shopId) {
        val userId = currentUser?.uid
        if (userId != null && bookingRepository != null) {
            try {
                isLoading = true
                errorMessage = null
                
                val allBookings = if (shopId != null) {
                    // Get bookings for specific shop
                    try {
                        bookingRepository.getBookingsForShop(shopId)
                    } catch (e: Exception) {
                        emptyList<Booking>()
                    }
                } else {
                    // Get all bookings for shops owned by current user
                    try {
                        bookingRepository.getBookingsForShopOwner(userId)
                    } catch (e: Exception) {
                        emptyList<Booking>()
                    }
                }
                
                // Filter for accepted bookings
                acceptedBookings = allBookings.filter { it.status == BookingStatus.ACCEPTED }
            } catch (e: Exception) {
                errorMessage = "Failed to load bookings: ${e.message}"
                acceptedBookings = emptyList()
            } finally {
                isLoading = false
            }
        } else {
            if (bookingRepository == null) {
                errorMessage = "Service unavailable. Please try again later."
            } else {
                errorMessage = "Please log in to view bookings"
            }
            isLoading = false
        }
    }
    
    // Filter bookings based on selected filter
    val filteredBookings = remember(selectedFilter, acceptedBookings) {
        when (selectedFilter) {
            "Confirmed" -> acceptedBookings.filter { it.status == BookingStatus.ACCEPTED }
            "Completed" -> acceptedBookings.filter { it.status == BookingStatus.COMPLETED }
            "All" -> acceptedBookings
            else -> acceptedBookings
        }
    }

    Scaffold(
        topBar = {
            ColoredTopBar(
                title = "All Bookings",
                onBack = onBack,
                cornerRadius = 0.dp
            )
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
                                // Retry loading
                                isLoading = true
                                errorMessage = null
                            }
                        ) {
                            Text("Retry")
                        }
                    }
                }
                
                acceptedBookings.isEmpty() -> {
                    Column(
                        modifier = Modifier
                            .align(Alignment.Center)
                            .padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            Icons.Default.CalendarToday,
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            tint = HustleColors.Secondary.copy(alpha = 0.6f)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "No Accepted Bookings",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold,
                            color = HustleColors.Primary
                        )
                        Text(
                            text = "Accepted bookings will appear here",
                            style = MaterialTheme.typography.bodyMedium,
                            color = HustleColors.Secondary,
                            modifier = Modifier.padding(top = 8.dp)
                        )
                    }
                }
                
                else -> {
                    Column(
                        modifier = Modifier.fillMaxSize()
                    ) {
                        LazyColumn(
                            modifier = Modifier
                                .weight(1f)
                                .padding(horizontal = 16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp),
                            contentPadding = PaddingValues(vertical = 16.dp)
                        ) {
                            item {
                                BookingsHeaderCard(
                                    totalBookings = acceptedBookings.size,
                                    confirmedBookings = acceptedBookings.count { it.status == BookingStatus.ACCEPTED },
                                    completedBookings = acceptedBookings.count { it.status == BookingStatus.COMPLETED }
                                )
                            }
                            
                            item {
                                FilterChipsRow(
                                    selectedFilter = selectedFilter,
                                    onFilterSelected = { selectedFilter = it }
                                )
                            }
                            
                            items(filteredBookings) { booking ->
                                BookingCard(
                                    booking = booking,
                                    onClick = {
                                        selectedBooking = booking
                                        showBookingDetails = true
                                    }
                                )
                            }
                            
                            if (filteredBookings.isEmpty()) {
                                item {
                                    EmptyBookingsCard(filter = selectedFilter)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Booking Details Dialog
    if (showBookingDetails && selectedBooking != null) {
        BookingDetailsDialog(
            booking = selectedBooking!!,
            onDismiss = { 
                showBookingDetails = false
                selectedBooking = null
            }
        )
    }
}

@Composable
private fun BookingsHeaderCard(
    totalBookings: Int,
    confirmedBookings: Int,
    completedBookings: Int
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        color = HustleColors.LightestBlue,
        shadowElevation = 2.dp
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            BookingStatItem(
                count = totalBookings,
                label = "Total",
                icon = Icons.Filled.EventNote,
                color = HustleColors.BlueAccent
            )
            
            BookingStatItem(
                count = confirmedBookings,
                label = "Confirmed",
                icon = Icons.Filled.Schedule,
                color = Color(0xFFFF9800)
            )
            
            BookingStatItem(
                count = completedBookings,
                label = "Completed",
                icon = Icons.Filled.CheckCircle,
                color = Color(0xFF4CAF50)
            )
        }
    }
}

@Composable
private fun BookingStatItem(
    count: Int,
    label: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: Color
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            tint = color,
            modifier = Modifier.size(24.dp)
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = count.toString(),
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black
        )
        Text(
            text = label,
            fontSize = 12.sp,
            color = Color.Gray
        )
    }
}

@Composable
private fun FilterChipsRow(
    selectedFilter: String,
    onFilterSelected: (String) -> Unit
) {
    val filters = listOf("All", "Upcoming", "Completed", "Cancelled")
    
    Row(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        filters.forEach { filter ->
            val isSelected = selectedFilter == filter
            
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clickable { onFilterSelected(filter) }
                    .then(
                        if (isSelected) {
                            // Pressed neumorphic needs clip() first
                            Modifier
                                .clip(RoundedCornerShape(20.dp))
                                .neumorphic(
                                    neuShape = Pressed.Rounded(radius = 4.dp),
                                    lightShadowColor = HustleColors.lightShadow,
                                    darkShadowColor = HustleColors.darkShadow,
                                    elevation = 8.dp,
                                    neuInsets = NeuInsets(4.dp, 4.dp),
                                    strokeWidth = 8.dp
                                )
                                .background(MaterialTheme.colorScheme.surface)
                        } else {
                            // Punched neumorphic works without clip()
                            Modifier
                                .neumorphic(
                                    neuShape = Punched.Rounded(radius = 20.dp),
                                    lightShadowColor = HustleColors.lightShadow,
                                    darkShadowColor = HustleColors.darkShadow,
                                    elevation = 4.dp,
                                    neuInsets = NeuInsets(4.dp, 4.dp),
                                    strokeWidth = 2.dp
                                )
                                .background(MaterialTheme.colorScheme.surface, shape = RoundedCornerShape(20.dp))
                        }
                    )
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = filter,
                    color = if (isSelected)
                        MaterialTheme.colorScheme.primary
                    else
                        MaterialTheme.colorScheme.onSurface,
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                    fontSize = 12.sp
                )
            }
        }
    }
}

@Composable
private fun BookingCard(
    booking: Booking,
    onClick: () -> Unit
) {
    val statusColor = when (booking.status) {
        BookingStatus.ACCEPTED -> Color(0xFF4CAF50)
        BookingStatus.COMPLETED -> Color(0xFF2196F3)
        BookingStatus.PENDING -> Color(0xFFFF9800)
        BookingStatus.DENIED -> Color(0xFFF44336)
        BookingStatus.CANCELLED -> Color(0xFF9E9E9E)
        BookingStatus.MODIFIED -> Color(0xFF9C27B0)
    }
    
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        color = Color.White,
        shadowElevation = 2.dp
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            // Header Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        shape = CircleShape,
                        color = HustleColors.BlueAccent.copy(alpha = 0.1f),
                        modifier = Modifier.size(40.dp)
                    ) {
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier.fillMaxSize()
                        ) {
                            Text(
                                text = booking.customerName.firstOrNull()?.toString()?.uppercase() ?: "?",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = HustleColors.BlueAccent
                            )
                        }
                    }
                    
                    Spacer(modifier = Modifier.width(12.dp))
                    
                    Column {
                        Text(
                            text = booking.customerName.ifEmpty { "Unknown Customer" },
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color.Black
                        )
                        Text(
                            text = booking.serviceName.ifEmpty { "Service not specified" },
                            fontSize = 14.sp,
                            color = Color.Gray
                        )
                    }
                }
                
                Column(
                    horizontalAlignment = Alignment.End
                ) {
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = statusColor.copy(alpha = 0.1f)
                    ) {
                        Text(
                            text = booking.status.name.replace("_", " "),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Medium,
                            color = statusColor,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Booking #${booking.id.take(6)}",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color.Gray
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Date and Time Info
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = HustleColors.LightestBlue.copy(alpha = 0.5f)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Filled.CalendarToday,
                            contentDescription = "Date",
                            tint = Color.Gray,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = booking.requestedDate.ifEmpty { "No date" },
                            fontSize = 12.sp,
                            color = Color.Gray
                        )
                    }
                    
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Schedule,
                            contentDescription = "Time",
                            tint = Color.Gray,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = booking.requestedTime.ifEmpty { "No time" },
                            fontSize = 12.sp,
                            color = Color.Gray
                        )
                    }
                }
            }
            
            // Notes (if any)
            if (booking.notes.isNotBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Notes: ${booking.notes}",
                    fontSize = 12.sp,
                    color = Color.Gray,
                    fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
                )
            }
        }
    }
}

@Composable
private fun EmptyBookingsCard(filter: String) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        color = Color.White,
        shadowElevation = 1.dp
    ) {
        Column(
            modifier = Modifier.padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = Icons.Filled.EventBusy,
                contentDescription = "No bookings",
                tint = Color.Gray,
                modifier = Modifier.size(48.dp)
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "No ${filter.lowercase()} bookings",
                fontSize = 16.sp,
                fontWeight = FontWeight.Medium,
                color = Color.Gray
            )
            Text(
                text = "Bookings will appear here when customers make requests",
                fontSize = 12.sp,
                color = Color.Gray,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )
        }
    }
}

@Composable
private fun BookingDetailsDialog(
    booking: Booking,
    onDismiss: () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = Color.White,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(20.dp)
            ) {
                Text(
                    text = "Booking Details",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Customer Details
                DetailSection(title = "Customer Information") {
                    DetailItem("Name", booking.customerName.ifEmpty { "Unknown Customer" })
                    DetailItem("Email", booking.customerEmail.ifEmpty { "No email provided" })
                }
                
                Spacer(modifier = Modifier.height(12.dp))
                
                // Service Details
                DetailSection(title = "Service Information") {
                    DetailItem("Service", booking.serviceName.ifEmpty { "Service not specified" })
                    DetailItem("Shop", booking.shopName.ifEmpty { "Shop not specified" })
                    DetailItem("Date", booking.requestedDate.ifEmpty { "No date" })
                    DetailItem("Time", booking.requestedTime.ifEmpty { "No time" })
                    DetailItem("Status", booking.status.name.replace("_", " "))
                }
                
                if (booking.notes.isNotBlank()) {
                    Spacer(modifier = Modifier.height(12.dp))
                    DetailSection(title = "Customer Notes") {
                        Text(
                            text = booking.notes,
                            fontSize = 14.sp,
                            color = Color.Black,
                            lineHeight = 18.sp
                        )
                    }
                }
                
                if (booking.responseMessage.isNotBlank()) {
                    Spacer(modifier = Modifier.height(12.dp))
                    DetailSection(title = "Response Message") {
                        Text(
                            text = booking.responseMessage,
                            fontSize = 14.sp,
                            color = Color.Black,
                            lineHeight = 18.sp
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(20.dp))
                
                Button(
                    onClick = onDismiss,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = HustleColors.BlueAccent
                    )
                ) {
                    Text("Close")
                }
            }
        }
    }
}

@Composable
private fun DetailSection(
    title: String,
    content: @Composable () -> Unit
) {
    Column {
        Text(
            text = title,
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium,
            color = Color.Gray
        )
        Spacer(modifier = Modifier.height(8.dp))
        Surface(
            shape = RoundedCornerShape(8.dp),
            color = HustleColors.LightestBlue.copy(alpha = 0.3f)
        ) {
            Column(
                modifier = Modifier.padding(12.dp)
            ) {
                content()
            }
        }
    }
}

@Composable
private fun DetailItem(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = "$label:",
            fontSize = 14.sp,
            color = Color.Gray
        )
        Text(
            text = value,
            fontSize = 14.sp,
            color = Color.Black,
            fontWeight = FontWeight.Medium
        )
    }
    Spacer(modifier = Modifier.height(4.dp))
}
