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
import { Booking, BookingStatus } from '@/types/booking';
import { Service, Shop } from '@/types/models';
import { CalendarDay, TimeSlot, BookingScreenProps } from '@/types/booking';
import { bookingRepository } from '@/lib/bookingRepository';
import { generateTimeSlots, isDateBlocked, isRangeBlockedByBookings } from '@/utils/timeSlotGenerator';
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

// Generate calendar days with real booking data (matches Android CalendarViewScreen.kt)
const generateCalendarDaysWithBookings = (
  currentMonth: Date,
  selectedStartDate: Date | null,
  selectedEndDate: Date | null,
  confirmedBookings: Booking[]
): CalendarDay[] => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const today = new Date();
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
    const isBlocked = isDateBlocked(date, confirmedBookings);
    
    // Date selection logic
    const isStartOfRange = selectedStartDate && date.toDateString() === selectedStartDate.toDateString();
    const isEndOfRange = selectedEndDate && date.toDateString() === selectedEndDate.toDateString();
    const isInRange = selectedStartDate && selectedEndDate && 
      date > selectedStartDate && date < selectedEndDate && !isBlocked;
    
    days.push({
      date,
      isCurrentMonth: true,
      isToday,
      isSelectable: !isBlocked,
      isBlocked,
      isStartOfRange: !!isStartOfRange,
      isEndOfRange: !!isEndOfRange,
      isInRange: !!isInRange
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

export default function BookingScreen({
  shopId,
  serviceId,
  serviceName,
  shopName,
  shopOwnerId,
  service,
  onBack,
  onSave,
  onLoginClick
}: BookingScreenProps) {
  // State management (matches Android NewBookingScreen.kt)
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [confirmedBookings, setConfirmedBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  
  // Mock shop data - in real app, this would be loaded from Firebase
  const [shop] = useState<Shop>({
    id: shopId,
    name: shopName,
    openTime24: "09:00", // This should be loaded from Firebase
    closeTime24: "18:00", // This should be loaded from Firebase
    ownerId: shopOwnerId,
    description: '',
    category: '',
    location: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    imageUrl: '',
    coverImageUrl: '',
    logoUrl: '',
    bannerUrl: '',
    rating: 0,
    totalReviews: 0,
    isVerified: false,
    isPremium: false,
    active: true,
    availability: '',
    responseTime: '',
    operatingHours: {},
    socialMedia: {},
    tags: [],
    specialties: [],
    priceRange: '',
    deliveryOptions: [],
    paymentMethods: [],
    catalog: [],
    created_at: new Date(),
    updated_at: new Date(),
    isFavorite: false
  });

  // Load confirmed bookings on mount (matches Android lifecycle)
  useEffect(() => {
    async function loadBookings() {
      setIsLoadingBookings(true);
      setBookingError(null);
      
      try {
        const bookings = await bookingRepository.getConfirmedBookingsForShopService(shopId, serviceId);
        setConfirmedBookings(bookings);
        console.log(`Loaded ${bookings.length} confirmed bookings`);
      } catch (error: any) {
        console.error('Error loading bookings:', error);
        setBookingError(error.message || 'Failed to load booking availability');
      } finally {
        setIsLoadingBookings(false);
      }
    }

    loadBookings();
  }, [shopId, serviceId]);

  // Generate time slots with availability based on confirmed bookings (matches Android logic exactly)
  const availableTimeSlots = useMemo(() => {
    if (!selectedStartDate) return [];
    return generateTimeSlots(selectedStartDate, confirmedBookings, shop, service || null);
  }, [selectedStartDate, confirmedBookings, shop, service]);

  // Generate calendar days for current month with real booking data
  const calendarDays = useMemo(() => {
    return generateCalendarDaysWithBookings(currentMonth, selectedStartDate, selectedEndDate, confirmedBookings);
  }, [currentMonth, selectedStartDate, selectedEndDate, confirmedBookings]);

  // Check if selection is valid (not overlapping with blocked ranges)
  const isDateSelectionValid = useMemo(() => {
    if (!selectedStartDate) return false;
    if (!isDateBlocked(selectedStartDate, confirmedBookings)) {
      if (!selectedEndDate) return true;
      return !isRangeBlockedByBookings(selectedStartDate, selectedEndDate, confirmedBookings);
    }
    return false;
  }, [selectedStartDate, selectedEndDate, confirmedBookings]);

  // Determine if this is a single day booking
  const isSingleDayBooking = useMemo(() => {
    if (!selectedStartDate) return false;
    if (!selectedEndDate) return true;
    return selectedStartDate.toDateString() === selectedEndDate.toDateString();
  }, [selectedStartDate, selectedEndDate]);

  // Complete booking validation (matches Android logic)
  const isCompleteBookingValid = useMemo(() => {
    if (isSingleDayBooking) {
      // Single day booking - time slot required for better UX
      return isDateSelectionValid && selectedStartDate !== null && selectedTimeSlot !== null;
    } else {
      // Multi-day booking - time slot not needed
      return isDateSelectionValid && selectedEndDate !== null;
    }
  }, [isSingleDayBooking, isDateSelectionValid, selectedStartDate, selectedTimeSlot, selectedEndDate]);

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

  // Booking creation handler (matches Android createBooking logic)
  const handleCreateBooking = async () => {
    if (!selectedStartDate) return;
    
    setIsCreatingBooking(true);
    try {
      const bookingData = {
        customerId: 'current-user-id', // TODO: Get from auth context
        shopId,
        shopOwnerId,
        serviceId,
        serviceName,
        shopName,
        customerName: 'Current User', // TODO: Get from auth context
        customerEmail: 'user@example.com', // TODO: Get from auth context
        requestedDate: selectedStartDate.toISOString().split('T')[0], // "yyyy-MM-dd" format
        requestedTime: selectedTimeSlot?.time24 || "09:00", // Default if no time slot selected
        status: BookingStatus.PENDING,
        notes: '', // TODO: Add notes input field
        responseMessage: '',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const bookingId = await bookingRepository.createBooking(bookingData);
      console.log('Booking created with ID:', bookingId);
      
      onSave?.(0); // Pass placeholder for now
      setShowConfirmationDialog(false);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      setBookingError(error.message || 'Failed to create booking');
    } finally {
      setIsCreatingBooking(false);
    }
  };

  // Show loading state while loading bookings (matches Android)
  if (isLoadingBookings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading available slots...</h3>
          <p className="text-gray-600">Please wait while we check availability</p>
        </div>
      </div>
    );
  }

  // Show error state if booking loading failed (matches Android)
  if (bookingError && !isLoadingBookings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full text-center">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Bookings</h3>
          <p className="text-gray-600 mb-4">{bookingError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white px-4 py-4 border-b border-gray-200"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Back"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-gray-800">Book Service Period</h1>
            <p className="text-sm text-gray-600">{serviceName} at {shopName}</p>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </motion.div>

      {/* Calendar Section */}
      <div className="p-4 space-y-4">
        <CalendarHeader 
          currentMonth={currentMonth}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
        />
        
        <DaysOfWeekHeader />
        
        <CustomCalendarGrid 
          days={calendarDays}
          onDateClick={handleDateClick}
        />
        
        <SelectionStatusCard
          startDate={selectedStartDate}
          endDate={selectedEndDate}
          isValid={isDateSelectionValid}
        />
        
        <LegendCard />

        {/* Time Slots Section - only show for single day bookings */}
        {isSingleDayBooking && selectedStartDate && (
          <TimeSlotsSection
            selectedDate={selectedStartDate}
            availableTimeSlots={availableTimeSlots}
            selectedTimeSlot={selectedTimeSlot}
            onTimeSlotSelected={handleTimeSlotSelected}
          />
        )}

        {/* Booking Button */}
        <BookingButton
          isEnabled={isCompleteBookingValid}
          startDate={selectedStartDate}
          endDate={selectedEndDate}
          selectedTimeSlot={selectedTimeSlot}
          onBook={() => setShowConfirmationDialog(true)}
        />
      </div>

      {/* Confirmation Dialog */}
      {showConfirmationDialog && selectedStartDate && selectedEndDate && (
        <BookingConfirmationDialog
          startDate={selectedStartDate}
          endDate={selectedEndDate}
          selectedTimeSlot={selectedTimeSlot}
          serviceName={serviceName}
          shopName={shopName}
          isCreating={isCreatingBooking}
          onConfirm={handleCreateBooking}
          onDismiss={() => setShowConfirmationDialog(false)}
        />
      )}
    </div>
  );
}