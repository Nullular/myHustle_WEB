// app/src/main/java/com/example/myhustle/ui/theme/StatusBar.kt
package com.blueclipse.myhustle.ui.theme

import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import com.google.accompanist.systemuicontroller.rememberSystemUiController

/**
 * Call this at the top of your Compose hierarchy to tint the system status bar.
 */
@Composable
fun AppStatusBar(color: Color, darkIcons: Boolean = false) {
    val sysUi = rememberSystemUiController()
    SideEffect {
        sysUi.setStatusBarColor(color = color, darkIcons = darkIcons)
    }
}
