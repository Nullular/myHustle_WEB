# Product Screen Documentation

## Purpose & Function
The Product Screen displays detailed information about a specific product including images, description, pricing, reviews, and purchase options. It enables customers to view product details and add items to their cart.

## Screen Overview
- **File**: `ProductScreen.kt`
- **Type**: E-commerce Product Detail Screen
- **User Types**: All users (customers purchasing products)

## UI Components & Layout

### Top App Bar
- **Back Button**: Arrow back icon to return to previous screen
- **Title**: Product name (truncated if necessary)
- **Actions**: Share and favorite buttons

### Product Image Gallery
- **Primary Image**: Large product image display
- **Image Carousel**: Horizontal scrolling for multiple images
- **Zoom Capability**: Touch/pinch to zoom (if implemented)
- **Placeholder**: Default image for missing product images

### Product Information Section
- **Product Name**: Large heading typography
- **Price Display**: Prominent price with currency formatting
- **Description**: Expandable product description
- **Specifications**: Key product details and features
- **Tags**: Category and feature chips

### Quantity Selection
- **Quantity Picker**: 
  - Minus button (decrease quantity)
  - Quantity display (current selected amount)
  - Plus button (increase quantity)
  - Minimum quantity: 1
  - Maximum: Based on inventory (if applicable)

### Action Buttons
- **Add to Cart**: Primary action button
  - Full width button
  - Loading state during cart operations
  - Success feedback animation

- **Buy Now**: Secondary action (if implemented)
  - Direct checkout flow
  - Skip cart addition

### Reviews Section
- **ReviewsPanel Component**: Integrated reviews display
- **Target Type**: ReviewTargetType.PRODUCT
- **Features**: View existing reviews, add new reviews
- **Rating Summary**: Average rating and review count

### Authentication Handling
- **Guest Users**: Prompt to sign in for cart operations
- **Login Button**: Navigate to login screen
- **Persistent Cart**: Maintain cart state across sessions

## Data Flow & State Management

### Product Data Loading
```kotlin
LaunchedEffect(itemId) {
    isLoading = true
    try {
        productRepository.getProductById(itemId).onSuccess { productData ->
            product = productData
            isLoading = false
        }.onFailure { error ->
            errorMessage = "Failed to load product: ${error.message}"
            isLoading = false
        }
    } catch (e: Exception) {
        errorMessage = "Error loading product: ${e.message}"
        isLoading = false
    }
}
```

### Local State Management
```kotlin
var product by remember { mutableStateOf<Product?>(null) }
var isLoading by remember { mutableStateOf(true) }
var errorMessage by remember { mutableStateOf<String?>(null) }
var quantity by remember { mutableIntStateOf(1) }
var isAddingToCart by remember { mutableStateOf(false) }
var isFavorite by remember { mutableStateOf(false) }
```

### Cart Integration
- **Repository**: CartRepository.instance
- **Methods**: addToCart(), getCartItems()
- **Real-time Updates**: StateFlow reactive updates
- **Error Handling**: Network and validation errors

## Data Models

### Product Model
```kotlin
data class Product(
    val id: String,
    val name: String,
    val description: String,
    val price: Double,
    val imageUrls: List<String>,
    val primaryImageUrl: String,
    val category: String,
    val tags: List<String>,
    val inStock: Boolean,
    val stockQuantity: Int?,
    val shopId: String,
    val shopName: String,
    val shopOwnerId: String,
    val rating: Double,
    val reviewCount: Int,
    val specifications: Map<String, String>,
    val weight: String?,
    val dimensions: String?,
    val createdAt: Timestamp,
    val updatedAt: Timestamp
)
```

### Cart Item Model
```kotlin
data class CartItem(
    val productId: String,
    val productName: String,
    val productImage: String,
    val price: Double,
    val quantity: Int,
    val shopId: String,
    val shopName: String
)
```

## API Integration

### ProductRepository Methods
- **getProductById(id)**: Fetch single product
- **toggleFavorite(id)**: Update favorite status
- **Error Handling**: Result<T> pattern for success/failure

### CartRepository Methods
- **addToCart(product, quantity)**: Add item to cart
- **cartItems**: StateFlow<List<CartItem>>
- **Validation**: Stock availability, quantity limits

### Firebase Integration
- **Collection**: `products`
- **Document Structure**: Individual product documents
- **Real-time**: Optional live updates for stock/pricing
- **Security**: Read permissions, write restrictions

## Business Logic

### Quantity Validation
```kotlin
val maxQuantity = product.stockQuantity ?: 99
val minQuantity = 1

fun updateQuantity(newQuantity: Int) {
    quantity = newQuantity.coerceIn(minQuantity, maxQuantity)
}
```

### Add to Cart Logic
```kotlin
suspend fun addToCart() {
    if (currentUser == null) {
        onLoginClick?.invoke()
        return
    }
    
    isAddingToCart = true
    try {
        val cartItem = CartItem(
            productId = product.id,
            productName = product.name,
            productImage = product.primaryImageUrl,
            price = product.price,
            quantity = quantity,
            shopId = product.shopId,
            shopName = product.shopName
        )
        
        cartRepository.addToCart(cartItem)
        // Show success feedback
    } catch (e: Exception) {
        // Handle error
    } finally {
        isAddingToCart = false
    }
}
```

### Price Calculation
- **Base Price**: product.price
- **Quantity Multiplier**: price * quantity
- **Tax Calculation**: Based on user location (if applicable)
- **Currency Formatting**: Locale-specific formatting

## User Interactions

### Primary Actions
1. **View Product Images**: Swipe through image gallery
2. **Adjust Quantity**: Use +/- buttons to change quantity
3. **Add to Cart**: Add product to shopping cart
4. **View Reviews**: Scroll to reviews section
5. **Add Review**: Create new product review
6. **Share Product**: Share product link
7. **Favorite Toggle**: Add/remove from favorites

