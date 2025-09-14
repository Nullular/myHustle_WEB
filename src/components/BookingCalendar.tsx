'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, X, Loader2 } from 'lucide-react';
import { CalendarDay, TimeSlot } from '@/types/booking';

// Optional per-day booking indicators used by owner calendar
type DayIndicators = {
  accepted?: number;
  pending?: number;
  denied?: number;
};

// Calendar Header Component
interface CalendarHeaderProps {
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export function CalendarHeader({ currentMonth, onPreviousMonth, onNextMonth }: CalendarHeaderProps) {
  const monthYear = currentMonth.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="neu-card rounded-3xl p-6 mb-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onPreviousMonth}
          title="Previous month"
          className="neu-button-secondary p-4 rounded-full transition-all duration-200"
        >
          <ChevronLeft className="w-6 h-6 text-blue-500" />
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800 font-sans">{monthYear}</h2>
        
        <button
          onClick={onNextMonth}
          title="Next month"
          className="neu-button-secondary p-4 rounded-full transition-all duration-200"
        >
          <ChevronRight className="w-6 h-6 text-blue-500" />
        </button>
      </div>
    </div>
  );
}

// Days of Week Header Component
export function DaysOfWeekHeader() {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="grid grid-cols-7 gap-2 mb-2">
      {daysOfWeek.map((day) => (
        <div
          key={day}
          className="text-center py-2 text-sm font-medium text-gray-600"
        >
          {day}
        </div>
      ))}
    </div>
  );
}

// Calendar Day Cell Component
interface CalendarDayCellProps {
  day: CalendarDay;
  onDateClick: () => void;
  indicators?: DayIndicators;
  sizeVariant?: 'default' | 'compact';
}

