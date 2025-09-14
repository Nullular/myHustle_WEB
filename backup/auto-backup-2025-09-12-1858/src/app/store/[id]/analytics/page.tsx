'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  Calendar,
  RefreshCw,
  DollarSign,
  Eye,
  ShoppingCart,
  Star,
  BarChart3
} from 'lucide-react';

import { NeuButton, NeuCard } from '@/components/ui';
import { useAuthStore } from '@/lib/store/auth';
import { productRepository, serviceRepository } from '@/lib/firebase/repositories';
import { useShopOwnerOrders } from '@/hooks/useOrders';
import { Product, Service } from '@/types/models';

interface AnalyticsData {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  orders: {
    total: number;
    thisMonth: number;
    pending: number;
    completed: number;
  };
  products: {
    total: number;
    lowStock: number;
    topSelling: Array<{
      id: string;
      name: string;
      sales: number;
      revenue: number;
    }>;
  };
  performance: {
    averageRating: number;
    totalReviews: number;
    responseTime: number;
    conversionRate: number;
  };
  monthlyData: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}

interface AnalyticsPageProps {
  params: Promise<{ id: string }>;
}

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [storeId, setStoreId] = useState<string>('');
  
  // Data state
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    revenue: { total: 0, thisMonth: 0, lastMonth: 0, growth: 0 },
    orders: { total: 0, thisMonth: 0, pending: 0, completed: 0 },
    products: { total: 0, lowStock: 0, topSelling: [] },
    performance: { averageRating: 0, totalReviews: 0, responseTime: 0, conversionRate: 0 },
    monthlyData: []
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Load store ID from params
  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setStoreId(resolvedParams.id);
    };
    loadParams();
  }, [params]);

  // Load analytics data
  const { orders, isLoading: ordersLoading } = useShopOwnerOrders(storeId);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // Calculate analytics when data changes
  useEffect(() => {
    if (!storeId || !user || ordersLoading) return;
    
    const calculateAnalytics = async () => {
      setIsLoading(true);
      try {
        // Load products and services if not already loaded
        let currentProducts = products;
        let currentServices = services;
        
        if (products.length === 0 || services.length === 0) {
          const [loadedProducts, loadedServices] = await Promise.all([
            productRepository.getProductsByShop(storeId),
            serviceRepository.getServicesByShop(storeId)
          ]);

          currentProducts = loadedProducts;
          currentServices = loadedServices;
          setProducts(loadedProducts);
          setServices(loadedServices);
        }

        // Calculate current month and last month dates
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        // Filter orders by month
        const thisMonthOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
        });

        const lastMonthOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
        });

        // Calculate revenue
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + order.total, 0);
        const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + order.total, 0);
        const revenueGrowth = lastMonthRevenue > 0 
          ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
          : thisMonthRevenue > 0 ? 100 : 0;

        // Calculate order stats
        const pendingOrders = orders.filter(order => 
          order.status === 'PENDING' || order.status === 'CONFIRMED'
        ).length;
        const completedOrders = orders.filter(order => 
          order.status === 'DELIVERED' || order.status === 'SHIPPED'
        ).length;

        // Calculate product stats
        const allProducts = [...currentProducts, ...currentServices];
        const lowStockProducts = currentProducts.filter(product => 
          product.stockQuantity <= 5 && product.stockQuantity > 0
        ).length;

        // Calculate top selling products from order items
        const productSales = new Map<string, { name: string; sales: number; revenue: number }>();
        
        orders.forEach(order => {
          order.items.forEach(item => {
            const existing = productSales.get(item.productId) || { 
              name: item.name, 
              sales: 0, 
              revenue: 0 
            };
            existing.sales += item.quantity;
            existing.revenue += item.price * item.quantity;
            productSales.set(item.productId, existing);
          });
        });

        const topSellingProducts = Array.from(productSales.entries())
          .map(([id, data]) => ({ id, ...data }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        // Generate monthly data for last 6 months
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date(currentYear, currentMonth - i, 1);
          const monthName = monthDate.toLocaleString('default', { month: 'short' });
          const monthOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate.getMonth() === monthDate.getMonth() && 
                   orderDate.getFullYear() === monthDate.getFullYear();
          });
          
          monthlyData.push({
            month: monthName,
            revenue: monthOrders.reduce((sum, order) => sum + order.total, 0),
            orders: monthOrders.length
          });
        }

        // Calculate performance metrics from real data
        const totalReviews = currentProducts.reduce((sum, product) => sum + product.totalReviews, 0) +
                            currentServices.reduce((sum, service) => sum + service.totalReviews, 0);
        const averageRating = totalReviews > 0 
          ? (currentProducts.reduce((sum, product) => sum + (product.rating * product.totalReviews), 0) +
             currentServices.reduce((sum, service) => sum + (service.rating * service.totalReviews), 0)) / totalReviews
          : 0;

        // Calculate conversion rate based on shop views vs orders (mock for now)
        const conversionRate = orders.length > 0 ? Math.min((orders.length / Math.max(orders.length * 10, 100)) * 100, 25) : 0;

        setAnalyticsData({
          revenue: {
            total: totalRevenue,
            thisMonth: thisMonthRevenue,
            lastMonth: lastMonthRevenue,
            growth: revenueGrowth
          },
          orders: {
            total: orders.length,
            thisMonth: thisMonthOrders.length,
            pending: pendingOrders,
            completed: completedOrders
          },
          products: {
            total: allProducts.length,
            lowStock: lowStockProducts,
            topSelling: topSellingProducts
          },
          performance: {
            averageRating,
            totalReviews,
            responseTime: 15, // Default response time
            conversionRate
          },
          monthlyData
        });

      } catch (error) {
        console.error('❌ Error calculating analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    calculateAnalytics();
  }, [storeId, user, orders, timeRange, ordersLoading]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  if (isLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <NeuButton 
              variant="icon" 
              onClick={() => router.push(`/store/${storeId}/manage`)}
              className="p-3"
            >
              <ArrowLeft size={20} />
            </NeuButton>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Analytics & Reports</h1>
              <p className="text-sm text-gray-600">Track your business performance</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <NeuButton
              variant="hover"
              onClick={() => window.location.reload()}
              className="px-4 py-2"
            >
              <RefreshCw size={20} />
            </NeuButton>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Revenue Overview */}
        <NeuCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Revenue Overview</h2>
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          
          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-lg font-medium mb-2">No Orders Yet</p>
              <p className="text-sm">Create some products and start getting orders to see revenue analytics!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(analyticsData.revenue.total)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(analyticsData.revenue.thisMonth)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Growth</p>
                <div className="flex items-center space-x-2">
                  <p className={`text-2xl font-bold ${
                    analyticsData.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(analyticsData.revenue.growth)}
                  </p>
                  {analyticsData.revenue.growth >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            </div>
          )}
        </NeuCard>

        {/* Key Metrics */}
        {orders.length === 0 ? (
          <NeuCard className="p-6">
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-lg font-medium mb-2">No Data Available</p>
              <p className="text-sm">Metrics will appear once you have orders and products!</p>
            </div>
          </NeuCard>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <NeuCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-xl font-bold text-gray-800">{analyticsData.orders.total}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
            </NeuCard>

            <NeuCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Orders</p>
                  <p className="text-xl font-bold text-orange-600">{analyticsData.orders.pending}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </NeuCard>

            <NeuCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-xl font-bold text-gray-800">{analyticsData.products.total}</p>
                </div>
                <Package className="h-8 w-8 text-purple-600" />
              </div>
            </NeuCard>

            <NeuCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {analyticsData.performance.averageRating.toFixed(1)}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </NeuCard>
          </div>
        )}

        {/* Monthly Revenue Chart */}
        <NeuCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Monthly Revenue Trend</h2>
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          
          {analyticsData.monthlyData.length > 0 ? (
            <div className="space-y-4">
              {analyticsData.monthlyData.map((month, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="font-medium text-gray-700">{month.month}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800">
                      {formatCurrency(month.revenue)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {month.orders} orders
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-lg font-medium mb-2">No Revenue Data</p>
              <p className="text-sm">Revenue trends will appear once you have sales!</p>
            </div>
          )}
        </NeuCard>

        {/* Top Selling Products */}
        <NeuCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Top Selling Products</h2>
            <Package className="h-6 w-6 text-purple-600" />
          </div>
          
          {analyticsData.products.topSelling.length > 0 ? (
            <div className="space-y-3">
              {analyticsData.products.topSelling.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{product.name}</div>
                      <div className="text-sm text-gray-600">{product.sales} sold</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800">
                      {formatCurrency(product.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-lg font-medium mb-2">No Sales Data</p>
              <p className="text-sm">Top products will appear once you have sales!</p>
            </div>
          )}
        </NeuCard>
      </div>
    </div>
  );
}
