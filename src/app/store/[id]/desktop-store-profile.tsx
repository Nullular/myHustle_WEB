'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Heart, 
  Star, 
  MapPin, 
  Phone, 
  Calendar,
  ShoppingCart,
  MessageCircle
} from 'lucide-react';
import ShareButton from '@/components/ui/ShareButton';
import { Shop, Product, Service, User } from '@/types';
import { ReviewTargetType } from '@/types/Review';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import NeuInsetBox from '@/components/ui/NeuInsetBox';
import NeuDescriptionBox from '@/components/ui/NeuDescriptionBox';
import ItemCard from '@/components/ui/ItemCard';
import ServiceCard from '@/components/ui/ServiceCard';
import FavoriteButton from '@/components/ui/FavoriteButton';
import { ReviewsList } from '@/components/reviews';
import { useDragScroll } from '@/hooks/useDragScroll';

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
  onContactOwner: () => void;
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
  onContactOwner,
}: StoreProfileProps) {
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const handleContactClick = async () => {
    setContactError(null);
    setContactLoading(true);
    try {
      await onContactOwner();
    } catch (e: any) {
      setContactError(e?.message || 'Failed to start chat');
    } finally {
      setContactLoading(false);
    }
  };
  // Drag-to-scroll for horizontal lists
  const productsDrag = useDragScroll<HTMLDivElement>();
  const servicesDrag = useDragScroll<HTMLDivElement>();
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 relative">
      {/* Fixed Banner and Navigation */}
      <div className="fixed top-0 left-0 right-0 z-10">
        <div className="relative w-full h-[50vh] overflow-hidden">
          <div className="relative w-full h-full overflow-hidden">
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
            <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-r from-blue-500/90 to-purple-600/90 text-white text-2xl font-bold ${shop.bannerUrl ? 'hidden' : ''}`}>
              {shop.name}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons - Separate from banner for better z-index handling */}
  <div className="fixed top-4 left-4 right-4 flex justify-between items-center z-50 pointer-events-auto">
        <button
          onClick={() => router.back()}
          className="w-16 h-16 rounded-full flex items-center justify-center bg-white shadow-md hover:bg-gray-100"
          aria-label="Go back"
        >
          <ArrowLeft className="h-8 w-8 text-gray-700" />
        </button>
        <div className="flex space-x-4">
          <div onClick={handleShare}>
            <ShareButton onClick={handleShare} />
          </div>
          <div>
            <FavoriteButton 
              size={50}
              isFavorite={isFavorite}
              toggleFavorite={() => toggleFavorite()}
            />
          </div>
        </div>
      </div>

      {/* Detached Logo Element (original size, positioned at 1/8th vw left, 50vh top) */}
      <div className="fixed left-[10vw] top-1/2 -translate-y-1/2 z-40 flex flex-col items-center pointer-events-none">
        <div className="w-64 h-64 rounded-3xl p-6 bg-white shadow-2xl flex items-center justify-center">
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
          <div className={`w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl ${shop.logoUrl && !shop.logoUrl.startsWith('content://') ? 'hidden' : ''}`}>
            {shop.name.charAt(0)}
          </div>
        </div>
        {/* Store name and rating under logo */}
        <div className="mt-4 flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 drop-shadow-lg">{shop.name}</h1>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-yellow-500"><Star className="h-6 w-6 inline-block" /></span>
            <span className="text-xl font-bold text-gray-800">{shop.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Scrollable Content Card */}
      <div className="pt-[50vh] min-h-screen overflow-y-auto scrollbar-hide z-20 relative">
  <div className="max-w-[calc(50vw-64px)] mx-auto px-8 pb-20 pt-16">
          <div className="bg-white rounded-t-3xl shadow-2xl">
            <div className="p-12 space-y-12">
              {/* Availability Section */}
              <div className="neu-card-punched rounded-3xl p-8 bg-gray-50">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Availability</h2>
                <div className="flex items-center space-x-6">
                  <div className={`w-6 h-6 rounded-full ${storeStatus.isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <p className="text-xl text-gray-800">
                    <span className="font-semibold">{storeStatus.statusList[0]}</span>
                    {storeStatus.statusList[1] && (
                      <span className="text-gray-600"> - {storeStatus.statusList[1]}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* About Section */}
              <NeuDescriptionBox>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">About</h2>
                <p className="text-xl text-gray-700 leading-8">{shop.description}</p>
              </NeuDescriptionBox>

              {/* Products Section */}
              {products.length > 0 && (
                <NeuInsetBox>
                  <h2 className="text-3xl font-bold mb-6 text-gray-900">Products</h2>
                  <div
                    ref={productsDrag.ref}
                    {...productsDrag.handlers}
                    className="flex items-center space-x-3 overflow-x-auto scrollbar-hide flex-nowrap cursor-grab active:cursor-grabbing select-none"
                  >
                    {products.map((item) => (
                      <Link href={`/item/${item.id}`} key={`product-${item.id}`}>
                        <ItemCard item={item} imageUrl={getProductImageUrl(item)} />
                      </Link>
                    ))}
                  </div>
                </NeuInsetBox>
              )}

              {/* Services Section */}
              {services.length > 0 && (
                <NeuInsetBox>
                  <h2 className="text-3xl font-bold mb-6 text-gray-900">Services</h2>
                  <div
                    ref={servicesDrag.ref}
                    {...servicesDrag.handlers}
                    className="flex items-center space-x-3 overflow-x-auto scrollbar-hide flex-nowrap cursor-grab active:cursor-grabbing select-none"
                  >
                    {services.map((item) => (
                      <Link href={`/service/${item.id}`} key={`service-${item.id}`}>
                        <ServiceCard service={item} imageUrl={getServiceImageUrl(item)} />
                      </Link>
                    ))}
                  </div>
                </NeuInsetBox>
              )}

              {/* Reviews Section */}
              <NeuInsetBox>
                <ReviewsList 
                  targetType={ReviewTargetType.SHOP}
                  targetId={shop.id}
                  targetName={shop.name}
                  shopId={shop.id}
                  showWriteReview={true}
                />
              </NeuInsetBox>

              {/* Contact Section */}
              <div className="neu-card-punched rounded-3xl p-8 bg-gray-50">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Contact Details</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-6">
                    <MapPin className="h-9 w-9 text-blue-600" />
                    <span className="text-xl text-gray-700">
                      {shop.address || shop.location || '123 Business Street, City'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-6">
                    <Phone className="h-9 w-9 text-blue-600" />
                    <span className="text-xl text-gray-700">
                      {shop.phone || '+1 (555) 123-4567'}
                    </span>
                  </div>
                </div>
                <button onClick={handleContactClick} disabled={contactLoading} className={`w-full mt-8 h-16 rounded-2xl bg-blue-600 text-white font-medium flex items-center justify-center space-x-4 ${contactLoading ? 'opacity-60 cursor-not-allowed' : ''}`}>
                  {contactLoading ? (
                    <svg className="animate-spin h-7 w-7 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                  ) : (
                    <MessageCircle className="h-9 w-9" />
                  )}
                  <span className="text-xl">{contactLoading ? 'Starting chat...' : 'Contact Store Owner'}</span>
                </button>
                {contactError && <div className="text-red-600 mt-2 text-center">{contactError}</div>}
              </div>

              {/* Store Management Section */}
              {user && shop.ownerId === user.id && (
                <div className="neu-card-punched rounded-3xl p-12 bg-gradient-to-br from-purple-50 to-blue-50">
                  <h2 className="text-3xl font-bold mb-10 text-gray-900">⚙️ Store Management</h2>
                  <div className="flex space-x-6">
                    <Link href={`/store/${storeId}/booking-management`}>
                      <div className="neu-button-punched w-[calc(1.5*200px)] h-[calc(1.5*300px)] rounded-2xl flex flex-col items-center justify-center space-y-4 bg-white hover:bg-purple-50 transition-colors">
                        <Calendar className="h-12 w-12 text-purple-600" />
                        <span className="text-xl font-medium text-purple-700">Booking Management</span>
                      </div>
                    </Link>
                    <Link href={`/store/${storeId}/order-management`}>
                      <div className="neu-button-punched w-[calc(1.5*200px)] h-[calc(1.5*300px)] rounded-2xl flex flex-col items-center justify-center space-y-4 bg-white hover:bg-blue-50 transition-colors">
                        <ShoppingCart className="h-12 w-12 text-blue-600" />
                        <span className="text-xl font-medium text-blue-700">Order Management</span>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
