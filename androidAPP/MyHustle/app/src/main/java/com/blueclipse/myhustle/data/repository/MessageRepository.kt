package com.blueclipse.myhustle.data.repository

import android.util.Log
import com.blueclipse.myhustle.data.model.*
import com.blueclipse.myhustle.data.model.LegacyMessageType as MessageType
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.tasks.await
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

class MessageRepository private constructor() {
    
    init {
        Log.d("MessageRepo", "MessageRepository constructor called")
    }
    
    private val firestore: FirebaseFirestore = Firebase.firestore
    private val messagesCollection = firestore.collection("messages")
    private val conversationsCollection = firestore.collection("conversations")
    private val bookingMessagesCollection = firestore.collection("booking_messages")
    private val userRepository: UserRepository by lazy { 
        Log.d("MessageRepo", "Getting UserRepository instance...")
        UserRepository.instance 
    }
    
    private val _conversations = MutableStateFlow<List<Conversation>>(emptyList())
    val conversations: StateFlow<List<Conversation>> = _conversations.asStateFlow()
    
    private val _messages = MutableStateFlow<List<Message>>(emptyList())
    val messages: StateFlow<List<Message>> = _messages.asStateFlow()
    
    private var messagesListener: ((List<Message>) -> Unit)? = null
    private var currentConversationId: String? = null
    
    init {
        startConversationsListener()
    }
    
    private fun startConversationsListener() {
        val currentUserId = FirebaseAuth.getInstance().currentUser?.uid ?: return
        Log.d("MessageRepo", "Starting conversations listener for user: $currentUserId")
        
        conversationsCollection
            .whereArrayContains("participants", currentUserId)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Log.e("MessageRepo", "Conversations listener error", error)
                    return@addSnapshotListener
                }
                
