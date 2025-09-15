package com.blueclipse.myhustle.ui.screens.business.order

import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.blueclipse.myhustle.data.model.*
import com.blueclipse.myhustle.data.repository.OrderRepository
import com.blueclipse.myhustle.ui.components.ColoredTopBar
import com.blueclipse.myhustle.ui.theme.HustleColors
import com.blueclipse.myhustle.ui.theme.fontFamily
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*
import me.nikhilchaudhari.library.NeuInsets
import me.nikhilchaudhari.library.neumorphic
import me.nikhilchaudhari.library.shapes.Punched

data class OrderOverview(
    val pendingOrders: Int,
    val todaysOrders: Int,
    val shippedOrders: Int,
    val totalOrders: Int
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderManagementScreen(
    shopId: String? = null,
    onBack: () -> Unit = {}
) {
    Log.d("OrderNavDebug", "📱 OrderManagementScreen: COMPOSABLE STARTED")
    Log.d("OrderNavDebug", "📱 OrderManagementScreen: shopId = $shopId")
    
    var orderOverview by remember { mutableStateOf<OrderOverview?>(null) }
    var isLoading by remember { mutableStateOf(true) }
    var recentOrders by remember { mutableStateOf<List<Order>>(emptyList()) }
    var selectedOrder by remember { mutableStateOf<Order?>(null) }
    var showOrderDetails by remember { mutableStateOf(false) }
    
    val currentUser = FirebaseAuth.getInstance().currentUser
    val orderRepository = OrderRepository.instance
    val coroutineScope = rememberCoroutineScope()

    // Observe real-time shop owner orders
    val allShopOwnerOrders by orderRepository.shopOwnerOrders.collectAsState()

    // Calculate filtered orders and overview when data changes
    LaunchedEffect(allShopOwnerOrders, shopId) {
        val filteredOrders = if (shopId != null) {
            allShopOwnerOrders.filter { it.shopId == shopId }
        } else {
            allShopOwnerOrders
        }
        
        // Calculate overview stats
        val pending = filteredOrders.count { it.status == OrderStatus.PENDING }
        val today = filteredOrders.count { 
            val orderDate = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                .format(Date(it.createdAt))
            val todayDate = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                .format(Date())
            orderDate == todayDate
        }
        val shipped = filteredOrders.count { 
            it.status == OrderStatus.SHIPPED || it.status == OrderStatus.DELIVERED 
        }
        
        orderOverview = OrderOverview(
            pendingOrders = pending,
            todaysOrders = today,
            shippedOrders = shipped,
            totalOrders = filteredOrders.size
        )
        
        // Get recent orders (already sorted by creation date from repository)
        recentOrders = filteredOrders.take(10)
        isLoading = false
    }

    if (showOrderDetails && selectedOrder != null) {
        OrderDetailsScreen(
            order = selectedOrder!!,
            onBack = { 
                showOrderDetails = false
                selectedOrder = null
            },
            onStatusChanged = { newStatus ->
                coroutineScope.launch {
                    try {
                        orderRepository.updateOrderStatus(selectedOrder!!.id, newStatus)
                        // Real-time listener will automatically update the data
                        // Update the selectedOrder to reflect the change immediately
                        selectedOrder = selectedOrder!!.copy(
                            status = newStatus,
                            updatedAt = System.currentTimeMillis()
                        )
                    } catch (e: Exception) {
                        android.util.Log.e("OrderManagement", "Error updating order status", e)
                    }
                }
            }
        )
    } else {
        Log.d("OrderNavDebug", "📱 OrderManagementScreen: About to render Scaffold")
        Scaffold(
            topBar = {
                Log.d("OrderNavDebug", "📱 OrderManagementScreen: Rendering TopBar")
                ColoredTopBar(
                    title = "Order Management",
                    onBack = onBack,
                    cornerRadius = 0.dp
                )
            }
        ) { paddingValues ->
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                contentPadding = PaddingValues(vertical = 20.dp)
            ) {
                // Welcome Section
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = HustleColors.Primary.copy(alpha = 0.1f)
                        )
                    ) {
                        Column(
                            modifier = Modifier.padding(20.dp)
                        ) {
                            Text(
                                text = "Order Management Hub",
                                fontSize = 24.sp,
                                fontWeight = FontWeight.Bold,
                                color = HustleColors.Primary,
                                fontFamily = fontFamily
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Manage customer orders, track deliveries, and update order status",
                                fontSize = 14.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                fontFamily = fontFamily
                            )
                        }
                    }
                }

                // Overview Stats
                item {
                    Text(
                        text = "Order Overview",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onBackground,
                        fontFamily = fontFamily
                    )
                }

                item {
                    if (isLoading) {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(120.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                CircularProgressIndicator(color = HustleColors.Primary)
                            }
                        }
                    } else {
                        orderOverview?.let { overview ->
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                OverviewCard(
                                    title = "Pending",
                                    value = overview.pendingOrders.toString(),
                                    icon = Icons.Filled.Pending,
                                    color = Color(0xFFFF9800),
                                    modifier = Modifier.weight(1f)
                                )
                                OverviewCard(
                                    title = "Today",
                                    value = overview.todaysOrders.toString(),
                                    icon = Icons.Filled.Today,
                                    color = Color(0xFF4CAF50),
                                    modifier = Modifier.weight(1f)
                                )
                            }
                        }
                    }
                }

                item {
                    if (!isLoading && orderOverview != null) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OverviewCard(
                                title = "Shipped",
                                value = orderOverview!!.shippedOrders.toString(),
                                icon = Icons.Filled.LocalShipping,
                                color = Color(0xFF2196F3),
                                modifier = Modifier.weight(1f)
                            )
                            OverviewCard(
                                title = "Total",
                                value = orderOverview!!.totalOrders.toString(),
                                icon = Icons.Filled.ShoppingCart,
                                color = HustleColors.Primary,
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                }

                // Recent Orders Section
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Recent Orders",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onBackground,
                            fontFamily = fontFamily
                        )
                    }
                }

                if (isLoading) {
                    items(3) {
                        OrderCardSkeleton()
                    }
                } else if (recentOrders.isEmpty()) {
                    item {
                        EmptyOrdersCard()
                    }
                } else {
                    items(recentOrders) { order ->
                        OrderCard(
                            order = order,
                            onClick = {
                                selectedOrder = order
                                showOrderDetails = true
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun OverviewCard(
    title: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = color.copy(alpha = 0.1f)
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = color,
                modifier = Modifier.size(32.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = value,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = color,
                fontFamily = fontFamily
            )
            Text(
                text = title,
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontFamily = fontFamily
            )
        }
    }
}

@Composable
private fun OrderCard(
    order: Order,
    onClick: () -> Unit
) {
    // Match main screen store card style: punched neumorphic card
    val interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() }
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .neumorphic(
                neuShape = Punched.Rounded(12.dp),
                lightShadowColor = HustleColors.lightShadow,
                darkShadowColor = HustleColors.darkShadow,
                elevation = 6.dp,
                neuInsets = NeuInsets(6.dp, 6.dp),
                strokeWidth = 6.dp
            )
            .background(androidx.compose.ui.graphics.Color.White, RoundedCornerShape(12.dp))
            .clip(RoundedCornerShape(12.dp))
            .clickable(interactionSource = interactionSource, indication = null) { onClick() }
            .padding(horizontal = 16.dp, vertical = 24.dp)
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Order #${order.orderNumber}",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface,
                        fontFamily = fontFamily
                    )
                    Text(
                        text = order.customerInfo.name.ifEmpty { "Customer" },
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontFamily = fontFamily
                    )
                }
                OrderStatusChip(status = order.status)
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Text(
                text = "${order.items.size} item${if (order.items.size != 1) "s" else ""} • $${String.format("%.2f", order.total)}",
                fontSize = 14.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontFamily = fontFamily
            )
            
            Text(
                text = SimpleDateFormat("MMM dd, yyyy 'at' HH:mm", Locale.getDefault()).format(Date(order.createdAt)),
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontFamily = fontFamily
            )
        }
    }
}

