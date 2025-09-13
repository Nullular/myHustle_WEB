'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  User,
  MapPin,
  AlertCircle
} from 'lucide-react';

import { NeuButton, NeuCard } from '@/components/ui';
import { TimeSlotChip } from '@/components/BookingCalendar';
import { useAuthStore } from '@/lib/store/auth';
import { bookingRepository } from '@/lib/firebase/repositories';
import { Booking, BookingStatus } from '@/types';
import { TimeSlot } from '@/types/booking';

interface DayBookingInfo {
  date: Date;
  bookings: Booking[];
}

export default function CalendarViewPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const storeId = params.id as string;
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calendarData, setCalendarData] = useState<DayBookingInfo[]>([]);

  // Load bookings for the calendar (following Android pattern exactly)
  useEffect(() => {
    if (!user) {
      setError("Please log in to view calendar");
      setIsLoading(false);
      return;
    }

    const loadCalendarBookings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🔍 Loading calendar bookings for shop:', storeId);
        
        // Get all bookings for specific shop (matching Android pattern)
        const shopBookings = await bookingRepository.getBookingsForShop(storeId);
        
        console.log('📋 Found calendar bookings:', shopBookings.length);
        setAllBookings(shopBookings);
        
      } catch (err) {
        console.error('❌ Failed to load calendar bookings:', err);
        setError(`Failed to load bookings: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setAllBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCalendarBookings();
  }, [user, storeId]);

  // Generate calendar data for current month
  useEffect(() => {
    const generateCalendarData = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      
      // Get first day of month and number of days
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      
      // Get starting day of week (0 = Sunday)
      const startDayOfWeek = firstDay.getDay();
      
      const days: DayBookingInfo[] = [];
      
      // Add empty days for previous month
      for (let i = 0; i < startDayOfWeek; i++) {
        const date = new Date(year, month, -startDayOfWeek + i + 1);
        days.push({
          date,
          bookings: []
        });
      }
      
      // Add days of current month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Find bookings for this date
        const dayBookings = allBookings.filter(booking => booking.requestedDate === dateStr);
        
        days.push({
          date,
          bookings: dayBookings
        });
      }
      
      // Add remaining days to complete the grid (6 weeks = 42 days)
      const remainingDays = 42 - days.length;
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(year, month + 1, i);
        days.push({
          date,
          bookings: []
        });
      }
      
      setCalendarData(days);
    };

    generateCalendarData();
  }, [currentMonth, allBookings]);

  const handleBack = () => {
    router.back();
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const formatTime12Hour = (time24: string): string => {
    try {
      const [hours, minutes] = time24.split(':');
      const hour24 = parseInt(hours, 10);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return time24;
    }
  };

  const getBookingsForDate = (date: Date): Booking[] => {
    const dateStr = date.toISOString().split('T')[0];
    return allBookings.filter(booking => booking.requestedDate === dateStr);
  };

  const getStatusColor = (status: BookingStatus): string => {
    switch (status) {
      case BookingStatus.PENDING:
        return 'bg-orange-100 text-orange-800';
      case BookingStatus.ACCEPTED:
        return 'bg-green-100 text-green-800';
      case BookingStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800';
      case BookingStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const isSelectedDate = (date: Date): boolean => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const selectedDateBookings = getBookingsForDate(selectedDate);

  // Authentication guard
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <NeuCard className="p-8 text-center max-w-md mx-auto">
          <AlertCircle className="mx-auto mb-4 text-yellow-500" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            Please log in to view calendar.
          </p>
          <NeuButton onClick={handleBack}>
            Go Back
          </NeuButton>
        </NeuCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center space-x-4">
          <NeuButton
            variant="default"
            onClick={handleBack}
            className="p-2"
          >
            <ArrowLeft size={20} />
          </NeuButton>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">Calendar View</h1>
            <p className="text-gray-600 text-sm">
              View bookings by date
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <NeuCard className="p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h2>
                <div className="flex space-x-2">
                  <NeuButton
                    variant="default"
                    onClick={handlePreviousMonth}
                    className="p-2"
                  >
                    <ChevronLeft size={20} />
                  </NeuButton>
                  <NeuButton
                    variant="default"
                    onClick={handleNextMonth}
                    className="p-2"
                  >
                    <ChevronRight size={20} />
                  </NeuButton>
                </div>
              </div>

              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              )}

              {error && (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
                  <p className="text-red-600 mb-4">{error}</p>
                  <NeuButton onClick={() => window.location.reload()}>
                    Retry
                  </NeuButton>
                </div>
              )}

              {!isLoading && !error && (
                <>
                  {/* Day Names */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map((day) => (
                      <div key={day} className="text-center py-2 text-sm font-medium text-gray-600">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarData.map((dayInfo, index) => {
                      const { date, bookings } = dayInfo;
                      const isCurrentMonthDay = isCurrentMonth(date);
                      const isTodayDate = isToday(date);
                      const isSelected = isSelectedDate(date);
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleDateClick(date)}
                          className={`
                            relative p-2 text-sm border border-gray-100 hover:bg-gray-50 transition-all min-h-[60px] flex flex-col items-center justify-start
                            ${isSelected ? 'bg-blue-500 text-white' : ''}
                            ${isTodayDate && !isSelected ? 'bg-blue-100 text-blue-800 font-bold' : ''}
                            ${!isCurrentMonthDay ? 'text-gray-300' : 'text-gray-700'}
                          `}
                        >
                          <span className="mb-1">{date.getDate()}</span>
                          {bookings.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {bookings.slice(0, 2).map((booking, idx) => (
                                <div
                                  key={idx}
                                  className={`w-2 h-2 rounded-full ${
                                    booking.status === BookingStatus.PENDING ? 'bg-orange-500' :
                                    booking.status === BookingStatus.ACCEPTED ? 'bg-green-500' :
                                    booking.status === BookingStatus.COMPLETED ? 'bg-blue-500' :
                                    'bg-red-500'
                                  }`}
                                />
                              ))}
                              {bookings.length > 2 && (
                                <span className="text-xs">+{bookings.length - 2}</span>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </NeuCard>
          </div>

          {/* Selected Date Details */}
          <div className="lg:col-span-1">
            <NeuCard className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h3>

              {selectedDateBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-600">No bookings for this date</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    {selectedDateBookings.length} booking{selectedDateBookings.length !== 1 ? 's' : ''}
                  </p>

                  {selectedDateBookings
                    .sort((a, b) => a.requestedTime.localeCompare(b.requestedTime))
                    .map((booking) => {
                    // Convert booking to TimeSlot-like format for styling consistency
                    const timeSlot = {
                      time: formatTime12Hour(booking.requestedTime),
                      time24: booking.requestedTime,
                      isAvailable: booking.status !== BookingStatus.CANCELLED,
                      price: undefined
                    };
                    
                    return (
                      <div key={booking.id} className="mb-4">
                        {/* Beautiful neumorphic time slot chip */}
                        <TimeSlotChip
                          timeSlot={timeSlot}
                          isSelected={booking.status === BookingStatus.ACCEPTED}
                          onSelected={() => {}} // No action needed for display
                        />
                        
                        {/* Booking details card */}
                        <div className="neu-card rounded-2xl p-4 mt-3 bg-gray-50">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <User size={16} className="text-gray-500" />
                              <span className="font-medium text-gray-800">{booking.customerName}</span>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status.toUpperCase()}
                            </div>
                          </div>

                          {booking.serviceName && (
                            <div className="flex items-center space-x-2 mb-2">
                              <MapPin size={14} className="text-gray-500" />
                              <span className="text-sm text-gray-700 font-medium">{booking.serviceName}</span>
                            </div>
                          )}
                          
                          {booking.customerEmail && (
                            <div className="text-xs text-gray-600 bg-white/60 px-3 py-2 rounded-lg">
                              {booking.customerEmail}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </NeuCard>
          </div>
        </div>
      </div>
    </div>
  );
}
