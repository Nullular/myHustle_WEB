# Contact Store Owner Feature Implementation

## Overview
Successfully implemented a "Contact Store Owner" button in the StoreProfileScreen that allows customers to quickly initiate a chat conversation with the store owner.

## Features Implemented

### 1. Contact Owner Button
- **Location**: Contact Details section of StoreProfileScreen
- **Design**: Full-width blue button with message icon
- **Text**: "Contact Store Owner"
- **Authentication**: Requires user to be logged in

### 2. Message Dialog
- **Type**: Custom dialog component `StoreOwnerMessageDialog`
- **Features**:
  - Multi-line text input for customer message
  - Placeholder text: "Ask about products, services, or store hours..."
  - Three action buttons:
    - **Cancel**: Dismiss dialog
    - **Send**: Send message only
    - **Send & Chat**: Send message and navigate to chat screen

### 3. Chat Integration
- **Implementation**: Uses existing ChatRepository and messaging system
- **Process**:
  1. Creates or gets existing direct chat with store owner using `shop.ownerId`
  2. Sends initial message: "Hi! I'm interested in your store '{storeName}'. {user_message}"
  3. Optionally navigates to chat screen for continued conversation

### 4. Error Handling
- **Authentication Check**: Shows error if user not logged in
- **Owner ID Validation**: Shows error if store owner information not available
- **Network Errors**: Handles chat creation and message sending failures
- **User Feedback**: Red error snackbar that auto-dismisses after 3 seconds

## Technical Implementation

### Files Modified

#### 1. StoreProfileScreen.kt
**New Function Signature:**
```kotlin
fun StoreProfileScreen(
    shopId: String,
    onBack: () -> Unit,
    onCatalogItemClick: (CatalogItem) -> Unit,
    onNavigateToChat: (String, String) -> Unit = { _, _ -> } // chatId, chatTitle
)
```

**New Imports Added:**
- `Icons.filled.Message`
- `ChatRepository`
- `FirebaseAuth`
- `android.util.Log`
- `androidx.compose.ui.window.Dialog`

**New State Variables:**
```kotlin
var showMessageDialog by remember { mutableStateOf(false) }
var errorMessage by remember { mutableStateOf<String?>(null) }
val currentUser = FirebaseAuth.getInstance().currentUser
```

#### 2. AppNavGraph.kt
**Updated StoreProfileScreen Call:**
```kotlin
StoreProfileScreen(
    shopId = shopId,
    onBack = { navController.popBackStack() },
    onNavigateToChat = { chatId, chatTitle ->
        navController.navigate("${Destinations.CHAT_ROUTE}/$chatId/${java.net.URLEncoder.encode(chatTitle, "UTF-8")}")
    },
    onCatalogItemClick = { item -> /* existing implementation */ }
)
```

### Navigation Flow
1. **Store Profile** → Contact Store Owner Button
2. **Message Dialog** → User enters message
3. **Send Options**:
   - **Send Only**: Message sent, dialog closes, user stays on store profile
   - **Send & Chat**: Message sent, dialog closes, navigates to chat screen

### UI/UX Design
- **Button Style**: Matches existing app design with neumorphic styling
- **Dialog Design**: Clean white surface with rounded corners
- **Color Scheme**: 
  - Primary button: HustleColors.BlueAccent
  - Success button: Green (#4CAF50)
  - Error messages: Red with white text

## Integration with Existing Features
- **Uses existing messaging system**: No duplicate functionality
- **Follows app patterns**: Similar to BookingRequestsScreen messaging implementation
- **Consistent styling**: Matches app's neumorphic design language
- **Proper navigation**: Integrates with existing chat routing

## User Experience
1. **Intuitive Location**: Contact button placed logically in Contact Details section
2. **Clear Actions**: Two distinct options for sending messages
3. **Immediate Feedback**: Loading states and error messages
4. **Seamless Flow**: Option to continue conversation in dedicated chat screen

## Testing Status
✅ **Compilation**: Successfully builds without errors
✅ **File Structure**: All necessary imports and dependencies added
✅ **Navigation**: Proper chat route integration
✅ **Error Handling**: Comprehensive error checking and user feedback

## Future Enhancements
- Add typing indicators during message sending
- Support for media attachments in store contact messages
- Quick message templates (e.g., "What are your hours?", "Do you deliver?")
- Store owner notification system for new contact requests
