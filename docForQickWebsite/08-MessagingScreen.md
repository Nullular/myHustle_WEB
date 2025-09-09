# Messaging Screen Documentation

## Purpose & Function
The Messaging Screen displays a list of conversations/chats between users, allowing them to view message history and navigate to individual chat interfaces. It serves as the main inbox for customer-business communications.

## Screen Overview
- **File**: `MessagingScreen.kt` (located in `ui/screens/messaging/`)
- **Type**: Communication Hub Screen
- **User Types**: All authenticated users (customers and business owners)

## UI Components & Layout

### Top App Bar
- **Back Button**: Arrow back icon for navigation
- **Title**: "Messages" or "Conversations"
- **Background**: Standard app bar styling
- **System Back Handling**: BackHandler for gesture navigation

### Conversations List
- **Layout**: LazyColumn with conversation cards
- **Empty State**: Message when no conversations exist
- **Loading State**: Progress indicator during data loading
- **Pull-to-Refresh**: Refresh conversations (if implemented)

### Conversation Cards
Each conversation displays:
- **Contact Avatar**: Circular user/business profile image
- **Contact Name**: Primary participant name
- **Last Message**: Preview of most recent message
- **Timestamp**: When last message was sent
- **Unread Indicator**: Visual badge for unread messages
- **Online Status**: Green dot for active users (if implemented)

### Conversation Item Structure
```kotlin
// Card with clickable interaction
Card(
    modifier = Modifier
        .fillMaxWidth()
        .clickable { onConversationClick(participantId, participantName) }
        .padding(horizontal = 16.dp, vertical = 8.dp)
) {
    Row(
        modifier = Modifier.padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Avatar section
        // Name and message preview
        // Timestamp and status
    }
}
```

### Empty State
- **Icon**: Chat or message icon
- **Message**: "No conversations yet"
- **Action Button**: "Start a conversation" (if applicable)

## Data Flow & State Management

### Repository Integration
```kotlin
val messageRepository = MessageRepository.instance
val conversations by messageRepository.conversations.collectAsState()
val currentUserId = FirebaseAuth.getInstance().currentUser?.uid ?: ""
val currentUserEmail = FirebaseAuth.getInstance().currentUser?.email ?: ""
```

### State Management
- **Conversations List**: StateFlow from MessageRepository
- **Loading State**: Repository handles loading indicators
- **Real-time Updates**: Firestore listeners for live updates
- **Error Handling**: Repository-level error management

### Data Loading
- **Automatic**: LaunchedEffect triggers conversation loading
- **Real-time**: Firestore listeners maintain current state
- **User Context**: Filter conversations for current user

## Data Models

### Conversation Model
```kotlin
data class Conversation(
    val id: String = "",
    val participants: List<String> = emptyList(), // User IDs
    val participantNames: Map<String, String> = emptyMap(),
    val participantEmails: Map<String, String> = emptyMap(),
    val lastMessage: String = "",
    val lastMessageTimestamp: Timestamp = Timestamp.now(),
    val lastMessageSenderId: String = "",
    val unreadCount: Map<String, Int> = emptyMap(), // Per participant
    val isActive: Boolean = true,
    val createdAt: Timestamp = Timestamp.now(),
    val updatedAt: Timestamp = Timestamp.now()
)
```

### Message Preview Model
```kotlin
data class MessagePreview(
    val conversationId: String,
    val otherParticipantId: String,
    val otherParticipantName: String,
    val lastMessage: String,
    val timestamp: String,
    val unreadCount: Int,
    val isOnline: Boolean = false
)
```

## API Integration

### MessageRepository Methods
- **conversations**: StateFlow<List<Conversation>>
- **loadUserConversations(userId)**: Load user's conversations
- **markAsRead(conversationId, userId)**: Mark conversation as read
- **createConversation(participants)**: Start new conversation

### Firestore Structure
```
conversations/
  {conversationId}/
    participants: [userId1, userId2]
    participantNames: {userId1: "Name1", userId2: "Name2"}
    lastMessage: "Most recent message text"
    lastMessageTimestamp: Timestamp
    lastMessageSenderId: "userId"
    unreadCount: {userId1: 0, userId2: 2}
    
    messages/ (subcollection)
      {messageId}/
        senderId: "userId"
        text: "Message content"
        timestamp: Timestamp
        readBy: {userId1: true, userId2: false}
```

## Business Logic

### Conversation Filtering
```kotlin
// Filter conversations where current user is participant
val userConversations = conversations.filter { conversation ->
    currentUserId in conversation.participants
}
```

### Last Message Formatting
```kotlin
fun formatLastMessage(message: String, maxLength: Int = 50): String {
    return if (message.length > maxLength) {
        "${message.take(maxLength)}..."
    } else {
        message
    }
}
```

### Timestamp Formatting
```kotlin
fun formatTimestamp(timestamp: Timestamp): String {
    val now = LocalDateTime.now()
    val messageTime = timestamp.toDate().toInstant()
        .atZone(ZoneId.systemDefault())
        .toLocalDateTime()
    
    return when {
        messageTime.toLocalDate() == now.toLocalDate() -> {
            // Today: show time
            messageTime.format(DateTimeFormatter.ofPattern("h:mm a"))
        }
        messageTime.toLocalDate() == now.toLocalDate().minusDays(1) -> {
            // Yesterday
            "Yesterday"
        }
        else -> {
            // Older: show date
            messageTime.format(DateTimeFormatter.ofPattern("MMM d"))
        }
    }
}
```

### Unread Message Handling
```kotlin
fun getUnreadCount(conversation: Conversation, userId: String): Int {
    return conversation.unreadCount[userId] ?: 0
}

fun hasUnreadMessages(conversation: Conversation, userId: String): Boolean {
    return getUnreadCount(conversation, userId) > 0
}
```

