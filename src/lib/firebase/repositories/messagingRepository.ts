import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  limit,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../config';
import { 
  Conversation, 
  Message, 
  SendMessageRequest, 
  CreateConversationRequest,
  MessageType,
  MessageSubscription,
  ConversationSubscription 
} from '@/types/messaging';

class MessagingRepository {
  private conversationsCollection = collection(db, 'conversations');
  private messagesCollection = collection(db, 'messages');

  /**
   * Get conversations for a specific user
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      console.log('🔍 Fetching conversations for user:', userId);
      
      const q = query(
        this.conversationsCollection,
        where('participants', 'array-contains', userId),
        orderBy('lastMessageTimestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Conversation));
      
      console.log(`✅ Found ${conversations.length} conversations for user ${userId}`);
      return conversations;
    } catch (error) {
      console.error('❌ Error getting user conversations:', error);
      return [];
    }
  }

  /**
   * Get messages for a specific conversation
   */
  async getConversationMessages(conversationId: string, limitCount: number = 50): Promise<Message[]> {
    try {
      console.log('🔍 Fetching messages for conversation:', conversationId);
      
      const q = query(
        this.messagesCollection,
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      
      // Return in chronological order (oldest first)
      const sortedMessages = messages.reverse();
      
      console.log(`✅ Found ${messages.length} messages for conversation ${conversationId}`);
      return sortedMessages;
    } catch (error) {
      console.error('❌ Error getting conversation messages:', error);
      return [];
    }
  }

  /**
   * Send a message
   */
  async sendMessage(messageData: SendMessageRequest): Promise<string> {
    try {
      console.log('📤 Sending message:', messageData);
      
      const batch = writeBatch(db);
      
      // Add message
      const messageRef = doc(this.messagesCollection);
      const message = {
        ...messageData,
        timestamp: Date.now(),
        readBy: { [messageData.senderId]: true } // Sender has read the message
      };
      
      batch.set(messageRef, message);
      
      // Update conversation
      const conversationRef = doc(this.conversationsCollection, messageData.conversationId);
      const conversationUpdate = {
        lastMessage: messageData.text,
        lastMessageTimestamp: Date.now(),
        lastMessageSenderId: messageData.senderId,
        updatedAt: Date.now()
      };
      
      batch.update(conversationRef, conversationUpdate);
      
      await batch.commit();
      
      console.log('✅ Message sent successfully:', messageRef.id);
      return messageRef.id;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  /**
   * Create a new conversation
   */
  async createConversation(conversationData: CreateConversationRequest): Promise<string> {
    try {
      console.log('💬 Creating new conversation:', conversationData);
      
      // Check if conversation already exists between these participants
      const existingConversation = await this.findExistingConversation(conversationData.participants);
      
      if (existingConversation) {
        console.log('✅ Using existing conversation:', existingConversation.id);
        
        // Send the initial message to existing conversation
        if (conversationData.initialMessage) {
          await this.sendMessage({
            conversationId: existingConversation.id,
            senderId: conversationData.participants[0], // Assume first participant is sender
            senderName: conversationData.participantNames[conversationData.participants[0]],
            senderEmail: conversationData.participantEmails[conversationData.participants[0]],
            text: conversationData.initialMessage,
            type: MessageType.TEXT
          });
        }
        
        return existingConversation.id;
      }
      
      // Create new conversation
      const conversationRef = doc(this.conversationsCollection);
      const conversation: Omit<Conversation, 'id'> = {
        participants: conversationData.participants,
        participantNames: conversationData.participantNames,
        participantEmails: conversationData.participantEmails,
        participantAvatars: {},
        lastMessage: conversationData.initialMessage,
        lastMessageTimestamp: Date.now(),
        lastMessageSenderId: conversationData.participants[0],
        unreadCount: conversationData.participants.reduce((acc, participantId) => {
          acc[participantId] = participantId === conversationData.participants[0] ? 0 : 1;
          return acc;
        }, {} as Record<string, number>),
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        businessContext: conversationData.businessContext
      };
      
      await addDoc(this.conversationsCollection, conversation);
      
      // Send initial message if provided
      if (conversationData.initialMessage) {
        await this.sendMessage({
          conversationId: conversationRef.id,
          senderId: conversationData.participants[0],
          senderName: conversationData.participantNames[conversationData.participants[0]],
          senderEmail: conversationData.participantEmails[conversationData.participants[0]],
          text: conversationData.initialMessage,
          type: MessageType.TEXT
        });
      }
      
      console.log('✅ Conversation created successfully:', conversationRef.id);
      return conversationRef.id;
    } catch (error) {
      console.error('❌ Error creating conversation:', error);
      throw error;
    }
  }

  /**
   * Find existing conversation between participants
   */
  private async findExistingConversation(participants: string[]): Promise<Conversation | null> {
    try {
      // For two participants, find conversation containing both
      if (participants.length === 2) {
        const q = query(
          this.conversationsCollection,
          where('participants', 'array-contains', participants[0])
        );
        
        const snapshot = await getDocs(q);
        
        for (const docSnapshot of snapshot.docs) {
          const conversation = { id: docSnapshot.id, ...docSnapshot.data() } as Conversation;
          if (conversation.participants.includes(participants[1]) && 
              conversation.participants.length === 2) {
            return conversation;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error finding existing conversation:', error);
      return null;
    }
  }

  /**
   * Mark conversation as read for a user
   */
  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      console.log('👁️ Marking conversation as read:', conversationId, 'for user:', userId);
      
      const conversationRef = doc(this.conversationsCollection, conversationId);
      
      await updateDoc(conversationRef, {
        [`unreadCount.${userId}`]: 0,
        updatedAt: Date.now()
      });
      
      console.log('✅ Conversation marked as read');
    } catch (error) {
      console.error('❌ Error marking conversation as read:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time conversation updates for a user
   */
  subscribeToUserConversations(
    userId: string, 
    callback: (conversations: Conversation[]) => void
  ): ConversationSubscription {
    console.log('🔔 Setting up real-time conversation listener for user:', userId);
    
    const q = query(
      this.conversationsCollection,
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTimestamp', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Conversation));
      
      console.log(`🔔 Real-time update: ${conversations.length} conversations`);
      callback(conversations);
    }, (error) => {
      console.error('❌ Error in conversation listener:', error);
      callback([]);
    });
    
    return { unsubscribe };
  }

  /**
   * Subscribe to real-time message updates for a conversation
   */
  subscribeToConversationMessages(
    conversationId: string,
    callback: (messages: Message[]) => void,
    limitCount: number = 50
  ): MessageSubscription {
    console.log('🔔 Setting up real-time message listener for conversation:', conversationId);
    
    const q = query(
      this.messagesCollection,
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      
      // Return in chronological order (oldest first)
      const sortedMessages = messages.reverse();
      
      console.log(`🔔 Real-time update: ${messages.length} messages`);
      callback(sortedMessages);
    }, (error) => {
      console.error('❌ Error in message listener:', error);
      callback([]);
    });
    
    return { unsubscribe };
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting conversation:', conversationId);
      
      // Note: In production, you might want to just mark as deleted
      // rather than actually deleting the data
      const conversationRef = doc(this.conversationsCollection, conversationId);
      await updateDoc(conversationRef, {
        isActive: false,
        updatedAt: Date.now()
      });
      
      console.log('✅ Conversation marked as inactive');
    } catch (error) {
      console.error('❌ Error deleting conversation:', error);
      throw error;
    }
  }
}

export const messagingRepository = new MessagingRepository();