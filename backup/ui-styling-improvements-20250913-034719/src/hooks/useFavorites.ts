import { useState, useEffect, useCallback } from 'react';
import { favoriteRepository } from '@/lib/firebase/repositories';
import { Favorite, FavoriteTargetType } from '@/types/models';

/**
 * Hook for managing user favorites with real-time updates
 */
export function useFavorites(userId: string | null) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!userId) {
      setFavorites([]);
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }
    
    let mounted = true;
    let unsubscribe: (() => void) | null = null;
    
    const handleFavoritesUpdate = (updatedFavorites: Favorite[]) => {
      if (mounted) {
        setFavorites(updatedFavorites);
        // Create quick lookup set for shop IDs
        const shopIds = new Set(
          updatedFavorites
            .filter(fav => fav.targetType === FavoriteTargetType.SHOP)
            .map(fav => fav.targetId)
        );
        setFavoriteIds(shopIds);
        setLoading(false);
        setError(null);
      }
    };
    
    const handleError = (err: Error) => {
      if (mounted) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    // Start real-time listener
    unsubscribe = favoriteRepository.startFavoritesListener(
      userId,
      handleFavoritesUpdate,
      handleError
    );
    
    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [userId]);
  
  const toggleFavorite = useCallback(async (
    targetType: FavoriteTargetType,
    targetId: string,
    targetName: string,
    targetImageUrl: string = '',
    shopId: string = '',
    shopName: string = ''
  ) => {
    if (!userId) return false;
    
    try {
      const success = await favoriteRepository.toggleFavorite(
        userId,
        targetType,
        targetId,
        targetName,
        targetImageUrl,
        shopId,
        shopName
      );
      
      // Update local state immediately for better UX
      if (success) {
        const isCurrentlyFavorited = favoriteIds.has(targetId);
        const newFavoriteIds = new Set(favoriteIds);
        
        if (isCurrentlyFavorited) {
          newFavoriteIds.delete(targetId);
        } else {
          newFavoriteIds.add(targetId);
        }
        
        setFavoriteIds(newFavoriteIds);
      }
      
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle favorite');
      return false;
    }
  }, [userId, favoriteIds]);
  
  const isFavorited = useCallback((targetId: string) => {
    return favoriteIds.has(targetId);
  }, [favoriteIds]);
  
  const getFavoriteShops = useCallback(() => {
    return favorites.filter(fav => fav.targetType === FavoriteTargetType.SHOP);
  }, [favorites]);
  
  const getFavoriteProducts = useCallback(() => {
    return favorites.filter(fav => fav.targetType === FavoriteTargetType.PRODUCT);
  }, [favorites]);
  
  const getFavoriteServices = useCallback(() => {
    return favorites.filter(fav => fav.targetType === FavoriteTargetType.SERVICE);
  }, [favorites]);
  
  return {
    favorites,
    favoriteIds,
    loading,
    error,
    toggleFavorite,
    isFavorited,
    getFavoriteShops,
    getFavoriteProducts,
    getFavoriteServices
  };
}

/**
 * Hook for checking if specific items are favorited
 */
export function useFavoriteStatus(
  userId: string | null,
  targetType: FavoriteTargetType,
  targetIds: string[]
) {
  const [favoriteStatuses, setFavoriteStatuses] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!userId || targetIds.length === 0) {
      setFavoriteStatuses({});
      setLoading(false);
      return;
    }
    
    let mounted = true;
    
    const checkFavoriteStatuses = async () => {
      try {
        setLoading(true);
        
        const favoriteIdSet = await favoriteRepository.getFavoriteIds(userId, targetType);
        
        if (mounted) {
          const statuses: Record<string, boolean> = {};
          targetIds.forEach(id => {
            statuses[id] = favoriteIdSet.has(id);
          });
          setFavoriteStatuses(statuses);
        }
      } catch (err) {
        console.error('Error checking favorite statuses:', err);
        if (mounted) {
          // Default all to false on error
          const statuses: Record<string, boolean> = {};
          targetIds.forEach(id => {
            statuses[id] = false;
          });
          setFavoriteStatuses(statuses);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    checkFavoriteStatuses();
    
    return () => {
      mounted = false;
    };
  }, [userId, targetType, JSON.stringify(targetIds)]);
  
  return {
    favoriteStatuses,
    loading
  };
}
