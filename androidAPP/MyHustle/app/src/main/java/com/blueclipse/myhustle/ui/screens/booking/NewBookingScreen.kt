package com.blueclipse.myhustle.ui.screens.booking

import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.blueclipse.myhustle.data.model.Booking
import com.blueclipse.myhustle.data.model.BookingStatus
import com.blueclipse.myhustle.data.repository.BookingRepository
import com.blueclipse.myhustle.ui.components.ColoredTopBar
import com.blueclipse.myhustle.data.repository.ShopRepository
import com.blueclipse.myhustle.data.repository.ServiceRepository
import com.blueclipse.myhustle.data.model.Shop
import com.blueclipse.myhustle.data.model.Service
import com.blueclipse.myhustle.ui.theme.HustleColors
import com.blueclipse.myhustle.ui.theme.HustleShapes
import com.blueclipse.myhustle.ui.theme.fontFamily
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.launch
import me.nikhilchaudhari.library.neumorphic
import me.nikhilchaudhari.library.shapes.Pressed
import me.nikhilchaudhari.library.shapes.Punched
import me.nikhilchaudhari.library.NeuInsets
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.DateTimeFormatter

// Helper function to format 24-hour time as 12-hour display
fun format24HourTo12Hour(time24: String): String {
    return try {
        val (hour, minute) = time24.split(":").map { it.toInt() }
        val hour12 = when {
            hour == 0 -> 12
            hour > 12 -> hour - 12
            else -> hour
        }
        val amPm = if (hour < 12) "AM" else "PM"
        String.format("%d:%02d %s", hour12, minute, amPm)
    } catch (e: Exception) {
        time24 // Return original if parsing fails
    }
}

// Data classes for our custom calendar
data class BookingRange(
    val startDate: LocalDate,
    val endDate: LocalDate,
    val isBlocked: Boolean = false, // true for unavailable ranges
    val reason: String = ""
)

data class CalendarDay(
    val date: LocalDate,
    val isCurrentMonth: Boolean,
    val isToday: Boolean,
    val isSelectable: Boolean,
    val isStartOfRange: Boolean = false,
    val isEndOfRange: Boolean = false,
    val isInRange: Boolean = false,
    val isBlocked: Boolean = false
)

// Time slot data class for multiple bookings per day
data class TimeSlot(
    val time: String, // Display time (12-hour format)
    val time24: String, // Storage time (24-hour format)
    val isAvailable: Boolean,
    val price: String? = null // Optional price per slot
)

// Sample time slots (in real app, this comes from API based on service type)
val availableTimeSlots = listOf(
    TimeSlot("9:00 AM", "09:00", true, "$50"),
    TimeSlot("10:30 AM", "10:30", false), // Already booked
    TimeSlot("12:00 PM", "12:00", true, "$50"),
    TimeSlot("1:30 PM", "13:30", true, "$50"),
    TimeSlot("3:00 PM", "15:00", false), // Already booked
    TimeSlot("4:30 PM", "16:30", true, "$50"),
    TimeSlot("6:00 PM", "18:00", true, "$60") // Evening rate
)

// Sample blocked periods (in real app, this comes from API)
val blockedRanges = listOf(
    BookingRange(
        startDate = LocalDate.now().plusDays(3),
        endDate = LocalDate.now().plusDays(5),
        isBlocked = true,
        reason = "Maintenance period"
    ),
    BookingRange(
        startDate = LocalDate.now().plusDays(10),
        endDate = LocalDate.now().plusDays(12),
        isBlocked = true,
        reason = "Fully booked"
    ),
    BookingRange(
        startDate = LocalDate.now().plusDays(18),
        endDate = LocalDate.now().plusDays(20),
        isBlocked = true,
        reason = "Holiday closure"
    )
)

