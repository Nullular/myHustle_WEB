package com.blueclipse.myhustle.data.repository

import android.util.Log
import com.blueclipse.myhustle.data.model.*
import com.blueclipse.myhustle.data.util.UserDiscovery
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.firestore.Query
import com.google.firebase.firestore.SetOptions
import com.google.firebase.Timestamp
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.tasks.await

/**
 * Modern ChatRepository using industry-standard subcollection pattern
 * Structure: chats/{chatId}/messages/{messageId}
 *           users/{userId}/memberships/{chatId}
 */
class ChatRepository private constructor() {
    
    private val firestore = FirebaseFirestore.getInstance()
    private val chatsCollection = firestore.collection("chats")
    private val usersCollection = firestore.collection("users")
    private val auth = FirebaseAuth.getInstance()
    
    // State flows for UI
    private val _userChats = MutableStateFlow<List<UserMembership>>(emptyList())
    val userChats: StateFlow<List<UserMembership>> = _userChats.asStateFlow()
    
    private val _currentChatMessages = MutableStateFlow<List<ChatMessage>>(emptyList())
    val currentChatMessages: StateFlow<List<ChatMessage>> = _currentChatMessages.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    // Listeners
    private var chatsListener: ListenerRegistration? = null
    private var messagesListener: ListenerRegistration? = null
    private var currentChatId: String? = null
    
    init {
        startUserChatsListener()
    }
    
    // ===========================================
    // USER CHAT LIST (INBOX) MANAGEMENT
    // ===========================================
    
