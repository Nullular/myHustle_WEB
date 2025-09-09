# Store Profile Screen Documentation

## Purpose & Function
The Store Profile Screen displays detailed information about a specific business/shop including banner, logo, description, catalog items, reviews, and contact information. It serves as the primary interface for customers to explore a business's offerings.

## Screen Overview
- **File**: `StoreProfileScreen.kt`
- **Type**: Business Detail Screen
- **User Types**: All users (customers browsing businesses)

## UI Components & Layout

### Header Section (320dp height)
- **Banner Image**: Full-width background image
  - Height: 200dp
  - Shape: Rounded bottom corners (20dp radius)
  - Content Scale: Crop to fill
  - Source: `shop.bannerUrl`

- **Store Logo**: Circular overlay on banner
  - Size: Configurable (typically 80dp)
  - Position: Overlaid on banner
  - Shape: CircleShape
  - Source: `shop.logoUrl`

- **Neumorphic Design**: Custom styling with light/dark shadows
  - Elevation: 8dp
  - Insets: 6dp
  - Stroke: 3dp
  - Shape: Punched rounded

### Store Information Section
- **Store Name**: Primary heading
- **Description**: Secondary text with proper styling
- **Location**: With location icon
- **Phone**: With phone icon (clickable for dialing)
- **Rating**: Star display with numeric rating
- **Operating Hours**: Current status and hours display

### Action Buttons Row
- **Favorite Toggle**: Heart icon (filled/outlined based on state)
- **Share Button**: Share icon for sharing store profile
- **Contact Button**: Phone icon for direct contact

### Catalog Section
- **Section Title**: "Our Products & Services"
- **Layout**: Horizontal scrolling LazyRow
- **Item Cards**: Individual product/service cards
  - Image thumbnail
  - Name and price
  - Click action: Navigate to detail screen

### Reviews Section
- **Component**: ReviewsPanel
- **Target Type**: ReviewTargetType.SHOP
- **Integration**: Displays customer reviews and ratings
- **Features**: Add review, view existing reviews

### Back Navigation
- **Button**: Back arrow in top-left
- **Action**: Return to previous screen
- **Icon**: Material Icons ArrowBack

## Data Flow & State Management

### Data Loading
```kotlin
val shops by ShopRepository.instance.shops.collectAsState(initial = emptyList())
val shop: Shop? = shops.firstOrNull { it.id == shopId }
```

### State Management
- **Shop Data**: Loaded from ShopRepository
- **Loading State**: Displays progress indicator while loading
- **Error State**: Graceful handling of missing shops
- **Coroutine Scope**: For async operations (favorite toggle)

### Dynamic Content
- **Conditional Rendering**: Based on data availability
- **Real-time Updates**: StateFlow reactivity
- **Error Handling**: Null safety for missing shops

## Data Models

### Shop Model (Complete)
```kotlin
data class Shop(
    val id: String,
    val name: String,
    val description: String,
    val ownerId: String,
    val category: String,
    val location: String,
    val address: String,
    val phone: String,
    val email: String,
    val website: String,
    val logoUrl: String,
    val bannerUrl: String,
    val coverImageUrl: String,
    val rating: Double,
    val totalReviews: Int,
    val isVerified: Boolean,
    val isPremium: Boolean,
    val isActive: Boolean,
    val availability: String,
    val openTime24: String,
    val closeTime24: String,
    val responseTime: String,
    val operatingHours: Map<String, String>,
    val socialMedia: Map<String, String>,
    val tags: List<String>,
    val specialties: List<String>,
    val priceRange: String,
    val deliveryOptions: List<String>,
    val paymentMethods: List<String>,
    val catalog: List<CatalogItem>,
    val isFavorite: Boolean
)
```

### CatalogItem Model
```kotlin
data class CatalogItem(
    val id: String,
    val name: String,
    val description: String,
    val price: Double,
    val imageUrl: String,
    val isProduct: Boolean, // true for products, false for services
    val category: String,
    val availability: Boolean
)
```

## API Integration

### ShopRepository Methods
- **shops**: StateFlow<List<Shop>>
- **toggleFavorite(shopId)**: Update favorite status
- **Repository Pattern**: Centralized data management

### Firestore Integration
- **Collection**: `shops`
- **Document**: Individual shop documents
- **Subcollections**: Reviews, catalog items
- **Real-time**: Live updates via Firestore listeners

## Business Logic

### Favorite Management
```kotlin
coroutineScope.launch {
    val result = repository.toggleFavorite(shop.id)
    if (result.isFailure) {
        Log.e("StoreProfile", "Failed to toggle favorite: ${result.exceptionOrNull()}")
    }
}
```

### Operating Hours Display
- **Format**: Convert 24-hour to 12-hour format
- **Status**: Determine if currently open/closed
- **Logic**: Time comparison with current time

### Contact Integration
- **Phone**: Intent to dialer app
- **Email**: Intent to email app
- **Website**: Intent to browser app

### Catalog Navigation
- **Product Items**: Navigate to ProductScreen
- **Service Items**: Navigate to ServiceScreen
- **Parameters**: Pass item ID and shop context

## User Interactions

### Primary Actions
1. **Back Navigation**: Return to previous screen
2. **Favorite Toggle**: Add/remove from favorites
3. **Share Store**: Share store profile link
4. **Contact Store**: Call, email, or visit website
5. **View Catalog Item**: Navigate to product/service details
6. **View Reviews**: Scroll to reviews section
7. **Add Review**: Open review creation interface

