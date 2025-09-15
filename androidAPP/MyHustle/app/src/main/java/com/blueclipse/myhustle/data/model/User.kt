package com.blueclipse.myhustle.data.model

/**
 * Represents a user in the MyHustle platform
 */
data class User(
    val id: String = "",
    val email: String = "",
    val username: String = "", // Added username field
    val displayName: String = "",
    val photoUrl: String = "",
    val userType: UserType = UserType.CUSTOMER,
    val createdAt: Long = System.currentTimeMillis(),
    val verified: Boolean = false, // Match database field name
    val active: Boolean = true,    // Match database field name
    val lastLoginAt: Long = 0,
    val profile: UserProfile = UserProfile()
) {
    // Firebase requires a no-argument constructor
    constructor() : this(
        "", "", "", "", "", UserType.CUSTOMER, System.currentTimeMillis(), 
        false, true, 0, UserProfile()
    )
}

/**
 * User types in the platform
 */
enum class UserType {
    CUSTOMER,
    BUSINESS_OWNER,
    ADMIN
}

/**
 * Extended user profile information
 */
data class UserProfile(
    val firstName: String = "",
    val lastName: String = "",
    val phone: String = "",
    val dateOfBirth: String = "",
    val address: Address = Address(),
    val preferences: UserPreferences = UserPreferences()
) {
    constructor() : this("", "", "", "", Address(), UserPreferences())
}

/**
 * User address information
 */
data class Address(
    val street: String = "",
    val city: String = "",
    val state: String = "",
    val zipCode: String = "",
    val country: String = ""
) {
    constructor() : this("", "", "", "", "")
}

/**
 * User preferences and settings
 */
data class UserPreferences(
    val notifications: Boolean = true,
    val emailMarketing: Boolean = false,
    val language: String = "en",
    val currency: String = "USD",
    val theme: String = "light",
    val messaging: MessagingPreferences = MessagingPreferences()
) {
    constructor() : this(true, false, "en", "USD", "light", MessagingPreferences())
}

/**
 * Messaging preferences for the user
 */
data class MessagingPreferences(
    val bubbleColor: String = "blue" // Default blue color
) {
    constructor() : this("blue")
}
