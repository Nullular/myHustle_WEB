// Exact replica of Android's time slot generation logic from NewBookingScreen.kt lines 327-350

import { TimeSlot, Booking } from '@/types/booking';
import { Shop, Service } from '@/types/models';

export function generateTimeSlots(
  selectedDate: Date,
  confirmedBookings: Booking[],
  shop: Shop | null,
  service: Service | null
): TimeSlot[] {
  if (!selectedDate) return [];

  const dateString = selectedDate.toISOString().split('T')[0]; // "yyyy-MM-dd" format
  
  // Get booked times for this specific date
  const bookedTimes = confirmedBookings
    .filter(booking => booking.requestedDate === dateString)
    .map(booking => booking.requestedTime)
    .filter(Boolean);
  
  const bookedTimesSet = new Set(bookedTimes);

  // Determine window from shop; fallback to 09:00-18:00 (exact Android logic)
  const open = shop?.openTime24 || "09:00";
  const close = shop?.closeTime24 || "18:00";
  
  const [openH, openM] = open.split(":").map((val: string) => parseInt(val) || 0);
  const [closeH, closeM] = close.split(":").map((val: string) => parseInt(val) || 0);
  
  const openMin = openH * 60 + openM;
  const closeMin = closeH === 24 && closeM === 0 ? 24 * 60 : closeH * 60 + closeM;

  // Slot length should follow the service duration first, then fallback
  // to any explicit availability timeSlotDuration, then 60.
  // This avoids defaulting to 60 when availability carries defaults.
  const durationMin = Math.max(
    service?.estimatedDuration ||
    service?.availability?.timeSlotDuration ||
    60,
    5
  );

  const slots: TimeSlot[] = [];
  let t = openMin;
  
  while (t + durationMin <= closeMin) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    const timeStr24 = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    const displayTime = format24HourTo12Hour(timeStr24);
    const isAvailable = !bookedTimesSet.has(timeStr24);
    
    slots.push({
      time: displayTime,
      time24: timeStr24,
      isAvailable
    });
    
    t += durationMin;
  }

  return slots;
}

// Helper function to format 24-hour time to 12-hour (matches Android helper)
export function format24HourTo12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Check if date has confirmed bookings (exact Android logic)
export function isDateBlocked(date: Date, confirmedBookings: Booking[]): boolean {
  const dateString = date.toISOString().split('T')[0];
  const isPastDate = date < new Date(new Date().toDateString()); // Today is allowed
  
  const hasConfirmedBooking = confirmedBookings.some(booking => 
    booking.requestedDate === dateString && booking.status === 'ACCEPTED'
  );
  
  return isPastDate || hasConfirmedBooking;
}

// Check if a date range is blocked by existing bookings
export function isRangeBlockedByBookings(
  startDate: Date, 
  endDate: Date, 
  confirmedBookings: Booking[]
): boolean {
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    if (isDateBlocked(current, confirmedBookings)) {
      return true;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return false;
}