import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  onSnapshot,
  doc,
  getDoc,
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
  private conversationsCollection = collection(db, 'chats'); // Changed from 'conversations' to 'chats'

  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const docRef = doc(this.conversationsCollection, conversationId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Conversation;
      } else {
        console.error(`No such conversation document: ${conversationId}`);
        return null;
      }
    } catch (error) {
      console.error("Error getting conversation:", error);
      return null;
    }
  }

  /**
   * Get conversations for a specific user
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      console.log('🔍 Fetching conversations for user:', userId);
      
      // Following Android pattern: only filter by participants, sort in memory to avoid composite index
      const q = query(
        this.conversationsCollection,
        where('participants', 'array-contains', userId)
      );
      
      const snapshot = await getDocs(q);
      
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Conversation));
      
      // Sort by lastMessage timestamp in memory (Android pattern)
      const sortedConversations = conversations.sort((a, b) => {
        const timeA = a.lastMessage?.timestamp || a.updatedAt || 0;
        const timeB = b.lastMessage?.timestamp || b.updatedAt || 0;
        return timeB - timeA; // Descending order (newest first)
      });
      
      console.log(`✅ Found ${sortedConversations.length} conversations for user ${userId}`);
      return sortedConversations;
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
      
      // Messages are in subcollection: /chats/{chatId}/messages
      const messagesCollection = collection(db, 'chats', conversationId, 'messages');
      
      // Avoid composite index by not using orderBy - sort in memory like Android
      const q = query(
        messagesCollection,
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));

      // Sort by timestamp in memory (Android pattern)
      const sortedMessages = messages.sort((a, b) => {
        // Handle both Firestore Timestamp and number timestamp formats
        const getTime = (timestamp: any) => {
          if (!timestamp) return 0;
          if (typeof timestamp === 'number') return timestamp;
          if (timestamp.toMillis) return timestamp.toMillis();
          if (timestamp.seconds) return timestamp.seconds * 1000;
          return 0;
        };
        
        const timeA = getTime(a.timestamp);
        const timeB = getTime(b.timestamp);
        return timeA - timeB; // Ascending order (oldest first)
      });
      
      console.log(`✅ Found ${sortedMessages.length} messages for conversation ${conversationId}`);
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
      console.log('🔍 Conversation ID:', messageData.conversationId);
      console.log('🔍 Conversation ID type:', typeof messageData.conversationId);
      console.log('🔍 Conversation ID length:', messageData.conversationId?.length);
      
      if (!messageData.conversationId || messageData.conversationId.trim() === '') {
        throw new Error('Conversation ID is required and cannot be empty');
      }
      
      const batch = writeBatch(db);
      
      // Add message to subcollection
      const messagesRef = collection(db, 'chats', messageData.conversationId, 'messages');
      const messageRef = doc(messagesRef);
      const message = {
        ...messageData,
        timestamp: Date.now(),
        readBy: { [messageData.senderId]: true } // Sender has read the message
      };
      
      batch.set(messageRef, message);
      
      // Update conversation in main chats collection
      const conversationRef = doc(db, 'chats', messageData.conversationId);
      const conversationUpdate = {
        lastMessage: {
          content: messageData.text,
          senderId: messageData.senderId,
          senderName: messageData.senderName || 'User',
          timestamp: Date.now(),
          messageType: messageData.type || MessageType.TEXT,
          deleted: false
        },
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
    console.log('[DEEP_DEBUG] Entry: createConversation');
    try {
      const participantEmails = conversationData.participants
        .map(id => conversationData.participantEmails[id])
        .sort();

      const existingConversation = await this.findExistingConversationByEmails(participantEmails);
      
      if (existingConversation && existingConversation.id) {
        console.log(`[DEEP_DEBUG] Success: Found existing conversation. Returning ID: ${existingConversation.id}`);
        return existingConversation.id;
      }
      
      console.log('[DEEP_DEBUG] Info: No existing conversation found. Proceeding to create a new one.');
      
      const conversation: Omit<Conversation, 'id'> = {
        participants: conversationData.participants,
        participantEmails: participantEmails,
        participantInfo: conversationData.participants.reduce((acc, participantId, index) => {
          const email = conversationData.participantEmails?.[participantId] || '';
          acc[participantId] = {
            displayName: email, // Use email as the primary display name
            email: email,
            userId: participantId,
            photoUrl: null,
            role: 'member',
            joinedAt: Date.now(),
            lastSeen: Date.now()
          };
          return acc;
        }, {} as Record<string, any>),
        lastMessage: {
          content: conversationData.initialMessage || '',
          senderId: conversationData.participants[0],
          senderName: conversationData.participantEmails?.[conversationData.participants[0]] || 'User', // Default to email
          timestamp: Date.now(),
          messageType: 'text',
          deleted: false
        },
        unreadCount: conversationData.participants.reduce((acc, participantId) => {
          acc[participantId] = participantId === conversationData.participants[0] ? 0 : 1;
          return acc;
        }, {} as Record<string, number>),
        active: true,
        archived: false,
        type: 'DIRECT',
        contextType: 'GENERAL',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: conversationData.participants[0],
        title: null,
        description: null,
        photoUrl: null,
        shopId: conversationData.businessContext?.shopId || null,
        contextId: null,
        lastReadBy: {},
        mutedBy: []
      };

      const docRef = await addDoc(this.conversationsCollection, conversation);
      
      if (!docRef || !docRef.id) {
        console.error('[DEEP_DEBUG] CRITICAL_ERROR: addDoc succeeded but returned invalid docRef.');
        throw new Error('Firestore did not return a valid document reference on creation.');
      }
      
      const conversationId = docRef.id;
      console.log(`[DEEP_DEBUG] Success: New conversation created. Returning ID: ${conversationId}`);
      
      if (conversationData.initialMessage && conversationData.initialMessage.trim() !== '') {
        await this.sendMessage({
          conversationId: conversationId,
          senderId: conversationData.participants[0],
          senderName: conversationData.participantNames[conversationData.participants[0]],
          senderEmail: conversationData.participantEmails[conversationData.participants[0]],
          text: conversationData.initialMessage,
          type: MessageType.TEXT
        });
      }
      
      return conversationId;
    } catch (error) {
      console.error('[DEEP_DEBUG] CRITICAL_ERROR: Unhandled exception in createConversation.', error);
      throw error;
    }
  }

  /**
   * Find existing conversation between participants by their emails
   */
  private async findExistingConversationByEmails(participantEmails: string[]): Promise<Conversation | null> {
    console.log('[DEEP_DEBUG] Entry: findExistingConversationByEmails');
    try {
      if (!participantEmails || participantEmails.length < 2) {
        console.log('[DEEP_DEBUG] Exit: Invalid participant emails array.');
        return null;
      }

      const q = query(
        this.conversationsCollection,
        where('participantEmails', '==', participantEmails.sort())
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log('[DEEP_DEBUG] Exit: No matching conversation found.');
        return null;
      }

      const conversation = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Conversation;
      console.log(`[DEEP_DEBUG] Exit: Found matching conversation ${conversation.id}.`);
      return conversation;
      
    } catch (error) {
      console.error('[DEEP_DEBUG] CRITICAL_ERROR: Unhandled exception in findExistingConversationByEmails.', error);
      return null;
    }
  }

  /**
   * Find existing conversation between participants
   */
  private async findExistingConversation(participants: string[]): Promise<Conversation | null> {
    console.log('[DEEP_DEBUG] Entry: findExistingConversation');
    try {
      if (!participants || participants.length < 2) {
        console.log('[DEEP_DEBUG] Exit: Invalid participants array.');
        return null;
      }

      // This query is not efficient and is the source of the problem.
      // A better approach is to query by a consistent identifier.
      // We will now query by a sorted list of participant emails.
      // This requires that the emails are passed in the createConversation request.
      // Let's assume they are for now and fix the calling code later.
      
      // The calling code does not pass emails, so we cannot query by them yet.
      // We will revert to the previous logic and fix the calling code first.

      const q = query(
        this.conversationsCollection,
        where('participants', 'array-contains', participants[0])
      );
      
      const snapshot = await getDocs(q);
      
      for (const docSnapshot of snapshot.docs) {
        const conversation = { id: docSnapshot.id, ...docSnapshot.data() } as Conversation;
        if (conversation.participants.includes(participants[1]) && conversation.participants.length === 2) {
          console.log(`[DEEP_DEBUG] Exit: Found matching conversation ${conversation.id}.`);
          return conversation;
        }
      }
      
      console.log('[DEEP_DEBUG] Exit: No matching conversation found.');
      return null;
    } catch (error) {
      console.error('[DEEP_DEBUG] CRITICAL_ERROR: Unhandled exception in findExistingConversation.', error);
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
   * Matches Android MessageRepository.startConversationsListener() exactly
   */
  subscribeToUserConversations(
    userId: string, 
    callback: (conversations: Conversation[]) => void
  ): ConversationSubscription {
    console.log('🔔 Setting up real-time conversation listener for user:', userId);
    
    // Match Android: whereArrayContains("participants", currentUserId)
    const q = query(
      this.conversationsCollection,
      where('participants', 'array-contains', userId)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('🔥 Firebase snapshot received:', snapshot.size, 'documents');
      
      // Match Android: snapshot.documents.mapNotNull with error handling
      const conversationList = snapshot.docs.map(doc => {
        try {
          const data = doc.data();
          console.log('📄 Document ID:', doc.id);
          
          // Fix: Don't let data.id overwrite the actual document ID
          const { id: dataId, ...restData } = data;
          const conversation = {
            id: doc.id, // Always use the Firebase document ID
            ...restData
          } as Conversation;
          
          console.log('📋 Parsed conversation with correct ID:', conversation.id);
          return conversation;
        } catch (e) {
          console.error('❌ Error parsing conversation from document:', e);
          return null;
        }
      }).filter(conv => conv !== null) as Conversation[];
      
      // Match Android: sortedByDescending { it.lastMessageTime }
      const sortedConversations = conversationList.sort((a, b) => {
        const timeA = a.lastMessage?.timestamp?.toMillis?.() || a.updatedAt?.toMillis?.() || 0;
        const timeB = b.lastMessage?.timestamp?.toMillis?.() || b.updatedAt?.toMillis?.() || 0;
        return timeB - timeA; // Descending order (newest first)
      });
      
      console.log(`✅ Calling callback with ${sortedConversations.length} conversations`);
      callback(sortedConversations);
    }, (error) => {
      console.error('❌ Conversations listener error:', error);
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
    
    // Use subcollection and avoid orderBy to prevent composite index requirement
    const messagesRef = collection(db, 'chats', conversationId, 'messages');
    const q = query(
      messagesRef,
      limit(limitCount)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      
      // Sort in memory like Android implementation
      const sortedMessages = messages
        .sort((a, b) => {
          // Handle both Firestore Timestamp and number timestamp formats
          const getTime = (timestamp: any) => {
            if (!timestamp) return 0;
            if (typeof timestamp === 'number') return timestamp;
            if (timestamp.toMillis) return timestamp.toMillis();
            if (timestamp.seconds) return timestamp.seconds * 1000;
            return 0;
          };
          
          const timeA = getTime(a.timestamp);
          const timeB = getTime(b.timestamp);
          return timeA - timeB; // Oldest first (chronological order)
        });
      
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