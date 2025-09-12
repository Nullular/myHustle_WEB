import { useState, useEffect, useCallback } from 'react';
import { shopRepository } from '@/lib/firebase/repositories';
import { Shop } from '@/types/models';

/**
 * Hook for managing shops data with real-time updates
 * Replicates Android StateFlow behavior
 */
export function useShops() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let mounted = true;
    
    const handleShopsUpdate = (updatedShops: Shop[]) => {
      if (mounted) {
        setShops(updatedShops);
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
    
    // Start real-time listener (matches Android repository pattern)
    shopRepository.startRealtimeListener(handleShopsUpdate, handleError);
    
    return () => {
      mounted = false;
      shopRepository.stopRealtimeListener();
    };
  }, []);
  
  const refreshShops = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const freshShops = await shopRepository.getActiveShops();
      setShops(freshShops);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh shops');
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    shops,
    loading,
    error,
    refreshShops
  };
}

/**
 * Hook for getting a single shop by ID
 */
export function useShop(shopId: string | null) {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!shopId) {
      setShop(null);
      setLoading(false);
      return;
    }
    
    let mounted = true;
    
    const fetchShop = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 useShop - Fetching shop with ID:', shopId);
        const shopData = await shopRepository.getShopById(shopId);
        console.log('📦 useShop - Retrieved shop data:', shopData);
        
        if (mounted) {
          setShop(shopData);
          setLoading(false);
        }
      } catch (err) {
        console.error('❌ useShop - Error fetching shop:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch shop');
          setLoading(false);
        }
      }
    };
    
    fetchShop();
    
    return () => {
      mounted = false;
    };
  }, [shopId]);
  
  return {
    shop,
    loading,
    error
  };
}

/**
 * Hook for managing shops owned by current user
 */
export function useOwnedShops(ownerId: string | null) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!ownerId) {
      setShops([]);
      setLoading(false);
      return;
    }
    
    let mounted = true;
    
    const fetchOwnedShops = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const ownedShops = await shopRepository.getShopsByOwner(ownerId);
        
        if (mounted) {
          setShops(ownedShops);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch owned shops');
          setLoading(false);
        }
      }
    };
    
    fetchOwnedShops();
    
    return () => {
      mounted = false;
    };
  }, [ownerId]);
  
  const addShop = useCallback(async (shopData: Omit<Shop, 'id'>) => {
    try {
      const shopId = await shopRepository.addShop(shopData);
      if (shopId && ownerId) {
        // Refresh the list
        const updatedShops = await shopRepository.getShopsByOwner(ownerId);
        setShops(updatedShops);
      }
      return shopId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add shop');
      return null;
    }
  }, [ownerId]);
  
  const updateShop = useCallback(async (shop: Shop) => {
    try {
      const success = await shopRepository.updateShop(shop);
      if (success && ownerId) {
        // Refresh the list
        const updatedShops = await shopRepository.getShopsByOwner(ownerId);
        setShops(updatedShops);
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update shop');
      return false;
    }
  }, [ownerId]);
  
  const deleteShop = useCallback(async (shopId: string) => {
    try {
      const success = await shopRepository.deleteShop(shopId);
      if (success && ownerId) {
        // Refresh the list
        const updatedShops = await shopRepository.getShopsByOwner(ownerId);
        setShops(updatedShops);
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete shop');
      return false;
    }
  }, [ownerId]);
  
  return {
    shops,
    loading,
    error,
    addShop,
    updateShop,
    deleteShop
  };
}