// Helper functions
@RequiresApi(Build.VERSION_CODES.O)
fun generateCalendarDaysWithBookings(
    yearMonth: YearMonth,
    selectedStartDate: LocalDate?,
    selectedEndDate: LocalDate?,
    confirmedBookings: List<Booking>
): List<CalendarDay> {
    val firstDayOfMonth = yearMonth.atDay(1)
    val lastDayOfMonth = yearMonth.atEndOfMonth()
    val firstDayOfWeek = firstDayOfMonth.dayOfWeek.value % 7
    val today = LocalDate.now()
    
    val days = mutableListOf<CalendarDay>()
    
    // Add previous month's trailing days
    val previousMonth = yearMonth.minusMonths(1)
    val previousMonthLength = previousMonth.lengthOfMonth()
    for (i in firstDayOfWeek - 1 downTo 0) {
        val date = previousMonth.atDay(previousMonthLength - i)
        days.add(
            CalendarDay(
                date = date,
                isCurrentMonth = false,
                isToday = false,
                isSelectable = false,
                isBlocked = isDateBlockedByBookings(date, confirmedBookings)
            )
        )
    }
    
    // Add current month's days
    for (day in 1..lastDayOfMonth.dayOfMonth) {
        val date = yearMonth.atDay(day)
        val isBlocked = isDateBlockedByBookings(date, confirmedBookings)
        val isPastDate = date.isBefore(today)
        
        // Check if this date is in the selected range
        val isInRange = selectedStartDate != null && selectedEndDate != null &&
                        !date.isBefore(selectedStartDate) && !date.isAfter(selectedEndDate)
        val isStartOfRange = date == selectedStartDate
        val isEndOfRange = date == selectedEndDate
        
        days.add(
            CalendarDay(
                date = date,
                isCurrentMonth = true,
                isToday = date == today,
                isSelectable = !isPastDate && !isBlocked,
                isStartOfRange = isStartOfRange,
                isEndOfRange = isEndOfRange,
                isInRange = isInRange,
                isBlocked = isBlocked || isPastDate
            )
        )
    }
    
    // Add next month's leading days (to fill the grid)
    val totalCells = 42 // 6 weeks * 7 days
    val remainingCells = totalCells - days.size
    val nextMonth = yearMonth.plusMonths(1)
    for (day in 1..remainingCells) {
        if (day <= nextMonth.lengthOfMonth()) {
            val date = nextMonth.atDay(day)
            days.add(
                CalendarDay(
                    date = date,
                    isCurrentMonth = false,
                    isToday = false,
                    isSelectable = false,
                    isBlocked = isDateBlockedByBookings(date, confirmedBookings)
                )
            )
        }
    }
    
    return days
}

fun isDateBlockedByBookings(date: LocalDate, confirmedBookings: List<Booking>): Boolean {
    val dateString = date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))
    return confirmedBookings.any { booking ->
        booking.requestedDate == dateString && booking.status == BookingStatus.ACCEPTED
    }
}

fun isRangeBlockedByBookings(startDate: LocalDate, endDate: LocalDate, confirmedBookings: List<Booking>): Boolean {
    var currentDate = startDate
    while (!currentDate.isAfter(endDate)) {
        if (isDateBlockedByBookings(currentDate, confirmedBookings)) {
            return true
        }
        currentDate = currentDate.plusDays(1)
    }
    return false
}

// Legacy helper function for backward compatibility
@RequiresApi(Build.VERSION_CODES.O)
fun isDateBlocked(date: LocalDate): Boolean {
    return blockedRanges.any { range ->
        range.isBlocked && !date.isBefore(range.startDate) && !date.isAfter(range.endDate)
    }
}

@RequiresApi(Build.VERSION_CODES.O)
fun isRangeBlocked(startDate: LocalDate, endDate: LocalDate): Boolean {
    return blockedRanges.any { range ->
        range.isBlocked && (
            // Range overlaps with blocked range
            (!startDate.isAfter(range.endDate) && !endDate.isBefore(range.startDate))
        )
    }
}

