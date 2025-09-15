package com.blueclipse.myhustle.ui.components

import android.graphics.RuntimeShader
import android.os.Build
import android.util.Log
import androidx.annotation.RequiresApi
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ExperimentalGraphicsApi

import androidx.compose.ui.graphics.ShaderBrush
import androidx.compose.ui.platform.LocalContext
import com.blueclipse.myhustle.R

@RequiresApi(Build.VERSION_CODES.TIRAMISU)
@OptIn(ExperimentalGraphicsApi::class)
@Composable
fun CustomBlurOverlay(
    modifier: Modifier = Modifier,
    blurRadius: Float = 32f,
    blurSamples: Float = 16f,
    mixAmount: Float = 0.5f,
    backgroundColor: Color = Color(0.2f, 0.2f, 0.2f)
) {
    val context = LocalContext.current
    val shader = remember {
        try {
            RuntimeShader(
                context.resources.openRawResource(R.raw.glassmorphism)
                    .bufferedReader()
                    .use { it.readText() }
            )
        } catch (e: Exception) {
            // Fallback shader
            RuntimeShader("""
                uniform shader background;
                half4 main(float2 fragCoord) {
                    return background.eval(fragCoord);
                }
            """.trimIndent())
        }
    }

    Canvas(modifier.fillMaxSize()) {
        try {
            shader.setFloatUniform("resolution", size.width, size.height)
            shader.setFloatUniform("blurRadius", blurRadius)
            shader.setFloatUniform("blurSamples", blurSamples)
            shader.setFloatUniform("mixAmount", mixAmount)
            // Set RGB components separately for color uniform
            shader.setFloatUniform("backgroundColor",
                backgroundColor.red,
                backgroundColor.green,
                backgroundColor.blue
            )
        } catch (e: Exception) {
            Log.e("BlurOverlay", "Uniform setting failed", e)
        }

        drawRect(ShaderBrush(shader), size = size)
    }
}