                if (snapshot != null) {
                    Log.d("MessageRepo", "Conversations listener update - ${snapshot.documents.size} documents")
                    val conversationList = snapshot.documents.mapNotNull { document ->
                        try {
                            val conversation = document.toObject(Conversation::class.java)?.copy(id = document.id)
                            Log.d("MessageRepo", "Parsed conversation: $conversation")
                            conversation
                        } catch (e: Exception) {
                            Log.e("MessageRepo", "Error parsing conversation from document", e)
                            null
                        }
                    }
                    // Sort by lastMessageTime in memory instead of in Firestore query
                    val sortedConversations = conversationList.sortedByDescending { 
                        it.lastMessageTime 
                    }
                    Log.d("MessageRepo", "Calling _conversations.value with ${sortedConversations.size} conversations")
                    _conversations.value = sortedConversations
                } else {
                    Log.d("MessageRepo", "Conversations snapshot is null")
                }
            }
    }
    
    suspend fun sendMessage(
        receiverId: String,
        receiverName: String,
        content: String,
        messageType: MessageType = MessageType.TEXT,
        bookingId: String? = null
    ): Result<Unit> {
        return try {
            Log.d("MessageRepo", "sendMessage called - receiverId: $receiverId, content: $content")
            val currentUser = FirebaseAuth.getInstance().currentUser ?: return Result.failure(Exception("User not authenticated"))
            val senderId = currentUser.uid
            
            // Get sender name from UserRepository instead of Firebase Auth display name
            val senderUserResult = userRepository.getUserById(senderId)
            val senderName = if (senderUserResult.isSuccess) {
                val user = senderUserResult.getOrNull()
                user?.displayName?.takeIf { it.isNotBlank() } 
                    ?: "${user?.profile?.firstName ?: ""} ${user?.profile?.lastName ?: ""}".trim().takeIf { it.isNotBlank() }
                    ?: "User"
            } else {
                currentUser.displayName ?: "User"
            }
            Log.d("MessageRepo", "Current user - ID: $senderId, Name: $senderName")
            
            // Create or get conversation
            val conversationId = getOrCreateConversation(senderId, receiverId, senderName, receiverName)
            Log.d("MessageRepo", "ConversationId: $conversationId")
            
            // Create message
            val message = Message(
                conversationId = conversationId,
                senderId = senderId,
                senderName = senderName,
                receiverId = receiverId,
                receiverName = receiverName,
                content = content,
                messageType = messageType,
                bookingId = bookingId
            )
            Log.d("MessageRepo", "Message created: $message")
            
            // Add message to Firestore
            val messageRef = messagesCollection.add(message).await()
            Log.d("MessageRepo", "Message added to Firestore with ID: ${messageRef.id}")
            
            // Update conversation with last message
            updateConversationLastMessage(conversationId, content, senderId)
            Log.d("MessageRepo", "Conversation updated")
            
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e("MessageRepo", "Error sending message", e)
            Result.failure(e)
        }
    }
    
    private suspend fun getOrCreateConversation(
        senderId: String,
        receiverId: String,
        senderName: String,
        receiverName: String
    ): String {
        val participants = listOf(senderId, receiverId).sorted()
        
        // Try to find existing conversation
        val existingConversation = conversationsCollection
            .whereEqualTo("participants", participants)
            .get()
            .await()
            .documents
            .firstOrNull()
        
        return if (existingConversation != null) {
            existingConversation.id
        } else {
            // Create new conversation
            val conversation = Conversation(
                participants = participants,
                participantNames = mapOf(
                    senderId to senderName,
                    receiverId to receiverName
                ),
                lastMessage = "",
                lastMessageTime = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                lastMessageSenderId = senderId,
                unreadCount = mapOf(receiverId to 0)
            )
            
            val conversationRef = conversationsCollection.add(conversation).await()
            conversationRef.id
        }
    }
    
    private suspend fun updateConversationLastMessage(
        conversationId: String,
        lastMessage: String,
        senderId: String
    ) {
        conversationsCollection.document(conversationId).update(
            mapOf(
                "lastMessage" to lastMessage,
                "lastMessageTime" to LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                "lastMessageSenderId" to senderId
            )
        ).await()
    }
    
    suspend fun getMessagesForConversation(conversationId: String): Result<List<Message>> {
        return try {
            val messagesSnapshot = messagesCollection
                .whereEqualTo("conversationId", conversationId)
                .get()
                .await()
            
            val messagesList = messagesSnapshot.documents.mapNotNull { document ->
                try {
                    document.toObject(Message::class.java)?.copy(id = document.id)
                } catch (e: Exception) {
                    null
                }
            }.sortedBy { it.timestamp } // Sort in memory instead of using orderBy
            
            Result.success(messagesList)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun sendBookingResponse(
        bookingId: String,
        customerId: String,
        customerName: String,
        isAccepted: Boolean,
        message: String = ""
    ): Result<Unit> {
        return try {
            val messageType = if (isAccepted) MessageType.BOOKING_UPDATE else MessageType.BOOKING_UPDATE
            val content = if (isAccepted) {
                "Your booking has been accepted! $message"
            } else {
                "Your booking has been denied. $message"
            }
            
            sendMessage(
                receiverId = customerId,
                receiverName = customerName,
                content = content,
                messageType = messageType,
                bookingId = bookingId
            )
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun markMessageAsRead(messageId: String): Result<Unit> {
        return try {
            messagesCollection.document(messageId).update("isRead", true).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getConversation(conversationId: String): Conversation? {
        return try {
            Log.d("MessageRepo", "getConversation called with ID: $conversationId")
            val document = conversationsCollection.document(conversationId).get().await()
            val conversation = document.toObject(Conversation::class.java)?.copy(id = document.id)
            Log.d("MessageRepo", "Retrieved conversation: $conversation")
            conversation
        } catch (e: Exception) {
            Log.e("MessageRepo", "Error getting conversation", e)
            null
        }
    }
    
    fun startMessagesListener(conversationId: String, onMessagesUpdate: (List<Message>) -> Unit) {
        Log.d("MessageRepo", "Starting messages listener for conversation: $conversationId")
        messagesListener = onMessagesUpdate
        currentConversationId = conversationId
        
        messagesCollection
            .whereEqualTo("conversationId", conversationId)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Log.e("MessageRepo", "Messages listener error", error)
                    return@addSnapshotListener
                }
                
                if (snapshot != null) {
                    Log.d("MessageRepo", "Messages listener update - ${snapshot.documents.size} documents")
                    val messagesList = snapshot.documents.mapNotNull { document ->
                        try {
                            val message = document.toObject(Message::class.java)?.copy(id = document.id)
                            Log.d("MessageRepo", "Parsed message: $message")
                            message
                        } catch (e: Exception) {
                            Log.e("MessageRepo", "Error parsing message from document", e)
                            null
                        }
                    }.sortedBy { it.timestamp } // Sort in memory instead of using orderBy
                    Log.d("MessageRepo", "Calling onMessagesUpdate with ${messagesList.size} sorted messages")
                    onMessagesUpdate(messagesList)
                }
            }
    }
    
    fun stopMessagesListener() {
        messagesListener = null
        currentConversationId = null
    }
    
    suspend fun sendBookingMessage(
        customerId: String,
        customerName: String,
        bookingId: String,
        content: String
    ): Result<Unit> {
        return try {
            sendMessage(
                receiverId = customerId,
                receiverName = customerName,
                content = content,
                messageType = MessageType.TEXT,
                bookingId = bookingId
            )
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun sendTestMessage(
        receiverEmail: String,
        content: String,
        messageType: MessageType = MessageType.TEXT
    ): Result<String> {
        return try {
            Log.d("MessageRepo", "sendTestMessage called - receiverEmail: $receiverEmail, content: $content")
            
            // Look up receiver by email
            val receiverResult = userRepository.getUserByEmail(receiverEmail)
            if (receiverResult.isFailure || receiverResult.getOrNull() == null) {
                Log.e("MessageRepo", "Could not find user with email: $receiverEmail")
                return Result.failure(Exception("User not found: $receiverEmail"))
            }
            
            val receiver = receiverResult.getOrNull()!!
            Log.d("MessageRepo", "Found receiver: ${receiver.displayName} (${receiver.id})")
            
            // Get the current user
            val currentUser = FirebaseAuth.getInstance().currentUser ?: return Result.failure(Exception("User not authenticated"))
            val senderId = currentUser.uid
            
            // Get sender name from UserRepository instead of Firebase Auth display name
            val senderUserResult = userRepository.getUserById(senderId)
            val senderName = if (senderUserResult.isSuccess) {
                val user = senderUserResult.getOrNull()
                user?.displayName?.takeIf { it.isNotBlank() } 
                    ?: "${user?.profile?.firstName ?: ""} ${user?.profile?.lastName ?: ""}".trim().takeIf { it.isNotBlank() }
                    ?: "User"
            } else {
                currentUser.displayName ?: "User"
            }
            
            // Get or create conversation and return the actual conversation ID
            val conversationId = getOrCreateConversation(senderId, receiver.id, senderName, receiver.displayName)
            Log.d("MessageRepo", "Actual ConversationId for test: $conversationId")
            
            // Create and send the message
            val message = Message(
                senderId = senderId,
                senderName = senderName,
                content = content,
                timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                conversationId = conversationId,
                messageType = messageType
            )
            
            // Add message to Firestore
            val messageRef = messagesCollection.add(message).await()
            Log.d("MessageRepo", "Test message added to Firestore with ID: ${messageRef.id}")
            
            // Update conversation with last message
            updateConversationLastMessage(conversationId, content, senderId)
            Log.d("MessageRepo", "Test conversation updated")
            
            Result.success(conversationId)
        } catch (e: Exception) {
            Log.e("MessageRepo", "Error in sendTestMessage", e)
            Result.failure(e)
        }
    }

    suspend fun getOrCreateConversationId(
        customerId: String,
        customerName: String,
        bookingId: String? = null
    ): String? {
        return try {
            val currentUser = FirebaseAuth.getInstance().currentUser ?: return null
            val senderId = currentUser.uid
            val senderName = currentUser.displayName ?: "User"
            
            getOrCreateConversation(senderId, customerId, senderName, customerName)
        } catch (e: Exception) {
            null
        }
    }
    
    /**
     * Creates sample conversation data for testing
     */
    suspend fun createSampleConversations() {
        try {
            val currentUserId = FirebaseAuth.getInstance().currentUser?.uid ?: return
            val currentUserEmail = FirebaseAuth.getInstance().currentUser?.email ?: return
            
            Log.d("MessageRepo", "Creating sample conversations for user: $currentUserId")
            
            // Sample conversation 1
            val conversation1 = Conversation(
                id = "sample_conv_1",
                participants = listOf(currentUserId, "sample_user_1"),
                participantNames = mapOf(
                    currentUserId to "You",
                    "sample_user_1" to "Coffee Corner Owner"
                ),
                lastMessage = "Your order is ready for pickup!",
                lastMessageTime = LocalDateTime.now().minusHours(2).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                lastMessageSenderId = "sample_user_1",
                unreadCount = mapOf(currentUserId to 1, "sample_user_1" to 0)
            )
            
            // Sample conversation 2
            val conversation2 = Conversation(
                id = "sample_conv_2",
                participants = listOf(currentUserId, "sample_user_2"),
                participantNames = mapOf(
                    currentUserId to "You",
                    "sample_user_2" to "Tech Repair Shop"
                ),
                lastMessage = "When would you like to schedule the repair?",
                lastMessageTime = LocalDateTime.now().minusDays(1).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                lastMessageSenderId = currentUserId,
                unreadCount = mapOf(currentUserId to 0, "sample_user_2" to 1)
            )
            
            // Add to Firestore
            conversationsCollection.document(conversation1.id).set(conversation1).await()
            conversationsCollection.document(conversation2.id).set(conversation2).await()
            
            Log.d("MessageRepo", "Sample conversations created successfully")
            
        } catch (e: Exception) {
            Log.e("MessageRepo", "Error creating sample conversations", e)
        }
    }
    
    companion object {
        val instance: MessageRepository by lazy { 
            Log.d("MessageRepo", "Creating MessageRepository instance...")
            MessageRepository() 
        }
    }
}
