# Booking Screen Documentation

## Purpose & Function
The Booking Screen allows customers to schedule appointments for services offered by businesses. It provides a calendar interface for date selection, time slot availability, and booking confirmation with service providers.

## Screen Overview
- **File**: `NewBookingScreen.kt` (redirected from `BookingScreen.kt`)
- **Type**: Service Booking Interface
- **User Types**: Authenticated customers booking services

## UI Components & Layout

### Top App Bar (ColoredTopBar)
- **Back Button**: Close/back navigation icon
- **Title**: Service booking title
- **Background**: Branded color scheme
- **Actions**: Help or info buttons (if implemented)

### Service Information Header
- **Service Name**: Primary heading
- **Shop Name**: Secondary heading
- **Service Price**: Prominent price display
- **Duration**: Estimated service duration
- **Description**: Brief service description

### Calendar Section
- **Month Navigation**: 
  - Previous month button (ChevronLeft icon)
  - Current month/year display
  - Next month button (ChevronRight icon)

- **Calendar Grid**: 
  - Days of week headers
  - Calendar days grid (7 columns × 5-6 rows)
  - Custom CalendarDay styling with states:
    - Current month days
    - Previous/next month days (dimmed)
    - Today highlighting
    - Selected date highlighting
    - Blocked/unavailable dates
    - Available dates

### Time Slots Section
- **Available Times**: Grid layout of selectable time slots
- **Time Slot Cards**: Each slot displays:
  - Time (12-hour format display)
  - Availability status
  - Price per slot (if applicable)
  - Visual states: available, booked, selected

- **Unavailable Slots**: Dimmed/disabled appearance
- **Selected Slot**: Highlighted with primary color

### Booking Details Section
- **Selected Date**: Display chosen date
- **Selected Time**: Display chosen time slot
- **Total Duration**: Service duration display
- **Total Price**: Final booking cost

### Confirmation Section
- **Customer Information**: Auto-populated from user profile
- **Special Instructions**: Text field for additional requests
- **Terms Agreement**: Checkbox for booking terms
- **Book Now Button**: Primary action button

### Neumorphic Design Elements
- **Cards**: Elevated appearance with shadow effects
- **Buttons**: Pressed/unpressed visual states
- **Calendar**: Rounded corners with depth
- **Time Slots**: Interactive depth feedback

## Data Flow & State Management

### State Variables
```kotlin
var currentMonth by remember { mutableStateOf(YearMonth.now()) }
var selectedDate by remember { mutableStateOf<LocalDate?>(null) }
var selectedTimeSlot by remember { mutableStateOf<TimeSlot?>(null) }
var availableSlots by remember { mutableStateOf<List<TimeSlot>>(emptyList()) }
var isLoading by remember { mutableStateOf(false) }
var bookingError by remember { mutableStateOf<String?>(null) }
var showConfirmation by remember { mutableStateOf(false) }
```

### Repository Integration
```kotlin
val bookingRepository = BookingRepository.instance
val shopRepository = ShopRepository.instance
val serviceRepository = ServiceRepository.instance
```

### Data Loading Flow
1. **Service Information**: Load service details by serviceId
2. **Shop Information**: Load shop details and availability
3. **Calendar Data**: Generate calendar days for current month
4. **Time Slots**: Load available slots for selected date
5. **Booking Validation**: Check conflicts and availability

## Data Models

### Booking Model
```kotlin
data class Booking(
    val id: String = "",
    val customerId: String = "",
    val customerName: String = "",
    val customerEmail: String = "",
    val customerPhone: String = "",
    val shopId: String = "",
    val shopName: String = "",
    val shopOwnerId: String = "",
    val serviceId: String = "",
    val serviceName: String = "",
    val servicePrice: Double = 0.0,
    val bookingDate: String = "", // ISO date string
    val bookingTime: String = "", // 24-hour format
    val duration: Int = 60, // minutes
    val status: BookingStatus = BookingStatus.PENDING,
    val specialInstructions: String = "",
    val createdAt: Timestamp = Timestamp.now(),
    val updatedAt: Timestamp = Timestamp.now()
)
```

### BookingStatus Enum
```kotlin
enum class BookingStatus {
    PENDING,    // Awaiting business approval
    CONFIRMED,  // Approved by business
    COMPLETED,  // Service completed
    CANCELLED,  // Cancelled by customer or business
    NO_SHOW     // Customer didn't show up
}
```

### TimeSlot Model
```kotlin
data class TimeSlot(
    val time: String,        // Display time (12-hour format)
    val time24: String,      // Storage time (24-hour format)
    val isAvailable: Boolean,
    val price: String? = null // Optional price per slot
)
```

### CalendarDay Model
```kotlin
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
```

## API Integration

### BookingRepository Methods
- **createBooking(booking)**: Create new booking request
- **getAvailableSlots(date, serviceId)**: Get available time slots
- **checkConflicts(date, time, duration)**: Validate booking availability
- **getUserBookings(userId)**: Get user's booking history

