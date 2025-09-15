package com.blueclipse.myhustle.ui.screens.messaging

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.activity.compose.BackHandler
import android.util.Log
import com.blueclipse.myhustle.data.model.Conversation
import com.blueclipse.myhustle.data.repository.MessageRepository
import com.blueclipse.myhustle.data.repository.UserRepository
import com.blueclipse.myhustle.ui.theme.MessageBubbleColors
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.launch
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MessagingScreen(
    onBack: () -> Unit,
    onConversationClick: (String, String) -> Unit
) {
    val messageRepository = MessageRepository.instance
    val userRepository = UserRepository.instance
    val conversations by messageRepository.conversations.collectAsState()
    val currentUserId = FirebaseAuth.getInstance().currentUser?.uid ?: ""
    val currentUserEmail = FirebaseAuth.getInstance().currentUser?.email ?: ""
    val coroutineScope = rememberCoroutineScope()
    
    // Color picker state
    var showColorPicker by remember { mutableStateOf(false) }
    var currentUser by remember { mutableStateOf<com.blueclipse.myhustle.data.model.User?>(null) }
    
    // Load current user
    LaunchedEffect(currentUserId) {
        if (currentUserId.isNotEmpty()) {
            val result = userRepository.getUserById(currentUserId)
            result.onSuccess { user ->
                currentUser = user
            }
        }
    }
    
    // Handle system back gesture
    BackHandler {
        Log.d("MessagingScreen", "🔴 System back gesture intercepted!")
        onBack()
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Messages",
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
                actions = {
                    // Color picker button
                    IconButton(onClick = { showColorPicker = true }) {
                        Icon(
                            imageVector = Icons.Default.Palette,
                            contentDescription = "Change bubble color",
                            tint = currentUser?.profile?.preferences?.messaging?.bubbleColor?.let { 
                                MessageBubbleColors.getColorById(it) 
                            } ?: MessageBubbleColors.getDefaultColor()
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background,
                    titleContentColor = MaterialTheme.colorScheme.onBackground,
                    navigationIconContentColor = MaterialTheme.colorScheme.onBackground
                )
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(MaterialTheme.colorScheme.background),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Test Messaging Section
            item {
                TestMessagingSection(
                    currentUserEmail = currentUserEmail,
                    onTestChatClick = { receiverEmail, receiverName ->
                        Log.d("MessagingScreen", "Test chat clicked - Receiver: $receiverEmail")
                        coroutineScope.launch {
                            // Create a simple conversation ID based on emails
                            val conversationId = if (currentUserEmail < receiverEmail) {
                                "${currentUserEmail}_${receiverEmail}".replace("@gmail.com", "").replace(".", "_")
                            } else {
                                "${receiverEmail}_${currentUserEmail}".replace("@gmail.com", "").replace(".", "_")
                            }
                            Log.d("MessagingScreen", "Generated conversationId: $conversationId")
                            onConversationClick(conversationId, receiverName)
                        }
                    }
                )
            }
            
            // Divider
            item {
                HorizontalDivider(
                    modifier = Modifier.padding(vertical = 8.dp),
                    color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
                )
            }
            if (conversations.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Person,
                                contentDescription = null,
                                modifier = Modifier.size(48.dp),
                                tint = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.4f)
                            )
                            Text(
                                text = "No messages yet",
                                style = MaterialTheme.typography.bodyLarge,
                                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
                            )
                            Text(
                                text = "Your booking conversations will appear here",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.4f)
                            )
                        }
                    }
                }
            } else {
                items(conversations) { conversation ->
                    ConversationCard(
                        conversation = conversation,
                        currentUserId = currentUserId,
                        onClick = { 
                            val otherParticipantName = conversation.participantNames.entries
                                .firstOrNull { it.key != currentUserId }?.value ?: "Unknown User"
                            onConversationClick(conversation.id, otherParticipantName)
                        }
                    )
                }
            }
        }
    }
    
    // Color Picker Dialog
    if (showColorPicker) {
        MessageBubbleColorPickerDialog(
            currentColor = currentUser?.profile?.preferences?.messaging?.bubbleColor ?: "blue",
            onColorSelected = { colorId ->
                coroutineScope.launch {
                    try {
                        userRepository.updateMessageBubbleColor(currentUserId, colorId)
                        // Reload user data
                        val result = userRepository.getUserById(currentUserId)
                        result.onSuccess { user ->
                            currentUser = user
                        }
                        showColorPicker = false
                    } catch (e: Exception) {
                        Log.e("MessagingScreen", "Failed to update bubble color", e)
                    }
                }
            },
            onDismiss = { showColorPicker = false }
        )
    }
}

