import { useState, useEffect } from 'react';
import { orderRepository } from '@/lib/firebase/repositories/orderRepository';
import { Order, OrderOverview, OrderStatus } from '@/types/order';

// Hook for shop owner orders (orders where current user owns the shop)
export const useShopOwnerOrders = (shopId?: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 useShopOwnerOrders: Setting up subscription for shopId:', shopId);
    setIsLoading(true);
    
    const unsubscribe = orderRepository.subscribeToShopOwnerOrders((allOrders) => {
      console.log('🔔 useShopOwnerOrders: Received orders update:', allOrders.length, 'total orders');
      
      // Filter by shopId if provided
      const filteredOrders = shopId 
        ? allOrders.filter(order => order.shopId === shopId)
        : allOrders;
      
      console.log('📋 useShopOwnerOrders: Filtered orders for shop', shopId, ':', filteredOrders.length, 'orders');
      setOrders(filteredOrders);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [shopId]);

  return { orders, isLoading };
};

// Hook for customer orders (orders where current user is the customer) 
export const useCustomerOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    const unsubscribe = orderRepository.subscribeToCustomerOrders((orders) => {
      setOrders(orders);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return { orders, isLoading };
};

// Hook for order overview stats
export const useOrderOverview = (shopId?: string) => {
  const { orders, isLoading } = useShopOwnerOrders(shopId);
  const [overview, setOverview] = useState<OrderOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 useOrderOverview: Orders changed. isLoading:', isLoading, 'orders.length:', orders?.length);
    
    // Reset loading state when underlying loading changes
    if (isLoading) {
      console.log('⏳ useOrderOverview: Setting loading to true');
      setOverviewLoading(true);
    } else if (orders) {
      console.log('📊 useOrderOverview: Calculating overview for', orders.length, 'orders');
      
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const overview: OrderOverview = {
        pendingOrders: orders.filter(order => order.status === OrderStatus.PENDING).length,
        todaysOrders: orders.filter(order => {
          const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
          return orderDate === todayStr;
        }).length,
        shippedOrders: orders.filter(order => 
          order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED
        ).length,
        totalOrders: orders.length
      };
      
      console.log('✅ useOrderOverview: Calculated overview:', overview);
      setOverview(overview);
      setOverviewLoading(false);
    }
  }, [orders, isLoading]);

  console.log('🎯 useOrderOverview: Returning isLoading:', overviewLoading);
  return { overview, isLoading: overviewLoading };
};

// Hook for recent orders (limit 10)
export const useRecentOrders = (shopId?: string, limit: number = 10) => {
  const { orders, isLoading } = useShopOwnerOrders(shopId);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);

  useEffect(() => {
    // Reset loading state when underlying loading changes
    if (isLoading) {
      setRecentLoading(true);
    } else if (orders) {
      // Orders are already sorted by createdAt desc from repository
      const recent = orders.slice(0, limit);
      console.log('📋 Recent orders calculated:', recent.length, 'orders');
      setRecentOrders(recent);
      setRecentLoading(false);
    }
  }, [orders, isLoading, limit]);

  return { recentOrders, isLoading: recentLoading };
};

// Hook for order status update
export const useOrderStatusUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setIsUpdating(true);
    setError(null);
    
    try {
      await orderRepository.updateOrderStatus(orderId, status);
      console.log('✅ Order status updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order status';
      setError(errorMessage);
      console.error('❌ Error updating order status:', err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateOrderStatus, isUpdating, error };
};
