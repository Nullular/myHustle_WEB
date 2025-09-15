package com.blueclipse.myhustle.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.blueclipse.myhustle.data.repository.AuthRepository
import com.google.firebase.auth.FirebaseUser
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

/**
 * ViewModel for managing authentication state and operations
 */
class AuthViewModel : ViewModel() {
    private val authRepository = AuthRepository.instance
    
    val currentUser: StateFlow<FirebaseUser?> = authRepository.currentUser
    val isLoading: StateFlow<Boolean> = authRepository.isLoading
    
    /**
     * Sign up a new user
     */
    fun signUp(email: String, username: String, password: String, onError: (String) -> Unit) {
        viewModelScope.launch {
            val result = authRepository.signUp(email, username, password)
            if (result.isFailure) {
                val errorMessage = when (val exception = result.exceptionOrNull()) {
                    is com.google.firebase.FirebaseException -> {
                        when {
                            exception.message?.contains("CONFIGURATION_NOT_FOUND") == true -> 
                                "Firebase Authentication is not properly configured. Please contact support."
                            exception.message?.contains("The email address is already in use") == true -> 
                                "This email is already registered"
                            exception.message?.contains("The email address is badly formatted") == true -> 
                                "Please enter a valid email address"
                            exception.message?.contains("Password should be at least 6 characters") == true -> 
                                "Password must be at least 6 characters"
                            else -> "Authentication service error: ${exception.message}"
                        }
                    }
                    else -> exception?.message ?: "Sign up failed"
                }
                onError(errorMessage)
            }
        }
    }
    
    /**
     * Sign in an existing user
     */
    fun signIn(email: String, password: String, onError: (String) -> Unit) {
        viewModelScope.launch {
            val result = authRepository.signIn(email, password)
            if (result.isFailure) {
                val errorMessage = when (result.exceptionOrNull()?.message) {
                    "The email address is badly formatted." -> "Please enter a valid email address"
                    "There is no user record corresponding to this identifier. The user may have been deleted." -> "No account found with this email"
                    "The password is invalid or the user does not have a password." -> "Incorrect password"
                    "Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later." -> "Too many failed attempts. Please try again later"
                    else -> result.exceptionOrNull()?.message ?: "Sign in failed"
                }
                onError(errorMessage)
            }
        }
    }
    
    /**
     * Sign out the current user
     */
    fun signOut() {
        authRepository.signOut()
    }
    
    /**
     * Check if user is signed in
     */
    fun isSignedIn(): Boolean {
        return authRepository.isSignedIn()
    }
    
    /**
     * Get current user email
     */
    fun getCurrentUserEmail(): String? {
        return authRepository.getCurrentUserEmail()
    }
}