### ServiceRepository Methods
- **getServiceById(id)**: Load service details
- **getServiceAvailability(id, date)**: Check service-specific availability

### ShopRepository Methods
- **getShopById(id)**: Load shop information
- **getOperatingHours(id)**: Get business operating hours
- **getBlockedDates(id)**: Get unavailable dates

## Business Logic

### Calendar Generation
```kotlin
fun generateCalendarDays(yearMonth: YearMonth): List<CalendarDay> {
    val firstDayOfMonth = yearMonth.atDay(1)
    val lastDayOfMonth = yearMonth.atEndOfMonth()
    val firstDayOfWeek = firstDayOfMonth.dayOfWeek.value % 7
    
    val days = mutableListOf<CalendarDay>()
    
    // Previous month days
    for (i in firstDayOfWeek - 1 downTo 0) {
        val date = firstDayOfMonth.minusDays(i + 1L)
        days.add(CalendarDay(
            date = date,
            isCurrentMonth = false,
            isToday = false,
            isSelectable = false
        ))
    }
    
    // Current month days
    for (day in 1..lastDayOfMonth.dayOfMonth) {
        val date = yearMonth.atDay(day)
        days.add(CalendarDay(
            date = date,
            isCurrentMonth = true,
            isToday = date == LocalDate.now(),
            isSelectable = date >= LocalDate.now()
        ))
    }
    
    return days
}
```

### Time Slot Generation
```kotlin
fun generateTimeSlots(
    openTime: String,     // "09:00"
    closeTime: String,    // "17:00"
    duration: Int,        // Service duration in minutes
    bookedSlots: List<String>
): List<TimeSlot> {
    val slots = mutableListOf<TimeSlot>()
    val (openHour, openMin) = openTime.split(":").map { it.toInt() }
    val (closeHour, closeMin) = closeTime.split(":").map { it.toInt() }
    
    var currentHour = openHour
    var currentMin = openMin
    
    while (currentHour < closeHour || (currentHour == closeHour && currentMin < closeMin)) {
        val time24 = String.format("%02d:%02d", currentHour, currentMin)
        val time12 = format24HourTo12Hour(time24)
        val isAvailable = time24 !in bookedSlots
        
        slots.add(TimeSlot(
            time = time12,
            time24 = time24,
            isAvailable = isAvailable
        ))
        
        // Add duration to current time
        currentMin += duration
        if (currentMin >= 60) {
            currentHour += currentMin / 60
            currentMin %= 60
        }
    }
    
    return slots
}
```

### Booking Validation
```kotlin
suspend fun validateBooking(
    date: LocalDate,
    timeSlot: TimeSlot,
    serviceId: String,
    customerId: String
): ValidationResult {
    // Check if date is in the future
    if (date < LocalDate.now()) {
        return ValidationResult(false, "Cannot book appointments in the past")
    }
    
    // Check if time slot is available
    if (!timeSlot.isAvailable) {
        return ValidationResult(false, "Selected time slot is no longer available")
    }
    
    // Check for existing bookings
    val existingBookings = bookingRepository.getBookingsForDateTime(date, timeSlot.time24)
    if (existingBookings.isNotEmpty()) {
        return ValidationResult(false, "Time slot conflicts with existing booking")
    }
    
    // Check business operating hours
    val shop = shopRepository.getShopById(serviceId)
    if (!isWithinOperatingHours(date, timeSlot.time24, shop)) {
        return ValidationResult(false, "Selected time is outside business hours")
    }
    
    return ValidationResult(true, null)
}
```

## User Interactions

### Primary Actions
1. **Navigate Calendar**: Previous/next month navigation
2. **Select Date**: Tap calendar day to choose date
3. **Select Time**: Choose from available time slots
4. **Add Instructions**: Enter special requests or notes
5. **Confirm Booking**: Submit booking request
6. **Cancel/Back**: Return to previous screen

### Calendar Interactions
- **Month Navigation**: Swipe or button navigation
- **Date Selection**: Tap to select available dates
- **Visual Feedback**: Highlight selected dates
- **Blocked Dates**: Show unavailable periods

### Time Slot Interactions
- **Slot Selection**: Tap to select available times
- **Availability Display**: Clear visual indicators
- **Price Display**: Show slot-specific pricing
- **Conflict Handling**: Disable unavailable slots

## Web Implementation Notes