### Secondary Actions
- **View Full Description**: Expand description if truncated
- **View All Hours**: Detailed operating hours
- **View Location**: Map integration (if implemented)
- **Social Media**: Links to social platforms

## Web Implementation Notes

### React/Next.js Implementation
```jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  IconButton,
  Button,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Rating,
  Chip
} from '@mui/material';
import {
  ArrowBack,
  Favorite,
  FavoriteBorder,
  Share,
  Phone,
  LocationOn,
  Schedule
} from '@mui/icons-material';

const StoreProfileScreen = () => {
  const router = useRouter();
  const { shopId } = router.query;
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const shopData = await shopsAPI.getById(shopId);
        setShop(shopData);
        setIsFavorite(shopData.isFavorite);
      } catch (error) {
        console.error('Error fetching shop:', error);
      } finally {
        setLoading(false);
      }
    };

    if (shopId) fetchShop();
  }, [shopId]);

  const toggleFavorite = async () => {
    try {
      await shopsAPI.toggleFavorite(shopId);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleCall = () => {
    window.location.href = `tel:${shop.phone}`;
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: shop.name,
        text: shop.description,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!shop) return <ErrorMessage />;

  return (
    <Box>
      {/* Header with Banner */}
      <Box sx={{ position: 'relative', height: 320 }}>
        <CardMedia
          component="img"
          height="200"
          image={shop.bannerUrl}
          alt={shop.name}
          sx={{ borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}
        />
        
        {/* Back Button */}
        <IconButton
          sx={{ 
            position: 'absolute', 
            top: 16, 
            left: 16, 
            bgcolor: 'rgba(0,0,0,0.5)' 
          }}
          onClick={() => router.back()}
        >
          <ArrowBack sx={{ color: 'white' }} />
        </IconButton>

        {/* Store Logo */}
        <Box
          sx={{
            position: 'absolute',
            top: 120,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src={shop.logoUrl}
            alt={shop.name}
            style={{ width: 60, height: 60, borderRadius: '50%' }}
          />
        </Box>
      </Box>

      <Container>
        {/* Store Info */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            {shop.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {shop.description}
          </Typography>

          {/* Rating */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Rating value={shop.rating} readOnly />
            <Typography sx={{ ml: 1 }}>
              {shop.rating} ({shop.totalReviews} reviews)
            </Typography>
          </Box>

          {/* Contact Info */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LocationOn sx={{ mr: 1 }} />
                <Typography>{shop.location}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone sx={{ mr: 1 }} />
                <Typography>{shop.phone}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Schedule sx={{ mr: 1 }} />
                <Typography>
                  {formatOperatingHours(shop.openTime24, shop.closeTime24)}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ mb: 4 }}>
            <IconButton onClick={toggleFavorite}>
              {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
            </IconButton>
            <IconButton onClick={handleShare}>
              <Share />
            </IconButton>
            <IconButton onClick={handleCall}>
              <Phone />
            </IconButton>
          </Box>
        </Box>

        {/* Catalog Section */}
        <Typography variant="h5" gutterBottom>
          Our Products & Services
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {shop.catalog.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <CatalogItemCard 
                item={item} 
                onClick={() => router.push(`/${item.isProduct ? 'product' : 'service'}/${item.id}`)}
              />
            </Grid>
          ))}
        </Grid>

        {/* Reviews Section */}
        <ReviewsSection shopId={shopId} />
      </Container>
    </Box>
  );
};

const CatalogItemCard = ({ item, onClick }) => (
  <Card onClick={onClick} sx={{ cursor: 'pointer', '&:hover': { elevation: 4 } }}>
    <CardMedia
      component="img"
      height="140"
      image={item.imageUrl}
      alt={item.name}
    />
    <CardContent>
      <Typography variant="h6" noWrap>
        {item.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" noWrap>
        {item.description}
      </Typography>
      <Typography variant="h6" color="primary">
        ${item.price}
      </Typography>
      <Chip 
        label={item.isProduct ? 'Product' : 'Service'}
        size="small"
        color={item.isProduct ? 'primary' : 'secondary'}
      />
    </CardContent>
  </Card>
);
```

### Responsive Design Considerations
```css
/* Mobile-first responsive design */
.store-profile {
  @apply container mx-auto px-4;
}

.banner-section {
  @apply relative h-80 mb-4;
}

.banner-image {
  @apply w-full h-48 object-cover rounded-b-lg;
}

.store-logo {
  @apply absolute top-24 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg;
}

.catalog-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8;
}

@media (max-width: 640px) {
  .banner-section {
    @apply h-64;
  }
  
  .banner-image {
    @apply h-32;
  }
  
  .store-logo {
    @apply top-16 w-16 h-16;
  }
}
```

## Performance Optimizations
- **Image Lazy Loading**: Coil/react-lazyload for images
- **Catalog Pagination**: Load items in batches
- **Memoization**: Expensive calculations cached
- **State Persistence**: Maintain scroll position
- **Progressive Loading**: Load essential content first

## SEO Considerations (Web)
- **Meta Tags**: Dynamic title, description, image
- **Structured Data**: Business schema markup
- **Open Graph**: Social media sharing optimization
- **URL Structure**: SEO-friendly shop URLs
- **Page Speed**: Optimized loading performance
