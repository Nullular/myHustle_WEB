package com.blueclipse.myhustle.ui.screens.messaging

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.activity.compose.BackHandler
import android.util.Log
import com.blueclipse.myhustle.data.model.*
import com.blueclipse.myhustle.data.repository.ChatRepository
import com.blueclipse.myhustle.data.repository.UserRepository
import com.blueclipse.myhustle.ui.theme.MessageBubbleColors
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ModernMessagingScreen(
    onBack: () -> Unit,
    onChatClick: (String, String) -> Unit
) {
    val chatRepository = ChatRepository.instance
    val userRepository = UserRepository.instance
    val userChats by chatRepository.userChats.collectAsState()
    val isLoading by chatRepository.isLoading.collectAsState()
    val currentUserId = FirebaseAuth.getInstance().currentUser?.uid ?: ""
    val coroutineScope = rememberCoroutineScope()
    
    var showUserSearch by remember { mutableStateOf(false) }
    var searchQuery by remember { mutableStateOf("") }
    var searchResults by remember { mutableStateOf<List<User>>(emptyList()) }
    var isSearching by remember { mutableStateOf(false) }
    
    // Color picker state
    var showColorPicker by remember { mutableStateOf(false) }
    var currentUser by remember { mutableStateOf<User?>(null) }
    
    // Load current user
    LaunchedEffect(currentUserId) {
        if (currentUserId.isNotEmpty()) {
            val result = userRepository.getUserById(currentUserId)
            result.onSuccess { user ->
                currentUser = user
            }
        }
    }
    
    val keyboardController = LocalSoftwareKeyboardController.current
    
    // Handle system back gesture
    BackHandler {
        Log.d("ModernMessagingScreen", "🔴 System back gesture intercepted!")
        onBack()
    }
    
    Scaffold(
        topBar = {
            if (showUserSearch) {
                // Search mode top bar
                TopAppBar(
                    title = {
                        OutlinedTextField(
                            value = searchQuery,
                            onValueChange = { query ->
                                searchQuery = query
                                if (query.isNotBlank()) {
                                    isSearching = true
                                    coroutineScope.launch {
                                        try {
                                            val results = chatRepository.searchUsers(query)
                                            searchResults = results.filter { it.id != currentUserId }
                                        } catch (e: Exception) {
                                            Log.e("ModernMessagingScreen", "Error searching users", e)
                                            searchResults = emptyList()
                                        } finally {
                                            isSearching = false
                                        }
                                    }
                                } else {
                                    searchResults = emptyList()
                                }
                            },
                            placeholder = { Text("Search by email or name...") },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                            keyboardActions = KeyboardActions(
                                onSearch = { keyboardController?.hide() }
                            ),
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = MaterialTheme.colorScheme.primary,
                                unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.5f)
                            )
                        )
                    },
                    navigationIcon = {
                        IconButton(onClick = { 
                            showUserSearch = false
                            searchQuery = ""
                            searchResults = emptyList()
                            keyboardController?.hide()
                        }) {
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
            } else {
                // Normal mode top bar
                TopAppBar(
                    title = {
                        Text(
                            text = "Messages",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
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
                    actions = {
                        IconButton(onClick = { showColorPicker = true }) {
                            Icon(
                                imageVector = Icons.Default.Palette,
                                contentDescription = "Message Color",
                                tint = MaterialTheme.colorScheme.primary
                            )
                        }
                        IconButton(onClick = { showUserSearch = true }) {
                            Icon(
                                imageVector = Icons.Default.Add,
                                contentDescription = "New Chat",
                                tint = MaterialTheme.colorScheme.primary
                            )
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.surface
                    )
                )
            }
        }
    ) { paddingValues ->
        
        if (showUserSearch) {
            // User search screen
            UserSearchScreen(
                searchQuery = searchQuery,
                searchResults = searchResults,
                isSearching = isSearching,
                currentUserId = currentUserId,
                onUserClick = { user ->
                    coroutineScope.launch {
                        try {
                            Log.d("ModernMessagingScreen", "Starting chat with user: ${user.displayName}")
                            val result = chatRepository.createOrGetDirectChat(user.id)
                            
                            if (result.isSuccess) {
                                val chatId = result.getOrThrow()
                                val displayName = user.displayName.takeIf { it.isNotBlank() } ?: "${user.profile.firstName} ${user.profile.lastName}".trim().ifEmpty { "Unknown User" }
                                
                                // Reset search state
                                showUserSearch = false
                                searchQuery = ""
                                searchResults = emptyList()
                                keyboardController?.hide()
                                
                                // Navigate to chat
                                onChatClick(chatId, displayName)
                            } else {
                                Log.e("ModernMessagingScreen", "Failed to create chat: ${result.exceptionOrNull()}")
                            }
                        } catch (e: Exception) {
                            Log.e("ModernMessagingScreen", "Error starting chat", e)
                        }
                    }
                },
                paddingValues = paddingValues
            )
        } else {
            // Chat list screen
            ChatListScreen(
                userChats = userChats,
                isLoading = isLoading,
                currentUserId = currentUserId,
                onChatClick = onChatClick,
                paddingValues = paddingValues
            )
        }
    }
    
    // Color picker dialog
    if (showColorPicker) {
        MessageBubbleColorPickerDialog(
            currentColor = currentUser?.profile?.preferences?.messaging?.bubbleColor ?: "blue",
            onDismiss = { showColorPicker = false },
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
                        Log.e("ModernMessagingScreen", "Failed to update bubble color", e)
                    }
                }
            }
        )
    }
}

@Composable
private fun ChatListScreen(
    userChats: List<UserMembership>,
    isLoading: Boolean,
    currentUserId: String,
    onChatClick: (String, String) -> Unit,
    paddingValues: PaddingValues
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(paddingValues)
            .background(MaterialTheme.colorScheme.background),
        contentPadding = PaddingValues(vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(1.dp)
    ) {
        if (isLoading) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }
        } else if (userChats.isEmpty()) {
            item {
                EmptyChatState()
            }
        } else {
            items(userChats) { membership ->
                ChatListItem(
                    membership = membership,
                    currentUserId = currentUserId,
                    onClick = { 
                        onChatClick(membership.chatId, membership.title)
                    }
                )
            }
        }
    }
}

