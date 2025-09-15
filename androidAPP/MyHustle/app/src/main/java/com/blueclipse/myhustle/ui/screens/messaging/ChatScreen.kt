package com.blueclipse.myhustle.ui.screens.messaging

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import android.util.Log
import com.blueclipse.myhustle.data.model.Message
import com.blueclipse.myhustle.data.repository.MessageRepository
import com.blueclipse.myhustle.data.repository.UserRepository
import com.blueclipse.myhustle.ui.theme.MessageBubbleColors
import com.blueclipse.myhustle.data.model.LegacyMessageType as MessageType
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.launch
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatScreen(
    conversationId: String,
    otherUserName: String,
    onBack: () -> Unit
) {
    val messageRepository = MessageRepository.instance
    val userRepository = UserRepository.instance
    var messages by remember { mutableStateOf<List<Message>>(emptyList()) }
    var messageText by remember { mutableStateOf("") }
    var actualConversationId by remember { mutableStateOf(conversationId) }
    val currentUserId = FirebaseAuth.getInstance().currentUser?.uid ?: ""
    val coroutineScope = rememberCoroutineScope()
    
    // User's bubble color preference
    var userBubbleColor by remember { mutableStateOf("blue") }
    
    // Load user's bubble color preference
    LaunchedEffect(currentUserId) {
        if (currentUserId.isNotEmpty()) {
            val result = userRepository.getUserById(currentUserId)
            result.onSuccess { user ->
                user?.let {
                    userBubbleColor = it.profile.preferences.messaging.bubbleColor
                }
            }
        }
    }
    
    // Load messages initially and set up real-time updates
    LaunchedEffect(actualConversationId) {
        Log.d("MyHustleChat", "LaunchedEffect - actualConversationId: $actualConversationId, otherUserName: $otherUserName")
        
        // For test conversations (contain underscore pattern like "nathan123dejager_tht"), we'll handle them differently
        val isTestConversation = actualConversationId.contains("_") && 
                (actualConversationId.contains("nathan123dejager") || actualConversationId.contains("tht"))
        Log.d("MyHustleChat", "Is test conversation: $isTestConversation")
        
        if (isTestConversation) {
            // For test conversations, start with empty messages and create conversation when first message is sent
            messages = emptyList()
            Log.d("MyHustleChat", "Test conversation initialized with empty messages")
        } else {
            // For regular conversations, load existing messages
            val result = messageRepository.getMessagesForConversation(actualConversationId)
            if (result.isSuccess) {
                messages = result.getOrNull() ?: emptyList()
                Log.d("MyHustleChat", "Initial messages loaded: ${messages.size} messages")
            } else {
                Log.e("MyHustleChat", "Failed to load initial messages: ${result.exceptionOrNull()?.message}")
            }
        }
        
        // Set up real-time listener for messages
        messageRepository.startMessagesListener(actualConversationId) { updatedMessages ->
            Log.d("MyHustleChat", "Real-time update: ${updatedMessages.size} messages")
            messages = updatedMessages
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = otherUserName,
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background,
                    titleContentColor = MaterialTheme.colorScheme.onBackground,
                    navigationIconContentColor = MaterialTheme.colorScheme.onBackground
                )
            )
        },
        bottomBar = {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.Bottom,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = messageText,
                        onValueChange = { messageText = it },
                        placeholder = { Text("Type a message...") },
                        modifier = Modifier.weight(1f),
                        maxLines = 4,
                        shape = RoundedCornerShape(24.dp)
                    )
                    
                    IconButton(
                        onClick = {
                            if (messageText.isNotBlank()) {
                                Log.d("MyHustleChat", "Send button clicked - Message: '$messageText', ConversationId: '$conversationId'")
                                coroutineScope.launch {
                                    try {
                                        // Check if this is a test conversation (contains underscore pattern like "nathan123dejager_tht")
                                        val isTestConversation = conversationId.contains("_") && 
                                                (conversationId.contains("nathan123dejager") || conversationId.contains("tht"))
                                        
                                        Log.d("MyHustleChat", "Is test conversation: $isTestConversation")
                                        
                                        if (isTestConversation) {
                                            // For test conversations, determine other user from conversation ID
                                            val currentUserEmail = FirebaseAuth.getInstance().currentUser?.email
                                            Log.d("MyHustleChat", "Test conversation - Current user email: $currentUserEmail")
                                            
                                            val otherUserEmail = when {
                                                currentUserEmail?.contains("nathan123dejager") == true -> "tht@gmail.com"
                                                currentUserEmail?.contains("tht") == true -> "nathan123dejager@gmail.com"
                                                else -> "tht@gmail.com" // fallback
                                            }
                                            
                                            Log.d("MyHustleChat", "Sending test message to: $otherUserEmail")
                                            val result = messageRepository.sendTestMessage(
                                                receiverEmail = otherUserEmail,
                                                content = messageText,
                                                messageType = MessageType.TEXT
                                            )
                                            
                                            if (result.isSuccess) {
                                                Log.d("MyHustleChat", "Test message sent successfully!")
                                                messageText = ""
                                                // Update to use the real conversation ID for future messages and listening
                                                val realConversationId = result.getOrNull()
                                                if (realConversationId != null && realConversationId != actualConversationId) {
                                                    Log.d("MyHustleChat", "Switching to real conversation ID: $realConversationId")
                                                    actualConversationId = realConversationId
                                                }
                                            } else {
                                                Log.e("MyHustleChat", "Failed to send test message: ${result.exceptionOrNull()?.message}")
                                            }
                                        } else {
                                            // Regular conversation logic
                                            val conversation = messageRepository.getConversation(conversationId)
                                            Log.d("MyHustleChat", "Retrieved conversation: $conversation")
                                            val otherUserId = conversation?.participants?.find { it != currentUserId }
                                            Log.d("MyHustleChat", "Current user: $currentUserId, Other user: $otherUserId")
                                            
                                            if (otherUserId != null) {
                                                Log.d("MyHustleChat", "Sending message to $otherUserId")
                                                val result = messageRepository.sendMessage(
                                                    receiverId = otherUserId,
                                                    receiverName = otherUserName,
                                                    content = messageText,
                                                    messageType = MessageType.TEXT
                                                )
                                                
                                                if (result.isSuccess) {
                                                    Log.d("MyHustleChat", "Message sent successfully!")
                                                    messageText = ""
                                                } else {
                                                    Log.e("MyHustleChat", "Failed to send message: ${result.exceptionOrNull()?.message}")
                                                }
                                            } else {
                                                Log.e("MyHustleChat", "Could not find other user ID")
                                            }
                                        }
                                    } catch (e: Exception) {
                                        Log.e("MyHustleChat", "Exception while sending message", e)
                                    }
                                }
                            }
                        },
                        enabled = messageText.isNotBlank()
                    ) {
                        Icon(
                            imageVector = Icons.Default.Send,
                            contentDescription = "Send",
                            tint = if (messageText.isNotBlank()) 
                                MaterialTheme.colorScheme.primary 
                            else 
                                MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f)
                        )
                    }
                }
            }
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(MaterialTheme.colorScheme.background),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            reverseLayout = true
        ) {
            items(messages.reversed()) { message ->
                MessageBubble(
                    message = message,
                    isCurrentUser = message.senderId == currentUserId,
                    userBubbleColor = userBubbleColor
                )
            }
        }
    }
}