### React/Next.js Implementation
```jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Chip,
  IconButton
} from '@mui/material';
import { ChevronLeft, ChevronRight, Close } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const BookingScreen = () => {
  const router = useRouter();
  const { serviceId, shopId } = router.query;
  const [service, setService] = useState(null);
  const [shop, setShop] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [serviceData, shopData] = await Promise.all([
          servicesAPI.getById(serviceId),
          shopsAPI.getById(shopId)
        ]);
        setService(serviceData);
        setShop(shopData);
      } catch (error) {
        setError('Failed to load service information');
      }
    };

    if (serviceId && shopId) fetchData();
  }, [serviceId, shopId]);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedDate || !serviceId) return;
      
      try {
        const slots = await bookingAPI.getAvailableSlots(serviceId, selectedDate);
        setAvailableSlots(slots);
      } catch (error) {
        console.error('Error fetching time slots:', error);
      }
    };

    fetchAvailableSlots();
  }, [selectedDate, serviceId]);

  const handleBooking = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time');
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        customerId: user.uid,
        customerName: user.displayName,
        customerEmail: user.email,
        shopId: shop.id,
        shopName: shop.name,
        shopOwnerId: shop.ownerId,
        serviceId: service.id,
        serviceName: service.name,
        servicePrice: service.price,
        bookingDate: selectedDate.toISOString().split('T')[0],
        bookingTime: selectedTime.time24,
        duration: service.duration,
        specialInstructions,
        status: 'PENDING'
      };

      const result = await bookingAPI.createBooking(bookingData);
      
      if (result.success) {
        router.push(`/booking-confirmation/${result.bookingId}`);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (!service || !shop) return <LoadingSpinner />;

  return (
    <Container>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => router.back()}>
          <Close />
        </IconButton>
        <Typography variant="h5" sx={{ ml: 2 }}>
          Book {service.name}
        </Typography>
      </Box>

      {/* Service Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">{service.name}</Typography>
          <Typography color="text.secondary">{shop.name}</Typography>
          <Typography variant="h5" color="primary" sx={{ mt: 1 }}>
            ${service.price}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Duration: {service.duration} minutes
          </Typography>
        </CardContent>
      </Card>

      {/* Date Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select Date
          </Typography>
          <DatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            minDate={new Date()}
            sx={{ width: '100%' }}
          />
        </CardContent>
      </Card>

      {/* Time Slots */}
      {selectedDate && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Available Times
            </Typography>
            <Grid container spacing={2}>
              {availableSlots.map((slot) => (
                <Grid item xs={6} sm={4} md={3} key={slot.time24}>
                  <Button
                    variant={selectedTime?.time24 === slot.time24 ? 'contained' : 'outlined'}
                    onClick={() => setSelectedTime(slot)}
                    disabled={!slot.isAvailable}
                    fullWidth
                  >
                    {slot.time}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Special Instructions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            label="Special Instructions (Optional)"
            multiline
            rows={3}
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            fullWidth
          />
        </CardContent>
      </Card>

      {/* Booking Summary */}
      {selectedDate && selectedTime && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Booking Summary
            </Typography>
            <Typography>Service: {service.name}</Typography>
            <Typography>Date: {selectedDate.toLocaleDateString()}</Typography>
            <Typography>Time: {selectedTime.time}</Typography>
            <Typography>Duration: {service.duration} minutes</Typography>
            <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
              Total: ${service.price}
            </Typography>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Book Button */}
      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={handleBooking}
        disabled={loading || !selectedDate || !selectedTime}
        sx={{ mb: 4 }}
      >
        {loading ? 'Creating Booking...' : 'Book Now'}
      </Button>
    </Container>
  );
};
```

### Calendar Component
```jsx
const CustomCalendar = ({ selectedDate, onDateSelect, blockedDates = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push({
        date: day,
        isCurrentMonth: false,
        isSelectable: false
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isBlocked = blockedDates.some(blocked => 
        blocked.toDateString() === date.toDateString()
      );
      const isToday = date.toDateString() === new Date().toDateString();
      const isPast = date < new Date().setHours(0, 0, 0, 0);
      
      days.push({
        date,
        isCurrentMonth: true,
        isSelectable: !isBlocked && !isPast,
        isToday,
        isBlocked
      });
    }
    
    return days;
  };
  
  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <Box>
      {/* Month Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <IconButton onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}>
          <ChevronLeft />
        </IconButton>
        <Typography variant="h6">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Typography>
        <IconButton onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}>
          <ChevronRight />
        </IconButton>
      </Box>
      
      {/* Day Names */}
      <Grid container>
        {dayNames.map(day => (
          <Grid item xs key={day}>
            <Typography align="center" variant="caption">
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>
      
      {/* Calendar Days */}
      <Grid container>
        {days.map((day, index) => (
          <Grid item xs key={index}>
            <Button
              onClick={() => day.isSelectable && onDateSelect(day.date)}
              disabled={!day.isSelectable}
              variant={selectedDate?.toDateString() === day.date.toDateString() ? 'contained' : 'text'}
              sx={{
                minWidth: 40,
                height: 40,
                p: 0,
                opacity: day.isCurrentMonth ? 1 : 0.3
              }}
            >
              {day.date.getDate()}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
```

## Performance Considerations
- **Calendar Optimization**: Generate days efficiently
- **Time Slot Caching**: Cache available slots
- **Debounced Updates**: Prevent excessive API calls
- **Progressive Loading**: Load essential data first
- **Memory Management**: Clean up unused state

## Accessibility Features
- **Keyboard Navigation**: Full calendar navigation
- **Screen Reader Support**: Proper ARIA labels
- **Focus Management**: Logical tab order
- **Color Independence**: Don't rely solely on color
- **Touch Targets**: Sufficient button sizes
