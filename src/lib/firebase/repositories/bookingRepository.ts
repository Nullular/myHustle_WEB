import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  onSnapshot,
  doc,
  updateDoc,
  addDoc
} from 'firebase/firestore';
import { db } from '../config';
import { Booking, BookingStatus, BookingAnalytics } from '@/types';

class BookingRepository {
  private collectionName = 'bookings';
  private collectionRef = collection(db, this.collectionName);

  /**
   * Get bookings for a specific shop
   */
  async getBookingsForShop(shopId: string): Promise<Booking[]> {
    try {
      console.log('🔍 Fetching bookings for shop:', shopId);
      console.log('🔍 Expected shopId from your example: "2lwT1Te10Ls7F2yuouus"');
      
      // First try without orderBy to avoid index issues
      const q = query(
        this.collectionRef, 
        where('shopId', '==', shopId)
        // Temporarily removing orderBy to avoid index issues
      );
      const snapshot = await getDocs(q);
      
      console.log('📄 Raw Firebase snapshot:', snapshot.size, 'documents');
      
      // If no bookings found for this specific shop, let's check ALL bookings
      if (snapshot.empty) {
        console.log('⚠️ No bookings found for shopId:', shopId);
        console.log('🔍 Checking ALL bookings in the database...');
        
        const allBookingsQuery = query(this.collectionRef);
        const allSnapshot = await getDocs(allBookingsQuery);
        
        console.log('📄 Total bookings in database:', allSnapshot.size);
        allSnapshot.docs.forEach(doc => {
          const data = doc.data();
          console.log('📋 Found booking with shopId:', data.shopId, 'vs looking for:', shopId);
        });
        
        return []; // Return empty for now, but we've logged what exists
      }
      
      const bookings = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📋 Raw Firebase doc:', {
          docId: doc.id,
          docIdType: typeof doc.id,
          docIdLength: doc.id?.length,
          data: data,
          dataHasId: 'id' in data,
          dataIdValue: data.id
        });
        
        // Ensure document ID takes precedence over any 'id' field in data
        const booking = {
          ...data,
          id: doc.id  // This MUST come after ...data to override any id field
        } as Booking;
        
        console.log('📋 Mapped booking object:', {
          id: booking.id,
          idType: typeof booking.id,
          idLength: booking.id?.length,
          customerName: booking.customerName,
          status: booking.status
        });
        
