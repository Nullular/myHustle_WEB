package com.blueclipse.myhustle.data.model

import com.google.firebase.Timestamp
import com.google.firebase.firestore.PropertyName
import com.google.firebase.firestore.ServerTimestamp

/**
 * Message model for subcollection: chats/{chatId}/messages/{messageId}
 */
data class ChatMessage(
    val id: String = "",
    
    // Sender info
    val senderId: String = "",
    val senderName: String = "",
    val senderPhotoUrl: String? = null,
    
    // Message content
    val content: String = "",
    val messageType: MessageType = MessageType.TEXT,
    
    // Rich content
    val attachments: List<MessageAttachment> = emptyList(),
    
    // Context data (for system messages, booking updates, etc.)
    val contextData: Map<String, Any>? = null,
    
    // Message metadata
    val isEdited: Boolean = false,
    val isDeleted: Boolean = false,
    val editedAt: Timestamp? = null,
    val deletedAt: Timestamp? = null,
    
    // Reactions
    val reactions: Map<String, List<String>> = emptyMap(), // emoji -> list of user IDs
    
    // Read receipts (for group chats)
    val readBy: Map<String, Timestamp> = emptyMap(), // userId -> timestamp
    
    // Reply/thread info
    val replyToMessageId: String? = null,
    val replyToContent: String? = null, // Cached for display
    
    // Timestamps
    @ServerTimestamp
    val createdAt: Timestamp? = null,
    @ServerTimestamp
    val updatedAt: Timestamp? = null
) {
    // No-argument constructor for Firestore
    constructor() : this(
        id = "",
        senderId = "",
        senderName = "",
        senderPhotoUrl = null,
        content = "",
        messageType = MessageType.TEXT,
        attachments = emptyList(),
        contextData = null,
        isEdited = false,
        isDeleted = false,
        editedAt = null,
        deletedAt = null,
        reactions = emptyMap(),
        readBy = emptyMap(),
        replyToMessageId = null,
        replyToContent = null,
        createdAt = null,
        updatedAt = null
    )
    
    /**
     * Get display content (handles deleted messages)
     */
    fun getDisplayContent(): String {
        return when {
            isDeleted -> "This message was deleted"
            content.isBlank() && attachments.isNotEmpty() -> {
                when (attachments.first().type) {
                    AttachmentType.IMAGE -> "📷 Image"
                    AttachmentType.VIDEO -> "🎥 Video"
                    AttachmentType.AUDIO -> "🎵 Audio"
                    AttachmentType.DOCUMENT -> "📄 Document"
                    AttachmentType.LOCATION -> "📍 Location"
                }
            }
            else -> content
        }
    }
    
    /**
     * Check if message is a system message
     */
    fun isSystemMessage(): Boolean {
        return messageType == MessageType.SYSTEM
    }
    
    /**
     * Check if user has reacted with specific emoji
     */
    fun hasUserReacted(userId: String, emoji: String): Boolean {
        return reactions[emoji]?.contains(userId) == true
    }
}

/**
 * Message attachment model
 */
data class MessageAttachment(
    val type: AttachmentType = AttachmentType.IMAGE,
    val url: String = "",
    val fileName: String? = null,
    val fileSize: Long = 0, // in bytes
    val mimeType: String? = null,
    
    // Media-specific properties
    val width: Int? = null,
    val height: Int? = null,
    val duration: Int? = null, // for audio/video in seconds
    val thumbnailUrl: String? = null,
    
    // Location-specific properties
    val latitude: Double? = null,
    val longitude: Double? = null,
    val address: String? = null
) {
    constructor() : this(
        AttachmentType.IMAGE, "", null, 0, null,
        null, null, null, null, null, null, null
    )
}

enum class MessageType {
    @PropertyName("TEXT") TEXT,
    @PropertyName("IMAGE") IMAGE,
    @PropertyName("VIDEO") VIDEO,
    @PropertyName("AUDIO") AUDIO,
    @PropertyName("DOCUMENT") DOCUMENT,
    @PropertyName("LOCATION") LOCATION,
    @PropertyName("SYSTEM") SYSTEM,           // System messages (user joined, etc.)
    @PropertyName("BOOKING_REQUEST") BOOKING_REQUEST,
    @PropertyName("BOOKING_UPDATE") BOOKING_UPDATE,
    @PropertyName("ORDER_UPDATE") ORDER_UPDATE,
    @PropertyName("PAYMENT_REQUEST") PAYMENT_REQUEST
}

enum class AttachmentType {
    @PropertyName("IMAGE") IMAGE,
    @PropertyName("VIDEO") VIDEO,
    @PropertyName("AUDIO") AUDIO,
    @PropertyName("DOCUMENT") DOCUMENT,
    @PropertyName("LOCATION") LOCATION
}

/**
 * User membership model for subcollection: users/{userId}/memberships/{chatId}
 * This creates a denormalized "inbox" view for fast chat list loading
 */
data class UserMembership(
    val chatId: String = "",
    val chatType: ChatType = ChatType.DIRECT,
    val title: String = "",
    val subtitle: String? = null, // shop name, group description, etc.
    val photoUrl: String? = null,
    
    // Last message info (denormalized)
    val lastMessageContent: String = "",
    val lastMessageSenderId: String = "",
    val lastMessageSenderName: String = "",
    @ServerTimestamp
    val lastMessageAt: Timestamp? = null,
    
    // User-specific settings
    val unreadCount: Int = 0,
    val isPinned: Boolean = false,
    val isMuted: Boolean = false,
    val isArchived: Boolean = false,
    @ServerTimestamp
    val lastReadAt: Timestamp? = null,
    
    // Metadata
    @ServerTimestamp
    val joinedAt: Timestamp? = null,
    @ServerTimestamp
    val updatedAt: Timestamp? = null
) {
    constructor() : this(
        "", ChatType.DIRECT, "", null, null,
        "", "", "", null,
        0, false, false, false, null,
        null, null
    )
}
