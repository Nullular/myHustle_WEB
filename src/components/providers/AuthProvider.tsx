'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { AuthService } from '@/lib/firebase/auth';
import { useAuthStore } from '@/lib/store/auth';
import { User } from '@/types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  user: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { user, setUser, clearAuth, setLoading: setStoreLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      setStoreLoading(true);

      if (firebaseUser) {
        try {
          // Fetch user profile from Firestore
          const userProfile = await AuthService.getUserProfile(firebaseUser.uid);
          if (userProfile) {
            setUser(userProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          clearAuth();
        }
      } else {
        clearAuth();
      }

      setLoading(false);
      setStoreLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, clearAuth, setStoreLoading]);

  const value = {
    firebaseUser,
    user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
