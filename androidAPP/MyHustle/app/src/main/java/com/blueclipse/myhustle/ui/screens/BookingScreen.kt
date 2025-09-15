// app/src/main/java/com/example/myhustle/ui/screens/BookingScreen.kt
package com.blueclipse.myhustle.ui.screens

import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.runtime.Composable
import com.blueclipse.myhustle.ui.screens.booking.NewBookingScreen

// Legacy BookingScreen - now redirects to NewBookingScreen
@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun BookingScreen(
    shopId: String = "",
    serviceId: String = "",
    serviceName: String = "",
    shopName: String = "",
    shopOwnerId: String = "",
    onBack: () -> Unit,
    onSave: (Long) -> Unit,
    onLoginClick: (() -> Unit)? = null
) {
    NewBookingScreen(
        shopId = shopId,
        serviceId = serviceId,
        serviceName = serviceName,
        shopName = shopName,
        shopOwnerId = shopOwnerId,
        onBack = onBack,
        onSave = onSave,
        onLoginClick = onLoginClick
    )
}