// Requires API 26+ for java.time interop
@RequiresApi(Build.VERSION_CODES.O)
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NewBookingScreen(
    shopId: String = "",
    serviceId: String = "",
    serviceName: String = "",
    shopName: String = "",
    shopOwnerId: String = "",
    onBack: () -> Unit,
    onSave: (Long) -> Unit,
    onLoginClick: (() -> Unit)? = null
) {
    var currentMonth by remember { mutableStateOf(YearMonth.now()) }
    var selectedStartDate by remember { mutableStateOf<LocalDate?>(null) }
    var selectedEndDate by remember { mutableStateOf<LocalDate?>(null) }
    var selectedTimeSlot by remember { mutableStateOf<TimeSlot?>(null) }
    var showConfirmationDialog by remember { mutableStateOf(false) }
    var isCreatingBooking by remember { mutableStateOf(false) }
    var bookingError by remember { mutableStateOf<String?>(null) }
    
    // Load existing bookings for the shop to show unavailable slots
    var confirmedBookings by remember { mutableStateOf<List<Booking>>(emptyList()) }
    var isLoadingBookings by remember { mutableStateOf(true) }

    // Load shop and service for dynamic slot generation
    var shop by remember { mutableStateOf<Shop?>(null) }
    var service by remember { mutableStateOf<Service?>(null) }
    var isLoadingMeta by remember { mutableStateOf(true) }
    val shopRepository = remember { ShopRepository.instance }
    val serviceRepository = remember { ServiceRepository.instance }

    LaunchedEffect(shopId, serviceId) {
        try {
            isLoadingMeta = true
            shop = if (shopId.isNotEmpty()) shopRepository.getShopById(shopId) else null
            service = if (serviceId.isNotEmpty()) serviceRepository.getServiceById(serviceId).getOrNull() else null
        } catch (_: Exception) {
        } finally {
            isLoadingMeta = false
        }
    }
    
    val currentUser = FirebaseAuth.getInstance().currentUser
    val bookingRepository = BookingRepository.instance
    val coroutineScope = rememberCoroutineScope()
    
    // Load confirmed bookings to show unavailable periods
    LaunchedEffect(shopId) {
        if (shopId.isNotEmpty()) {
            try {
                isLoadingBookings = true
                // Load bookings for this specific shop
                val shopBookings = bookingRepository.getBookingsForShop(shopId)
                // Only show confirmed/accepted bookings as unavailable
                confirmedBookings = shopBookings.filter { 
                    it.status == BookingStatus.ACCEPTED 
                }
            } catch (e: Exception) {
                bookingError = "Failed to load booking availability: ${e.message}"
            } finally {
                isLoadingBookings = false
            }
        }
    }
    
    // Convert confirmed bookings to blocked ranges and time slots
    val blockedRanges = remember(confirmedBookings) {
        confirmedBookings.mapNotNull { booking ->
            try {
                val bookingDate = LocalDate.parse(booking.requestedDate)
                BookingRange(
                    startDate = bookingDate,
                    endDate = bookingDate, // Single day booking
                    isBlocked = true,
                    reason = "Time slot unavailable: ${booking.requestedTime}"
                )
            } catch (e: Exception) {
                null
            }
        }
    }
    
    // Generate time slots with availability based on confirmed bookings
    val availableTimeSlots = remember(selectedStartDate, confirmedBookings, shop, service) {
        if (selectedStartDate != null) {
            val dateString = selectedStartDate!!.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))
            val bookedTimes = confirmedBookings.filter { it.requestedDate == dateString }
                .map { it.requestedTime }
                .toSet()

            // Determine window from shop; fallback to 09:00-18:00
            val open = shop?.openTime24 ?: "09:00"
            val close = shop?.closeTime24 ?: "18:00"
            val (openH, openM) = open.split(":").map { it.toIntOrNull() ?: 0 }
            val (closeH, closeM) = close.split(":").map { it.toIntOrNull() ?: 0 }
            val openMin = openH * 60 + openM
            val closeMin = if (closeH == 24 && closeM == 0) 24 * 60 else closeH * 60 + closeM

            // Slot length should follow the service duration first, then fallback
            // to any explicit availability timeSlotDuration, then 60.
            // This avoids defaulting to 60 when availability carries defaults.
            val durationMin = (service?.estimatedDuration
                ?: service?.availability?.timeSlotDuration
                ?: 60).coerceAtLeast(5)

            val slots = mutableListOf<TimeSlot>()
            var t = openMin
            while (t + durationMin <= closeMin) {
                val h = t / 60
                val m = t % 60
                val timeStr24 = String.format("%02d:%02d", h, m)
                val displayTime = format24HourTo12Hour(timeStr24)
                val available = !bookedTimes.contains(timeStr24)
                slots += TimeSlot(displayTime, timeStr24, available, null)
                t += durationMin
            }
            slots
        } else {
            emptyList()
        }
    }
    
    // Updated helper function to check if date has confirmed bookings
    fun isDateBlocked(date: LocalDate): Boolean {
        val dateString = date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))
        val isPastDate = date.isBefore(LocalDate.now())
        val hasConfirmedBooking = confirmedBookings.any { booking ->
            booking.requestedDate == dateString && booking.status == BookingStatus.ACCEPTED
        }
        return isPastDate || hasConfirmedBooking
    }
    
    // Generate calendar days for current month with real booking data
    val calendarDays = remember(currentMonth, confirmedBookings, selectedStartDate, selectedEndDate) {
        generateCalendarDaysWithBookings(currentMonth, selectedStartDate, selectedEndDate, confirmedBookings)
    }
    
    // Check if selection is valid (not overlapping with blocked ranges)
    val isDateSelectionValid = selectedStartDate != null && 
                              !isDateBlocked(selectedStartDate!!) &&
                              (selectedEndDate == null || 
                               (!isRangeBlockedByBookings(selectedStartDate!!, selectedEndDate!!, confirmedBookings)))
    
    // Determine if this is a single day booking
    val isSingleDayBooking = selectedStartDate != null && 
                            (selectedEndDate == null || selectedStartDate == selectedEndDate)
    
    // Complete booking validation
    val isCompleteBookingValid = if (isSingleDayBooking) {
        // Single day booking - time slot required for better UX
        isDateSelectionValid && selectedStartDate != null && selectedTimeSlot != null
    } else {
        // Multi-day booking - time slot not needed
        isDateSelectionValid && selectedEndDate != null
    }

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            ColoredTopBar(
                title = "Book Service Period",
                onBack = onBack,
                cornerRadius = 24.dp
            )
        }
    ) { paddingValues ->
        if (isLoadingBookings) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    CircularProgressIndicator(
                        color = HustleColors.BlueAccent
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Loading available slots...",
                        color = Color.Gray,
                        fontFamily = fontFamily
                    )
                }
            }
        } else if (bookingError != null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = bookingError!!,
                        color = Color.Red,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(16.dp)
                    )
                    Button(
                        onClick = {
                            bookingError = null
                            // Retry loading bookings
                            coroutineScope.launch {
                                if (shopId.isNotEmpty()) {
                                    try {
                                        isLoadingBookings = true
                                        val shopBookings = bookingRepository.getBookingsForShop(shopId)
                                        confirmedBookings = shopBookings.filter { 
                                            it.status == BookingStatus.ACCEPTED 
                                        }
                                    } catch (e: Exception) {
                                        bookingError = "Failed to load booking availability: ${e.message}"
                                    } finally {
                                        isLoadingBookings = false
                                    }
                                }
                            }
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = HustleColors.BlueAccent
                        )
                    ) {
                        Text("Retry", color = Color.White)
                    }
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
            // Custom Calendar Header
            item {
                CalendarHeader(
                    currentMonth = currentMonth,
                    onPreviousMonth = { currentMonth = currentMonth.minusMonths(1) },
                    onNextMonth = { currentMonth = currentMonth.plusMonths(1) }
                )
            }
            
            // Days of week header
            item {
                DaysOfWeekHeader()
            }
            
            // Calendar grid
            item {
                CustomCalendarGrid(
                    days = calendarDays,
                    selectedStartDate = selectedStartDate,
                    selectedEndDate = selectedEndDate,
                    onDateClick = { date ->
                        when {
                            selectedStartDate == null -> {
                                // First selection - set as start date
                                selectedStartDate = date
                                selectedEndDate = null
                                selectedTimeSlot = null // Reset time slot when changing dates
                            }
                            selectedEndDate == null -> {
                                if (date == selectedStartDate) {
                                    // Same date clicked - this becomes a single-day booking
                                    selectedEndDate = selectedStartDate
                                } else if (date.isAfter(selectedStartDate) && service?.allowsMultiDayBooking == true) {
                                    // Valid end date - only if multi-day booking is allowed
                                    selectedEndDate = date
                                    selectedTimeSlot = null // Reset time slot for multi-day bookings
                                } else if (date.isAfter(selectedStartDate) && service?.allowsMultiDayBooking != true) {
                                    // Multi-day booking not allowed - start over with new selection
                                    selectedStartDate = date
                                    selectedEndDate = null
                                    selectedTimeSlot = null
                                } else {
                                    // Earlier date clicked - make this the new start date
                                    selectedStartDate = date
                                    selectedEndDate = null
                                    selectedTimeSlot = null
                                }
                            }
                            else -> {
                                // Both dates selected - start over with new selection
                                selectedStartDate = date
                                selectedEndDate = null
                                selectedTimeSlot = null
                            }
                        }
                    }
                )
            }
            
            // Selection status
            item {
                SelectionStatusCard(
                    startDate = selectedStartDate,
                    endDate = selectedEndDate,
                    isValid = isDateSelectionValid
                )
            }
            
            // Time slots section (show when single day is selected or when same start/end date)
            if (isSingleDayBooking && selectedStartDate != null) {
                item {
                    TimeSlotsSection(
                        selectedDate = selectedStartDate!!,
                        availableTimeSlots = availableTimeSlots,
                        selectedTimeSlot = selectedTimeSlot,
                        onTimeSlotSelected = { timeSlot ->
                            selectedTimeSlot = if (selectedTimeSlot == timeSlot) null else timeSlot
                        }
                    )
                }
            }
            
            // Legend
            item {
                LegendCard()
            }
            
            // Book button
            item {
                BookingButton(
                    isEnabled = isCompleteBookingValid,
                    startDate = selectedStartDate,
                    endDate = selectedEndDate,
                    selectedTimeSlot = selectedTimeSlot,
                    onBook = { showConfirmationDialog = true }
                )
            }
        }
        }
        
        // Confirmation Dialog
        if (showConfirmationDialog) {
            BookingConfirmationDialog(
                startDate = selectedStartDate!!,
                endDate = selectedEndDate ?: selectedStartDate!!, // Use start date as end date if none selected
                selectedTimeSlot = selectedTimeSlot,
                serviceName = serviceName,
                shopName = shopName,
                isCreating = isCreatingBooking,
                onConfirm = {
                    if (currentUser != null) {
                        isCreatingBooking = true
                        coroutineScope.launch {
                            try {
                                val booking = Booking(
                                    customerId = currentUser.uid,
                                    shopId = shopId,
                                    serviceId = serviceId,
                                    serviceName = serviceName,
                                    shopName = shopName,
                                    shopOwnerId = shopOwnerId, // This was missing!
                                    customerName = currentUser.displayName ?: "Unknown Customer",
                                    customerEmail = currentUser.email ?: "",
                                    requestedDate = selectedStartDate!!.format(DateTimeFormatter.ISO_LOCAL_DATE),
                                    requestedTime = selectedTimeSlot?.time24 ?: "09:00",
                                    status = BookingStatus.PENDING,
                                    notes = "",
                                    createdAt = System.currentTimeMillis(),
                                    updatedAt = System.currentTimeMillis()
                                )
                                
                                val result = bookingRepository.createBooking(booking)
                                if (result.isSuccess) {
                                    showConfirmationDialog = false
                                    onSave(selectedStartDate!!.toEpochDay() * 24 * 60 * 60 * 1000)
                                } else {
                                    bookingError = "Failed to create booking: ${result.exceptionOrNull()?.message}"
                                }
                            } catch (e: Exception) {
                                bookingError = "Error creating booking: ${e.message}"
                            } finally {
                                isCreatingBooking = false
                            }
                        }
                    } else {
                        // Not authenticated - redirect to login
                        onLoginClick?.invoke() ?: run {
                            bookingError = "Please log in to make a booking"
                        }
                    }
                },
                onDismiss = { 
                    showConfirmationDialog = false
                    bookingError = null
                }
            )
        }
    }
}

