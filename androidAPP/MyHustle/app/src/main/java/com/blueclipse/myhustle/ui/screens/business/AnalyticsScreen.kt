package com.blueclipse.myhustle.ui.screens.business

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
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
import com.blueclipse.myhustle.data.repository.AnalyticsRepository
import com.blueclipse.myhustle.data.repository.ProductRepository
import com.blueclipse.myhustle.data.repository.TransactionRepository
import com.blueclipse.myhustle.data.repository.BookingRepository
import com.blueclipse.myhustle.data.repository.OrderRepository
import com.blueclipse.myhustle.data.repository.RevenueData
import com.blueclipse.myhustle.data.repository.BookingAnalytics
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AnalyticsScreen(
    onBack: () -> Unit = {}
) {
    // State for real analytics data
    var revenueData by remember { mutableStateOf<RevenueData?>(null) }
    var bookingAnalytics by remember { mutableStateOf<BookingAnalytics?>(null) }
    var topProducts by remember { mutableStateOf<List<ProductSales>>(emptyList()) }
    var monthlyRevenue by remember { mutableStateOf<List<MonthData>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    // Repositories
    val analyticsRepository = remember { AnalyticsRepository.instance }
    val productRepository = remember { ProductRepository.instance }
    val transactionRepository = remember { TransactionRepository.instance }
    val orderRepository = remember { OrderRepository.instance }
    val coroutineScope = rememberCoroutineScope()
    val currentUser = FirebaseAuth.getInstance().currentUser

    // Load real data
    LaunchedEffect(currentUser?.uid) {
        val userId = currentUser?.uid
        if (userId != null) {
            coroutineScope.launch {
                try {
                    isLoading = true
                    errorMessage = null

                    // Load all data using consistent calculations
                    val (revenue, booking, products, monthly) = loadAllAnalyticsData(userId)
                    
                    revenueData = revenue
                    bookingAnalytics = booking
                    topProducts = products
                    monthlyRevenue = monthly

                } catch (e: Exception) {
                    errorMessage = "Failed to load analytics: ${e.message}"
                } finally {
                    isLoading = false
                }
            }
        } else {
            isLoading = false
            errorMessage = "User not logged in"
        }
    }

    Scaffold(
        topBar = {
            ColoredTopBar(
                title = "Analytics & Reports",
                onBack = onBack,
                cornerRadius = 0.dp
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    // Refresh data
                    val userId = currentUser?.uid
                    if (userId != null) {
                        coroutineScope.launch {
                            try {
                                isLoading = true
                                errorMessage = null
                                
                                // Load all data consistently
                                val (revenue, booking, products, monthly) = loadAllAnalyticsData(userId)
                                
                                revenueData = revenue
                                bookingAnalytics = booking
                                topProducts = products
                                monthlyRevenue = monthly
                                
                            } catch (e: Exception) {
                                errorMessage = "Failed to refresh data: ${e.message}"
                            } finally {
                                isLoading = false
                            }
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
        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = HustleColors.Primary)
            }
        } else if (errorMessage != null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Text(
                        text = errorMessage ?: "Unknown error",
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodyLarge
                    )
                    Button(
                        onClick = {
                            // Retry loading
                            val userId = currentUser?.uid
                            if (userId != null) {
                                coroutineScope.launch {
                                    try {
                                        isLoading = true
                                        errorMessage = null
                                        
                                        // Load all data consistently
                                        val (revenue, booking, products, monthly) = loadAllAnalyticsData(userId)
                                        
                                        revenueData = revenue
                                        bookingAnalytics = booking
                                        topProducts = products
                                        monthlyRevenue = monthly
                                        
                                    } catch (e: Exception) {
                                        errorMessage = "Failed to load data: ${e.message}"
                                    } finally {
                                        isLoading = false
                                    }
                                }
                            }
                        }
                    ) {
                        Text("Retry")
                    }
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                contentPadding = PaddingValues(vertical = 16.dp)
            ) {
                revenueData?.let { revenue ->
                    item {
                        RevenueOverviewCard(revenue, bookingAnalytics)
                    }
                    
                    item {
                        KeyMetricsRow(revenue, bookingAnalytics)
                    }
                }
                
                if (topProducts.isNotEmpty()) {
                    item {
                        TopProductsCard(topProducts)
                    }
                }
                
                if (monthlyRevenue.isNotEmpty()) {
                    item {
                        MonthlyRevenueCard(monthlyRevenue)
                    }
                }
            }
        }
    }
}

/**
 * Get top selling products from order data
 */
private suspend fun getTopSellingProducts(userId: String): List<ProductSales> {
    return try {
        val orderRepository = OrderRepository.instance
        val orders = orderRepository.getOrdersForShopOwner(userId).getOrElse { emptyList() }
        
        // Group items by product name and calculate sales
        val productSalesMap = mutableMapOf<String, Pair<Int, Double>>()
        
        orders.forEach { order ->
            order.items.forEach { item ->
                val currentData = productSalesMap[item.name] ?: (0 to 0.0)
                productSalesMap[item.name] = Pair(
                    currentData.first + item.quantity,
                    currentData.second + (item.price * item.quantity)
                )
            }
        }
        
        // Convert to ProductSales and sort by revenue
        productSalesMap.map { (name, data) ->
            ProductSales(name, data.first, data.second)
        }.sortedByDescending { it.revenue }.take(5)
        
    } catch (e: Exception) {
        emptyList()
    }
}

/**
 * Get monthly revenue data for the last 3 months
 */
private suspend fun getMonthlyRevenueData(userId: String): List<MonthData> {
    return try {
        val orderRepository = OrderRepository.instance
        val bookingRepository = BookingRepository.instance
        
        val orders = orderRepository.getOrdersForShopOwner(userId).getOrElse { emptyList() }
        val bookings = bookingRepository.getBookingsForShopOwner(userId)
        
        val calendar = Calendar.getInstance()
        val monthlyData = mutableListOf<MonthData>()
        
        // Get last 3 months
        for (i in 2 downTo 0) {
            calendar.time = Date()
            calendar.add(Calendar.MONTH, -i)
            calendar.set(Calendar.DAY_OF_MONTH, 1)
            calendar.set(Calendar.HOUR_OF_DAY, 0)
            calendar.set(Calendar.MINUTE, 0)
            calendar.set(Calendar.SECOND, 0)
            val monthStart = calendar.timeInMillis
            
            calendar.add(Calendar.MONTH, 1)
            calendar.add(Calendar.DAY_OF_MONTH, -1)
            calendar.set(Calendar.HOUR_OF_DAY, 23)
            calendar.set(Calendar.MINUTE, 59)
            calendar.set(Calendar.SECOND, 59)
            val monthEnd = calendar.timeInMillis
            
            val monthName = calendar.getDisplayName(Calendar.MONTH, Calendar.SHORT, Locale.getDefault()) ?: ""
            
            // Calculate revenue from orders and bookings in this month
            val orderRevenue = orders.filter { order ->
                order.createdAt in monthStart..monthEnd
            }.sumOf { it.total }
            
            val bookingRevenue = bookings.filter { booking ->
                booking.createdAt in monthStart..monthEnd &&
                booking.status == com.blueclipse.myhustle.data.model.BookingStatus.COMPLETED
            }.sumOf { booking ->
                // Get service price by serviceId - for now use a simple estimate
                // TODO: Improve this by fetching actual service prices from ServiceRepository
                try {
                    when(booking.serviceName) {
                        "Phone Repair" -> 99.00
                        "Hair Styling" -> 60.00
                        "Wedding Photography" -> 1500.00
                        "Lawn Mowing" -> 45.00
                        "Computer Repair" -> 120.00
                        "Plumbing Service" -> 85.00
                        "House Cleaning" -> 75.00
                        "Pet Grooming" -> 50.00
                        else -> 50.00
                    }
                } catch (e: Exception) {
                    0.0
                }
            }
            
            monthlyData.add(MonthData(monthName, orderRevenue + bookingRevenue))
        }
        
        monthlyData
    } catch (e: Exception) {
        // Fallback data
        listOf(
            MonthData("Jan", 0.0),
            MonthData("Feb", 0.0),
            MonthData("Mar", 0.0)
        )
    }
}

@Composable
private fun RevenueOverviewCard(revenueData: RevenueData, bookingAnalytics: BookingAnalytics?) {
    val numberFormat = NumberFormat.getCurrencyInstance(Locale.US)
    
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
                    imageVector = Icons.Filled.TrendingUp,
                    contentDescription = "Revenue",
                    tint = HustleColors.BlueAccent,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Revenue Overview",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black,
                    fontFamily = fontFamily
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = numberFormat.format(revenueData.totalRevenue),
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                color = HustleColors.BlueAccent
            )
            
            Text(
                text = "Total Revenue",
                fontSize = 14.sp,
                color = Color.Gray
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Filled.ArrowUpward,
                    contentDescription = "Growth",
                    tint = Color(0xFF4CAF50),
                    modifier = Modifier.size(16.dp)
                )
                Text(
                    text = "${revenueData.totalTransactions} total transactions",
                    fontSize = 12.sp,
                    color = Color(0xFF4CAF50),
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}

@Composable
private fun KeyMetricsRow(revenueData: RevenueData, bookingAnalytics: BookingAnalytics?) {
    val numberFormat = NumberFormat.getCurrencyInstance(Locale.US)
    
    Row(
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        MetricCard(
            title = "Today Revenue",
            value = numberFormat.format(revenueData.todayRevenue),
            icon = Icons.Filled.Today,
            color = Color(0xFF4CAF50),
            modifier = Modifier.weight(1f)
        )
        
        MetricCard(
            title = "Week Revenue",
            value = numberFormat.format(revenueData.weekRevenue),
            icon = Icons.Filled.DateRange,
            color = Color(0xFFFF9800),
            modifier = Modifier.weight(1f)
        )
        
        MetricCard(
            title = "Total Bookings",
            value = bookingAnalytics?.totalBookings?.toString() ?: "0",
            icon = Icons.Filled.CalendarToday,
            color = Color(0xFF2196F3),
            modifier = Modifier.weight(1f)
        )
    }
}

@Composable
private fun MetricCard(
    title: String,
    value: String,
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
                text = value,
                fontSize = 20.sp,
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
private fun TopProductsCard(products: List<ProductSales>) {
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
                text = "Top Selling Products",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black,
                fontFamily = fontFamily
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            products.forEach { product ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = product.name,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color.Black
                        )
                        Text(
                            text = "${product.unitsSold} units sold",
                            fontSize = 12.sp,
                            color = Color.Gray
                        )
                    }
                    Text(
                        text = "$${String.format("%.0f", product.revenue)}",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = HustleColors.BlueAccent
                    )
                }
            }
        }
    }
}

