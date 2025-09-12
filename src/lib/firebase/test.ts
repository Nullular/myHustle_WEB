import { 
  collection,
  doc,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import { db } from './config';

/**
 * Simple test service to check Firebase connectivity
 */
export class FirebaseTestService {
  /**
   * Test basic Firebase connection
   */
  static async testConnection() {
    try {
      console.log('🔥 Testing Firebase connection...');
      
      // Try to read a single document from shops collection
      const shopsCollection = collection(db, 'shops');
      const snapshot = await getDocs(shopsCollection);
      
      console.log(`✅ Successfully connected to Firebase!`);
      console.log(`📊 Found ${snapshot.docs.length} documents in shops collection`);
      
      // Log some sample data
      if (snapshot.docs.length > 0) {
        const firstDoc = snapshot.docs[0];
        const data = firstDoc.data();
        console.log(`📄 Sample document:`, {
          id: firstDoc.id,
          name: data.name,
          active: data.active,
          isActive: data.isActive,
          fields: Object.keys(data)
        });
      }
      
      return true;
    } catch (error) {
      console.error('❌ Firebase connection failed:', error);
      return false;
    }
  }

  /**
   * Test reading all collections
   */
  static async testCollections() {
    const collections = ['shops', 'products', 'services', 'users'];
    const results: Record<string, any> = {};
    
    for (const collectionName of collections) {
      try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        results[collectionName] = {
          count: querySnapshot.docs.length,
          success: true,
          sampleDoc: querySnapshot.docs[0]?.data() || null
        };
        console.log(`✅ ${collectionName}: ${querySnapshot.docs.length} documents`);
      } catch (error) {
        results[collectionName] = {
          count: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        console.error(`❌ ${collectionName}:`, error);
      }
    }
    
    return results;
  }
}

// Auto-test on import in development
if (process.env.NODE_ENV === 'development') {
  FirebaseTestService.testConnection();
}
