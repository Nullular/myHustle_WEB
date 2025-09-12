'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  Clock, 
  Calendar,
  MapPin,
  Loader2
} from 'lucide-react';
import { Service } from '@/types/models';
import { Booking, BookingStatus } from '@/types';
import { CalendarDay, TimeSlot, BookingScreenProps } from '@/types/booking';
import { bookingRepository } from '@/lib/firebase/repositories';
import { useAuthStore } from '@/lib/store/auth';
import {
  CalendarHeader,
  DaysOfWeekHeader,
  CustomCalendarGrid,
  SelectionStatusCard,
  LegendCard,
  TimeSlotsSection,
  BookingButton,
  BookingConfirmationDialog
} from './BookingCalendar';

// Utility functions for calendar
const generateCalendarDays = (year: number, month: number, blockedDates: Date[] = []): CalendarDay[] => {
  const today = new Date();
  const currentDate = new Date(year, month, 1);
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  const days: CalendarDay[] = [];
  
  // Add previous month's trailing days
  const prevMonth = new Date(year, month - 1, 0);
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonth.getDate() - i);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      isSelectable: false,
      isBlocked: false,
      isStartOfRange: false,
      isEndOfRange: false,
      isInRange: false
    });
  }
  
  // Add current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isToday = date.toDateString() === today.toDateString();
    const isPast = date < today && !isToday;
    const isBlocked = blockedDates.some(blockedDate => 
      blockedDate.toDateString() === date.toDateString()
    );
    
    days.push({
      date,
      isCurrentMonth: true,
      isToday,
      isSelectable: !isPast && !isBlocked,
      isBlocked,
      isStartOfRange: false,
      isEndOfRange: false,
      isInRange: false
    });
  }
  
  // Add next month's leading days to fill the grid
  const totalCells = Math.ceil(days.length / 7) * 7;
  const remainingCells = totalCells - days.length;
  for (let day = 1; day <= remainingCells; day++) {
    const date = new Date(year, month + 1, day);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      isSelectable: false,
      isBlocked: false,
      isStartOfRange: false,
      isEndOfRange: false,
      isInRange: false
    });
  }
  
  return days;
};

const updateDaysWithSelection = (
  days: CalendarDay[], 
  startDate: Date | null, 
  endDate: Date | null
): CalendarDay[] => {
  return days.map(day => {
    const isStartOfRange = startDate && day.date.toDateString() === startDate.toDateString();
    const isEndOfRange = endDate && day.date.toDateString() === endDate.toDateString();
    const isInRange = startDate && endDate && 
      day.date > startDate && day.date < endDate && day.isCurrentMonth;
    
    return {
      ...day,
      isStartOfRange: !!isStartOfRange,
      isEndOfRange: !!isEndOfRange,
      isInRange: !!isInRange
    };
  });
};

