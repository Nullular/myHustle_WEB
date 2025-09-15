package com.blueclipse.myhustle.data.model

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

// Legacy MessageType enum for backwards compatibility
enum class LegacyMessageType {
    TEXT,
    BOOKING_REQUEST,
    BOOKING_UPDATE
}

// Legacy Message model - kept for backwards compatibility during migration
data class Message(
    val id: String = "",
    val conversationId: String = "",
    val senderId: String = "",
    val senderName: String = "",
    val receiverId: String = "",
    val receiverName: String = "",
    val content: String = "",
    val timestamp: String = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
    val messageType: LegacyMessageType = LegacyMessageType.TEXT,
    val bookingId: String? = null,
    val isRead: Boolean = false
) {
    constructor() : this("", "", "", "", "", "", "", "", LegacyMessageType.TEXT, null, false)
}

data class Conversation(
    val id: String = "",
    val participants: List<String> = emptyList(),
    val participantNames: Map<String, String> = emptyMap(),
    val lastMessage: String = "",
    val lastMessageTime: String = "",
    val lastMessageSenderId: String = "",
    val unreadCount: Map<String, Int> = emptyMap(),
    val bookingId: String? = null,
    val isActive: Boolean = true
) {
    constructor() : this("", emptyList(), emptyMap(), "", "", "", emptyMap(), null, true)
}

data class BookingMessage(
    val bookingId: String = "",
    val serviceName: String = "",
    val shopName: String = "",
    val requestedDate: String = "",
    val requestedTime: String = "",
    val customerName: String = "",
    val shopOwnerId: String = "",
    val customerId: String = "",
    val status: String = "PENDING", // Using String to avoid enum duplication
    val notes: String = ""
) {
    constructor() : this("", "", "", "", "", "", "", "", "PENDING", "")
}
