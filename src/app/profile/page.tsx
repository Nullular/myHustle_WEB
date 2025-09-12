'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AuthService } from '@/lib/firebase/auth';
import { 
  ArrowLeft, 
  User, 
  ShoppingBag, 
  Calendar,
  MessageCircle,
  Star,
  MapPin,
  Phone,
  Mail,
  Settings,
  LogOut,
  Plus
} from 'lucide-react';
import { NeuButton, NeuCard } from '@/components/ui';
import { useAuthStore } from '@/lib/store/auth';
import { orderRepository } from '@/lib/firebase/repositories/orderRepository';
import { bookingRepository } from '@/lib/firebase/repositories';
import { Order, OrderStatus } from '@/types/order';
import { Booking, BookingStatus } from '@/types';

interface ProfileStats {
  orders: number;
  bookings: number;
  messages: number;
  rating: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { clearAuth } = useAuthStore();
  const [selectedTab, setSelectedTab] = useState(0);
  const [stats, setStats] = useState<ProfileStats>({ orders: 0, bookings: 0, messages: 0, rating: 5.0 });
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Subscribe to orders using the subscription pattern
      const unsubscribeOrders = orderRepository.subscribeToCustomerOrders((userOrders) => {
        setOrders(userOrders);
        setStats(prev => ({ ...prev, orders: userOrders.length }));
      });

      // For now, let's create placeholder bookings since getUserBookings doesn't exist
      // TODO: Implement getUserBookings method in bookingRepository
      const userBookings: Booking[] = []; // Placeholder until method is implemented

      setBookings(userBookings);

      // Update stats (messages count can be static since we redirect to messages page)
      setStats(prev => ({
        ...prev,
        bookings: userBookings.length,
        messages: 0, // Static since we redirect to messages page
        rating: 5.0 // You can implement rating system later
      }));

    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
      clearAuth();
      router.push('/login');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const getStatusColor = (status: OrderStatus | BookingStatus) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'CONFIRMED': case 'ACCEPTED': return 'text-green-600 bg-green-100';
      case 'DELIVERED': case 'COMPLETED': return 'text-blue-600 bg-blue-100';
      case 'CANCELLED': case 'DENIED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const tabs = [
    { id: 0, label: 'Orders', icon: ShoppingBag, count: stats.orders },
    { id: 1, label: 'Bookings', icon: Calendar, count: stats.bookings },
    { id: 2, label: 'Messages', icon: MessageCircle, count: stats.messages }
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white px-4 py-4 border-b border-gray-200"
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center">
            <NeuButton
              variant="icon"
              onClick={() => router.back()}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </NeuButton>
            <h1 className="text-xl font-bold text-gray-800">Profile</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <NeuButton
              variant="icon"
              onClick={() => router.push('/settings')}
            >
              <Settings className="h-5 w-5" />
            </NeuButton>
            <NeuButton
              variant="icon"
              onClick={handleSignOut}
              className="text-red-500"
            >
              <LogOut className="h-5 w-5" />
            </NeuButton>
          </div>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <NeuCard className="p-6 mb-6 text-center">
            {/* Profile Picture */}
            <div className="relative mb-4">
              <div className="w-24 h-24 mx-auto rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                {user.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-blue-600" />
                )}
              </div>
            </div>

            {/* User Info */}
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              {user.displayName || 'User'}
            </h2>
            <p className="text-gray-600 mb-2">{user.email}</p>
            
            {/* Rating */}
            <div className="flex items-center justify-center mb-4">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="ml-1 text-gray-700 font-medium">{stats.rating}</span>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              {tabs.map((tab) => (
                <div key={tab.id} className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{tab.count}</div>
                  <div className="text-sm text-gray-600">{tab.label}</div>
                </div>
              ))}
            </div>
          </NeuCard>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <NeuCard className="p-4 mb-6">
            <div className="flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = selectedTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                      isSelected 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isSelected ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </NeuCard>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {selectedTab === 0 && (
            // Orders Tab
            <div className="space-y-4">
              {orders.length === 0 ? (
                <NeuCard className="p-8 text-center">
                  <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Orders Yet</h3>
                  <p className="text-gray-600 mb-4">Start shopping to see your orders here</p>
                  <NeuButton onClick={() => router.push('/')}>Browse Stores</NeuButton>
                </NeuCard>
              ) : (
                orders.map((order) => (
                  <NeuCard key={order.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">Order #{order.orderNumber}</h3>
                        <p className="text-sm text-gray-600">Order #{order.id.slice(-8)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">{order.items.length} items</p>
                        <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">${order.total.toFixed(2)}</p>
                        <button 
                          onClick={() => router.push(`/orders/${order.id}`)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </NeuCard>
                ))
              )}
            </div>
          )}

          {selectedTab === 1 && (
            // Bookings Tab
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <NeuCard className="p-8 text-center">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Bookings Yet</h3>
                  <p className="text-gray-600 mb-4">Book services to see them here</p>
                  <NeuButton onClick={() => router.push('/')}>Find Services</NeuButton>
                </NeuCard>
              ) : (
                bookings.map((booking) => (
                  <NeuCard key={booking.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">{booking.serviceName}</h3>
                        <p className="text-sm text-gray-600">{booking.shopName}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">{booking.requestedDate}</p>
                        <p className="text-xs text-gray-500">{booking.requestedTime}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{booking.serviceName}</p>
                        <button 
                          onClick={() => router.push(`/bookings/${booking.id}`)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </NeuCard>
                ))
              )}
            </div>
          )}

          {selectedTab === 2 && (
            // Messages Tab
            <div className="text-center py-8">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Messages</h3>
              <p className="text-gray-600 mb-4">View and manage all your conversations</p>
              <NeuButton onClick={() => router.push('/messages')}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Go to Messages
              </NeuButton>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}