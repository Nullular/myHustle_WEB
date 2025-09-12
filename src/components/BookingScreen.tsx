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
import { Booking, BookingStatus, Service } from '@/types';
import { CalendarDay, TimeSlot, BookingScreenProps } from '@/types/booking';
import { bookingRepository } from '@/lib/firebase/repositories/bookingRepository';
import { useAuthStateSync } from '@/hooks/useAuthStateSync';
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

// Sample time slots - in real app this would come from Firebase
const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 9; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const time12 = new Date(`2000-01-01T${time24}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      
      slots.push({
        time: time12,
        time24,
        isAvailable: Math.random() > 0.3, // Random availability for demo
        price: Math.random() > 0.5 ? `$${(50 + Math.random() * 100).toFixed(0)}` : undefined
      });
    }
  }
  return slots;
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
  const [availableTimeSlots] = useState<TimeSlot[]>(generateTimeSlots());

  // Computed values
  const calendarDays = useMemo(() => {
    const blockedDates = confirmedBookings
      .filter(booking => booking.status === BookingStatus.ACCEPTED)
      .map(booking => new Date(booking.requestedDate));
    
    const days = generateCalendarDays(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
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
    
    // Check if any day in the selected range is blocked
    const start = new Date(selectedStartDate);
    const end = new Date(selectedEndDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const isBlocked = confirmedBookings.some(booking => 
        booking.status === BookingStatus.ACCEPTED && 
        new Date(booking.requestedDate).toDateString() === d.toDateString()
      );
      if (isBlocked) return false;
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

  // Load bookings on mount
  useEffect(() => {
    const loadBookings = async () => {
      if (!shopId) return;
      
      setIsLoadingBookings(true);
      try {
        // TODO: Replace with actual Firebase call
        // const shopBookings = await bookingRepository.getBookingsForShop(shopId);
        // setConfirmedBookings(shopBookings.filter(booking => booking.status === BookingStatus.ACCEPTED));
        
        // Mock data for now
        setConfirmedBookings([]);
      } catch (error) {
        setBookingError(`Failed to load booking availability: ${error}`);
      } finally {
        setIsLoadingBookings(false);
      }
    };

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

  // Booking creation handler
  const handleCreateBooking = async () => {
    if (!selectedStartDate || !selectedEndDate) return;
    
    setIsCreatingBooking(true);
    try {
      const booking = {
        id: '', // Will be set by Firebase
        customerId: 'current-user-id', // TODO: Get from auth context
        shopId,
        serviceId,
        serviceName,
        shopName,
        shopOwnerId,
        customerName: 'Current User', // TODO: Get from auth context
        customerEmail: 'user@example.com', // TODO: Get from auth context
        requestedDate: selectedStartDate.toISOString().split('T')[0],
        requestedTime: selectedTimeSlot?.time24 || '09:00',
        status: BookingStatus.PENDING,
        notes: '',
        responseMessage: '',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      // TODO: Replace with actual Firebase call
      // const result = await bookingRepository.createBooking(booking);
      console.log('Creating booking:', booking);
      
      setShowConfirmationDialog(false);
      onSave(selectedStartDate.getTime());
    } catch (error) {
      setBookingError(`Error creating booking: ${error}`);
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