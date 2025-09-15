// app/src/main/java/com/example/myhustle/ui/components/StoreCard.kt
package com.blueclipse.myhustle.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.remember
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.blueclipse.myhustle.ui.theme.HustleColors
import com.blueclipse.myhustle.ui.theme.HustleShapes
import me.nikhilchaudhari.library.NeuInsets
import me.nikhilchaudhari.library.neumorphic
import me.nikhilchaudhari.library.shapes.Punched
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.ui.Alignment
import java.util.*

// Helper function to compute shop status based on operating hours
fun getShopStatus(openTime24: String, closeTime24: String): List<String> {
    try {
        val now = Calendar.getInstance()
        val currentHour = now.get(Calendar.HOUR_OF_DAY)
        val currentMinute = now.get(Calendar.MINUTE)
        val currentMinutes = currentHour * 60 + currentMinute

        val (openH, openM) = openTime24.split(":").map { it.toIntOrNull() ?: 0 }
        val (closeH, closeM) = closeTime24.split(":").map { it.toIntOrNull() ?: 0 }
        val openMinutes = openH * 60 + openM
        val closeMinutes = if (closeH == 24 && closeM == 0) 24 * 60 else closeH * 60 + closeM

        val isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes
        
        return if (isOpen) {
            val closeTimeFormatted = if (closeH == 24 && closeM == 0) {
                "12:00 AM"
            } else {
                val hour12 = if (closeH == 0) 12 else if (closeH > 12) closeH - 12 else closeH
                val amPm = if (closeH < 12) "AM" else "PM"
                String.format("%d:%02d %s", hour12, closeM, amPm)
            }
            listOf("Open Now", "Closes at $closeTimeFormatted")
        } else {
            val openTimeFormatted = run {
                val hour12 = if (openH == 0) 12 else if (openH > 12) openH - 12 else openH
                val amPm = if (openH < 12) "AM" else "PM"
                String.format("%d:%02d %s", hour12, openM, amPm)
            }
            listOf("Closed", "Opens at $openTimeFormatted")
        }
    } catch (e: Exception) {
        return listOf("Hours unavailable")
    }
}

/**
 * A static, always‐punched store card with NO visual press feedback.
 */
@Composable
fun StoreCard(
    logoUrl: String,
    name: String,
    desc: String,
    rating: Float,
    openTime24: String = "08:00",
    closeTime24: String = "18:00",
    isFavorited: Boolean,
    onFavoriteToggled: () -> Unit,
    onClick: () -> Unit,
    bannerUrl: String = "", // New banner parameter
    modifier: Modifier = Modifier
) {
    // Compute availability status based on operating hours
    val availability = getShopStatus(openTime24, closeTime24)
    
    // A hostless interaction source + no indication removes ripples/pressed visuals
    val interactionSource = remember { MutableInteractionSource() }

    Box(
        modifier = modifier
            // 1) draw the fill
            .neumorphic(
                neuShape         = Punched.Rounded(12.dp),
                lightShadowColor = HustleColors.lightShadow,
                darkShadowColor  = HustleColors.darkShadow,
                elevation        = 6.dp,
                neuInsets        = NeuInsets(6.dp, 6.dp),
                strokeWidth      = 6.dp
            )
            .background(MaterialTheme.colorScheme.surface, HustleShapes.card)


            // 3) clip to the card shape
            .clip(HustleShapes.card)
            // 4) clickable with no visual indication
            .clickable(
                interactionSource = interactionSource,
                indication        = null,
                onClick           = onClick
            )
            // 5) external spacing
            .padding(vertical = 8.dp, horizontal = 16.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxWidth()
        ) {
            // Top third: Banner section
            if (bannerUrl.isNotEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(110.dp)  // Increased from 80dp to 110dp (+30dp)
                        .clip(RoundedCornerShape(12.dp)) // Rounded corners on all sides
                ) {
                    AsyncImage(
                        model = bannerUrl,
                        contentDescription = "Store Banner",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                    // Gradient overlay for better text readability if needed
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(
                                Brush.verticalGradient(
                                    colors = listOf(
                                        Color.Transparent,
                                        Color.Black.copy(alpha = 0.3f)
                                    )
                                )
                            )
                    )
                }
            }
            
            // Bottom two thirds: Logo and content section  
            Row(
                Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                AsyncImage(
                    model              = logoUrl,
                    contentDescription = null,
                    contentScale       = ContentScale.Crop,
                    modifier           = Modifier
                        .size(64.dp)  // 33% bigger (48 * 1.33 = 64dp)
                        .clip(RoundedCornerShape(20.dp))  // Adjusted radius proportionally
                        .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.8f))
                        .neumorphic(
                            neuShape         = Punched.Rounded(20.dp),
                            lightShadowColor = HustleColors.lightShadow,
                            darkShadowColor  = HustleColors.darkShadow,
                            elevation        = 4.dp,
                            neuInsets        = NeuInsets(3.dp, 3.dp),  // Adjusted for larger size
                            strokeWidth      = 2.dp
                        )
                )
                Spacer(Modifier.width(12.dp))  // Back to original spacing
            Column(modifier = Modifier.weight(1f)) {
                Text(name, style = MaterialTheme.typography.titleSmall)
                RatingBar(rating = rating)
                
                // Availability pills - with proper spacing and flexible layout
                if (availability.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(6.dp))
                    Column(
                        verticalArrangement = Arrangement.spacedBy(4.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        availability.forEach { status ->
                            val isOpenNow = status.contains("Open Now", ignoreCase = true)
                            val isClosed = status.contains("Closed", ignoreCase = true)
                            Text(
                                text = status,
                                style = MaterialTheme.typography.labelSmall,
                                color = Color.White,
                                modifier = Modifier
                                    .background(
                                        color = when {
                                            isOpenNow -> Color(0xFF4CAF50) // Green for "Open Now"
                                            isClosed -> Color(0xFFF44336) // Red for "Closed"
                                            else -> Color(0xFF2196F3) // Blue for other info like "Closes at"
                                        },
                                        shape = RoundedCornerShape(12.dp)
                                    )
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }
                }
                }
                
                IconButton(onClick = onFavoriteToggled) {
                    Icon(
                        imageVector      = if (isFavorited) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                        contentDescription = "Toggle favorite",
                        tint             = HustleColors.Red
                    )
                }
            }
        }
    }
}
