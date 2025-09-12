'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone
} from 'lucide-react';

import { NeuButton, NeuCard } from '@/components/ui';
import { useAuthStore } from '@/lib/store/auth';
import { bookingRepository } from '@/lib/firebase/repositories';
import { Booking, BookingStatus } from '@/types';

export default function BookingRequestsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const storeId = params.id as string;
  
  const [bookingRequests, setBookingRequests] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Booking | null>(null);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'deny'>('accept');

  // Load booking requests (following Android pattern exactly)
  useEffect(() => {
    if (!user) {
      setError("Please log in to view booking requests");
      setIsLoading(false);
      return;
    }

    const loadBookingRequests = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🔍 Loading booking requests for shop:', storeId);
        
        // Get bookings for specific shop (matching Android pattern)
        const allBookings = await bookingRepository.getBookingsForShop(storeId);
        
        // Filter for PENDING requests only
        const pendingRequests = allBookings.filter(booking => 
          booking.status === BookingStatus.PENDING
        );
        
        console.log('📋 Found pending requests:', pendingRequests.length);
        setBookingRequests(pendingRequests);
        
      } catch (err) {
        console.error('❌ Failed to load booking requests:', err);
        setError(`Failed to load booking requests: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setBookingRequests([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookingRequests();
  }, [user, storeId]);

  const handleBack = () => {
    router.back();
  };

  const handleAcceptRequest = (request: Booking) => {
    setSelectedRequest(request);
    setActionType('accept');
    setShowResponseDialog(true);
  };

  const handleDenyRequest = (request: Booking) => {
    setSelectedRequest(request);
    setActionType('deny');
    setShowResponseDialog(true);
  };

  const confirmResponse = async () => {
    if (!selectedRequest) return;
    
    try {
      setIsUpdating(true);
      
      const newStatus = actionType === 'accept' ? BookingStatus.ACCEPTED : BookingStatus.DENIED;
      
      console.log(`🔄 ${actionType === 'accept' ? 'Accepting' : 'Denying'} booking`);
      console.log('🔍 Full selected request object:', selectedRequest);
      console.log('🔍 Object keys:', Object.keys(selectedRequest));
      console.log('🔍 Booking ID from selectedRequest.id:', selectedRequest.id);
      console.log('🔍 Booking ID type:', typeof selectedRequest.id);
      console.log('🔍 Booking ID length:', selectedRequest.id?.length);
      console.log('🔍 All properties:', {
        id: selectedRequest.id,
        customerId: selectedRequest.customerId,
        customerName: selectedRequest.customerName,
        shopId: selectedRequest.shopId
      });
      
      if (!selectedRequest.id) {
        console.error('❌ selectedRequest.id is:', selectedRequest.id);
        throw new Error('No booking ID found in selected request');
      }
      
      await bookingRepository.updateBookingStatus(selectedRequest.id, newStatus);
      
      // Remove from requests list
      setBookingRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
      
      // Show success message
      setSuccessMessage(`Booking ${actionType === 'accept' ? 'accepted' : 'denied'} successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      
      console.log(`✅ Booking ${actionType === 'accept' ? 'accepted' : 'denied'} successfully`);
      
    } catch (err) {
      console.error(`❌ Failed to ${actionType} booking:`, err);
      setError(`Failed to ${actionType} booking. Please try again.`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsUpdating(false);
      setShowResponseDialog(false);
      setSelectedRequest(null);
    }
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

  // Authentication guard
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <NeuCard className="p-8 text-center max-w-md mx-auto">
          <AlertCircle className="mx-auto mb-4 text-yellow-500" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            Please log in to view booking requests.
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
            <h1 className="text-2xl font-bold text-gray-800">Booking Requests</h1>
            <p className="text-gray-600 text-sm">
              Pending requests need your response
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Success Message */}
        {successMessage && (
          <NeuCard className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-600" size={20} />
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          </NeuCard>
        )}

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

        {!isLoading && !error && bookingRequests.length === 0 && (
          <NeuCard className="p-8 text-center">
            <Calendar className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Pending Requests</h3>
            <p className="text-gray-600">
              All booking requests will appear here
            </p>
          </NeuCard>
        )}

        {!isLoading && !error && bookingRequests.length > 0 && (
          <>
            {/* Header Card */}
            <NeuCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Pending Requests</h2>
                  <p className="text-gray-600">{bookingRequests.length} request{bookingRequests.length !== 1 ? 's' : ''} waiting</p>
                </div>
                <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-medium">
                  {bookingRequests.length}
                </div>
              </div>
            </NeuCard>

            {/* Booking Requests List */}
            <div className="space-y-4">
              {bookingRequests.map((request) => (
                <NeuCard key={request.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <User size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{request.customerName}</h3>
                          <p className="text-sm text-gray-600">{request.customerEmail}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-700">{request.requestedDate}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-700">{formatTime12Hour(request.requestedTime)}</span>
                        </div>
                      </div>

                      {request.serviceName && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                          <p className="text-sm font-medium text-gray-800">Service: {request.serviceName}</p>
                          {request.notes && (
                            <p className="text-sm text-gray-600 mt-1">Notes: {request.notes}</p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center space-x-3">
                        <NeuButton
                          variant="default"
                          onClick={() => handleAcceptRequest(request)}
                          className="px-6 py-2 text-sm bg-green-500 text-white hover:bg-green-600"
                        >
                          <CheckCircle size={16} className="mr-2" />
                          Accept
                        </NeuButton>
                        <NeuButton
                          variant="default"
                          onClick={() => handleDenyRequest(request)}
                          className="px-6 py-2 text-sm bg-red-500 text-white hover:bg-red-600"
                        >
                          <XCircle size={16} className="mr-2" />
                          Deny
                        </NeuButton>
                        <NeuButton
                          variant="default"
                          className="px-4 py-2 text-sm"
                        >
                          <MessageCircle size={16} className="mr-2" />
                          Message
                        </NeuButton>
                      </div>
                    </div>

                    <div className="ml-4">
                      <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
                        PENDING
                      </div>
                    </div>
                  </div>
                </NeuCard>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Response Dialog */}
      {showResponseDialog && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <NeuCard className="max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {actionType === 'accept' ? 'Accept' : 'Deny'} Booking Request
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {actionType} {selectedRequest.customerName}'s booking request for {selectedRequest.requestedDate} at {formatTime12Hour(selectedRequest.requestedTime)}?
            </p>
            <div className="flex space-x-3">
              <NeuButton
                variant="default"
                onClick={confirmResponse}
                disabled={isUpdating}
                className={`flex-1 ${
                  actionType === 'accept' 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {isUpdating ? 'Processing...' : actionType === 'accept' ? 'Accept' : 'Deny'}
              </NeuButton>
              <NeuButton
                variant="default"
                onClick={() => setShowResponseDialog(false)}
                disabled={isUpdating}
              >
                Cancel
              </NeuButton>
            </div>
          </NeuCard>
        </div>
      )}
    </div>
  );
}