    /**
     * Start listening to user's chat memberships (inbox view)
     */
    private fun startUserChatsListener() {
        val currentUserId = auth.currentUser?.uid ?: return
        Log.d("ChatRepository", "Starting chats listener for user: $currentUserId")
        
        chatsListener = usersCollection
            .document(currentUserId)
            .collection("memberships")
            .orderBy("lastMessageAt", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Log.e("ChatRepository", "Chats listener error", error)
                    return@addSnapshotListener
                }
                
                if (snapshot != null) {
                    val memberships = snapshot.documents.mapNotNull { doc ->
                        doc.toObject(UserMembership::class.java)?.copy(chatId = doc.id)
                    }
                    Log.d("ChatRepository", "Updated user chats: ${memberships.size} chats")
                    _userChats.value = memberships
                }
            }
    }
    
    // ===========================================
    // CHAT DISCOVERY & CREATION
    // ===========================================
    
    /**
     * Search for users to start new conversations
     */
    suspend fun searchUsers(query: String): List<User> {
        return if (query.contains("@")) {
            // Email search
            UserDiscovery.findUserByEmail(query)?.let { listOf(it) } ?: emptyList()
        } else {
            // Name search
            UserDiscovery.searchUsersByName(query)
        }
    }
    
    /**
     * Create or get existing direct message chat
     */
    suspend fun createOrGetDirectChat(otherUserId: String): Result<String> {
        return try {
            val currentUserId = auth.currentUser?.uid 
                ?: return Result.failure(Exception("User not authenticated"))
            
            Log.d("ChatRepository", "Creating/getting direct chat with: $otherUserId")
            
            // Check if direct chat already exists
            val existingChat = findExistingDirectChat(currentUserId, otherUserId)
            if (existingChat != null) {
                Log.d("ChatRepository", "Found existing chat: ${existingChat.id}")
                return Result.success(existingChat.id)
            }
            
            // Get user info
            val otherUser = UserDiscovery.getUserById(otherUserId)
                ?: return Result.failure(Exception("User not found"))
            
            val currentUser = UserDiscovery.getUserById(currentUserId)
                ?: return Result.failure(Exception("Current user not found"))
            
            // Create new chat
            val chatId = createDirectChat(currentUser, otherUser)
            Log.d("ChatRepository", "Created new chat: $chatId")
            
            Result.success(chatId)
        } catch (e: Exception) {
            Log.e("ChatRepository", "Error creating direct chat", e)
            Result.failure(e)
        }
    }
    
    /**
     * Find existing direct chat between two users
     */
    private suspend fun findExistingDirectChat(userId1: String, userId2: String): Chat? {
        return try {
            val participants = listOf(userId1, userId2).sorted()
            
            val snapshot = chatsCollection
                .whereEqualTo("type", ChatType.DIRECT)
                .whereArrayContains("participants", userId1)
                .get()
                .await()
            
            snapshot.documents.firstOrNull { doc ->
                val chat = doc.toObject(Chat::class.java)
                chat?.participants?.sorted() == participants
            }?.let { doc ->
                doc.toObject(Chat::class.java)?.copy(id = doc.id)
            }
        } catch (e: Exception) {
            Log.e("ChatRepository", "Error finding existing direct chat", e)
            null
        }
    }
    
    /**
     * Create new direct chat
     */
    private suspend fun createDirectChat(user1: User, user2: User): String {
        val currentUserId = auth.currentUser?.uid ?: throw Exception("User not authenticated")
        val participants = listOf(user1.id, user2.id).sorted()
        
        Log.d("ChatRepository", "Creating direct chat between ${user1.id} and ${user2.id}")
        
        try {
            // Create participant info map
            val participantInfo = mapOf(
                user1.id to ParticipantInfo(
                    userId = user1.id,
                    displayName = user1.displayName.takeIf { it.isNotBlank() } ?: "${user1.profile.firstName} ${user1.profile.lastName}".trim().ifEmpty { "Unknown User" },
                    email = user1.email.takeIf { it.isNotBlank() } ?: user1.profile.firstName,
                    photoUrl = user1.photoUrl.takeIf { it.isNotBlank() },
                    role = ParticipantRole.MEMBER,
                    joinedAt = Timestamp.now()
                ),
                user2.id to ParticipantInfo(
                    userId = user2.id,
                    displayName = user2.displayName.takeIf { it.isNotBlank() } ?: "${user2.profile.firstName} ${user2.profile.lastName}".trim().ifEmpty { "Unknown User" },
                    email = user2.email.takeIf { it.isNotBlank() } ?: user2.profile.firstName,
                    photoUrl = user2.photoUrl.takeIf { it.isNotBlank() },
                    role = ParticipantRole.MEMBER,
                    joinedAt = Timestamp.now()
                )
            )
            
            // Create chat document
            val chat = Chat(
                participants = participants,
                participantInfo = participantInfo,
                type = ChatType.DIRECT,
                contextType = ChatContext.GENERAL,
                unreadCount = mapOf(
                    user1.id to 0,
                    user2.id to 0
                ),
                createdBy = currentUserId,
                createdAt = Timestamp.now(),
                updatedAt = Timestamp.now()
            )
            
            // First, create the chat document
            val chatDoc = chatsCollection.add(chat).await()
            val chatId = chatDoc.id
            
            Log.d("ChatRepository", "Created chat document: $chatId")
            
            // Then create memberships for both users (now that chat exists)
            try {
                createUserMembership(user1.id, chatId, chat, user2)
                Log.d("ChatRepository", "Created membership for user1: ${user1.id}")
            } catch (e: Exception) {
                Log.e("ChatRepository", "Failed to create membership for user1: ${user1.id}", e)
            }
            
            try {
                createUserMembership(user2.id, chatId, chat, user1)
                Log.d("ChatRepository", "Created membership for user2: ${user2.id}")
            } catch (e: Exception) {
                Log.e("ChatRepository", "Failed to create membership for user2: ${user2.id}", e)
            }
            
            Log.d("ChatRepository", "Successfully created chat $chatId")
            return chatId
            
        } catch (e: Exception) {
            Log.e("ChatRepository", "Error creating direct chat", e)
            throw e
        }
    }
    
    /**
     * Create user membership (inbox entry)
     */
    private suspend fun createUserMembership(
        userId: String,
        chatId: String,
        chat: Chat,
        otherUser: User
    ) {
        val membership = UserMembership(
            chatId = chatId,
            chatType = chat.type,
            title = when (chat.type) {
                ChatType.DIRECT -> otherUser.displayName.takeIf { it.isNotBlank() } ?: "${otherUser.profile.firstName} ${otherUser.profile.lastName}".trim().ifEmpty { "Unknown User" }
                else -> chat.title ?: "Group Chat"
            },
            subtitle = when (chat.type) {
                ChatType.DIRECT -> otherUser.email.takeIf { it.isNotBlank() }
                else -> null
            },
            photoUrl = when (chat.type) {
                ChatType.DIRECT -> otherUser.photoUrl.takeIf { it.isNotBlank() }
                else -> chat.photoUrl
            },
            joinedAt = Timestamp.now(),
            updatedAt = Timestamp.now()
        )
        
        usersCollection
            .document(userId)
            .collection("memberships")
            .document(chatId)
            .set(membership)
            .await()
    }

    // ===========================================
    // MESSAGE MANAGEMENT
    // ===========================================
    
    /**
     * Start listening to messages in a specific chat
     */
    fun startMessagesListener(chatId: String) {
        Log.d("ChatRepository", "Starting messages listener for chat: $chatId")
        
        // Stop existing listener
        messagesListener?.remove()
        currentChatId = chatId
        
        messagesListener = chatsCollection
            .document(chatId)
            .collection("messages")
            .orderBy("createdAt", Query.Direction.ASCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Log.e("ChatRepository", "Messages listener error", error)
                    return@addSnapshotListener
                }
                
                if (snapshot != null) {
                    val messages = snapshot.documents.mapNotNull { doc ->
                        doc.toObject(ChatMessage::class.java)?.copy(id = doc.id)
                    }
                    Log.d("ChatRepository", "Updated messages: ${messages.size} messages")
                    _currentChatMessages.value = messages
                    
                    // Mark messages as read
                    markMessagesAsRead(chatId)
                }
            }
    }
    
    /**
     * Stop listening to current chat messages
     */
    fun stopMessagesListener() {
        messagesListener?.remove()
        messagesListener = null
        currentChatId = null
        _currentChatMessages.value = emptyList()
    }
    
    /**
     * Send a message in a chat
     */
    suspend fun sendMessage(
        chatId: String,
        content: String,
        messageType: MessageType = MessageType.TEXT,
        attachments: List<MessageAttachment> = emptyList(),
        replyToMessageId: String? = null
    ): Result<String> {
        return try {
            val currentUser = auth.currentUser ?: return Result.failure(Exception("User not authenticated"))
            val userId = currentUser.uid
            
            Log.d("ChatRepository", "Sending message to chat: $chatId")
            
            // Get current user info
            val user = UserDiscovery.getUserById(userId)
                ?: return Result.failure(Exception("Current user not found"))
            
            // Create message
            val message = ChatMessage(
                senderId = userId,
                senderName = user.displayName.takeIf { it.isNotBlank() } ?: "${user.profile.firstName} ${user.profile.lastName}".trim().ifEmpty { "Unknown User" },
                senderPhotoUrl = user.photoUrl.takeIf { it.isNotBlank() },
                content = content,
                messageType = messageType,
                attachments = attachments,
                replyToMessageId = replyToMessageId,
                createdAt = Timestamp.now(),
                updatedAt = Timestamp.now()
            )
            
            // Add message to subcollection
            val messageDoc = chatsCollection
                .document(chatId)
                .collection("messages")
                .add(message)
                .await()
            
            // Update chat's last message info
            updateChatLastMessage(chatId, message)
            
            // Update all participants' memberships
            updateParticipantMemberships(chatId, message)
            
            Log.d("ChatRepository", "Message sent successfully: ${messageDoc.id}")
            Result.success(messageDoc.id)
            
        } catch (e: Exception) {
            Log.e("ChatRepository", "Error sending message", e)
            Result.failure(e)
        }
    }
    
    /**
     * Update chat's last message info
     */
    private suspend fun updateChatLastMessage(chatId: String, message: ChatMessage) {
        val lastMessageInfo = LastMessageInfo(
            content = message.content,
            senderId = message.senderId,
            senderName = message.senderName,
            messageType = message.messageType,
            timestamp = message.createdAt
        )
        
        chatsCollection.document(chatId)
            .update(
                "lastMessage", lastMessageInfo,
                "updatedAt", Timestamp.now()
            )
            .await()
    }
    
    /**
     * Update all participants' memberships with new message info
     */
    private suspend fun updateParticipantMemberships(chatId: String, message: ChatMessage) {
        try {
            // Get chat info
            val chatDoc = chatsCollection.document(chatId).get().await()
            val chat = chatDoc.toObject(Chat::class.java) ?: return
            
            val currentUserId = auth.currentUser?.uid ?: return
            
            // Update each participant's membership
            chat.participants.forEach { participantId ->
                try {
                    // Get participant info for title/photo
                    val participantInfo = chat.participantInfo[participantId]
                    
                    // Create base membership data (will be merged with existing or create new)
                    val membershipData = mutableMapOf<String, Any>(
                        "chatId" to chatId,
                        "chatType" to chat.type.name,
                        "lastMessageContent" to message.content,
                        "lastMessageSenderId" to message.senderId,
                        "lastMessageSenderName" to message.senderName,
                        "lastMessageAt" to (message.createdAt ?: Timestamp.now()),
                        "updatedAt" to Timestamp.now()
                    )
                    
                    // Add display info if this is a direct chat
                    if (chat.type == ChatType.DIRECT && participantInfo != null) {
                        // For direct chats, show the OTHER participant's info
                        val otherParticipant = chat.participantInfo.values.firstOrNull { it.userId != participantId }
                        if (otherParticipant != null) {
                            membershipData["title"] = otherParticipant.displayName
                            if (!otherParticipant.email.isNullOrBlank()) {
                                membershipData["subtitle"] = otherParticipant.email
                            }
                            if (!otherParticipant.photoUrl.isNullOrBlank()) {
                                membershipData["photoUrl"] = otherParticipant.photoUrl
                            }
                        }
                    }
                    
                    // Only increment unread count for recipients (not sender)
                    if (participantId != message.senderId) {
                        membershipData["unreadCount"] = FieldValue.increment(1)
                    }
                    
                    // Update membership using set with merge to create if doesn't exist
                    usersCollection
                        .document(participantId)
                        .collection("memberships")
                        .document(chatId)
                        .set(membershipData, SetOptions.merge())
                        .await()
                    
                    Log.d("ChatRepository", "Updated membership for user $participantId in chat $chatId")
                    
                } catch (e: Exception) {
                    Log.e("ChatRepository", "Error updating membership for user $participantId", e)
                }
            }
        } catch (e: Exception) {
            Log.e("ChatRepository", "Error updating participant memberships", e)
        }
    }
    
    /**
     * Mark messages as read in current chat
     */
    private fun markMessagesAsRead(chatId: String) {
        val currentUserId = auth.currentUser?.uid ?: return
        
        // Update user's membership to reset unread count
        usersCollection
            .document(currentUserId)
            .collection("memberships")
            .document(chatId)
            .update(
                "unreadCount", 0,
                "lastReadAt", Timestamp.now()
            )
    }
    
    // ===========================================
    // CHAT INFO MANAGEMENT  
    // ===========================================
    
    /**
     * Get chat info
     */
    suspend fun getChat(chatId: String): Chat? {
        return try {
            val snapshot = chatsCollection.document(chatId).get().await()
            snapshot.toObject(Chat::class.java)?.copy(id = snapshot.id)
        } catch (e: Exception) {
            Log.e("ChatRepository", "Error getting chat", e)
            null
        }
    }
    
    /**
     * Clean up resources
     */
    fun cleanup() {
        chatsListener?.remove()
        messagesListener?.remove()
    }
    
    companion object {
        val instance: ChatRepository by lazy { ChatRepository() }
    }
}
