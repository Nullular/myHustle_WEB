'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  User, 
  MessageCircle,
  Store
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import { messagingRepository } from '@/lib/firebase/repositories/messagingRepository';
import { CreateConversationRequest, MessageType } from '@/types/messaging';

// Mock data - in real app, this would come from user/shop search API
interface SearchResult {
  id: string;
  name: string;
  email: string;
  type: 'user' | 'shop';
  avatar?: string;
  shopName?: string;
}

export default function NewChatPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Mock search function - replace with actual API call
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Mock delay and results
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
          type: 'user'
        },
        {
          id: 'shop1',
          name: 'Coffee Shop',
          email: 'contact@coffeeshop.com',
          type: 'shop',
          shopName: 'Best Coffee in Town'
        }
      ].filter(result => 
        result.name.toLowerCase().includes(query.toLowerCase()) ||
        result.email.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 500);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleStartConversation = async (result: SearchResult) => {
    if (!user || isCreating) return;

    try {
      setIsCreating(true);

      const conversationData: CreateConversationRequest = {
        participants: [user.id, result.id],
        participantNames: {
          [user.id]: user.displayName || user.email || 'Unknown User',
          [result.id]: result.name
        },
        participantEmails: {
          [user.id]: user.email || '',
          [result.id]: result.email
        },
        initialMessage: 'Hello! 👋',
        businessContext: result.type === 'shop' && result.shopName ? {
          shopId: result.id,
          shopName: result.shopName
        } : undefined
      };

      const conversationId = await messagingRepository.createConversation(conversationData);
      
      // Navigate to the new conversation
      router.push(
        `/chat/${conversationId}?participantId=${result.id}&participantName=${encodeURIComponent(result.name)}`
      );

    } catch (error) {
      console.error('❌ Error creating conversation:', error);
      alert('Failed to start conversation. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center flex-1 min-w-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackClick}
              className="neu-button p-1.5 sm:p-2 mr-2 sm:mr-3 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            </motion.button>
            
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">New Chat</h1>
              <p className="text-xs sm:text-sm text-gray-500 truncate">Search for people or businesses</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-2 neu-input bg-gray-50 border-0 rounded-xl text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        {isSearching ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 text-sm sm:text-base">Searching...</span>
          </div>
        ) : searchQuery && searchResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <Search className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-sm sm:text-base text-gray-500">Try searching with a different name or email</p>
          </div>
        ) : !searchQuery ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Start a new conversation</h3>
            <p className="text-sm sm:text-base text-gray-500">Search for people or businesses to chat with</p>
          </div>
        ) : (
          <div className="space-y-2">
            {searchResults.map((result) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStartConversation(result)}
                className="neu-card p-3 sm:p-4 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full neu-button bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {result.avatar ? (
                      <img
                        src={result.avatar}
                        alt={result.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : result.type === 'shop' ? (
                      <Store className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                    ) : (
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                        {result.name}
                      </h3>
                      <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs rounded-full ${
                        result.type === 'shop' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {result.type === 'shop' ? 'Business' : 'User'}
                      </span>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      {result.email}
                    </p>
                    
                    {result.shopName && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        📍 {result.shopName}
                      </p>
                    )}
                  </div>

                  {/* Chat icon */}
                  <div className="flex items-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 flex items-center space-x-3 max-w-sm w-full">
            <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700 text-sm sm:text-base">Starting conversation...</span>
          </div>
        </div>
      )}
    </div>
  );
}