@Composable
internal fun OrderStatusChip(status: OrderStatus) {
    val (color, text) = when (status) {
        OrderStatus.PENDING -> Color(0xFFFF9800) to "Pending"
        OrderStatus.CONFIRMED -> Color(0xFF4CAF50) to "Confirmed"
        OrderStatus.SHIPPED -> Color(0xFF2196F3) to "Shipped"
        OrderStatus.DELIVERED -> Color(0xFF4CAF50) to "Delivered"
        OrderStatus.CANCELLED -> Color(0xFFF44336) to "Cancelled"
        OrderStatus.PREPARING -> Color(0xFF9C27B0) to "Preparing"
        OrderStatus.READY -> Color(0xFF4CAF50) to "Ready"
        OrderStatus.REFUNDED -> Color(0xFFF44336) to "Refunded"
    }
    
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = color.copy(alpha = 0.1f)
    ) {
        Text(
            text = text,
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium,
            color = color,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
            fontFamily = fontFamily
        )
    }
}

@Composable
private fun EmptyOrdersCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = androidx.compose.ui.graphics.Color.White
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = Icons.Filled.ShoppingCart,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "No Orders Yet",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontFamily = fontFamily
            )
            Text(
                text = "Customer orders will appear here once they start purchasing from your store",
                fontSize = 14.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                fontFamily = fontFamily
            )
        }
    }
}

@Composable
private fun OrderCardSkeleton() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = androidx.compose.ui.graphics.Color.White
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            // Shimmer effect placeholder
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.6f)
                    .height(20.dp)
                    .background(
                        MaterialTheme.colorScheme.onSurface.copy(alpha = 0.1f),
                        RoundedCornerShape(4.dp)
                    )
            )
            Spacer(modifier = Modifier.height(8.dp))
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.8f)
                    .height(16.dp)
                    .background(
                        MaterialTheme.colorScheme.onSurface.copy(alpha = 0.05f),
                        RoundedCornerShape(4.dp)
                    )
            )
        }
    }
}
