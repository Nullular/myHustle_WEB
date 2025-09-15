package com.blueclipse.myhustle.data.repository

import com.blueclipse.myhustle.data.model.User
import com.blueclipse.myhustle.data.model.UserType
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.tasks.await

/**
 * Repository for managing user data in Firebase
 */
class UserRepository private constructor() {
    private val firestore = FirebaseFirestore.getInstance()
    private val usersCollection = firestore.collection("users")
    private val auth = FirebaseAuth.getInstance()
    
    private val _currentUser = MutableStateFlow<User?>(null)
    val currentUser: StateFlow<User?> = _currentUser.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    init {
        // Listen for auth changes and clear data on sign out
        auth.addAuthStateListener { firebaseAuth ->
            val user = firebaseAuth.currentUser
            android.util.Log.d("UserRepository", "Auth state changed: ${user?.email ?: "signed out"}")
            
            if (user == null) {
                // User signed out - clear all cached user data for security
                android.util.Log.d("UserRepository", "🚪 User signed out, clearing user data")
                clearData()
            }
        }
    }
    
    /**
     * Clear all cached data (called on sign out)
     */
    private fun clearData() {
        _currentUser.value = null
        _isLoading.value = false
    }
    
    companion object {
        @Volatile
        private var INSTANCE: UserRepository? = null
        
        val instance: UserRepository
            get() = INSTANCE ?: synchronized(this) {
                INSTANCE ?: UserRepository().also { INSTANCE = it }
            }
    }
    
    /**
     * Create a new user
     */
    suspend fun createUser(user: User): Result<String> {
        return try {
            _isLoading.value = true
            val documentRef = usersCollection.add(user).await()
            val userId = documentRef.id
            
            // Update the user with its ID
            val updatedUser = user.copy(id = userId)
            documentRef.set(updatedUser).await()
            
            Result.success(userId)
        } catch (e: Exception) {
            Result.failure(e)
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * Get user by ID
     */
    suspend fun getUserById(userId: String): Result<User?> {
        return try {
            val document = usersCollection.document(userId).get().await()
            if (document.exists()) {
                val user = document.toObject(User::class.java)?.copy(id = document.id)
                Result.success(user)
            } else {
                Result.success(null)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Get user by email
     */
    suspend fun getUserByEmail(email: String): Result<User?> {
        return try {
            val snapshot = usersCollection
                .whereEqualTo("email", email)
                .limit(1)
                .get()
                .await()
            
            if (snapshot.documents.isNotEmpty()) {
                val user = snapshot.documents.first().toObject(User::class.java)?.copy(
                    id = snapshot.documents.first().id
                )
                Result.success(user)
            } else {
                Result.success(null)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Update user
     */
    suspend fun updateUser(user: User): Result<Unit> {
        return try {
            usersCollection.document(user.id).set(user).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Delete user
     */
    suspend fun deleteUser(userId: String): Result<Unit> {
        return try {
            usersCollection.document(userId).delete().await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Set current user
     */
    fun setCurrentUser(user: User?) {
        _currentUser.value = user
    }
    
    /**
     * Update last login time
     */
    suspend fun updateLastLogin(userId: String): Result<Unit> {
        return try {
            val updateData = mapOf("lastLoginAt" to System.currentTimeMillis())
            usersCollection.document(userId).update(updateData).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Create a user document from Firebase Auth user (for automatic account sync)
     */
    suspend fun createUserFromAuth(firebaseUser: com.google.firebase.auth.FirebaseUser, username: String? = null): Result<Unit> {
        return try {
            android.util.Log.d("UserRepository", "🔥 Creating Firestore user document for: ${firebaseUser.email}")
            
            val user = User(
                id = firebaseUser.uid,
                email = firebaseUser.email ?: "",
                username = username ?: extractUsernameFromEmail(firebaseUser.email ?: ""),
                displayName = firebaseUser.displayName ?: extractNameFromEmail(firebaseUser.email ?: ""),
                photoUrl = firebaseUser.photoUrl?.toString() ?: "",
                userType = UserType.CUSTOMER, // Default to customer
                createdAt = System.currentTimeMillis(),
                verified = firebaseUser.isEmailVerified, // Use correct field name
                active = true,                            // Use correct field name
                lastLoginAt = System.currentTimeMillis()
            )
            
            usersCollection.document(firebaseUser.uid).set(user).await()
            android.util.Log.d("UserRepository", "✅ User document created successfully for: ${firebaseUser.email}")
            
            Result.success(Unit)
        } catch (e: Exception) {
            android.util.Log.e("UserRepository", "❌ Failed to create user document", e)
            Result.failure(e)
        }
    }
    
    /**
     * Check if user document exists in Firestore
     */
    suspend fun userExists(userId: String): Boolean {
        return try {
            val document = usersCollection.document(userId).get().await()
            document.exists()
        } catch (e: Exception) {
            android.util.Log.e("UserRepository", "❌ Error checking if user exists", e)
            false
        }
    }
    
    /**
     * Extract a display name from email (before @ symbol)
     */
    private fun extractNameFromEmail(email: String): String {
        return email.substringBefore("@").replaceFirstChar { 
            if (it.isLowerCase()) it.titlecase() else it.toString() 
        }
    }
    
    /**
     * Extract a username from email (before @ symbol, lowercase)
     */
    private fun extractUsernameFromEmail(email: String): String {
        return email.substringBefore("@").lowercase()
    }
    
    /**
     * Update user's message bubble color preference
     */
    suspend fun updateMessageBubbleColor(userId: String, colorId: String): Result<Unit> {
        return try {
            android.util.Log.d("UserRepository", "🎨 Updating message bubble color for user: $userId to color: $colorId")
            
            val updateData = mapOf(
                "profile.preferences.messaging.bubbleColor" to colorId
            )
            
            usersCollection.document(userId).update(updateData).await()
            android.util.Log.d("UserRepository", "✅ Message bubble color updated successfully")
            
            Result.success(Unit)
        } catch (e: Exception) {
            android.util.Log.e("UserRepository", "❌ Failed to update message bubble color", e)
            Result.failure(e)
        }
    }
}
