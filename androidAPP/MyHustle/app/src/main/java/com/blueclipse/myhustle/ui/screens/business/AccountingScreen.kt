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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.blueclipse.myhustle.ui.components.ColoredTopBar
import com.blueclipse.myhustle.ui.theme.HustleColors
import com.blueclipse.myhustle.ui.theme.fontFamily
import com.blueclipse.myhustle.data.repository.TransactionRepository
import com.blueclipse.myhustle.data.repository.AccountingOverview
import com.blueclipse.myhustle.data.repository.Transaction
import com.blueclipse.myhustle.data.repository.TransactionType
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AccountingScreen(
    onBack: () -> Unit = {},
    onOrderClick: (String) -> Unit = {}
) {
    val transactionRepository = TransactionRepository.instance
    
    // Use StateFlow for real-time updates
    val accountingData by transactionRepository.accountingOverviewState.collectAsState()
    val isLoading by transactionRepository.isLoading.collectAsState()
    var errorMessage by remember { mutableStateOf<String?>(null) }
    val coroutineScope = rememberCoroutineScope()

    // Load accounting data when screen opens and refresh periodically
    LaunchedEffect(Unit) {
        coroutineScope.launch {
            try {
                errorMessage = null
                transactionRepository.refreshAccountingData()
            } catch (e: Exception) {
                errorMessage = "Failed to load accounting data: ${e.message}"
            }
        }
    }

    Scaffold(
        topBar = {
            ColoredTopBar(
                title = "Basic Accounting",
                onBack = onBack,
                cornerRadius = 0.dp
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { 
                    // Refresh data
                    coroutineScope.launch {
                        try {
                            errorMessage = null
                            transactionRepository.refreshAccountingData()
                        } catch (e: Exception) {
                            errorMessage = "Failed to refresh data: ${e.message}"
                        }
                    }
                },
                containerColor = HustleColors.BlueAccent
            ) {
                Icon(
                    imageVector = Icons.Filled.Refresh,
                    contentDescription = "Refresh Data",
                    tint = Color.White
                )
            }
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(vertical = 16.dp)
        ) {
            item {
                if (isLoading) {
                    // Loading state
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(200.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            CircularProgressIndicator(
                                color = HustleColors.BlueAccent
                            )
                            Text(
                                text = "Loading accounting data...",
                                fontSize = 14.sp,
                                color = Color.Gray,
                                fontFamily = fontFamily
                            )
                        }
                    }
                } else if (errorMessage != null) {
                    // Error state
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        color = Color(0xFFFFEBEE),
                        shadowElevation = 4.dp
                    ) {
                        Column(
                            modifier = Modifier.padding(20.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Error,
                                contentDescription = "Error",
                                tint = Color(0xFFF44336),
                                modifier = Modifier.size(48.dp)
                            )
                            Text(
                                text = "Error Loading Data",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFF44336),
                                fontFamily = fontFamily
                            )
                            Text(
                                text = errorMessage!!,
                                fontSize = 14.sp,
                                color = Color(0xFFF44336),
                                fontFamily = fontFamily
                            )
                            Button(
                                onClick = {
                                    coroutineScope.launch {
                                        try {
                                            errorMessage = null
                                            transactionRepository.refreshAccountingData()
                                        } catch (e: Exception) {
                                            errorMessage = "Failed to reload data: ${e.message}"
                                        }
                                    }
                                },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = HustleColors.BlueAccent
                                )
                            ) {
                                Text("Retry")
                            }
                        }
                    }
                } else {
                    // Data loaded successfully
                    FinancialOverviewCard(accountingData)
                }
            }
            
            // Only show other sections if data is loaded
            if (!isLoading && errorMessage == null) {
                item {
                    FinancialMetricsRow(accountingData)
                }
                
                item {
                    Text(
                        text = "Recent Transactions",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black,
                        fontFamily = fontFamily,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                }
                
                if (accountingData.recentTransactions.isEmpty()) {
                    item {
                        Surface(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            color = HustleColors.LightestBlue,
                            shadowElevation = 4.dp
                        ) {
                            Column(
                                modifier = Modifier.padding(20.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.Receipt,
                                    contentDescription = "No Transactions",
                                    tint = Color.Gray,
                                    modifier = Modifier.size(48.dp)
                                )
                                Text(
                                    text = "No Transactions Yet",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.Gray,
                                    fontFamily = fontFamily
                                )
                                Text(
                                    text = "Complete some orders or bookings to see transactions here",
                                    fontSize = 14.sp,
                                    color = Color.Gray,
                                    fontFamily = fontFamily
                                )
                            }
                        }
                    }
                } else {
                    items(accountingData.recentTransactions) { transaction ->
                        TransactionCard(
                            transaction = transaction,
                            onOrderClick = onOrderClick
                        )
                    }
                }
                
                item {
                    AccountingActionsCard()
                }
            }
        }
    }
}

