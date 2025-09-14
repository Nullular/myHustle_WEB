// Exact replica of Android BookingRepository.kt Firebase structure and logic

import { 
  collection, 
  doc, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  Timestamp,
  getDocs,
  updateDoc
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { Booking, BookingStatus } from '@/types/booking';

export class BookingRepository {
  private static instance: BookingRepository;
  private bookingsCollection = collection(db, 'bookings');
  private listeners: (() => void)[] = [];

  static getInstance(): BookingRepository {
    if (!BookingRepository.instance) {
      BookingRepository.instance = new BookingRepository();
    }
    return BookingRepository.instance;
  }

  // Create a new booking (matches Android createBooking)
  async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Date.now();
      const booking: Omit<Booking, 'id'> = {
        ...bookingData,
        status: BookingStatus.PENDING,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(this.bookingsCollection, booking);
      console.log('Booking created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  // Get confirmed bookings for a shop and service (matches Android logic for availability checking)
  async getConfirmedBookingsForShopService(shopId: string, serviceId: string): Promise<Booking[]> {
    try {
      const q = query(
        this.bookingsCollection,
        where('shopId', '==', shopId),
        where('serviceId', '==', serviceId),
        where('status', 'in', [BookingStatus.PENDING, BookingStatus.ACCEPTED]), // PENDING blocks for 24h, ACCEPTED blocks permanently
        orderBy('requestedDate', 'asc')
      );

      const snapshot = await getDocs(q);
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Booking));

      console.log(`Found ${bookings.length} confirmed bookings for shop ${shopId}, service ${serviceId}`);
      return bookings;
    } catch (error) {
      console.error('Error fetching confirmed bookings:', error);
      return [];
    }
  }

  // Listen to bookings for current user (matches Android startBookingsListener)
  startUserBookingsListener(callback: (bookings: Booking[]) => void): () => void {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('No current user, clearing bookings');
      callback([]);
      return () => {};
    }

    console.log('Starting bookings listener for user:', currentUser.uid);

    // Listen for bookings by userId
    const userIdQuery = query(
      this.bookingsCollection,
      where('customerId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeUserId = onSnapshot(userIdQuery, (snapshot) => {
      console.log(`Bookings listener update - ${snapshot.docs.length} bookings by userId`);
      
      const userBookings = snapshot.docs
        .map(doc => {
          try {
            return { id: doc.id, ...doc.data() } as Booking;
          } catch (error) {
            console.error('Error parsing booking:', error);
            return null;
          }
        })
        .filter(Boolean) as Booking[];

      callback(userBookings);
    }, (error) => {
      console.error('Bookings listener error:', error);
    });

    // Also listen for bookings by email if different from userId (Android pattern)
    let unsubscribeEmail = () => {};
    if (currentUser.email) {
      const emailQuery = query(
        this.bookingsCollection,
        where('customerEmail', '==', currentUser.email),
        orderBy('createdAt', 'desc')
      );

      unsubscribeEmail = onSnapshot(emailQuery, (snapshot) => {
        console.log(`Bookings by email listener update - ${snapshot.docs.length} bookings by email`);
        // This would combine with userId bookings in a real implementation
        // For now, we're focusing on the primary userId listener
      }, (error) => {
        console.error('Bookings by email listener error:', error);
      });
    }

    // Return cleanup function
    return () => {
      unsubscribeUserId();
      unsubscribeEmail();
    };
  }

  // Listen to booking requests for shop owner (matches Android pattern)
  startShopBookingsListener(shopId: string, callback: (bookings: Booking[]) => void): () => void {
    console.log('Starting shop bookings listener for shop:', shopId);

    const shopQuery = query(
      this.bookingsCollection,
      where('shopId', '==', shopId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(shopQuery, (snapshot) => {
      console.log(`Shop bookings listener update - ${snapshot.docs.length} bookings for shop`);
      
      const shopBookings = snapshot.docs
        .map(doc => {
          try {
            return { id: doc.id, ...doc.data() } as Booking;
          } catch (error) {
            console.error('Error parsing shop booking:', error);
            return null;
          }
        })
        .filter(Boolean) as Booking[];

      callback(shopBookings);
    }, (error) => {
      console.error('Shop bookings listener error:', error);
    });

    return unsubscribe;
  }

  // Update booking status (for shop owner responses)
  async updateBookingStatus(
    bookingId: string, 
    status: BookingStatus, 
    responseMessage?: string
  ): Promise<void> {
    try {
      const bookingRef = doc(this.bookingsCollection, bookingId);
      const updateData: Partial<Booking> = {
        status,
        updatedAt: Date.now()
      };

      if (responseMessage) {
        updateData.responseMessage = responseMessage;
      }

      await updateDoc(bookingRef, updateData);
      console.log('Booking status updated:', bookingId, status);
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  // Clean up all listeners
  cleanup(): void {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners = [];
  }
}

export const bookingRepository = BookingRepository.getInstance();