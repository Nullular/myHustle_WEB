package com.blueclipse.myhustle.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.unit.dp

/**
 * Shape tokens for My Hustle's soft UI:
 *
 * - card: 12.dp rounded corners for gently raised cards.
 * - pill: 24.dp rounded corners for search bar and chips.
 * - oval: full 50% rounding for FABs and other circular elements.
 */
object HustleShapes {
    /** Standard card shape */
    val card = RoundedCornerShape(12.dp)

    /** Pill shape for text fields and chips */
    val pill = RoundedCornerShape(24.dp)

    /** Circular shape (50% radius) for FAB, etc. */
    val oval = RoundedCornerShape(50)
}