@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun CalendarHeader(
    currentMonth: YearMonth,
    onPreviousMonth: () -> Unit,
    onNextMonth: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onPreviousMonth) {
                Icon(
                    imageVector = Icons.Default.ChevronLeft,
                    contentDescription = "Previous month",
                    tint = HustleColors.GradientStart
                )
            }
            
            Text(
                text = currentMonth.format(DateTimeFormatter.ofPattern("MMMM yyyy")),
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface,
                fontFamily = fontFamily
            )
            
            IconButton(onClick = onNextMonth) {
                Icon(
                    imageVector = Icons.Default.ChevronRight,
                    contentDescription = "Next month",
                    tint = HustleColors.GradientStart
                )
            }
        }
    }
}

@Composable
fun DaysOfWeekHeader() {
    val daysOfWeek = listOf("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat")
    
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceEvenly
    ) {
        daysOfWeek.forEach { day ->
            Text(
                text = day,
                modifier = Modifier.weight(1f),
                textAlign = TextAlign.Center,
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontFamily = fontFamily
            )
        }
    }
}

@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun CustomCalendarGrid(
    days: List<CalendarDay>,
    selectedStartDate: LocalDate?,
    selectedEndDate: LocalDate?,
    onDateClick: (LocalDate) -> Unit
) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(7),
        modifier = Modifier.height(300.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        items(days) { day ->
            CalendarDayCell(
                day = day,
                onDateClick = { if (day.isSelectable) onDateClick(day.date) }
            )
        }
    }
}

