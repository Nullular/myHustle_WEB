package com.blueclipse.myhustle.data.repository

import com.blueclipse.myhustle.data.model.Notification
import com.blueclipse.myhustle.data.model.NotificationPriority
import com.blueclipse.myhustle.data.model.NotificationType
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.tasks.await

/**
 * Repository for managing notification data in Firebase
 */
class NotificationRepository private constructor() {
    private val firestore = FirebaseFirestore.getInstance()
    private val notificationsCollection = firestore.collection("notifications")
    
    private val _notifications = MutableStateFlow<List<Notification>>(emptyList())
    val notifications: StateFlow<List<Notification>> = _notifications.asStateFlow()
    
    private val _unreadCount = MutableStateFlow(0)
    val unreadCount: StateFlow<Int> = _unreadCount.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    companion object {
        @Volatile
        private var INSTANCE: NotificationRepository? = null
        
        val instance: NotificationRepository
            get() = INSTANCE ?: synchronized(this) {
                INSTANCE ?: NotificationRepository().also { INSTANCE = it }
            }
    }
    
    /**
     * Create a new notification
     */
    suspend fun createNotification(notification: Notification): Result<String> {
        return try {
            _isLoading.value = true
            val documentRef = notificationsCollection.add(notification).await()
            val notificationId = documentRef.id
            
            // Update the notification with its ID
            documentRef.update("id", notificationId).await()
            
            Result.success(notificationId)
        } catch (e: Exception) {
            Result.failure(e)
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * Get notifications for a user
     */
    suspend fun getNotificationsForUser(userId: String): Result<List<Notification>> {
        return try {
            _isLoading.value = true
            val snapshot = notificationsCollection
                .whereEqualTo("userId", userId)
                .orderBy("createdAt", Query.Direction.DESCENDING)
                .limit(50)
                .get()
                .await()
            
            val notifications = snapshot.documents.mapNotNull { document ->
                try {
                    document.toObject(Notification::class.java)?.copy(id = document.id)
                } catch (e: Exception) {
                    null
                }
            }
            
            _notifications.value = notifications
            
            // Update unread count
            val unreadCount = notifications.count { !it.isRead }
            _unreadCount.value = unreadCount
            
            Result.success(notifications)
        } catch (e: Exception) {
            Result.failure(e)
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * Mark notification as read
     */
    suspend fun markAsRead(notificationId: String): Result<Unit> {
        return try {
            val updateData = mapOf(
                "isRead" to true,
                "readAt" to System.currentTimeMillis()
            )
            
            notificationsCollection.document(notificationId).update(updateData).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Mark all notifications as read for a user
     */
    suspend fun markAllAsRead(userId: String): Result<Unit> {
        return try {
            val snapshot = notificationsCollection
                .whereEqualTo("userId", userId)
                .whereEqualTo("isRead", false)
                .get()
                .await()
            
            val batch = firestore.batch()
            snapshot.documents.forEach { document ->
                batch.update(document.reference, mapOf(
                    "isRead" to true,
                    "readAt" to System.currentTimeMillis()
                ))
            }
            
            batch.commit().await()
            _unreadCount.value = 0
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Delete notification
     */
    suspend fun deleteNotification(notificationId: String): Result<Unit> {
        return try {
            notificationsCollection.document(notificationId).delete().await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Send notification to user
     */
    suspend fun sendNotification(
        userId: String,
        type: NotificationType,
        title: String,
        message: String,
        data: Map<String, Any> = emptyMap(),
        priority: NotificationPriority = NotificationPriority.NORMAL
    ): Result<String> {
        val notification = Notification(
            id = "",
            userId = userId,
            type = type,
            title = title,
            message = message,
            priority = priority,
            isRead = false,
            createdAt = System.currentTimeMillis()
        )
        
        return createNotification(notification)
    }
    
    /**
     * Get unread count for user
     */
    suspend fun getUnreadCount(userId: String): Result<Int> {
        return try {
            val snapshot = notificationsCollection
                .whereEqualTo("userId", userId)
                .whereEqualTo("isRead", false)
                .get()
                .await()
            
            val count = snapshot.size()
            _unreadCount.value = count
            
            Result.success(count)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Clean up old notifications (older than 30 days)
     */
    suspend fun cleanupOldNotifications(): Result<Unit> {
        return try {
            val thirtyDaysAgo = System.currentTimeMillis() - (30 * 24 * 60 * 60 * 1000L)
            
            val snapshot = notificationsCollection
                .whereLessThan("createdAt", thirtyDaysAgo)
                .get()
                .await()
            
            val batch = firestore.batch()
            snapshot.documents.forEach { document ->
                batch.delete(document.reference)
            }
            
            batch.commit().await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
