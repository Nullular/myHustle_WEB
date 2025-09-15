package com.blueclipse.myhustle.data.repository

import com.blueclipse.myhustle.data.model.BookingStatus
import com.google.firebase.firestore.FirebaseFirestore
import java.util.Calendar
import java.util.Date

/**
 * Repository for live analytics data from Firebase
 */
class AnalyticsRepository private constructor() {
    
    private val firestore = FirebaseFirestore.getInstance()
    private val bookingsCollection = firestore.collection("bookings")
    private val ordersCollection = firestore.collection("orders")
    
    companion object {
        @Volatile
        private var INSTANCE: AnalyticsRepository? = null
        
        val instance: AnalyticsRepository
            get() = INSTANCE ?: synchronized(this) {
                INSTANCE ?: AnalyticsRepository().also { INSTANCE = it }
            }
    }
    
    /**
     * Get revenue data for shop owner
     */
    suspend fun getRevenueData(shopOwnerId: String): RevenueData {
        return try {
            val completedBookings = getCompletedBookingsForOwner(shopOwnerId)
            val orders = getOrdersForOwner(shopOwnerId)
            
            val currentDate = Date()
            val calendar = Calendar.getInstance()
            
            // Calculate today's revenue
            calendar.time = currentDate
            calendar.set(Calendar.HOUR_OF_DAY, 0)
            calendar.set(Calendar.MINUTE, 0)
            calendar.set(Calendar.SECOND, 0)
            val todayStart = calendar.timeInMillis
            
            val todayRevenue = (completedBookings + orders).filter { 
                it.completedAt >= todayStart 
            }.sumOf { parsePrice(it.price) }
            
            // Calculate this week's revenue
            calendar.set(Calendar.DAY_OF_WEEK, Calendar.MONDAY)
            val weekStart = calendar.timeInMillis
            
            val weekRevenue = (completedBookings + orders).filter { 
                it.completedAt >= weekStart 
            }.sumOf { parsePrice(it.price) }
            
            // Calculate this month's revenue
            calendar.time = currentDate
            calendar.set(Calendar.DAY_OF_MONTH, 1)
            calendar.set(Calendar.HOUR_OF_DAY, 0)
            calendar.set(Calendar.MINUTE, 0)
            calendar.set(Calendar.SECOND, 0)
            val monthStart = calendar.timeInMillis
            
            val monthRevenue = (completedBookings + orders).filter { 
                it.completedAt >= monthStart 
            }.sumOf { parsePrice(it.price) }
            
            // Calculate total revenue
            val totalRevenue = (completedBookings + orders).sumOf { parsePrice(it.price) }
            
            RevenueData(
                todayRevenue = todayRevenue,
                weekRevenue = weekRevenue,
                monthRevenue = monthRevenue,
                totalRevenue = totalRevenue,
                totalTransactions = completedBookings.size + orders.size
            )
        } catch (e: Exception) {
            RevenueData(0.0, 0.0, 0.0, 0.0, 0)
        }
    }
    
    /**
     * Get booking analytics for shop owner
     */
    suspend fun getBookingAnalytics(shopOwnerId: String): BookingAnalytics {
        return try {
            val allBookings = BookingRepository.instance.getBookingsForShopOwner(shopOwnerId)
            
            val totalBookings = allBookings.size
            val pendingBookings = allBookings.count { it.status == BookingStatus.PENDING }
            val confirmedBookings = allBookings.count { it.status == BookingStatus.ACCEPTED }
            val completedBookings = allBookings.count { it.status == BookingStatus.COMPLETED }
            val cancelledBookings = allBookings.count { it.status == BookingStatus.CANCELLED }
            
            val currentDate = Date()
            val calendar = Calendar.getInstance()
            calendar.time = currentDate
            calendar.set(Calendar.HOUR_OF_DAY, 0)
            calendar.set(Calendar.MINUTE, 0)
            calendar.set(Calendar.SECOND, 0)
            val todayStart = calendar.timeInMillis
            
            val todayBookings = allBookings.count { it.createdAt >= todayStart }
            
            BookingAnalytics(
                totalBookings = totalBookings,
                pendingBookings = pendingBookings,
                confirmedBookings = confirmedBookings,
                completedBookings = completedBookings,
                cancelledBookings = cancelledBookings,
                todayBookings = todayBookings
            )
        } catch (e: Exception) {
            BookingAnalytics(0, 0, 0, 0, 0, 0)
        }
    }
    
    /**
     * Get booking analytics for a specific shop
     */
    suspend fun getBookingAnalyticsForShop(shopId: String): BookingAnalytics {
        return try {
            val allBookings = BookingRepository.instance.getBookingsForShop(shopId)
            
            val totalBookings = allBookings.size
            val pendingBookings = allBookings.count { it.status == BookingStatus.PENDING }
            val confirmedBookings = allBookings.count { it.status == BookingStatus.ACCEPTED }
            val completedBookings = allBookings.count { it.status == BookingStatus.COMPLETED }
            val cancelledBookings = allBookings.count { it.status == BookingStatus.CANCELLED }
            
            val currentDate = Date()
            val calendar = Calendar.getInstance()
            calendar.time = currentDate
            calendar.set(Calendar.HOUR_OF_DAY, 0)
            calendar.set(Calendar.MINUTE, 0)
            calendar.set(Calendar.SECOND, 0)
            val todayStart = calendar.timeInMillis
            
            val todayBookings = allBookings.count { it.createdAt >= todayStart }
            
            BookingAnalytics(
                totalBookings = totalBookings,
                pendingBookings = pendingBookings,
                confirmedBookings = confirmedBookings,
                completedBookings = completedBookings,
                cancelledBookings = cancelledBookings,
                todayBookings = todayBookings
            )
        } catch (e: Exception) {
            BookingAnalytics(0, 0, 0, 0, 0, 0)
        }
    }
    