@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun CalendarDayCell(
    day: CalendarDay,
    onDateClick: () -> Unit
) {
    val backgroundColor = when {
        day.isBlocked -> Color(0xFFF44336).copy(alpha = 0.2f)
        day.isStartOfRange || day.isEndOfRange -> HustleColors.GradientStart
        day.isInRange -> HustleColors.GradientStart.copy(alpha = 0.3f)
        day.isToday && day.isCurrentMonth -> HustleColors.GradientEnd.copy(alpha = 0.5f)
        day.isCurrentMonth && day.isSelectable -> MaterialTheme.colorScheme.surface
        else -> Color.Transparent
    }
    
    val textColor = when {
        day.isBlocked -> Color(0xFFF44336)
        day.isStartOfRange || day.isEndOfRange -> Color.White
        day.isInRange -> HustleColors.GradientStart
        day.isToday && day.isCurrentMonth -> Color.White
        day.isCurrentMonth && day.isSelectable -> MaterialTheme.colorScheme.onSurface
        day.isCurrentMonth -> MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
        else -> MaterialTheme.colorScheme.onSurface.copy(alpha = 0.3f)
    }
    
    Box(
        modifier = Modifier
            .size(40.dp)
            .clip(CircleShape)
            .background(backgroundColor)
            .clickable(enabled = day.isSelectable) { onDateClick() }
            .let { modifier ->
                if (day.isToday && day.isCurrentMonth) {
                    modifier.border(2.dp, HustleColors.GradientEnd, CircleShape)
                } else modifier
            },
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = day.date.dayOfMonth.toString(),
            color = textColor,
            fontSize = 14.sp,
            fontWeight = if (day.isStartOfRange || day.isEndOfRange || day.isToday) FontWeight.Bold else FontWeight.Normal,
            fontFamily = fontFamily
        )
    }
}

