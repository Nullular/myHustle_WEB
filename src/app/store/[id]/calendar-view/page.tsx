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
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

import { NeuButton, NeuCard } from '@/components/ui';
import { CalendarHeader, DaysOfWeekHeader, CustomCalendarGrid, TimeSlotChip } from '@/components/BookingCalendar';
import { useAuthStore } from '@/lib/store/auth';
import { bookingRepository } from '@/lib/firebase/repositories';
import { messagingRepository } from '@/lib/firebase/repositories/messagingRepository';
import { Booking, BookingStatus } from '@/types';
import { TimeSlot } from '@/types/booking';

// Owner calendar view using customer calendar styling

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
  // no calendarData grid; we reuse customer calendar component for days UI

  // Calendar selection styling (reuse customer style with CustomCalendarGrid)
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(new Date());

  // Accept/Deny dialog state (reuse booking-requests UX)
  const [selectedRequest, setSelectedRequest] = useState<Booking | null>(null);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'deny'>('accept');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Load bookings for the calendar (following Android pattern exactly)
  useEffect(() => {
    if (!user) {
      setError('Please log in to view calendar');
      setIsLoading(false);
      return;
    }

    const loadCalendarBookings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('🔍 Loading calendar bookings for shop:', storeId);
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

  // Customer-style calendar day generation for consistent UI
  type CalendarDay = import('@/types/booking').CalendarDay;
  const generateCalendarDays = (year: number, month: number): CalendarDay[] => {
    const today = new Date();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    const days: CalendarDay[] = [];

    // Prev month trailing
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
        isInRange: false,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate()) && !isToday;
      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        isSelectable: !isPast,
        isBlocked: false,
        isStartOfRange: false,
        isEndOfRange: false,
        isInRange: false,
      });
    }

    // Next month leading to fill grid
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
        isInRange: false,
      });
    }
    return days;
  };

  const updateDaysWithSelection = (days: CalendarDay[], selected: Date | null): CalendarDay[] => {
    return days.map(d => ({
      ...d,
      isStartOfRange: !!(selected && d.date.toDateString() === selected.toDateString()),
      isEndOfRange: !!(selected && d.date.toDateString() === selected.toDateString()),
      isInRange: false,
    }));
  };

  const ownerCalendarDays: CalendarDay[] = React.useMemo(() => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    const base = generateCalendarDays(y, m);
    return updateDaysWithSelection(base, selectedStartDate);
  }, [currentMonth, selectedStartDate]);

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
    setSelectedStartDate(date);
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

  // Per-day dot indicators: accepted/pending/denied presence
  const getIndicatorsForDate = (date: Date) => {
    const bookings = getBookingsForDate(date);
    if (!bookings.length) return null;
    const hasAccepted = bookings.some(b => b.status === BookingStatus.ACCEPTED);
    const hasPending = bookings.some(b => b.status === BookingStatus.PENDING);
    const hasDenied = bookings.some(b => b.status === BookingStatus.DENIED || (b as any).status === 'DENIED');
    return {
      accepted: hasAccepted ? 1 : 0,
      pending: hasPending ? 1 : 0,
      denied: hasDenied ? 1 : 0,
    };
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

  // Accept/Deny actions (same UX as booking-requests)
  const handleAcceptRequest = (request: Booking) => {
    setSelectedRequest(request);
    setActionType('accept');
    const defaultMessage = `✅ Your booking for "${request.serviceName}" at ${request.shopName} on ${request.requestedDate} at ${request.requestedTime} has been ACCEPTED. Looking forward to seeing you!`;
    setCustomMessage(defaultMessage);
    setShowResponseDialog(true);
  };

  const handleDenyRequest = (request: Booking) => {
    setSelectedRequest(request);
    setActionType('deny');
    const defaultMessage = `❌ Your booking for "${request.serviceName}" at ${request.shopName} on ${request.requestedDate} at ${request.requestedTime} has been DECLINED. Sorry for any inconvenience.`;
    setCustomMessage(defaultMessage);
    setShowResponseDialog(true);
  };

  const createBookingConversation = async (booking: Booking, isAccepted: boolean, messageContent: string) => {
    try {
      const shopOwner = user;
      if (!shopOwner) throw new Error('Shop owner not authenticated');
      const participants = [booking.customerId, booking.shopOwnerId];
      const participantNames: Record<string, string> = {
        [booking.customerId]: booking.customerName,
        [booking.shopOwnerId]: shopOwner.displayName || shopOwner.email || 'Shop Owner',
      };
      const participantEmails: Record<string, string> = {
        [booking.customerId]: booking.customerEmail,
        [booking.shopOwnerId]: shopOwner.email || '',
      };
      await messagingRepository.createConversation({
        participants,
        participantNames,
        participantEmails,
        initialMessage: messageContent,
        businessContext: { shopId: booking.shopId, shopName: booking.shopName },
      });
    } catch (e) {
      console.error('❌ Failed to create booking conversation:', e);
    }
  };

  const confirmResponse = async () => {
    if (!selectedRequest) return;
    try {
      setIsUpdating(true);
      const newStatus = actionType === 'accept' ? BookingStatus.ACCEPTED : BookingStatus.DENIED;
      if (!selectedRequest.id) throw new Error('No booking ID found');
      await bookingRepository.updateBookingStatus(selectedRequest.id, newStatus);
      await createBookingConversation(selectedRequest, actionType === 'accept', customMessage);
      // Update local state
      setAllBookings(prev => prev.map(b => b.id === selectedRequest.id ? { ...b, status: newStatus } : b));
      setActionSuccessMessage(`Booking ${actionType === 'accept' ? 'accepted' : 'denied'} successfully!`);
      setTimeout(() => setActionSuccessMessage(null), 3000);
    } catch (err) {
      console.error(`❌ Failed to ${actionType} booking:`, err);
      setActionError(`Failed to ${actionType} booking. Please try again.`);
      setTimeout(() => setActionError(null), 5000);
    } finally {
      setIsUpdating(false);
      setShowResponseDialog(false);
      setSelectedRequest(null);
    }
  };

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
          {/* Calendar Grid - unified style with customer calendar */}
          <div className="lg:col-span-2">
            <NeuCard className="p-6">
              <CalendarHeader
                currentMonth={currentMonth}
                onPreviousMonth={handlePreviousMonth}
                onNextMonth={handleNextMonth}
              />

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
                  <DaysOfWeekHeader />
                  <CustomCalendarGrid
                    days={ownerCalendarDays}
                    onDateClick={handleDateClick}
                    getIndicators={getIndicatorsForDate}
                    sizeVariant="compact"
                  />
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
                      const timeSlot = {
                        time: formatTime12Hour(booking.requestedTime),
                        time24: booking.requestedTime,
                        isAvailable: booking.status !== BookingStatus.CANCELLED,
                        price: undefined
                      } as TimeSlot;
                      return (
                        <div key={booking.id} className="mb-4">
                          <TimeSlotChip
                            timeSlot={timeSlot}
                            isSelected={booking.status === BookingStatus.ACCEPTED}
                            onSelected={() => {}}
                          />
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

                            <div className="text-sm text-gray-600 mb-3">
                              {booking.customerEmail}
                            </div>

                            {booking.status === BookingStatus.PENDING && (
                              <div className="flex items-center space-x-3 mt-2">
                                <NeuButton
                                  variant="default"
                                  onClick={() => handleAcceptRequest(booking)}
                                  className="px-6 py-2 text-sm bg-green-500 text-white hover:bg-green-600"
                                >
                                  <CheckCircle size={16} className="mr-2" />
                                  Accept
                                </NeuButton>
                                <NeuButton
                                  variant="default"
                                  onClick={() => handleDenyRequest(booking)}
                                  className="px-6 py-2 text-sm bg-red-500 text-white hover:bg-red-600"
                                >
                                  <XCircle size={16} className="mr-2" />
                                  Deny
                                </NeuButton>
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
      {/* Success and error toasts */}
      {actionSuccessMessage && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <NeuCard className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-600" size={20} />
              <p className="text-green-800 font-medium">{actionSuccessMessage}</p>
            </div>
          </NeuCard>
        </div>
      )}
      {actionError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <NeuCard className="p-4 bg-red-50 border-red-200">
            <div className="flex items-center space-x-2">
              <AlertCircle className="text-red-600" size={20} />
              <p className="text-red-800 font-medium">{actionError}</p>
            </div>
          </NeuCard>
        </div>
      )}

      {/* Response Dialog */}
      {showResponseDialog && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <NeuCard className="max-w-lg w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {actionType === 'accept' ? 'Accept' : 'Deny'} Booking Request
            </h3>
            <p className="text-gray-600 mb-4">
              {actionType === 'accept' ? 'Accept' : 'Deny'} {selectedRequest.customerName}'s booking for {selectedRequest.requestedDate} at {formatTime12Hour(selectedRequest.requestedTime)}
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Message to Customer:</label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Enter your message to the customer..."
                disabled={isUpdating}
              />
              <p className="text-xs text-gray-500 mt-1">This message will be sent in a new conversation with the customer.</p>
            </div>
            <div className="flex items-center justify-end space-x-3">
              <NeuButton variant="default" onClick={() => setShowResponseDialog(false)} disabled={isUpdating}>
                Cancel
              </NeuButton>
              <NeuButton onClick={confirmResponse} disabled={isUpdating} className={actionType === 'accept' ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'}>
                {actionType === 'accept' ? 'Confirm Accept' : 'Confirm Deny'}
              </NeuButton>
            </div>
          </NeuCard>
        </div>
      )}
    </div>
  );
}
