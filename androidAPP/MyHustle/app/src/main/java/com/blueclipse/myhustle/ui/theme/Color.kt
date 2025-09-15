// app/src/main/java/com/example/myhustle/ui/theme/Color.kt
package com.blueclipse.myhustle.ui.theme

import androidx.compose.ui.graphics.Color

object HustleColors {
    // Primary & accent
    val Primary   = Color(0xFF03A9F4)
    val Secondary = Color(0xFF9BCDFF)// subtle purple glow
    val BlueAccent     = Color(0xFF3F51B5)
    val Test =  Color(0xFFFF5722)// bright play button
    val Red = Color(0xFFFF1000)
    val DarkBase = Color(0xFF000000)

    //Gradients
    val GradientStart = Color(0xFF00DEFC)
    val GradientEnd = Color(0xFF4400AD)
    val SecondaryGradientStart = Color(0xFF9458FF)
    val SecondaryGradientEnd = Color(0xFFFF75A4)

    // Background & surface
    val LightestBlue   = Color(0xFFE8EFFA)  // overall backdrop
    val SurfaceLight   = Color(0xFFF5F9FF)  // cards/pills background
    val lightBackground = Color(0xFFF8F8F8)  // very light background

    // On‐colors
    val OnPrimary      = Color.White       // text/icons on accent
    val OnSurface      = Color(0xFF2E3344) // dark text on whiteish surfaces

    val OnBackground = Color(0xFF1C1B1F)   // dark text on LightestBlue

    val DarkBackground = Color(0xFF121214)
    val DarkSurface    = Color(0xFF1E1E20)
    val OnDarkBackground = Color(0xFFE0E0E0)
    val OnDarkSurface    = Color(0xFFF2F2F2)

    // Shadows (light mode)
    val lightShadow    = Color(0xFFFFFFFF) // highlight
    val darkShadow     = Color(0xFFB6BFD0)

 // soft inner drop

    // // Dark‐mode variants (uncomment when you wire up dark theme)
    // val LightShadowDarkMode = Color(0xFF2A2B33)
    // val DarkShadowDarkMode  = Color(0xFF131419)
}