@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun SelectionStatusCard(
    startDate: LocalDate?,
    endDate: LocalDate?,
    isValid: Boolean
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = when {
                isValid -> Color(0xFF4CAF50).copy(alpha = 0.1f)
                startDate != null && endDate != null && !isValid -> Color(0xFFF44336).copy(alpha = 0.1f)
                else -> MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
            }
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = when {
                    isValid -> Icons.Default.Check
                    startDate != null && endDate != null && !isValid -> Icons.Default.Close
                    else -> Icons.Default.Check
                },
                contentDescription = null,
                tint = when {
                    isValid -> Color(0xFF4CAF50)
                    startDate != null && endDate != null && !isValid -> Color(0xFFF44336)
                    else -> MaterialTheme.colorScheme.onSurfaceVariant
                },
                modifier = Modifier.size(20.dp)
            )
            
            Spacer(modifier = Modifier.width(12.dp))
            
            Column {
                Text(
                    text = when {
                        startDate == null -> "Select your start date"
                        endDate == null -> "Select your end date"
                        isValid -> "Valid selection"
                        else -> "Selection overlaps with blocked period"
                    },
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium,
                    color = when {
                        isValid -> Color(0xFF4CAF50)
                        startDate != null && endDate != null && !isValid -> Color(0xFFF44336)
                        else -> MaterialTheme.colorScheme.onSurfaceVariant
                    },
                    fontFamily = fontFamily
                )
                
                if (startDate != null && endDate != null) {
                    Text(
                        text = "${startDate.format(DateTimeFormatter.ofPattern("MMM dd"))} - ${endDate.format(DateTimeFormatter.ofPattern("MMM dd, yyyy"))}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.8f),
                        fontFamily = fontFamily
                    )
                }
            }
        }
    }
}

