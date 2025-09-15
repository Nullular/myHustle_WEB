package com.blueclipse.myhustle.ui.screens.business.booking

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
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
import com.blueclipse.myhustle.ui.theme.*
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.launch
import me.nikhilchaudhari.library.neumorphic
import me.nikhilchaudhari.library.shapes.Punched
import me.nikhilchaudhari.library.shapes.Pressed
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.DateTimeFormatter

// Data class for calendar day information
data class DayBookingInfo(
    val date: LocalDate,
    val bookings: List<Booking>
)

// Helper function to convert date string to LocalDate
fun String.toLocalDateOrNull(): LocalDate? {
    return try {
        when {
            contains("-") -> LocalDate.parse(this)
            length == 8 -> LocalDate.parse("${substring(0,4)}-${substring(4,6)}-${substring(6,8)}")
            else -> null
        }
    } catch (e: Exception) {
        null
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CalendarViewScreen(
    shopId: String? = null, // Optional shop filter
    onBack: () -> Unit
) {
    var currentMonth by remember { mutableStateOf(YearMonth.now()) }
    var selectedDate by remember { mutableStateOf(LocalDate.now()) }
    var allBookings by remember { mutableStateOf<List<Booking>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    
    // Dialog management states
    var showResponseDialog by remember { mutableStateOf(false) }
    var selectedBooking by remember { mutableStateOf<Booking?>(null) }
    var isUpdating by remember { mutableStateOf(false) }
    
    val bookingRepository = try {
        BookingRepository.instance
    } catch (e: Exception) {
        null
    }
    val coroutineScope = rememberCoroutineScope()
    
    // Load bookings for the current shop owner
    LaunchedEffect(Unit, shopId) {
        val currentUser = FirebaseAuth.getInstance().currentUser
        if (currentUser != null && bookingRepository != null) {
            try {
                isLoading = true
                errorMessage = null
                
                allBookings = if (shopId != null) {
                    // Get bookings for specific shop
                    bookingRepository.getBookingsForShop(shopId)
                } else {
                    // Get all bookings for shops owned by current user
                    bookingRepository.getBookingsForShopOwner(currentUser.uid)
                }
            } catch (e: Exception) {
                errorMessage = "Failed to load bookings: ${e.message}"
            } finally {
                isLoading = false
            }
        } else {
            if (bookingRepository == null) {
                errorMessage = "Service unavailable. Please try again later."
            } else {
                errorMessage = "Please log in to view calendar"
            }
            isLoading = false
        }
    }
    
    // Process bookings into daily data
    val bookingData = remember(allBookings) {
        allBookings.groupBy { booking ->
            booking.requestedDate.toLocalDateOrNull()
        }.filterKeys { it != null }
        .mapKeys { it.key!! }
        .mapValues { (date, bookings) ->
            DayBookingInfo(
                date = date,
                bookings = bookings
            )
        }
    }
    
    Scaffold(
        topBar = {
            ColoredTopBar(
                title = "Calendar View",
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
                            color = Color.Red,
                            modifier = Modifier.padding(16.dp)
                        )
                        Button(
                            onClick = {
                                coroutineScope.launch {
                                    val currentUser = FirebaseAuth.getInstance().currentUser
                                    if (currentUser != null && bookingRepository != null) {
                                        try {
                                            isLoading = true
                                            errorMessage = null
                                            allBookings = bookingRepository.getBookingsForShopOwner(currentUser.uid)
                                        } catch (e: Exception) {
                                            errorMessage = "Failed to load bookings: ${e.message}"
                                        } finally {
                                            isLoading = false
                                        }
                                    }
                                }
                            }
                        ) {
                            Text("Retry")
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
                            MonthHeader(
                                currentMonth = currentMonth,
                                onPreviousMonth = { currentMonth = currentMonth.minusMonths(1) },
                                onNextMonth = { currentMonth = currentMonth.plusMonths(1) }
                            )
                        }
                        
                        item {
                            CalendarGrid(
                                currentMonth = currentMonth,
                                selectedDate = selectedDate,
                                bookingData = bookingData,
                                onDateClick = { selectedDate = it }
                            )
                        }
                        
                        item {
                            val dayInfo = bookingData[selectedDate]
                            if (dayInfo != null && dayInfo.bookings.isNotEmpty()) {
                                DayDetailsSection(
                                    date = selectedDate,
                                    dayInfo = dayInfo
                                )
                            } else {
                                EmptyDayCard(date = selectedDate)
                            }
                        }
                    }
                }
            }
        }
        
        // Debug state changes
        LaunchedEffect(showResponseDialog, selectedBooking) {
            println("DEBUG: Dialog condition check - showResponseDialog: $showResponseDialog, selectedBooking: ${selectedBooking?.id}")
        }
        
        // Response Dialog (Accept/Deny) - for pending bookings
        if (showResponseDialog && selectedBooking != null) {
            println("DEBUG: Showing response dialog for booking: ${selectedBooking?.id}")
            BookingResponseDialog(
                request = selectedBooking!!,
                isUpdating = isUpdating,
                onDismiss = { 
                    if (!isUpdating) {
                        showResponseDialog = false
                        selectedBooking = null
                    }
                },
                onConfirm = { action, message ->
                    // Update booking status in Firebase using the exact same logic as BookingRequestsScreen
                    selectedBooking?.let { booking ->
                        println("DEBUG: Starting booking update - Action: $action, Booking ID: ${booking.id}")
                        isUpdating = true
                        coroutineScope.launch {
                            try {
                                println("DEBUG: BookingRepository available: ${bookingRepository != null}")
                                val newStatus = if (action == "accept") BookingStatus.ACCEPTED else BookingStatus.DENIED
                                println("DEBUG: New status: $newStatus")
                                
                                val result = bookingRepository?.updateBookingStatus(
                                    bookingId = booking.id,
                                    status = newStatus,
                                    responseMessage = message
                                )
                                
                                println("DEBUG: Update result: $result")
                                
                                result?.onSuccess {
                                    println("DEBUG: Update successful, refreshing booking list")
                                    // Update local state only after successful Firebase update
                                    val index = allBookings.indexOfFirst { it.id == booking.id }
                                    if (index != -1) {
                                        val updatedBookings = allBookings.toMutableList().apply {
                                            set(index, booking.copy(
                                                status = newStatus,
                                                responseMessage = message,
                                                updatedAt = System.currentTimeMillis()
                                            ))
                                        }
                                        allBookings = updatedBookings
                                        println("DEBUG: Local state updated")
                                    } else {
                                        println("DEBUG: Booking not found in local list")
                                    }
                                }?.onFailure { exception ->
                                    println("DEBUG: Update failed: ${exception.message}")
                                    errorMessage = "Failed to update booking: ${exception.message}"
                                }
                            } catch (e: Exception) {
                                println("DEBUG: Exception occurred: ${e.message}")
                                errorMessage = "Failed to update booking: ${e.message}"
                            } finally {
                                println("DEBUG: Finishing update process")
                                isUpdating = false
                                showResponseDialog = false
                                selectedBooking = null
                            }
                        }
                    }
                }
            )
        }
    }
}

