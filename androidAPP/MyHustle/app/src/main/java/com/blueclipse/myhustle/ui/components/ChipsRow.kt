package com.blueclipse.myhustle.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.PopupProperties
import com.blueclipse.myhustle.ui.theme.HustleColors
import me.nikhilchaudhari.library.NeuInsets
import me.nikhilchaudhari.library.neumorphic
import me.nikhilchaudhari.library.shapes.Punched
import me.nikhilchaudhari.library.shapes.Pressed

@Composable
fun NeumorphicChip(
    text: String,
    selected: Boolean,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .defaultMinSize(minWidth = 48.dp, minHeight = 32.dp)
            .clickable(onClick = onClick)
            .then(
                if (selected) {
                    // Pressed neumorphic needs clip() first
                    Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .neumorphic(
                            neuShape = Pressed.Rounded(radius = 4.dp),
                            lightShadowColor = HustleColors.lightShadow,
                            darkShadowColor = HustleColors.darkShadow,
                            elevation = 8.dp,
                            neuInsets = NeuInsets(4.dp, 4.dp),
                            strokeWidth = 8.dp
                        )
                        .background(MaterialTheme.colorScheme.surface)
                } else {
                    // Punched neumorphic works without clip()
                    Modifier
                        .neumorphic(
                            neuShape = Punched.Rounded(radius = 16.dp),
                            lightShadowColor = HustleColors.lightShadow,
                            darkShadowColor = HustleColors.darkShadow,
                            elevation = 4.dp,
                            neuInsets = NeuInsets(4.dp, 4.dp),
                            strokeWidth = 2.dp
                        )
                        .background(MaterialTheme.colorScheme.surface, shape = RoundedCornerShape(16.dp))
                }
            )
            .padding(horizontal = 16.dp, vertical = 8.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            color = if (selected)
                MaterialTheme.colorScheme.primary
            else
                MaterialTheme.colorScheme.onSurface
        )
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ChipsRow(
    selected: String,
    options: List<String>,
    onSelect: (String) -> Unit,
    showMoreDropdown: Boolean = false,
    moreOptions: List<String> = emptyList(),
    showMoreFiltersDropdown: Boolean = false,
    onMoreDropdownToggle: (Boolean) -> Unit = {}
) {
    FlowRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement   = Arrangement.spacedBy(8.dp),
        modifier              = Modifier.padding(16.dp)
    ) {
        // Main filter options
        options.forEach { label ->
            NeumorphicChip(
                text     = label,
                selected = label == selected,
                onClick  = { onSelect(label) }
            )
        }
        
        // More dropdown if enabled
        if (showMoreDropdown && moreOptions.isNotEmpty()) {
            Box {
                NeumorphicChip(
                    text = "More...",
                    selected = selected in moreOptions,
                    onClick = { onMoreDropdownToggle(true) }
                )
                
                DropdownMenu(
                    expanded = showMoreFiltersDropdown,
                    onDismissRequest = { onMoreDropdownToggle(false) },
                    modifier = Modifier
                        .background(
                            color = Color.White,
                            shape = RoundedCornerShape(20.dp)
                        ),
                    properties = PopupProperties(
                        focusable = true,
                        dismissOnBackPress = true,
                        dismissOnClickOutside = true
                    )
                ) {
                    // Header with modern styling
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.FilterList,
                            contentDescription = null,
                            tint = HustleColors.BlueAccent,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Filter Options",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = Color.Black
                        )
                    }
                    
                    HorizontalDivider(
                        thickness = 1.dp,
                        color = Color.Gray.copy(alpha = 0.2f),
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    moreOptions.forEach { filter ->
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 8.dp, vertical = 2.dp)
                                .clickable {
                                    onSelect(filter)
                                    onMoreDropdownToggle(false)
                                },
                            shape = RoundedCornerShape(12.dp),
                            color = if (selected == filter) 
                                HustleColors.BlueAccent.copy(alpha = 0.1f) 
                            else 
                                Color.Transparent
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    // Filter icon based on type
                                    Icon(
                                        imageVector = when (filter) {
                                            "Fashion & Accessories" -> Icons.Default.Checkroom
                                            "Jewelry" -> Icons.Default.Star
                                            "Beauty & Cosmetics" -> Icons.Default.Face
                                            "Health & Wellness" -> Icons.Default.FitnessCenter
                                            "Food & Catering" -> Icons.Default.Restaurant
                                            "Home & Décor" -> Icons.Default.Home
                                            "Arts & Crafts" -> Icons.Default.Palette
                                            "Children & Education" -> Icons.Default.School
                                            "Technology & Gadgets" -> Icons.Default.Computer
                                            "Entertainment" -> Icons.Default.MovieCreation
                                            "Pets & Animals" -> Icons.Default.Pets
                                            "Gifts & Parties" -> Icons.Default.CardGiftcard
                                            "Financial & Services" -> Icons.Default.AccountBalance
                                            "Vehicles & Automotive" -> Icons.Default.DirectionsCar
                                            "Coffee" -> Icons.Default.LocalCafe
                                            "Tech" -> Icons.Default.Computer
                                            "Beauty" -> Icons.Default.Face
                                            "Services" -> Icons.Default.RoomService
                                            "Products" -> Icons.Default.ShoppingBag
                                            "Open Now" -> Icons.Default.Schedule
                                            else -> Icons.Default.Category
                                        },
                                        contentDescription = null,
                                        tint = if (selected == filter) 
                                            HustleColors.BlueAccent 
                                        else 
                                            Color.Gray,
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Text(
                                        text = filter,
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontWeight = if (selected == filter) FontWeight.Medium else FontWeight.Normal,
                                        color = if (selected == filter) 
                                            HustleColors.BlueAccent 
                                        else 
                                            Color.Black
                                    )
                                }
                                
                                if (selected == filter) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = "Selected",
                                        tint = HustleColors.BlueAccent,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(8.dp))
                }
            }
        }
    }
}