@Composable
private fun ChatListItem(
    membership: UserMembership,
    currentUserId: String,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(horizontal = 16.dp, vertical = 4.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
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
                    text = membership.title.firstOrNull()?.toString()?.uppercase() ?: "U",
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
                        text = membership.title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = if (membership.unreadCount > 0) FontWeight.Bold else FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurface,
                        modifier = Modifier.weight(1f),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        // Timestamp
                        membership.lastMessageAt?.let { timestamp ->
                            val timeDisplay = formatTimestamp(timestamp.toDate())
                            Text(
                                text = timeDisplay,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                            )
                        }
                        
                        // Unread badge
                        if (membership.unreadCount > 0) {
                            Box(
                                modifier = Modifier
                                    .size(20.dp)
                                    .clip(CircleShape)
                                    .background(MaterialTheme.colorScheme.primary),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = if (membership.unreadCount > 9) "9+" else membership.unreadCount.toString(),
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onPrimary,
                                    fontSize = 10.sp
                                )
                            }
                        }
                    }
                }
                
                Text(
                    text = membership.lastMessageContent.ifEmpty { "No messages yet" },
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface.copy(
                        alpha = if (membership.unreadCount > 0) 0.9f else 0.6f
                    ),
                    fontWeight = if (membership.unreadCount > 0) FontWeight.Medium else FontWeight.Normal,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}

@Composable
private fun UserSearchScreen(
    searchQuery: String,
    searchResults: List<User>,
    isSearching: Boolean,
    currentUserId: String,
    onUserClick: (User) -> Unit,
    paddingValues: PaddingValues
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(paddingValues)
            .background(MaterialTheme.colorScheme.background),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        if (searchQuery.isBlank()) {
            item {
                SearchInstructions()
            }
        } else if (isSearching) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(16.dp),
                            strokeWidth = 2.dp,
                            color = MaterialTheme.colorScheme.primary
                        )
                        Text(
                            text = "Searching...",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
                        )
                    }
                }
            }
        } else if (searchResults.isEmpty()) {
            item {
                NoUsersFound(searchQuery)
            }
        } else {
            items(searchResults) { user ->
                UserSearchResultItem(
                    user = user,
                    onClick = { onUserClick(user) }
                )
            }
        }
    }
}

