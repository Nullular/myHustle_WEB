'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import BookingScreen from '@/components/BookingScreen';
import { Service, Shop } from '@/types';
import { serviceRepository } from '@/lib/firebase/repositories/serviceRepository';
import { shopRepository } from '@/lib/firebase/repositories/shopRepository';

export default function BookingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const serviceId = params.id as string;
  const quantity = searchParams.get('quantity') || '1';
  
  const [service, setService] = useState<Service | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadServiceAndShop = async () => {
      try {
        setLoading(true);
        
        // Load service details
        const serviceData = await serviceRepository.getServiceById(serviceId);
        if (!serviceData) {
          setError('Service not found');
          return;
        }
        setService(serviceData);
        
        // Load shop details
        const shopData = await shopRepository.getShopById(serviceData.shopId);
        if (!shopData) {
          setError('Shop not found');
          return;
        }
        setShop(shopData);
        
      } catch (err) {
        console.error('Error loading service/shop data:', err);
        setError('Failed to load booking information');
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      loadServiceAndShop();
    }
  }, [serviceId]);

  const handleBack = () => {
    router.back();
  };

  const handleSave = (timestamp: number) => {
    // Navigate back or to a confirmation page
    router.push(`/service/${serviceId}`);
  };

  const handleLoginClick = () => {
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking information...</p>
        </div>
      </div>
    );
  }

  if (error || !service || !shop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4 text-xl">⚠️</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            {error || 'Service Not Found'}
          </h1>
          <p className="text-gray-600 mb-4">
            We couldn't load the booking information for this service.
          </p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <BookingScreen
      shopId={shop.id}
      serviceId={service.id}
      serviceName={service.name}
      shopName={shop.name}
      shopOwnerId={shop.ownerId}
      service={service}
      onBack={handleBack}
      onSave={handleSave}
      onLoginClick={handleLoginClick}
    />
  );
}