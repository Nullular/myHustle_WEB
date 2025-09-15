package com.blueclipse.myhustle.ui.screens.business.booking

import android.util.Log
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.blueclipse.myhustle.data.model.Booking
import com.blueclipse.myhustle.data.model.BookingStatus
import com.blueclipse.myhustle.data.repository.BookingRepository
import com.blueclipse.myhustle.data.repository.ChatRepository
import com.blueclipse.myhustle.ui.components.ColoredTopBar
import com.blueclipse.myhustle.ui.theme.HustleColors
import com.blueclipse.myhustle.ui.theme.fontFamily
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookingRequestsScreen(
    shopId: String? = null, // Optional shop filter
    onBack: () -> Unit = {},
    onNavigateToChat: (String, String) -> Unit = { _, _ -> } // chatId, chatTitle
) {
    var selectedRequest by remember { mutableStateOf<Booking?>(null) }
    var showResponseDialog by remember { mutableStateOf(false) }
    var showMessageDialog by remember { mutableStateOf(false) }
    var bookingRequests by remember { mutableStateOf<List<Booking>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var isUpdating by remember { mutableStateOf(false) }
    
    val currentUser = FirebaseAuth.getInstance().currentUser
    val coroutineScope = rememberCoroutineScope()
    
    // Safely initialize the repository
    val bookingRepository = try {
        BookingRepository.instance
    } catch (e: Exception) {
        null
    }

    // Load booking requests
    LaunchedEffect(currentUser?.uid, shopId) {
        val userId = currentUser?.uid
        if (userId != null && bookingRepository != null) {
            try {
                isLoading = true
                errorMessage = null
                
                val bookings = if (shopId != null) {
                    // Get bookings for specific shop
                    try {
                        bookingRepository.getBookingsForShop(shopId)
                    } catch (e: Exception) {
                        emptyList<Booking>()
                    }
                } else {
                    // Get all bookings for shops owned by current user
                    try {
                        bookingRepository.getBookingsForShopOwner(userId)
                    } catch (e: Exception) {
                        emptyList<Booking>()
                    }
                }
                
                bookingRequests = bookings.filter { it.status == BookingStatus.PENDING }
            } catch (e: Exception) {
                errorMessage = "Failed to load booking requests: ${e.message}"
                bookingRequests = emptyList()
            } finally {
                isLoading = false
            }
        } else {
            if (bookingRepository == null) {
                errorMessage = "Service unavailable. Please try again later."
            } else {
                errorMessage = "Please log in to view booking requests"
            }
            isLoading = false
        }
    }

    Scaffold(
        topBar = {
            ColoredTopBar(
                title = "Booking Requests",
                onBack = onBack,
                cornerRadius = 0.dp
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when {
                isLoading -> {
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center),
                        color = HustleColors.Primary
                    )
                }
                
                errorMessage != null -> {
                    Column(
                        modifier = Modifier.align(Alignment.Center),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = errorMessage!!,
                            color = MaterialTheme.colorScheme.error,
                            modifier = Modifier.padding(16.dp)
                        )
                        Button(
                            onClick = {
                                // Retry loading
                                isLoading = true
                                errorMessage = null
                            }
                        ) {
                            Text("Retry")
                        }
                    }
                }
                
                bookingRequests.isEmpty() -> {
                    Column(
                        modifier = Modifier
                            .align(Alignment.Center)
                            .padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            Icons.Default.CalendarToday,
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            tint = HustleColors.Secondary.copy(alpha = 0.6f)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "No Pending Requests",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold,
                            color = HustleColors.Primary
                        )
                        Text(
                            text = "All booking requests will appear here",
                            style = MaterialTheme.typography.bodyMedium,
                            color = HustleColors.Secondary,
                            modifier = Modifier.padding(top = 8.dp)
                        )
                    }
                }
                
                else -> {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        contentPadding = PaddingValues(vertical = 16.dp)
                    ) {
                        item {
                            RequestsHeaderCard(pendingCount = bookingRequests.count { it.status == BookingStatus.PENDING })
                        }
                        
                        items(bookingRequests) { request ->
                            BookingRequestCard(
                                request = request,
                                onAccept = { 
                                    selectedRequest = request
                                    showResponseDialog = true
                                },
                                onDeny = { 
                                    selectedRequest = request
                                    showResponseDialog = true
                                },
                                onMessage = {
                                    selectedRequest = request
                                    showMessageDialog = true
                                }
                            )
                        }
                    }
                }
            }
        }
    }
    
    // Response Dialog (Accept/Deny)
    if (showResponseDialog && selectedRequest != null) {
        BookingResponseDialog(
            request = selectedRequest!!,
            isUpdating = isUpdating,
            onDismiss = { 
                if (!isUpdating) {
                    showResponseDialog = false
                    selectedRequest = null
                }
            },
            onConfirm = { action, message ->
                // Update booking status in Firebase and send message
                selectedRequest?.let { request ->
                    isUpdating = true
                    coroutineScope.launch {
                        try {
                            val currentUserId = currentUser?.uid
                            if (currentUserId == null) {
                                errorMessage = "User not authenticated"
                                return@launch
                            }
                            
                            val newStatus = if (action == "accept") BookingStatus.ACCEPTED else BookingStatus.DENIED
                            
                            // Update booking status
                            bookingRepository?.updateBookingStatus(
                                bookingId = request.id,
                                status = newStatus,
                                responseMessage = message
                            )?.onSuccess {
                                // Update local state only after successful Firebase update
                                val index = bookingRequests.indexOfFirst { it.id == request.id }
                                if (index != -1) {
                                    val updatedBookings = bookingRequests.toMutableList().apply {
                                        set(index, request.copy(
                                            status = newStatus,
                                            responseMessage = message,
                                            updatedAt = System.currentTimeMillis()
                                        ))
                                    }
                                    // Keep only pending requests in the list
                                    bookingRequests = updatedBookings.filter { it.status == BookingStatus.PENDING }
                                }
                                
                                // Send notification message through new chat system
                                if (message.isNotBlank()) {
                                    coroutineScope.launch {
                                        try {
                                            val chatRepository = ChatRepository.instance
                                            val actionText = if (action == "accept") "accepted" else "declined"
                                            
                                            // Create or get existing chat with the customer
                                            val chatResult = chatRepository.createOrGetDirectChat(request.customerId)
                                            
                                            if (chatResult.isSuccess) {
                                                val chatId = chatResult.getOrNull()!!
                                                
                                                // Send the response message
                                                chatRepository.sendMessage(
                                                    chatId = chatId,
                                                    content = "Your booking for ${request.serviceName} has been $actionText. $message"
                                                )
                                            }
                                        } catch (e: Exception) {
                                            Log.e("BookingRequests", "Failed to send chat message: ${e.message}")
                                            // Don't show error to user as booking update was successful
                                        }
                                    }
                                }
                            }?.onFailure { exception ->
                                errorMessage = "Failed to update booking: ${exception.message}"
                            }
                        } catch (e: Exception) {
                            errorMessage = "Failed to update booking: ${e.message}"
                        } finally {
                            isUpdating = false
                            showResponseDialog = false
                            selectedRequest = null
                        }
                    }
                }
            }
        )
    }
    
    // Message Dialog
    if (showMessageDialog && selectedRequest != null) {
        MessageCustomerDialog(
            customerName = selectedRequest!!.customerName,
            onDismiss = { 
                showMessageDialog = false
                selectedRequest = null
            },
            onSendMessage = { message, navigateToChat ->
                // Capture the selected request immediately to prevent race conditions
                val capturedRequest = selectedRequest
                Log.d("BookingRequests", "onSendMessage called - capturedRequest: ${capturedRequest?.id}, message: '$message'")
                
                // Handle message sending using new ChatRepository
                coroutineScope.launch {
                    try {
                        if (capturedRequest == null) {
                            Log.e("BookingRequests", "Selected request is null")
                            errorMessage = "No booking selected"
                            return@launch
                        }
                        
                        val currentUserId = currentUser?.uid
                        if (currentUserId == null) {
                            Log.e("BookingRequests", "Current user ID is null")
                            errorMessage = "User not authenticated"
                            return@launch
                        }
                        
                        Log.d("BookingRequests", "Processing booking request: ID=${capturedRequest.id}, Customer=${capturedRequest.customerName}")
                        
                        Log.d("BookingRequests", "Getting ChatRepository instance...")
                        val chatRepository = ChatRepository.instance
                        
                        Log.d("BookingRequests", "ChatRepository obtained successfully")
                        
                        // Create or get existing chat with the customer
                        val chatResult = chatRepository.createOrGetDirectChat(capturedRequest.customerId)
                        
                        if (chatResult.isSuccess) {
                            val chatId = chatResult.getOrNull()!!
                            
                            // Send the booking-related message
                            val messageResult = chatRepository.sendMessage(
                                chatId = chatId,
                                content = "Regarding your booking for ${capturedRequest.serviceName}: $message"
                            )
                            
                            if (messageResult.isSuccess) {
                                Log.d("BookingRequests", "Message sent successfully")
                                showMessageDialog = false
                                selectedRequest = null
                                
                                if (navigateToChat) {
                                    Log.d("BookingRequests", "Navigating to chat screen")
                                    onNavigateToChat(chatId, capturedRequest.customerName)
                                }
                            } else {
                                Log.e("BookingRequests", "Failed to send message: ${messageResult.exceptionOrNull()?.message}")
                                errorMessage = "Failed to send message. Please try again."
                            }
                        } else {
                            Log.e("BookingRequests", "Failed to create/get chat: ${chatResult.exceptionOrNull()?.message}")
                            errorMessage = "Failed to create chat. Please try again."
                        }
                    } catch (e: Exception) {
                        Log.e("BookingRequests", "Exception sending message", e)
                        errorMessage = "Failed to send message: ${e.message}"
                    } finally {
                        // Always close dialog after attempting to send
                        showMessageDialog = false
                        selectedRequest = null
                    }
                }
            }
        )
    }
}

