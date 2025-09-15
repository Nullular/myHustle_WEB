// app/src/main/java/com/example/myhustle/ui/theme/HustleTheme.kt
package com.blueclipse.myhustle.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary    = HustleColors.Primary,
    onPrimary  = HustleColors.OnPrimary,
    secondary  = HustleColors.BlueAccent,
    onSecondary= HustleColors.OnPrimary,
    background = HustleColors.LightestBlue,
    surface    = HustleColors.SurfaceLight,
    onSurface  = HustleColors.OnSurface,
)

// // Uncomment & adjust when you add dark-mode support
// private val DarkColorScheme = darkColorScheme(
//     primary    = HustleColors.BlueAccent,
//     onPrimary  = HustleColors.OnPrimary,
//     secondary  = HustleColors.Primary,
//     onSecondary= HustleColors.OnPrimary,
//     background = Color(0xFF121212),
//     surface    = Color(0xFF1E1E1E),
//     onSurface  = Color.White,
// )

@Composable
fun HustleTheme(
    // we ignore darkTheme for now and always use our light scheme
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    // 1) Build your light color scheme with forced black onBackground / onSurface
    val colors = lightColorScheme(
        primary       = HustleColors.BlueAccent,
        onPrimary     = HustleColors.OnPrimary,
        secondary     = HustleColors.Secondary,
        onSecondary   = HustleColors.OnPrimary,


        background    = HustleColors.LightestBlue,
        onBackground  = HustleColors.OnBackground,  // this is a dark color already

        surface       = HustleColors.SurfaceLight,
        onSurface     = Color.Black                // force black on surfaces


    )

    // 2) Wrap your app’s content in MaterialTheme (inside the function!)
    MaterialTheme(
        colorScheme = colors,
        typography  = HustleTypography,
        shapes      = Shapes(
            small  = HustleShapes.card,
            medium = HustleShapes.card,
            large  = HustleShapes.oval
        ),
        content     = content
    )
}