@Composable
private fun MonthHeader(
    currentMonth: YearMonth,
    onPreviousMonth: () -> Unit,
    onNextMonth: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        IconButton(onClick = onPreviousMonth) {
            Icon(
                imageVector = Icons.Filled.ChevronLeft,
                contentDescription = "Previous month",
                tint = HustleColors.Primary
            )
        }
        
        Text(
            text = currentMonth.format(DateTimeFormatter.ofPattern("MMMM yyyy")),
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = HustleColors.Primary
        )
        
        IconButton(onClick = onNextMonth) {
            Icon(
                imageVector = Icons.Filled.ChevronRight,
                contentDescription = "Next month",
                tint = HustleColors.Primary
            )
        }
    }
}

@Composable
private fun CalendarGrid(
    currentMonth: YearMonth,
    selectedDate: LocalDate,
    bookingData: Map<LocalDate, DayBookingInfo>,
    onDateClick: (LocalDate) -> Unit
) {
    val daysInMonth = currentMonth.lengthOfMonth()
    
    Column {
        // Day headers
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            listOf("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat").forEach { day ->
                Text(
                    text = day,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color.Gray,
                    modifier = Modifier.weight(1f),
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )
            }
        }
        
        Spacer(modifier = Modifier.height(8.dp))
        
        // Calendar grid
        LazyVerticalGrid(
            columns = GridCells.Fixed(7),
            modifier = Modifier.height(300.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            items(daysInMonth) { day ->
                val date = currentMonth.atDay(day + 1)
                val dayInfo = bookingData[date]
                val isSelected = selectedDate == date
                val isToday = date == LocalDate.now()
                
                CalendarDayCell(
                    day = day + 1,
                    hasBookings = dayInfo?.bookings?.isNotEmpty() == true,
                    date = date,
                    isSelected = isSelected,
                    isToday = isToday,
                    onClick = { onDateClick(date) }
                )
            }
        }
    }
}

