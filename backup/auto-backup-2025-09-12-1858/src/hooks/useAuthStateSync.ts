import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useAuthStore } from '@/lib/store/auth';
import { AuthService } from '@/lib/firebase/auth';

/**
 * Authentication state persistence hook
 * Automatically restores user session on page reload
 */
export function useAuthStateSync() {
  const { setUser, setLoading, clearAuth } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in - get their profile from Firestore
          const userProfile = await AuthService.getUserProfile(firebaseUser.uid);
          
          if (userProfile) {
            setUser(userProfile);
            console.log('✅ User session restored:', userProfile.displayName);
          } else {
            // User exists in Auth but not in Firestore - clear session
            console.warn('⚠️ User profile not found in Firestore, clearing session');
            clearAuth();
          }
        } else {
          // User is signed out
          console.log('👋 User session ended');
          clearAuth();
        }
      } catch (error) {
        console.error('❌ Error syncing auth state:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [setUser, setLoading, clearAuth]);
}
