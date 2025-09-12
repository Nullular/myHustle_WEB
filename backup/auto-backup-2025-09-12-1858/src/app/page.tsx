'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Settings, 
  LogOut,
  Star,
  Heart,
  Plus,
  Filter,
  Store,
  MessageCircle,
} from 'lucide-react';

import { NeuButton } from '@/components/ui';
import { useAuthStore } from '@/lib/store/auth';
import { useCartStore } from '@/lib/store/cart';
import { useShops } from '@/hooks/useShops';
import { AuthService } from '@/lib/firebase/auth';

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

  // Business hours helper function
  const isShopOpen = (shop: any): boolean => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* SLEEK MOBILE-FIRST HEADER */}
      <header className="neu-card-punched rounded-none shadow-lg sticky top-0 z-50 border-b border-gray-300/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <div className="neu-punched w-10 h-10 rounded-2xl flex items-center justify-center mr-3">
                <Store className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">MyHustle</h1>
            </div>

            {/* Navigation - Hidden on mobile, shown on desktop */}
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="neu-hover-button text-sm">
                Home
              </Link>
              <Link href="/stores" className="neu-hover-button text-sm">
                Browse
              </Link>
              <Link href="/neumorphic-showcase" className="neu-hover-button text-sm">
                Components
              </Link>
              <Link href="/about" className="neu-hover-button text-sm">
                About
              </Link>
            </nav>

            {/* User Actions - MODERN NEUMORPHIC */}
            <div className="flex items-center space-x-3">
              {/* Cart */}
              <Link href="/cart">
                <div className="neu-button-punched relative p-3 rounded-2xl">
                  <ShoppingCart className="h-5 w-5 text-gray-700" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {totalItems}
                    </span>
                  )}
                </div>
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    className="neu-button-punched p-3 rounded-2xl"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    aria-label="User menu"
                    title="User menu"
                  >
                    <User className="h-5 w-5 text-gray-700" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-3 neu-card-punched rounded-2xl shadow-xl z-50 min-w-60 overflow-hidden">
                      <div className="p-2">
                        <div className="neu-pressed rounded-xl p-3 mb-2 text-center">
                          <p className="text-sm font-medium text-gray-800">{user.displayName || user.email}</p>
                        </div>
                        
                        <Link href="/profile" className="neu-hover-button w-full justify-start mb-1">
                          <Settings className="h-4 w-4 mr-3" />
                          Profile
                        </Link>
                        
                        <Link href="/orders" className="neu-hover-button w-full justify-start mb-1">
                          <ShoppingCart className="h-4 w-4 mr-3" />
                          Orders
                        </Link>

                        <Link href="/messages" className="neu-hover-button w-full justify-start mb-1">
                          <MessageCircle className="h-4 w-4 mr-3" />
                          Messages
                        </Link>

                        {user.userType === 'BUSINESS_OWNER' && (
                          <>
                            <Link href="/my-stores" className="neu-hover-button w-full justify-start mb-1">
                              <Store className="h-4 w-4 mr-3" />
                              My Stores
                            </Link>
                            <Link href="/create-store" className="neu-hover-button w-full justify-start mb-1">
                              <Plus className="h-4 w-4 mr-3" />
                              Create Store
                            </Link>
                          </>
                        )}

                        <button
                          onClick={handleSignOut}
                          className="neu-hover-button w-full justify-start text-red-600 mt-2 border-t border-gray-200 pt-2"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link href="/login">
                    <div className="neu-button-punched px-4 py-2 rounded-2xl text-sm font-medium text-gray-700">
                      Sign In
                    </div>
                  </Link>
                  <Link href="/signup">
                    <div className="neu-button-punched px-4 py-2 rounded-2xl text-sm font-medium text-blue-600">
                      Sign Up
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* SLEEK MAIN CONTENT - MOBILE-FIRST */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* MOBILE-FIRST SEARCH AND FILTERS */}
        <div className="mb-6">
          {/* Mobile Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
              <input
                type="text"
                placeholder="Search shops and services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="neu-input w-full pl-12 pr-4 py-4 text-base rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* SLEEK FILTER CHIPS - HORIZONTAL SCROLL ON MOBILE */}
          <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            <Filter className="h-5 w-5 text-gray-400 flex-shrink-0" />
            {filterCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`${
                  selectedCategory === category 
                    ? 'neu-pressed bg-blue-100 text-blue-700' 
                    : 'neu-punched text-gray-700'
                } px-4 py-2 rounded-2xl text-sm font-medium whitespace-nowrap transition-all duration-200`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* RESULTS COUNT - MODERN STYLE */}
        <div className="mb-6 neu-pressed rounded-2xl p-4 neu-gradient-blue">
          <p className="text-gray-700 font-medium">
            🔍 {filteredShops.length} shop{filteredShops.length !== 1 ? 's' : ''} found
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* SLEEK SHOPS GRID - MOBILE-FIRST RESPONSIVE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredShops.map((shop, index) => (
            <div key={`shop-${shop.id}-${index}`} className="neu-card-punched rounded-3xl overflow-hidden hover:neu-shadow-punched-lg transition-all duration-300 neu-hover-lift gpu-accelerated touch-optimized">
              <div className="relative">
                {/* Shop Image with Modern Overlay */}
                <div className="h-40 sm:h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative overflow-hidden">
                  {shop.logoUrl && !shop.logoUrl.startsWith('content://') ? (
                    <img
                      src={shop.logoUrl}
                      alt={shop.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-gray-400 text-4xl font-bold">
                      {shop.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* MODERN FAVORITE BUTTON */}
                {user && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(shop.id);
                    }}
                    className="absolute top-3 right-3 neu-button-punched p-2 rounded-full"
                    aria-label="Toggle favorite"
                    title="Toggle favorite"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorites.has(shop.id) ? 'text-red-500 fill-current' : 'text-gray-400'
                      }`}
                    />
                  </button>
                )}

                {/* SLEEK STATUS BADGE */}
                <div className="absolute bottom-3 left-3">
                  <span
                    className={`neu-pressed px-3 py-1 rounded-2xl text-xs font-medium ${
                      isShopOpen(shop)
                        ? 'text-green-700 bg-green-100/80'
                        : 'text-red-700 bg-red-100/80'
                    }`}
                  >
                    {isShopOpen(shop) ? '🟢 Open' : '🔴 Closed'}
                  </span>
                </div>
              </div>

              {/* MODERN CARD CONTENT */}
              <div className="p-5">
                {/* Shop Name and Category */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-gray-900 truncate">
                    {shop.name}
                  </h3>
                  <span className="neu-pressed px-2 py-1 rounded-xl text-xs text-gray-600 ml-2">
                    {shop.category}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {shop.description}
                </p>

                {/* SLEEK RATING AND HOURS */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center neu-pressed px-3 py-1 rounded-2xl">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="ml-1 text-sm font-bold text-gray-800">
                      {shop.rating.toFixed(1)}
                    </span>
                    <span className="ml-1 text-xs text-gray-500">
                      ({shop.totalReviews || 0})
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 neu-pressed px-2 py-1 rounded-xl">
                    {shop.openTime24 && shop.closeTime24 && (
                      <>
                        {shop.openTime24} - {shop.closeTime24}
                      </>
                    )}
                  </div>
                </div>

                {/* MODERN ACTION BUTTON */}
                <Link href={`/store/${shop.id}`}>
                  <div className="neu-button-punched w-full py-3 rounded-2xl text-center font-semibold text-gray-800 hover:neu-shadow-punched-lg transition-all duration-200">
                    View Store
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* MODERN EMPTY STATE */}
        {filteredShops.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="neu-pressed w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              No shops found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="neu-button-punched px-6 py-3 rounded-2xl font-semibold text-gray-800"
            >
              🔄 Clear Filters
            </button>
          </div>
        )}

        {/* MODERN TEST DATA LINK */}
        <div className="fixed bottom-6 right-6 z-50">
          <Link href="/test-data">
            <div className="neu-button-punched px-4 py-3 rounded-2xl font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors">
              🧪 Test Data
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
