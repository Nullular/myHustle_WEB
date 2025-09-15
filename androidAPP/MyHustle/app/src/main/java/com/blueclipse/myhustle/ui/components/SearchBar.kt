// app/src/main/java/com/example/myhustle/ui/components/SearchBar.kt
package com.blueclipse.myhustle.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.Icon
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.tween
import com.blueclipse.myhustle.ui.theme.HustleColors
import com.blueclipse.myhustle.ui.theme.HustleShapes

import me.nikhilchaudhari.library.NeuInsets
import me.nikhilchaudhari.library.neumorphic
import me.nikhilchaudhari.library.shapes.Pressed


@Composable
fun SearchBar(
    query: String,
    onQueryChange: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var isFocused by remember { mutableStateOf(false) }
    val isExpanded = isFocused || query.isNotEmpty()
    
    // Animate height when expanded
    val animatedHeight by animateDpAsState(
        targetValue = if (isExpanded) 48.dp else 36.dp,
        animationSpec = tween(durationMillis = 300),
        label = "SearchBarHeight"
    )
    
    Box(
        modifier = modifier
            .height(animatedHeight)
            .fillMaxWidth()
            // 1) Clip to pill shape first!
            .clip(HustleShapes.card)
            // 2) Apply the *default* Pressed‐Rounded inset shadows
            .neumorphic(
                neuShape         = Pressed.Rounded(radius = 4.dp),
                lightShadowColor = HustleColors.lightShadow,
                darkShadowColor  = HustleColors.darkShadow,
                elevation        = if (isExpanded) 8.dp else 6.dp,
                neuInsets        = NeuInsets(4.dp, 4.dp),
                strokeWidth      = if (isExpanded) 8.dp else 6.dp
            )
            // 3) Now draw your surface fill on top of those inset shadows
            .background(MaterialTheme.colorScheme.surface)
            .padding(horizontal = 16.dp),                         // content padding
        contentAlignment = Alignment.CenterStart
    ) {
        Row(Modifier.fillMaxSize(), verticalAlignment = Alignment.CenterVertically) {
            Icon(
                Icons.Filled.Search,
                contentDescription = "Search",
                tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
            )
            Spacer(Modifier.width(12.dp))
            BasicTextField(
                value        = query,
                onValueChange= onQueryChange,
                singleLine   = true,
                cursorBrush  = SolidColor(MaterialTheme.colorScheme.primary),
                textStyle    = TextStyle(color = MaterialTheme.colorScheme.onSurface),
                modifier     = Modifier
                    .weight(1f)
                    .onFocusChanged { focusState ->
                        isFocused = focusState.isFocused
                    },
                decorationBox= { inner ->
                    if (query.isEmpty() && !isFocused) {
                        Text(
                            "Search shops…",
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f)
                        )
                    }
                    inner()
                }
            )
            
            // Clear button when there's text
            if (query.isNotEmpty()) {
                IconButton(
                    onClick = { onQueryChange("") },
                    modifier = Modifier.size(24.dp)
                ) {
                    Icon(
                        Icons.Filled.Clear,
                        contentDescription = "Clear search",
                        tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    )
                }
            }
        }
    }
}
