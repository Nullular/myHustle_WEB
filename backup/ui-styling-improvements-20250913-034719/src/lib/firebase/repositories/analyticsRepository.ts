import { bookingRepository } from './bookingRepository';
import { BookingAnalytics, BookingOverview } from '@/types';

/**
 * Repository for live analytics data from Firebase
 * Matches Android AnalyticsRepository.kt pattern exactly
 */
class AnalyticsRepository {
  private static instance: AnalyticsRepository;

  static getInstance(): AnalyticsRepository {
    if (!AnalyticsRepository.instance) {
      AnalyticsRepository.instance = new AnalyticsRepository();
    }
    return AnalyticsRepository.instance;
  }

  /**
   * Get booking analytics for shop owner (all shops)
   * Matches: AnalyticsRepository.getBookingAnalytics(shopOwnerId)
   */
  async getBookingAnalytics(shopOwnerId: string): Promise<BookingAnalytics> {
    try {
      return await bookingRepository.getBookingAnalytics(shopOwnerId);
    } catch (error) {
      console.error('Error getting booking analytics:', error);
      return {
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        todayBookings: 0
      };
    }
  }

  /**
   * Get booking analytics for a specific shop
   * Matches: AnalyticsRepository.getBookingAnalyticsForShop(shopId)
   */
  async getBookingAnalyticsForShop(shopId: string): Promise<BookingAnalytics> {
    try {
      return await bookingRepository.getBookingAnalyticsForShop(shopId);
    } catch (error) {
      console.error('Error getting shop booking analytics:', error);
      return {
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        todayBookings: 0
      };
    }
  }

  /**
   * Create BookingOverview from BookingAnalytics
   * Matches Android pattern: BookingOverview(analytics.pendingBookings, ...)
   */
  createBookingOverview(analytics: BookingAnalytics): BookingOverview {
    return {
      pendingRequests: analytics.pendingBookings,
      todaysBookings: analytics.todayBookings,
      upcomingBookings: analytics.confirmedBookings,
      totalBookings: analytics.totalBookings
    };
  }
}

export const analyticsRepository = AnalyticsRepository.getInstance();
