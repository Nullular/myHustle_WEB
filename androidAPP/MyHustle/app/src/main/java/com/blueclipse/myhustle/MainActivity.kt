package com.blueclipse.myhustle

import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.core.view.WindowCompat
import com.blueclipse.myhustle.navigation.AppNavGraph
import com.blueclipse.myhustle.ui.theme.AppStatusBar
import com.blueclipse.myhustle.ui.theme.HustleTheme
import com.google.firebase.FirebaseApp

/**
 * MainActivity hosts the Compose navigation graph in a pure Compose setup.
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        // Initialize Firebase (this usually works even with Google Play Services errors)
        FirebaseApp.initializeApp(this)
        Log.d("MainActivity", "🔥 Firebase initialization attempted")
        
        // Database structure is now only initialized through the setup screen
        // No automatic re-seeding on app startup
        
        // 1️⃣ opt out of the framework's default "fitSystemWindows"
        WindowCompat.setDecorFitsSystemWindows(window, false)

        super.onCreate(savedInstanceState)

        setContent {
            HustleTheme {
                // 2️⃣ make the status bar itself transparent (so your content truly goes behind it)
                AppStatusBar(
                    color     = Color.Transparent,
                    darkIcons = true
                )

                // 3️⃣ now your NavGraph (or root UI) will sit under the status bar—
                //    only add padding where you actually want to avoid the notch/clock:
                Box(Modifier.fillMaxSize()) {
                    AppNavGraph()
                }
            }
        }
    }
}
