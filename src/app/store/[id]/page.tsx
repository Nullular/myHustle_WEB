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
import { getUserById } from '@/lib/firebase/repositories/userRepository';

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

      // Fetch owner user data
      const ownerUser = await getUserById(ownerId);
      if (!ownerUser) {
        console.error('❌ Could not fetch store owner user data');
        return;
      }

      // Always use logged-in user email and store owner email for chat participants
      // DEBUG: Log participant IDs and emails before creating conversation
      console.log('[CHAT DEBUG] Creating chat with:', {
        userId: user.id,
        userEmail: user.email,
        ownerId,
        ownerEmail: ownerUser.email,
        shopId: shop.id,
        shopName: shop.name
      });

      console.log('[CHAT DEBUG] Participant verification:', {
        'Current User ID': user.id,
        'Store Owner ID': ownerId,
        'Are they different?': user.id !== ownerId
      });

      if (!user.email || !ownerUser.email) {
        alert('Error: Missing user or store owner email. Cannot create chat.');
        throw new Error('Missing user or store owner email');
      }

      // CRITICAL DEBUG: Log the exact emails being passed to createConversation
      console.log('[CHAT CREATION DEBUG] Emails being stored:', {
        'Your Email (user.email)': user.email,
        'Store Owner Email (ownerUser.email)': ownerUser.email,
        'User ID': user.id,
        'Owner ID': ownerId
      });

      const conversationId = await messagingRepository.createConversation({
        participants: [user.id, ownerId],
        participantNames: {
          [user.id]: user.displayName || user.email || 'User',
          [ownerId]: ownerUser.displayName || ownerUser.email || 'Store Owner',
        },
        participantEmails: {
          [user.id]: user.email || '',
          [ownerId]: ownerUser.email || '',
        },
        initialMessage: '', // Empty string to avoid the validation error
        businessContext: {
          shopId: shop.id,
          shopName: shop.name,
        },
      });

      console.log(`[CHAT DEBUG] Conversation ID received: ${conversationId}`);
      console.log(`[CHAT DEBUG] Type of conversation ID: ${typeof conversationId}`);

      if (!conversationId || typeof conversationId !== 'string' || conversationId.trim() === '') {
        throw new Error("Failed to create or find conversation. Received invalid ID.");
      }

  // Navigate to chat screen using correct route (must use /chat/[conversationId])
  // FIX: Use /chat/[conversationId] route, not /chat
  router.push(`/chat/${conversationId}`);
    } catch (e) {
      console.error('❌ Failed to start chat:', e);
      // Re-throw the error to be caught by the UI component
      throw e;
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