@Composable
private fun MessageBubble(
    message: Message,
    isCurrentUser: Boolean,
    userBubbleColor: String = "blue"
) {
    val timeDisplay = try {
        val timestamp = LocalDateTime.parse(message.timestamp, DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        timestamp.format(DateTimeFormatter.ofPattern("HH:mm"))
    } catch (e: Exception) {
        ""
    }
    
    // Get the user's selected color
    val bubbleColor = if (isCurrentUser) {
        MessageBubbleColors.getColorById(userBubbleColor)
    } else {
        MaterialTheme.colorScheme.surface
    }
    
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isCurrentUser) Arrangement.End else Arrangement.Start
    ) {
        Card(
            modifier = Modifier.widthIn(max = 280.dp),
            shape = RoundedCornerShape(
                topStart = 16.dp,
                topEnd = 16.dp,
                bottomStart = if (isCurrentUser) 16.dp else 4.dp,
                bottomEnd = if (isCurrentUser) 4.dp else 16.dp
            ),
            colors = CardDefaults.cardColors(
                containerColor = when (message.messageType) {
                    MessageType.BOOKING_UPDATE -> Color.Green.copy(alpha = 0.1f)
                    MessageType.BOOKING_REQUEST -> Color.Blue.copy(alpha = 0.1f)
                    else -> bubbleColor
                }
            )
        ) {
            Column(
                modifier = Modifier.padding(12.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                when (message.messageType) {
                    MessageType.BOOKING_REQUEST -> {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Send,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp),
                                tint = Color.Blue
                            )
                            Text(
                                text = "Booking Request",
                                style = MaterialTheme.typography.labelSmall,
                                color = Color.Blue,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                    MessageType.BOOKING_UPDATE -> {
                        Text(
                            text = "📅 Booking Update",
                            style = MaterialTheme.typography.labelSmall,
                            color = Color.Green,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    else -> {}
                }
                
                Text(
                    text = message.content,
                    style = MaterialTheme.typography.bodyMedium,
                    color = if (isCurrentUser && message.messageType == MessageType.TEXT) {
                        Color.White
                    } else {
                        MaterialTheme.colorScheme.onSurface
                    }
                )
                
                if (timeDisplay.isNotEmpty()) {
                    Text(
                        text = timeDisplay,
                        style = MaterialTheme.typography.labelSmall,
                        color = if (isCurrentUser && message.messageType == MessageType.TEXT) {
                            Color.White.copy(alpha = 0.7f)
                        } else {
                            MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                        },
                        modifier = Modifier.align(if (isCurrentUser) Alignment.End else Alignment.Start)
                    )
                }
            }
        }
    }
}
