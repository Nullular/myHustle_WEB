package com.blueclipse.myhustle.data.util

import android.util.Log
import com.blueclipse.myhustle.data.model.LegacyMessageType as MessageType
import com.blueclipse.myhustle.data.model.Conversation
import com.blueclipse.myhustle.data.repository.MessageRepository
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

class MessageTestHelper {
    
    suspend fun createSampleConversation(): Result<String> = withContext(Dispatchers.IO) {
        return@withContext try {
            Log.d("MessageTestHelper", "Creating sample conversation...")
            val messageRepository = MessageRepository.instance
            val currentUser = FirebaseAuth.getInstance().currentUser ?: return@withContext Result.failure(Exception("User not authenticated"))
            Log.d("MessageTestHelper", "Current user: ${currentUser.uid}")
            
            // Create a sample conversation with demo customer
            Log.d("MessageTestHelper", "Sending first message...")
            val result = messageRepository.sendMessage(
                receiverId = "demo-customer-id",
                receiverName = "Demo Customer",
                content = "Hello! Welcome to MyHustle messaging. This is a test message to verify the messaging system is working.",
                messageType = MessageType.TEXT
            )
            
            if (result.isSuccess) {
                Log.d("MessageTestHelper", "First message sent successfully, sending booking message...")
                // Send a booking request message for testing
                val bookingResult = messageRepository.sendMessage(
                    receiverId = "demo-customer-id", 
                    receiverName = "Demo Customer",
                    content = "Your booking for Smartphone Screen Repair on Dec 20th has been received and is pending approval.",
                    messageType = MessageType.BOOKING_REQUEST,
                    bookingId = "sample-booking-123"
                )
                
                if (bookingResult.isSuccess) {
                    Log.d("MessageTestHelper", "Sample conversation created successfully!")
                    Result.success("Sample conversation created successfully")
                } else {
                    Log.e("MessageTestHelper", "Failed to send booking message: ${bookingResult.exceptionOrNull()?.message}")
                    Result.failure(bookingResult.exceptionOrNull() ?: Exception("Failed to send booking message"))
                }
            } else {
                Log.e("MessageTestHelper", "Failed to send first message: ${result.exceptionOrNull()?.message}")
                Result.failure(result.exceptionOrNull() ?: Exception("Failed to send message"))
            }
        } catch (e: Exception) {
            Log.e("MessageTestHelper", "Exception in createSampleConversation", e)
            Result.failure(e)
        }
    }
    
    suspend fun createBookingRelatedMessages(): Result<Unit> = withContext(Dispatchers.IO) {
        return@withContext try {
            val messageRepository = MessageRepository.instance
            val currentUser = FirebaseAuth.getInstance().currentUser ?: return@withContext Result.failure(Exception("User not authenticated"))
            
            // Send booking acceptance message
            val result = messageRepository.sendMessage(
                receiverId = "demo-customer-id",
                receiverName = "Demo Customer", 
                content = "Great news! Your booking has been accepted. We'll see you on December 20th at 10:00 AM for your smartphone screen repair.",
                messageType = MessageType.BOOKING_UPDATE,
                bookingId = "sample-booking-123"
            )
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    companion object {
        fun createDemoConversation(): Conversation {
            val currentUser = FirebaseAuth.getInstance().currentUser
            val currentUserId = currentUser?.uid ?: "current-user"
            val currentUserName = currentUser?.displayName ?: "You"
            
            return Conversation(
                id = "demo-conversation-1",
                participants = listOf(currentUserId, "demo-customer-id"),
                participantNames = mapOf(
                    currentUserId to currentUserName,
                    "demo-customer-id" to "Demo Customer"
                ),
                lastMessage = "Your booking has been accepted!",
                lastMessageTime = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                lastMessageSenderId = currentUserId,
                unreadCount = mapOf("demo-customer-id" to 1),
                isActive = true
            )
        }
    }
}
