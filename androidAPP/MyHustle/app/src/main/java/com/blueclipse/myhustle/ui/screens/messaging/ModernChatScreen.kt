package com.blueclipse.myhustle.ui.screens.messaging

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import android.util.Log
import com.blueclipse.myhustle.data.model.*
import com.blueclipse.myhustle.data.repository.ChatRepository
import com.blueclipse.myhustle.data.repository.UserRepository
import com.blueclipse.myhustle.ui.theme.HustleColors
import com.blueclipse.myhustle.ui.theme.HustleShapes
import com.blueclipse.myhustle.ui.theme.MessageBubbleColors
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.launch
import me.nikhilchaudhari.library.NeuInsets
import me.nikhilchaudhari.library.neumorphic
import me.nikhilchaudhari.library.shapes.Pressed
import me.nikhilchaudhari.library.shapes.Punched
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ModernChatScreen(
    chatId: String,
    chatTitle: String,
    onBack: () -> Unit
) {
    val chatRepository = ChatRepository.instance
    val userRepository = UserRepository.instance
    val messages by chatRepository.currentChatMessages.collectAsState()
    val currentUserId = FirebaseAuth.getInstance().currentUser?.uid ?: ""
    val coroutineScope = rememberCoroutineScope()
    
    var messageText by remember { mutableStateOf("") }
    var isSending by remember { mutableStateOf(false) }
    val listState = rememberLazyListState()
    val keyboardController = LocalSoftwareKeyboardController.current
    
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
    
    // Start listening to messages when screen loads
    LaunchedEffect(chatId) {
        Log.d("ModernChatScreen", "Starting messages listener for chat: $chatId")
        chatRepository.startMessagesListener(chatId)
    }
    
    // Auto scroll to bottom when new messages arrive
    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }
    
    // Cleanup when screen is disposed
    DisposableEffect(chatId) {
        onDispose {
            Log.d("ModernChatScreen", "Cleaning up messages listener")
            chatRepository.stopMessagesListener()
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = chatTitle,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Online", // TODO: Add real presence later
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.primary,
                            fontSize = 12.sp
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = MaterialTheme.colorScheme.onSurface
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        bottomBar = {
            MessageInputBar(
                message = messageText,
                onMessageChange = { messageText = it },
                onSendMessage = {
                    if (messageText.isNotBlank() && !isSending) {
                        isSending = true
                        coroutineScope.launch {
                            try {
                                Log.d("ModernChatScreen", "Sending message: $messageText")
                                val result = chatRepository.sendMessage(
                                    chatId = chatId,
                                    content = messageText.trim()
                                )
                                
                                if (result.isSuccess) {
                                    messageText = ""
                                    keyboardController?.hide()
                                } else {
                                    Log.e("ModernChatScreen", "Failed to send message: ${result.exceptionOrNull()}")
                                }
                            } catch (e: Exception) {
                                Log.e("ModernChatScreen", "Error sending message", e)
                            } finally {
                                isSending = false
                            }
                        }
                    }
                },
                isSending = isSending
            )
        }
    ) { paddingValues ->
        
        if (messages.isEmpty()) {
            // Empty state
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "💬",
                        style = MaterialTheme.typography.displayMedium
                    )
                    Text(
                        text = "Start the conversation!",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f),
                        fontWeight = FontWeight.Medium
                    )
                    Text(
                        text = "Send a message to get started",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.4f)
                    )
                }
            }
        } else {
            // Messages list
            LazyColumn(
                state = listState,
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .background(MaterialTheme.colorScheme.background),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(messages) { message ->
                    MessageBubble(
                        message = message,
                        isFromCurrentUser = message.senderId == currentUserId,
                        userBubbleColor = userBubbleColor
                    )
                }
                
                // Add extra space at bottom for better UX
                item {
                    Spacer(modifier = Modifier.height(8.dp))
                }
            }
        }
    }
}

@Composable
private fun MessageBubble(
    message: ChatMessage,
    isFromCurrentUser: Boolean,
    userBubbleColor: String = "blue"
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isFromCurrentUser) {
            Arrangement.End
        } else {
            Arrangement.Start
        }
    ) {
        if (!isFromCurrentUser) {
            // Other user's avatar (left side)
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(MaterialTheme.colorScheme.secondary.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = message.senderName.firstOrNull()?.toString()?.uppercase() ?: "U",
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.secondary,
                    fontSize = 12.sp
                )
            }
            
            Spacer(modifier = Modifier.width(8.dp))
        }
        
        // Message content
        Column(
            horizontalAlignment = if (isFromCurrentUser) {
                Alignment.End
            } else {
                Alignment.Start
            },
            modifier = Modifier.widthIn(max = 280.dp)
        ) {
            // Sender name (for received messages)
            if (!isFromCurrentUser && message.senderName.isNotBlank()) {
                Text(
                    text = message.senderName,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f),
                    fontSize = 11.sp,
                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                )
            }
            
            // Message bubble
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = if (isFromCurrentUser) {
                        MessageBubbleColors.getColorById(userBubbleColor)
                    } else {
                        MaterialTheme.colorScheme.surface
                    }
                ),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                shape = RoundedCornerShape(
                    topStart = if (isFromCurrentUser) 16.dp else 4.dp,
                    topEnd = if (isFromCurrentUser) 4.dp else 16.dp,
                    bottomStart = 16.dp,
                    bottomEnd = 16.dp
                )
            ) {
                Column(
                    modifier = Modifier.padding(12.dp)
                ) {
                    // Message content
                    if (message.content.isNotBlank()) {
                        Text(
                            text = message.getDisplayContent(),
                            style = MaterialTheme.typography.bodyMedium,
                            color = if (isFromCurrentUser) {
                                Color.White
                            } else {
                                MaterialTheme.colorScheme.onSurface
                            }
                        )
                    }
                    
                    // System message styling
                    if (message.isSystemMessage()) {
                        Text(
                            text = message.content,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f),
                            textAlign = TextAlign.Center,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
            
            // Timestamp
            message.createdAt?.let { timestamp ->
                Text(
                    text = formatMessageTimestamp(timestamp.toDate()),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.4f),
                    fontSize = 10.sp,
                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                )
            }
        }
        
        if (isFromCurrentUser) {
            Spacer(modifier = Modifier.width(8.dp))
            
            // Current user's avatar (right side)
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "You".first().toString().uppercase(),
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary,
                    fontSize = 12.sp
                )
            }
        }
    }
}

