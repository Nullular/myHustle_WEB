// app/src/main/java/com/example/myhustle/ui/components/ColoredTopBar.kt
package com.blueclipse.myhustle.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.blueclipse.myhustle.ui.theme.HustleColors

@Composable
fun ColoredTopBar(
    title: String,
    onBack: () -> Unit,
    // you can drop barColor now or keep for fallback
    height: Dp = 56.dp,
    cornerRadius: Dp = 16.dp
) {
    // measure the status-bar inset
    val statusBarHeight = WindowInsets
        .statusBars
        .asPaddingValues()
        .calculateTopPadding()

    // 1) create your gradient brush
    val gradient = Brush.horizontalGradient(
        colors = listOf(
            HustleColors.GradientStart,
            HustleColors.GradientEnd
        )
    )

    // The outer Box is total height = statusBar + barHeight
    Box(
        Modifier
            .fillMaxWidth()
            .height(statusBarHeight + height)
            .clip(
                RoundedCornerShape(
                    bottomStart = cornerRadius,
                    bottomEnd   = cornerRadius
                )
            )
            // 2) apply the gradient instead of a solid color
            .background(brush = gradient)
    ) {
        // Now push the row down by exactly the status-bar height
        Row(
            Modifier
                .fillMaxWidth()
                .height(height)
                .padding(start = 16.dp)
                .offset(y = statusBarHeight),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(
                    imageVector        = Icons.Filled.ArrowBack,
                    contentDescription = "Back",
                    tint               = Color.White
                )
            }
            Spacer(Modifier.width(8.dp))
            Text(
                text  = title,
                style = MaterialTheme.typography.titleLarge,
                color = Color.White
            )
        }
    }
}
