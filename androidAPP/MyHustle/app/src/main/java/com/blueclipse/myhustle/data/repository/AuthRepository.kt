package com.blueclipse.myhustle.data.repository

import android.util.Log
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.tasks.await

/**
 * Repository for handling Firebase Authentication
 */
class AuthRepository {
    private val firebaseAuth = FirebaseAuth.getInstance()
    private val userRepository = UserRepository.instance
    
    private val _currentUser = MutableStateFlow<FirebaseUser?>(firebaseAuth.currentUser)
    val currentUser: StateFlow<FirebaseUser?> = _currentUser.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    init {
        // Listen for auth state changes
        firebaseAuth.addAuthStateListener { auth ->
            _currentUser.value = auth.currentUser
            Log.d("AuthRepository", "Auth state changed: ${auth.currentUser?.email ?: "Not logged in"}")
        }
    }
    
    /**
     * Sign up with email and password
     */
    suspend fun signUp(email: String, username: String, password: String): Result<FirebaseUser> {
        return try {
            _isLoading.value = true
            Log.d("AuthRepository", "🔐 Attempting sign up for: $email")
            
            val result = firebaseAuth.createUserWithEmailAndPassword(email, password).await()
            val user = result.user
            
            if (user != null) {
                Log.d("AuthRepository", "✅ Sign up successful for: ${user.email}")
                
                // Automatically create user document in Firestore with username
                Log.d("AuthRepository", "🔥 Creating Firestore user document...")
                val createUserResult = userRepository.createUserFromAuth(user, username)
                
                if (createUserResult.isSuccess) {
                    Log.d("AuthRepository", "✅ User document created successfully in Firestore")
                } else {
                    Log.w("AuthRepository", "⚠️ User authenticated but Firestore document creation failed: ${createUserResult.exceptionOrNull()}")
                    // Don't fail the entire signup - auth succeeded
                }
                
                Result.success(user)
            } else {
                Log.e("AuthRepository", "❌ Sign up failed: User is null")
                Result.failure(Exception("Sign up failed: User is null"))
            }
        } catch (e: Exception) {
            Log.e("AuthRepository", "❌ Sign up failed", e)
            Result.failure(e)
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * Sign in with email and password
     */
    suspend fun signIn(email: String, password: String): Result<FirebaseUser> {
        return try {
            _isLoading.value = true
            Log.d("AuthRepository", "🔐 Attempting sign in for: $email")
            
            val result = firebaseAuth.signInWithEmailAndPassword(email, password).await()
            val user = result.user
            
            if (user != null) {
                Log.d("AuthRepository", "✅ Sign in successful for: ${user.email}")
                
                // Check if user document exists in Firestore, create if it doesn't
                if (!userRepository.userExists(user.uid)) {
                    Log.d("AuthRepository", "🔥 User document doesn't exist, creating...")
                    val createUserResult = userRepository.createUserFromAuth(user)
                    
                    if (createUserResult.isSuccess) {
                        Log.d("AuthRepository", "✅ User document created for existing auth user")
                    } else {
                        Log.w("AuthRepository", "⚠️ Failed to create user document: ${createUserResult.exceptionOrNull()}")
                    }
                } else {
                    // Update last login time
                    userRepository.updateLastLogin(user.uid)
                }
                
                Result.success(user)
            } else {
                Log.e("AuthRepository", "❌ Sign in failed: User is null")
                Result.failure(Exception("Sign in failed: User is null"))
            }
        } catch (e: Exception) {
            Log.e("AuthRepository", "❌ Sign in failed", e)
            Result.failure(e)
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * Sign out the current user
     */
    fun signOut() {
        try {
            Log.d("AuthRepository", "🚪 Signing out user: ${firebaseAuth.currentUser?.email}")
            firebaseAuth.signOut()
        } catch (e: Exception) {
            Log.e("AuthRepository", "❌ Sign out failed", e)
        }
    }
    
    /**
     * Check if user is currently signed in
     */
    fun isSignedIn(): Boolean {
        return firebaseAuth.currentUser != null
    }
    
    /**
     * Get current user email
     */
    fun getCurrentUserEmail(): String? {
        return firebaseAuth.currentUser?.email
    }
    
    companion object {
        @Volatile
        private var INSTANCE: AuthRepository? = null
        
        val instance: AuthRepository
            get() = INSTANCE ?: synchronized(this) {
                INSTANCE ?: AuthRepository().also { INSTANCE = it }
            }
    }
}