@Composable
private fun RequestsHeaderCard(pendingCount: Int) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        color = HustleColors.LightestBlue,
        shadowElevation = 2.dp
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Filled.NotificationImportant,
                contentDescription = "Pending Requests",
                tint = Color(0xFFFF9800),
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(
                    text = "$pendingCount Pending Requests",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black,
                    fontFamily = fontFamily
                )
                Text(
                    text = "Review and respond to customer booking requests",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
            }
        }
    }
}

@Composable
private fun BookingRequestCard(
    request: Booking,
    onAccept: () -> Unit,
    onDeny: () -> Unit,
    onMessage: () -> Unit
) {
    val statusColor = when (request.status) {
        BookingStatus.PENDING -> Color(0xFFFF9800)
        BookingStatus.ACCEPTED -> Color(0xFF4CAF50)
        BookingStatus.DENIED -> Color(0xFFF44336)
        BookingStatus.COMPLETED -> Color(0xFF2196F3)
        BookingStatus.CANCELLED -> Color(0xFF9E9E9E)
        BookingStatus.MODIFIED -> Color(0xFF9C27B0)
    }
    
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        color = Color.White,
        shadowElevation = 2.dp
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            // Customer Info & Status
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        shape = CircleShape,
                        color = HustleColors.BlueAccent.copy(alpha = 0.1f),
                        modifier = Modifier.size(40.dp)
                    ) {
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier.fillMaxSize()
                        ) {
                            Text(
                                text = request.customerName.firstOrNull()?.toString()?.uppercase() ?: "?",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = HustleColors.BlueAccent
                            )
                        }
                    }
                    
                    Spacer(modifier = Modifier.width(12.dp))
                    
                    Column {
                        Text(
                            text = request.customerName.ifEmpty { "Unknown Customer" },
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color.Black
                        )
                        Text(
                            text = request.customerEmail.ifEmpty { "No email provided" },
                            fontSize = 12.sp,
                            color = Color.Gray
                        )
                    }
                }
                
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = statusColor.copy(alpha = 0.1f)
                ) {
                    Text(
                        text = request.status.name,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = statusColor,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Service Details
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = HustleColors.LightestBlue.copy(alpha = 0.5f)
            ) {
                Column(
                    modifier = Modifier.padding(12.dp)
                ) {
                    Text(
                        text = request.serviceName.ifEmpty { "Service not specified" },
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color.Black
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Row {
                        Icon(
                            imageVector = Icons.Filled.CalendarToday,
                            contentDescription = "Date",
                            tint = Color.Gray,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "${request.requestedDate.ifEmpty { "No date" }} at ${request.requestedTime.ifEmpty { "No time" }}",
                            fontSize = 12.sp,
                            color = Color.Gray
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Customer Message
            Text(
                text = "Message:",
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = Color.Gray
            )
            Text(
                text = request.notes.ifEmpty { "No message provided" },
                fontSize = 14.sp,
                color = Color.Black,
                lineHeight = 18.sp,
                modifier = Modifier.padding(top = 4.dp)
            )
            
            // Action Buttons (only for pending requests)
            if (request.status == BookingStatus.PENDING) {
                Spacer(modifier = Modifier.height(12.dp))
                
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = onMessage,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Message,
                            contentDescription = "Message",
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Message")
                    }
                    
                    OutlinedButton(
                        onClick = onDeny,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = Color(0xFFF44336)
                        )
                    ) {
                        Text("Deny")
                    }
                    
                    Button(
                        onClick = onAccept,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF4CAF50)
                        )
                    ) {
                        Text("Accept")
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun BookingResponseDialog(
    request: Booking,
    isUpdating: Boolean = false,
    onDismiss: () -> Unit,
    onConfirm: (action: String, message: String) -> Unit
) {
    var responseMessage by remember { mutableStateOf("") }
    var isAccepting by remember { mutableStateOf(true) }
    
    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = Color.White
        ) {
            Column(
                modifier = Modifier.padding(20.dp)
            ) {
                Text(
                    text = if (isAccepting) "Accept Booking Request" else "Deny Booking Request",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Text(
                    text = "Customer: ${request.customerName}",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
                Text(
                    text = "Service: ${request.serviceName}",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
                Text(
                    text = "Date: ${request.requestedDate} at ${request.requestedTime}",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                OutlinedTextField(
                    value = responseMessage,
                    onValueChange = { responseMessage = it },
                    label = { Text("Response Message") },
                    placeholder = { 
                        Text(if (isAccepting) "Booking confirmed! Looking forward to seeing you." else "Sorry, this time slot is not available.")
                    },
                    modifier = Modifier.fillMaxWidth(),
                    maxLines = 3,
                    shape = RoundedCornerShape(12.dp)
                )
                
                Spacer(modifier = Modifier.height(20.dp))
                
                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        enabled = !isUpdating,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Cancel")
                    }
                    
                    Button(
                        onClick = { 
                            isAccepting = false
                            onConfirm("deny", responseMessage)
                        },
                        enabled = !isUpdating,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFFF44336)
                        )
                    ) {
                        if (isUpdating) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(16.dp),
                                color = Color.White,
                                strokeWidth = 2.dp
                            )
                        } else {
                            Text("Deny")
                        }
                    }
                    
                    Button(
                        onClick = { 
                            isAccepting = true
                            onConfirm("accept", responseMessage)
                        },
                        enabled = !isUpdating,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF4CAF50)
                        )
                    ) {
                        if (isUpdating) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(16.dp),
                                color = Color.White,
                                strokeWidth = 2.dp
                            )
                        } else {
                            Text("Accept")
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun MessageCustomerDialog(
    customerName: String,
    onDismiss: () -> Unit,
    onSendMessage: (String, Boolean) -> Unit
) {
    var message by remember { mutableStateOf("") }
    
    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = Color.White
        ) {
            Column(
                modifier = Modifier.padding(20.dp)
            ) {
                Text(
                    text = "Message Customer",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Text(
                    text = "Send a message to $customerName",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                OutlinedTextField(
                    value = message,
                    onValueChange = { message = it },
                    label = { Text("Your Message") },
                    placeholder = { Text("Type your message here...") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(120.dp),
                    maxLines = 4,
                    shape = RoundedCornerShape(12.dp)
                )
                
                Spacer(modifier = Modifier.height(20.dp))
                
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Cancel")
                    }
                    
                    Button(
                        onClick = { 
                            onSendMessage(message, false) // Send only, don't navigate
                        },
                        enabled = message.isNotBlank(),
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = HustleColors.BlueAccent
                        )
                    ) {
                        Text("Send")
                    }
                    
                    Button(
                        onClick = { 
                            onSendMessage(message, true) // Send and navigate to chat
                        },
                        enabled = message.isNotBlank(),
                        modifier = Modifier.weight(1.2f),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF4CAF50) // Success green
                        )
                    ) {
                        Text("Send & Chat", fontSize = 13.sp)
                    }
                }
            }
        }
    }
}
