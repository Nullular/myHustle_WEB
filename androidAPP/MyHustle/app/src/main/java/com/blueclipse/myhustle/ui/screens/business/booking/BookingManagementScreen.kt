package com.blueclipse.myhustle.ui.screens.business.booking

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.activity.compose.BackHandler
import com.blueclipse.myhustle.data.model.Booking
import com.blueclipse.myhustle.data.model.BookingStatus
import com.blueclipse.myhustle.data.repository.AnalyticsRepository
import com.blueclipse.myhustle.data.repository.BookingRepository
import com.blueclipse.myhustle.ui.components.ColoredTopBar
import com.blueclipse.myhustle.ui.theme.HustleColors
import com.blueclipse.myhustle.ui.theme.fontFamily
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

data class BookingOverview(
    val pendingRequests: Int,
    val todaysBookings: Int,
    val upcomingBookings: Int,
    val totalBookings: Int
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookingManagementScreen(
    shopId: String? = null,
    onBack: () -> Unit = {},
    onBookingRequestsClick: () -> Unit = {},
    onAllBookingsClick: () -> Unit = {},
    onCalendarViewClick: () -> Unit = {}
) {
    var bookingOverview by remember { mutableStateOf<BookingOverview?>(null) }
    var isLoading by remember { mutableStateOf(true) }
    var todaysBookings by remember { mutableStateOf<List<Booking>>(emptyList()) }
    var weeklyBookingData by remember { mutableStateOf<Map<String, Int>>(emptyMap()) }
    
    // Handle system back gesture
    BackHandler {
        onBack()
    }
    
    val currentUser = FirebaseAuth.getInstance().currentUser
    val analyticsRepository = AnalyticsRepository.instance
    val bookingRepository = BookingRepository.instance
    val coroutineScope = rememberCoroutineScope()

    // Load live booking data
    LaunchedEffect(currentUser?.uid, shopId) {
        val userId = currentUser?.uid
        if (userId != null) {
            coroutineScope.launch {
                try {
                    isLoading = true
                    val analytics = if (shopId != null) {
                        // Get shop-specific analytics
                        analyticsRepository.getBookingAnalyticsForShop(shopId)
                    } else {
                        // Get all-shops analytics for the user
                        analyticsRepository.getBookingAnalytics(userId)
                    }
                    bookingOverview = BookingOverview(
                        pendingRequests = analytics.pendingBookings,
                        todaysBookings = analytics.todayBookings,
                        upcomingBookings = analytics.confirmedBookings,
                        totalBookings = analytics.totalBookings
                    )
                    
                    // Load today's bookings
                    val allBookings = if (shopId != null) {
                        bookingRepository.getBookingsForShop(shopId)
                    } else {
                        bookingRepository.getBookingsForShopOwner(userId)
                    }
                    
                    // Filter for today's bookings (accepted and today's date)
                    val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                    val today = dateFormat.format(Date())
                    
                    todaysBookings = allBookings.filter { booking ->
                        booking.status == BookingStatus.ACCEPTED &&
                        booking.requestedDate == today
                    }.sortedBy { booking ->
                        // Sort by time - convert "HH:mm" to minutes for sorting
                        try {
                            val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
                            timeFormat.parse(booking.requestedTime)?.time ?: 0
                        } catch (e: Exception) {
                            0L
                        }
                    }
                    
                    // Calculate weekly booking data (this week)
                    weeklyBookingData = calculateWeeklyBookingData(allBookings)
                    
                } catch (e: Exception) {
                    // Fallback data - don't show error to user, just use defaults
                    bookingOverview = BookingOverview(0, 0, 0, 0)
                    todaysBookings = emptyList()
                    weeklyBookingData = emptyMap()
                } finally {
                    isLoading = false
                }
            }
        } else {
            // User not logged in - show default data
            bookingOverview = BookingOverview(0, 0, 0, 0)
            todaysBookings = emptyList()
            weeklyBookingData = emptyMap()
            isLoading = false
        }
    }

    Scaffold(
        topBar = {
            ColoredTopBar(
                title = "Booking Management",
                onBack = onBack,
                cornerRadius = 0.dp
            )
        }
    ) { paddingValues ->
        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = HustleColors.Primary)
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                contentPadding = PaddingValues(vertical = 16.dp)
            ) {
                item {
                    BookingWelcomeCard()
                }
                
                bookingOverview?.let { overview ->
                    item {
                        BookingOverviewCard(overview)
                    }
                    
                    item {
                        QuickActionsSection(
                            onBookingRequestsClick = onBookingRequestsClick,
                            onAllBookingsClick = onAllBookingsClick,
                            onCalendarViewClick = onCalendarViewClick,
                            pendingCount = overview.pendingRequests
                        )
                    }
                }
                
                item {
                    TodaysBookingsCard(todaysBookings)
                }
                
                item {
                    UpcomingBookingsCard(weeklyBookingData)
                }
            }
        }
    }
}

