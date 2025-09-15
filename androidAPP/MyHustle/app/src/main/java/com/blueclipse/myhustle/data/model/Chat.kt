package com.blueclipse.myhustle.data.model

import com.google.firebase.Timestamp
import com.google.firebase.firestore.PropertyName
import com.google.firebase.firestore.ServerTimestamp

/**
 * Chat model for the new industry-standard messaging system
 * Represents a conversation between 2+ users
 */
data class Chat(
    val id: String = "",
    
    // Participants
    val participants: List<String> = emptyList(), // Array of user IDs
    val participantInfo: Map<String, ParticipantInfo> = emptyMap(), // Denormalized user info
    
    // Chat metadata
    val type: ChatType = ChatType.DIRECT,
    val title: String? = null, // For group chats
    val description: String? = null,
    val photoUrl: String? = null,
    
    // Context (for business chats)
    val contextType: ChatContext = ChatContext.GENERAL,
    val contextId: String? = null, // Order/Booking/Shop ID
    val shopId: String? = null,
    
    // Last message info (denormalized for fast loading)
    val lastMessage: LastMessageInfo? = null,
    
    // Unread tracking per participant
    val unreadCount: Map<String, Int> = emptyMap(),
    val lastReadBy: Map<String, Timestamp?> = emptyMap(),
    
    // Settings
    val isActive: Boolean = true,
    val isArchived: Boolean = false,
    val mutedBy: List<String> = emptyList(),
    
    // Timestamps
    @ServerTimestamp
    val createdAt: Timestamp? = null,
    @ServerTimestamp  
    val updatedAt: Timestamp? = null,
    val createdBy: String = ""
) {
    // No-argument constructor for Firestore
    constructor() : this(
        id = "",
        participants = emptyList(),
        participantInfo = emptyMap(),
        type = ChatType.DIRECT,
        title = null,
        description = null,
        photoUrl = null,
        contextType = ChatContext.GENERAL,
        contextId = null,
        shopId = null,
        lastMessage = null,
        unreadCount = emptyMap(),
        lastReadBy = emptyMap(),
        isActive = true,
        isArchived = false,
        mutedBy = emptyList(),
        createdAt = null,
        updatedAt = null,
        createdBy = ""
    )
    
    /**
     * Get the other participant's info (for direct chats)
     */
    fun getOtherParticipant(currentUserId: String): ParticipantInfo? {
        if (type != ChatType.DIRECT) return null
        val otherUserId = participants.firstOrNull { it != currentUserId }
        return otherUserId?.let { participantInfo[it] }
    }
    
    /**
     * Get display title for the chat
     */
    fun getDisplayTitle(currentUserId: String): String {
        return when (type) {
            ChatType.DIRECT -> getOtherParticipant(currentUserId)?.displayName ?: "Unknown User"
            ChatType.GROUP -> title ?: "Group Chat"
            ChatType.SHOP_INQUIRY -> title ?: "Shop Inquiry"
            ChatType.BOOKING -> title ?: "Booking Chat"
            ChatType.ORDER -> title ?: "Order Chat"
            ChatType.SUPPORT -> "Support Chat"
        }
    }
    
    /**
     * Check if user has unread messages
     */
    fun hasUnreadMessages(userId: String): Boolean {
        return (unreadCount[userId] ?: 0) > 0
    }
}

/**
 * Participant information stored denormalized in chat
 */
data class ParticipantInfo(
    val userId: String = "",
    val displayName: String = "",
    val email: String? = null,
    val photoUrl: String? = null,
    val role: ParticipantRole = ParticipantRole.MEMBER,
    val joinedAt: Timestamp? = null,
    @ServerTimestamp
    val lastSeen: Timestamp? = null
) {
    constructor() : this("", "", null, null, ParticipantRole.MEMBER, null, null)
}

/**
 * Last message info denormalized for fast chat list loading
 */
data class LastMessageInfo(
    val content: String = "",
    val senderId: String = "",
    val senderName: String = "",
    val messageType: MessageType = MessageType.TEXT,
    @ServerTimestamp
    val timestamp: Timestamp? = null,
    val isDeleted: Boolean = false
) {
    constructor() : this("", "", "", MessageType.TEXT, null, false)
}

enum class ChatType {
    @PropertyName("DIRECT") DIRECT,      // 1-on-1 conversation
    @PropertyName("GROUP") GROUP,        // Group chat (3+ people)  
    @PropertyName("SHOP_INQUIRY") SHOP_INQUIRY,   // Customer inquiring about shop
    @PropertyName("BOOKING") BOOKING,    // Related to a booking
    @PropertyName("ORDER") ORDER,        // Related to an order
    @PropertyName("SUPPORT") SUPPORT     // Customer support
}

enum class ChatContext {
    @PropertyName("GENERAL") GENERAL,
    @PropertyName("ORDER") ORDER,
    @PropertyName("BOOKING") BOOKING, 
    @PropertyName("SHOP_INQUIRY") SHOP_INQUIRY,
    @PropertyName("SUPPORT") SUPPORT
}

enum class ParticipantRole {
    @PropertyName("MEMBER") MEMBER,
    @PropertyName("ADMIN") ADMIN,
    @PropertyName("OWNER") OWNER
}