@Composable
private fun MonthlyRevenueCard(monthlyData: List<MonthData>) {
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
                text = "Monthly Revenue Trend",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black,
                fontFamily = fontFamily
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                items(monthlyData) { month ->
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "$${String.format("%.0f", month.revenue)}",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = HustleColors.BlueAccent
                        )
                        Text(
                            text = month.month,
                            fontSize = 12.sp,
                            color = Color.Gray
                        )
                    }
                }
            }
        }
    }
}

data class ProductSales(
    val name: String,
    val unitsSold: Int,
    val revenue: Double
)

data class MonthData(
    val month: String,
    val revenue: Double
)

/**
 * Load all analytics data from the same sources for consistency
 */
private suspend fun loadAllAnalyticsData(userId: String): Quad<RevenueData?, BookingAnalytics?, List<ProductSales>, List<MonthData>> {
    val orderRepository = OrderRepository.instance
    val bookingRepository = BookingRepository.instance
    
    // Get all data from database
    val orders = orderRepository.getOrdersForShopOwner(userId).getOrElse { emptyList() }
    val bookings = bookingRepository.getBookingsForShopOwner(userId)
    
    // Calculate booking analytics
    val totalBookings = bookings.size
    val pendingBookings = bookings.count { it.status == com.blueclipse.myhustle.data.model.BookingStatus.PENDING }
    val confirmedBookings = bookings.count { it.status == com.blueclipse.myhustle.data.model.BookingStatus.ACCEPTED }
    val completedBookings = bookings.count { it.status == com.blueclipse.myhustle.data.model.BookingStatus.COMPLETED }
    val cancelledBookings = bookings.count { it.status == com.blueclipse.myhustle.data.model.BookingStatus.CANCELLED }
    
    val currentDate = Date()
    val calendar = Calendar.getInstance()
    calendar.time = currentDate
    calendar.set(Calendar.HOUR_OF_DAY, 0)
    calendar.set(Calendar.MINUTE, 0)
    calendar.set(Calendar.SECOND, 0)
    val todayStart = calendar.timeInMillis
    
    val todayBookings = bookings.count { it.createdAt >= todayStart }
    
    val bookingAnalytics = BookingAnalytics(
        totalBookings = totalBookings,
        pendingBookings = pendingBookings,
        confirmedBookings = confirmedBookings,
        completedBookings = completedBookings,
        cancelledBookings = cancelledBookings,
        todayBookings = todayBookings
    )
    
    // Calculate revenue from orders and completed bookings
    val orderRevenue = orders.sumOf { it.total }
    val completedBookingsList = bookings.filter { it.status == com.blueclipse.myhustle.data.model.BookingStatus.COMPLETED }
    val bookingRevenue = completedBookingsList.sumOf { booking ->
        when(booking.serviceName) {
            "Phone Repair" -> 99.00
            "Hair Styling" -> 60.00
            "Wedding Photography" -> 1500.00
            "Lawn Mowing" -> 45.00
            "Computer Repair" -> 120.00
            "Plumbing Service" -> 85.00
            "House Cleaning" -> 75.00
            "Pet Grooming" -> 50.00
            else -> 50.00
        }
    }
    
    val totalRevenue = orderRevenue + bookingRevenue
    
    // Calculate time-based revenue
    val todayRevenue = orders.filter { it.createdAt >= todayStart }.sumOf { it.total } +
            completedBookingsList.filter { it.createdAt >= todayStart }.sumOf { booking ->
                when(booking.serviceName) {
                    "Phone Repair" -> 99.00
                    "Hair Styling" -> 60.00
                    "Wedding Photography" -> 1500.00
                    "Lawn Mowing" -> 45.00
                    "Computer Repair" -> 120.00
                    "Plumbing Service" -> 85.00
                    "House Cleaning" -> 75.00
                    "Pet Grooming" -> 50.00
                    else -> 50.00
                }
            }
    
    // Calculate week revenue
    calendar.set(Calendar.DAY_OF_WEEK, Calendar.MONDAY)
    val weekStart = calendar.timeInMillis
    val weekRevenue = orders.filter { it.createdAt >= weekStart }.sumOf { it.total } +
            completedBookingsList.filter { it.createdAt >= weekStart }.sumOf { booking ->
                when(booking.serviceName) {
                    "Phone Repair" -> 99.00
                    "Hair Styling" -> 60.00
                    "Wedding Photography" -> 1500.00
                    "Lawn Mowing" -> 45.00
                    "Computer Repair" -> 120.00
                    "Plumbing Service" -> 85.00
                    "House Cleaning" -> 75.00
                    "Pet Grooming" -> 50.00
                    else -> 50.00
                }
            }
    
    // Calculate month revenue
    calendar.time = currentDate
    calendar.set(Calendar.DAY_OF_MONTH, 1)
    calendar.set(Calendar.HOUR_OF_DAY, 0)
    calendar.set(Calendar.MINUTE, 0)
    calendar.set(Calendar.SECOND, 0)
    val monthStart = calendar.timeInMillis
    val monthRevenue = orders.filter { it.createdAt >= monthStart }.sumOf { it.total } +
            completedBookingsList.filter { it.createdAt >= monthStart }.sumOf { booking ->
                when(booking.serviceName) {
                    "Phone Repair" -> 99.00
                    "Hair Styling" -> 60.00
                    "Wedding Photography" -> 1500.00
                    "Lawn Mowing" -> 45.00
                    "Computer Repair" -> 120.00
                    "Plumbing Service" -> 85.00
                    "House Cleaning" -> 75.00
                    "Pet Grooming" -> 50.00
                    else -> 50.00
                }
            }
    
    val revenueData = RevenueData(
        todayRevenue = todayRevenue,
        weekRevenue = weekRevenue,
        monthRevenue = monthRevenue,
        totalRevenue = totalRevenue,
        totalTransactions = orders.size + completedBookingsList.size
    )
    
    // Calculate top products from orders
    val productSalesMap = mutableMapOf<String, Pair<Int, Double>>()
    orders.forEach { order ->
        order.items.forEach { item ->
            val currentData = productSalesMap[item.name] ?: (0 to 0.0)
            productSalesMap[item.name] = Pair(
                currentData.first + item.quantity,
                currentData.second + (item.price * item.quantity)
            )
        }
    }
    
    val topProducts = productSalesMap.map { (name, data) ->
        ProductSales(name, data.first, data.second)
    }.sortedByDescending { it.revenue }.take(5)
    
    // Calculate monthly revenue data (last 3 months)
    val monthlyData = mutableListOf<MonthData>()
    for (i in 2 downTo 0) {
        calendar.time = Date()
        calendar.add(Calendar.MONTH, -i)
        calendar.set(Calendar.DAY_OF_MONTH, 1)
        calendar.set(Calendar.HOUR_OF_DAY, 0)
        calendar.set(Calendar.MINUTE, 0)
        calendar.set(Calendar.SECOND, 0)
        val monthlyStart = calendar.timeInMillis
        
        calendar.add(Calendar.MONTH, 1)
        calendar.add(Calendar.DAY_OF_MONTH, -1)
        calendar.set(Calendar.HOUR_OF_DAY, 23)
        calendar.set(Calendar.MINUTE, 59)
        calendar.set(Calendar.SECOND, 59)
        val monthlyEnd = calendar.timeInMillis
        
        val monthName = calendar.getDisplayName(Calendar.MONTH, Calendar.SHORT, Locale.getDefault()) ?: ""
        
        val monthOrderRevenue = orders.filter { order ->
            order.createdAt in monthlyStart..monthlyEnd
        }.sumOf { it.total }
        
        val monthBookingRevenue = completedBookingsList.filter { booking ->
            booking.createdAt in monthlyStart..monthlyEnd
        }.sumOf { booking ->
            when(booking.serviceName) {
                "Phone Repair" -> 99.00
                "Hair Styling" -> 60.00
                "Wedding Photography" -> 1500.00
                "Lawn Mowing" -> 45.00
                "Computer Repair" -> 120.00
                "Plumbing Service" -> 85.00
                "House Cleaning" -> 75.00
                "Pet Grooming" -> 50.00
                else -> 50.00
            }
        }
        
        monthlyData.add(MonthData(monthName, monthOrderRevenue + monthBookingRevenue))
    }
    
    return Quad(revenueData, bookingAnalytics, topProducts, monthlyData)
}

// Helper data class for returning 4 values
private data class Quad<A, B, C, D>(val first: A, val second: B, val third: C, val fourth: D)
