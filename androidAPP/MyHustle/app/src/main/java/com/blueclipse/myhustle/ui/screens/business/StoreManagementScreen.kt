package com.blueclipse.myhustle.ui.screens.business

import android.util.Log
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.blueclipse.myhustle.ui.components.ColoredTopBar
import com.blueclipse.myhustle.ui.theme.HustleColors
import com.blueclipse.myhustle.ui.theme.fontFamily

data class ManagementOption(
    val id: String,
    val title: String,
    val description: String,
    val icon: ImageVector,
    val color: Color,
    val onClick: () -> Unit
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StoreManagementScreen(
    shopId: String? = null, // Add shopId parameter
    onBack: () -> Unit = {},
    onAddProductClick: (String?) -> Unit = {}, // Pass shopId
    onAddServiceClick: (String?) -> Unit = {}, // Pass shopId
    onInventoryClick: () -> Unit = {},
    onAnalyticsClick: () -> Unit = {},
    onAccountingClick: () -> Unit = {},
    onBookingManagementClick: () -> Unit = {},
    onOrderManagementClick: () -> Unit = {}
) {
    // Handle system back gesture - should always go to Home (My Hustles)
    BackHandler {
        Log.d("StoreManagementScreen", "🔴 System back gesture intercepted!")
        onBack()
    }
    
    val managementOptions = listOf(
        ManagementOption(
            id = "booking_management",
            title = "Booking Management",
            description = "Manage customer bookings and requests",
            icon = Icons.Filled.CalendarToday,
            color = Color(0xFF9C27B0),
            onClick = onBookingManagementClick
        ),
        ManagementOption(
            id = "order_management",
            title = "Order Management", 
            description = "Manage customer orders and deliveries",
            icon = Icons.Filled.ShoppingCart,
            color = Color(0xFF2196F3),
            onClick = {
                Log.d("OrderNavDebug", "🔵 StoreManagementScreen: Order Management clicked!")
                Log.d("OrderNavDebug", "🔵 StoreManagementScreen: About to call onOrderManagementClick")
                onOrderManagementClick()
                Log.d("OrderNavDebug", "🔵 StoreManagementScreen: onOrderManagementClick called")
            }
        ),
        ManagementOption(
            id = "add_product",
            title = "Add Product",
            description = "Add new products to your inventory",
            icon = Icons.Filled.Add,
            color = HustleColors.Primary,
            onClick = { onAddProductClick(shopId) }
        ),
        ManagementOption(
            id = "add_service",
            title = "Add Service",
            description = "Create new service offerings",
            icon = Icons.Filled.Build,
            color = HustleColors.BlueAccent,
            onClick = { onAddServiceClick(shopId) }
        ),
        ManagementOption(
            id = "inventory",
            title = "Inventory Management",
            description = "Manage stock levels and product details",
            icon = Icons.Filled.Inventory,
            color = HustleColors.Secondary,
            onClick = onInventoryClick
        ),
        ManagementOption(
            id = "analytics",
            title = "Analytics & Reports",
            description = "View sales data and business insights",
            icon = Icons.Filled.Analytics,
            color = Color(0xFF4CAF50),
            onClick = onAnalyticsClick
        ),
        ManagementOption(
            id = "accounting",
            title = "Basic Accounting",
            description = "Track income, expenses, and profits",
            icon = Icons.Filled.AccountBalance,
            color = Color(0xFFFF9800),
            onClick = onAccountingClick
        )
    )

    Scaffold(
        topBar = {
            ColoredTopBar(
                title = "Store Management",
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
            item {
                WelcomeCard()
            }
            
            item {
                Text(
                    text = "Quick Actions",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black,
                    fontFamily = fontFamily,
                    modifier = Modifier.padding(vertical = 8.dp)
                )
            }
            
            items(managementOptions) { option ->
                ManagementOptionCard(option = option)
            }
            
            item {
                Spacer(modifier = Modifier.height(20.dp))
            }
        }
    }
}

@Composable
private fun WelcomeCard() {
    Surface(
        modifier = Modifier
            .fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        color = HustleColors.LightestBlue,
        shadowElevation = 4.dp
    ) {
        Column(
            modifier = Modifier.padding(20.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Filled.Store,
                    contentDescription = "Store",
                    tint = HustleColors.BlueAccent,
                    modifier = Modifier.size(32.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "Welcome to Store Management",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black,
                        fontFamily = fontFamily
                    )
                    Text(
                        text = "Manage your business efficiently",
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = "From here you can manage products, services, inventory, view analytics, and handle basic accounting for your business.",
                fontSize = 14.sp,
                color = Color.Gray,
                lineHeight = 20.sp
            )
        }
    }
}

@Composable
private fun ManagementOptionCard(option: ManagementOption) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { 
                android.util.Log.d("StoreManagement", "Card clicked: ${option.title}")
                option.onClick() 
            },
        shape = RoundedCornerShape(12.dp),
        color = Color.White,
        shadowElevation = 2.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                shape = RoundedCornerShape(10.dp),
                color = option.color.copy(alpha = 0.1f),
                modifier = Modifier.size(50.dp)
            ) {
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier.fillMaxSize()
                ) {
                    Icon(
                        imageVector = option.icon,
                        contentDescription = option.title,
                        tint = option.color,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = option.title,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color.Black,
                    fontFamily = fontFamily
                )
                Text(
                    text = option.description,
                    fontSize = 14.sp,
                    color = Color.Gray,
                    lineHeight = 18.sp
                )
            }
            
            Icon(
                imageVector = Icons.Filled.ChevronRight,
                contentDescription = "Go",
                tint = Color.Gray,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}
