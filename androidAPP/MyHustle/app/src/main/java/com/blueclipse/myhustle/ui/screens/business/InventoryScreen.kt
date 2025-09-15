package com.blueclipse.myhustle.ui.screens.business

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.blueclipse.myhustle.data.repository.ProductRepository
import com.blueclipse.myhustle.ui.components.ColoredTopBar
import com.blueclipse.myhustle.ui.theme.HustleColors
import com.blueclipse.myhustle.ui.theme.fontFamily

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InventoryScreen(
    shopId: String,
    onBack: () -> Unit = {},
    onNavigateToChangeListing: (String, String) -> Unit = { _, _ -> }
) {
    // Load products from database for this shop
    var products by remember { mutableStateOf<List<com.blueclipse.myhustle.data.model.Product>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    
    LaunchedEffect(shopId) {
        try {
            val result = ProductRepository.instance.getProductsForShop(shopId)
            if (result.isSuccess) {
                products = result.getOrNull() ?: emptyList()
                println("InventoryScreen: Loaded ${products.size} products for shop $shopId")
            } else {
                println("InventoryScreen: Failed to load products: ${result.exceptionOrNull()?.message}")
            }
        } catch (e: Exception) {
            println("InventoryScreen: Error loading products: ${e.message}")
        } finally {
            isLoading = false
        }
    }
    
    // Convert products to inventory items for display
    val inventoryItems = products.map { product ->
        InventoryItem(
            id = product.id,
            name = product.name,
            category = product.category,
            currentStock = (10..50).random(), // TODO: Add stock field to Product model
            lowStockThreshold = 5,
            price = "$${product.price}"
        )
    }

    Scaffold(
        topBar = {
            ColoredTopBar(
                title = "Inventory Management",
                onBack = onBack,
                cornerRadius = 0.dp
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { /* TODO: Add new inventory item */ },
                containerColor = HustleColors.BlueAccent
            ) {
                Icon(
                    imageVector = Icons.Filled.Add,
                    contentDescription = "Add Item",
                    tint = Color.White
                )
            }
        }
    ) { paddingValues ->
        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = HustleColors.BlueAccent)
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(vertical = 16.dp)
            ) {
                item {
                    InventoryStatsCard(inventoryItems)
                }
                
                item {
                    Text(
                        text = "Current Inventory (${products.size} products)",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black,
                        fontFamily = fontFamily,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                }
                
                if (inventoryItems.isEmpty()) {
                    item {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(32.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.Inventory,
                                    contentDescription = "No products",
                                    modifier = Modifier.size(64.dp),
                                    tint = Color.Gray
                                )
                                Spacer(modifier = Modifier.height(16.dp))
                                Text(
                                    text = "No products found",
                                    fontSize = 18.sp,
                                    color = Color.Gray,
                                    fontFamily = fontFamily
                                )
                                Text(
                                    text = "Add products to see them here",
                                    fontSize = 14.sp,
                                    color = Color.Gray,
                                    fontFamily = fontFamily
                                )
                            }
                        }
                    }
                } else {
                    items(inventoryItems) { item ->
                        InventoryItemCard(
                            item = item,
                            onClick = { onNavigateToChangeListing(item.id, "product") }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun InventoryStatsCard(items: List<InventoryItem>) {
    val totalItems = items.size
    val lowStockItems = items.count { it.currentStock <= it.lowStockThreshold }
    val outOfStockItems = items.count { it.currentStock == 0 }
    
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        color = HustleColors.LightestBlue,
        shadowElevation = 2.dp
    ) {
        Column(
            modifier = Modifier.padding(20.dp)
        ) {
            Text(
                text = "Inventory Overview",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black,
                fontFamily = fontFamily
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(
                horizontalArrangement = Arrangement.SpaceEvenly,
                modifier = Modifier.fillMaxWidth()
            ) {
                StatItem("Total Items", totalItems.toString(), HustleColors.BlueAccent)
                StatItem("Low Stock", lowStockItems.toString(), Color(0xFFFF9800))
                StatItem("Out of Stock", outOfStockItems.toString(), Color(0xFFF44336))
            }
        }
    }
}

@Composable
private fun StatItem(label: String, value: String, color: Color) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = value,
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = color
        )
        Text(
            text = label,
            fontSize = 12.sp,
            color = Color.Gray
        )
    }
}

@Composable
private fun InventoryItemCard(
    item: InventoryItem,
    onClick: () -> Unit = {}
) {
    val stockColor = when {
        item.currentStock == 0 -> Color(0xFFF44336)
        item.currentStock <= item.lowStockThreshold -> Color(0xFFFF9800)
        else -> Color(0xFF4CAF50)
    }
    
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
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
                color = HustleColors.LightestBlue,
                modifier = Modifier.size(50.dp)
            ) {
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier.fillMaxSize()
                ) {
                    Icon(
                        imageVector = Icons.Filled.Inventory,
                        contentDescription = "Product",
                        tint = HustleColors.BlueAccent,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = item.name,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color.Black
                )
                Text(
                    text = item.category,
                    fontSize = 14.sp,
                    color = Color.Gray
                )
                Text(
                    text = item.price,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = HustleColors.BlueAccent
                )
            }
            
            Column(
                horizontalAlignment = Alignment.End
            ) {
                Text(
                    text = "Stock: ${item.currentStock}",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = stockColor
                )
                if (item.currentStock <= item.lowStockThreshold) {
                    Text(
                        text = if (item.currentStock == 0) "Out of Stock" else "Low Stock",
                        fontSize = 12.sp,
                        color = stockColor
                    )
                }
            }
        }
    }
}

data class InventoryItem(
    val id: String,
    val name: String,
    val category: String,
    val currentStock: Int,
    val lowStockThreshold: Int,
    val price: String
)
