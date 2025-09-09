# Main Screen Documentation

## Purpose & Function
The Main Screen serves as the primary home screen and marketplace browser, displaying available shops/stores with search, filtering, and navigation capabilities. It's the central hub for customers to discover businesses.

## Screen Overview
- **File**: `MainScreen.kt`
- **Type**: Customer Home Screen
- **User Types**: All users (primary customer interface)

## UI Components & Layout

### Top App Bar
- **Title**: "MyHustle" app branding
- **Colors**: Background theme with custom colors
- **Actions**:
  - Shopping Cart icon (always visible)
  - Profile/Sign In button (conditional based on auth state)
  - More options dropdown (authenticated users)

### Authenticated User Menu
- **Profile Button**: Navigate to profile screen
- **Dropdown Menu**:
  - Store Management (for business owners)
  - Sign Out option
  - Each item has descriptive icons

### Unauthenticated User
- **Sign In Button**: Text button with person icon
- **Action**: Navigate to login screen

### Search & Filter Section
- **Search Bar**: Full-width search input
  - Location: Top of content area
  - Padding: 16dp horizontal, 8dp vertical
  - Placeholder: Search functionality

- **Filter Chips**: Horizontal scrollable row
  - **Basic Filters**: "All", "Featured", "Popular"
  - **Extended Filters**: "Coffee", "Tech", "Beauty", "Services", "Products", "Open Now"
  - **More Dropdown**: Additional filter options

### Shop Listing
- **Layout**: LazyColumn with cards
- **Item Spacing**: 12dp vertical spacing
- **Content Padding**: 16dp all sides

### Shop Cards (StoreCard Component)
Each shop displays:
- **Logo**: Circular image with shop logo
- **Name**: Shop/business name
- **Description**: Brief business description
- **Rating**: Star rating display
- **Hours**: Operating hours (24-hour format converted to 12-hour)
- **Favorite Toggle**: Heart icon for favorites
- **Click Action**: Navigate to shop profile

### Floating Action Button
- **Purpose**: Create new store
- **Position**: Bottom-right corner
- **Icon**: Add (+) symbol
- **Color**: Primary theme color
- **Action**: Navigate to store creation

### Loading States
- **Initial Load**: Centered circular progress indicator
- **Empty State**: Handled gracefully
- **Error Handling**: Repository-level error management

## Data Flow & State Management

### Repository Integration
```kotlin
val repository = ShopRepository.instance
val shops by repository.shops.collectAsState()
val isLoading by repository.isLoading.collectAsState()
```

### Local State Management
```kotlin
var query by rememberSaveable { mutableStateOf("") }
var selectedCategory by rememberSaveable { mutableStateOf("All") }
var showDropdownMenu by remember { mutableStateOf(false) }
var showMoreFiltersDropdown by remember { mutableStateOf(false) }
```

### Data Loading
- **Trigger**: LaunchedEffect(Unit) on screen composition
- **Method**: `repository.fetchShops()`
- **State**: Reactive updates via StateFlow

### Search & Filter Logic
```kotlin
val filteredShops = shops.filter { shop ->
    val matchesQuery = shop.name.contains(query, ignoreCase = true) || 
                      shop.description.contains(query, ignoreCase = true)
    val matchesCategory = when (selectedCategory) {
        "All" -> true
        "Featured" -> shop.isFavorite
        "Popular" -> shop.rating >= 4.5
        "Open Now" -> {
            // Complex time-based filtering logic
            // Compares current time with shop operating hours
        }
        // ... other category filters
    }
    matchesQuery && matchesCategory
}
```

## Data Models

### Shop Model
```kotlin
data class Shop(
    val id: String,
    val name: String,
    val description: String,
    val ownerId: String,
    val logoUrl: String,
    val rating: Double,
    val openTime24: String, // "08:00"
    val closeTime24: String, // "18:00"
    val isFavorite: Boolean,
    val catalog: List<CatalogItem>,
    // ... additional fields
)
```

### Filter Categories
```kotlin
val basicFilters = listOf("All", "Featured", "Popular")
val extendedFilters = listOf("Coffee", "Tech", "Beauty", "Services", "Products", "Open Now")
```

## API Integration

### Shop Repository Methods
- **fetchShops()**: Load all shops from Firestore
- **toggleFavorite(shopId)**: Update favorite status
- **shops**: StateFlow<List<Shop>>
- **isLoading**: StateFlow<Boolean>

### Firebase Collections
- **Collection**: `shops`
- **Real-time**: Uses Firestore listeners for live updates
- **Error Handling**: Repository handles network errors

## Business Logic

### Operating Hours Logic
- **Input**: 24-hour format strings ("08:00", "18:00")
- **Calculation**: Current time comparison
- **Edge Cases**: Midnight crossover (24:00), invalid formats
- **Display**: Conversion to 12-hour format for UI

### Category Filtering
- **Text-based**: Name/description search (case-insensitive)
- **Rating-based**: "Popular" = rating >= 4.5
- **Status-based**: "Featured" = isFavorite
- **Time-based**: "Open Now" = current time within operating hours
- **Type-based**: "Services" vs "Products" based on catalog items

