import React, { useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Heart, 
  Star, 
  MapPin, 
  Phone,
  ChevronRight,
  MessageCircle
} from 'lucide-react';
import FavoriteButton from '@/components/ui/FavoriteButton';
import ShareButton from '@/components/ui/ShareButton';
import { Shop, Product, Service, User } from '@/types';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import NeuInsetBox from '@/components/ui/NeuInsetBox';
import NeuDescriptionBox from '@/components/ui/NeuDescriptionBox';
import ItemCard from '@/components/ui/ItemCard';
import ServiceCard from '@/components/ui/ServiceCard';

interface MobileStoreProfileProps {
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

export default function MobileStoreProfileScreen({
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
}: MobileStoreProfileProps) {

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
    <div className="bg-gray-100 min-h-screen">
      <div className="relative w-full h-80 overflow-hidden">
        <div className="relative w-full h-52 overflow-hidden">
          <img
            src={shop.bannerUrl && (shop.bannerUrl.startsWith('http') || shop.bannerUrl.startsWith('/')) ? shop.bannerUrl : '/placeholder.svg'}
            alt={`${shop.name} banner`}
            className="w-full h-full object-cover rounded-b-3xl"
          />
        </div>
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-md"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4 text-gray-700" />
          </button>
          <div className="flex space-x-2">
            <ShareButton onClick={handleShare} />
            <FavoriteButton 
              isFavorite={isFavorite}
              toggleFavorite={() => toggleFavorite()}
            />
          </div>
        </div>

        <div className="absolute bottom-8 left-5 right-5">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-3xl p-2 bg-white">
              <img
                src={shop.logoUrl && (shop.logoUrl.startsWith('http') || shop.logoUrl.startsWith('/')) ? shop.logoUrl : '/placeholder.svg'}
                alt={`${shop.name} logo`}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1 text-gray-800">{shop.name}</h1>
              <div className="flex items-center space-x-1">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="text-lg font-bold text-gray-800">
                  {shop.rating.toFixed(1)}
                </span>
              </div>
              <div className={`text-sm font-semibold mt-1 ${storeStatus.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                {storeStatus.statusList.join(' - ')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 -mt-4">
        <NeuDescriptionBox>
          <h2 className="text-lg font-bold mb-2 text-gray-900">About</h2>
          <p className="text-gray-700 leading-6">{shop.description}</p>
        </NeuDescriptionBox>

        {products.length > 0 && (
          <NeuInsetBox>
            <h2 className="text-lg font-bold mb-3 text-gray-900">Products</h2>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {products.map((item) => (
                <Link href={`/item/${item.id}`} key={`product-${item.id}`} className="flex-shrink-0">
                  <ItemCard item={item} imageUrl={getProductImageUrl(item)} />
                </Link>
              ))}
            </div>
          </NeuInsetBox>
        )}

        {services.length > 0 && (
          <NeuInsetBox>
            <h2 className="text-lg font-bold mb-3 text-gray-900">Services</h2>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {services.map((item) => (
                <Link href={`/service/${item.id}`} key={`service-${item.id}`} className="flex-shrink-0">
                  <ServiceCard service={item} imageUrl={getServiceImageUrl(item)} />
                </Link>
              ))}
            </div>
          </NeuInsetBox>
        )}

        <div className="neu-card rounded-3xl p-4">
          <h2 className="text-lg font-bold mb-3 text-gray-900">Contact</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-blue-600 mr-3" />
              <span className="text-gray-700">{shop.address || shop.location}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-blue-600 mr-3" />
              <span className="text-gray-700">{shop.phone}</span>
            </div>
          </div>
           <button className="w-full mt-4 h-8 rounded-xl neu-pressed bg-blue-600 text-white font-medium flex items-center justify-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>Contact Store Owner</span>
          </button>
        </div>
      </div>
    </div>
  );
}