    /**
     * Get monthly trend data
     */
    suspend fun getMonthlyTrend(shopOwnerId: String): List<MonthlyData> {
        return try {
            val completedBookings = getCompletedBookingsForOwner(shopOwnerId)
            val orders = getOrdersForOwner(shopOwnerId)
            
            val calendar = Calendar.getInstance()
            val monthlyData = mutableListOf<MonthlyData>()
            
            // Get last 12 months
            for (i in 11 downTo 0) {
                calendar.time = Date()
                calendar.add(Calendar.MONTH, -i)
                calendar.set(Calendar.DAY_OF_MONTH, 1)
                calendar.set(Calendar.HOUR_OF_DAY, 0)
                calendar.set(Calendar.MINUTE, 0)
                calendar.set(Calendar.SECOND, 0)
                val monthStart = calendar.timeInMillis
                
                calendar.add(Calendar.MONTH, 1)
                calendar.add(Calendar.MILLISECOND, -1)
                val monthEnd = calendar.timeInMillis
                
                val monthBookings = completedBookings.filter { 
                    it.completedAt >= monthStart && it.completedAt <= monthEnd 
                }
                val monthOrders = orders.filter { 
                    it.completedAt >= monthStart && it.completedAt <= monthEnd 
                }
                
                val revenue = (monthBookings + monthOrders).sumOf { parsePrice(it.price) }
                val bookings = monthBookings.size
                
                calendar.time = Date()
                calendar.add(Calendar.MONTH, -i)
                val monthName = calendar.getDisplayName(Calendar.MONTH, Calendar.SHORT, java.util.Locale.getDefault()) ?: ""
                
                monthlyData.add(MonthlyData(monthName, revenue, bookings))
            }
            
            monthlyData
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    /**
     * Get top selling products/services
     */
    suspend fun getTopSellingItems(shopOwnerId: String): List<TopSellingItem> {
        return try {
            val allBookings = BookingRepository.instance.getBookingsForShopOwner(shopOwnerId)
            val completedBookings = allBookings.filter { it.status == BookingStatus.COMPLETED }
            
            val serviceStats = completedBookings.groupBy { it.serviceName }
                .map { (serviceName, bookings) ->
                    TopSellingItem(
                        name = serviceName,
                        sales = bookings.size,
                        revenue = bookings.sumOf { parsePrice(extractPriceFromService(it.serviceName)) }
                    )
                }
                .sortedByDescending { it.sales }
                .take(10)
            
            serviceStats
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    private suspend fun getCompletedBookingsForOwner(shopOwnerId: String): List<RevenueItem> {
        return try {
            val bookings = BookingRepository.instance.getBookingsForShopOwner(shopOwnerId)
            bookings.filter { it.status == BookingStatus.COMPLETED }
                .map { booking ->
                    RevenueItem(
                        id = booking.id,
                        price = extractPriceFromService(booking.serviceName),
                        completedAt = booking.updatedAt
                    )
                }
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    private suspend fun getOrdersForOwner(shopOwnerId: String): List<RevenueItem> {
        return try {
            // TODO: Implement orders collection query when orders are implemented
            emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    private fun parsePrice(priceString: String): Double {
        return try {
            priceString.replace(Regex("[^0-9.]"), "").toDoubleOrNull() ?: 0.0
        } catch (e: Exception) {
            0.0
        }
    }
    
    private fun extractPriceFromService(serviceName: String): String {
        return when(serviceName) {
            "Phone Repair" -> "99.00"
            "Hair Styling" -> "60.00"
            "Wedding Photography" -> "1500.00"
            "Lawn Mowing" -> "45.00"
            "Computer Repair" -> "120.00"
            "Plumbing Service" -> "85.00"
            "House Cleaning" -> "75.00"
            "Pet Grooming" -> "50.00"
            else -> "50.00"
        }
    }
}

/**
 * Data classes for analytics
 */
data class RevenueData(
    val todayRevenue: Double,
    val weekRevenue: Double,
    val monthRevenue: Double,
    val totalRevenue: Double,
    val totalTransactions: Int
)

data class BookingAnalytics(
    val totalBookings: Int,
    val pendingBookings: Int,
    val confirmedBookings: Int,
    val completedBookings: Int,
    val cancelledBookings: Int,
    val todayBookings: Int
)

data class MonthlyData(
    val month: String,
    val revenue: Double,
    val bookings: Int
)

data class TopSellingItem(
    val name: String,
    val sales: Int,
    val revenue: Double
)

data class RevenueItem(
    val id: String,
    val price: String,
    val completedAt: Long
)
