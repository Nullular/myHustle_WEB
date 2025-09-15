package com.blueclipse.myhustle.ui.components

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.StarHalf
import androidx.compose.material.icons.outlined.Star
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

/**
 * A simple star-based rating bar that displays up to five stars and the numeric value.
 * @param rating floating-point value from 0.0 to 5.0
 * @param modifier optional Modifier for styling
 */
@Composable
fun RatingBar(
    rating: Float,
    modifier: Modifier = Modifier
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = modifier
    ) {
        val fullStars = rating.toInt().coerceIn(0, 5)
        val hasHalf = ((rating * 10).toInt() % 10) >= 5
        for (i in 1..5) {
            when {
                i <= fullStars -> Icon(
                    imageVector = Icons.Filled.Star,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp)
                )
                i == fullStars + 1 && hasHalf -> Icon(
                    imageVector = Icons.Filled.StarHalf,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp)
                )
                else -> Icon(
                    imageVector = Icons.Outlined.Star,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp)
                )
            }
        }
        Spacer(modifier = Modifier.width(4.dp))
        Text(text = String.format("%.1f", rating))
    }
}