@Composable
private fun CalendarDayCell(
    day: Int,
    hasBookings: Boolean,
    date: LocalDate,
    isSelected: Boolean,
    isToday: Boolean,
    onClick: () -> Unit
) {
    val backgroundColor = when {
        isSelected -> HustleColors.BlueAccent
        isToday -> HustleColors.BlueAccent.copy(alpha = 0.3f)
        hasBookings -> Color(0xFFE3F2FD)
        else -> Color.Transparent
    }
    
    val borderStroke = when {
        isToday && !isSelected -> BorderStroke(2.dp, HustleColors.BlueAccent)
        hasBookings -> BorderStroke(2.dp, Color(0xFF4CAF50))
        else -> null
    }
    
    Surface(
        modifier = Modifier
            .size(48.dp)
            .clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        color = backgroundColor,
        border = borderStroke
    ) {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier.fillMaxSize()
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = day.toString(),
                    fontSize = 14.sp,
                    fontWeight = if (isSelected || isToday) FontWeight.Bold else FontWeight.Normal,
                    color = if (isSelected) Color.White else Color.Black
                )
                
                if (hasBookings) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(2.dp),
                        modifier = Modifier.height(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(4.dp)
                                .background(
                                    color = if (isSelected) Color.White else Color(0xFF4CAF50),
                                    shape = CircleShape
                                )
                        )
                        Box(
                            modifier = Modifier
                                .size(4.dp)
                                .background(
                                    color = if (isSelected) Color.White else Color(0xFFFF9800),
                                    shape = CircleShape
                                )
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun DayDetailsSection(
    date: LocalDate,
    dayInfo: DayBookingInfo
) {
    var showResponseDialog by remember { mutableStateOf(false) }
    var showMessageDialog by remember { mutableStateOf(false) }
    var selectedBooking by remember { mutableStateOf<Booking?>(null) }
    
    Column(
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            text = date.format(DateTimeFormatter.ofPattern("EEEE, MMMM dd, yyyy")),
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black
        )
        
        // Show all bookings for this date grouped by status
        val acceptedBookings = dayInfo.bookings.filter { it.status == BookingStatus.ACCEPTED }
        val pendingBookings = dayInfo.bookings.filter { it.status == BookingStatus.PENDING }
        val completedBookings = dayInfo.bookings.filter { it.status == BookingStatus.COMPLETED }
        
        // Accepted Bookings
        if (acceptedBookings.isNotEmpty()) {
            BookingSectionHeader(
                title = "Accepted Bookings",
                count = acceptedBookings.size,
                color = Color(0xFF4CAF50)
            )
            
            acceptedBookings.forEach { booking ->
                BookingCard(
                    booking = booking,
                    onAccept = { 
                        selectedBooking = booking
                        showResponseDialog = true
                    },
                    onDeny = { 
                        selectedBooking = booking
                        showResponseDialog = true
                    },
                    onMessage = {
                        selectedBooking = booking
                        // showMessageDialog = true // We'll add this later
                    }
                )
                Spacer(modifier = Modifier.height(12.dp))
            }
        }
        
        // Pending Bookings
        if (pendingBookings.isNotEmpty()) {
            BookingSectionHeader(
                title = "Pending Requests",
                count = pendingBookings.size,
                color = Color(0xFFFF9800)
            )
            
            pendingBookings.forEach { booking ->
                BookingCard(
                    booking = booking,
                    onAccept = { 
                        println("DEBUG: Setting selectedBooking and showResponseDialog for booking: ${booking.id}")
                        selectedBooking = booking
                        showResponseDialog = true
                        println("DEBUG: selectedBooking is now: ${selectedBooking?.id}, showResponseDialog is now: $showResponseDialog")
                    },
                    onDeny = { 
                        println("DEBUG: Setting selectedBooking and showResponseDialog for DENY booking: ${booking.id}")
                        selectedBooking = booking
                        showResponseDialog = true
                        println("DEBUG: selectedBooking is now: ${selectedBooking?.id}, showResponseDialog is now: $showResponseDialog")
                    },
                    onMessage = {
                        selectedBooking = booking
                        // showMessageDialog = true // We'll add this later
                    }
                )
                Spacer(modifier = Modifier.height(12.dp))
            }
        }
        
        // Completed Bookings
        if (completedBookings.isNotEmpty()) {
            BookingSectionHeader(
                title = "Completed Bookings",
                count = completedBookings.size,
                color = Color(0xFF2196F3)
            )
            
            completedBookings.forEach { booking ->
                BookingCard(
                    booking = booking,
                    onAccept = { 
                        selectedBooking = booking
                        showResponseDialog = true
                    },
                    onDeny = { 
                        selectedBooking = booking
                        showResponseDialog = true
                    },
                    onMessage = {
                        selectedBooking = booking
                        // showMessageDialog = true // We'll add this later
                    }
                )
                Spacer(modifier = Modifier.height(12.dp))
            }
        }
    }
    
    // Response Dialog
    if (showResponseDialog && selectedBooking != null) {
        BookingResponseDialog(
            booking = selectedBooking!!,
            onDismiss = { 
                showResponseDialog = false
                selectedBooking = null
            },
            onConfirm = { action, message ->
                // Handle accept/deny logic here
                showResponseDialog = false
                selectedBooking = null
                // TODO: Implement actual booking response logic
            }
        )
    }
    
    // Message Dialog
    if (showMessageDialog && selectedBooking != null) {
        MessageCustomerDialog(
            customerName = selectedBooking!!.customerName ?: "Customer",
            onDismiss = {
                showMessageDialog = false
                selectedBooking = null
            },
            onSendMessage = { message ->
                // Handle message sending logic here
                showMessageDialog = false
                selectedBooking = null
                // TODO: Implement actual message sending logic
            }
        )
    }
}

@Composable
private fun BookingSectionHeader(
    title: String,
    count: Int,
    color: Color
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.padding(vertical = 8.dp)
    ) {
        Box(
            modifier = Modifier
                .size(24.dp)
                .background(color, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = count.toString(),
                color = Color.White,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold
            )
        }
        
        Spacer(modifier = Modifier.width(8.dp))
        
        Text(
            text = title,
            fontSize = 16.sp,
            fontWeight = FontWeight.Medium,
            color = Color.Black
        )
    }
}

