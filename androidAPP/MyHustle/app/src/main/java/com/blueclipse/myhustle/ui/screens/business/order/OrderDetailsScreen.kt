package com.blueclipse.myhustle.ui.screens.business.order

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.blueclipse.myhustle.data.model.Order
import com.blueclipse.myhustle.data.model.OrderItem
import com.blueclipse.myhustle.data.model.OrderStatus
import com.blueclipse.myhustle.ui.theme.HustleColors
import com.blueclipse.myhustle.ui.theme.fontFamily
import java.text.SimpleDateFormat
import java.util.*
import me.nikhilchaudhari.library.NeuInsets
import me.nikhilchaudhari.library.neumorphic
import me.nikhilchaudhari.library.shapes.Punched
import me.nikhilchaudhari.library.shapes.Pressed

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderDetailsScreen(
    order: Order,
    onBack: () -> Unit,
    onStatusChanged: (OrderStatus) -> Unit
) {
    var showStatusDialog by remember { mutableStateOf(false) }
    
    if (showStatusDialog) {
        OrderStatusUpdateDialog(
            currentStatus = order.status,
            onStatusSelected = { newStatus ->
                onStatusChanged(newStatus)
                showStatusDialog = false
            },
            onDismiss = { showStatusDialog = false }
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        "Order #${order.orderNumber}",
                        color = Color.White,
                        fontFamily = fontFamily
                    ) 
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.White
                        )
                    }
                },
                actions = {
                    IconButton(
                        onClick = { showStatusDialog = true }
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Edit,
                            contentDescription = "Update Status",
                            tint = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = HustleColors.Primary,
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White,
                    actionIconContentColor = Color.White
                )
            )
        }
    ) { paddingValues ->
        // Outer large pressed neumorphic container wrapping all sections
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp, vertical = 24.dp)
                .clip(RoundedCornerShape(20.dp))
                .neumorphic(
                    lightShadowColor = HustleColors.lightShadow,
                    darkShadowColor = HustleColors.darkShadow,
                    elevation = 8.dp,
                    neuInsets = NeuInsets(6.dp, 6.dp),
                    strokeWidth = 4.dp,
                    neuShape = Pressed.Rounded(radius = 8.dp)
                )
                .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(20.dp))
                .padding(24.dp)
        ) {
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(vertical = 0.dp)
        ) {
            // Order Status Section
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .neumorphic(
                            lightShadowColor = HustleColors.lightShadow,
                            darkShadowColor = HustleColors.darkShadow,
                            elevation = 4.dp,
                            neuInsets = NeuInsets(4.dp, 4.dp),
                            strokeWidth = 2.dp,
                            neuShape = Punched.Rounded(radius = 16.dp)
                        )
                        .background(Color.White, RoundedCornerShape(16.dp))
                        .padding(20.dp)
                ) {
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Order Status",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface,
                                fontFamily = fontFamily
                            )
                            OrderStatusChip(status = order.status)
                        }
                        
                        Spacer(modifier = Modifier.height(12.dp))
                        
                        Text(
                            text = "Created: ${SimpleDateFormat("MMM dd, yyyy 'at' HH:mm", Locale.getDefault()).format(Date(order.createdAt))}",
                            fontSize = 14.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontFamily = fontFamily
                        )
                        
                        if (order.confirmedAt > 0) {
                            Text(
                                text = "Confirmed: ${SimpleDateFormat("MMM dd, yyyy 'at' HH:mm", Locale.getDefault()).format(Date(order.confirmedAt))}",
                                fontSize = 14.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                fontFamily = fontFamily
                            )
                        }
                        
                        if (order.shippedAt > 0) {
                            Text(
                                text = "Shipped: ${SimpleDateFormat("MMM dd, yyyy 'at' HH:mm", Locale.getDefault()).format(Date(order.shippedAt))}",
                                fontSize = 14.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                fontFamily = fontFamily
                            )
                        }
                        
                        if (order.deliveredAt > 0) {
                            Text(
                                text = "Delivered: ${SimpleDateFormat("MMM dd, yyyy 'at' HH:mm", Locale.getDefault()).format(Date(order.deliveredAt))}",
                                fontSize = 14.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                fontFamily = fontFamily
                            )
                        }
                    }
                }
            }

            // Customer Information
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .neumorphic(
                            lightShadowColor = HustleColors.lightShadow,
                            darkShadowColor = HustleColors.darkShadow,
                            elevation = 4.dp,
                            neuInsets = NeuInsets(4.dp, 4.dp),
                            strokeWidth = 2.dp,
                            neuShape = Punched.Rounded(radius = 16.dp)
                        )
                        .background(Color.White, RoundedCornerShape(16.dp))
                        .padding(20.dp)
                ) {
                    Column {
                        Row(
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Person,
                                contentDescription = null,
                                tint = HustleColors.Primary,
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(
                                text = "Customer Information",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface,
                                fontFamily = fontFamily
                            )
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        if (order.customerInfo.name.isNotEmpty()) {
                            InfoRow(
                                label = "Name",
                                value = order.customerInfo.name
                            )
                        }
                        
                        if (order.customerInfo.email.isNotEmpty()) {
                            InfoRow(
                                label = "Email",
                                value = order.customerInfo.email
                            )
                        }
                        
                        if (order.customerInfo.phone.isNotEmpty()) {
                            InfoRow(
                                label = "Phone",
                                value = order.customerInfo.phone
                            )
                        }
                    }
                }
            }

            // Delivery Information
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .neumorphic(
                            lightShadowColor = HustleColors.lightShadow,
                            darkShadowColor = HustleColors.darkShadow,
                            elevation = 4.dp,
                            neuInsets = NeuInsets(4.dp, 4.dp),
                            strokeWidth = 2.dp,
                            neuShape = Punched.Rounded(radius = 16.dp)
                        )
                        .background(Color.White, RoundedCornerShape(16.dp))
                        .padding(20.dp)
                ) {
                    Column {
                        Row(
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Filled.LocationOn,
                                contentDescription = null,
                                tint = HustleColors.Primary,
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(
                                text = "Delivery Information",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface,
                                fontFamily = fontFamily
                            )
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        InfoRow(
                            label = "Method",
                            value = order.shippingMethod.toString().replace("_", " ").lowercase()
                                .replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale.getDefault()) else it.toString() }
                        )
                        
                        if (order.shippingAddress.street.isNotEmpty()) {
                            val fullAddress = buildString {
                                append(order.shippingAddress.street)
                                if (order.shippingAddress.city.isNotEmpty()) {
                                    append(", ${order.shippingAddress.city}")
                                }
                                if (order.shippingAddress.state.isNotEmpty()) {
                                    append(", ${order.shippingAddress.state}")
                                }
                                if (order.shippingAddress.zipCode.isNotEmpty()) {
                                    append(" ${order.shippingAddress.zipCode}")
                                }
                            }
                            InfoRow(
                                label = "Address",
                                value = fullAddress
                            )
                        }
                        
                        if (order.trackingNumber.isNotEmpty()) {
                            InfoRow(
                                label = "Tracking",
                                value = order.trackingNumber
                            )
                        }
                    }
                }
            }

            // Order Items
            item {
                Text(
                    text = "Order Items (${order.items.size})",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground,
                    fontFamily = fontFamily
                )
            }

            items(order.items) { item ->
                // Punched neumorphic card for each order item
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .neumorphic(
                            lightShadowColor = HustleColors.lightShadow,
                            darkShadowColor = HustleColors.darkShadow,
                            elevation = 3.dp,
                            neuInsets = NeuInsets(3.dp, 3.dp),
                            strokeWidth = 2.dp,
                            neuShape = Punched.Rounded(radius = 12.dp)
                        )
                        .background(Color.White, RoundedCornerShape(12.dp))
                        .padding(0.dp)
                ) {
                    OrderItemCard(item = item)
                }
            }

            // Order Summary
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .neumorphic(
                            lightShadowColor = HustleColors.lightShadow,
                            darkShadowColor = HustleColors.darkShadow,
                            elevation = 4.dp,
                            neuInsets = NeuInsets(4.dp, 4.dp),
                            strokeWidth = 2.dp,
                            neuShape = Punched.Rounded(radius = 16.dp)
                        )
                        .background(Color.White, RoundedCornerShape(16.dp))
                        .padding(20.dp)
                ) {
                    Column {
                        Text(
                            text = "Order Summary",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface,
                            fontFamily = fontFamily
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        SummaryRow(
                            label = "Subtotal",
                            value = "$${String.format("%.2f", order.subtotal)}"
                        )
                        
                        if (order.deliveryFee > 0) {
                            SummaryRow(
                                label = "Delivery Fee",
                                value = "$${String.format("%.2f", order.deliveryFee)}"
                            )
                        }
                        
                        if (order.tax > 0) {
                            SummaryRow(
                                label = "Tax",
                                value = "$${String.format("%.2f", order.tax)}"
                            )
                        }
                        
                        if (order.discount > 0) {
                            SummaryRow(
                                label = "Discount",
                                value = "-$${String.format("%.2f", order.discount)}",
                                valueColor = Color(0xFF4CAF50)
                            )
                        }
                        
                        Divider(modifier = Modifier.padding(vertical = 8.dp))
                        
                        SummaryRow(
                            label = "Total",
                            value = "$${String.format("%.2f", order.total)}",
                            labelWeight = FontWeight.Bold,
                            valueWeight = FontWeight.Bold,
                            labelColor = MaterialTheme.colorScheme.onSurface,
                            valueColor = HustleColors.Primary
                        )
                    }
                }
            }

            // Notes
            if (order.customerNotes.isNotEmpty() || order.internalNotes.isNotEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .neumorphic(
                                lightShadowColor = HustleColors.lightShadow,
                                darkShadowColor = HustleColors.darkShadow,
                                elevation = 4.dp,
                                neuInsets = NeuInsets(4.dp, 4.dp),
                                strokeWidth = 2.dp,
                                neuShape = Punched.Rounded(radius = 16.dp)
                            )
                            .background(Color.White, RoundedCornerShape(16.dp))
                            .padding(20.dp)
                    ) {
                        Column {
                            Text(
                                text = "Notes",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface,
                                fontFamily = fontFamily
                            )
                            
                            Spacer(modifier = Modifier.height(16.dp))
                            
                            if (order.customerNotes.isNotEmpty()) {
                                Text(
                                    text = "Customer Notes:",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = MaterialTheme.colorScheme.onSurface,
                                    fontFamily = fontFamily
                                )
                                Text(
                                    text = order.customerNotes,
                                    fontSize = 14.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    fontFamily = fontFamily
                                )
                                
                                if (order.internalNotes.isNotEmpty()) {
                                    Spacer(modifier = Modifier.height(12.dp))
                                }
                            }
                            
                            if (order.internalNotes.isNotEmpty()) {
                                Text(
                                    text = "Internal Notes:",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = MaterialTheme.colorScheme.onSurface,
                                    fontFamily = fontFamily
                                )
                                Text(
                                    text = order.internalNotes,
                                    fontSize = 14.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    fontFamily = fontFamily
                                )
                            }
                        }
                    }
                }
            }
        }
        }
    }

    }

    @Composable