@Composable
private fun ConversationCard(
    conversation: Conversation,
    currentUserId: String,
    onClick: () -> Unit
) {
    // Get the other participant's name
    val otherParticipantName = conversation.participantNames.entries
        .firstOrNull { it.key != currentUserId }?.value ?: "Unknown User"
    
    // Get unread count for current user
    val unreadCount = conversation.unreadCount[currentUserId] ?: 0
    
    // Parse timestamp for display
    val timeDisplay = try {
        val timestamp = LocalDateTime.parse(conversation.lastMessageTime, DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        val now = LocalDateTime.now()
        when {
            timestamp.toLocalDate() == now.toLocalDate() -> timestamp.format(DateTimeFormatter.ofPattern("HH:mm"))
            timestamp.toLocalDate() == now.toLocalDate().minusDays(1) -> "Yesterday"
            else -> timestamp.format(DateTimeFormatter.ofPattern("MMM dd"))
        }
    } catch (e: Exception) {
        ""
    }
    
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(80.dp)
            .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(16.dp))
            .clickable { onClick() }
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Avatar
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = otherParticipantName.firstOrNull()?.toString()?.uppercase() ?: "U",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
            }
            
            // Content
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = otherParticipantName,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface,
                        modifier = Modifier.weight(1f),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        if (timeDisplay.isNotEmpty()) {
                            Text(
                                text = timeDisplay,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                            )
                        }
                        
                        if (unreadCount > 0) {
                            Box(
                                modifier = Modifier
                                    .size(20.dp)
                                    .clip(CircleShape)
                                    .background(MaterialTheme.colorScheme.primary),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = if (unreadCount > 9) "9+" else unreadCount.toString(),
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onPrimary,
                                    fontSize = 10.sp
                                )
                            }
                        }
                    }
                }
                
                Text(
                    text = conversation.lastMessage.ifEmpty { "No messages yet" },
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}

@Composable
private fun TestMessagingSection(
    currentUserEmail: String,
    onTestChatClick: (String, String) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f)
        ),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.3f))
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Chat,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = "🧪 Test Messaging",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
            }
            
            Text(
                text = "Quick test chats with your accounts:",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f)
            )
            
            // Test account buttons
            val testAccounts = listOf(
                "nathan123dejager@gmail.com" to "Nathan (Primary)",
                "tht@gmail.com" to "Test Account"
            )
            
            testAccounts.forEach { (email, displayName) ->
                if (email != currentUserEmail) {
                    TestAccountButton(
                        displayName = displayName,
                        email = email,
                        onClick = { onTestChatClick(email, displayName) }
                    )
                }
            }
            
            Text(
                text = "Currently signed in as: $currentUserEmail",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f)
            )
        }
    }
}

@Composable
private fun TestAccountButton(
    displayName: String,
    email: String,
    onClick: () -> Unit
) {
    OutlinedButton(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        colors = ButtonDefaults.outlinedButtonColors(
            contentColor = MaterialTheme.colorScheme.primary
        ),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.primary)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(
                horizontalAlignment = Alignment.Start
            ) {
                Text(
                    text = displayName,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = email,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
                )
            }
            Icon(
                imageVector = Icons.Default.Chat,
                contentDescription = "Start chat",
                modifier = Modifier.size(20.dp)
            )
        }
    }
}

@Composable
private fun MessageBubbleColorPickerDialog(
    currentColor: String,
    onColorSelected: (String) -> Unit,
    onDismiss: () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface
            )
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Title
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Palette,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        text = "Choose Bubble Color",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
                
                Text(
                    text = "Select a color for your message bubbles",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
                
                // Color options grid
                LazyRow(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    contentPadding = PaddingValues(vertical = 8.dp)
                ) {
                    items(MessageBubbleColors.availableColors) { colorOption ->
                        ColorOptionItem(
                            colorOption = colorOption,
                            isSelected = colorOption.id == currentColor,
                            onClick = { onColorSelected(colorOption.id) }
                        )
                    }
                }
                
                // Action buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(
                        onClick = onDismiss,
                        colors = ButtonDefaults.textButtonColors(
                            contentColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                        )
                    ) {
                        Text("Cancel")
                    }
                }
            }
        }
    }
}

@Composable
private fun ColorOptionItem(
    colorOption: MessageBubbleColors.BubbleColorOption,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier
            .clickable { onClick() }
            .padding(8.dp)
    ) {
        // Color circle with selection indicator
        Box(
            modifier = Modifier
                .size(60.dp)
                .clip(CircleShape)
                .background(colorOption.color)
                .then(
                    if (isSelected) {
                        Modifier.border(
                            4.dp, 
                            MaterialTheme.colorScheme.primary, 
                            CircleShape
                        )
                    } else {
                        Modifier.border(
                            2.dp, 
                            MaterialTheme.colorScheme.outline.copy(alpha = 0.3f), 
                            CircleShape
                        )
                    }
                ),
            contentAlignment = Alignment.Center
        ) {
            if (isSelected) {
                Icon(
                    imageVector = Icons.Default.Check,
                    contentDescription = "Selected",
                    tint = Color.White,
                    modifier = Modifier.size(24.dp)
                )
            }
        }
        
        // Color name
        Text(
            text = colorOption.name,
            style = MaterialTheme.typography.bodySmall,
            color = if (isSelected) {
                MaterialTheme.colorScheme.primary
            } else {
                MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
            },
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
            maxLines = 2,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
    }
}
