package com.blueclipse.myhustle.ui.theme

import android.graphics.RenderEffect
import android.graphics.Shader
import android.os.Build
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.asComposeRenderEffect

fun Modifier.glassBlur(blurRadius: Float = 40f): Modifier {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        this.graphicsLayer {
            renderEffect = RenderEffect
                .createBlurEffect(blurRadius, blurRadius, Shader.TileMode.CLAMP)
                .asComposeRenderEffect() // ✅ required conversion
        }
    } else {
        this.drawWithContent {
            drawContent()
            drawRect(color = androidx.compose.ui.graphics.Color.White.copy(alpha = 0.15f))
        }
    }
}