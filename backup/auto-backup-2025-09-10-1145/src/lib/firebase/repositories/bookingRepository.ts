import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  getDocs, 
  addDoc, 
  updateDoc,
  doc,
  deleteDoc,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config';
import { Booking, BookingStatus, BookingAnalytics } from '@/types';

export class BookingRepository {
  private static instance: BookingRepository;

  public static getInstance(): BookingRepository {
    if (!BookingRepository.instance) {
      BookingRepository.instance = new BookingRepository();
    }
    return BookingRepository.instance;
  }

  private constructor() {}

  /**
   * Get bookings for a specific shop owner (all their shops)
   */
  async getBookingsForShopOwner(shopOwnerId: string): Promise<Booking[]> {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('shopOwnerId', '==', shopOwnerId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Booking));
    } catch (error) {
      console.error('Error fetching bookings for shop owner:', error);
      return [];
    }
  }

  /**
   * Get bookings for a specific shop
   */
  async getBookingsForShop(shopId: string): Promise<Booking[]> {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('shopId', '==', shopId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Booking));
    } catch (error) {
      console.error('Error fetching bookings for shop:', error);
      return [];
    }
  }

  /**
   * Get bookings for a specific customer
   */
  async getBookingsForCustomer(customerId: string): Promise<Booking[]> {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('customerId', '==', customerId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Booking));
    } catch (error) {
      console.error('Error fetching bookings for customer:', error);
      return [];
    }
  }

  /**
   * Create a new booking
   */
  async createBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'bookings'), {
        ...booking,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId: string, status: BookingStatus, responseMessage?: string): Promise<void> {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const updateData: any = {
        status,
        updatedAt: Date.now()
      };
      
      if (responseMessage) {
        updateData.responseMessage = responseMessage;
      }

      await updateDoc(bookingRef, updateData);
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  /**
   * Calculate booking analytics for shop owner
   */
  async getBookingAnalytics(shopOwnerId: string): Promise<BookingAnalytics> {
    try {
      const allBookings = await this.getBookingsForShopOwner(shopOwnerId);
      return this.calculateBookingAnalytics(allBookings);
    } catch (error) {
      console.error('Error getting booking analytics:', error);
      return {
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        todayBookings: 0
      };
    }
  }

  /**
   * Calculate booking analytics for specific shop
   */
  async getBookingAnalyticsForShop(shopId: string): Promise<BookingAnalytics> {
    try {
      const allBookings = await this.getBookingsForShop(shopId);
      return this.calculateBookingAnalytics(allBookings);
    } catch (error) {
      console.error('Error getting booking analytics for shop:', error);
      return {
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        todayBookings: 0
      };
    }
  }

  /**
   * Helper to calculate analytics from booking array
   */
  private calculateBookingAnalytics(bookings: Booking[]): BookingAnalytics {
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === BookingStatus.PENDING).length;
    const confirmedBookings = bookings.filter(b => b.status === BookingStatus.ACCEPTED).length;
    const completedBookings = bookings.filter(b => b.status === BookingStatus.COMPLETED).length;
    const cancelledBookings = bookings.filter(b => b.status === BookingStatus.CANCELLED).length;

    // Calculate today's bookings (created today)
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const todayBookings = bookings.filter(b => b.createdAt >= todayStart).length;

    return {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      todayBookings
    };
  }

  /**
   * Get today's accepted bookings for a shop (by requested date, not created date)
   */
  async getTodaysAcceptedBookings(shopId: string): Promise<Booking[]> {
    try {
      const allBookings = await this.getBookingsForShop(shopId);
      
      // Format today's date as YYYY-MM-DD string to match the requestedDate format
      const today = new Date();
      const todayString = today.getFullYear() + '-' + 
        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
        String(today.getDate()).padStart(2, '0');

      return allBookings
        .filter(booking => 
          booking.status === BookingStatus.ACCEPTED && 
          booking.requestedDate === todayString
        )
        .sort((a, b) => {
          // Sort by requested time
          try {
            const timeA = a.requestedTime.split(':');
            const timeB = b.requestedTime.split(':');
            const minutesA = parseInt(timeA[0]) * 60 + parseInt(timeA[1]);
            const minutesB = parseInt(timeB[0]) * 60 + parseInt(timeB[1]);
            return minutesA - minutesB;
          } catch {
            return 0;
          }
        });
    } catch (error) {
      console.error('Error getting today\'s accepted bookings:', error);
      return [];
    }
  }

  /**
   * Calculate weekly booking data (current week Monday to Sunday)
   */
  async getWeeklyBookingData(shopId: string): Promise<Record<string, number>> {
    try {
      const allBookings = await this.getBookingsForShop(shopId);
      return this.calculateWeeklyBookingData(allBookings);
    } catch (error) {
      console.error('Error getting weekly booking data:', error);
      return { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    }
  }

  /**
   * Helper to calculate weekly booking data from booking array
   */
  private calculateWeeklyBookingData(bookings: Booking[]): Record<string, number> {
    const weeklyData: Record<string, number> = {
      Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0
    };

    // Get start of this week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday = 0
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Generate dates for this week
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(monday);
      currentDay.setDate(monday.getDate() + i);
      
      const dateString = currentDay.getFullYear() + '-' + 
        String(currentDay.getMonth() + 1).padStart(2, '0') + '-' + 
        String(currentDay.getDate()).padStart(2, '0');

      // Count bookings for this date (accepted and pending)
      const bookingCount = bookings.filter(booking =>
        booking.requestedDate === dateString && 
        (booking.status === BookingStatus.ACCEPTED || booking.status === BookingStatus.PENDING)
      ).length;

      weeklyData[daysOfWeek[i]] = bookingCount;
    }

    return weeklyData;
  }

  /**
   * Real-time listener for shop bookings
   */
  onShopBookingsChange(shopId: string, callback: (bookings: Booking[]) => void): () => void {
    const q = query(
      collection(db, 'bookings'),
      where('shopId', '==', shopId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Booking));
      callback(bookings);
    });

    return unsubscribe;
  }
}

export const bookingRepository = BookingRepository.getInstance();
