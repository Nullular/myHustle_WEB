package com.blueclipse.myhustle.ui.theme

import androidx.compose.ui.graphics.Color

/**
 * Predefined message bubble colors that users can choose from
 */
object MessageBubbleColors {
    
    data class BubbleColorOption(
        val id: String,
        val name: String,
        val color: Color,
        val description: String = ""
    )
    
    val availableColors = listOf(
        BubbleColorOption(
            id = "blue",
            name = "Ocean Blue",
            color = Color(0xFF2196F3),
            description = "Classic blue (default)"
        ),
        BubbleColorOption(
            id = "purple",
            name = "Purple",
            color = Color(0xFF9C27B0),
            description = "Royal purple"
        ),
        BubbleColorOption(
            id = "green",
            name = "Forest Green", 
            color = Color(0xFF4CAF50),
            description = "Nature green"
        ),
        BubbleColorOption(
            id = "orange",
            name = "Sunset Orange",
            color = Color(0xFFFF9800),
            description = "Warm orange"
        ),
        BubbleColorOption(
            id = "red",
            name = "Cherry Red",
            color = Color(0xFFE91E63),
            description = "Bold red"
        ),
        BubbleColorOption(
            id = "teal",
            name = "Teal Blue",
            color = Color(0xFF009688),
            description = "Modern teal"
        ),
        BubbleColorOption(
            id = "indigo",
            name = "Deep Indigo",
            color = Color(0xFF3F51B5),
            description = "Deep indigo"
        ),
        BubbleColorOption(
            id = "amber",
            name = "Golden Amber",
            color = Color(0xFFFFC107),
            description = "Golden yellow"
        )
    )
    
    /**
     * Get color by ID, fallback to blue if not found
     */
    fun getColorById(id: String): Color {
        return availableColors.find { it.id == id }?.color ?: availableColors.first().color
    }
    
    /**
     * Get color option by ID
     */
    fun getColorOptionById(id: String): BubbleColorOption {
        return availableColors.find { it.id == id } ?: availableColors.first()
    }
    
    /**
     * Get default color (blue)
     */
    fun getDefaultColor(): Color = availableColors.first().color
    
    /**
     * Get default color option (blue)
     */
    fun getDefaultColorOption(): BubbleColorOption = availableColors.first()
}
