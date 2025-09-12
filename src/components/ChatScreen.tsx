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
  Smile
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import { messagingRepository } from '@/lib/firebase/repositories/messagingRepository';
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
  otherParticipantName,
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const formatMessageDate = (timestamp: number): string => {
    const date = new Date(timestamp);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackClick}
              className="neu-button p-2 mr-3"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </motion.button>
            
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full neu-button bg-gray-100 flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              
              <div>
                <h1 className="font-semibold text-gray-900">{otherParticipantName}</h1>
                {businessContext && (
                  <p className="text-sm text-gray-500">📍 {businessContext.shopName}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="neu-button p-2"
            >
              <Phone className="w-5 h-5 text-gray-600" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="neu-button p-2"
            >
              <Video className="w-5 h-5 text-gray-600" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="neu-button p-2"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {groupedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-full neu-button bg-gray-100 flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Start the conversation
            </h3>
            <p className="text-gray-500">
              Send a message to {otherParticipantName}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {groupedMessages.map((group, groupIndex) => (
              <div key={groupIndex}>
                {/* Date separator */}
                <div className="flex justify-center my-4">
                  <span className="px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded-full">
                    {group.date}
                  </span>
                </div>

                {/* Messages */}
                {group.messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwnMessage={message.senderId === user?.id}
                    showTime={true}
                  />
                ))}
              </div>
            ))}
          </AnimatePresence>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-end space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="neu-button p-2"
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </motion.button>

          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${otherParticipantName}...`}
              rows={1}
              className="w-full resize-none neu-input bg-gray-50 border-0 rounded-xl pr-12 min-h-[44px] max-h-[120px]"
            />
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 neu-button p-1"
            >
              <Smile className="w-4 h-4 text-gray-600" />
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className={`neu-button p-3 ${
              newMessage.trim() 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// Message Bubble Component
interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showTime: boolean;
}

function MessageBubble({ message, isOwnMessage, showTime }: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        <div
          className={`
            px-4 py-3 rounded-2xl
            ${isOwnMessage 
              ? 'bg-blue-600 text-white rounded-br-md' 
              : 'neu-card bg-white text-gray-900 rounded-bl-md'
            }
          `}
        >
          {/* Message content */}
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.text}
          </p>
          
          {/* Timestamp */}
          {showTime && (
            <p 
              className={`text-xs mt-1 ${
                isOwnMessage ? 'text-blue-100' : 'text-gray-500'
              }`}
            >
              {new Date(message.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}