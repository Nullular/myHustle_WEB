package com.blueclipse.myhustle.messaging

import org.junit.Test
import org.junit.Assert.*
import com.blueclipse.myhustle.data.model.Message
import com.blueclipse.myhustle.data.model.LegacyMessageType as MessageType
import com.blueclipse.myhustle.data.model.Conversation
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

/**
 * Unit tests for messaging functionality
 */
class MessagingTest {

    @Test
    fun message_creation_isCorrect() {
        val message = Message(
            id = "test-message-1",
            conversationId = "test-conversation-1",
            senderId = "user-1",
            senderName = "Test User",
            receiverId = "user-2", 
            receiverName = "Recipient User",
            content = "Hello, this is a test message!",
            messageType = MessageType.TEXT
        )

        assertEquals("test-message-1", message.id)
        assertEquals("Hello, this is a test message!", message.content)
        assertEquals(MessageType.TEXT, message.messageType)
        assertFalse(message.isRead)
    }

    @Test
    fun conversation_creation_isCorrect() {
        val conversation = Conversation(
            id = "test-conversation-1",
            participants = listOf("user-1", "user-2"),
            participantNames = mapOf(
                "user-1" to "Test User",
                "user-2" to "Recipient User"
            ),
            lastMessage = "Hello there!",
            lastMessageTime = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
            lastMessageSenderId = "user-1"
        )

        assertEquals(2, conversation.participants.size)
        assertTrue(conversation.participants.contains("user-1"))
        assertTrue(conversation.participants.contains("user-2"))
        assertEquals("Hello there!", conversation.lastMessage)
        assertTrue(conversation.isActive)
    }

    @Test
    fun booking_message_creation_isCorrect() {
        val bookingMessage = Message(
            id = "booking-msg-1",
            conversationId = "booking-conversation-1",
            senderId = "shop-owner-1",
            senderName = "Shop Owner",
            receiverId = "customer-1",
            receiverName = "Customer",
            content = "Your booking has been accepted!",
            messageType = MessageType.BOOKING_UPDATE,
            bookingId = "booking-123"
        )

        assertEquals(MessageType.BOOKING_UPDATE, bookingMessage.messageType)
        assertEquals("booking-123", bookingMessage.bookingId)
        assertEquals("Your booking has been accepted!", bookingMessage.content)
    }
}
