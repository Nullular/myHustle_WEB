package com.blueclipse.myhustle.data.util

import android.util.Log
import com.blueclipse.myhustle.data.model.User
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

/**
 * Utility for discovering users by email or username for messaging
 */
object UserDiscovery {
    
    private val firestore = FirebaseFirestore.getInstance()
    private val usersCollection = firestore.collection("users")
    
    /**
     * Search for users by email (exact match)
     */
    suspend fun findUserByEmail(email: String): User? {
        return try {
            Log.d("UserDiscovery", "Searching for user by email: $email")
            
            val snapshot = usersCollection
                .whereEqualTo("email", email)
                .limit(1)
                .get()
                .await()
            
            val user = snapshot.documents.firstOrNull()?.let { doc ->
                doc.toObject(User::class.java)?.copy(id = doc.id)
            }
            
            Log.d("UserDiscovery", "Found user: ${user?.displayName}")
            user
        } catch (e: Exception) {
            Log.e("UserDiscovery", "Error finding user by email", e)
            null
        }
    }
    
    /**
     * Search for users by display name or username (partial match)
     */
    suspend fun searchUsersByName(query: String, limit: Int = 10): List<User> {
        return try {
            Log.d("UserDiscovery", "Searching users by name: $query")
            
            if (query.isBlank()) return emptyList()
            
            // Firestore doesn't have great text search, so we'll do basic prefix matching
            val queryLower = query.lowercase().trim()
            
            val snapshot = usersCollection
                .orderBy("displayName")
                .startAt(queryLower)
                .endAt(queryLower + "\uf8ff")
                .limit(limit.toLong())
                .get()
                .await()
            
            val users = snapshot.documents.mapNotNull { doc ->
                doc.toObject(User::class.java)?.copy(id = doc.id)
            }.filter { user ->
                // Additional filtering on client side
                val displayName = user.displayName.lowercase()
                val firstName = user.profile.firstName.lowercase()
                val lastName = user.profile.lastName.lowercase()
                
                displayName.contains(queryLower) || 
                firstName.contains(queryLower) || 
                lastName.contains(queryLower) ||
                "$firstName $lastName".contains(queryLower)
            }
            
            Log.d("UserDiscovery", "Found ${users.size} users matching query")
            users
        } catch (e: Exception) {
            Log.e("UserDiscovery", "Error searching users by name", e)
            emptyList()
        }
    }
    
    /**
     * Get user by ID (for chat participants)
     */
    suspend fun getUserById(userId: String): User? {
        return try {
            Log.d("UserDiscovery", "Getting user by ID: $userId")
            
            val snapshot = usersCollection.document(userId).get().await()
            val user = snapshot.toObject(User::class.java)?.copy(id = snapshot.id)
            
            Log.d("UserDiscovery", "Retrieved user: ${user?.displayName}")
            user
        } catch (e: Exception) {
            Log.e("UserDiscovery", "Error getting user by ID", e)
            null
        }
    }
    
    /**
     * Get multiple users by IDs (batch operation)
     */
    suspend fun getUsersByIds(userIds: List<String>): Map<String, User> {
        return try {
            Log.d("UserDiscovery", "Getting ${userIds.size} users by IDs")
            
            if (userIds.isEmpty()) return emptyMap()
            
            // Firestore batch get - limited to 10 documents per batch
            val result = mutableMapOf<String, User>()
            
            userIds.chunked(10).forEach { chunk ->
                val batch = chunk.map { userId ->
                    usersCollection.document(userId).get()
                }
                
                batch.forEach { task ->
                    val snapshot = task.await()
                    if (snapshot.exists()) {
                        snapshot.toObject(User::class.java)?.let { user ->
                            result[snapshot.id] = user.copy(id = snapshot.id)
                        }
                    }
                }
            }
            
            Log.d("UserDiscovery", "Retrieved ${result.size} users")
            result
        } catch (e: Exception) {
            Log.e("UserDiscovery", "Error getting users by IDs", e)
            emptyMap()
        }
    }
    
    /**
     * Validate that all user IDs exist (for creating chats)
     */
    suspend fun validateUserIds(userIds: List<String>): Boolean {
        return try {
            val users = getUsersByIds(userIds)
            users.size == userIds.size
        } catch (e: Exception) {
            Log.e("UserDiscovery", "Error validating user IDs", e)
            false
        }
    }
}