/**
 * Calculate booking data for the current week (Monday to Sunday)
 */
private fun calculateWeeklyBookingData(bookings: List<Booking>): Map<String, Int> {
    val calendar = Calendar.getInstance()
    
    // Set to beginning of this week (Monday)
    calendar.set(Calendar.DAY_OF_WEEK, Calendar.MONDAY)
    calendar.set(Calendar.HOUR_OF_DAY, 0)
    calendar.set(Calendar.MINUTE, 0)
    calendar.set(Calendar.SECOND, 0)
    calendar.set(Calendar.MILLISECOND, 0)
    
    val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
    val weeklyData = mutableMapOf<String, Int>()
    
    // Initialize all days with 0 count
    val daysOfWeek = listOf("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
    daysOfWeek.forEach { day -> weeklyData[day] = 0 }
    
    // Get dates for this week (Monday to Sunday)
    for (dayOffset in 0..6) {
        val dayDate = calendar.time
        val dateString = dateFormat.format(dayDate)
        val dayName = daysOfWeek[dayOffset]
        
        // Count bookings for this date (accepted bookings only)
        val bookingCount = bookings.count { booking ->
            booking.requestedDate == dateString && 
            (booking.status == BookingStatus.ACCEPTED || booking.status == BookingStatus.PENDING)
        }
        
        weeklyData[dayName] = bookingCount
        
        // Move to next day
        calendar.add(Calendar.DAY_OF_MONTH, 1)
    }
    
    return weeklyData
}

@Composable
private fun BookingWelcomeCard() {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        color = HustleColors.LightestBlue,
        shadowElevation = 4.dp
    ) {
        Column(
            modifier = Modifier.padding(20.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Filled.CalendarToday,
                    contentDescription = "Booking Management",
                    tint = HustleColors.BlueAccent,
                    modifier = Modifier.size(32.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "Booking Management Hub",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black,
                        fontFamily = fontFamily
                    )
                    Text(
                        text = "Manage customer bookings efficiently",
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = "Review booking requests, manage your calendar, communicate with customers, and track all your appointments in one place.",
                fontSize = 14.sp,
                color = Color.Gray,
                lineHeight = 20.sp
            )
        }
    }
}

@Composable
private fun BookingOverviewCard(overview: BookingOverview) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        color = Color.White,
        shadowElevation = 2.dp
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Booking Overview",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black,
                fontFamily = fontFamily
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(
                horizontalArrangement = Arrangement.SpaceEvenly,
                modifier = Modifier.fillMaxWidth()
            ) {
                BookingStatItem(
                    label = "Pending\nRequests",
                    value = overview.pendingRequests.toString(),
                    color = Color(0xFFFF9800)
                )
                BookingStatItem(
                    label = "Today's\nBookings",
                    value = overview.todaysBookings.toString(),
                    color = Color(0xFF4CAF50)
                )
                BookingStatItem(
                    label = "Upcoming\nBookings",
                    value = overview.upcomingBookings.toString(),
                    color = HustleColors.BlueAccent
                )
                BookingStatItem(
                    label = "Total\nBookings",
                    value = overview.totalBookings.toString(),
                    color = Color(0xFF9C27B0)
                )
            }
        }
    }
}

@Composable
private fun BookingStatItem(
    label: String,
    value: String,
    color: Color
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = value,
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = color
        )
        Text(
            text = label,
            fontSize = 12.sp,
            color = Color.Gray,
            lineHeight = 14.sp
        )
    }
}

