// app/src/main/java/com/example/myhustle/ui/theme/NeumorphicTheme.kt
package com.blueclipse.myhustle.ui.theme

import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

/**
 * Carries the current neumorphic shadow colors (light, dark) through the compose tree.
 * HustleTheme will provide a value for this local; components can then read
 * LocalNeumorphicShadows.current to get (lightShadow, darkShadow).
 */
internal val LocalNeumorphicShadows = staticCompositionLocalOf<Pair<Color,Color>> {
    // fallback defaults (light‐mode)
    HustleColors.lightShadow to HustleColors.darkShadow
}
