'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  CreditCard,
  PiggyBank,
  Calendar,
  RefreshCw,
  FileText,
  Download,
  Plus,
  Minus
} from 'lucide-react';

import { NeuButton, NeuCard } from '@/components/ui';
import { useAuthStore } from '@/lib/store/auth';
import { useShopOwnerOrders } from '@/hooks/useOrders';

interface AccountingOverview {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  cashFlow: number;
}

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: Date;
  orderId?: string;
  method: 'cash' | 'card' | 'digital' | 'bank_transfer';
  status: 'completed' | 'pending' | 'failed';
}

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface AccountingPageProps {
  params: Promise<{ id: string }>;
}

export default function AccountingPage({ params }: AccountingPageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [storeId, setStoreId] = useState<string>('');
  
  // Data state
  const [overview, setOverview] = useState<AccountingOverview>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    monthlyProfit: 0,
    cashFlow: 0
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'30d' | '90d' | '1y'>('30d');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'income' | 'expense'>('all');

  // Load store ID from params
  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setStoreId(resolvedParams.id);
    };
    loadParams();
  }, [params]);

  // Load accounting data
  const { orders } = useShopOwnerOrders(storeId);

  const loadAccountingData = async () => {
    if (!storeId || !user || orders.length === 0) return;

    setIsLoading(true);
    try {
      
      // Calculate dates for filtering
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Filter completed orders for revenue
      const completedOrders = orders.filter(order => 
        order.status === 'DELIVERED' || order.status === 'SHIPPED'
      );

      // Calculate total revenue
      const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);

      // Calculate monthly revenue
      const thisMonthOrders = completedOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      });
      const monthlyRevenue = thisMonthOrders.reduce((sum, order) => sum + order.total, 0);

      // Mock expense data (in real app, this would come from expense tracking)
      const mockExpenses = totalRevenue * 0.3; // Assume 30% expense ratio
      const monthlyExpenses = monthlyRevenue * 0.3;

      // Calculate metrics
      const netProfit = totalRevenue - mockExpenses;
      const monthlyProfit = monthlyRevenue - monthlyExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      const cashFlow = monthlyProfit; // Simplified cash flow

      setOverview({
        totalRevenue,
        totalExpenses: mockExpenses,
        netProfit,
        profitMargin,
        monthlyRevenue,
        monthlyExpenses,
        monthlyProfit,
        cashFlow
      });

      // Generate transaction history from orders
      const orderTransactions: Transaction[] = completedOrders.map(order => ({
        id: order.id,
        type: 'income' as const,
        amount: order.total,
        description: `Order #${order.orderNumber}`,
        category: 'Sales',
        date: new Date(order.createdAt),
        orderId: order.id,
        method: 'card' as const, // Mock payment method
        status: 'completed' as const
      }));

      // Mock some expense transactions
      const mockExpenseTransactions: Transaction[] = [
        {
          id: 'exp-1',
          type: 'expense',
          amount: 150.00,
          description: 'Office supplies',
          category: 'Operations',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          method: 'card',
          status: 'completed'
        },
        {
          id: 'exp-2',
          type: 'expense',
          amount: 200.00,
          description: 'Marketing campaign',
          category: 'Marketing',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          method: 'bank_transfer',
          status: 'completed'
        },
        {
          id: 'exp-3',
          type: 'expense',
          amount: 80.00,
          description: 'Shipping costs',
          category: 'Logistics',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          method: 'cash',
          status: 'completed'
        }
      ];

      const allTransactions = [...orderTransactions, ...mockExpenseTransactions]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 50); // Latest 50 transactions

      setTransactions(allTransactions);

      // Generate monthly data for last 6 months
      const monthlyData: MonthlyData[] = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(currentYear, currentMonth - i, 1);
        const monthName = monthDate.toLocaleString('default', { month: 'short' });
        
        const monthOrders = completedOrders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate.getMonth() === monthDate.getMonth() && 
                 orderDate.getFullYear() === monthDate.getFullYear();
        });
        
        const revenue = monthOrders.reduce((sum, order) => sum + order.total, 0);
        const expenses = revenue * 0.3; // Mock expense ratio
        const profit = revenue - expenses;
        
        monthlyData.push({
          month: monthName,
          revenue,
          expenses,
          profit
        });
      }

      setMonthlyData(monthlyData);

    } catch (error) {
      console.error('❌ Error loading accounting data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (storeId && user && orders.length >= 0) {
      loadAccountingData();
    }
  }, [storeId, user, timeFilter, orders]);

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    if (categoryFilter === 'all') return true;
    return transaction.type === categoryFilter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.type === 'income') {
      return <Plus className="h-4 w-4 text-green-600" />;
    } else {
      return <Minus className="h-4 w-4 text-red-600" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'cash':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'digital':
        return <Receipt className="h-4 w-4 text-purple-600" />;
      case 'bank_transfer':
        return <PiggyBank className="h-4 w-4 text-orange-600" />;
      default:
        return <Receipt className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading accounting data...</p>
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
              <h1 className="text-xl font-bold text-gray-800">Basic Accounting</h1>
              <p className="text-sm text-gray-600">Financial overview and transactions</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <NeuButton
              variant="icon"
              onClick={loadAccountingData}
              className="p-3"
            >
              <RefreshCw size={20} />
            </NeuButton>
            <NeuButton
              variant="icon"
              className="p-3"
              title="Export Report"
            >
              <Download size={20} />
            </NeuButton>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Financial Overview */}
        <NeuCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Financial Overview</h2>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-sm text-gray-600">Total Revenue</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(overview.totalRevenue)}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingDown className="h-6 w-6 text-red-600 mr-2" />
                <span className="text-sm text-gray-600">Total Expenses</span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(overview.totalExpenses)}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="h-6 w-6 text-blue-600 mr-2" />
                <span className="text-sm text-gray-600">Net Profit</span>
              </div>
              <p className={`text-2xl font-bold ${
                overview.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}>
                {formatCurrency(overview.netProfit)}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <PiggyBank className="h-6 w-6 text-purple-600 mr-2" />
                <span className="text-sm text-gray-600">Profit Margin</span>
              </div>
              <p className={`text-2xl font-bold ${
                overview.profitMargin >= 0 ? 'text-purple-600' : 'text-red-600'
              }`}>
                {overview.profitMargin.toFixed(1)}%
              </p>
            </div>
          </div>
        </NeuCard>

        {/* Monthly Performance */}
        <NeuCard className="p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Monthly Financial Performance</h3>
          <div className="space-y-4">
            {monthlyData.map((month, index) => {
              const maxValue = Math.max(...monthlyData.map(m => Math.max(m.revenue, m.expenses)));
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{month.month}</span>
                    <span className={`text-sm font-bold ${
                      month.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      Profit: {formatCurrency(month.profit)}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {/* Revenue Bar */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-green-600 w-16">Revenue</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-600 rounded-full h-3 transition-all duration-500"
                          style={{ width: `${maxValue > 0 ? (month.revenue / maxValue) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600 w-20 text-right">
                        {formatCurrency(month.revenue)}
                      </span>
                    </div>
                    
                    {/* Expenses Bar */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-red-600 w-16">Expenses</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-red-600 rounded-full h-3 transition-all duration-500"
                          style={{ width: `${maxValue > 0 ? (month.expenses / maxValue) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600 w-20 text-right">
                        {formatCurrency(month.expenses)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </NeuCard>

        {/* Recent Transactions */}
        <NeuCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Transactions</option>
              <option value="income">Income Only</option>
              <option value="expense">Expenses Only</option>
            </select>
          </div>
          
          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No transactions found</p>
              </div>
            ) : (
              filteredTransactions.slice(0, 20).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction)}
                    <div>
                      <p className="font-medium text-gray-800">{transaction.description}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <span>{transaction.category}</span>
                        <span>•</span>
                        <span>{formatDate(transaction.date)}</span>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          {getPaymentMethodIcon(transaction.method)}
                          <span className="capitalize">{transaction.method.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      transaction.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {filteredTransactions.length > 20 && (
            <div className="text-center mt-4">
              <NeuButton variant="default" className="text-sm">
                View All Transactions
              </NeuButton>
            </div>
          )}
        </NeuCard>
      </div>
    </div>
  );
}
