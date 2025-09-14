import { 
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './config';
import type { Store, Product, Service } from '@/types';

export class StoreService {
  private static instance: StoreService;
  
  static getInstance(): StoreService {
    if (!StoreService.instance) {
      StoreService.instance = new StoreService();
    }
    return StoreService.instance;
  }

  /**
   * Get a single store by ID (replicating Android FirebaseShopRepository.getShopById())
   */
  async getStoreById(storeId: string): Promise<Store | null> {
    try {
      // This is the EXACT same query as Android: shopsCollection.document(id).get()
      const storeRef = doc(db, 'shops', storeId);
      const storeSnap = await getDoc(storeRef);
      
      if (storeSnap.exists()) {
        const data = storeSnap.data();
        const store: Store = {
          id: storeSnap.id,
          ...data,
          // Convert Firestore timestamps to Date objects like Android
          createdAt: data.created_at?.toDate() || new Date(),
          updatedAt: data.updated_at?.toDate() || new Date(),
        } as Store;
        return store;
      }
      
      return null;
    } catch (error) {
      console.error('FirebaseStoreService: Error fetching store:', error);
      return null;
    }
  }

  /**
   * Get all active stores (replicating Android FirebaseShopRepository.fetchShops())
   */
  async getActiveStores(): Promise<Store[]> {
    try {
      console.log('FirebaseStoreService: Fetching active shops from Firestore');
      
      // Query only active shops to comply with security rules (using "active" field)
      // This is the EXACT same query as Android: shopsCollection.whereEqualTo("active", true)
      const storesQuery = query(
        collection(db, 'shops'),
        where('active', '==', true)
      );
      
      const snapshot = await getDocs(storesQuery);
      console.log(`FirebaseStoreService: Fetched ${snapshot.docs.length} active shop documents`);
      
      const stores: Store[] = [];
      
      snapshot.docs.forEach((document) => {
        try {
          const data = document.data();
          const store: Store = {
            id: document.id,
            ...data,
            // Handle timestamp conversion like Android does
            createdAt: data.created_at?.toDate() || new Date(),
            updatedAt: data.updated_at?.toDate() || new Date(),
          } as Store;
          
          stores.push(store);
          console.log(`FirebaseStoreService: Successfully parsed active shop: ${store.name}`);
        } catch (e) {
          console.error(`FirebaseStoreService: Failed to parse shop document ${document.id}`, e);
          // Skip invalid documents like Android does
        }
      });
      
      console.log(`FirebaseStoreService: Successfully parsed ${stores.length} active shops`);
      return stores;
    } catch (error) {
      console.error('FirebaseStoreService: Error fetching active shops', error);
      return [];
    }
  }

  /**
   * Listen to real-time updates for a specific store (replicating Android real-time listener)
   */
  subscribeToStore(storeId: string, callback: (store: Store | null) => void) {
    // This replicates the Android real-time listener pattern
    const storeRef = doc(db, 'shops', storeId);
    
    return onSnapshot(storeRef, (doc) => {
      if (doc.exists()) {
        try {
          const data = doc.data();
          const store: Store = {
            id: doc.id,
            ...data,
            createdAt: data.created_at?.toDate() || new Date(),
            updatedAt: data.updated_at?.toDate() || new Date(),
          } as Store;
          callback(store);
        } catch (e) {
          console.error('FirebaseStoreService: Failed to parse shop document in listener', e);
          callback(null);
        }
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('FirebaseStoreService: Error in store subscription:', error);
      callback(null);
    });
  }

  /**
   * Get products for a specific store (replicating Android ProductRepository.getProductsForShop())
   */
  async getStoreProducts(storeId: string): Promise<Product[]> {
    try {
      // This is the EXACT same query as Android: productsCollection.whereEqualTo("shopId", shopId)
      const productsQuery = query(
        collection(db, 'products'),
        where('shopId', '==', storeId)
      );
      
      const snapshot = await getDocs(productsQuery);
      const products: Product[] = [];
      
      snapshot.docs.forEach((document) => {
        try {
          const data = document.data();
          const product: Product = {
            id: document.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Product;
          
          // Filter active products in code instead of query to avoid index requirement (like Android)
          if (product.isActive === true) {
            products.push(product);
          }
        } catch (e) {
          console.error(`FirebaseStoreService: Failed to parse product document ${document.id}`, e);
          // Skip invalid documents like Android does
        }
      });
      
      // Sort in code instead of query (like Android does)
      return products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('FirebaseStoreService: Error fetching store products:', error);
      return [];
    }
  }

  /**
   * Get services for a specific store (same pattern as products)
   */
  async getStoreServices(storeId: string): Promise<Service[]> {
    try {
      // Same pattern as products: servicesCollection.whereEqualTo("shopId", shopId)
      const servicesQuery = query(
        collection(db, 'services'),
        where('shopId', '==', storeId)
      );
      
      const snapshot = await getDocs(servicesQuery);
      const services: Service[] = [];
      
      snapshot.docs.forEach((document) => {
        try {
          const data = document.data();
          const service: Service = {
            id: document.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Service;
          
          // Filter active services in code instead of query to avoid index requirement
          if (service.isActive === true) {
            services.push(service);
          }
        } catch (e) {
          console.error(`FirebaseStoreService: Failed to parse service document ${document.id}`, e);
          // Skip invalid documents like Android does
        }
      });
      
      // Sort in code instead of query
      return services.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('FirebaseStoreService: Error fetching store services:', error);
      return [];
    }
  }

  /**
   * Toggle favorite status for a store
   */
  async toggleFavorite(storeId: string, userId: string, isFavorite: boolean): Promise<boolean> {
    try {
      const storeRef = doc(db, 'shops', storeId);
      
      if (isFavorite) {
        // Add user to favorites array
        await updateDoc(storeRef, {
          favoriteUserIds: arrayUnion(userId)
        });
      } else {
        // Remove user from favorites array
        await updateDoc(storeRef, {
          favoriteUserIds: arrayRemove(userId)
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  }

  /**
   * Check if store is currently open based on business hours (replicating Android logic)
   */
  isStoreOpen(store: { openTime24?: string; closeTime24?: string }): boolean {
    try {
      if (!store.openTime24 || !store.closeTime24) {
        return false;
      }

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentMinutes = currentHour * 60 + currentMinute;

      // Parse open time - exact same logic as Android
      const [openH, openM] = store.openTime24.split(':').map(time => parseInt(time) || 8);
      const [closeH, closeM] = store.closeTime24.split(':').map(time => parseInt(time) || 18);
      
      const openMinutes = openH * 60 + openM;
      // Handle 24:00 as end of day - exact same logic as Android
      const closeMinutes = (closeH === 24 && closeM === 0) ? 24 * 60 : closeH * 60 + closeM;

      // Exact same condition as Android
      return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    } catch (e) {
      return false;
    }
  }

  /**
   * Format time from 24h to 12h format (replicating Android logic)
   */
  formatTime(time24: string): string {
    try {
      const [hour, minute] = time24.split(':').map(t => parseInt(t));
      
      // Handle 24:00 as midnight - same as Android
      if (hour === 24 && minute === 0) {
        return '12:00 AM';
      }
      
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const amPm = hour < 12 ? 'AM' : 'PM';
      
      return `${hour12}:${minute.toString().padStart(2, '0')} ${amPm}`;
    } catch (e) {
      return time24;
    }
  }

  /**
   * Get store status and next schedule time (replicating Android StoreProfileScreen logic)
   */
  getStoreStatus(store: { openTime24?: string; closeTime24?: string }): {
    isOpen: boolean;
    status: string;
    nextTime?: string;
  } {
    try {
      if (!store.openTime24 || !store.closeTime24) {
        return { isOpen: false, status: 'Hours unavailable' };
      }

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentMinutes = currentHour * 60 + currentMinute;

      const [openH, openM] = store.openTime24.split(':').map(time => parseInt(time) || 8);
      const [closeH, closeM] = store.closeTime24.split(':').map(time => parseInt(time) || 18);
      
      const openMinutes = openH * 60 + openM;
      const closeMinutes = (closeH === 24 && closeM === 0) ? 24 * 60 : closeH * 60 + closeM;

      const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
      
      if (isOpen) {
        const closeTimeFormatted = this.formatTime(store.closeTime24);
        return {
          isOpen: true,
          status: 'Open Now',
          nextTime: `Closes at ${closeTimeFormatted}`
        };
      } else {
        const openTimeFormatted = this.formatTime(store.openTime24);
        return {
          isOpen: false,
          status: 'Closed',
          nextTime: `Opens at ${openTimeFormatted}`
        };
      }
    } catch (e) {
      return { isOpen: false, status: 'Hours unavailable' };
    }
  }
}

export const storeService = StoreService.getInstance();