@Composable
private fun MessageInputBar(
    message: String,
    onMessageChange: (String) -> Unit,
    onSendMessage: () -> Unit,
    isSending: Boolean
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(start = 8.dp, end = 8.dp, top = 8.dp, bottom = 35.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.Bottom
        ) {
            // Message input field with pressed neumorphic style (like SearchBar)
            Box(
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp)
                    .clip(HustleShapes.card)
                    .neumorphic(
                        neuShape = Pressed.Rounded(radius = 4.dp),
                        lightShadowColor = HustleColors.lightShadow,
                        darkShadowColor = HustleColors.darkShadow,
                        elevation = 6.dp,
                        neuInsets = NeuInsets(4.dp, 4.dp),
                        strokeWidth = 6.dp
                    )
                    .background(MaterialTheme.colorScheme.surface)
                    .padding(horizontal = 16.dp),
                contentAlignment = Alignment.CenterStart
            ) {
                BasicTextField(
                    value = message,
                    onValueChange = onMessageChange,
                    textStyle = TextStyle(
                        color = MaterialTheme.colorScheme.onSurface,
                        fontSize = 16.sp
                    ),
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                    keyboardActions = KeyboardActions(
                        onSend = { onSendMessage() }
                    ),
                    cursorBrush = SolidColor(MaterialTheme.colorScheme.primary),
                    modifier = Modifier.fillMaxWidth(),
                    decorationBox = { innerTextField ->
                        if (message.isEmpty()) {
                            Text(
                                text = "Type a message...",
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                                fontSize = 16.sp
                            )
                        }
                        innerTextField()
                    }
                )
            }
            
            // Send button with punched neumorphic style (like store icon)
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .neumorphic(
                        lightShadowColor = HustleColors.lightShadow,
                        darkShadowColor = HustleColors.darkShadow,
                        elevation = if (message.isBlank() || isSending) 4.dp else 8.dp,
                        neuInsets = NeuInsets(4.dp, 4.dp),
                        strokeWidth = if (message.isBlank() || isSending) 2.dp else 4.dp,
                        neuShape = Punched.Rounded(radius = 12.dp)
                    )
                    .background(
                        MaterialTheme.colorScheme.surface,
                        RoundedCornerShape(12.dp)
                    )
                    .clickable(enabled = message.isNotBlank() && !isSending) {
                        onSendMessage()
                    },
                contentAlignment = Alignment.Center
            ) {
                if (isSending) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        strokeWidth = 2.dp,
                        color = MaterialTheme.colorScheme.primary
                    )
                } else {
                    Icon(
                        imageVector = Icons.Default.Send,
                        contentDescription = "Send message",
                        tint = if (message.isBlank()) {
                            MaterialTheme.colorScheme.onSurface.copy(alpha = 0.3f)
                        } else {
                            Color.Blue
                        },
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
        }
    }
}

private fun formatMessageTimestamp(date: Date): String {
    val now = Date()
    val calendar = Calendar.getInstance()
    
    calendar.time = date
    val messageDay = calendar.get(Calendar.DAY_OF_YEAR)
    val messageYear = calendar.get(Calendar.YEAR)
    
    calendar.time = now
    val currentDay = calendar.get(Calendar.DAY_OF_YEAR)
    val currentYear = calendar.get(Calendar.YEAR)
    
    return when {
        messageYear == currentYear && messageDay == currentDay -> {
            // Today - show time only
            SimpleDateFormat("h:mm a", Locale.getDefault()).format(date)
        }
        messageYear == currentYear && (currentDay - messageDay) == 1 -> {
            // Yesterday
            "Yesterday ${SimpleDateFormat("h:mm a", Locale.getDefault()).format(date)}"
        }
        messageYear == currentYear -> {
            // This year - show month/day and time
            SimpleDateFormat("MMM d, h:mm a", Locale.getDefault()).format(date)
        }
        else -> {
            // Different year - show full date
            SimpleDateFormat("MMM d, yyyy h:mm a", Locale.getDefault()).format(date)
        }
    }
}
