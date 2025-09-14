'use client';

import React from 'react';
import BookingScreen from '@/components/BookingScreen';
import { Service } from '@/types/models';

export default function BookingDemo() {
  // Mock service data
  const mockService: Service = {
    id: 'service-123',
    shopId: 'shop-456', 
    ownerId: 'owner-789',
    name: 'Premium Haircut',
    description: 'Professional haircut and styling service',
    primaryImageUrl: '',
    imageUrls: [],
    basePrice: 45.00,
    currency: 'USD',
    category: 'Hair & Beauty',
    estimatedDuration: 60,
    isBookable: true,
    allowsMultiDayBooking: false,
    expensePerUnit: 0,
    rating: 4.5,
    totalReviews: 23,
    active: true,
    isFeatured: false,
    tags: ['haircut', 'styling'],
    requirements: [],
    includes: [],
    availability: {
      daysAvailable: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: "09:00",
      endTime: "18:00",
      timeSlotDuration: 60,
      advanceBookingDays: 30,
      cancellationPolicy: "24 hours advance notice required"
    },
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
        shopOpenTime="09:00"
        shopCloseTime="18:00"
        service={mockService}
        onBack={handleBack}
        onSave={handleSave}
        onLoginClick={handleLoginClick}
      />
    </div>
  );
}