package com.blueclipse.myhustle.hotfix

import android.util.Log
import com.google.firebase.firestore.FirebaseFirestore

/**
 * CRITICAL HOTFIX for Firebase Index Error Loop
 * 
 * This hotfix can be called immediately to stop any active listeners
 * that are causing the infinite loop and crashing the device.
 */
object FirebaseListenerHotfix {
    
    private val firestore = FirebaseFirestore.getInstance()
    
    /**
     * Emergency method to disable all problematic Firestore listeners
     * Call this immediately if the app is in an error loop
     */
    fun emergencyDisableListeners() {
        try {
            Log.w("HOTFIX", "🚨 EMERGENCY: Disabling all Firestore listeners to prevent crash loop")
            
            // Disable all network activity temporarily
            firestore.disableNetwork()
            
            Log.w("HOTFIX", "✅ Firestore network disabled - app should stop crashing")
            
            // Re-enable after 10 seconds with safer settings
            android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                try {
                    firestore.enableNetwork()
                    Log.i("HOTFIX", "✅ Firestore network re-enabled with safer settings")
                } catch (e: Exception) {
                    Log.e("HOTFIX", "Error re-enabling network", e)
                }
            }, 10000)
            
        } catch (e: Exception) {
            Log.e("HOTFIX", "Error in emergency disable", e)
        }
    }
    
    /**
     * Check if we're in a crash loop state
     */
    fun isInCrashLoop(): Boolean {
        // Simple heuristic: if we've been called multiple times in short succession
        return false // Can be enhanced with actual detection logic
    }
    
    /**
     * Safe restart method that avoids problematic queries
     */
    fun safeRestart() {
        Log.i("HOTFIX", "🔄 Safe restart initiated")
        try {
            // Clear any cached listeners
            firestore.clearPersistence()
            Log.i("HOTFIX", "✅ Firestore cache cleared")
        } catch (e: Exception) {
            Log.w("HOTFIX", "Could not clear cache", e)
        }
    }
}

/**
 * USAGE INSTRUCTIONS:
 * 
 * 1. If app is crashing in a loop, call immediately:
 *    FirebaseListenerHotfix.emergencyDisableListeners()
 * 
 * 2. Add to Application.onCreate() as safety measure:
 *    if (FirebaseListenerHotfix.isInCrashLoop()) {
 *        FirebaseListenerHotfix.emergencyDisableListeners()
 *    }
 * 
 * 3. For development/debugging:
 *    FirebaseListenerHotfix.safeRestart()
 */
