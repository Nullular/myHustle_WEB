'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  ShoppingCart,
  Package,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Clock,
  Truck,
} from 'lucide-react';

import { NeuButton, NeuCard } from '@/components/ui';
import { useAuthStore } from '@/lib/store/auth';
import { useShop } from '@/hooks/useShops';
import { 
  useOrderOverview, 
  useRecentOrders 
} from '@/hooks/useOrders';
import { Order, OrderStatus, getOrderStatusInfo } from '@/types/order';

export default function OrderManagementPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const storeId = params.id as string;
  
  // Create a mock user if none exists (for testing)
  const mockUser = user || {
    id: 'test-user-123',
    email: 'test@test.com',
    displayName: 'Test User',
    photoUrl: '',
    userType: 'BUSINESS_OWNER' as any,
    createdAt: Date.now(),
    verified: true,
    active: true,
    lastLoginAt: Date.now(),
    profile: {} as any
  };

  // Try to get shop info, but don't fail if it doesn't exist
  const { shop, loading: shopLoading, error: shopError } = useShop(storeId);

  // Use live data hooks - following Android pattern exactly
  // These should work regardless of shop existence, using shopId for filtering
  const { 
    overview, 
    isLoading: overviewLoading 
  } = useOrderOverview(storeId);
  
  const { 
    recentOrders, 
    isLoading: ordersLoading 
  } = useRecentOrders(storeId, 10);
  
  // Debug logging
  useEffect(() => {
    console.log('📊 Order Management Debug:', {
      storeId,
      user: user?.id,
      shop: shop?.name,
      shopLoading,
      overviewLoading,
      ordersLoading,
      overview,
      recentOrdersCount: recentOrders?.length || 0,
      recentOrders: recentOrders?.map(o => ({ id: o.id, orderNumber: o.orderNumber, status: o.status }))
    });
  }, [storeId, user, shop, shopLoading, overviewLoading, ordersLoading, overview, recentOrders]);

  // Redirect if no user
  useEffect(() => {
    if (!user && !mockUser) {
      console.log('🚫 No user found, redirecting to home');
      router.push('/');
      return;
    }
  }, [user, mockUser, router]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `R${amount.toFixed(2)}`;
  };

  // More lenient loading state - only block if we don't have a user
  if (!user && !mockUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <NeuButton
                variant="default"
                onClick={() => router.back()}
              >
                <ArrowLeft size={20} />
              </NeuButton>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
                <p className="text-gray-600 text-sm">
                  {shop?.name ? `Managing orders for ${shop.name}` : 'Manage customer orders and track deliveries'}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 py-6 space-y-6">
          {/* Welcome Section */}
          <NeuCard className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-blue-900">Order Management Hub</h2>
                <p className="text-blue-700 mt-1">
                  Manage customer orders, track deliveries, and update order status
                </p>
              </div>
            </div>
          </NeuCard>

          {/* Order Overview Stats */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Order Overview</h3>
            
            {overviewLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={`loading-overview-${i}`} className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : overview ? (
              <div className="grid grid-cols-2 gap-4">
                {/* Pending Orders */}
                <NeuCard className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-orange-200 rounded-full mb-3">
                      <AlertCircle className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="text-3xl font-bold text-orange-600 mb-1">
                      {overview.pendingOrders}
                    </div>
                    <div className="text-sm font-medium text-orange-700">
                      Pending
                    </div>
                  </div>
                </NeuCard>

                {/* Today's Orders */}
                <NeuCard className="p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-green-200 rounded-full mb-3">
                      <Clock className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {overview.todaysOrders}
                    </div>
                    <div className="text-sm font-medium text-green-700">
                      Today
                    </div>
                  </div>
                </NeuCard>

                {/* Shipped Orders */}
                <NeuCard className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-blue-200 rounded-full mb-3">
                      <Truck className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {overview.shippedOrders}
                    </div>
                    <div className="text-sm font-medium text-blue-700">
                      Shipped
                    </div>
                  </div>
                </NeuCard>

                {/* Total Orders */}
                <NeuCard className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-purple-200 rounded-full mb-3">
                      <Package className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      {overview.totalOrders}
                    </div>
                    <div className="text-sm font-medium text-purple-700">
                      Total
                    </div>
                  </div>
                </NeuCard>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <NeuCard key={`empty-overview-${i}`} className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-400 mb-1">0</div>
                      <div className="text-sm text-gray-500">No data</div>
                    </div>
                  </NeuCard>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Recent Orders</h3>
            </div>

            {ordersLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={`loading-order-${i}`} className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders
                  .filter(order => order && order.id) // Filter out invalid orders
                  .map((order, index) => (
                    <OrderCard 
                      key={`order-${order.id}-${index}`} // Ensure unique keys
                      order={order} 
                      onClick={() => {
                        router.push(`/store/${storeId}/order-management/${order.id}`);
                      }}
                    />
                  ))
                }
              </div>
            ) : (
              <EmptyOrdersCard />
            )}
          </div>

          {/* Bottom Spacing */}
          <div className="h-6"></div>
        </div>
      </div>
    </div>
  );
}

// Order Card Component
function OrderCard({ order, onClick }: { order: Order; onClick: () => void }) {
  // Defensive programming - ensure order has required data
  if (!order || !order.id || !order.orderNumber) {
    console.warn('Invalid order data:', order);
    return null;
  }

  const statusInfo = getOrderStatusInfo(order.status);

  const getStatusChipClasses = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-orange-50 text-orange-600 border border-orange-200';
      case OrderStatus.CONFIRMED:
        return 'bg-green-50 text-green-600 border border-green-200';
      case OrderStatus.PREPARING:
        return 'bg-purple-50 text-purple-600 border border-purple-200';
      case OrderStatus.READY:
        return 'bg-green-50 text-green-600 border border-green-200';
      case OrderStatus.SHIPPED:
        return 'bg-blue-50 text-blue-600 border border-blue-200';
      case OrderStatus.DELIVERED:
        return 'bg-green-50 text-green-600 border border-green-200';
      case OrderStatus.CANCELLED:
        return 'bg-red-50 text-red-600 border border-red-200';
      case OrderStatus.REFUNDED:
        return 'bg-red-50 text-red-600 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
  };
  
  // Ensure we have valid items array
  const itemCount = order.items?.length || 0;
  const orderTotal = order.total || 0;
  const customerName = order.customerInfo?.name || 'Customer';
  
  return (
    <div
      className="cursor-pointer hover:shadow-lg transition-all duration-200"
      onClick={onClick}
    >
      <NeuCard className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-bold text-lg">Order #{order.orderNumber}</h4>
                <p className="text-gray-600 text-sm">
                  {customerName}
                </p>
              </div>
              <div 
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusChipClasses(order.status)}`}
              >
                {statusInfo.text}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {itemCount} item{itemCount !== 1 ? 's' : ''} • R{orderTotal.toFixed(2)}
              </span>
              <span>
                {new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
      </NeuCard>
    </div>
  );
}

// Empty Orders Card Component
function EmptyOrdersCard() {
  return (
    <NeuCard className="p-8">
      <div className="text-center">
        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <ShoppingCart className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-600 mb-2">No Orders Yet</h3>
        <p className="text-gray-500 text-center max-w-md mx-auto">
          Customer orders will appear here once they start purchasing from your store
        </p>
      </div>
    </NeuCard>
  );
}
