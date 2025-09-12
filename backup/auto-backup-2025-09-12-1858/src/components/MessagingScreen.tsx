'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  ArrowLeft, 
  Search, 
  Send,
  MoreVertical,
  User,
  Clock,
  CheckCheck,
  Plus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import { messagingRepository } from '@/lib/firebase/repositories/messagingRepository';
import { 
  Conversation, 
  MessagePreview,
  ConversationSubscription 
} from '@/types/messaging';

interface MessagingScreenProps {
  onStartNewChat?: () => void;
  onBackClick?: () => void;
}

export default function MessagingScreen({ onStartNewChat, onBackClick }: MessagingScreenProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to format timestamps
  const formatTimestamp = (timestamp: number): string => {
    if (!timestamp) return '';
    
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffTime = Math.abs(now.getTime() - messageDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Today: show time
      return messageDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Convert conversations to message previews
  const messagePreviews = useMemo(() => {
    if (!user || !conversations.length) {
      console.log('📝 No conversations to convert to previews - user:', !!user, 'conversations:', conversations.length);
      return [];
    }

    console.log('🔄 Converting conversations to message previews, currentUserId:', user.id);

    return conversations
      .filter(conv => conv.active && !conv.archived) // Match your database fields
      .map(conversation => {
        // Find the other participant
        const otherParticipantId = conversation.participants.find(id => id !== user.id);
        if (!otherParticipantId) return null;

        const otherParticipant = conversation.participantInfo[otherParticipantId];
        if (!otherParticipant) return null;

        return {
          conversationId: conversation.id,
          otherParticipantId,
          otherParticipantName: otherParticipant.displayName || 'Unknown User',
          otherParticipantEmail: otherParticipant.email || '',
          otherParticipantAvatar: otherParticipant.photoUrl,
          lastMessage: conversation.lastMessage.content || 'No messages yet',
          timestamp: formatTimestamp(conversation.lastMessage.timestamp?.toMillis?.() || Date.now()),
          unreadCount: conversation.unreadCount[user.id] || 0,
          businessContext: conversation.shopId ? {
            shopId: conversation.shopId,
            shopName: conversation.title || 'Business Chat'
          } : undefined
        } as MessagePreview;
      })
      .filter(preview => preview !== null) as MessagePreview[];
  }, [conversations, user]);

  // Filter previews based on search
  const filteredPreviews = useMemo(() => {
    if (!searchQuery.trim()) return messagePreviews;
    
    const query = searchQuery.toLowerCase();
    return messagePreviews.filter(preview => 
      preview.otherParticipantName.toLowerCase().includes(query) ||
      preview.lastMessage.toLowerCase().includes(query) ||
      preview.businessContext?.shopName?.toLowerCase().includes(query)
    );
  }, [messagePreviews, searchQuery]);

  // Load conversations on mount - matches Android MessageRepository.startConversationsListener()
  useEffect(() => {
    // Match Android: val currentUserId = FirebaseAuth.getInstance().currentUser?.uid ?: return
    if (!user) {
      console.log('❌ No authenticated user, redirecting to login');
      router.push('/login');
      return;
    }

    console.log('✅ Starting conversations listener for user:', user.id);
    let subscription: ConversationSubscription | null = null;

    const loadConversations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Set up real-time listener - matches Android addSnapshotListener
        subscription = messagingRepository.subscribeToUserConversations(
          user.id,
          (updatedConversations) => {
            console.log('📦 Conversations updated:', updatedConversations.length, 'conversations');
            setConversations(updatedConversations);
            setIsLoading(false);
          }
        );

      } catch (err: any) {
        console.error('❌ Error loading conversations:', err);
        setError(err.message || 'Failed to load conversations');
        setIsLoading(false);
      }
    };

    loadConversations();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [user, router]);

  const handleConversationClick = async (preview: MessagePreview) => {
    try {
      if (!user) return;
      
      // Mark as read
      await messagingRepository.markConversationAsRead(preview.conversationId, user.id);
      
      // Navigate to chat screen
      router.push(`/chat/${preview.conversationId}?participantId=${preview.otherParticipantId}&participantName=${encodeURIComponent(preview.otherParticipantName)}`);
    } catch (error) {
      console.error('❌ Error opening conversation:', error);
    }
  };

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  const handleStartNewChat = () => {
    if (onStartNewChat) {
      onStartNewChat();
    } else {
      router.push('/chat/new');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackClick}
              className="neu-button p-2 mr-3"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </motion.button>
            
            <div>
              <h1 className="text-xl font-bold text-gray-900">Messages</h1>
              <p className="text-sm text-gray-500">
                {filteredPreviews.length} conversation{filteredPreviews.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartNewChat}
            className="neu-button p-2"
          >
            <Plus className="w-5 h-5 text-blue-600" />
          </motion.button>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 neu-input bg-gray-50 border-0 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {filteredPreviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Start a conversation with a business or customer'
              }
            </p>
            {!searchQuery && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartNewChat}
                className="neu-button px-6 py-3 bg-blue-600 text-white rounded-xl"
              >
                Start New Chat
              </motion.button>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-2">
            <AnimatePresence>
              {filteredPreviews.map((preview) => (
                <ConversationCard
                  key={preview.conversationId}
                  preview={preview}
                  onClick={() => handleConversationClick(preview)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// Conversation Card Component
interface ConversationCardProps {
  preview: MessagePreview;
  onClick: () => void;
}

function ConversationCard({ preview, onClick }: ConversationCardProps) {
  const hasUnread = preview.unreadCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        neu-card p-4 cursor-pointer transition-all duration-200
        ${hasUnread ? 'bg-blue-50 border-blue-200' : 'bg-white'}
      `}
    >
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full neu-button bg-gray-100 flex items-center justify-center">
            {preview.otherParticipantAvatar ? (
              <img
                src={preview.otherParticipantAvatar}
                alt={preview.otherParticipantName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-gray-500" />
            )}
          </div>
          
          {/* Unread indicator */}
          {hasUnread && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">
                {preview.unreadCount > 9 ? '9+' : preview.unreadCount}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-medium truncate ${hasUnread ? 'text-blue-900' : 'text-gray-900'}`}>
              {preview.otherParticipantName}
            </h3>
            <span className="text-xs text-gray-500 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {preview.timestamp}
            </span>
          </div>

          {/* Business context */}
          {preview.businessContext && (
            <p className="text-xs text-gray-500 mb-1">
              📍 {preview.businessContext.shopName}
            </p>
          )}

          {/* Last message */}
          <p className={`text-sm truncate ${hasUnread ? 'text-blue-700 font-medium' : 'text-gray-600'}`}>
            {preview.lastMessage}
          </p>
        </div>

        {/* Message status (if sent by current user) */}
        <div className="flex items-center">
          <CheckCheck className={`w-4 h-4 ${hasUnread ? 'text-gray-400' : 'text-blue-500'}`} />
        </div>
      </div>
    </motion.div>
  );
}