## User Interactions

### Primary Actions
1. **View Conversation**: Tap conversation to open chat screen
2. **Start New Chat**: Initiate new conversation (if implemented)
3. **Mark as Read**: Auto-mark when viewing conversation
4. **Pull to Refresh**: Refresh conversation list
5. **Back Navigation**: Return to previous screen

### Navigation Flow
- **To Chat Screen**: `onConversationClick(participantId, participantName)`
- **Back**: System back gesture or back button
- **Deep Links**: Direct navigation to specific conversations

### Long Press Actions (if implemented)
- **Delete Conversation**: Remove conversation
- **Mark as Unread**: Reset read status
- **Archive**: Hide conversation from main list

## Web Implementation Notes

### React/Next.js Implementation
```jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  IconButton,
  Divider
} from '@mui/material';
import { ArrowBack, Chat } from '@mui/icons-material';

const MessagingScreen = () => {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const fetchConversations = async () => {
      try {
        const userConversations = await messageAPI.getUserConversations(user.uid);
        setConversations(userConversations);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Set up real-time listener
    const unsubscribe = messageAPI.subscribeToUserConversations(
      user.uid,
      setConversations
    );

    return () => unsubscribe && unsubscribe();
  }, [user]);

  const handleConversationClick = (participantId, participantName) => {
    router.push(`/chat/${participantId}?name=${encodeURIComponent(participantName)}`);
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const messageDate = timestamp.toDate();
    const diffTime = Math.abs(now - messageDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getOtherParticipant = (conversation) => {
    const otherParticipantId = conversation.participants.find(id => id !== user.uid);
    return {
      id: otherParticipantId,
      name: conversation.participantNames[otherParticipantId] || 'Unknown User',
      email: conversation.participantEmails[otherParticipantId] || ''
    };
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => router.back()}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ ml: 2 }}>
          Messages
        </Typography>
      </Box>

      {conversations.length === 0 ? (
        /* Empty State */
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Chat sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No conversations yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start chatting with businesses to see your messages here
          </Typography>
        </Box>
      ) : (
        /* Conversations List */
        <List>
          {conversations.map((conversation, index) => {
            const otherParticipant = getOtherParticipant(conversation);
            const unreadCount = conversation.unreadCount[user.uid] || 0;
            const isFromCurrentUser = conversation.lastMessageSenderId === user.uid;

            return (
              <React.Fragment key={conversation.id}>
                <ListItem
                  button
                  onClick={() => handleConversationClick(otherParticipant.id, otherParticipant.name)}
                  sx={{ py: 2 }}
                >
                  <ListItemAvatar>
                    <Badge 
                      badgeContent={unreadCount} 
                      color="primary"
                      invisible={unreadCount === 0}
                    >
                      <Avatar>
                        {otherParticipant.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={otherParticipant.name}
                    secondary={
                      <Box>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            fontWeight: unreadCount > 0 ? 'bold' : 'normal'
                          }}
                        >
                          {isFromCurrentUser ? 'You: ' : ''}
                          {conversation.lastMessage.length > 50
                            ? `${conversation.lastMessage.substring(0, 50)}...`
                            : conversation.lastMessage
                          }
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(conversation.lastMessageTimestamp)}
                    </Typography>
                  </Box>
                </ListItem>
                
                {index < conversations.length - 1 && <Divider />}
              </React.Fragment>
            );
          })}
        </List>
      )}
    </Container>
  );
};
```

### Real-time Updates with Firebase
```javascript
// messageAPI.js
class MessageAPI {
  subscribeToUserConversations(userId, callback) {
    return db.collection('conversations')
      .where('participants', 'array-contains', userId)
      .orderBy('lastMessageTimestamp', 'desc')
      .onSnapshot((snapshot) => {
        const conversations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(conversations);
      }, (error) => {
        console.error('Error in conversation subscription:', error);
      });
  }

  async getUserConversations(userId) {
    try {
      const snapshot = await db.collection('conversations')
        .where('participants', 'array-contains', userId)
        .orderBy('lastMessageTimestamp', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  async markConversationAsRead(conversationId, userId) {
    try {
      await db.collection('conversations').doc(conversationId).update({
        [`unreadCount.${userId}`]: 0
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }
}

export const messageAPI = new MessageAPI();
```

### Context for Real-time Updates
```jsx
// MessageContext.js
export const MessageProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const unsubscribe = messageAPI.subscribeToUserConversations(
      user.uid,
      (newConversations) => {
        setConversations(newConversations);
        setLoading(false);
      }
    );

    return () => unsubscribe && unsubscribe();
  }, [user]);

  const markAsRead = useCallback(async (conversationId) => {
    if (user) {
      await messageAPI.markConversationAsRead(conversationId, user.uid);
    }
  }, [user]);

  const value = {
    conversations,
    loading,
    markAsRead
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};
```

## Performance Considerations
- **Real-time Optimization**: Efficient Firestore listeners
- **Pagination**: Load conversations in batches
- **Caching**: Cache conversation list
- **Debounced Updates**: Prevent excessive re-renders
- **Memory Management**: Clean up listeners on unmount

## Security Considerations
- **User Authorization**: Verify user access to conversations
- **Data Privacy**: Only show user's own conversations
- **Message Encryption**: Consider end-to-end encryption
- **Firestore Rules**: Secure database access

## Accessibility Features
- **Screen Reader Support**: Proper content descriptions
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Logical tab order
- **Touch Targets**: Sufficient button sizes
- **Color Independence**: Don't rely solely on color for unread status

## Testing Scenarios
- Empty conversation list
- Real-time message updates
- Navigation to chat screens
- Unread message indicators
- Network connectivity issues
- Authentication edge cases
