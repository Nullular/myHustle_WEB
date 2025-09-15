// CatalogItem.kt
package com.blueclipse.myhustle.data.model

import com.google.firebase.firestore.PropertyName

data class CatalogItem(
    val id: String = "",
    val name: String = "",
    val imageUrl: String = "",
    val description: String = "",
    @get:PropertyName("isProduct") @set:PropertyName("isProduct") 
    var isProduct: Boolean = false, // Must be var for Firebase
    val rating: Float = 0f
) {
    // Firebase requires a no-argument constructor
    constructor() : this("", "", "", "", false, 0f)
}
