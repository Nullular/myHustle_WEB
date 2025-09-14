
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config';
import { User } from '@/types/models';

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data() as User;
    }
    return null;
  } catch (e) {
    console.error('Error fetching user by ID:', e);
    return null;
  }
}
