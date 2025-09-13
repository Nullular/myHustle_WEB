'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import { useShop } from '@/hooks/useShops';
import { useShopProducts, useShopServices } from '@/hooks/useProducts';
import { useResponsive } from '@/hooks/useResponsive';
import DesktopStoreProfileScreen from './desktop-store-profile';
import MobileStoreProfileScreen from './mobile-store-profile';
import { NeuButton } from '@/components/ui';
import { Product, Service } from '@/types';
import Loader from '@/components/ui/Loader';
import { messagingRepository } from '@/lib/firebase/repositories/messagingRepository';

interface StoreProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function StoreProfilePage({ params }: StoreProfilePageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [storeId, setStoreId] = useState<string>('');
  const { shop, loading, error } = useShop(storeId);
  const { products, loading: productsLoading } = useShopProducts(storeId);
  const { services, loading: servicesLoading } = useShopServices(storeId);
  const [isFavorite, setIsFavorite] = useState(false);
  const { isMobile } = useResponsive();

  // Resolve async params
  useEffect(() => {
    params.then(({ id }) => {
      console.log('🏪 Store page - Resolved shop ID:', id);
      setStoreId(id);
    });
  }, [params]);

  // Helper function to get product image URL
  const getProductImageUrl = (item: Product): string | null => {
    // Try different possible image field names
    if (item.imageUrls && item.imageUrls.length > 0) {
      const validUrl = item.imageUrls.find((url: string) => !url.startsWith('content://'));
      if (validUrl) return validUrl;
    }
    if (item.primaryImageUrl && !item.primaryImageUrl.startsWith('content://')) {
      return item.primaryImageUrl;
    }
    return null;
  };

  // Helper function to get service image URL
  const getServiceImageUrl = (item: Service): string | null => {
    // Try different possible image field names for services
    if (item.imageUrls && item.imageUrls.length > 0) {
      const validUrl = item.imageUrls.find((url: string) => !url.startsWith('content://'));
      if (validUrl) return validUrl;
    }
    if (item.primaryImageUrl && !item.primaryImageUrl.startsWith('content://')) {
      return item.primaryImageUrl;
    }
    return null;
  };

  // Check favorite status
  useEffect(() => {
    if (shop && user) {
      setIsFavorite(shop.isFavorite || false);
    }
  }, [shop, user]);

  const toggleFavorite = async () => {
    if (!user || !shop) return;

    const newFavoriteState = !isFavorite;
    try {
      // TODO: Implement favorite functionality
      setIsFavorite(newFavoriteState);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share && shop) {
      try {
        await navigator.share({
          title: shop.name,
          text: shop.description,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  // Start or navigate to a chat with the store owner
  const handleContactOwner = async () => {
    try {
      if (!user) {
        router.push('/login');
        return;
      }
      if (!shop) return;

      const ownerId = shop.ownerId;
      if (!ownerId) return;

      // Build conversation payload without problematic initial message
      const conversationId = await messagingRepository.createConversation({
        participants: [user.id, ownerId],
        participantNames: {
          [user.id]: user.displayName || user.email || 'User',
          [ownerId]: shop.name || 'Store Owner',
        },
        participantEmails: {
          [user.id]: user.email || '',
          [ownerId]: shop.email || '',
        },
        initialMessage: '', // Empty string to avoid the validation error
        businessContext: {
          shopId: shop.id,
          shopName: shop.name,
        },
      });

      // Navigate to chat - the initial message can be sent from the chat screen
      router.push(`/chat/${conversationId}?participantId=${ownerId}&participantName=${encodeURIComponent(shop.name)}`);
    } catch (e) {
      console.error('❌ Failed to start chat:', e);
    }
  };

  if (!storeId || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Loader />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading shop: {error || 'Shop not found'}</p>
          <NeuButton onClick={() => router.back()}>
            Go Back
          </NeuButton>
        </div>
      </div>
    );
  }

  const screenProps = {
    router,
    shop,
    products,
    services,
    isFavorite,
    toggleFavorite,
    handleShare,
    user,
    storeId,
    getProductImageUrl,
    getServiceImageUrl,
    onContactOwner: handleContactOwner,
  };

  return isMobile ? <MobileStoreProfileScreen {...screenProps} /> : <DesktopStoreProfileScreen {...screenProps} />;
}
