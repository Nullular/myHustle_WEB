// Messaging types for the MyHustle web application

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  text: string;
  timestamp: number;
  readBy: Record<string, boolean>;
  type: MessageType;
  attachments?: MessageAttachment[];
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  BOOKING_REQUEST = 'BOOKING_REQUEST',
  BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION',
  SYSTEM = 'SYSTEM'
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  name: string;
  size: number;
}

export interface Conversation {
  id: string;
  participants: string[]; // User IDs
  participantNames: Record<string, string>;
  participantEmails: Record<string, string>;
  participantAvatars: Record<string, string>;
  lastMessage: string;
  lastMessageTimestamp: number;
  lastMessageSenderId: string;
  unreadCount: Record<string, number>; // Per participant
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  businessContext?: {
    shopId: string;
    shopName: string;
    serviceId?: string;
    serviceName?: string;
  };
}

export interface MessagePreview {
  conversationId: string;
  otherParticipantId: string;
  otherParticipantName: string;
  otherParticipantEmail: string;
  otherParticipantAvatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline?: boolean;
  businessContext?: {
    shopId: string;
    shopName: string;
  };
}

export interface MessagingScreenProps {
  userId: string;
  userType: 'customer' | 'business_owner';
}

export interface ChatScreenProps {
  conversationId: string;
  otherParticipantId: string;
  otherParticipantName: string;
  businessContext?: {
    shopId: string;
    shopName: string;
    serviceId?: string;
    serviceName?: string;
  };
}

// Form types for sending messages
export interface SendMessageRequest {
  conversationId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  text: string;
  type: MessageType;
  attachments?: MessageAttachment[];
}

export interface CreateConversationRequest {
  participants: string[];
  participantNames: Record<string, string>;
  participantEmails: Record<string, string>;
  initialMessage: string;
  businessContext?: {
    shopId: string;
    shopName: string;
    serviceId?: string;
    serviceName?: string;
  };
}

// Real-time subscription types
export interface MessageSubscription {
  unsubscribe: () => void;
}

export interface ConversationSubscription {
  unsubscribe: () => void;
}