@Composable
fun LegendCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Legend",
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                fontFamily = fontFamily
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                LegendItem(
                    color = HustleColors.GradientStart,
                    label = "Selected"
                )
                LegendItem(
                    color = Color(0xFFF44336),
                    label = "Blocked"
                )
                LegendItem(
                    color = HustleColors.GradientEnd,
                    label = "Today"
                )
            }
        }
    }
}

@Composable
fun LegendItem(
    color: Color,
    label: String
) {
    Row(
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(12.dp)
                .background(color, CircleShape)
        )
        Spacer(modifier = Modifier.width(4.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = Color.White,
            fontFamily = fontFamily
        )
    }
}

@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun TimeSlotsSection(
    selectedDate: LocalDate,
    availableTimeSlots: List<TimeSlot>,
    selectedTimeSlot: TimeSlot?,
    onTimeSlotSelected: (TimeSlot) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Available Time Slots",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontFamily = fontFamily
                )
                Text(
                    text = selectedDate.format(DateTimeFormatter.ofPattern("MMM dd")),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontFamily = fontFamily
                )
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Time slots grid (2 columns)
            for (i in availableTimeSlots.indices step 2) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // First slot in row
                    TimeSlotChip(
                        timeSlot = availableTimeSlots[i],
                        isSelected = selectedTimeSlot == availableTimeSlots[i],
                        onSelected = { onTimeSlotSelected(availableTimeSlots[i]) },
                        modifier = Modifier.weight(1f)
                    )
                    
                    // Second slot in row (if exists)
                    if (i + 1 < availableTimeSlots.size) {
                        TimeSlotChip(
                            timeSlot = availableTimeSlots[i + 1],
                            isSelected = selectedTimeSlot == availableTimeSlots[i + 1],
                            onSelected = { onTimeSlotSelected(availableTimeSlots[i + 1]) },
                            modifier = Modifier.weight(1f)
                        )
                    } else {
                        // Empty space to keep alignment
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
                
                if (i + 2 < availableTimeSlots.size) {
                    Spacer(modifier = Modifier.height(8.dp))
                }
            }
        }
    }
}

@Composable
fun TimeSlotChip(
    timeSlot: TimeSlot,
    isSelected: Boolean,
    onSelected: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .height(60.dp)
            .clip(HustleShapes.card)
            .neumorphic(
                neuShape = if (isSelected || !timeSlot.isAvailable) {
                    // Use pressed neumorphic style for selected and blocked slots
                    Pressed.Rounded(radius = 4.dp)
                } else {
                    // Use punched style for available slots (elevated look)
                    Punched.Rounded(radius = 4.dp)
                },
                lightShadowColor = HustleColors.lightShadow,
                darkShadowColor = HustleColors.darkShadow,
                elevation = if (isSelected) 8.dp else 4.dp,
                neuInsets = if (isSelected || !timeSlot.isAvailable) NeuInsets(2.dp, 2.dp) else NeuInsets(0.dp, 0.dp),
                strokeWidth = if (isSelected) 6.dp else 4.dp
            )
            .background(MaterialTheme.colorScheme.surface)
            .clickable(enabled = timeSlot.isAvailable) { onSelected() },
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = timeSlot.time,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                color = when {
                    isSelected -> HustleColors.GradientStart // Use theme color for selected
                    !timeSlot.isAvailable -> Color(0xFFF44336) // Red text for blocked
                    else -> MaterialTheme.colorScheme.onSurface // Normal text
                },
                fontFamily = fontFamily
            )
            
            if (timeSlot.price != null) {
                Text(
                    text = timeSlot.price,
                    style = MaterialTheme.typography.bodySmall,
                    color = when {
                        isSelected -> HustleColors.GradientStart.copy(alpha = 0.8f)
                        !timeSlot.isAvailable -> Color(0xFFF44336).copy(alpha = 0.7f)
                        else -> MaterialTheme.colorScheme.onSurfaceVariant
                    },
                    fontFamily = fontFamily
                )
            }
            
            if (!timeSlot.isAvailable) {
                Text(
                    text = "Booked",
                    style = MaterialTheme.typography.labelSmall,
                    color = Color(0xFFF44336), // Red text for "Booked"
                    fontWeight = FontWeight.Bold,
                    fontFamily = fontFamily
                )
            }
        }
    }
}

