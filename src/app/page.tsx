'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/lib/store/auth';
import { useCartStore } from '@/lib/store/cart';
import { useShops } from '@/hooks/useShops';
import { AuthService } from '@/lib/firebase/auth';
import { useResponsive } from '@/hooks/useResponsive';
import DesktopMainScreen from './desktop-main-screen';
import MobileMainScreen from './mobile-main-screen';
import { Shop } from '@/types';
import { NeuButton } from '@/components/ui';

const filterCategories = [
  'All', 'Featured', 'Popular', 'Coffee', 'Tech', 'Beauty', 'Services', 'Products', 'Open Now'
];

export default function Home() {
  const { user } = useAuthStore();
  const { totalItems } = useCartStore();
  const { shops, loading, error } = useShops();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { isMobile } = useResponsive();

  // Business hours helper function
  const isShopOpen = (shop: Shop): boolean => {
    if (!shop.openTime24 || !shop.closeTime24) return true;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const [openHour, openMin] = shop.openTime24.split(':').map(Number);
    const [closeHour, closeMin] = shop.closeTime24.split(':').map(Number);
    
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    return currentTime >= openTime && currentTime < closeTime;
  };

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
      window.location.reload();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Safe filtering with null check
  const filteredShops = (shops || []).filter(shop => {
    // First check if shop is valid and has required properties
    if (!shop || !shop.id || !shop.name) return false;
    
    const matchesQuery = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (shop.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = (() => {
      switch (selectedCategory) {
        case 'All': return true;
        case 'Featured': return (shop.rating || 0) >= 4.5;
        case 'Popular': return (shop.rating || 0) >= 4.5;
        case 'Open Now': return isShopOpen(shop);
        default: return shop.category === selectedCategory;
      }
    })();

    return matchesQuery && matchesCategory;
  });

  const toggleFavorite = async (shopId: string) => {
    if (!user) return;
    
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(shopId)) {
        newFavorites.delete(shopId);
      } else {
        newFavorites.add(shopId);
      }
      return newFavorites;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shops from Firebase...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading shops: {error}</p>
          <NeuButton onClick={() => window.location.reload()}>
            Retry
          </NeuButton>
        </div>
      </div>
    );
  }

  const screenProps = {
    user,
    totalItems,
    shops,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    showUserMenu,
    setShowUserMenu,
    favorites,
    toggleFavorite,
    handleSignOut,
    isShopOpen,
    filterCategories,
    filteredShops,
  };

  return isMobile ? <MobileMainScreen {...screenProps} /> : <DesktopMainScreen {...screenProps} />;
}