@Composable
private fun BookingCard(
    booking: Booking,
    onAccept: () -> Unit,
    onDeny: () -> Unit,
    onMessage: () -> Unit
) {
    val cardModifier = Modifier
        .fillMaxWidth()
        .padding(4.dp)
    
    // Apply neumorphic style based on booking status
    val finalModifier = when (booking.status) {
        BookingStatus.ACCEPTED, BookingStatus.COMPLETED -> {
            // Pressed neumorphic for accepted/completed bookings
            cardModifier
                .clip(RoundedCornerShape(12.dp))
                .neumorphic(
                    neuShape = Pressed.Rounded(radius = 12.dp),
                    lightShadowColor = Color.White,
                    darkShadowColor = Color.Gray.copy(alpha = 0.2f)
                )
        }
        BookingStatus.PENDING -> {
            // Punched neumorphic for pending bookings
            cardModifier
                .neumorphic(
                    neuShape = Punched.Rounded(radius = 12.dp),
                    lightShadowColor = Color.White,
                    darkShadowColor = Color.Gray.copy(alpha = 0.2f)
                )
        }
        else -> {
            // Default card style for other statuses
            cardModifier
        }
    }
    
    Box(
        modifier = finalModifier
            .background(
                Color.White,
                RoundedCornerShape(12.dp)
            )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = when (booking.status) {
                        BookingStatus.PENDING -> Icons.Filled.Schedule
                        BookingStatus.ACCEPTED -> Icons.Filled.CheckCircle
                        BookingStatus.COMPLETED -> Icons.Filled.Done
                        else -> Icons.Filled.Info
                    },
                    contentDescription = booking.status.name,
                    tint = when (booking.status) {
                        BookingStatus.PENDING -> Color(0xFFFF9800)
                        BookingStatus.ACCEPTED -> Color(0xFF4CAF50)
                        BookingStatus.COMPLETED -> Color(0xFF2196F3)
                        else -> Color.Gray
                    },
                    modifier = Modifier.size(20.dp)
                )
                
                Spacer(modifier = Modifier.width(12.dp))
                
                Column(
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = booking.requestedTime ?: "Time not specified",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                    Text(
                        text = booking.customerName ?: "Customer",
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                    Text(
                        text = booking.serviceName ?: "Service",
                        fontSize = 12.sp,
                        color = Color.Gray
                    )
                }
                
                StatusBadge(status = booking.status)
            }
            
            if (booking.notes.isNotBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "\"${booking.notes}\"",
                    fontSize = 12.sp,
                    color = Color.Gray,
                    fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
                )
            }
            
            // Action buttons - only show for pending bookings
            if (booking.status == BookingStatus.PENDING) {
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    OutlinedButton(
                        onClick = onMessage,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Message,
                            contentDescription = "Message",
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Message")
                    }
                    
                    OutlinedButton(
                        onClick = onDeny,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = Color(0xFFF44336)
                        )
                    ) {
                        Text("Deny")
                    }
                    
                    Button(
                        onClick = {
                            println("DEBUG: Accept button on card clicked for booking: ${booking.id}")
                            onAccept()
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF4CAF50)
                        )
                    ) {
                        Text("Accept")
                    }
                }
            }
        }
    }
}

