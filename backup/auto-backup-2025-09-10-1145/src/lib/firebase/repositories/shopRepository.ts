import { 
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../config';
import { Shop } from '@/types/models';

/**
 * Firebase Shop Repository - Exact replica of Android FirebaseShopRepository.kt
 * Provides real-time synchronization with Firestore
 */
class FirebaseShopRepository {
  private static instance: FirebaseShopRepository;
  private shopsListener: Unsubscribe | null = null;
  
  private constructor() {}
  
  static getInstance(): FirebaseShopRepository {
    if (!FirebaseShopRepository.instance) {
      FirebaseShopRepository.instance = new FirebaseShopRepository();
    }
    return FirebaseShopRepository.instance;
  }
  
  /**
   * Get all active shops (matches Android query exactly)
   * Uses .whereEqualTo("active", true) like Android
   */
  async getActiveShops(): Promise<Shop[]> {
    try {
      console.log('🔥 FirebaseShopRepository: Fetching active shops from Firestore');
      
      // Exact same query as Android: shopsCollection.whereEqualTo("active", true)
      const shopsQuery = query(
        collection(db, 'shops'),
        where('active', '==', true)
      );
      
      const snapshot = await getDocs(shopsQuery);
      console.log(`🔥 FirebaseShopRepository: Fetched ${snapshot.docs.length} active shop documents`);
      
      const shops: Shop[] = [];
      snapshot.docs.forEach((document) => {
        try {
          const data = document.data();
          const shop: Shop = {
            id: document.id,
            ...data,
            // Convert Firestore Timestamps to Dates
            created_at: data.created_at?.toDate() || new Date(),
            updated_at: data.updated_at?.toDate() || new Date(),
          } as Shop;
          
          console.log(`✅ Successfully parsed active shop: ${shop.name}`);
          shops.push(shop);
        } catch (e) {
          console.error(`❌ Failed to parse shop document ${document.id}`, e);
          // Skip invalid documents like Android does
        }
      });
      
      console.log(`✅ Successfully parsed ${shops.length} active shops`);
      return shops;
    } catch (error) {
      console.error('❌ FirebaseShopRepository: Error fetching active shops:', error);
      return [];
    }
  }
  
  /**
   * Set up real-time listener for shop updates (matches Android pattern)
   */
  startRealtimeListener(
    onShopsUpdate: (shops: Shop[]) => void,
    onError: (error: Error) => void
  ): void {
    // Remove existing listener first
    this.shopsListener?.();
    
    // Query for active shops only (using "active" field, not "isActive")
    const shopsQuery = query(
      collection(db, 'shops'),
      where('active', '==', true)
    );
    
    this.shopsListener = onSnapshot(
      shopsQuery,
      (snapshot) => {
        console.log(`🔥 Processing ${snapshot.docs.length} active shop documents in listener`);
        
        const shops: Shop[] = [];
        snapshot.docs.forEach((document) => {
          try {
            const data = document.data();
            const shop: Shop = {
              id: document.id,
              ...data,
              created_at: data.created_at?.toDate() || new Date(),
              updated_at: data.updated_at?.toDate() || new Date(),
            } as Shop;
            
            console.log(`✅ Successfully parsed active shop in listener: ${shop.name}`);
            shops.push(shop);
          } catch (e) {
            console.error(`❌ Failed to parse shop document ${document.id} in listener`, e);
            // Skip invalid documents
          }
        });
        
        console.log(`✅ Successfully parsed ${shops.length} active shops in listener`);
        onShopsUpdate(shops);
      },
      (error) => {
        console.error('❌ Error in shop listener:', error);
        onError(error as Error);
      }
    );
  }
  
  /**
   * Stop the real-time listener
   */
  stopRealtimeListener(): void {
    this.shopsListener?.();
    this.shopsListener = null;
  }
  
  /**
   * Get a shop by its unique ID (matches Android getShopById)
   */
  async getShopById(id: string): Promise<Shop | null> {
    try {
      const docRef = doc(db, 'shops', id);
      const document = await getDoc(docRef);
      
      if (!document.exists()) {
        return null;
      }
      
      const data = document.data();
      const shop: Shop = {
        id: document.id,
        ...data,
        created_at: data.created_at?.toDate() || new Date(),
        updated_at: data.updated_at?.toDate() || new Date(),
      } as Shop;
      
      return shop;
    } catch (error) {
      console.error(`❌ Error fetching shop ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Get shops owned by a specific user (matches Android getShopsByOwner)
   */
  async getShopsByOwner(ownerId: string): Promise<Shop[]> {
    try {
      // Same pattern as Android: .whereEqualTo("ownerId", ownerId).whereEqualTo("active", true)
      const shopsQuery = query(
        collection(db, 'shops'),
        where('ownerId', '==', ownerId),
        where('active', '==', true)
      );
      
      const snapshot = await getDocs(shopsQuery);
      console.log(`🔥 Fetched ${snapshot.docs.length} active shops for owner ${ownerId}`);
      
      const shops: Shop[] = [];
      snapshot.docs.forEach((document) => {
        try {
          const data = document.data();
          const shop: Shop = {
            id: document.id,
            ...data,
            created_at: data.created_at?.toDate() || new Date(),
            updated_at: data.updated_at?.toDate() || new Date(),
          } as Shop;
          
          console.log(`✅ Successfully parsed owner shop: ${shop.name}`);
          shops.push(shop);
        } catch (e) {
          console.error(`❌ Failed to parse owner shop document ${document.id}`, e);
          // Skip invalid documents
        }
      });
      
      console.log(`✅ Successfully parsed ${shops.length} active shops for owner ${ownerId}`);
      return shops;
    } catch (error) {
      console.error(`❌ Error fetching shops for owner ${ownerId}:`, error);
      return [];
    }
  }
  
  /**
   * Add a new shop to Firestore (matches Android addShop)
   */
  async addShop(shop: Omit<Shop, 'id'>): Promise<string | null> {
    try {
      const shopData = {
        ...shop,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      };
      
      const docRef = await addDoc(collection(db, 'shops'), shopData);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding shop:', error);
      return null;
    }
  }
  
  /**
   * Update an existing shop (matches Android updateShop)
   */
  async updateShop(shop: Shop): Promise<boolean> {
    try {
      const docRef = doc(db, 'shops', shop.id);
      const { id, created_at, ...updateData } = shop;
      
      await updateDoc(docRef, {
        ...updateData,
        updated_at: Timestamp.now(),
      });
      
      return true;
    } catch (error) {
      console.error(`❌ Error updating shop ${shop.id}:`, error);
      return false;
    }
  }
  
  /**
   * Delete a shop from Firestore (matches Android deleteShop)
   */
  async deleteShop(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, 'shops', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`❌ Error deleting shop ${id}:`, error);
      return false;
    }
  }
  
  /**
   * Business hours logic - matches Android StoreProfileScreen.kt exactly
   */
  isStoreOpen(shop: Shop): boolean {
    if (!shop.openTime24 || !shop.closeTime24) {
      return false;
    }
    
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes(); // Convert to HHMM format
    
    // Parse openTime24 and closeTime24 (format: "HH:mm")
    const [openHour, openMin] = shop.openTime24.split(':').map(Number);
    const [closeHour, closeMin] = shop.closeTime24.split(':').map(Number);
    
    const openTime = openHour * 100 + openMin;
    const closeTime = closeHour * 100 + closeMin;
    
    // Handle cases where closing time is past midnight
    if (closeTime < openTime) {
      // Shop is open across midnight (e.g., 22:00 to 02:00)
      return currentTime >= openTime || currentTime <= closeTime;
    } else {
      // Normal case (e.g., 08:00 to 18:00)
      return currentTime >= openTime && currentTime <= closeTime;
    }
  }
  
  /**
   * Get store status with formatted times (matches Android getStoreStatus)
   */
  getStoreStatus(shop: Shop): { isOpen: boolean; status: string; nextTime?: string } {
    if (!shop.openTime24 || !shop.closeTime24) {
      return {
        isOpen: false,
        status: 'Hours not available'
      };
    }
    
    const isOpen = this.isStoreOpen(shop);
    
    if (isOpen) {
      const closeTimeFormatted = this.formatTime(shop.closeTime24);
      return {
        isOpen: true,
        status: 'Open Now',
        nextTime: `Closes at ${closeTimeFormatted}`
      };
    } else {
      const openTimeFormatted = this.formatTime(shop.openTime24);
      return {
        isOpen: false,
        status: 'Closed',
        nextTime: `Opens at ${openTimeFormatted}`
      };
    }
  }
  
  /**
   * Format 24-hour time to 12-hour format (matches Android formatTime)
   */
  formatTime(time24: string): string {
    const [hour, minute] = time24.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
  }
}

// Export singleton instance
export const shopRepository = FirebaseShopRepository.getInstance();
