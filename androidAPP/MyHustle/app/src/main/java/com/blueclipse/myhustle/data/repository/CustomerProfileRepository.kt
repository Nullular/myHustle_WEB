package com.blueclipse.myhustle.data.repository

import com.blueclipse.myhustle.data.model.Booking
import com.blueclipse.myhustle.data.model.BookingStatus
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

/**
 * Repository for customer profile data including booking history
 */
class CustomerProfileRepository private constructor() {
    
    private val firestore = FirebaseFirestore.getInstance()
    private val bookingsCollection = firestore.collection("bookings")
    
    companion object {
        @Volatile
        private var INSTANCE: CustomerProfileRepository? = null
        
        val instance: CustomerProfileRepository
            get() = INSTANCE ?: synchronized(this) {
                INSTANCE ?: CustomerProfileRepository().also { INSTANCE = it }
            }
    }
    
    /**
     * Get all bookings for a customer
     */
    suspend fun getCustomerBookings(customerId: String): List<Booking> {
        return try {
            val querySnapshot = bookingsCollection
                .whereEqualTo("customerId", customerId)
                .get()
                .await()
            
            querySnapshot.documents.mapNotNull { document ->
                document.toObject(Booking::class.java)?.copy(id = document.id)
            }.sortedByDescending { it.createdAt }
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    /**
     * Get customer bookings by status
     */
    suspend fun getCustomerBookingsByStatus(customerId: String, status: BookingStatus): List<Booking> {
        return try {
            val querySnapshot = bookingsCollection
                .whereEqualTo("customerId", customerId)
                .whereEqualTo("status", status)
                .get()
                .await()
            
            querySnapshot.documents.mapNotNull { document ->
                document.toObject(Booking::class.java)?.copy(id = document.id)
            }.sortedByDescending { it.createdAt }
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    /**
     * Get pending bookings for customer
     */
    suspend fun getCustomerPendingBookings(customerId: String): List<Booking> {
        return getCustomerBookingsByStatus(customerId, BookingStatus.PENDING)
    }
    
    /**
     * Get confirmed bookings for customer
     */
    suspend fun getCustomerConfirmedBookings(customerId: String): List<Booking> {
        return getCustomerBookingsByStatus(customerId, BookingStatus.ACCEPTED)
    }
    
    /**
     * Get completed bookings for customer
     */
    suspend fun getCustomerCompletedBookings(customerId: String): List<Booking> {
        return getCustomerBookingsByStatus(customerId, BookingStatus.COMPLETED)
    }
    
    /**
     * Cancel a booking
     */
    suspend fun cancelBooking(bookingId: String): Result<Unit> {
        return try {
            val updates = mapOf(
                "status" to BookingStatus.CANCELLED,
                "updatedAt" to System.currentTimeMillis()
            )
            bookingsCollection.document(bookingId).update(updates).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
