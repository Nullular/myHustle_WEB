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
import { NeuButton } from '@/components/ui';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* SLEEK MOBILE-FIRST HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="neu-card-punched rounded-none shadow-lg sticky top-0 z-50 border-b border-gray-300/50"
      >
        <div className="px-4 py-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="neu-button-punched p-3 rounded-2xl mr-4"
                aria-label="Go back"
                title="Go back"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/settings')}
                className="neu-button-punched p-3 rounded-2xl"
                aria-label="Settings"
                title="Settings"
              >
                <Settings className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={handleSignOut}
                className="neu-button-punched p-3 rounded-2xl text-red-600"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto p-4">
        {/* MODERN PROFILE HEADER CARD - MOBILE-FIRST */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="neu-card-punched rounded-3xl p-6 mb-6 text-center bg-gradient-to-br from-white to-gray-50">
            {/* Profile Picture with Neumorphic Frame */}
            <div className="relative mb-5">
              <div className="neu-pressed w-28 h-28 mx-auto rounded-3xl p-1 bg-white">
                <div className="w-full h-full rounded-[20px] bg-blue-100 flex items-center justify-center overflow-hidden">
                  {user.photoUrl ? (
                    <img
                      src={user.photoUrl}
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-[20px]"
                    />
                  ) : (
                    <User className="w-12 h-12 text-blue-600" />
                  )}
                </div>
              </div>
            </div>

            {/* User Info */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {user.displayName || 'User'}
            </h2>
            <p className="text-gray-600 mb-4 text-base">{user.email}</p>
            
            {/* Rating Badge */}
            <div className="neu-pressed rounded-2xl px-4 py-2 inline-flex items-center mb-6">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="ml-1 text-gray-800 font-bold">{stats.rating}</span>
            </div>

            {/* SLEEK STATS GRID - MOBILE-OPTIMIZED */}
            <div className="grid grid-cols-3 gap-4">
              {tabs.map((tab) => (
                <div key={tab.id} className="neu-pressed rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{tab.count}</div>
                  <div className="text-sm text-gray-600 font-medium">{tab.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* MODERN TAB NAVIGATION - MOBILE-FIRST */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="neu-card-punched rounded-3xl p-4 mb-6">
            <div className="flex space-x-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = selectedTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`flex-1 flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 py-3 px-3 rounded-2xl transition-all duration-200 ${
                      isSelected 
                        ? 'neu-pressed bg-blue-50 text-blue-700' 
                        : 'neu-punched text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`text-xs px-2 py-1 rounded-2xl font-bold ${
                        isSelected ? 'bg-blue-200 text-blue-800' : 'bg-blue-600 text-white'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* MODERN TAB CONTENT */}
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {selectedTab === 0 && (
            // Orders Tab with Modern Design
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="neu-card-punched rounded-3xl p-8 text-center">
                  <div className="neu-pressed w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">No Orders Yet</h3>
                  <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
                  <button
                    onClick={() => router.push('/')}
                    className="neu-button-punched px-6 py-3 rounded-2xl font-semibold text-gray-800"
                  >
                    🛍️ Browse Stores
                  </button>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="neu-card-punched rounded-3xl p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">Order #{order.orderNumber}</h3>
                        <p className="text-sm text-gray-600">ID: {order.id.slice(-8)}</p>
                      </div>
                      <span className={`neu-pressed px-3 py-1 rounded-2xl text-xs font-bold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">{order.items.length} items</p>
                        <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600 text-lg">${order.total.toFixed(2)}</p>
                        <button 
                          onClick={() => router.push(`/orders/${order.id}`)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {selectedTab === 1 && (
            // Bookings Tab with Modern Design
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="neu-card-punched rounded-3xl p-8 text-center">
                  <div className="neu-pressed w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center">
                    <Calendar className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">No Bookings Yet</h3>
                  <p className="text-gray-600 mb-6">Book services to see them here</p>
                  <button
                    onClick={() => router.push('/')}
                    className="neu-button-punched px-6 py-3 rounded-2xl font-semibold text-gray-800"
                  >
                    📅 Find Services
                  </button>
                </div>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="neu-card-punched rounded-3xl p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{booking.serviceName}</h3>
                        <p className="text-sm text-gray-600">{booking.shopName}</p>
                      </div>
                      <span className={`neu-pressed px-3 py-1 rounded-2xl text-xs font-bold ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">{booking.requestedDate}</p>
                        <p className="text-xs text-gray-500">{booking.requestedTime}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600 text-lg">{booking.serviceName}</p>
                        <button 
                          onClick={() => router.push(`/bookings/${booking.id}`)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {selectedTab === 2 && (
            // Messages Tab with Modern Design
            <div className="neu-card-punched rounded-3xl p-8 text-center">
              <div className="neu-pressed w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Messages</h3>
              <p className="text-gray-600 mb-6">View and manage all your conversations</p>
              <button
                onClick={() => router.push('/messages')}
                className="neu-button-punched px-6 py-3 rounded-2xl font-semibold text-gray-800 inline-flex items-center"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                💬 Go to Messages
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}