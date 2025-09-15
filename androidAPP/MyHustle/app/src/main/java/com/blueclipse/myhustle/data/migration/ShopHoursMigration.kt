package com.blueclipse.myhustle.data.migration

import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await
import android.util.Log

/**
 * Migration script to populate openTime24 and closeTime24 for existing shops
 * that only have the legacy availability string.
 * 
 * This should be run once after deploying the new operating hours feature.
 */
object ShopHoursMigration {
    private const val TAG = "ShopHoursMigration"
    private val firestore = FirebaseFirestore.getInstance()
    
    /**
     * Migrate existing shops to include openTime24 and closeTime24 fields
     * based on default operating hours (8 AM to 6 PM).
     * 
     * Only updates shops that don't already have these fields populated.
     */
    suspend fun migrateShopHours() {
        try {
            Log.d(TAG, "Starting shop hours migration...")
            
            val shopsCollection = firestore.collection("shops")
            val snapshot = shopsCollection.get().await()
            
            var updatedCount = 0
            var skippedCount = 0
            
            for (document in snapshot.documents) {
                val data = document.data ?: continue
                
                // Check if shop already has operating hours set
                val hasOpenTime = data.containsKey("openTime24") && 
                                 !data["openTime24"].toString().isBlank()
                val hasCloseTime = data.containsKey("closeTime24") && 
                                  !data["closeTime24"].toString().isBlank()
                
                if (hasOpenTime && hasCloseTime) {
                    Log.d(TAG, "Shop ${document.id} already has operating hours, skipping")
                    skippedCount++
                    continue
                }
                
                // Parse legacy availability string to extract hours if possible
                val availability = data["availability"]?.toString() ?: ""
                val (openTime, closeTime) = parseHoursFromAvailability(availability)
                
                // Update the document
                val updates = mapOf(
                    "openTime24" to openTime,
                    "closeTime24" to closeTime,
                    "updated_at" to com.google.firebase.Timestamp.now()
                )
                
                document.reference.update(updates).await()
                updatedCount++
                
                Log.d(TAG, "Updated shop ${document.id}: $openTime - $closeTime")
            }
            
            Log.i(TAG, "Migration completed. Updated: $updatedCount, Skipped: $skippedCount")
            
        } catch (e: Exception) {
            Log.e(TAG, "Migration failed", e)
            throw e
        }
    }
    
    /**
     * Parse operating hours from legacy availability string.
     * Examples:
     * - "Open Now • Closes at 8 PM" -> ("08:00", "20:00")
     * - "Open Now, 6 AM – 8 PM" -> ("06:00", "20:00")
     * - "Closed" -> ("08:00", "18:00") // default
     */
    private fun parseHoursFromAvailability(availability: String): Pair<String, String> {
        try {
            when {
                // Pattern: "Closes at X PM/AM"
                availability.contains("Closes at", ignoreCase = true) -> {
                    val regex = """Closes at (\d+):?(\d*)\s*(AM|PM)""".toRegex(RegexOption.IGNORE_CASE)
                    val match = regex.find(availability)
                    if (match != null) {
                        val hour = match.groupValues[1].toInt()
                        val minute = match.groupValues[2].takeIf { it.isNotEmpty() }?.toInt() ?: 0
                        val amPm = match.groupValues[3].uppercase()
                        
                        val hour24 = when {
                            amPm == "AM" && hour == 12 -> 0
                            amPm == "AM" -> hour
                            amPm == "PM" && hour == 12 -> 12
                            amPm == "PM" -> hour + 12
                            else -> hour
                        }
                        
                        return Pair("08:00", String.format("%02d:%02d", hour24, minute))
                    }
                }
                
                // Pattern: "X AM/PM – Y PM/AM"
                availability.contains("–") || availability.contains("-") -> {
                    val regex = """(\d+):?(\d*)\s*(AM|PM)\s*[–-]\s*(\d+):?(\d*)\s*(AM|PM)""".toRegex(RegexOption.IGNORE_CASE)
                    val match = regex.find(availability)
                    if (match != null) {
                        val startHour = match.groupValues[1].toInt()
                        val startMin = match.groupValues[2].takeIf { it.isNotEmpty() }?.toInt() ?: 0
                        val startAmPm = match.groupValues[3].uppercase()
                        val endHour = match.groupValues[4].toInt()
                        val endMin = match.groupValues[5].takeIf { it.isNotEmpty() }?.toInt() ?: 0
                        val endAmPm = match.groupValues[6].uppercase()
                        
                        val startHour24 = when {
                            startAmPm == "AM" && startHour == 12 -> 0
                            startAmPm == "AM" -> startHour
                            startAmPm == "PM" && startHour == 12 -> 12
                            startAmPm == "PM" -> startHour + 12
                            else -> startHour
                        }
                        
                        val endHour24 = when {
                            endAmPm == "AM" && endHour == 12 -> 0
                            endAmPm == "AM" -> endHour
                            endAmPm == "PM" && endHour == 12 -> 12
                            endAmPm == "PM" -> endHour + 12
                            else -> endHour
                        }
                        
                        return Pair(
                            String.format("%02d:%02d", startHour24, startMin),
                            String.format("%02d:%02d", endHour24, endMin)
                        )
                    }
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to parse availability: $availability", e)
        }
        
        // Default fallback: 8 AM to 6 PM
        return Pair("08:00", "18:00")
    }
}
