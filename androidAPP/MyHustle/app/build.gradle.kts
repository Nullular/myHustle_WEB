plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    id("org.jetbrains.kotlin.kapt")                   // for Glide's annotation processor
    id("org.jetbrains.kotlin.plugin.compose")         // Compose compiler plugin
    id("com.google.gms.google-services")              // Firebase plugin
}

android {
    namespace = "com.blueclipse.myhustle"
    compileSdk = 35

    defaultConfig {
        applicationId      = "com.blueclipse.myhustle"
        minSdk             = 33
        targetSdk          = 35
        versionCode        = 2
        versionName        = "1.1"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
        languageVersion = "2.0"
    }

    buildFeatures {
        viewBinding = true
        compose     = true    // 🔹 enable Compose
    }
    composeOptions {
        // match this to your Compose UI version
        kotlinCompilerExtensionVersion = "1.5.0"
    }
}

dependencies {
    // ────────────────────────────────────────────────────────────────
    // Firebase
    // ────────────────────────────────────────────────────────────────
    implementation(platform("com.google.firebase:firebase-bom:32.7.1"))
    implementation("com.google.firebase:firebase-firestore-ktx")
    implementation("com.google.firebase:firebase-auth-ktx")
    implementation("com.google.firebase:firebase-analytics-ktx")
    implementation("com.google.firebase:firebase-storage-ktx")          // Add Firebase Storage
    implementation("com.google.firebase:firebase-functions-ktx")        // Optional: for image processing functions

    // ────────────────────────────────────────────────────────────────
    // Core AndroidX & existing libraries
    // ────────────────────────────────────────────────────────────────
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    implementation(libs.androidx.recyclerview)
    implementation(libs.androidx.constraintlayout)
    implementation(libs.androidx.lifecycle.livedata.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.ktx)
    implementation(libs.androidx.navigation.fragment.ktx)
    implementation(libs.androidx.navigation.ui.ktx)
    implementation("androidx.compose.ui:ui-text-google-fonts:1.8.1")
    implementation("com.google.accompanist:accompanist-systemuicontroller:0.36.0")
    implementation("androidx.compose.ui:ui-graphics-android:1.5.0")




    // Glide image loading + compiler
    implementation("com.github.bumptech.glide:glide:4.15.1")
    kapt("com.github.bumptech.glide:compiler:4.15.1")

    // Coil (for loading images in Compose)
    implementation("io.coil-kt:coil-compose:2.2.2")

    // Neumorphic compose library
    implementation("me.nikhilchaudhari:composeNeumorphism:1.0.0-alpha02")

    // ────────────────────────────────────────────────────────────────
    // Jetpack Compose & Material3
    // ────────────────────────────────────────────────────────────────
    implementation("androidx.activity:activity-compose:1.7.2")
    implementation("androidx.compose.ui:ui:1.5.0")
    implementation("androidx.compose.ui:ui-tooling-preview:1.5.0")
    implementation("androidx.compose.material3:material3:1.1.0")
    implementation("androidx.compose.material:material-icons-extended:1.5.0")
    implementation("androidx.compose.ui:ui:1.6.0")
    implementation("androidx.compose.ui:ui-graphics:1.6.0")
    // For RuntimeShader if needed
    implementation("androidx.compose.ui:ui-tooling:1.6.0")



    implementation("io.coil-kt:coil-compose:2.4.0")

    implementation("androidx.media3:media3-common:1.3.1")

// Media3 ExoPlayer and UI components
    implementation("androidx.media3:media3-exoplayer:1.3.1")
    implementation("androidx.media3:media3-ui:1.3.1")
    implementation("androidx.media3:media3-datasource:1.3.1")

    implementation("com.github.prime-zs.toolkit:core-ktx:2.0.2-alpha")






    implementation("androidx.compose.ui:ui-graphics:1.4.0")



    // Navigation in Compose
    implementation("androidx.navigation:navigation-compose:2.6.0")

    // Tooling only in debug builds
    debugImplementation("androidx.compose.ui:ui-tooling:1.5.0")
    debugImplementation("androidx.compose.ui:ui-tooling-preview:1.5.0")
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)

    // ────────────────────────────────────────────────────────────────
    // Testing
    // ────────────────────────────────────────────────────────────────
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
}