private fun OrderItemCard(item: OrderItem) {
    Card(
        modifier = Modifier
            .fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        )
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Product Image
            AsyncImage(
                model = item.imageUrl.ifEmpty { "https://via.placeholder.com/80x80?text=No+Image" },
                contentDescription = item.name,
                modifier = Modifier
                    .size(80.dp)
                    .background(
                        Color.White.copy(alpha = 0.3f),
                        RoundedCornerShape(8.dp)
                    ),
                contentScale = ContentScale.Crop
            )
            
            Spacer(modifier = Modifier.width(16.dp))
            
            // Product Details
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = item.name,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontFamily = fontFamily,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                
                if (item.variantName.isNotEmpty()) {
                    Text(
                        text = item.variantName,
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontFamily = fontFamily
                    )
                }
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Qty: ${item.quantity}",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontFamily = fontFamily
                    )
                    Text(
                        text = "$${String.format("%.2f", item.price * item.quantity)}",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = HustleColors.Primary,
                        fontFamily = fontFamily
                    )
                }
            }
        }
    }
}

@Composable
private fun InfoRow(
    label: String,
    value: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = "$label:",
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium,
            color = MaterialTheme.colorScheme.onSurface,
            fontFamily = fontFamily,
            modifier = Modifier.weight(1f)
        )
        Text(
            text = value,
            fontSize = 14.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            fontFamily = fontFamily,
            modifier = Modifier.weight(2f)
        )
    }
}

