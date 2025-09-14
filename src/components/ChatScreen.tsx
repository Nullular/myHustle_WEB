'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Send, 
  Image as ImageIcon,
  MoreVertical,
  User,
  Phone,
  Video,
  Info,
  Paperclip,
  Smile,
  Plus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import { messagingRepository } from '@/lib/firebase/repositories/messagingRepository';
import { getUserById } from '@/lib/firebase/repositories/userRepository';
import { 
  Message, 
  MessageType,
  MessageSubscription,
  SendMessageRequest 
} from '@/types/messaging';

interface ChatScreenProps {
  conversationId: string;
  otherParticipantId: string;
  otherParticipantName: string;
  businessContext?: {
    shopId: string;
    shopName: string;
    serviceId?: string;
    serviceName?: string;
  };
  onBackClick?: () => void;
}

export default function ChatScreen({ 
  conversationId, 
  otherParticipantId, 
  otherParticipantName: initialOtherParticipantName,
  businessContext,
  onBackClick 
}: ChatScreenProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otherParticipantName, setOtherParticipantName] = useState<string>(initialOtherParticipantName);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOtherParticipantName(initialOtherParticipantName);
  }, [initialOtherParticipantName]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages on mount
  useEffect(() => {
    if (!user || !conversationId) return;

    let subscription: MessageSubscription | null = null;

    const loadMessages = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Set up real-time listener for messages
        subscription = messagingRepository.subscribeToConversationMessages(
          conversationId,
          (updatedMessages) => {
            setMessages(updatedMessages);
            setIsLoading(false);
          }
        );

        // Mark conversation as read
        await messagingRepository.markConversationAsRead(conversationId, user.id);

      } catch (err: any) {
        console.error('❌ Error loading messages:', err);
        setError(err.message || 'Failed to load messages');
        setIsLoading(false);
      }
    };

    loadMessages();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [user, conversationId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || isSending) return;

    try {
      setIsSending(true);
      
      const messageData: SendMessageRequest = {
        conversationId,
        senderId: user.id,
        senderName: user.displayName || user.email || 'Unknown User',
        senderEmail: user.email || '',
        text: newMessage.trim(),
        type: MessageType.TEXT
      };

      await messagingRepository.sendMessage(messageData);
      setNewMessage('');
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  const formatMessageTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatMessageDate = (timestamp: any): string => {
    // Handle both Firestore Timestamp and number timestamp formats
    let date: Date;
    if (!timestamp) {
      date = new Date();
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else if (timestamp.toDate) {
      // Firestore Timestamp
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      // Firestore Timestamp object format
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Group messages by date for display
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';

    messages.forEach((message) => {
      const messageDate = formatMessageDate(message.timestamp);
      
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        groups.push({ date: messageDate, messages: [] });
      }
      
      groups[groups.length - 1].messages.push(message);
    });

    return groups;
  }, [messages]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      {/* Android-style App Bar */}
      <div className="bg-blue-600 text-white shadow-md">
        <div className="flex items-center px-4 py-3 status-bar-height">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleBackClick}
            className="p-2 -ml-2 mr-2 rounded-full hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          
          <div className="flex items-center flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-blue-500 border-2 border-blue-300 flex items-center justify-center mr-3">
              <User className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="font-medium text-white text-base truncate">{otherParticipantName}</h1>
              {businessContext && (
                <p className="text-blue-100 text-xs truncate">📍 {businessContext.shopName}</p>
              )}
              <p className="text-blue-200 text-xs">Online now</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full hover:bg-blue-700 transition-colors"
            >
              <Phone className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full hover:bg-blue-700 transition-colors"
            >
              <Video className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full hover:bg-blue-700 transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Messages Area - Android RecyclerView style */}
      <div className="flex-1 overflow-y-auto android-chat-background">
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {groupedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-6">
              <User className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Start the conversation
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Send a message to {otherParticipantName} to get the conversation started!
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <AnimatePresence>
              {groupedMessages.map((group, groupIndex) => (
                <div key={groupIndex}>
                  {/* Date separator - Android style */}
                  <div className="flex justify-center my-6">
                    <div className="bg-gray-200 px-4 py-1 rounded-full shadow-sm">
                      <span className="text-gray-600 text-xs font-medium">{group.date}</span>
                    </div>
                  </div>

                  {/* Messages */}
                  {group.messages.map((message, messageIndex) => (
                    <AndroidMessageBubble
                      key={message.id || `message-${groupIndex}-${messageIndex}`}
                      message={message}
                      isOwnMessage={message.senderId === user?.id}
                      showTime={true}
                    />
                  ))}
                </div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Android-style Input Area */}
      <div className="bg-white border-t border-gray-200 safe-area-padding-bottom">
        <div className="flex items-end px-4 py-3 space-x-3">
          {/* Attachment Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-5 h-5 text-gray-600" />
          </motion.button>

          {/* Input Field with Neumorphic styling */}
          <div className="flex-1 relative">
            <div className="neu-inset rounded-full px-4 py-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${otherParticipantName}...`}
                className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 py-2"
                disabled={isSending}
              />
            </div>
            
            {/* Emoji Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              <Smile className="w-5 h-5 text-gray-500" />
            </motion.button>
          </div>

          {/* Send Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className={`p-3 rounded-full transition-all ${
              newMessage.trim() 
                ? 'bg-blue-600 hover:bg-blue-700 shadow-lg' 
                : 'bg-gray-200'
            }`}
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin text-white" />
            ) : (
              <Send className={`w-5 h-5 ${newMessage.trim() ? 'text-white' : 'text-gray-400'}`} />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// Android-style Message Bubble Component
interface AndroidMessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showTime: boolean;
}

function AndroidMessageBubble({ message, isOwnMessage, showTime }: AndroidMessageBubbleProps) {
  // Helper function to format timestamp
  const formatTimestamp = (timestamp: any): string => {
    let date: Date;
    if (!timestamp) {
      date = new Date();
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else if (timestamp.toDate) {
      // Firestore Timestamp
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      // Firestore Timestamp object format
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-1`}
    >
      <div className={`max-w-[85%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        <div
          className={`
            px-4 py-2 shadow-sm
            ${isOwnMessage 
              ? 'bg-blue-600 text-white rounded-3xl rounded-br-lg ml-12' 
              : 'bg-white text-gray-900 rounded-3xl rounded-bl-lg mr-12 border border-gray-100'
            }
          `}
        >
          {/* Message content */}
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.text || message.content || 'No message content'}
          </p>
          
          {/* Timestamp - Android style */}
          {showTime && (
            <p 
              className={`text-xs mt-1 text-right ${
                isOwnMessage ? 'text-blue-100' : 'text-gray-400'
              }`}
            >
              {formatTimestamp(message.timestamp)}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}