// Generate time slots using Android logic (shop hours + service duration + real booking data)
const generateTimeSlots = (
  selectedDate: Date | null,
  confirmedBookings: Booking[],
  shopOpenTime?: string, 
  shopCloseTime?: string, 
  estimatedDuration?: number
): TimeSlot[] => {
  if (!selectedDate) return [];
  
  const slots: TimeSlot[] = [];
  
  // Get booked times for this specific date (Android logic)
  const dateString = selectedDate.toISOString().split('T')[0]; // "yyyy-MM-dd" format
  const bookedTimes = confirmedBookings
    .filter(booking => booking.requestedDate === dateString)
    .map(booking => booking.requestedTime)
    .filter(Boolean);
  const bookedTimesSet = new Set(bookedTimes);
  
  // Use Android fallback logic: shop hours or 09:00-18:00
  const open = shopOpenTime || "09:00";
  const close = shopCloseTime || "18:00";
  
  const [openH, openM] = open.split(":").map(val => parseInt(val) || 0);
  const [closeH, closeM] = close.split(":").map(val => parseInt(val) || 0);
  
  const openMin = openH * 60 + openM;
  const closeMin = closeH === 24 && closeM === 0 ? 24 * 60 : closeH * 60 + closeM;

  // Use service duration or fallback to 60 minutes (Android logic)
  const durationMin = Math.max(estimatedDuration || 60, 5);

  let t = openMin;
  while (t + durationMin <= closeMin) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    const time24 = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    const time12 = new Date(`2000-01-01T${time24}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    // Check real availability against booked times
    const isAvailable = !bookedTimesSet.has(time24);
    
    slots.push({
      time: time12,
      time24,
      isAvailable, // Now using real booking data!
      price: undefined // Price will be displayed separately from service basePrice
    });
    
    t += durationMin;
  }
  
  return slots;
};

export default function BookingScreen({
  shopId,
  serviceId,
  serviceName,
  shopName,
  shopOwnerId,
  shopOpenTime,
  shopCloseTime,
  service,
  onBack,
  onSave,
  onLoginClick
}: BookingScreenProps) {
  // Auth state
  const { user } = useAuthStore();
  
  // State management
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [confirmedBookings, setConfirmedBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  // Generate time slots dynamically based on selected date and confirmed bookings (Android logic)
  const availableTimeSlots = useMemo(() => {
    return generateTimeSlots(
      selectedStartDate,
      confirmedBookings,
      shopOpenTime,
      shopCloseTime,
      (service as any)?.estimatedDuration || 120 // Using estimatedDuration to match models.ts
    );
  }, [selectedStartDate, confirmedBookings, shopOpenTime, shopCloseTime, service]);

  // Computed values (EXACT same logic as store owner calendar)
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Generate blocked dates using EXACT same logic as store owner calendar
    const blockedDates: Date[] = [];
    
    for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format (EXACT same as store calendar)
      
      // Find bookings for this date (EXACT same filtering logic)
      const dayBookings = confirmedBookings.filter(booking => booking.requestedDate === dateStr);
      
      // Check if any booking is ACCEPTED (blocking the date)
      const hasAcceptedBooking = dayBookings.some(booking => booking.status === BookingStatus.ACCEPTED);
      
      if (hasAcceptedBooking) {
        blockedDates.push(date);
      }
    }
    
    const days = generateCalendarDays(
      year,
      month,
      blockedDates
    );
    
    return updateDaysWithSelection(days, selectedStartDate, selectedEndDate);
  }, [currentMonth, confirmedBookings, selectedStartDate, selectedEndDate]);

  const isSingleDayBooking = useMemo(() => {
    if (!selectedStartDate) return false;
    if (!selectedEndDate) return true; // Only start date selected
    return selectedStartDate.toDateString() === selectedEndDate.toDateString();
  }, [selectedStartDate, selectedEndDate]);

  const isDateSelectionValid = useMemo(() => {
    if (!selectedStartDate || !selectedEndDate) return false;
    
    // Check if any day in the selected range is blocked (EXACT same logic as store calendar)
    const start = new Date(selectedStartDate);
    const end = new Date(selectedEndDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]; // EXACT same format as store calendar
      const hasAcceptedBooking = confirmedBookings.some(booking => 
        booking.requestedDate === dateStr && booking.status === BookingStatus.ACCEPTED
      );
      if (hasAcceptedBooking) return false;
    }
    
    return true;
  }, [selectedStartDate, selectedEndDate, confirmedBookings]);

  const isCompleteBookingValid = useMemo(() => {
    if (!selectedStartDate || !selectedEndDate || !isDateSelectionValid) return false;
    
    // For single day bookings, require time slot selection
    if (isSingleDayBooking) {
      return selectedTimeSlot !== null;
    }
    
    // For multi-day bookings, time slot is not required
    return true;
  }, [selectedStartDate, selectedEndDate, isDateSelectionValid, isSingleDayBooking, selectedTimeSlot]);

  // Load confirmed bookings on mount (EXACT same logic as store owner calendar)
  useEffect(() => {
    async function loadBookings() {
      setIsLoadingBookings(true);
      setBookingError(null);
      
      try {
        console.log('🔍 Loading bookings for shop (customer view):', shopId);
        
        // Get all bookings for specific shop (EXACT same as store owner calendar)
        const shopBookings = await bookingRepository.getBookingsForShop(shopId);
        
        console.log('📋 Found bookings (customer view):', shopBookings.length);
        console.log('🔍 Bookings details:', shopBookings.map(b => ({
          id: b.id,
          date: b.requestedDate,
          time: b.requestedTime,
          status: b.status,
          serviceId: b.serviceId
        })));
        setConfirmedBookings(shopBookings);
      } catch (error: any) {
        console.error('❌ Error loading bookings:', error);
        setBookingError(error.message || 'Failed to load booking availability');
      } finally {
        setIsLoadingBookings(false);
      }
    }

    loadBookings();
  }, [shopId]);

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Date selection handler
  const handleDateClick = (date: Date) => {
    if (!selectedStartDate) {
      // First selection - set as start date
      setSelectedStartDate(date);
      setSelectedEndDate(null);
      setSelectedTimeSlot(null);
    } else if (!selectedEndDate) {
      if (date.toDateString() === selectedStartDate.toDateString()) {
        // Same date clicked - this becomes a single-day booking
        setSelectedEndDate(selectedStartDate);
      } else if (date > selectedStartDate && service?.allowsMultiDayBooking) {
        // Valid end date - only if multi-day booking is allowed
        setSelectedEndDate(date);
        setSelectedTimeSlot(null); // Reset time slot for multi-day bookings
      } else if (date > selectedStartDate && !service?.allowsMultiDayBooking) {
        // Multi-day booking not allowed - start over with new selection
        setSelectedStartDate(date);
        setSelectedEndDate(null);
        setSelectedTimeSlot(null);
      } else {
        // Earlier date clicked - make this the new start date
        setSelectedStartDate(date);
        setSelectedEndDate(null);
        setSelectedTimeSlot(null);
      }
    } else {
      // Both dates selected - start over with new selection
      setSelectedStartDate(date);
      setSelectedEndDate(null);
      setSelectedTimeSlot(null);
    }
  };

  // Time slot selection handler
  const handleTimeSlotSelected = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(selectedTimeSlot === timeSlot ? null : timeSlot);
  };

  // Booking creation handler (matches Android NewBookingScreen logic exactly)
  const handleCreateBooking = async () => {
    if (!selectedStartDate || !selectedTimeSlot) {
      setBookingError("Please select a date and time slot");
      return;
    }
    
    setIsCreatingBooking(true);
    setBookingError(null);
    
    try {
      // Check if user is authenticated (matches Android logic)
      if (!user) {
        if (onLoginClick) {
          onLoginClick();
        } else {
          setBookingError("Please log in to make a booking");
        }
        return;
      }

      // Create booking object (exact same structure as Android)
      const booking = {
        customerId: user.id,
        shopId,
        serviceId,
        serviceName,
        shopName,
        shopOwnerId,
        customerName: user.displayName || user.email || "Unknown Customer",
        customerEmail: user.email || "",
        requestedDate: selectedStartDate.toISOString().split('T')[0], // YYYY-MM-DD format
        requestedTime: selectedTimeSlot.time,
        status: BookingStatus.PENDING,
        notes: '',
        responseMessage: '', // Required field for models.ts Booking interface
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      console.log('🔄 Creating booking (web):', booking);
      
      // Create booking using Firebase (exact same method as Android)
      const bookingId = await bookingRepository.createBooking(booking);
      
      console.log('✅ Booking created successfully with ID:', bookingId);
      alert(`Booking request sent successfully! Booking ID: ${bookingId}`);
      
      // Reset form and close dialog
      setSelectedStartDate(null);
      setSelectedEndDate(null);
      setSelectedTimeSlot(null);
      setShowConfirmationDialog(false);
      
      // Refresh bookings to show the new one
      async function loadBookings() {
        setIsLoadingBookings(true);
        try {
          const shopBookings = await bookingRepository.getBookingsForShop(shopId);
          setConfirmedBookings(shopBookings);
        } catch (error: any) {
          console.error('❌ Error loading bookings:', error);
        } finally {
          setIsLoadingBookings(false);
        }
      }
      await loadBookings();
      
      // Call onSave if provided
      if (onSave) {
        onSave(selectedStartDate.getTime());
      }
      
    } catch (error: any) {
      console.error('❌ Error creating booking:', error);
      setBookingError(`Error creating booking: ${error.message || error}`);
    } finally {
      setIsCreatingBooking(false);
    }
  };

  if (isLoadingBookings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading available slots...</p>
        </div>
      </div>
    );
  }

  if (bookingError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">{bookingError}</div>
          <button
            onClick={() => {
              setBookingError(null);
              // Retry logic here
            }}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Header */}
      <div className="neu-card rounded-b-3xl shadow-2xl">
        <div className="flex items-center justify-between p-6">
          <button
            onClick={onBack}
            title="Go back"
            className="neu-button-secondary p-3 rounded-2xl transition-all duration-200"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Book Service Period</h1>
          <div className="w-12" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8 max-w-lg mx-auto">
        {/* Service Info */}
        {service && (
          <div className="neu-card rounded-3xl p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2">{service.name}</h2>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Price:</span>
              <span className="text-2xl font-bold text-purple-600">
                ${service.basePrice} {service.currency || 'USD'}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-600">Duration:</span>
              <span className="text-gray-800">{service.estimatedDuration} minutes</span>
            </div>
          </div>
        )}
        
        {/* Calendar Header */}
        <CalendarHeader
          currentMonth={currentMonth}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
        />
        
        {/* Days of Week Header */}
        <DaysOfWeekHeader />
        
        {/* Calendar Grid */}
        <CustomCalendarGrid
          days={calendarDays}
          onDateClick={handleDateClick}
        />
        
        {/* Selection Status */}
        <SelectionStatusCard
          startDate={selectedStartDate}
          endDate={selectedEndDate}
          isValid={isDateSelectionValid}
        />
        
        {/* Time Slots Section (show when single day is selected) */}
        {isSingleDayBooking && selectedStartDate && (
          <TimeSlotsSection
            selectedDate={selectedStartDate}
            availableTimeSlots={availableTimeSlots}
            selectedTimeSlot={selectedTimeSlot}
            onTimeSlotSelected={handleTimeSlotSelected}
          />
        )}
        
        {/* Legend */}
        <LegendCard />
        
        {/* Book Button */}
        <BookingButton
          isEnabled={isCompleteBookingValid}
          startDate={selectedStartDate}
          endDate={selectedEndDate}
          selectedTimeSlot={selectedTimeSlot}
          onBook={() => setShowConfirmationDialog(true)}
        />
      </div>
      
      {/* Confirmation Dialog */}
      {showConfirmationDialog && selectedStartDate && (
        <BookingConfirmationDialog
          startDate={selectedStartDate}
          endDate={selectedEndDate || selectedStartDate}
          selectedTimeSlot={selectedTimeSlot}
          serviceName={serviceName}
          shopName={shopName}
          isCreating={isCreatingBooking}
          onConfirm={handleCreateBooking}
          onDismiss={() => {
            setShowConfirmationDialog(false);
            setBookingError(null);
          }}
        />
      )}
    </div>
  );
}