        return booking;
      });
      
      // Sort in memory instead of Firebase
      const sortedBookings = bookings.sort((a, b) => b.createdAt - a.createdAt);
      
      console.log(`✅ Found ${bookings.length} bookings for shop ${shopId}:`, bookings);
      return sortedBookings;
    } catch (error) {
      console.error('❌ Error getting bookings for shop:', error);
      return [];
    }
  }

  /**
   * Get bookings for a shop owner (all their shops)
   */
  async getBookingsForShopOwner(shopOwnerId: string): Promise<Booking[]> {
    try {
      console.log('🔍 Fetching bookings for shop owner:', shopOwnerId);
      const q = query(
        this.collectionRef, 
        where('shopOwnerId', '==', shopOwnerId)
        // Temporarily removing orderBy to avoid index issues
      );
      const snapshot = await getDocs(q);
      
      const bookings = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id  // Ensure document ID takes precedence
      } as Booking));

      // Sort in memory instead
      const sortedBookings = bookings.sort((a, b) => b.createdAt - a.createdAt);
      
      console.log(`✅ Found ${bookings.length} bookings for shop owner ${shopOwnerId}`);
      return sortedBookings;
    } catch (error) {
      console.error('❌ Error getting bookings for shop owner:', error);
      return [];
    }
  }

  /**
   * Get booking analytics for a shop
   */
  async getBookingAnalyticsForShop(shopId: string): Promise<BookingAnalytics> {
    try {
      const allBookings = await this.getBookingsForShop(shopId);
      return this.calculateAnalytics(allBookings);
    } catch (error) {
      console.error('❌ Error getting booking analytics for shop:', error);
      return this.getEmptyAnalytics();
    }
  }

  /**
   * Get booking analytics for shop owner (all their shops)
   */
  async getBookingAnalytics(shopOwnerId: string): Promise<BookingAnalytics> {
    try {
      const allBookings = await this.getBookingsForShopOwner(shopOwnerId);
      return this.calculateAnalytics(allBookings);
    } catch (error) {
      console.error('❌ Error getting booking analytics for owner:', error);
      return this.getEmptyAnalytics();
    }
  }

  /**
   * Real-time listener for shop bookings
   */
  onShopBookingsChange(shopId: string, callback: (bookings: Booking[]) => void) {
    const q = query(
      this.collectionRef,
      where('shopId', '==', shopId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Booking));
      callback(bookings);
    }, (error) => {
      console.error('❌ Error in bookings listener:', error);
      callback([]);
    });
  }

  /**
   * Calculate analytics from bookings array
   */
  private calculateAnalytics(bookings: Booking[]): BookingAnalytics {
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === BookingStatus.PENDING).length;
    const confirmedBookings = bookings.filter(b => b.status === BookingStatus.ACCEPTED).length;
    const completedBookings = bookings.filter(b => b.status === BookingStatus.COMPLETED).length;
    const cancelledBookings = bookings.filter(b => b.status === BookingStatus.CANCELLED).length;
    
    // Count today's bookings
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
   * Return empty analytics
   */
  private getEmptyAnalytics(): BookingAnalytics {
    return {
      totalBookings: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      todayBookings: 0
    };
  }

  /**
   * Get today's accepted bookings for a shop (sorted by time)
   */
  async getTodaysAcceptedBookings(shopId: string): Promise<Booking[]> {
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const todayStr = today.getFullYear() + '-' + 
                      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(today.getDate()).padStart(2, '0');

      const q = query(
        this.collectionRef,
        where('shopId', '==', shopId),
        where('requestedDate', '==', todayStr),
        where('status', '==', BookingStatus.ACCEPTED)
      );

      const snapshot = await getDocs(q);
      
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Booking));

      // Sort by requested time
      return bookings.sort((a, b) => {
        try {
          const timeA = a.requestedTime.split(':').map(n => parseInt(n));
          const timeB = b.requestedTime.split(':').map(n => parseInt(n));
          const minutesA = timeA[0] * 60 + (timeA[1] || 0);
          const minutesB = timeB[0] * 60 + (timeB[1] || 0);
          return minutesA - minutesB;
        } catch {
          return 0;
        }
      });
    } catch (error) {
      console.error('❌ Error getting today\'s bookings:', error);
      return [];
    }
  }

  /**
   * Get weekly booking data for a shop (current week Monday to Sunday)
   */
  async getWeeklyBookingData(shopId: string): Promise<Record<string, number>> {
    try {
      const bookings = await this.getBookingsForShop(shopId);
      
      // Initialize data structure
      const weeklyData: Record<string, number> = {
        Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0
      };

      // Get current week's Monday
      const today = new Date();
      const dayOfWeek = today.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Handle Sunday as 0
      const monday = new Date(today);
      monday.setDate(today.getDate() + mondayOffset);
      monday.setHours(0, 0, 0, 0);

      // Generate week dates
      const weekDates: string[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        const dateStr = date.getFullYear() + '-' + 
                       String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(date.getDate()).padStart(2, '0');
        weekDates.push(dateStr);
      }

      // Count bookings for each day (accepted or pending)
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      bookings.forEach(booking => {
        if (booking.status === BookingStatus.ACCEPTED || booking.status === BookingStatus.PENDING) {
          const dayIndex = weekDates.indexOf(booking.requestedDate);
          if (dayIndex >= 0) {
            weeklyData[dayNames[dayIndex]]++;
          }
        }
      });

      return weeklyData;
    } catch (error) {
      console.error('❌ Error getting weekly booking data:', error);
      return { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    }
  }

  /**
   * Update booking status (Accept/Reject requests)
   */
  async updateBookingStatus(bookingId: string, newStatus: BookingStatus): Promise<void> {
    try {
      console.log('🔄 Updating booking status:', bookingId, 'to', newStatus);
      console.log('🔍 Booking ID type:', typeof bookingId);
      console.log('🔍 Booking ID length:', bookingId?.length);
      console.log('🔍 Booking ID valid:', !!bookingId && typeof bookingId === 'string' && bookingId.length > 0);
      
      if (!bookingId || typeof bookingId !== 'string' || bookingId.length === 0) {
        throw new Error('Invalid booking ID provided');
      }
      
      const bookingDocRef = doc(db, 'bookings', bookingId);
      console.log('🔍 Document reference created successfully');
      
      await updateDoc(bookingDocRef, {
        status: newStatus,
        updatedAt: Date.now()
      });
      
      console.log('✅ Booking status updated successfully');
    } catch (error) {
      console.error('❌ Error updating booking status:', error);
      console.error('❌ Error details:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Create a new booking
   */
  async createBooking(booking: Omit<Booking, 'id'>): Promise<string> {
    try {
      console.log('📝 Creating new booking:', booking);
      
      const docRef = await addDoc(this.collectionRef, {
        ...booking,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      
      console.log('✅ Booking created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating booking:', error);
      throw error;
    }
  }

  /**
   * Get pending bookings for a specific customer
   */
  async getPendingBookingsForCustomer(customerId: string): Promise<Booking[]> {
    try {
      console.log(`🔍 Getting pending bookings for customer ${customerId}`);
      
      const q = query(
        this.collectionRef,
        where('customerId', '==', customerId),
        where('status', '==', 'PENDING')
      );
      const snapshot = await getDocs(q);
      
      const bookings = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Booking));

      // Sort by creation date, newest first
      const sortedBookings = bookings.sort((a, b) => b.createdAt - a.createdAt);
      
      console.log(`✅ Found ${bookings.length} pending bookings for customer ${customerId}`);
      return sortedBookings;
    } catch (error) {
      console.error('❌ Error getting pending bookings for customer:', error);
      return [];
    }
  }
}

export const bookingRepository = new BookingRepository();