@Composable
private fun QuickActionsSection(
    onBookingRequestsClick: () -> Unit,
    onAllBookingsClick: () -> Unit,
    onCalendarViewClick: () -> Unit,
    pendingCount: Int
) {
    Column {
        Text(
            text = "Quick Actions",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black,
            fontFamily = fontFamily,
            modifier = Modifier.padding(bottom = 12.dp)
        )
        
        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            QuickActionCard(
                title = "Booking Requests",
                subtitle = "$pendingCount pending",
                icon = Icons.Filled.NotificationImportant,
                color = Color(0xFFFF9800),
                onClick = onBookingRequestsClick,
                modifier = Modifier.weight(1f)
            )
            
            QuickActionCard(
                title = "All Bookings",
                subtitle = "View list",
                icon = Icons.Filled.List,
                color = HustleColors.BlueAccent,
                onClick = onAllBookingsClick,
                modifier = Modifier.weight(1f)
            )
            
            QuickActionCard(
                title = "Calendar View",
                subtitle = "Daily view",
                icon = Icons.Filled.CalendarMonth,
                color = Color(0xFF4CAF50),
                onClick = onCalendarViewClick,
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
private fun QuickActionCard(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier.clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        color = Color.White,
        shadowElevation = 2.dp
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Surface(
                shape = RoundedCornerShape(10.dp),
                color = color.copy(alpha = 0.1f),
                modifier = Modifier.size(50.dp)
            ) {
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier.fillMaxSize()
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = title,
                        tint = color,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Text(
                text = title,
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = Color.Black
            )
            Text(
                text = subtitle,
                fontSize = 12.sp,
                color = Color.Gray
            )
        }
    }
}

@Composable
private fun TodaysBookingsCard(todaysBookings: List<Booking>) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        color = Color.White,
        shadowElevation = 2.dp
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "Today's Schedule",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black,
                    fontFamily = fontFamily
                )
                
                TextButton(
                    onClick = { /* Navigate to all bookings */ }
                ) {
                    Text("View All")
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Today's bookings from database
            if (todaysBookings.isEmpty()) {
                Text(
                    text = "No bookings scheduled for today",
                    fontSize = 14.sp,
                    color = Color.Gray,
                    modifier = Modifier.padding(vertical = 8.dp)
                )
            } else {
                todaysBookings.forEach { booking ->
                    // Format the time from 24-hour format to 12-hour format for display
                    val bookingTime = try {
                        val inputFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
                        val outputFormat = SimpleDateFormat("h:mm a", Locale.getDefault())
                        val time = inputFormat.parse(booking.requestedTime)
                        if (time != null) outputFormat.format(time) else booking.requestedTime
                    } catch (e: Exception) {
                        booking.requestedTime
                    }
                    
                    val bookingText = "$bookingTime - ${booking.serviceName} - ${booking.customerName}"
                    
                    Text(
                        text = bookingText,
                        fontSize = 14.sp,
                        color = Color.Gray,
                        modifier = Modifier.padding(vertical = 2.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun UpcomingBookingsCard(weeklyBookingData: Map<String, Int>) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        color = Color.White,
        shadowElevation = 2.dp
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "This Week's Highlights",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black,
                fontFamily = fontFamily
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            if (weeklyBookingData.isEmpty()) {
                // Fallback to old static data if no real data available
                Row(
                    horizontalArrangement = Arrangement.SpaceEvenly,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    WeeklyStatItem("Mon", 0, Color(0xFF4CAF50))
                    WeeklyStatItem("Tue", 0, Color(0xFF2196F3))
                    WeeklyStatItem("Wed", 0, Color(0xFFFF9800))
                    WeeklyStatItem("Thu", 0, Color(0xFF9C27B0))
                    WeeklyStatItem("Fri", 0, Color(0xFFF44336))
                    WeeklyStatItem("Sat", 0, Color(0xFF795548))
                    WeeklyStatItem("Sun", 0, Color(0xFF607D8B))
                }
            } else {
                Row(
                    horizontalArrangement = Arrangement.SpaceEvenly,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    val colors = listOf(
                        Color(0xFF4CAF50), // Green for Monday
                        Color(0xFF2196F3), // Blue for Tuesday
                        Color(0xFFFF9800), // Orange for Wednesday
                        Color(0xFF9C27B0), // Purple for Thursday
                        Color(0xFFF44336), // Red for Friday
                        Color(0xFF795548), // Brown for Saturday
                        Color(0xFF607D8B)  // Blue Grey for Sunday
                    )
                    val days = listOf("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
                    
                    days.forEachIndexed { index, day ->
                        val count = weeklyBookingData[day] ?: 0
                        WeeklyStatItem(day, count, colors[index])
                    }
                }
            }
        }
    }
}

@Composable
private fun WeeklyStatItem(
    day: String,
    count: Int,
    color: Color
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = count.toString(),
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = color
        )
        Text(
            text = day,
            fontSize = 12.sp,
            color = Color.Gray
        )
    }
}
