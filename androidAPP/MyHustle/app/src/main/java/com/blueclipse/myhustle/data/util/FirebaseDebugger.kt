package com.blueclipse.myhustle.data.util

import android.util.Log
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

object FirebaseDebugger {
    
    suspend fun debugFirebaseData() {
        try {
            val db = FirebaseFirestore.getInstance()
            Log.d("FirebaseDebugger", "=== FIREBASE DATA DEBUG ===")
            
            // Get all shops and examine their catalog items
            val snapshot = db.collection("shops").get().await()
            
            for (document in snapshot.documents) {
                val shopName = document.getString("name") ?: "Unknown Shop"
                Log.d("FirebaseDebugger", "🏪 Shop: $shopName")
                
                // Get the catalog as a raw list
                val catalog = document.get("catalog") as? List<*>
                catalog?.forEachIndexed { index, item ->
                    if (item is Map<*, *>) {
                        val itemName = item["name"] as? String ?: "Unknown Item"
                        val isProduct = item["isProduct"]
                        Log.d("FirebaseDebugger", "  📦 Item[$index]: $itemName")
                        Log.d("FirebaseDebugger", "    - isProduct field exists: ${item.containsKey("isProduct")}")
                        Log.d("FirebaseDebugger", "    - isProduct value: $isProduct")
                        Log.d("FirebaseDebugger", "    - isProduct type: ${isProduct?.javaClass?.simpleName}")
                        Log.d("FirebaseDebugger", "    - Raw item data: $item")
                    }
                }
            }
            
        } catch (e: Exception) {
            Log.e("FirebaseDebugger", "Error debugging Firebase data", e)
        }
    }
}
