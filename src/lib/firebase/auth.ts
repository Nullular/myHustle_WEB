import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
  AuthError,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { auth, db } from './config';
import { User, LoginForm, SignUpForm } from '@/types';

export class AuthService {
  // Sign in with email and password
  static async signIn(credentials: LoginForm): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      
      const firebaseUser = userCredential.user;
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }
      
      // Update lastLoginAt
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        lastLoginAt: Timestamp.fromMillis(Date.now()),
      });

      const userData = userDoc.data();
      return {
        id: firebaseUser.uid,
        email: userData.email || firebaseUser.email!,
        displayName: userData.displayName || firebaseUser.displayName || '',
        photoUrl: userData.photoUrl || firebaseUser.photoURL || '',
        userType: userData.userType || 'CUSTOMER',
        verified: userData.verified || false,
        active: userData.active !== false,
        createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate().getTime() : userData.createdAt || Date.now(),
        lastLoginAt: Date.now(), // Set to current time since we just logged in
        profile: userData.profile || {
          firstName: '',
          lastName: '',
          phone: '',
          dateOfBirth: '',
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
          },
          preferences: {
            notifications: true,
            emailMarketing: false,
            language: 'en',
            currency: 'ZAR',
            theme: 'light',
          }
        }
      } as User;
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Sign up new user
  static async signUp(userData: SignUpForm): Promise<User> {
    try {
      if (userData.password !== userData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const firebaseUser = userCredential.user;

      // Update Firebase user profile
      await updateProfile(firebaseUser, {
        displayName: userData.displayName,
      });

      // Create user document in Firestore
      const user: Omit<User, 'id'> = {
        email: userData.email,
        displayName: userData.displayName,
        photoUrl: '',
        userType: userData.userType,
        verified: false,
        active: true,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        profile: {
          firstName: '',
          lastName: '',
          phone: '',
          dateOfBirth: '',
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
          },
          preferences: {
            notifications: true,
            emailMarketing: false,
            language: 'en',
            currency: 'ZAR',
            theme: 'light',
          }
        }
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...user,
        createdAt: Timestamp.fromMillis(user.createdAt),
        lastLoginAt: Timestamp.fromMillis(user.lastLoginAt),
      });

      return {
        id: firebaseUser.uid,
        ...user,
      };
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Get current user
  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Get user profile from Firestore
  static async getUserProfile(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      return {
        id: userId,
        email: userData.email || '',
        displayName: userData.displayName || '',
        photoUrl: userData.photoUrl || '',
        userType: userData.userType || 'CUSTOMER',
        verified: userData.verified || false,
        active: userData.active !== false, // Default to true if not specified
        createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate().getTime() : userData.createdAt || Date.now(),
        lastLoginAt: userData.lastLoginAt?.toDate ? userData.lastLoginAt.toDate().getTime() : userData.lastLoginAt || Date.now(),
        profile: userData.profile || {
          firstName: '',
          lastName: '',
          phone: '',
          dateOfBirth: '',
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
          },
          preferences: {
            notifications: true,
            emailMarketing: false,
            language: 'en',
            currency: 'ZAR',
            theme: 'light',
          }
        }
      } as User;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(doc(db, 'users', userId), updateData);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Handle authentication errors
  private static handleAuthError(error: AuthError): Error {
    switch (error.code) {
      case 'auth/user-not-found':
        return new Error('No account found with this email address');
      case 'auth/wrong-password':
        return new Error('Incorrect password');
      case 'auth/email-already-in-use':
        return new Error('An account with this email already exists');
      case 'auth/weak-password':
        return new Error('Password should be at least 6 characters');
      case 'auth/invalid-email':
        return new Error('Invalid email address');
      case 'auth/too-many-requests':
        return new Error('Too many failed attempts. Please try again later');
      default:
        return new Error(error.message || 'An authentication error occurred');
    }
  }
}

export default AuthService;
