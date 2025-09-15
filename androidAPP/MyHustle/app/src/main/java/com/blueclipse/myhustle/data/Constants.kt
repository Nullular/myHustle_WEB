package com.blueclipse.myhustle.data

object Constants {
    object Categories {
        val ALL_CATEGORIES = listOf(
            "Fashion & Accessories",
            "Jewelry", 
            "Beauty & Cosmetics",
            "Health & Wellness",
            "Food & Catering",
            "Home & Décor",
            "Arts & Crafts",
            "Children & Education",
            "Technology & Gadgets",
            "Entertainment",
            "Pets & Animals",
            "Gifts & Parties",
            "Financial & Services",
            "Vehicles & Automotive"
        )
        
        // Filter options for the main screen
        val MAIN_FILTER_OPTIONS = listOf("All", "Featured", "Popular")
        
        // More filter options (categories + special filters)
        val MORE_FILTER_OPTIONS = ALL_CATEGORIES + listOf("Open Now")
    }
}
