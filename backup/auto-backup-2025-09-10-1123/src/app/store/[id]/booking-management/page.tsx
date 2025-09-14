'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  AlertCircle,
  List,
  CalendarDays,
  User,
  CheckCircle,
  XCircle,
  MoreHorizontal,
} from 'lucide-react';

import { NeuButton, NeuCard } from '@/components/ui';
import { useAuthStore } from '@/lib/store/auth';
import { useShop } from '@/hooks/useShops';
import { Booking, BookingStatus, BookingOverview } from '@/types';

export default function BookingManagementPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const storeId = params.id as string;
  const { shop, loading: shopLoading, error: shopError } = useShop(storeId);

  // State for booking data
  const [bookingOverview, setBookingOverview] = useState<BookingOverview | null>(null);
  const [todaysBookings, setTodaysBookings] = useState<Booking[]>([]);
  const [weeklyBookingData, setWeeklyBookingData] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is the owner of this store
  const isOwner = user && shop && user.id === shop.ownerId;

  useEffect(() => {
    if (user?.id && shop?.id && isOwner) {
      loadBookingData();
    } else if (!shopLoading && (!isOwner || shopError)) {
      setIsLoading(false);
    }
  }, [user?.id, shop?.id, isOwner, shopLoading, shopError]);

  const loadBookingData = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, this would fetch from Firebase
      // For now, let's create mock data that resembles the Android functionality
      const mockOverview: BookingOverview = {
        pendingRequests: 3,
        todaysBookings: 5,
        upcomingBookings: 12,
        totalBookings: 48
      };

      const mockTodaysBookings: Booking[] = [
        {
          id: 'booking1',
          customerId: 'customer1',
          shopId: storeId,
          shopOwnerId: user!.id,
          serviceId: 'service1',
          serviceName: 'Hair Cut & Styling',
          shopName: shop!.name,
          customerName: 'John Smith',
          customerEmail: 'john@email.com',
          requestedDate: formatDateToString(new Date()),
          requestedTime: '09:00',
          status: BookingStatus.ACCEPTED,
          notes: 'Please use organic products',
          responseMessage: '',
          createdAt: Date.now() - 86400000, // 1 day ago
          updatedAt: Date.now()
        },
        {
          id: 'booking2',
          customerId: 'customer2',
          shopId: storeId,
          shopOwnerId: user!.id,
          serviceId: 'service2',
          serviceName: 'Deep Cleaning Service',
          shopName: shop!.name,
          customerName: 'Sarah Johnson',
          customerEmail: 'sarah@email.com',
          requestedDate: formatDateToString(new Date()),
          requestedTime: '14:30',
          status: BookingStatus.ACCEPTED,
          notes: 'Focus on kitchen and bathrooms',
          responseMessage: '',
          createdAt: Date.now() - 3600000, // 1 hour ago
          updatedAt: Date.now()
        }
      ];

      const mockWeeklyData = {
        Mon: 2,
        Tue: 4,
        Wed: 1,
        Thu: 6,
        Fri: 3,
        Sat: 8,
        Sun: 1
      };

      setBookingOverview(mockOverview);
      setTodaysBookings(mockTodaysBookings);
      setWeeklyBookingData(mockWeeklyData);
    } catch (error) {
      console.error('Error loading booking data:', error);
      // Set fallback data
      setBookingOverview({ pendingRequests: 0, todaysBookings: 0, upcomingBookings: 0, totalBookings: 0 });
      setTodaysBookings([]);
      setWeeklyBookingData({});
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime12Hour = (time24: string): string => {
    try {
      const [hours, minutes] = time24.split(':');
      const hour24 = parseInt(hours, 10);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return time24;
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleBookingRequests = () => {
    router.push(`/store/${storeId}/booking-requests`);
  };

  const handleAllBookings = () => {
    router.push(`/store/${storeId}/all-bookings`);
  };

  const handleCalendarView = () => {
    router.push(`/store/${storeId}/calendar`);
  };

  // Loading state
  if (shopLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (shopError || !shop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <NeuCard className="p-8 text-center max-w-md mx-auto">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Store Not Found</h2>
          <p className="text-gray-600 mb-6">
            {shopError || 'The store you are looking for does not exist.'}
          </p>
          <NeuButton onClick={handleBack}>
            Go Back
          </NeuButton>
        </NeuCard>
      </div>
    );
  }

  // Access control - only store owner can access booking management
  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <NeuCard className="p-8 text-center max-w-md mx-auto">
          <AlertCircle className="mx-auto mb-4 text-yellow-500" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            Only the store owner can access booking management.
          </p>
          <NeuButton onClick={handleBack}>
            Go Back
          </NeuButton>
        </NeuCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center space-x-4">
          <NeuButton
            variant="default"
            onClick={handleBack}
            className="p-2"
          >
            <ArrowLeft size={20} />
          </NeuButton>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Booking Management</h1>
            <p className="text-gray-600 text-sm">
              {shop.name}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Welcome Card */}
        <BookingWelcomeCard />

        {/* Booking Overview */}
        {bookingOverview && (
          <BookingOverviewCard overview={bookingOverview} />
        )}

        {/* Quick Actions */}
        {bookingOverview && (
          <QuickActionsSection
            pendingCount={bookingOverview.pendingRequests}
            onBookingRequestsClick={handleBookingRequests}
            onAllBookingsClick={handleAllBookings}
            onCalendarViewClick={handleCalendarView}
          />
        )}

        {/* Today's Schedule */}
        <TodaysBookingsCard bookings={todaysBookings} />

        {/* Weekly Highlights */}
        <WeeklyHighlightsCard weeklyData={weeklyBookingData} />

        {/* Spacer */}
        <div className="h-20"></div>
      </main>
    </div>
  );
}