### Favorite Management
- **Action**: Toggle favorite status
- **Persistence**: Stored in Firestore
- **UI Update**: Immediate state change + repository sync
- **Error Handling**: Rollback on failure

## User Interactions

### Primary Actions
1. **Search**: Type in search bar to filter results
2. **Category Filter**: Tap chips to filter by category
3. **Shop Selection**: Tap shop card to view profile
4. **Favorite Toggle**: Tap heart icon to favorite/unfavorite
5. **Create Store**: Tap FAB to create new business
6. **Sign In/Profile**: Tap user-related buttons
7. **Cart Access**: Tap shopping cart icon

### Navigation Flows
- **Shop Profile**: onStoreClick(shopId)
- **Create Store**: onCreateStoreClick()
- **Sign In**: onSignInClick()
- **Checkout**: onCheckoutClick()
- **Profile**: onProfileClick()
- **Store Management**: onStoreManagementClick()

## Web Implementation Notes

### React/Next.js Implementation
```jsx
import { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  TextField, 
  Chip, 
  Card, 
  CardContent,
  Fab,
  Grid,
  IconButton
} from '@mui/material';
import { ShoppingCart, Add, Person } from '@mui/icons-material';

const MainScreen = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { user } = useAuth();

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const shopData = await shopsAPI.getAll();
        setShops(shopData);
      } catch (error) {
        console.error('Error fetching shops:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  const filteredShops = shops.filter(shop => {
    const matchesQuery = shop.name.toLowerCase().includes(query.toLowerCase()) ||
                        shop.description.toLowerCase().includes(query.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || 
                           getCategoryFilter(selectedCategory)(shop);
    
    return matchesQuery && matchesCategory;
  });

  const getCategoryFilter = (category) => {
    switch (category) {
      case 'Featured':
        return (shop) => shop.isFavorite;
      case 'Popular':
        return (shop) => shop.rating >= 4.5;
      case 'Open Now':
        return (shop) => isShopOpen(shop);
      default:
        return () => true;
    }
  };

  const isShopOpen = (shop) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [openHour, openMin] = shop.openTime24.split(':').map(Number);
    const [closeHour, closeMin] = shop.closeTime24.split(':').map(Number);
    
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    return currentTime >= openTime && currentTime < closeTime;
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            MyHustle
          </Typography>
          <IconButton color="inherit">
            <ShoppingCart />
          </IconButton>
          {user ? (
            <IconButton color="inherit">
              <Person />
            </IconButton>
          ) : (
            <Button color="inherit">Sign In</Button>
          )}
        </Toolbar>
      </AppBar>

      <Container>
        <Box sx={{ my: 2 }}>
          <TextField
            fullWidth
            placeholder="Search shops..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ mb: 3 }}>
            {['All', 'Featured', 'Popular', 'Open Now'].map((category) => (
              <Chip
                key={category}
                label={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? 'filled' : 'outlined'}
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
        </Box>

        <Grid container spacing={2}>
          {filteredShops.map((shop) => (
            <Grid item xs={12} sm={6} md={4} key={shop.id}>
              <ShopCard shop={shop} />
            </Grid>
          ))}
        </Grid>
      </Container>

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <Add />
      </Fab>
    </Box>
  );
};

const ShopCard = ({ shop }) => {
  const [isFavorite, setIsFavorite] = useState(shop.isFavorite);

  const toggleFavorite = async () => {
    try {
      await shopsAPI.toggleFavorite(shop.id);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6">{shop.name}</Typography>
          <IconButton onClick={toggleFavorite}>
            {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {shop.description}
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
          <Rating value={shop.rating} precision={0.1} readOnly size="small" />
          <Typography variant="caption" sx={{ ml: 1 }}>
            {shop.rating}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {formatOperatingHours(shop.openTime24, shop.closeTime24)}
        </Typography>
      </CardContent>
    </Card>
  );
};
```

### State Management with Context
```jsx
// ShopsContext.js
export const ShopsProvider = ({ children }) => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchShops = useCallback(async () => {
    setLoading(true);
    try {
      const data = await shopsAPI.getAll();
      setShops(data);
    } catch (error) {
      console.error('Failed to fetch shops:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback(async (shopId) => {
    try {
      await shopsAPI.toggleFavorite(shopId);
      setShops(prev => prev.map(shop => 
        shop.id === shopId 
          ? {...shop, isFavorite: !shop.isFavorite}
          : shop
      ));
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      throw error;
    }
  }, []);

  const value = {
    shops,
    loading,
    fetchShops,
    toggleFavorite
  };

  return (
    <ShopsContext.Provider value={value}>
      {children}
    </ShopsContext.Provider>
  );
};
```

## Performance Considerations
- **Lazy Loading**: LazyColumn for large shop lists
- **State Persistence**: rememberSaveable for search/filter state
- **Debounced Search**: Prevent excessive filtering on every keystroke
- **Memoization**: Expensive filter calculations
- **Image Loading**: Lazy loading for shop logos
- **Pagination**: Consider for large datasets

## Accessibility Features
- **Content Descriptions**: All interactive elements
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper semantics
- **Color Contrast**: Sufficient contrast ratios
- **Text Scaling**: Support for larger text sizes
