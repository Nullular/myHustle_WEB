package com.blueclipse.myhustle.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import android.util.Log
import com.blueclipse.myhustle.data.model.Review
import com.blueclipse.myhustle.data.model.ReviewTargetType
import com.blueclipse.myhustle.data.repository.ReviewRepository
import com.blueclipse.myhustle.ui.theme.HustleColors
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.launch
import me.nikhilchaudhari.library.NeuInsets
import me.nikhilchaudhari.library.neumorphic
import me.nikhilchaudhari.library.shapes.Pressed

/**
 * Reusable reviews panel styled to match StoreProfileScreen's reviews section.
 * Fetches live reviews for a target and allows the user to write a review.
 */
@Composable
fun ReviewsPanel(
    targetType: ReviewTargetType,
    targetId: String,
    targetName: String,
    shopId: String,
    headerTitle: String = "Customer Reviews",
    currentRating: Float,
    currentTotalReviews: Int,
    showWriteButton: Boolean = false,
    showHelpful: Boolean = false,
    wrapInSectionCard: Boolean = true,
    preloadedReviews: List<Review>? = null, // NEW: Pre-loaded reviews to avoid fetch during scroll
    modifier: Modifier = Modifier
) {
    val reviewRepository = remember { ReviewRepository.instance }
    val composableScope = rememberCoroutineScope()
    var reviews by remember(targetId) { mutableStateOf<List<Review>>(emptyList()) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    // Write review dialog state
    var showWriteDialog by remember { mutableStateOf(false) }

    // Flag to prevent repeated execution during scroll
    var hasInitialized by remember { mutableStateOf(false) }
    
    // Initialize reviews once
    LaunchedEffect(targetId) {
        if (!hasInitialized) {
            if (preloadedReviews != null) {
                // Use preloaded reviews - no network call needed
                reviews = preloadedReviews
                loading = false
                Log.d("ReviewsPanel", "Using preloaded ${preloadedReviews.size} reviews for targetId=$targetId")
            } else {
                // Fallback to fetching if no preloaded reviews provided
                loading = true
                error = null
                Log.d("ReviewsPanel", "LaunchedEffect triggered for targetId=$targetId, targetType=$targetType")
                val res = reviewRepository.getReviewsForTarget(targetType, targetId)
                reviews = res.getOrElse {
                    error = it.message
                    Log.e("ReviewsPanel", "Failed to load reviews for $targetId", it)
                    emptyList()
                }
                Log.d("ReviewsPanel", "Loaded ${reviews.size} reviews for targetId=$targetId")
                loading = false
            }
            hasInitialized = true
        }
    }

    val outerModifier = if (wrapInSectionCard) {
        modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .neumorphic(
                lightShadowColor = HustleColors.lightShadow,
                darkShadowColor = HustleColors.darkShadow,
                elevation = 8.dp,
                neuInsets = NeuInsets(6.dp, 6.dp),
                strokeWidth = 4.dp,
                neuShape = Pressed.Rounded(radius = 8.dp)
            )
            .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(20.dp))
            .padding(24.dp)
    } else {
        modifier.fillMaxWidth()
    }

    Column(modifier = outerModifier) {
        // Header row same as StoreProfileScreen
        // Compute header values from current list if available for immediate updates
        val displayCount = if (reviews.isNotEmpty()) reviews.size else currentTotalReviews
        val displayAverage = if (reviews.isNotEmpty()) {
            (reviews.sumOf { it.rating.toDouble() } / reviews.size).toFloat()
        } else currentRating

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = headerTitle,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Icon(
                    Icons.Default.Star,
                    contentDescription = null,
                    tint = Color(0xFFFFD700),
                    modifier = Modifier.size(20.dp)
                )
                Text(
                    text = String.format("%.1f", displayAverage),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "(${displayCount} reviews)",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        if (showWriteButton) {
            // Write review button (optional to preserve original layout)
            OutlinedButton(
                onClick = { showWriteDialog = true },
                modifier = Modifier.align(Alignment.End)
            ) {
                Text("Write a review")
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        when {
            loading -> {
                Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            }
            error != null -> {
                Text(
                    text = error ?: "",
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodyMedium
                )
            }
            reviews.isEmpty() -> {
                Text(
                    text = "No reviews yet. Be the first to review $targetName.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
            }
            else -> {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.heightIn(max = 300.dp),
                    contentPadding = PaddingValues(bottom = 8.dp)
                ) {
                    items(reviews) { review ->
                        ReviewItemCard(
                            review = review,
                            showHelpful = showHelpful,
                            onHelpful = { userId ->
                                if (!showHelpful) return@ReviewItemCard
                                // Optimistic update
                                val idx = reviews.indexOfFirst { it.id == review.id }
                                if (idx >= 0 && !reviews[idx].votedBy.contains(userId)) {
                                    val updated = reviews[idx].copy(
                                        helpfulVotes = reviews[idx].helpfulVotes + 1,
                                        votedBy = reviews[idx].votedBy + userId
                                    )
                                    reviews = reviews.toMutableList().also { it[idx] = updated }
                                }
                            }
                        )
                    }
                }
            }
        }

        if (showWriteDialog) {
            WriteReviewDialog(
                targetType = targetType,
                targetId = targetId,
                targetName = targetName,
                shopId = shopId,
                onDismiss = { showWriteDialog = false },
                onSubmitted = {
                    // Refresh list
                    composableScope.launch {
                        loading = true
                        val res = reviewRepository.getReviewsForTarget(targetType, targetId)
                        reviews = res.getOrDefault(emptyList())
                        loading = false
                    }
                }
            )
        }
    }
}

@Composable
private fun ReviewItemCard(
    review: Review,
    showHelpful: Boolean,
    onHelpful: (userId: String) -> Unit
) {
    val reviewRepository = remember { ReviewRepository.instance }
    val auth = remember { FirebaseAuth.getInstance() }
    val coroutineScope = rememberCoroutineScope()

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 2.dp
        ),
        border = BorderStroke(
            width = 1.dp,
            color = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f)
        )
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Reviewer name is not stored; show generic label
                Text(
                    text = "Customer",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )

                // Rating stars
                Row(verticalAlignment = Alignment.CenterVertically) {
                    repeat(5) { index ->
                        Icon(
                            Icons.Default.Star,
                            contentDescription = null,
                            tint = if (index < review.rating) Color(0xFFFFD700) else Color.Gray.copy(alpha = 0.3f),
                            modifier = Modifier.size(14.dp)
                        )
                    }
                }
            }

            if (review.title.isNotEmpty()) {
                Text(
                    text = review.title,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Medium
                )
            }

            if (review.content.isNotEmpty()) {
                Text(
                    text = review.content,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f),
                    lineHeight = 20.sp
                )
            }

            if (showHelpful || review.verifiedPurchase) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    if (showHelpful) {
                        val currentUserId = auth.currentUser?.uid
                        TextButton(
                            onClick = {
                                if (currentUserId != null) {
                                    coroutineScope.launch {
                                        reviewRepository.markHelpful(review.id, currentUserId)
                                        onHelpful(currentUserId)
                                    }
                                }
                            },
                            enabled = currentUserId != null && !review.votedBy.contains(currentUserId)
                        ) { Text("Helpful (${review.helpfulVotes})") }
                    } else {
                        Spacer(Modifier.width(1.dp))
                    }
                    if (review.verifiedPurchase) {
                        AssistChip(onClick = {}, label = { Text("Verified purchase") })
                    }
                }
            }
        }
    }
}