### Navigation Actions
- **Back**: Return to previous screen (store profile/search)
- **Login**: Navigate to authentication (for guest users)
- **Checkout**: Navigate to cart/checkout (after adding)

### Error Handling
- **Loading States**: Show progress indicators
- **Network Errors**: Display retry options
- **Validation Errors**: Inline error messages
- **Authentication**: Prompt for login when required

## Web Implementation Notes

### React/Next.js Implementation
```jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Card,
  CardMedia,
  Rating,
  Chip,
  TextField,
  Alert
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Remove,
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  Share
} from '@mui/icons-material';

const ProductScreen = () => {
  const router = useRouter();
  const { productId } = router.query;
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await productsAPI.getById(productId);
        setProduct(productData);
        setIsFavorite(productData.isFavorite);
      } catch (error) {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart({
        productId: product.id,
        productName: product.name,
        productImage: product.primaryImageUrl,
        price: product.price,
        quantity: quantity,
        shopId: product.shopId,
        shopName: product.shopName
      });
      
      // Show success message or redirect to cart
      router.push('/cart');
    } catch (error) {
      setError('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const updateQuantity = (newQuantity) => {
    const maxQty = product.stockQuantity || 99;
    setQuantity(Math.max(1, Math.min(newQuantity, maxQty)));
  };

  const toggleFavorite = async () => {
    try {
      await productsAPI.toggleFavorite(productId);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!product) return <NotFoundMessage />;

  return (
    <Container>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => router.back()}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, ml: 1 }}>
          {product.name}
        </Typography>
        <IconButton onClick={toggleFavorite}>
          {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
        </IconButton>
        <IconButton>
          <Share />
        </IconButton>
      </Box>

      {/* Product Image */}
      <Card sx={{ mb: 3 }}>
        <CardMedia
          component="img"
          height="300"
          image={product.primaryImageUrl}
          alt={product.name}
        />
      </Card>

      {/* Product Info */}
      <Typography variant="h4" gutterBottom>
        {product.name}
      </Typography>
      
      <Typography variant="h5" color="primary" gutterBottom>
        ${product.price.toFixed(2)}
      </Typography>

      {/* Rating */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Rating value={product.rating} readOnly />
        <Typography sx={{ ml: 1 }}>
          ({product.reviewCount} reviews)
        </Typography>
      </Box>

      {/* Tags */}
      <Box sx={{ mb: 3 }}>
        {product.tags.map((tag) => (
          <Chip key={tag} label={tag} sx={{ mr: 1, mb: 1 }} />
        ))}
      </Box>

      {/* Description */}
      <Typography variant="body1" paragraph>
        {product.description}
      </Typography>

      {/* Quantity Selector */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ mr: 2 }}>
          Quantity:
        </Typography>
        <IconButton 
          onClick={() => updateQuantity(quantity - 1)}
          disabled={quantity <= 1}
        >
          <Remove />
        </IconButton>
        <Typography sx={{ mx: 2, minWidth: 30, textAlign: 'center' }}>
          {quantity}
        </Typography>
        <IconButton 
          onClick={() => updateQuantity(quantity + 1)}
          disabled={quantity >= (product.stockQuantity || 99)}
        >
          <Add />
        </IconButton>
      </Box>

      {/* Add to Cart Button */}
      <Button
        variant="contained"
        size="large"
        fullWidth
        startIcon={<ShoppingCart />}
        onClick={handleAddToCart}
        disabled={addingToCart || !product.inStock}
        sx={{ mb: 3 }}
      >
        {addingToCart ? 'Adding to Cart...' : 
         !product.inStock ? 'Out of Stock' : 
         `Add to Cart - $${(product.price * quantity).toFixed(2)}`}
      </Button>

      {/* Shop Info */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Sold by {product.shopName}
        </Typography>
        <Button 
          onClick={() => router.push(`/shop/${product.shopId}`)}
          variant="outlined"
        >
          Visit Store
        </Button>
      </Card>

      {/* Reviews Section */}
      <ReviewsSection productId={productId} />
    </Container>
  );
};
```

### Shopping Cart Context
```jsx
// CartContext.js
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const addToCart = useCallback(async (item) => {
    setLoading(true);
    try {
      // Check if item already exists in cart
      const existingIndex = cartItems.findIndex(
        cartItem => cartItem.productId === item.productId
      );

      if (existingIndex >= 0) {
        // Update quantity
        const updatedItems = [...cartItems];
        updatedItems[existingIndex].quantity += item.quantity;
        setCartItems(updatedItems);
      } else {
        // Add new item
        setCartItems(prev => [...prev, item]);
      }

      // Persist to backend/localStorage
      await cartAPI.updateCart(cartItems);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [cartItems]);

  const removeFromCart = useCallback(async (productId) => {
    const updatedItems = cartItems.filter(item => item.productId !== productId);
    setCartItems(updatedItems);
    await cartAPI.updateCart(updatedItems);
  }, [cartItems]);

  const getTotalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    getTotalPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
```

## Performance Considerations
- **Image Optimization**: WebP format, multiple sizes
- **Lazy Loading**: Reviews and related products
- **Caching**: Product data caching
- **Debounced Updates**: Quantity changes
- **Progressive Enhancement**: Core functionality first

## Accessibility Features
- **Screen Reader Support**: Proper ARIA labels
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: Sufficient contrast ratios
- **Focus Management**: Logical focus order
- **Alternative Text**: Descriptive image alt text

## Testing Scenarios
- Product loading (success/failure)
- Quantity validation (min/max limits)
- Cart operations (add/update/remove)
- Authentication flow (guest users)
- Network error handling
- Loading state management
