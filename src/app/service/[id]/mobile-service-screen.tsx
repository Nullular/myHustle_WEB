'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Heart, 
  Star, 
  Calendar,
  Plus,
  Minus,
  CheckCircle,
  DollarSign,
  Clock
} from 'lucide-react';
import ShareButton from '@/components/ui/ShareButton';

import { Service, User } from '@/types/models';

export interface MobileServiceScreenProps {
  service: Service;
  user: User | null;
  isFavorite: boolean;
  setIsFavorite: (isFavorite: boolean) => void;
  quantity: number;
  setQuantity: (quantity: number) => void;
  totalPrice: number;
  handleBookNow: () => void;
  isBooking: boolean;
  handleShare: () => void;
}

export function MobileServiceScreen({
  service,
  user,
  isFavorite,
  setIsFavorite,
  quantity,
  setQuantity,
  totalPrice,
  handleBookNow,
  isBooking,
  handleShare,
}: MobileServiceScreenProps) {
  const router = useRouter();

  const getServiceImageUrl = (service: Service) => {
    return service.imageUrls?.[0] || service.primaryImageUrl || null;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Image Section */}
      <div className="relative h-72">
        <img
          src={getServiceImageUrl(service) ?? '/placeholder.svg'}
          alt={service.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Top Buttons */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <button onClick={() => router.back()} className="neu-card p-3 rounded-full" aria-label="Go back">
            <ArrowLeft className="h-5 w-5 text-gray-800" />
          </button>
          <div className="flex space-x-2">
            <ShareButton onClick={handleShare} />
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`neu-card p-3 rounded-full ${isFavorite ? 'neu-pressed' : ''}`}
              aria-label="Favorite"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-800'}`} />
            </button>
          </div>
        </div>

        {/* Rating Badge */}
        <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1.5 rounded-full flex items-center space-x-1 text-sm">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="font-bold">{service.rating.toFixed(1)}</span>
          <span className="text-white/80">({service.totalReviews})</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 pb-32 space-y-4">
        <div className="neu-card rounded-2xl p-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{service.name}</h1>
          <p className="text-gray-600 leading-relaxed">{service.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="neu-card rounded-2xl p-4 text-center">
            <DollarSign className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-sm text-gray-500">Price</p>
            <p className="text-2xl font-bold text-gray-900">R{service.basePrice.toFixed(2)}</p>
          </div>
          <div className="neu-card rounded-2xl p-4 text-center">
            <Clock className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-bold text-lg text-gray-800">{service.estimatedDuration} min</p>
          </div>
        </div>

            {/* Quantity selector removed for customer booking */}
        
        {service.tags && service.tags.length > 0 && (
          <div className="neu-card rounded-2xl p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Features</h3>
            <div className="space-y-2">
              {service.tags.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 neu-card rounded-none border-t border-gray-200/60 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-xl font-bold text-blue-600">R{totalPrice.toFixed(2)}</p>
          </div>
          <button
            onClick={handleBookNow}
            disabled={isBooking || !user}
            className="neu-pressed w-1/2 h-12 rounded-lg text-md font-bold text-white bg-blue-600 disabled:opacity-60"
          >
            <div className="flex items-center justify-center space-x-2">
              {isBooking ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <Calendar className="h-5 w-5" />
              )}
              <span>
                {!user ? 'Login to Book' : isBooking ? 'Processing...' : 'Book Now'}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
