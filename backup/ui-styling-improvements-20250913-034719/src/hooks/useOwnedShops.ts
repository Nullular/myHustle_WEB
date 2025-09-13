'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  Unsubscribe 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Shop } from '@/types';
import { useAuthStore } from '@/lib/store/auth';

interface UseOwnedShopsResult {
  shops: Shop[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useOwnedShops(): UseOwnedShopsResult {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const refetch = () => {
    setLoading(true);
    setError(null);
  };

  useEffect(() => {
    if (!user?.id) {
      setShops([]);
      setLoading(false);
      setError('Please log in to view your stores');
      return;
    }

    setLoading(true);
    setError(null);

    let unsubscribe: Unsubscribe;

    try {
      // Query shops where ownerId matches current user (matching Android implementation)
      const q = query(
        collection(db, 'shops'),
        where('ownerId', '==', user.id),
        where('active', '==', true) // Only get active shops like Android
      );

      unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          try {
            const ownedShops: Shop[] = [];
            
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              const shop: Shop = {
                id: doc.id, // This is the Firestore document ID
                name: data.name || '',
                description: data.description || '',
                ownerId: data.ownerId || '',
                category: data.category || '',
                location: data.location || '',
                address: data.address || '',
                phone: data.phone || '',
                email: data.email || '',
                website: data.website || '',
                imageUrl: data.imageUrl || '',
                coverImageUrl: data.coverImageUrl || '',
                logoUrl: data.logoUrl || '',
                bannerUrl: data.bannerUrl || '',
                rating: data.rating || 0,
                totalReviews: data.totalReviews || 0,
                isVerified: data.isVerified || false,
                isPremium: data.isPremium || false,
                active: data.active !== false, // Default to true
                availability: data.availability || '',
                openTime24: data.openTime24 || '',
                closeTime24: data.closeTime24 || '',
                responseTime: data.responseTime || '',
                operatingHours: data.operatingHours || {},
                socialMedia: data.socialMedia || {},
                tags: data.tags || [],
                specialties: data.specialties || [],
                priceRange: data.priceRange || '',
                deliveryOptions: data.deliveryOptions || [],
                paymentMethods: data.paymentMethods || [],
                catalog: data.catalog || [],
                created_at: data.created_at?.toDate() || new Date(),
                updated_at: data.updated_at?.toDate() || new Date(),
                isFavorite: false, // Not relevant for owned shops
              };
              
              ownedShops.push(shop);
            });

            console.log(`Loaded ${ownedShops.length} owned shops for user ${user.id}`);
            
            // Sort by created_at descending (client-side sorting like Android)
            ownedShops.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
            
            setShops(ownedShops);
            setError(null);
          } catch (err) {
            console.error('Error processing owned shops:', err);
            setError('Error processing your stores data');
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          console.error('Error fetching owned shops:', err);
          setError('Failed to load your stores');
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Error setting up owned shops listener:', err);
      setError('Failed to connect to your stores');
      setLoading(false);
    }

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.id]);

  return {
    shops,
    loading,
    error,
    refetch,
  };
}
