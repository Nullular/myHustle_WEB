# Firebase Setup for Reviews System

## Overview
The reviews system requires Firebase Firestore composite indexes to work efficiently. This document provides instructions for setting up the required indexes and security rules.

## Required Indexes

### 1. Primary Reviews Query Index
- **Collection**: `reviews`
- **Fields**: 
  - `targetId` (Ascending)
  - `visible` (Ascending) 
  - `createdAt` (Descending)

### 2. Customer Reviews Index
- **Collection**: `reviews`
- **Fields**:
  - `customerId` (Ascending)
  - `createdAt` (Descending)

### 3. Shop Reviews Index  
- **Collection**: `reviews`
- **Fields**:
  - `shopId` (Ascending)
  - `visible` (Ascending)
  - `createdAt` (Descending)

## Setup Instructions

### Option 1: Using Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `myhustle-39688`
3. Navigate to **Firestore Database** → **Indexes**
4. Click **Create Index** and add the three indexes listed above

### Option 2: Using Firebase CLI
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy indexes from firestore.indexes.json
firebase deploy --only firestore:indexes

# Deploy security rules from firestore.rules  
firebase deploy --only firestore:rules
```

### Option 3: Manual Index Creation via Error Link
When you encounter the Firebase index error, click the provided link in the error message:
```
https://console.firebase.google.com/v1/r/project/myhustle-39688/firestore/indexes?create_composite=...
```

## Security Rules
The `firestore.rules` file contains security rules for the reviews collection that:
- Allow anyone to read visible reviews
- Only allow authenticated users to create reviews
- Only allow review authors to update their reviews  
- Only allow shop owners/admins to delete reviews
- Validate review data structure and constraints

## Testing
After setting up the indexes:
1. Wait 5-10 minutes for indexes to build
2. Test the reviews functionality on your website
3. Check Firebase Console → Firestore → Usage tab to confirm queries are using indexes

## Temporary Workaround
The current ReviewService implementation uses simplified queries that filter and sort results in memory to avoid the index requirement. This works for development but should be updated to use the optimized queries once indexes are created.

## Collection Structure

### Reviews Document
```typescript
{
  id: string;
  customerId: string;
  shopId: string;
  targetType: 'SHOP' | 'PRODUCT' | 'SERVICE';
  targetId: string;
  targetName: string;
  rating: number; // 1-5
  title?: string;
  content: string;
  detailedRatings?: {
    quality: number;
    communication: number;
    timeliness: number;
    value: number;
    professionalism: number;
  };
  imageUrls?: string[];
  createdAt: number;
  updatedAt?: number;
  visible: boolean;
  helpfulVotes: number;
  unhelpfulVotes: number;
  ownerResponse?: {
    content: string;
    respondedAt: number;
    ownerId: string;
  };
}
```

## Next Steps
1. Create the Firebase indexes using one of the methods above
2. Deploy the security rules
3. Update ReviewService to use optimized queries
4. Test the complete reviews functionality