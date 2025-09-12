'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Share, 
  Heart, 
  Star, 
  MapPin, 
  Phone, 
  Clock,
  Calendar,
  ShoppingCart
} from 'lucide-react';

import { NeuButton } from '@/components/ui';
import { useAuthStore } from '@/lib/store/auth';
import { useShop } from '@/hooks/useShops';
import { useShopProducts, useShopServices } from '@/hooks/useProducts';
import { shopRepository } from '@/lib/firebase/repositories';

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

  // Resolve async params
  useEffect(() => {
    params.then(({ id }) => {
      console.log('🏪 Store page - Resolved shop ID:', id);
      setStoreId(id);
    });
  }, [params]);

  // Debug logging for product images
  useEffect(() => {
    if (products && products.length > 0) {
      console.log('🛍️ Products data:', products);
      console.log('🖼️ First product imageUrls:', products[0]?.imageUrls);
      console.log('🖼️ First product primaryImageUrl:', products[0]?.primaryImageUrl);
      console.log('🖼️ Sample image URL:', products[0]?.imageUrls?.[0] || products[0]?.primaryImageUrl);
    }
  }, [products]);

  // Debug logging for service data
  useEffect(() => {
    if (services && services.length > 0) {
      console.log('🔧 Services data:', services);
      console.log('🖼️ First service imageUrls:', services[0]?.imageUrls);
      console.log('🖼️ First service primaryImageUrl:', services[0]?.primaryImageUrl);
      console.log('🔧 Sample service:', services[0]?.name, 'Price:', services[0]?.basePrice);
    }
  }, [services]);

  // Helper function to get product image URL
  const getProductImageUrl = (item: any) => {
    // Try different possible image field names
    if (item.imageUrls && item.imageUrls.length > 0) {
      const validUrl = item.imageUrls.find((url: string) => !url.startsWith('content://'));
      if (validUrl) return validUrl;
    }
    if (item.primaryImageUrl && !item.primaryImageUrl.startsWith('content://')) {
      return item.primaryImageUrl;
    }
    if (item.imageUrl && !item.imageUrl.startsWith('content://')) {
      return item.imageUrl;
    }
    if (item.image && !item.image.startsWith('content://')) {
      return item.image;
    }
    return null;
  };

  // Helper function to get service image URL
  const getServiceImageUrl = (item: any) => {
    // Try different possible image field names for services
    if (item.imageUrls && item.imageUrls.length > 0) {
      const validUrl = item.imageUrls.find((url: string) => !url.startsWith('content://'));
      if (validUrl) return validUrl;
    }
    if (item.primaryImageUrl && !item.primaryImageUrl.startsWith('content://')) {
      return item.primaryImageUrl;
    }
    if (item.imageUrl && !item.imageUrl.startsWith('content://')) {
      return item.imageUrl;
    }
    if (item.image && !item.image.startsWith('content://')) {
      return item.image;
    }
    return null;
  };

  // Business hours helper - matches Android logic exactly
  const getStoreStatus = (shop: any) => {
    if (!shop || !shop.openTime24 || !shop.closeTime24) {
      return { statusList: ['Hours unavailable'], isOpen: false };
    }

    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentMinutes = currentHour * 60 + currentMinute;

      const [openH, openM] = shop.openTime24.split(':').map((x: string) => parseInt(x) || 8);
      const [closeH, closeM] = shop.closeTime24.split(':').map((x: string) => parseInt(x) || 18);
      const openMinutes = openH * 60 + openM;
      const closeMinutes = closeH === 24 && closeM === 0 ? 24 * 60 : closeH * 60 + closeM;

      const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

      if (isOpen) {
        const closeTimeFormatted = closeH === 24 && closeM === 0 
          ? '12:00 AM'
          : `${closeH > 12 ? closeH - 12 : closeH || 12}:${closeM.toString().padStart(2, '0')} ${closeH < 12 ? 'AM' : 'PM'}`;
        return { statusList: ['Open Now', `Closes at ${closeTimeFormatted}`], isOpen: true };
      } else {
        const openTimeFormatted = `${openH > 12 ? openH - 12 : openH || 12}:${openM.toString().padStart(2, '0')} ${openH < 12 ? 'AM' : 'PM'}`;
        return { statusList: ['Closed', `Opens at ${openTimeFormatted}`], isOpen: false };
      }
    } catch {
      return { statusList: ['Hours unavailable'], isOpen: false };
    }
  };

  const storeStatus = useMemo(() => getStoreStatus(shop), [shop]);

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

  const handleCall = () => {
    if (shop?.phone) {
      window.open(`tel:${shop.phone}`);
    }
  };

  if (!storeId || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shop...</p>
        </div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* HEADER WITH BANNER AND STORE INFO - EXACT ANDROID STRUCTURE */}
      <div className="relative w-full h-80 neu-card-punched overflow-hidden rounded-none">
        {/* Banner Image */}
        <div className="relative w-full h-52 overflow-hidden rounded-b-3xl">
          {shop.bannerUrl ? (
            <img
              src={shop.bannerUrl}
              alt={`${shop.name} banner`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-r from-blue-500/90 to-purple-600/90 text-white text-xl font-bold ${shop.bannerUrl ? 'hidden' : ''}`}>
            {shop.name}
          </div>
        </div>

        {/* Top Navigation - Android Style */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="w-12 h-12 rounded-full neu-card-punched bg-white/90 backdrop-blur-sm flex items-center justify-center"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={handleShare}
              className="w-12 h-12 rounded-full neu-card-punched bg-white/90 backdrop-blur-sm flex items-center justify-center"
              aria-label="Share"
            >
              <Share className="h-5 w-5 text-gray-700" />
            </button>

            <button
              onClick={toggleFavorite}
              className={`w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center ${
                isFavorite 
                  ? 'neu-pressed bg-white/90' 
                  : 'neu-card-punched bg-white/90'
              }`}
              aria-label="Favorite"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-700'}`} />
            </button>
          </div>
        </div>

        {/* Store Logo and Info - Android Positioning */}
        <div className="absolute bottom-8 left-5 right-5">
          <div className="flex items-center space-x-4">
            {/* Store Logo - Neumorphic */}
            <div className="w-20 h-20 neu-card-punched rounded-3xl p-2 bg-white">
              {shop.logoUrl && !shop.logoUrl.startsWith('content://') ? (
                <img
                  src={shop.logoUrl}
                  alt={`${shop.name} logo`}
                  className="w-full h-full object-cover rounded-2xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg ${shop.logoUrl && !shop.logoUrl.startsWith('content://') ? 'hidden' : ''}`}>
                {shop.name.charAt(0)}
              </div>
            </div>

            {/* Store Name and Rating */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1 text-white">{shop.name}</h1>
              <div className="flex items-center space-x-1">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="text-lg font-bold text-white">
                  {shop.rating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-4">
        {/* Availability Section - Android Style */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 px-2">Availability</h2>
          <div className="flex space-x-2 overflow-x-auto pb-2 px-2">
            {storeStatus.statusList.map((status, index) => (
              <div
                key={index}
                className={`flex-shrink-0 px-3 py-2 rounded-2xl text-sm font-medium ${
                  status.includes('Open Now')
                    ? 'bg-green-500 text-white'
                    : status.includes('Closed')
                    ? 'bg-red-500 text-white'
                    : 'neu-card-punched bg-white text-gray-800'
                }`}
              >
                {status}
              </div>
            ))}
          </div>
        </div>

        {/* About Section - Android Card Style */}
        <div className="neu-card-punched rounded-3xl p-5 bg-white">
          <h2 className="text-xl font-bold mb-2 text-gray-900">About</h2>
          <p className="text-gray-700 leading-6">{shop.description}</p>
        </div>

        {/* Products Section - Android Container Structure */}
        {products.length > 0 && (
          <div className="neu-pressed rounded-3xl p-6 bg-white">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Products</h2>
            
            <div className="flex space-x-4 overflow-x-auto pb-2 px-4 -mx-4 android-scroll-container">
              {products.map((item) => (
                <Link
                  key={`product-${item.id}`}
                  href={`/item/${item.id}`}
                  className="flex-shrink-0"
                >
                  <div className="w-50 h-full simple-neu-card">
                    <div className="p-4 h-full flex flex-col">
                      {/* Product Image */}
                      <div className="w-full h-30 mb-3 rounded-2xl overflow-hidden">
                        {getProductImageUrl(item) ? (
                          <img
                            src={getProductImageUrl(item)!}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg ${getProductImageUrl(item) ? 'hidden' : ''}`}>
                          {item.name.charAt(0)}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 space-y-2">
                        <h3 className="font-bold text-base text-gray-900">{item.name}</h3>
                        
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium text-gray-700">
                            {item.rating?.toFixed(1) || '0.0'}
                          </span>
                        </div>

                        {item.description && (
                          <p className="text-gray-600 text-sm leading-tight line-clamp-3">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Services Section - Android Container Structure */}
        {services.length > 0 && (
          <div className="neu-pressed rounded-3xl p-6 bg-white">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Services</h2>
            
            <div className="flex space-x-4 overflow-x-auto pb-2 px-4 -mx-4 android-scroll-container">
              {services.map((item) => (
                <Link
                  key={`service-${item.id}`}
                  href={`/service/${item.id}`}
                  className="flex-shrink-0"
                >
                  <div className="w-50 h-full simple-neu-card">
                    <div className="p-4 h-full flex flex-col">
                      {/* Service Image */}
                      <div className="w-full h-30 mb-3 rounded-2xl overflow-hidden">
                        {getServiceImageUrl(item) ? (
                          <img
                            src={getServiceImageUrl(item)!}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg ${getServiceImageUrl(item) ? 'hidden' : ''}`}>
                          {item.name.charAt(0)}
                        </div>
                      </div>

                      {/* Service Details */}
                      <div className="flex-1 space-y-2">
                        <h3 className="font-bold text-base text-gray-900">{item.name}</h3>
                        
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium text-gray-700">
                            {item.rating?.toFixed(1) || '0.0'}
                          </span>
                        </div>

                        {item.description && (
                          <p className="text-gray-600 text-sm leading-tight line-clamp-3">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Contact Details - Android Card Style */}
        <div className="neu-card-punched rounded-3xl p-5 bg-white">
          <h2 className="text-xl font-bold mb-3 text-gray-900">Contact Details</h2>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700 text-base">
                {shop.address || shop.location || '123 Business Street, City'}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700 text-base">
                {shop.phone || '+1 (555) 123-4567'}
              </span>
            </div>
          </div>

          <button className="w-full mt-4 h-12 rounded-2xl bg-blue-600 text-white font-medium flex items-center justify-center space-x-2">
            <span>Contact Store Owner</span>
          </button>
        </div>

        {/* Store Management - Owner Only */}
        {user && shop.ownerId === user.id && (
          <div className="neu-card-punched rounded-3xl p-6 bg-gradient-to-br from-purple-50 to-blue-50">
            <h2 className="text-xl font-bold mb-5 text-gray-900">⚙️ Store Management</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href={`/store/${storeId}/booking-management`}>
                <div className="neu-button-punched h-24 rounded-2xl flex flex-col items-center justify-center space-y-2 bg-white hover:bg-purple-50 transition-colors">
                  <Calendar className="h-6 w-6 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Booking Management</span>
                </div>
              </Link>

              <Link href={`/store/${storeId}/order-management`}>
                <div className="neu-button-punched h-24 rounded-2xl flex flex-col items-center justify-center space-y-2 bg-white hover:bg-blue-50 transition-colors">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Order Management</span>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Bottom Spacing */}
        <div className="h-6"></div>
      </div>
    </div>
  );
}