// Component definitions
const BookingWelcomeCard = () => (
  <NeuCard className="p-6">
    <div className="flex items-center mb-4">
      <div className="flex-shrink-0 p-3 bg-blue-100 rounded-xl mr-4">
        <Calendar className="text-blue-600" size={32} />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          Booking Management Hub
        </h2>
        <p className="text-gray-600">
          Manage customer bookings efficiently
        </p>
      </div>
    </div>
    
    <p className="text-gray-600 leading-relaxed">
      Review booking requests, manage your calendar, communicate with customers, 
      and track all your appointments in one place.
    </p>
  </NeuCard>
);

interface BookingOverviewCardProps {
  overview: BookingOverview;
}

const BookingOverviewCard = ({ overview }: BookingOverviewCardProps) => (
  <NeuCard className="p-6">
    <h3 className="text-lg font-bold text-gray-800 mb-4">Booking Overview</h3>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <BookingStatItem
        label="Pending Requests"
        value={overview.pendingRequests.toString()}
        color="text-orange-600"
      />
      <BookingStatItem
        label="Today's Bookings"
        value={overview.todaysBookings.toString()}
        color="text-green-600"
      />
      <BookingStatItem
        label="Upcoming Bookings"
        value={overview.upcomingBookings.toString()}
        color="text-blue-600"
      />
      <BookingStatItem
        label="Total Bookings"
        value={overview.totalBookings.toString()}
        color="text-purple-600"
      />
    </div>
  </NeuCard>
);

interface BookingStatItemProps {
  label: string;
  value: string;
  color: string;
}

const BookingStatItem = ({ label, value, color }: BookingStatItemProps) => (
  <div className="text-center">
    <div className={`text-2xl font-bold ${color} mb-1`}>
      {value}
    </div>
    <div className="text-sm text-gray-600 leading-tight">
      {label}
    </div>
  </div>
);

interface QuickActionsSectionProps {
  pendingCount: number;
  onBookingRequestsClick: () => void;
  onAllBookingsClick: () => void;
  onCalendarViewClick: () => void;
}

const QuickActionsSection = ({
  pendingCount,
  onBookingRequestsClick,
  onAllBookingsClick,
  onCalendarViewClick
}: QuickActionsSectionProps) => (
  <div>
    <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <QuickActionCard
        title="Booking Requests"
        subtitle={`${pendingCount} pending`}
        icon={AlertCircle}
        color="text-orange-600 bg-orange-100"
        onClick={onBookingRequestsClick}
      />
      <QuickActionCard
        title="All Bookings"
        subtitle="View list"
        icon={List}
        color="text-blue-600 bg-blue-100"
        onClick={onAllBookingsClick}
      />
      <QuickActionCard
        title="Calendar View"
        subtitle="Daily view"
        icon={CalendarDays}
        color="text-green-600 bg-green-100"
        onClick={onCalendarViewClick}
      />
    </div>
  </div>
);

interface QuickActionCardProps {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  onClick: () => void;
}

const QuickActionCard = ({ title, subtitle, icon: Icon, color, onClick }: QuickActionCardProps) => (
  <button
    onClick={onClick}
    className="text-left w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl"
  >
    <NeuCard className="p-4 hover:scale-[1.02] transition-all duration-300 group">
      <div className="flex flex-col items-center text-center">
        <div className={`p-3 rounded-xl ${color} mb-3`}>
          <Icon size={24} />
        </div>
        <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
          {title}
        </h4>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
    </NeuCard>
  </button>
);

interface TodaysBookingsCardProps {
  bookings: Booking[];
}

const TodaysBookingsCard = ({ bookings }: TodaysBookingsCardProps) => (
  <NeuCard className="p-6">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-bold text-gray-800">Today's Schedule</h3>
      <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
        View All
      </button>
    </div>
    
    {bookings.length === 0 ? (
      <p className="text-gray-600 py-4">No bookings scheduled for today</p>
    ) : (
      <div className="space-y-3">
        {bookings.map((booking) => (
          <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
                <Clock size={16} className="text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800">
                  {formatTime12Hour(booking.requestedTime)} - {booking.serviceName}
                </div>
                <div className="text-sm text-gray-600">
                  {booking.customerName}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {booking.status === BookingStatus.ACCEPTED && (
                <CheckCircle size={16} className="text-green-500" />
              )}
              {booking.status === BookingStatus.PENDING && (
                <Clock size={16} className="text-orange-500" />
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </NeuCard>
);

interface WeeklyHighlightsCardProps {
  weeklyData: Record<string, number>;
}

const WeeklyHighlightsCard = ({ weeklyData }: WeeklyHighlightsCardProps) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const colors = [
    'text-green-600',   // Monday
    'text-blue-600',    // Tuesday  
    'text-orange-600',  // Wednesday
    'text-purple-600',  // Thursday
    'text-red-600',     // Friday
    'text-amber-600',   // Saturday
    'text-slate-600'    // Sunday
  ];

  return (
    <NeuCard className="p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">This Week's Highlights</h3>
      
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const count = weeklyData[day] || 0;
          return (
            <div key={day} className="text-center">
              <div className={`text-lg font-bold ${colors[index]} mb-1`}>
                {count}
              </div>
              <div className="text-xs text-gray-600">
                {day}
              </div>
            </div>
          );
        })}
      </div>
    </NeuCard>
  );
};

const formatTime12Hour = (time24: string): string => {
  try {
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  } catch {
    return time24;
  }
};
