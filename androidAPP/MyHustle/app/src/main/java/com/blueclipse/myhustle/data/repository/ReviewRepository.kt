package com.blueclipse.myhustle.data.repository

import com.blueclipse.myhustle.data.model.Review
import com.blueclipse.myhustle.data.model.ReviewTargetType
import com.google.firebase.firestore.FirebaseFirestore
import android.util.Log
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.tasks.await

/**
 * Repository for managing review data in Firebase
 */
class ReviewRepository private constructor() {
    private val firestore = FirebaseFirestore.getInstance()
    private val reviewsCollection = firestore.collection("reviews")
    
    private val _reviews = MutableStateFlow<List<Review>>(emptyList())
    val reviews: StateFlow<List<Review>> = _reviews.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    companion object {
        @Volatile
        private var INSTANCE: ReviewRepository? = null
        
        val instance: ReviewRepository
            get() = INSTANCE ?: synchronized(this) {
                INSTANCE ?: ReviewRepository().also { INSTANCE = it }
            }
    }
    
    /**
     * Create a new review
     */
    suspend fun createReview(review: Review): Result<String> {
        return try {
            _isLoading.value = true
            // Pre-generate ID and write the review with the ID embedded to avoid a follow-up update blocked by rules
            val documentRef = reviewsCollection.document()
            val reviewId = documentRef.id
            val reviewWithId = review.copy(id = reviewId)
            documentRef.set(reviewWithId).await()
            
            // Update shop/product/service rating
            updateTargetRating(review.targetType, review.targetId)
            
            Result.success(reviewId)
        } catch (e: Exception) {
            Log.e("ReviewRepository", "createReview failed", e)
            Result.failure(e)
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * Get reviews for a specific target (shop, product, or service)
     */
    suspend fun getReviewsForTarget(
        targetType: ReviewTargetType,
        targetId: String
    ): Result<List<Review>> {
        return try {
            _isLoading.value = true
            Log.d("ReviewRepository", "Fetching reviews for targetId=$targetId (type=$targetType)")
            val snapshot = reviewsCollection
                .whereEqualTo("targetId", targetId)
                .whereEqualTo("visible", true)
                .get()
                .await()
            
            Log.d("ReviewRepository", "Query returned ${snapshot.documents.size} documents")
            
            val reviews = snapshot.documents.mapNotNull { document ->
                try {
                    Log.d("ReviewRepository", "Processing document: ${document.id}")
                    document.toObject(Review::class.java)?.copy(id = document.id)
                } catch (e: Exception) {
                    Log.e("ReviewRepository", "Failed to parse document ${document.id}", e)
                    null
                }
            }.sortedByDescending { it.createdAt }
            
            _reviews.value = reviews
            Log.d("ReviewRepository", "Fetched ${reviews.size} reviews for targetId=$targetId")
            Result.success(reviews)
        } catch (e: Exception) {
            Log.e("ReviewRepository", "getReviewsForTarget failed for targetId=$targetId", e)
            Result.failure(e)
        } finally {
            _isLoading.value = false
        }
    }
    
    /**
     * Get reviews by a specific customer
     */
    suspend fun getReviewsByCustomer(customerId: String): Result<List<Review>> {
        return try {
            val snapshot = reviewsCollection
                .whereEqualTo("customerId", customerId)
                .get()
                .await()
            
            val reviews = snapshot.documents.mapNotNull { document ->
                try {
                    document.toObject(Review::class.java)?.copy(id = document.id)
                } catch (e: Exception) {
                    null
                }
            }.sortedByDescending { it.createdAt }
            
            Result.success(reviews)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Add owner response to a review
     */
    suspend fun addOwnerResponse(
        reviewId: String,
        response: String,
        ownerId: String
    ): Result<Unit> {
        return try {
            val ownerResponse = mapOf(
                "content" to response,
                "respondedAt" to System.currentTimeMillis(),
                "ownerId" to ownerId
            )
            
            val updateData = mapOf(
                "ownerResponse" to ownerResponse,
                "updatedAt" to System.currentTimeMillis()
            )
            
            reviewsCollection.document(reviewId).update(updateData).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Mark review as helpful
     */
    suspend fun markHelpful(reviewId: String, userId: String): Result<Unit> {
        return try {
            val reviewDoc = reviewsCollection.document(reviewId)
            firestore.runTransaction { transaction ->
                val snapshot = transaction.get(reviewDoc)
                val review = snapshot.toObject(Review::class.java)
                
                if (review != null && !review.votedBy.contains(userId)) {
                    val newVotedBy = review.votedBy + userId
                    val newHelpfulVotes = review.helpfulVotes + 1
                    
                    transaction.update(reviewDoc, mapOf(
                        "helpfulVotes" to newHelpfulVotes,
                        "votedBy" to newVotedBy,
                        "updatedAt" to System.currentTimeMillis()
                    ))
                }
            }.await()
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Calculate and update target rating
     */
    private suspend fun updateTargetRating(targetType: ReviewTargetType, targetId: String) {
        try {
            val snapshot = reviewsCollection
                .whereEqualTo("targetId", targetId)
                .whereEqualTo("visible", true)
                .get()
                .await()
            
            val reviews = snapshot.documents.mapNotNull { document ->
                document.toObject(Review::class.java)
            }
            
            if (reviews.isNotEmpty()) {
                val averageRating = reviews.map { it.rating }.average()
                val totalReviews = reviews.size
                
                val collection = when (targetType) {
                    ReviewTargetType.SHOP -> "shops"
                    ReviewTargetType.PRODUCT -> "products"
                    ReviewTargetType.SERVICE -> "services"
                }
                
                firestore.collection(collection).document(targetId)
                    .update(
                        mapOf(
                            "rating" to averageRating.toFloat(),
                            "totalReviews" to totalReviews,
                            "updatedAt" to System.currentTimeMillis()
                        )
                    ).await()
            }
        } catch (e: Exception) {
            // Log error but don't fail the review creation
            Log.w("ReviewRepository", "updateTargetRating failed for targetId=$targetId type=$targetType", e)
        }
    }
    
    /**
     * Calculate average rating for a user based on all their shops
     */
    suspend fun getUserAverageRating(userId: String): Result<Float> {
        return try {
            // Get all shops owned by this user
            val shopsSnapshot = firestore.collection("shops")
                .whereEqualTo("ownerId", userId)
                .get()
                .await()
            
            if (shopsSnapshot.isEmpty) {
                return Result.success(0f)
            }
            
            val shopIds = shopsSnapshot.documents.map { it.id }
            var totalRating = 0f
            var totalReviews = 0
            
            // Get reviews for all user's shops
            for (shopId in shopIds) {
                val reviewsSnapshot = reviewsCollection
                    .whereEqualTo("targetId", shopId)
                    .whereEqualTo("targetType", ReviewTargetType.SHOP)
                    .whereEqualTo("visible", true)
                    .get()
                    .await()
                
                val reviews = reviewsSnapshot.documents.mapNotNull { document ->
                    try {
                        document.toObject(Review::class.java)
                    } catch (e: Exception) {
                        null
                    }
                }
                
                if (reviews.isNotEmpty()) {
                    totalRating += reviews.sumOf { it.rating.toDouble() }.toFloat()
                    totalReviews += reviews.size
                }
            }
            
            val averageRating = if (totalReviews > 0) totalRating / totalReviews else 0f
            Result.success(averageRating)
        } catch (e: Exception) {
            Log.e("ReviewRepository", "getUserAverageRating failed for userId=$userId", e)
            Result.failure(e)
        }
    }

    /**
     * Flag review for moderation
     */
    suspend fun flagReview(reviewId: String): Result<Unit> {
        return try {
            val updateData = mapOf(
                "flagged" to true,
                "updatedAt" to System.currentTimeMillis()
            )
            
            reviewsCollection.document(reviewId).update(updateData).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