@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun BookingButton(
    isEnabled: Boolean,
    startDate: LocalDate?,
    endDate: LocalDate?,
    selectedTimeSlot: TimeSlot?,
    onBook: () -> Unit
) {
    Button(
        onClick = onBook,
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp),
        enabled = isEnabled,
        colors = ButtonDefaults.buttonColors(
            containerColor = Color.Transparent
        ),
        contentPadding = PaddingValues()
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    if (isEnabled) {
                        Brush.horizontalGradient(
                            listOf(HustleColors.GradientStart, HustleColors.GradientEnd)
                        )
                    } else {
                        Brush.horizontalGradient(
                            listOf(Color.Gray.copy(alpha = 0.3f), Color.Gray.copy(alpha = 0.3f))
                        )
                    }
                ),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = when {
                    startDate == null -> "Select Date"
                    endDate == null -> "Book Single Day or Select End Date"
                    !isEnabled -> "Selection Not Available"
                    else -> "Book Selected ${if (startDate == endDate) "Appointment" else "Period"}"
                },
                color = if (isEnabled) Color.White else Color.Gray,
                fontSize = 16.sp,
                fontWeight = FontWeight.Medium,
                fontFamily = fontFamily,
                textAlign = TextAlign.Center
            )
        }
    }
}

@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun BookingConfirmationDialog(
    startDate: LocalDate,
    endDate: LocalDate,
    selectedTimeSlot: TimeSlot?,
    serviceName: String = "",
    shopName: String = "",
    isCreating: Boolean = false,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Confirm Booking",
                fontFamily = fontFamily,
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Column {
                if (serviceName.isNotEmpty()) {
                    Text(
                        text = "Service: $serviceName",
                        fontFamily = fontFamily,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                }
                if (shopName.isNotEmpty()) {
                    Text(
                        text = "Shop: $shopName",
                        fontFamily = fontFamily,
                        style = MaterialTheme.typography.bodySmall
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                }
                Text(
                    text = if (startDate == endDate) "Please confirm your appointment:" else "Please confirm your booking period:",
                    fontFamily = fontFamily,
                    style = MaterialTheme.typography.bodyMedium
                )
                Spacer(modifier = Modifier.height(12.dp))
                
                if (startDate == endDate) {
                    // Single day appointment
                    Text(
                        text = "Date: ${startDate.format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"))}",
                        fontWeight = FontWeight.Medium,
                        fontFamily = fontFamily,
                        style = MaterialTheme.typography.bodyMedium
                    )
                    if (selectedTimeSlot != null) {
                        Text(
                            text = "Time: ${selectedTimeSlot.time}",
                            fontWeight = FontWeight.Medium,
                            fontFamily = fontFamily,
                            style = MaterialTheme.typography.bodyMedium
                        )
                        if (selectedTimeSlot.price != null) {
                            Text(
                                text = "Price: ${selectedTimeSlot.price}",
                                fontWeight = FontWeight.Medium,
                                fontFamily = fontFamily,
                                style = MaterialTheme.typography.bodyMedium,
                                color = HustleColors.GradientStart
                            )
                        }
                    }
                } else {
                    // Multi-day booking
                    Text(
                        text = "From: ${startDate.format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"))}",
                        fontWeight = FontWeight.Medium,
                        fontFamily = fontFamily,
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Text(
                        text = "To: ${endDate.format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"))}",
                        fontWeight = FontWeight.Medium,
                        fontFamily = fontFamily,
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    val daysDifference = startDate.until(endDate).days + 1
                    Text(
                        text = "Duration: $daysDifference day${if (daysDifference > 1) "s" else ""}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontFamily = fontFamily
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = onConfirm,
                enabled = !isCreating,
                colors = ButtonDefaults.buttonColors(
                    containerColor = HustleColors.GradientStart
                )
            ) {
                if (isCreating) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(16.dp),
                        color = Color.White,
                        strokeWidth = 2.dp
                    )
                } else {
                    Text(
                        text = if (startDate == endDate) "Confirm Appointment" else "Confirm Booking",
                        fontFamily = fontFamily
                    )
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text(
                    text = "Cancel",
                    fontFamily = fontFamily
                )
            }
        }
    )
}