@Composable
private fun SummaryRow(
    label: String,
    value: String,
    labelWeight: FontWeight = FontWeight.Normal,
    valueWeight: FontWeight = FontWeight.Normal,
    labelColor: Color = MaterialTheme.colorScheme.onSurfaceVariant,
    valueColor: Color = MaterialTheme.colorScheme.onSurface
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            fontSize = 14.sp,
            fontWeight = labelWeight,
            color = labelColor,
            fontFamily = fontFamily
        )
        Text(
            text = value,
            fontSize = 14.sp,
            fontWeight = valueWeight,
            color = valueColor,
            fontFamily = fontFamily
        )
    }
}

@Composable
private fun OrderStatusUpdateDialog(
    currentStatus: OrderStatus,
    onStatusSelected: (OrderStatus) -> Unit,
    onDismiss: () -> Unit
) {
    val statuses = listOf(
        OrderStatus.PENDING to "Pending",
        OrderStatus.CONFIRMED to "Confirmed",
        OrderStatus.PREPARING to "Preparing",
        OrderStatus.READY to "Ready", 
        OrderStatus.SHIPPED to "Shipped",
        OrderStatus.DELIVERED to "Delivered",
        OrderStatus.CANCELLED to "Cancelled",
        OrderStatus.REFUNDED to "Refunded"
    )
    
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = Color.White,
        title = {
            Text(
                text = "Update Order Status",
                fontFamily = fontFamily,
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Column {
                Text(
                    text = "Select new status for this order:",
                    fontFamily = fontFamily,
                    modifier = Modifier.padding(bottom = 16.dp)
                )
                
                statuses.forEach { (status, label) ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onStatusSelected(status) }
                            .padding(vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = status == currentStatus,
                            onClick = { onStatusSelected(status) },
                            colors = RadioButtonDefaults.colors(
                                selectedColor = HustleColors.Primary
                            )
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = label,
                            fontFamily = fontFamily
                        )
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text(
                    "Cancel",
                    color = HustleColors.Primary,
                    fontFamily = fontFamily
                )
            }
        }
    )
}