export function CalendarDayCell({ day, onDateClick, indicators, sizeVariant = 'default' }: CalendarDayCellProps) {
  // New: unified selection styling helper (two states: selected vs unselected)
  const getSelectedVsUnselectedStyle = () => {
    const isSelected = day.isStartOfRange || day.isEndOfRange || day.isInRange;
    if (isSelected) {
      // Middle of a selected range vs endpoints
      return day.isInRange && !(day.isStartOfRange || day.isEndOfRange)
        ? 'neu-pressed bg-blue-200 text-blue-700'
        : 'neu-pressed bg-blue-500 text-white';
    }
    // Unselected states
    if (!day.isCurrentMonth || !day.isSelectable) return 'bg-transparent text-gray-300';
    if (day.isToday && day.isCurrentMonth) return 'neu-button bg-blue-300 text-white border-2 border-blue-400';
    return 'neu-button hover:neu-pressed bg-white text-gray-800';
  };

  const getButtonStyle = () => {
    if (day.isBlocked) return 'bg-transparent text-gray-400 opacity-50'; // Blocked days
    return getSelectedVsUnselectedStyle();
  };

  const sizeClass = sizeVariant === 'compact'
    ? 'w-8 h-8 md:w-12 md:h-12'
    : 'w-11 h-11 md:w-12 md:h-12';

  // Make unselected a bit narrower on mobile for compact variant only
  const isSelected = day.isStartOfRange || day.isEndOfRange || day.isInRange;
  const widthOverrideMobile = sizeVariant === 'compact'
    ? (isSelected ? 'w-8' : 'w-7') // keep height the same; md sizes unchanged
    : '';
  const paddingOverrideMobile = sizeVariant === 'compact'
    ? (isSelected ? '' : '!px-0 !py-0 !text-[13px]') // force-remove padding and keep smaller text for unselected
    : '';

  return (
    <motion.button
      onClick={onDateClick}
      disabled={!day.isSelectable}
      whileHover={day.isSelectable ? { scale: 1.05 } : {}}
      whileTap={day.isSelectable ? { scale: 0.95 } : {}}
      className={`
        ${sizeClass} ${widthOverrideMobile} ${paddingOverrideMobile} box-border rounded-2xl flex items-center justify-center text-[13px] md:text-sm font-medium
        transition-all duration-200 relative
        ${getButtonStyle()}
        ${day.isSelectable ? 'cursor-pointer' : 'cursor-not-allowed'}
      `}
    >
      {day.date.getDate()}
      {/* Status indicator dots (accepted, pending, denied) */}
      {indicators && (
        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-1">
          {!!indicators.accepted && <span className="w-1.5 h-1.5 rounded-full bg-green-500 ring-1 ring-white/80" />}
          {!!indicators.pending && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 ring-1 ring-white/80" />}
          {!!indicators.denied && <span className="w-1.5 h-1.5 rounded-full bg-red-500 ring-1 ring-white/80" />}
        </div>
      )}
    </motion.button>
  );
}

// Custom Calendar Grid Component
interface CustomCalendarGridProps {
  days: CalendarDay[];
  onDateClick: (date: Date) => void;
  getIndicators?: (date: Date) => DayIndicators | null | undefined;
  sizeVariant?: 'default' | 'compact';
}

export function CustomCalendarGrid({ days, onDateClick, getIndicators, sizeVariant = 'default' }: CustomCalendarGridProps) {
  return (
    <div className="neu-card rounded-3xl p-6 mb-6">
      <div className="grid grid-cols-7 gap-3">
        {days.map((day, index) => (
          <CalendarDayCell
            key={index}
            day={day}
            onDateClick={() => day.isSelectable && onDateClick(day.date)}
            indicators={getIndicators?.(day.date) || undefined}
            sizeVariant={sizeVariant}
          />
        ))}
      </div>
    </div>
  );
}

// Selection Status Card Component
interface SelectionStatusCardProps {
  startDate: Date | null;
  endDate: Date | null;
  isValid: boolean;
}

export function SelectionStatusCard({ startDate, endDate, isValid }: SelectionStatusCardProps) {
  const getStatusColor = () => {
    if (isValid) return 'bg-green-50 border-green-200';
    if (startDate && endDate && !isValid) return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getIconColor = () => {
    if (isValid) return 'text-green-500';
    if (startDate && endDate && !isValid) return 'text-red-500';
    return 'text-gray-400';
  };

  const getStatusText = () => {
    if (!startDate) return 'Select your start date';
    if (!endDate) return 'Select your time slot';
    if (isValid) return 'Valid selection';
    return 'Selection overlaps with blocked period';
  };

  const getDateRangeText = () => {
    if (!startDate || !endDate) return '';
    const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  return (
    <div className={`rounded-2xl border-2 p-4 mb-4 ${getStatusColor()}`}>
      <div className="flex items-center">
        <div className={`mr-3 ${getIconColor()}`}>
          {isValid ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </div>
        
        <div className="flex-1">
          <p className={`font-medium ${getIconColor()}`}>
            {getStatusText()}
          </p>
          {startDate && endDate && (
            <p className="text-sm text-gray-600 mt-1">
              {getDateRangeText()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Legend Card Component
export function LegendCard() {
  const legendItems = [
    { color: 'bg-blue-500', label: 'Selected' },
    { color: 'bg-red-400', label: 'Blocked' },
    { color: 'bg-blue-300', label: 'Today' }
  ];

  return (
    <div className="bg-gray-800 rounded-2xl p-4 mb-4">
      <h3 className="text-white font-bold mb-3">Legend</h3>
      <div className="flex justify-between">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${item.color} mr-2`} />
            <span className="text-white text-sm">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Time Slots Section Component
interface TimeSlotsSectionProps {
  selectedDate: Date;
  availableTimeSlots: TimeSlot[];
  selectedTimeSlot: TimeSlot | null;
  onTimeSlotSelected: (timeSlot: TimeSlot) => void;
}

export function TimeSlotsSection({ 
  selectedDate, 
  availableTimeSlots, 
  selectedTimeSlot, 
  onTimeSlotSelected 
}: TimeSlotsSectionProps) {
  const formattedDate = selectedDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <div className="neu-card rounded-3xl p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Available Time Slots</h3>
        <span className="text-gray-600 text-base font-medium">{formattedDate}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {availableTimeSlots.map((timeSlot, index) => (
          <TimeSlotChip
            key={index}
            timeSlot={timeSlot}
            isSelected={selectedTimeSlot === timeSlot}
            onSelected={() => onTimeSlotSelected(timeSlot)}
          />
        ))}
      </div>
    </div>
  );
}

// Time Slot Chip Component
interface TimeSlotChipProps {
  timeSlot: TimeSlot;
  isSelected: boolean;
  onSelected: () => void;
}

export function TimeSlotChip({ timeSlot, isSelected, onSelected }: TimeSlotChipProps) {
  const getChipStyle = () => {
    if (isSelected) return 'neu-pressed bg-blue-500 text-white';
    if (!timeSlot.isAvailable) return 'neu-pressed bg-red-50 text-red-500';
    return 'neu-button hover:neu-pressed bg-gray-50 text-gray-800';
  };

  return (
    <motion.button
      onClick={onSelected}
      disabled={!timeSlot.isAvailable}
      whileHover={timeSlot.isAvailable ? { scale: 1.02 } : {}}
      whileTap={timeSlot.isAvailable ? { scale: 0.98 } : {}}
      className={`
        h-18 rounded-2xl flex flex-col items-center justify-center
        transition-all duration-200 font-medium
        ${getChipStyle()}
        ${timeSlot.isAvailable ? 'cursor-pointer' : 'cursor-not-allowed'}
      `}
    >
      <div className="text-base font-semibold">{timeSlot.time}</div>
      {timeSlot.price && (
        <div className="text-sm opacity-80 mt-1">{timeSlot.price}</div>
      )}
      {!timeSlot.isAvailable && (
        <div className="text-xs font-bold mt-1">Booked</div>
      )}
    </motion.button>
  );
}

// Booking Button Component
interface BookingButtonProps {
  isEnabled: boolean;
  startDate: Date | null;
  endDate: Date | null;
  selectedTimeSlot: TimeSlot | null;
  onBook: () => void;
}

export function BookingButton({ 
  isEnabled, 
  startDate, 
  endDate, 
  selectedTimeSlot, 
  onBook 
}: BookingButtonProps) {
  const getButtonText = () => {
    if (!startDate) return 'Select Date';
    if (!endDate) return 'Book Single Day or Select Time Slot';
    if (!isEnabled) return 'Selection Not Available';
    const isSingleDay = startDate.toDateString() === endDate.toDateString();
    return `Book Selected ${isSingleDay ? 'Appointment' : 'Period'}`;
  };

  return (
    <motion.button
      onClick={onBook}
      disabled={!isEnabled}
      whileHover={isEnabled ? { scale: 1.02 } : {}}
      whileTap={isEnabled ? { scale: 0.98 } : {}}
      className={`
        w-full h-14 rounded-2xl font-medium text-lg
        transition-all duration-300
        ${isEnabled 
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl' 
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }
      `}
    >
      {getButtonText()}
    </motion.button>
  );
}

// Booking Confirmation Dialog Component
interface BookingConfirmationDialogProps {
  startDate: Date;
  endDate: Date;
  selectedTimeSlot: TimeSlot | null;
  serviceName: string;
  shopName: string;
  isCreating: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

export function BookingConfirmationDialog({
  startDate,
  endDate,
  selectedTimeSlot,
  serviceName,
  shopName,
  isCreating,
  onConfirm,
  onDismiss
}: BookingConfirmationDialogProps) {
  const isSingleDay = startDate.toDateString() === endDate.toDateString();
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getDaysDifference = () => {
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirm Booking</h2>
          
          {/* Service and Shop Info */}
          {serviceName && (
            <div className="mb-2">
              <span className="text-sm text-gray-600">Service: </span>
              <span className="font-medium text-gray-800">{serviceName}</span>
            </div>
          )}
          {shopName && (
            <div className="mb-4">
              <span className="text-sm text-gray-600">Shop: </span>
              <span className="font-medium text-gray-800">{shopName}</span>
            </div>
          )}
          
          <p className="text-gray-700 mb-4">
            {isSingleDay 
              ? 'Please confirm your appointment:' 
              : 'Please confirm your booking period:'
            }
          </p>
          
          {/* Booking Details */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
            {isSingleDay ? (
              <>
                <div>
                  <span className="text-sm text-gray-600">Date: </span>
                  <span className="font-medium text-gray-800">{formatDate(startDate)}</span>
                </div>
                {selectedTimeSlot && (
                  <>
                    <div>
                      <span className="text-sm text-gray-600">Time: </span>
                      <span className="font-medium text-gray-800">{selectedTimeSlot.time}</span>
                    </div>
                    {selectedTimeSlot.price && (
                      <div>
                        <span className="text-sm text-gray-600">Price: </span>
                        <span className="font-medium text-blue-600">{selectedTimeSlot.price}</span>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                <div>
                  <span className="text-sm text-gray-600">From: </span>
                  <span className="font-medium text-gray-800">{formatDate(startDate)}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">To: </span>
                  <span className="font-medium text-gray-800">{formatDate(endDate)}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Duration: </span>
                  <span className="font-medium text-gray-800">
                    {getDaysDifference()} day{getDaysDifference() > 1 ? 's' : ''}
                  </span>
                </div>
              </>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onDismiss}
              className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isCreating}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                isSingleDay ? 'Confirm Appointment' : 'Confirm Booking'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}