@Composable
private fun UserSearchResultItem(
    user: User,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Avatar
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.secondary.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = (user.displayName.takeIf { it.isNotBlank() } ?: user.profile.firstName.takeIf { it.isNotBlank() } ?: "U").first().toString().uppercase(),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.secondary
                )
            }
            
            // User info
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(2.dp)
            ) {
                Text(
                    text = user.displayName.takeIf { it.isNotBlank() } ?: "${user.profile.firstName} ${user.profile.lastName}".trim().ifEmpty { "Unknown User" },
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                Text(
                    text = user.email,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                )
            }
            
            // Start chat icon
            Icon(
                imageVector = Icons.Default.Chat,
                contentDescription = "Start chat",
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(24.dp)
            )
        }
    }
}

@Composable
private fun EmptyChatState() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(32.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Chat,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.4f)
            )
            Text(
                text = "No messages yet",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f),
                fontWeight = FontWeight.Medium
            )
            Text(
                text = "Tap the + button to start a new conversation",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.4f)
            )
        }
    }
}

@Composable
private fun SearchInstructions() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f)
        ),
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.3f))
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Search,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = "Find users to chat with",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
            }
            
            Text(
                text = "Search by email address or display name to start a new conversation.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f)
            )
            
            Text(
                text = "Examples:\n• nathan123dejager@gmail.com\n• Nathan\n• John Smith",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f)
            )
        }
    }
}

@Composable
private fun NoUsersFound(searchQuery: String) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.1f)
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = Icons.Default.PersonOff,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.error.copy(alpha = 0.6f),
                modifier = Modifier.size(32.dp)
            )
            Text(
                text = "No users found",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.error.copy(alpha = 0.8f)
            )
            Text(
                text = "No users match \"$searchQuery\". Try a different search term or check the spelling.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
            )
        }
    }
}

private fun formatTimestamp(date: Date): String {
    val now = Date()
    val diffInMillis = now.time - date.time
    val diffInMinutes = diffInMillis / (1000 * 60)
    val diffInHours = diffInMinutes / 60
    val diffInDays = diffInHours / 24
    
    return when {
        diffInMinutes < 1 -> "Just now"
        diffInMinutes < 60 -> "${diffInMinutes}m"
        diffInHours < 24 -> "${diffInHours}h"
        diffInDays < 7 -> "${diffInDays}d"
        else -> SimpleDateFormat("MMM d", Locale.getDefault()).format(date)
    }
}

@Composable
private fun MessageBubbleColorPickerDialog(
    currentColor: String,
    onDismiss: () -> Unit,
    onColorSelected: (String) -> Unit
) {
    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            shape = RoundedCornerShape(16.dp),
            color = MaterialTheme.colorScheme.surface
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Choose Bubble Color",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    
                    IconButton(onClick = onDismiss) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(24.dp))
                
                // Color options in a grid
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    val colorOptions = MessageBubbleColors.availableColors
                    val chunkedOptions = colorOptions.chunked(2)
                    
                    items(chunkedOptions) { rowOptions ->
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(32.dp)
                        ) {
                            rowOptions.forEach { option ->
                                ColorOptionItem(
                                    colorOption = option,
                                    isSelected = option.id == currentColor,
                                    onClick = { onColorSelected(option.id) }
                                )
                            }
                            
                            // Add empty space if odd number of items in last row
                            if (rowOptions.size == 1) {
                                Spacer(modifier = Modifier.size(120.dp))
                            }
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(24.dp))
                
                // Current selection info
                val currentOption = MessageBubbleColors.getColorOptionById(currentColor)
                if (currentOption != null) {
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.primaryContainer
                        ),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(24.dp)
                                    .clip(CircleShape)
                                    .background(currentOption.color)
                            )
                            
                            Spacer(modifier = Modifier.width(12.dp))
                            
                            Text(
                                text = "Current: ${currentOption.name}",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onPrimaryContainer,
                                fontWeight = FontWeight.Medium
                            )
                        }
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
