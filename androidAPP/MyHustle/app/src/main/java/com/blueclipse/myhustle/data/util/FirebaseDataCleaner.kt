package com.blueclipse.myhustle.data.util

import android.util.Log
import com.blueclipse.myhustle.data.repository.FirebaseShopRepository
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

/**
 * Utility to clear Firebase data and re-upload fresh sample data
 */
object FirebaseDataCleaner {
    
    private val firestore = FirebaseFirestore.getInstance()
    private val repository = FirebaseShopRepository.instance
    
    /**
     * Clear all shops from Firebase and upload fresh sample data
     */
    suspend fun clearAndReloadData(ownerId: String = ""): Result<Unit> {
        return try {
            Log.d("FirebaseDataCleaner", "🧹 Starting data cleanup...")
            
            // Step 1: Delete all existing shops
            val shopsCollection = firestore.collection("shops")
            val snapshot = shopsCollection.get().await()
            
            Log.d("FirebaseDataCleaner", "📋 Found ${snapshot.documents.size} existing documents to delete")
            
            for (document in snapshot.documents) {
                Log.d("FirebaseDataCleaner", "🗑️ Deleting document: ${document.id}")
                document.reference.delete().await()
            }
            
            Log.d("FirebaseDataCleaner", "✅ All old documents deleted")
            
            // Step 2: Upload fresh sample data
            Log.d("FirebaseDataCleaner", "📤 Uploading fresh sample data...")
            if (ownerId.isNotEmpty()) {
                Log.d("FirebaseDataCleaner", "👑 Setting owner: $ownerId for all sample shops")
            }
            val uploadResult = SampleDataUploader.uploadSampleData(ownerId)
            
            if (uploadResult.isSuccess) {
                Log.d("FirebaseDataCleaner", "🎉 Fresh data uploaded successfully!")
            } else {
                Log.e("FirebaseDataCleaner", "❌ Failed to upload fresh data", uploadResult.exceptionOrNull())
            }
            
            uploadResult
        } catch (e: Exception) {
            Log.e("FirebaseDataCleaner", "💥 Error during cleanup and reload", e)
            Result.failure(e)
        }
    }
}
