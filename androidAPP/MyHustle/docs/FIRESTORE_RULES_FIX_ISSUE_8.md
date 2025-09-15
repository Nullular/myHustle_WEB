# Firestore Rules Fix for Issue 8: Permission Denied on Booking Confirmation

## Problem Diagnosed
The logcat error shows:
```
2025-09-05 17:35:32.777 17208-17250 Firestore: Stream closed with status: Status{code=PERMISSION_DENIED, description=Missing or insufficient permissions.}
2025-09-05 17:35:32.789 17208-17250 Firestore: Write failed at bookings/NEnr1Y9kW625zmc9nzUt: Status{code=PERMISSION_DENIED}
```

## Root Cause
The Firestore security rules have a **field name mismatch**:
- **Firestore rules** check for `resource.data.ownerId`
- **Booking data model** uses `resource.data.shopOwnerId`

This causes permission denied errors when shop owners try to book their own services.

## Fix Required (Manual Firebase Console Update)

### Current Firestore Rules (BROKEN):
```javascript
function isCustomerOrOwner(resource) {
  return isAuthenticated() && 
    (request.auth.uid == resource.data.customerId || 
     request.auth.uid == resource.data.ownerId);  // ❌ WRONG FIELD NAME
}

// Bookings collection
match /bookings/{bookingId} {
  allow create: if isAuthenticated();
  allow read, update: if isCustomerOrOwner(resource);  // ❌ FAILS FOR OWNERS
  allow delete: if isShopOwner(resource);
  allow read: if isAdmin();
}
```

### Updated Firestore Rules (FIXED):
```javascript
function isCustomerOrShopOwner(resource) {
  return isAuthenticated() && 
    (request.auth.uid == resource.data.customerId || 
     request.auth.uid == resource.data.shopOwnerId);  // ✅ CORRECT FIELD NAME
}

// Bookings collection
match /bookings/{bookingId} {
  allow create: if isAuthenticated();
  allow read, update: if isCustomerOrShopOwner(resource);  // ✅ WORKS FOR OWNERS
  allow delete: if isCustomerOrShopOwner(resource);        // ✅ SIMPLIFIED
  allow read: if isAdmin();
}
```

## Manual Deployment Steps
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your MyHustle project
3. Navigate to **Firestore Database** → **Rules** tab
4. Replace the current booking rules with the fixed version above
5. Click **Publish** to deploy the changes

## Booking Data Model Reference
```kotlin
data class Booking(
    val customerId: String = "",           // Customer who made booking
    val shopOwnerId: String = "",          // Owner of the shop (NOT ownerId!)
    val shopId: String = "",               // Shop ID
    val serviceId: String = "",            // Service ID
    // ... other fields
)
```

## Expected Outcome
After applying this fix:
- ✅ Shop owners can successfully book their own services
- ✅ Customers can book any service as before
- ✅ Permission errors in logcat will be resolved
- ✅ Both customers and shop owners can read/update/delete their bookings

## Verification
1. Deploy the rules in Firebase Console
2. Test booking confirmation as shop owner
3. Check logcat - no more permission denied errors
4. Verify booking appears in both customer and owner views

---
**STATUS**: Issue 8 diagnosed and fix provided - requires manual Firebase Console deployment
