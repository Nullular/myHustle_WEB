package com.blueclipse.myhustle.ui.components

import android.graphics.SurfaceTexture
import android.os.Build
import android.view.TextureView
import androidx.annotation.RawRes
import androidx.annotation.RequiresApi
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.datasource.DefaultDataSource
import androidx.media3.datasource.RawResourceDataSource
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.source.ProgressiveMediaSource

@RequiresApi(Build.VERSION_CODES.TIRAMISU)
@UnstableApi
@Composable
fun AGSLVideoBackground(
    @RawRes videoResId: Int,
    modifier: Modifier = Modifier,
    blurRadius: Dp = 16.dp // You can customize this
) {
    val context = LocalContext.current
    val textureView = remember {
        TextureView(context).apply {
            surfaceTextureListener = object : TextureView.SurfaceTextureListener {
                override fun onSurfaceTextureAvailable(surface: SurfaceTexture, width: Int, height: Int) = Unit
                override fun onSurfaceTextureSizeChanged(surface: SurfaceTexture, width: Int, height: Int) = Unit
                override fun onSurfaceTextureDestroyed(surface: SurfaceTexture): Boolean = true
                override fun onSurfaceTextureUpdated(surface: SurfaceTexture) = Unit
            }
        }
    }

    val player = remember {
        ExoPlayer.Builder(context).build().apply {
            val dataSourceFactory = DefaultDataSource.Factory(context)
            val mediaItem = MediaItem.fromUri(RawResourceDataSource.buildRawResourceUri(videoResId))
            val mediaSource = ProgressiveMediaSource.Factory(dataSourceFactory).createMediaSource(mediaItem)
            setMediaSource(mediaSource)
            prepare()
            playWhenReady = true
            repeatMode = Player.REPEAT_MODE_ALL
            volume = 0f
            setVideoTextureView(textureView)
        }
    }

    DisposableEffect(Unit) {
        onDispose { player.release() }
    }

    Box(modifier = modifier.fillMaxSize()) {
        AndroidView(
            factory = { textureView },
            modifier = Modifier
                .fillMaxSize()
                .blur(blurRadius)
        )
    }
}