@Composable
private fun EmptyDayCard(date: LocalDate) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        color = Color.White,
        shadowElevation = 1.dp
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = Icons.Filled.EventAvailable,
                contentDescription = "No bookings",
                tint = Color.Gray,
                modifier = Modifier.size(48.dp)
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "No bookings",
                fontSize = 16.sp,
                fontWeight = FontWeight.Medium,
                color = Color.Gray
            )
            
            Text(
                text = date.format(DateTimeFormatter.ofPattern("EEEE, MMMM dd")),
                fontSize = 14.sp,
                color = Color.Gray
            )
        }
    }
}

@Composable
private fun BookingResponseDialog(
    booking: Booking,
    onDismiss: () -> Unit,
    onConfirm: (action: String, message: String) -> Unit
) {
    var responseMessage by remember { mutableStateOf("") }
    var isAccepting by remember { mutableStateOf(true) }
    
    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = Color.White
        ) {
            Column(
                modifier = Modifier.padding(20.dp)
            ) {
                Text(
                    text = if (isAccepting) "Accept Booking Request" else "Deny Booking Request",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Text(
                    text = "Customer: ${booking.customerName ?: "Customer"}",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
                Text(
                    text = "Service: ${booking.serviceName ?: "Service"}",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
                Text(
                    text = "Time: ${booking.requestedTime ?: "Time not specified"}",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Row {
                    Button(
                        onClick = { isAccepting = true },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isAccepting) Color(0xFF4CAF50) else Color.Gray
                        ),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Accept")
                    }
                    
                    Spacer(modifier = Modifier.width(8.dp))
                    
                    Button(
                        onClick = { isAccepting = false },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (!isAccepting) Color(0xFFE53E3E) else Color.Gray
                        ),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Deny")
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                OutlinedTextField(
                    value = responseMessage,
                    onValueChange = { responseMessage = it },
                    label = { Text("Response Message (Optional)") },
                    modifier = Modifier.fillMaxWidth(),
                    maxLines = 3
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Row(
                    horizontalArrangement = Arrangement.End,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Cancel")
                    }
                    
                    Spacer(modifier = Modifier.width(8.dp))
                    
                    Button(
                        onClick = {
                            onConfirm(
                                if (isAccepting) "accept" else "deny",
                                responseMessage
                            )
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isAccepting) Color(0xFF4CAF50) else Color(0xFFE53E3E)
                        )
                    ) {
                        Text(if (isAccepting) "Accept" else "Deny")
                    }
                }
            }
        }
    }
}

