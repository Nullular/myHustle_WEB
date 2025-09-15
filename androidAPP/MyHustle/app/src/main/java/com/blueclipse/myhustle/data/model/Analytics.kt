package com.blueclipse.myhustle.data.model

/**
 * Represents analytics data in the MyHustle platform
 */
data class Analytics(
    val id: String = "",
    
    // Scope
    val scope: AnalyticsScope = AnalyticsScope.SHOP,
    val entityId: String = "",
    
    // Time Period
    val period: AnalyticsPeriod = AnalyticsPeriod.DAILY,
    val date: String = "",
    
    // Core Metrics
    val metrics: AnalyticsMetrics = AnalyticsMetrics(),
    
    // Engagement
    val engagement: EngagementMetrics = EngagementMetrics(),
    
    // Performance
    val performance: PerformanceMetrics = PerformanceMetrics(),
    
    // Geographic Data
    val topCities: List<String> = emptyList(),
    val topCountries: List<String> = emptyList(),
    
    // Timestamps
    val createdAt: Long = System.currentTimeMillis(),
    val lastUpdated: Long = System.currentTimeMillis()
) {
    constructor() : this(
        "", AnalyticsScope.SHOP, "", AnalyticsPeriod.DAILY, "",
        AnalyticsMetrics(), EngagementMetrics(), PerformanceMetrics(),
        emptyList(), emptyList(), System.currentTimeMillis(), System.currentTimeMillis()
    )
}

/**
 * Core analytics metrics
 */
data class AnalyticsMetrics(
    val views: Int = 0,
    val clicks: Int = 0,
    val conversions: Int = 0,
    val revenue: Double = 0.0
) {
    constructor() : this(0, 0, 0, 0.0)
}

/**
 * Engagement metrics
 */
data class EngagementMetrics(
    val favorites: Int = 0,
    val shares: Int = 0,
    val messages: Int = 0,
    val reviewsReceived: Int = 0
) {
    constructor() : this(0, 0, 0, 0)
}

/**
 * Performance metrics
 */
data class PerformanceMetrics(
    val averageRating: Float = 0f,
    val responseTimeMinutes: Int = 0,
    val fulfillmentRate: Float = 0f,
    val repeatCustomerRate: Float = 0f
) {
    constructor() : this(0f, 0, 0f, 0f)
}

/**
 * Analytics scope enum
 */
enum class AnalyticsScope {
    SHOP,
    PRODUCT,
    SERVICE,
    USER,
    PLATFORM
}

/**
 * Analytics period enum
 */
enum class AnalyticsPeriod {
    DAILY,
    WEEKLY,
    MONTHLY,
    YEARLY
}
