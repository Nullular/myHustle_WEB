# Unauthenticated Product/Service Access Diagnostic

## Current Status
✅ **Reviews**: Fixed field name mismatch (`visible` vs `isVisible`) - should work now
✅ **Shops**: Fixed authentication clearing logic - unauthenticated users can see shops
❓ **Products/Services**: Users report "getting denied" when clicking on items

## Likely Causes

### 1. **Firestore Security Rule Issues**
- **Products**: Rules allow `resource.data.isActive == true` for public read
- **Services**: Rules allow `resource.data.isActive == true` for public read
- **Problem**: Maybe the actual documents don't have `isActive = true` set properly

### 2. **Data Loading Failures**
- **ProductRepository.getProductById()**: No auth checks, should work
- **ServiceRepository.getServiceById()**: No auth checks, should work  
- **Problem**: Firestore rules might be blocking individual document access

### 3. **Error Manifestation**
- **Navigation**: Works fine - no auth guards in navigation setup
- **UI Interaction**: No auth guards in StoreProfileScreen clickable items
- **Data Loading**: Failure likely occurs in ProductScreen/ServiceScreen data loading

## Debugging Steps

### Immediate Testing Needed
1. **Check Logs**: Look for "permission denied" errors in app logs during product clicks
2. **Test Data**: Verify sample products have `isActive: true` in Firestore 
3. **Rule Testing**: Test if authenticated users can access the same products

### Potential Fixes

#### A. Data Consistency Check
Verify that all products/services in Firestore have proper fields:
```json
{
  "isActive": true,  // Required for public access
  "name": "Product Name",
  // ... other fields
}
```

#### B. Rule Debugging
Add temporary logging to Firestore rules to see what's being blocked:
```javascript
// Temporary debug rule
allow read: if resource.data.isActive == true || 
  debug(resource.data) || // This will show in Firestore logs what data exists
  isAdmin();
```

#### C. Repository Error Handling
Add better error logging in ProductScreen data loading:
```kotlin
productRepository.getProductById(itemId).onFailure { error ->
    Log.e("ProductScreen", "Failed to load product: ${error.message}", error)
}
```

## Expected Error Pattern
If Firestore rules are the issue, users will see:
- Navigation works (user reaches ProductScreen)
- Loading indicator shows
- Error occurs during data fetch
- Screen shows empty/error state with "permission denied" in logs

## Quick Fix Strategy
1. **Verify sample data** has required fields
2. **Check Firestore security rules** in console for blocked requests
3. **Add error logging** to ProductScreen for diagnosis
4. **Test with authenticated user** to confirm data exists

The navigation and UI setup look correct - this is likely a **data access/security rule issue** rather than an authentication guard problem.
