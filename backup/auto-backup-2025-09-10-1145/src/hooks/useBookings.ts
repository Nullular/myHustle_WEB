import { useState, useEffect } from 'react';
import { bookingRepository } from '@/lib/firebase/repositories/bookingRepository';
import { Booking, BookingAnalytics } from '@/types';

/**
 * Hook to get bookings for a specific shop
 */
export function useShopBookings(shopId: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shopId) {
      setLoading(false);
      return;
    }

    const loadBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const shopBookings = await bookingRepository.getBookingsForShop(shopId);
        setBookings(shopBookings);
      } catch (err) {
        console.error('Error loading shop bookings:', err);
        setError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    loadBookings();

    // Set up real-time listener
    const unsubscribe = bookingRepository.onShopBookingsChange(shopId, (updatedBookings) => {
      setBookings(updatedBookings);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [shopId]);

  return { bookings, loading, error };
}

/**
 * Hook to get booking analytics for a specific shop
 */
export function useShopBookingAnalytics(shopId: string) {
  const [analytics, setAnalytics] = useState<BookingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shopId) {
      setLoading(false);
      return;
    }

    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const shopAnalytics = await bookingRepository.getBookingAnalyticsForShop(shopId);
        setAnalytics(shopAnalytics);
      } catch (err) {
        console.error('Error loading booking analytics:', err);
        setError('Failed to load booking analytics');
        // Set default values on error
        setAnalytics({
          totalBookings: 0,
          pendingBookings: 0,
          confirmedBookings: 0,
          completedBookings: 0,
          cancelledBookings: 0,
          todayBookings: 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [shopId]);

  return { analytics, loading, error };
}

/**
 * Hook to get today's accepted bookings for a shop (sorted by time)
 */
export function useTodaysBookings(shopId: string) {
  const [todaysBookings, setTodaysBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shopId) {
      setLoading(false);
      return;
    }

    const loadTodaysBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const bookings = await bookingRepository.getTodaysAcceptedBookings(shopId);
        setTodaysBookings(bookings);
      } catch (err) {
        console.error('Error loading today\'s bookings:', err);
        setError('Failed to load today\'s bookings');
      } finally {
        setLoading(false);
      }
    };

    loadTodaysBookings();

    // Set up real-time listener for all bookings and filter on client side
    const unsubscribe = bookingRepository.onShopBookingsChange(shopId, async () => {
      // Reload today's bookings when any booking changes
      const bookings = await bookingRepository.getTodaysAcceptedBookings(shopId);
      setTodaysBookings(bookings);
    });

    return () => unsubscribe();
  }, [shopId]);

  return { todaysBookings, loading, error };
}

/**
 * Hook to get weekly booking data for a shop
 */
export function useWeeklyBookingData(shopId: string) {
  const [weeklyData, setWeeklyData] = useState<Record<string, number>>({
    Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shopId) {
      setLoading(false);
      return;
    }

    const loadWeeklyData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await bookingRepository.getWeeklyBookingData(shopId);
        setWeeklyData(data);
      } catch (err) {
        console.error('Error loading weekly booking data:', err);
        setError('Failed to load weekly data');
      } finally {
        setLoading(false);
      }
    };

    loadWeeklyData();

    // Set up real-time listener for all bookings and recalculate weekly data
    const unsubscribe = bookingRepository.onShopBookingsChange(shopId, async () => {
      // Reload weekly data when any booking changes
      const data = await bookingRepository.getWeeklyBookingData(shopId);
      setWeeklyData(data);
    });

    return () => unsubscribe();
  }, [shopId]);

  return { weeklyData, loading, error };
}

/**
 * Hook to get bookings for shop owner (all their shops)
 */
export function useShopOwnerBookings(shopOwnerId: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shopOwnerId) {
      setLoading(false);
      return;
    }

    const loadBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const ownerBookings = await bookingRepository.getBookingsForShopOwner(shopOwnerId);
        setBookings(ownerBookings);
      } catch (err) {
        console.error('Error loading shop owner bookings:', err);
        setError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [shopOwnerId]);

  return { bookings, loading, error };
}

/**
 * Hook to get booking analytics for shop owner (all their shops)
 */
export function useShopOwnerBookingAnalytics(shopOwnerId: string) {
  const [analytics, setAnalytics] = useState<BookingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shopOwnerId) {
      setLoading(false);
      return;
    }

    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const ownerAnalytics = await bookingRepository.getBookingAnalytics(shopOwnerId);
        setAnalytics(ownerAnalytics);
      } catch (err) {
        console.error('Error loading shop owner booking analytics:', err);
        setError('Failed to load booking analytics');
        // Set default values on error
        setAnalytics({
          totalBookings: 0,
          pendingBookings: 0,
          confirmedBookings: 0,
          completedBookings: 0,
          cancelledBookings: 0,
          todayBookings: 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [shopOwnerId]);

  return { analytics, loading, error };
}