@Composable
private fun MessageCustomerDialog(
    customerName: String,
    onDismiss: () -> Unit,
    onSendMessage: (String) -> Unit
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
                    text = "Send Message to $customerName",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                OutlinedTextField(
                    value = message,
                    onValueChange = { message = it },
                    label = { Text("Your message") },
                    modifier = Modifier.fillMaxWidth(),
                    maxLines = 5,
                    minLines = 3
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Row(
                    horizontalArrangement = Arrangement.End,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Cancel")
                    }
                    
                    Spacer(modifier = Modifier.width(8.dp))
                    
                    Button(
                        onClick = { onSendMessage(message) },
                        enabled = message.isNotBlank(),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF2196F3)
                        )
                    ) {
                        Text("Send")
                    }
                }
            }
        }
    }
}

@Composable
private fun StatusBadge(status: BookingStatus) {
    val (backgroundColor, textColor, text) = when (status) {
        BookingStatus.PENDING -> Triple(Color(0xFFFF9800), Color.White, "Pending")
        BookingStatus.ACCEPTED -> Triple(Color(0xFF4CAF50), Color.White, "Accepted")
        BookingStatus.DENIED -> Triple(Color(0xFFE53E3E), Color.White, "Denied")
        BookingStatus.COMPLETED -> Triple(Color(0xFF2196F3), Color.White, "Completed")
        BookingStatus.CANCELLED -> Triple(Color(0xFF757575), Color.White, "Cancelled")
        BookingStatus.MODIFIED -> Triple(Color(0xFF9C27B0), Color.White, "Modified")
    }
    
    Surface(
        color = backgroundColor,
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.padding(2.dp)
    ) {
        Text(
            text = text,
            color = textColor,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun BookingResponseDialog(
    request: Booking,
    isUpdating: Boolean = false,
    onDismiss: () -> Unit,
    onConfirm: (action: String, message: String) -> Unit
) {
    var responseMessage by remember { mutableStateOf("") }
    var isAccepting by remember { mutableStateOf(true) }
    
    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = Color.White
        ) {
            Column(
                modifier = Modifier.padding(20.dp)
            ) {
                Text(
                    text = if (isAccepting) "Accept Booking Request" else "Deny Booking Request",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Text(
                    text = "Customer: ${request.customerName}",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
                Text(
                    text = "Service: ${request.serviceName}",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
                Text(
                    text = "Date: ${request.requestedDate} at ${request.requestedTime}",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                OutlinedTextField(
                    value = responseMessage,
                    onValueChange = { responseMessage = it },
                    label = { Text("Response Message") },
                    placeholder = { 
                        Text(if (isAccepting) "Booking confirmed! Looking forward to seeing you." else "Sorry, this time slot is not available.")
                    },
                    modifier = Modifier.fillMaxWidth(),
                    maxLines = 3,
                    shape = RoundedCornerShape(12.dp)
                )
                
                Spacer(modifier = Modifier.height(20.dp))
                
                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        enabled = !isUpdating,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Cancel")
                    }
                    
                    Button(
                        onClick = { 
                            println("DEBUG: Deny button clicked")
                            isAccepting = false
                            onConfirm("deny", responseMessage)
                        },
                        enabled = !isUpdating,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFFF44336)
                        )
                    ) {
                        if (isUpdating) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(16.dp),
                                color = Color.White,
                                strokeWidth = 2.dp
                            )
                        } else {
                            Text("Deny")
                        }
                    }
                    
                    Button(
                        onClick = { 
                            println("DEBUG: Accept button clicked")
                            isAccepting = true
                            onConfirm("accept", responseMessage)
                        },
                        enabled = !isUpdating,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF4CAF50)
                        )
                    ) {
                        if (isUpdating) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(16.dp),
                                color = Color.White,
                                strokeWidth = 2.dp
                            )
                        } else {
                            Text("Accept")
                        }
                    }
                }
            }
        }
    }
}
