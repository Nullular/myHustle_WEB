package com.blueclipse.myhustle.data.repository

import android.util.Log
import com.blueclipse.myhustle.data.model.Booking
import com.blueclipse.myhustle.data.model.BookingStatus
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.tasks.await

/**
 * Repository for managing booking data in Firebase
 */
class BookingRepository private constructor() {
    
    private val firestore = FirebaseFirestore.getInstance()
    private val bookingsCollection = firestore.collection("bookings")
    
    private val _bookings = MutableStateFlow<List<Booking>>(emptyList())
    val bookings: StateFlow<List<Booking>> = _bookings.asStateFlow()
    
    init {
        // Start listening for current user's bookings
        startBookingsListener()
    }
    
    private fun startBookingsListener() {
        val currentUser = FirebaseAuth.getInstance().currentUser
        if (currentUser != null) {
            Log.d("BookingRepo", "Starting bookings listener for user: ${currentUser.uid}")
            
            // Listen for bookings by userId
            bookingsCollection
                .whereEqualTo("customerId", currentUser.uid)
                .addSnapshotListener { snapshot, error ->
                    if (error != null) {
                        Log.e("BookingRepo", "Bookings listener error", error)
                        return@addSnapshotListener
                    }
                    
                    if (snapshot != null) {
                        Log.d("BookingRepo", "Bookings listener update - ${snapshot.documents.size} bookings by userId")
                        val userBookings = snapshot.documents.mapNotNull { document ->
                            try {
                                document.toObject(Booking::class.java)?.copy(id = document.id)
                            } catch (e: Exception) {
                                Log.e("BookingRepo", "Error parsing booking", e)
                                null
                            }
                        }.sortedByDescending { it.createdAt }
                        
                        _bookings.value = userBookings
                    }
                }
            
            // Also listen for bookings by email if different from userId
            if (currentUser.email != null) {
                bookingsCollection
                    .whereEqualTo("customerEmail", currentUser.email)
                    .addSnapshotListener { snapshot, error ->
                        if (error != null) {
                            Log.e("BookingRepo", "Bookings by email listener error", error)
                            return@addSnapshotListener
                        }
                        
                        if (snapshot != null) {
                            Log.d("BookingRepo", "Bookings by email listener update - ${snapshot.documents.size} bookings by email")
                            val emailBookings = snapshot.documents.mapNotNull { document ->
                                try {
                                    document.toObject(Booking::class.java)?.copy(id = document.id)
                                } catch (e: Exception) {
                                    Log.e("BookingRepo", "Error parsing booking by email", e)
                                    null
                                }
                            }.sortedByDescending { it.createdAt }
                            
                            // Combine with existing bookings, avoiding duplicates
                            val currentBookings = _bookings.value
                            val allBookings = (currentBookings + emailBookings)
                                .distinctBy { it.id }
                                .sortedByDescending { it.createdAt }
                            
                            _bookings.value = allBookings
                        }
                    }
            }
        } else {
            Log.d("BookingRepo", "No current user, clearing bookings")
            _bookings.value = emptyList()
        }
    }
    
    /**
     * Manually refresh bookings for current user
     */
    suspend fun refreshUserBookings() {
        val currentUser = FirebaseAuth.getInstance().currentUser
        if (currentUser != null) {
            try {
                // Get bookings by userId
                val userIdBookings = getBookingsForCustomer(currentUser.uid)
                
                // Get bookings by email if available
                val emailBookings = if (currentUser.email != null) {
                    getBookingsForCustomerByEmail(currentUser.email!!)
                } else {
                    emptyList()
                }
                
                // Combine and remove duplicates
                val allBookings = (userIdBookings + emailBookings)
                    .distinctBy { it.id }
                    .sortedByDescending { it.createdAt }
                
                _bookings.value = allBookings
                Log.d("BookingRepo", "Refreshed ${allBookings.size} bookings for current user")
            } catch (e: Exception) {
                Log.e("BookingRepo", "Error refreshing user bookings", e)
            }
        }
    }
    
    /**
     * Get bookings for a customer by email
     */
    suspend fun getBookingsForCustomerByEmail(customerEmail: String): List<Booking> {
        return try {
            val snapshot = bookingsCollection
                .whereEqualTo("customerEmail", customerEmail)
                .get()
                .await()
            
            snapshot.documents.mapNotNull { document ->
                try {
                    document.toObject(Booking::class.java)?.copy(id = document.id)
                } catch (e: Exception) {
                    null
                }
            }.sortedByDescending { it.createdAt }
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    /**
     * Get bookings for a specific shop owner
     */
    suspend fun getBookingsForShopOwner(shopOwnerId: String): List<Booking> {
        return try {
            val snapshot = bookingsCollection
                .whereEqualTo("shopOwnerId", shopOwnerId)
                .get()
                .await()
            
            snapshot.documents.mapNotNull { document ->
                try {
                    document.toObject(Booking::class.java)?.copy(id = document.id)
                } catch (e: Exception) {
                    null
                }
            }.sortedByDescending { it.createdAt }
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    /**
     * Get bookings for a specific shop
     */
    suspend fun getBookingsForShop(shopId: String): List<Booking> {
        return try {
            val snapshot = bookingsCollection
                .whereEqualTo("shopId", shopId)
                .get()
                .await()
            
            snapshot.documents.mapNotNull { document ->
                try {
                    document.toObject(Booking::class.java)?.copy(id = document.id)
                } catch (e: Exception) {
                    null
                }
            }.sortedByDescending { it.createdAt }
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    /**
     * Get bookings for a specific customer
     */
    suspend fun getBookingsForCustomer(customerId: String): List<Booking> {
        return try {
            val snapshot = bookingsCollection
                .whereEqualTo("customerId", customerId)
                .get()
                .await()
            
            snapshot.documents.mapNotNull { document ->
                try {
                    document.toObject(Booking::class.java)?.copy(id = document.id)
                } catch (e: Exception) {
                    null
                }
            }.sortedByDescending { it.createdAt }
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    /**
     * Create a new booking
     */
    suspend fun createBooking(booking: Booking): Result<String> {
        return try {
            val document = bookingsCollection.add(booking).await()
            Result.success(document.id)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Update booking status
     */
    suspend fun updateBookingStatus(
        bookingId: String, 
        status: BookingStatus, 
        responseMessage: String = ""
    ): Result<Unit> {
        return try {
            val updates = mapOf(
                "status" to status,
                "responseMessage" to responseMessage,
                "updatedAt" to System.currentTimeMillis()
            )
            bookingsCollection.document(bookingId).update(updates).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Delete a booking
     */
    suspend fun deleteBooking(bookingId: String): Result<Unit> {
        return try {
            bookingsCollection.document(bookingId).delete().await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    companion object {
        @Volatile
        private var INSTANCE: BookingRepository? = null
        
        val instance: BookingRepository
            get() = INSTANCE ?: synchronized(this) {
                INSTANCE ?: BookingRepository().also { INSTANCE = it }
            }
    }
}
