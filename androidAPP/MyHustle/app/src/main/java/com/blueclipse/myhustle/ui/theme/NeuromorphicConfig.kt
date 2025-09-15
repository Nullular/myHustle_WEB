// app/src/main/java/com/example/myhustle/ui/theme/NeuromorphicConfig.kt
package com.blueclipse.myhustle.ui.theme

import androidx.compose.ui.unit.dp
import me.nikhilchaudhari.library.NeuInsets

/**
 * Default Neumorphic shadow configuration based on your Neumorphism UI documentation.
 *
 * - lightShadowColor: HustleColors.lightShadow
 * - darkShadowColor:  HustleColors.darkShadow
 * - elevation:        6.dp
 * - neuInsets:        NeuInsets(6.dp, 6.dp)
 * - strokeWidth:      6.dp
 */
object NeuromorphicConfig {
    /** Light shadow on top-left */
    val lightShadowColor = HustleColors.lightShadow

    /** Dark shadow on bottom-right */
    val darkShadowColor  = HustleColors.darkShadow

    /** Blur/elevation of the shadow */
    val elevation        = 6.dp

    /** Offsets for the shadow in x and y */
    val neuInsets        = NeuInsets(6.dp, 6.dp)

    /** Stroke width for punched/pressed effects */
    val strokeWidth      = 6.dp
}