@Composable
private fun FinancialOverviewCard(data: AccountingOverview) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
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
                    imageVector = Icons.Filled.AccountBalance,
                    contentDescription = "Accounting",
                    tint = HustleColors.BlueAccent,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Financial Summary",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black,
                    fontFamily = fontFamily
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = "$${String.format("%.2f", data.netProfit)}",
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                color = if (data.netProfit >= 0) Color(0xFF4CAF50) else Color(0xFFF44336)
            )
            
            Text(
                text = "Net Profit This Month",
                fontSize = 14.sp,
                color = Color.Gray
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            val profitMargin = (data.netProfit / data.totalIncome) * 100
            Text(
                text = "Profit Margin: ${String.format("%.1f", profitMargin)}%",
                fontSize = 12.sp,
                color = Color.Gray
            )
        }
    }
}

@Composable
private fun FinancialMetricsRow(data: AccountingOverview) {
    Row(
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        FinancialMetricCard(
            title = "Total Income",
            amount = data.totalIncome,
            icon = Icons.Filled.TrendingUp,
            color = Color(0xFF4CAF50),
            modifier = Modifier.weight(1f)
        )
        
        FinancialMetricCard(
            title = "Total Expenses",
            amount = data.totalExpenses,
            icon = Icons.Filled.TrendingDown,
            color = Color(0xFFF44336),
            modifier = Modifier.weight(1f)
        )
    }
}

@Composable
private fun FinancialMetricCard(
    title: String,
    amount: Double,
    icon: ImageVector,
    color: Color,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        color = Color.White,
        shadowElevation = 2.dp
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = color,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "$${String.format("%.2f", amount)}",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
            Text(
                text = title,
                fontSize = 12.sp,
                color = Color.Gray
            )
        }
    }
}

@Composable
private fun TransactionCard(
    transaction: Transaction,
    onOrderClick: (String) -> Unit
) {
    val isIncome = transaction.type == TransactionType.INCOME
    val amountColor = if (isIncome) Color(0xFF4CAF50) else Color(0xFFF44336)
    val icon = if (isIncome) Icons.Filled.ArrowUpward else Icons.Filled.ArrowDownward
    
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .then(
                if (transaction.orderId != null) {
                    Modifier.clickable { onOrderClick(transaction.orderId) }
                } else {
                    Modifier
                }
            ),
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
                color = amountColor.copy(alpha = 0.1f),
                modifier = Modifier.size(40.dp)
            ) {
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier.fillMaxSize()
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = "Transaction Type",
                        tint = amountColor,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = transaction.description,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color.Black
                )
                Text(
                    text = transaction.date,
                    fontSize = 14.sp,
                    color = Color.Gray
                )
            }
            
            Text(
                text = "${if (isIncome) "+" else ""}$${String.format("%.2f", kotlin.math.abs(transaction.amount))}",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = amountColor
            )
        }
    }
}

@Composable
private fun AccountingActionsCard() {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        color = Color.White,
        shadowElevation = 2.dp
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Quick Actions",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black,
                fontFamily = fontFamily
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            val actions = listOf(
                AccountingAction("Record Income", Icons.Filled.Add, Color(0xFF4CAF50)),
                AccountingAction("Record Expense", Icons.Filled.Remove, Color(0xFFF44336)),
                AccountingAction("Generate Tax Report", Icons.Filled.Description, HustleColors.BlueAccent),
                AccountingAction("Export to CSV", Icons.Filled.Download, Color(0xFF9C27B0))
            )
            
            actions.forEach { action ->
                OutlinedButton(
                    onClick = { /* Action handler removed per requirements */ },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 2.dp),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = action.color
                    )
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Start,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = action.icon,
                            contentDescription = action.title,
                            modifier = Modifier.size(16.dp),
                            tint = action.color
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(action.title)
                    }
                }
            }
        }
    }
}

data class AccountingAction(
    val title: String,
    val icon: ImageVector,
    val color: Color
)
