'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye
} from 'lucide-react';

import { NeuButton, NeuCard } from '@/components/ui';
import { useAuthStore } from '@/lib/store/auth';
import { bookingRepository } from '@/lib/firebase/repositories';
import { Booking, BookingStatus } from '@/types';

export default function AllBookingsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const storeId = params.id as string;
  
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);

  // Filter options (matching Android pattern)
  const filterOptions = ['All', 'Today', 'This Week', 'This Month', 'Completed', 'Upcoming'];

  // Load all accepted bookings (following Android pattern exactly)
  useEffect(() => {
    if (!user) {
      setError("Please log in to view bookings");
      setIsLoading(false);
      return;
    }

    const loadAllBookings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🔍 Loading all bookings for shop:', storeId);
        
        // Get all bookings for specific shop (matching Android pattern)
        const shopBookings = await bookingRepository.getBookingsForShop(storeId);
        
        // Filter for ACCEPTED bookings only (matching Android)
        const acceptedBookings = shopBookings.filter(booking => 
          booking.status === BookingStatus.ACCEPTED
        );
        
        console.log('📋 Found accepted bookings:', acceptedBookings.length);
        setAllBookings(acceptedBookings);
        setFilteredBookings(acceptedBookings);
        
      } catch (err) {
        console.error('❌ Failed to load bookings:', err);
        setError(`Failed to load bookings: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setAllBookings([]);
        setFilteredBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllBookings();
  }, [user, storeId]);

  // Filter bookings based on selected filter and search (matching Android logic)
  useEffect(() => {
    let filtered = [...allBookings];
    
    // Apply filter
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    switch (selectedFilter) {
      case 'Today':
        filtered = filtered.filter(booking => booking.requestedDate === today);
        break;
      case 'This Week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        filtered = filtered.filter(booking => {
          const bookingDate = new Date(booking.requestedDate);
          return bookingDate >= weekStart && bookingDate <= weekEnd;
        });
        break;
      case 'This Month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        filtered = filtered.filter(booking => {
          const bookingDate = new Date(booking.requestedDate);
          return bookingDate >= monthStart && bookingDate <= monthEnd;
        });
        break;
      case 'Completed':
        filtered = filtered.filter(booking => booking.status === BookingStatus.COMPLETED);
        break;
      case 'Upcoming':
        filtered = filtered.filter(booking => {
          const bookingDate = new Date(booking.requestedDate);
          return bookingDate >= now;
        });
        break;
      // 'All' case - no additional filtering needed
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.customerName.toLowerCase().includes(query) ||
        booking.customerEmail.toLowerCase().includes(query) ||
        booking.serviceRequested?.toLowerCase().includes(query) ||
        booking.requestedDate.includes(query)
      );
    }
    
    // Sort by date and time (most recent first)
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.requestedDate} ${a.requestedTime}`);
      const dateB = new Date(`${b.requestedDate} ${b.requestedTime}`);
      return dateB.getTime() - dateA.getTime();
    });
    
    setFilteredBookings(filtered);
  }, [allBookings, selectedFilter, searchQuery]);

  const handleBack = () => {
    router.back();
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
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

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status: BookingStatus): string => {
    switch (status) {
      case BookingStatus.ACCEPTED:
        return 'bg-green-100 text-green-800';
      case BookingStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800';
      case BookingStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Authentication guard
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <NeuCard className="p-8 text-center max-w-md mx-auto">
          <AlertCircle className="mx-auto mb-4 text-yellow-500" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            Please log in to view bookings.
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
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">All Bookings</h1>
            <p className="text-gray-600 text-sm">
              Manage your accepted bookings
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Search and Filters */}
        <NeuCard className="p-4">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by customer name, email, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    selectedFilter === filter
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </NeuCard>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <NeuCard className="p-6 text-center">
            <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
            <p className="text-red-600 mb-4">{error}</p>
            <NeuButton onClick={() => window.location.reload()}>
              Retry
            </NeuButton>
          </NeuCard>
        )}

        {!isLoading && !error && filteredBookings.length === 0 && (
          <NeuCard className="p-8 text-center">
            <Calendar className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Bookings Found</h3>
            <p className="text-gray-600">
              {searchQuery || selectedFilter !== 'All' 
                ? 'Try adjusting your search or filter criteria'
                : 'No accepted bookings yet'
              }
            </p>
          </NeuCard>
        )}

        {!isLoading && !error && filteredBookings.length > 0 && (
          <>
            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {filteredBookings.length} of {allBookings.length} booking{allBookings.length !== 1 ? 's' : ''}
              </span>
              <span>
                Filter: {selectedFilter}
              </span>
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <NeuCard key={booking.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <User size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{booking.customerName}</h3>
                          <p className="text-sm text-gray-600">{booking.customerEmail}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-700">{formatDate(booking.requestedDate)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-700">{formatTime12Hour(booking.requestedTime)}</span>
                        </div>
                      </div>

                      {booking.serviceRequested && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                          <p className="text-sm font-medium text-gray-800">Service: {booking.serviceRequested}</p>
                        </div>
                      )}

                      <div className="flex items-center space-x-3">
                        <NeuButton
                          variant="default"
                          onClick={() => handleViewDetails(booking)}
                          className="px-4 py-2 text-sm"
                        >
                          <Eye size={16} className="mr-2" />
                          View Details
                        </NeuButton>
                      </div>
                    </div>

                    <div className="ml-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </NeuCard>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Booking Details Dialog */}
      {showBookingDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <NeuCard className="max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Booking Details</h3>
              <button
                onClick={() => setShowBookingDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Customer</label>
                  <p className="text-gray-800">{selectedBooking.customerName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-800">{selectedBooking.customerEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date</label>
                  <p className="text-gray-800">{formatDate(selectedBooking.requestedDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Time</label>
                  <p className="text-gray-800">{formatTime12Hour(selectedBooking.requestedTime)}</p>
                </div>
              </div>

              {selectedBooking.serviceRequested && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Service Requested</label>
                  <p className="text-gray-800">{selectedBooking.serviceRequested}</p>
                </div>
              )}

              {selectedBooking.additionalNotes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Additional Notes</label>
                  <p className="text-gray-800">{selectedBooking.additionalNotes}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(selectedBooking.status)}`}>
                  {selectedBooking.status.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <NeuButton
                variant="default"
                onClick={() => setShowBookingDetails(false)}
              >
                Close
              </NeuButton>
            </div>
          </NeuCard>
        </div>
      )}
    </div>
  );
}
