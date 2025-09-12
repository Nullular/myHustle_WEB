'use client';

import React from 'react';
import BookingScreen from '@/components/BookingScreen';
import { Service } from '@/types';

export default function BookingDemo() {
  // Mock service data
  const mockService: Service = {
    id: 'service-123',
    shopId: 'shop-456', 
    ownerId: 'owner-789',
    name: 'Premium Haircut',
    description: 'Professional haircut and styling service',
    price: 45.00,
    duration: 60,
    category: 'Hair & Beauty',
    allowsMultiDayBooking: false,
    advanceBookingDays: 30,
    active: true,
    imageUrl: '',
    tags: ['haircut', 'styling'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const handleBack = () => {
    console.log('Back button clicked');
  };

  const handleSave = (timestamp: number) => {
    console.log('Booking saved with timestamp:', timestamp);
  };

  const handleLoginClick = () => {
    console.log('Login required');
  };

  return (
    <div className="min-h-screen">
      <BookingScreen
        shopId="2lwT1Te10Ls7F2yuouus"
        serviceId="service-123"
        serviceName="Premium Haircut"
        shopName="Elite Hair Salon"
        shopOwnerId="owner-789"
        service={mockService}
        onBack={handleBack}
        onSave={handleSave}
        onLoginClick={handleLoginClick}
      />
    </div>
  );
}