package com.blueclipse.myhustle.ui.theme

import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

data class GlassStyle(
    val alpha: Float,
    val borderAlpha: Float,
    val cornerRadius: Dp
)

object GlassPresets {
    val light = GlassStyle(alpha = 0.12f, borderAlpha = 0.3f, cornerRadius = 16.dp)
    val strong = GlassStyle(alpha = 0.25f, borderAlpha = 0.5f, cornerRadius = 24.dp)
}
