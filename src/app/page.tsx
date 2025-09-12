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

import { NeuButton, NeuCard, NeuInput } from '@/components/ui';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">MyHustle</h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link href="/stores" className="text-gray-600 hover:text-gray-900">
                Browse
              </Link>
              <Link href="/neumorphic-showcase" className="text-gray-600 hover:text-gray-900">
                Components
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">
                About
              </Link>
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <Link href="/cart">
                <NeuButton className="relative p-2">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </NeuButton>
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <NeuButton
                    className="p-2"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <User className="h-5 w-5" />
                  </NeuButton>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="py-2">
                        <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                          {user.displayName || user.email}
                        </div>
                        
                        <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <Settings className="h-4 w-4 mr-2" />
                          Profile
                        </Link>
                        
                        <Link href="/orders" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Orders
                        </Link>

                        <Link href="/messages" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Messages
                        </Link>

                        {user.userType === 'BUSINESS_OWNER' && (
                          <>
                            <Link href="/my-stores" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              <Store className="h-4 w-4 mr-2" />
                              My Stores
                            </Link>
                            <Link href="/create-store" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              <Plus className="h-4 w-4 mr-2" />
                              Create Store
                            </Link>
                          </>
                        )}

                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-x-2">
                  <Link href="/login">
                    <NeuButton>Sign In</NeuButton>
                  </Link>
                  <Link href="/signup">
                    <NeuButton>Sign Up</NeuButton>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="w-full md:w-96">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <NeuInput
                  type="text"
                  placeholder="Search shops and services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2 overflow-x-auto">
              <Filter className="h-5 w-5 text-gray-400 flex-shrink-0" />
              {filterCategories.map((category) => (
                <NeuButton
                  key={category}
                  variant={selectedCategory === category ? "default" : "hover"}
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap text-sm"
                >
                  {category}
                </NeuButton>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredShops.length} shop{filteredShops.length !== 1 ? 's' : ''} found
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* Shops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map((shop, index) => (
            <NeuCard key={`shop-${shop.id}-${index}`} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <div className="relative">
                {/* Shop Image */}
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {shop.logoUrl && !shop.logoUrl.startsWith('content://') ? (
                    <img
                      src={shop.logoUrl}
                      alt={shop.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-4xl font-bold">
                      {shop.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Favorite Button */}
                {user && (
                  <button
                    onClick={() => toggleFavorite(shop.id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        favorites.has(shop.id) ? 'text-red-500 fill-current' : 'text-gray-400'
                      }`}
                    />
                  </button>
                )}

                {/* Open/Closed Status */}
                <div className="absolute bottom-3 left-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isShopOpen(shop)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {isShopOpen(shop) ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>

              <div className="p-4">
                {/* Shop Name and Category */}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg text-gray-900 truncate">
                    {shop.name}
                  </h3>
                  <span className="text-xs text-gray-500 ml-2">
                    {shop.category}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {shop.description}
                </p>

                {/* Rating and Hours */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium">
                      {shop.rating.toFixed(1)}
                    </span>
                    <span className="ml-1 text-xs text-gray-500">
                      ({shop.totalReviews || 0} reviews)
                    </span>
                  </div>

                  <div className="text-xs text-gray-500">
                    {shop.openTime24 && shop.closeTime24 && (
                      <>
                        {shop.openTime24} - {shop.closeTime24}
                      </>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <Link href={`/store/${shop.id}`}>
                  <NeuButton className="w-full">
                    View Store
                  </NeuButton>
                </Link>
              </div>
            </NeuCard>
          ))}
        </div>

        {/* Empty State */}
        {filteredShops.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No shops found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <NeuButton
              variant="hover"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
            >
              Clear Filters
            </NeuButton>
          </div>
        )}

        {/* Test Data Link */}
        <div className="fixed bottom-4 right-4 z-50">
          <Link href="/test-data">
            <NeuButton
              variant="hover"
              className="bg-purple-100 text-purple-700 hover:bg-purple-200"
            >
              Test Data
            </NeuButton>
          </Link>
        </div>
      </main>
    </div>
  );
}