@Composable
private fun WriteReviewDialog(
    targetType: ReviewTargetType,
    targetId: String,
    targetName: String,
    shopId: String,
    onDismiss: () -> Unit,
    onSubmitted: () -> Unit
) {
    val auth = remember { FirebaseAuth.getInstance() }
    val reviewRepository = remember { ReviewRepository.instance }
    val coroutineScope = rememberCoroutineScope()

    var rating by remember { mutableStateOf(5f) }
    var title by remember { mutableStateOf("") }
    var content by remember { mutableStateOf("") }
    var submitting by remember { mutableStateOf(false) }
    var submitError by remember { mutableStateOf<String?>(null) }
    val userId = auth.currentUser?.uid

    AlertDialog(
        onDismissRequest = { if (!submitting) onDismiss() },
        confirmButton = {
        TextButton(
                onClick = {
                    if (userId == null || submitting) return@TextButton
                    submitting = true
            submitError = null
                    coroutineScope.launch {
                        val review = Review(
                            customerId = userId,
                            shopId = shopId,
                            targetType = targetType,
                            targetId = targetId,
                            targetName = targetName,
                            rating = rating.coerceIn(1f, 5f),
                            title = title.trim(),
                            content = content.trim(),
                            verifiedPurchase = false
                        )
                        val res = reviewRepository.createReview(review)
                        submitting = false
                        if (res.isSuccess) {
                            onDismiss()
                            onSubmitted()
                        } else {
                            submitError = res.exceptionOrNull()?.message ?: "Failed to submit review"
                        }
                    }
                },
                enabled = userId != null && !submitting && content.isNotBlank()
            ) { Text(if (submitting) "Submitting..." else "Submit") }
        },
        dismissButton = {
            TextButton(onClick = { if (!submitting) onDismiss() }) { Text("Cancel") }
        },
        title = { Text("Write a review") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Your rating")
                StarRatingSelector(rating = rating, onRatingChange = { rating = it })
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Title (optional)") },
                    singleLine = true
                )
                OutlinedTextField(
                    value = content,
                    onValueChange = { content = it },
                    label = { Text("Share your experience") },
                    minLines = 3
                )
                if (userId == null) {
                    Text(
                        text = "You must be signed in to submit a review.",
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodySmall
                    )
                }
                if (submitError != null) {
                    Text(
                        text = submitError!!,
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            }
        }
    )
}

@Composable
private fun StarRatingSelector(
    rating: Float,
    onRatingChange: (Float) -> Unit
) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        for (i in 1..5) {
            IconButton(onClick = { onRatingChange(i.toFloat()) }) {
                Icon(
                    Icons.Default.Star,
                    contentDescription = null,
                    tint = if (i <= rating) Color(0xFFFFD700) else Color.Gray.copy(alpha = 0.3f)
                )
            }
        }
    }
}
