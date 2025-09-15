// app/src/main/java/com/example/myhustle/ui/theme/NeuModifiers.kt
package com.blueclipse.myhustle.ui.theme

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.Dp
import me.nikhilchaudhari.library.NeuInsets           // from the AAR
import me.nikhilchaudhari.library.neumorphic         // the extension
import me.nikhilchaudhari.library.shapes.NeuShape    // sealed‐class for shapes

// bring in your CompositionLocal from HustleTheme.kt

@Composable
fun Modifier.neuAdaptive(
    neuShape: NeuShape,
    elevation: Dp       = NeuromorphicConfig.elevation,
    neuInsets: NeuInsets = NeuromorphicConfig.neuInsets,
    strokeWidth: Dp      = NeuromorphicConfig.strokeWidth
): Modifier {
    // no more destructuring — read first/second to avoid ambiguity
    val shadows    = LocalNeumorphicShadows.current
    val lightShadow= shadows.first
    val darkShadow = shadows.second

    return this.neumorphic(
        neuShape         = neuShape,
        lightShadowColor = lightShadow,
        darkShadowColor  = darkShadow,
        elevation        = elevation,
        neuInsets        = neuInsets,
        strokeWidth      = strokeWidth
    )
}
