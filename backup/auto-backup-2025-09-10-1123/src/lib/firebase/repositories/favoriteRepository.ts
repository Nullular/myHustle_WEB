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
import { Favorite, FavoriteTargetType } from '@/types/models';

/**
 * Firebase Favorite Repository - Handles user favorites
 * Replicates Android favorite management patterns
 */
class FirebaseFavoriteRepository {
  private static instance: FirebaseFavoriteRepository;
  
  private constructor() {}
  
  static getInstance(): FirebaseFavoriteRepository {
    if (!FirebaseFavoriteRepository.instance) {
      FirebaseFavoriteRepository.instance = new FirebaseFavoriteRepository();
    }
    return FirebaseFavoriteRepository.instance;
  }
  
  /**
   * Get all favorites for a user
   */
  async getUserFavorites(userId: string): Promise<Favorite[]> {
    try {
      console.log(`🔥 Fetching favorites for user ${userId}`);
      
      const favoritesQuery = query(
        collection(db, 'favorites'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(favoritesQuery);
      console.log(`🔥 Fetched ${snapshot.docs.length} favorite documents`);
      
      const favorites: Favorite[] = [];
      snapshot.docs.forEach((document) => {
        try {
          const data = document.data();
          const favorite: Favorite = {
            id: document.id,
            ...data,
            createdAt: data.createdAt || Date.now(),
          } as Favorite;
          
          favorites.push(favorite);
        } catch (e) {
          console.error(`❌ Failed to parse favorite document ${document.id}`, e);
        }
      });
      
      return favorites;
    } catch (error) {
      console.error(`❌ Error fetching favorites for user ${userId}:`, error);
      return [];
    }
  }
  
  /**
   * Get user's favorite shops
   */
  async getUserFavoriteShops(userId: string): Promise<Favorite[]> {
    try {
      const favoritesQuery = query(
        collection(db, 'favorites'),
        where('userId', '==', userId),
        where('targetType', '==', FavoriteTargetType.SHOP),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(favoritesQuery);
      
      const favorites: Favorite[] = [];
      snapshot.docs.forEach((document) => {
        try {
          const data = document.data();
          const favorite: Favorite = {
            id: document.id,
            ...data,
            createdAt: data.createdAt || Date.now(),
          } as Favorite;
          
          favorites.push(favorite);
        } catch (e) {
          console.error(`❌ Failed to parse favorite shop document ${document.id}`, e);
        }
      });
      
      return favorites;
    } catch (error) {
      console.error(`❌ Error fetching favorite shops for user ${userId}:`, error);
      return [];
    }
  }
  
  /**
   * Check if a target is favorited by user
   */
  async isFavorited(userId: string, targetType: FavoriteTargetType, targetId: string): Promise<boolean> {
    try {
      const favoritesQuery = query(
        collection(db, 'favorites'),
        where('userId', '==', userId),
        where('targetType', '==', targetType),
        where('targetId', '==', targetId)
      );
      
      const snapshot = await getDocs(favoritesQuery);
      return snapshot.docs.length > 0;
    } catch (error) {
      console.error('❌ Error checking favorite status:', error);
      return false;
    }
  }
  
  /**
   * Add a favorite
   */
  async addFavorite(favorite: Omit<Favorite, 'id'>): Promise<string | null> {
    try {
      // Check if already favorited
      const isAlreadyFavorited = await this.isFavorited(
        favorite.userId, 
        favorite.targetType, 
        favorite.targetId
      );
      
      if (isAlreadyFavorited) {
        console.log('🔶 Item is already favorited');
        return null;
      }
      
      const favoriteData = {
        ...favorite,
        createdAt: Date.now(),
      };
      
      const docRef = await addDoc(collection(db, 'favorites'), favoriteData);
      console.log(`✅ Added favorite: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding favorite:', error);
      return null;
    }
  }
  
  /**
   * Remove a favorite
   */
  async removeFavorite(userId: string, targetType: FavoriteTargetType, targetId: string): Promise<boolean> {
    try {
      const favoritesQuery = query(
        collection(db, 'favorites'),
        where('userId', '==', userId),
        where('targetType', '==', targetType),
        where('targetId', '==', targetId)
      );
      
      const snapshot = await getDocs(favoritesQuery);
      
      if (snapshot.docs.length === 0) {
        console.log('🔶 Favorite not found to remove');
        return false;
      }
      
      // Remove all matching favorites (should only be one, but be safe)
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log(`✅ Removed ${snapshot.docs.length} favorite(s)`);
      return true;
    } catch (error) {
      console.error('❌ Error removing favorite:', error);
      return false;
    }
  }
  
  /**
   * Toggle favorite status (add if not favorited, remove if favorited)
   */
  async toggleFavorite(
    userId: string,
    targetType: FavoriteTargetType,
    targetId: string,
    targetName: string,
    targetImageUrl: string = '',
    shopId: string = '',
    shopName: string = ''
  ): Promise<boolean> {
    try {
      const isCurrentlyFavorited = await this.isFavorited(userId, targetType, targetId);
      
      if (isCurrentlyFavorited) {
        // Remove favorite
        return await this.removeFavorite(userId, targetType, targetId);
      } else {
        // Add favorite
        const favoriteData: Omit<Favorite, 'id'> = {
          userId,
          targetType,
          targetId,
          targetName,
          targetImageUrl,
          shopId: shopId || (targetType === FavoriteTargetType.SHOP ? targetId : ''),
          shopName: shopName || (targetType === FavoriteTargetType.SHOP ? targetName : ''),
          notes: '',
          tags: [],
          createdAt: Date.now()
        };
        
        const result = await this.addFavorite(favoriteData);
        return result !== null;
      }
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
      return false;
    }
  }
  
  /**
   * Get favorite IDs for quick lookup (returns Set for O(1) lookups)
   */
  async getFavoriteIds(userId: string, targetType: FavoriteTargetType): Promise<Set<string>> {
    try {
      const favoritesQuery = query(
        collection(db, 'favorites'),
        where('userId', '==', userId),
        where('targetType', '==', targetType)
      );
      
      const snapshot = await getDocs(favoritesQuery);
      
      const favoriteIds = new Set<string>();
      snapshot.docs.forEach((document) => {
        try {
          const data = document.data();
          if (data.targetId) {
            favoriteIds.add(data.targetId);
          }
        } catch (e) {
          console.error(`❌ Failed to parse favorite ID from document ${document.id}`, e);
        }
      });
      
      return favoriteIds;
    } catch (error) {
      console.error(`❌ Error fetching favorite IDs for user ${userId}:`, error);
      return new Set();
    }
  }
  
  /**
   * Set up real-time listener for user's favorites
   */
  startFavoritesListener(
    userId: string,
    onFavoritesUpdate: (favorites: Favorite[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe {
    const favoritesQuery = query(
      collection(db, 'favorites'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(
      favoritesQuery,
      (snapshot) => {
        console.log(`🔥 Processing ${snapshot.docs.length} favorite documents in listener`);
        
        const favorites: Favorite[] = [];
        snapshot.docs.forEach((document) => {
          try {
            const data = document.data();
            const favorite: Favorite = {
              id: document.id,
              ...data,
              createdAt: data.createdAt || Date.now(),
            } as Favorite;
            
            favorites.push(favorite);
          } catch (e) {
            console.error(`❌ Failed to parse favorite document ${document.id} in listener`, e);
          }
        });
        
        onFavoritesUpdate(favorites);
      },
      (error) => {
        console.error('❌ Error in favorites listener:', error);
        onError(error as Error);
      }
    );
  }
}

// Export singleton instance
export const favoriteRepository = FirebaseFavoriteRepository.getInstance();
