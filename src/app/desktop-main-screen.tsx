import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import FavoriteButton from '@/components/ui/FavoriteButton';
import { 
  Search, 
  ShoppingCart, 
  User as UserIcon, 
  Settings, 
  LogOut,
  Star,
  Plus,
  Filter,
  Store,
  MessageCircle,
} from 'lucide-react';
import { Shop, User, UserType } from '@/types/models';
import FeaturedStores from '@/components/ui/FeaturedStores';

interface DesktopMainScreenProps {
  user: (User & { displayName?: string | null; email?: string | null; userType?: UserType }) | null;
  totalItems: number;
  shops: Shop[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
  favorites: Set<string>;
  toggleFavorite: (shopId: string) => void;
  handleSignOut: () => void;
  isShopOpen: (shop: Shop) => boolean;
  filterCategories: string[];
  filteredShops: Shop[];
}

// This is a placeholder for the desktop view.
// The actual content from page.tsx will be moved here
export default function DesktopMainScreen({
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
  filteredShops
}: DesktopMainScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* SLEEK MOBILE-FIRST HEADER */}
      <header className="neu-card-punched rounded-none shadow-lg sticky top-0 z-50 border-b border-gray-300/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            {/* Logo */}
            <div className="flex items-center">
              <div className="neu-punched w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center mr-2 sm:mr-3">
                <Store className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">MyHustle</h1>
            </div>

            {/* Navigation - Hidden on mobile, shown on desktop */}
            <nav className="hidden lg:flex space-x-6 items-center relative">
              <Link href="/" className="neu-hover-button text-sm">
                Home
              </Link>
              {/* Browse becomes an info button on desktop that shows a transient bubble */}
              <BrowseInfo />
              <Link href="/about" className="neu-hover-button text-sm">
                About
              </Link>
              <Link href="/my-stores" className="neu-hover-button text-sm">
                My Store
              </Link>
            </nav>

            {/* User Actions - MOBILE OPTIMIZED */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Cart */}
              <Link href="/cart">
                <div className="neu-button-punched relative p-2.5 sm:p-3 rounded-xl sm:rounded-2xl">
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium">
                      {totalItems}
                    </span>
                  )}
                </div>
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    className="neu-button-punched p-2.5 sm:p-3 rounded-xl sm:rounded-2xl"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    aria-label="User menu"
                    title="User menu"
                  >
                    <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
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

                        <Link href="/my-stores" className="neu-hover-button w-full justify-start mb-1">
                          <Store className="h-4 w-4 mr-3" />
                          My Stores
                        </Link>
                        <Link href="/create-store" className="neu-hover-button w-full justify-start mb-1">
                          <Plus className="h-4 w-4 mr-3" />
                          Create Store
                        </Link>

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
                <div className="flex space-x-1.5 sm:space-x-2">
                  <Link href="/login">
                    <div className="neu-button-punched px-3 py-2 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium text-gray-700 min-w-[60px] sm:min-w-[80px] text-center">
                      Sign In
                    </div>
                  </Link>
                  <Link href="/signup">
                    <div className="neu-button-punched px-3 py-2 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium text-blue-600 min-w-[60px] sm:min-w-[80px] text-center">
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
                className="neu-input w-full pl-16 pr-4 py-4 text-base rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center placeholder:text-center"
              />
            </div>
          </div>

          {/* SLEEK FILTER CHIPS - HORIZONTAL SCROLL ON MOBILE */}
          <div className="flex items-center space-x-3 overflow-x-auto lg:overflow-x-auto pt-2 pb-4 scrollbar-hide flex-nowrap">
            <div className="flex-shrink-0 w-5 flex justify-center">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            {filterCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`${
                  selectedCategory === category 
                    ? 'neu-pressed bg-gray-300/50 text-black' 
                    : 'neu-punched text-black'
                } px-5 py-2 rounded-2xl text-sm font-medium whitespace-nowrap transition-all duration-200`}
              >
                {category}
              </button>
            ))}
            <div className="flex-shrink-0 w-5">
              {/* Spacer for symmetry */}
            </div>
          </div>
        </div>

        <div className="my-8">
          <FeaturedStores shops={shops} />
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
                  <div className="absolute top-3 right-3">
                    <FavoriteButton
                      size={25}
                      isFavorite={favorites.has(shop.id)}
                      toggleFavorite={(e) => {
                        e.preventDefault();
                        toggleFavorite(shop.id);
                      }}
                    />
                  </div>
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
        {filteredShops.length === 0 && (
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
      </main>
    </div>
  );
}

// Small helper component: shows a transient bubble when clicked
function BrowseInfo() {
  const [visible, setVisible] = useState(false);

  const handleClick = () => {
    setVisible(true);
    setTimeout(() => setVisible(false), 2500);
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="neu-hover-button text-sm"
        aria-label="Polling info"
        title="Polling info"
      >
        Browse
      </button>

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-xs bg-gray-800 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-lg z-50"
          >
            Polling is open for contents
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
