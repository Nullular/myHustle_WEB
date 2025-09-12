'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Share, 
  Heart, 
  Star, 
  MapPin, 
  Phone, 
  Calendar,
  ShoppingCart
} from 'lucide-react';
import { Shop, Product, Service, User } from '@/types';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

interface StoreProfileProps {
    router: AppRouterInstance;
    shop: Shop;
    products: Product[];
    services: Service[];
    isFavorite: boolean;
    toggleFavorite: () => void;
    handleShare: () => void;
    user: User | null;
    storeId: string;
    getProductImageUrl: (item: Product) => string | null;
    getServiceImageUrl: (item: Service) => string | null;
}

export default function DesktopStoreProfileScreen({
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
}: StoreProfileProps) {
  const storeStatus = useMemo(() => {
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
  }, [shop]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="relative w-full h-80 neu-card-punched overflow-hidden rounded-none">
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
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <button
            onClick={() => router.back()}
            className="w-12 h-12 rounded-full neu-card-punched bg-white/90 backdrop-blur-sm flex items-center justify-center"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
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
        <div className="absolute bottom-8 left-5 right-5">
          <div className="flex items-center space-x-4">
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
        <div className="neu-card-punched rounded-3xl p-5 bg-white">
          <h2 className="text-xl font-bold mb-2 text-gray-900">About</h2>
          <p className="text-gray-700 leading-6">{shop.description}</p>
        </div>
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
        <div className="h-6"></div>
      </div>
    </div>
  );
}
