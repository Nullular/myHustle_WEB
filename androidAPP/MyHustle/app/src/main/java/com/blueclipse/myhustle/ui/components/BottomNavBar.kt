package com.blueclipse.myhustle.ui.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import me.nikhilchaudhari.library.neumorphic

/**
 * Bottom navigation bar for My Hustle, styled with a soft neumorphic background.
 *
 * @param currentRoute the currently selected route
 * @param onNavigate callback to invoke when a nav item is clicked
 */
@Composable
fun BottomNavBar(
    currentRoute: String,
    onNavigate: (String) -> Unit
) {
    // Define your bottom bar items
    val items = listOf(
        NavItem(route = "home",    icon = Icons.Default.Home,     label = "Home"),
        NavItem(route = "favorites",icon = Icons.Default.Favorite, label = "Favorites"),
        NavItem(route = "profile", icon = Icons.Default.Person,   label = "Profile")
    )

    NavigationBar(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .neumorphic()
    ) {
        items.forEach { item ->
            NavigationBarItem(
                icon = { Icon(item.icon, contentDescription = item.label) },
                label = { Text(item.label) },
                selected = currentRoute == item.route,
                onClick = { onNavigate(item.route) }
            )
        }
    }
}

private data class NavItem(
    val route: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector,
    val label: String
)