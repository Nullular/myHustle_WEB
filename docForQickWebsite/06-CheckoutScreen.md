# Checkout Screen Documentation

## Purpose & Function
The Checkout Screen displays the shopping cart contents, calculates totals including delivery fees, and processes the final purchase transaction. It provides cart management and order completion functionality.

## Screen Overview
- **File**: `CheckoutScreen.kt`
- **Type**: E-commerce Checkout Screen
- **User Types**: Authenticated customers with cart items

## UI Components & Layout

### Top App Bar
- **Back Button**: Arrow back icon to return to previous screen
- **Title**: "Checkout" or "Your Cart"
- **Background**: Standard app bar styling

### Cart Items Section
- **Layout**: LazyColumn with cart item cards
- **Empty State**: Message when cart is empty
- **Loading State**: Progress indicator during operations

### Cart Item Cards
Each item displays:
- **Product Image**: Thumbnail image (64dp circular)
- **Product Name**: Primary text
- **Shop Name**: Secondary text
- **Price**: Individual item price
- **Quantity**: Current quantity
- **Subtotal**: Price × quantity calculation
- **Remove Button**: Delete icon to remove item

### Order Summary Section
- **Subtotal**: Sum of all cart items
- **Delivery Fee**: Fixed fee ($2.99 as shown in code)
- **Tax**: Calculated based on location (if applicable)
- **Total**: Final amount to be charged
- **Styling**: Neumorphic cards with elevated appearance

### Checkout Button
- **Primary Action**: Process order button
- **Full Width**: Spans entire container width
- **Loading State**: Shows progress during processing
- **Disabled State**: When cart is empty or processing
- **Success State**: Confirmation feedback

### Error Handling
- **Error Messages**: Display checkout failures
- **Network Issues**: Retry functionality
- **Validation Errors**: Inline error display
- **User Feedback**: Clear error communication

## Data Flow & State Management

### Repository Integration
```kotlin
val cartRepository = CartRepository.instance
val checkoutService = CheckoutService.instance
val cartItems by cartRepository.cartItems.collectAsState()
val cartTotal by cartRepository.totalPrice.collectAsState()
```

### Local State Management
```kotlin
var isProcessingCheckout by remember { mutableStateOf(false) }
var checkoutError by remember { mutableStateOf<String?>(null) }
var shouldTriggerCheckout by remember { mutableStateOf(false) }
var checkoutSuccess by remember { mutableStateOf(false) }
```

### Checkout Flow
```kotlin
LaunchedEffect(shouldTriggerCheckout) {
    if (shouldTriggerCheckout && cartItems.isNotEmpty() && !isProcessingCheckout) {
        isProcessingCheckout = true
        checkoutError = null
        shouldTriggerCheckout = false
        
        checkoutService.processCheckoutAsync(
            onSuccess = { checkoutResult ->
                if (checkoutResult.success) {
                    checkoutSuccess = true
                } else {
                    checkoutError = checkoutResult.message
                    isProcessingCheckout = false
                }
            },
            onFailure = { exception ->
                checkoutError = exception.message ?: "Checkout failed"
                isProcessingCheckout = false
            }
        )
    }
}
```

### Cart Management
- **Real-time Updates**: StateFlow reactivity
- **Item Removal**: Individual item deletion
- **Quantity Updates**: Modify item quantities
- **Total Calculation**: Automatic price updates

## Data Models

### CartItem Model
```kotlin
data class CartItem(
    val productId: String,
    val productName: String,
    val productImage: String,
    val price: Double,
    val quantity: Int,
    val shopId: String,
    val shopName: String,
    val subtotal: Double = price * quantity
)
```

### CheckoutResult Model
```kotlin
data class CheckoutResult(
    val success: Boolean,
    val orderId: String?,
    val message: String,
    val totalAmount: Double,
    val items: List<CartItem>
)
```

### Order Summary Model
```kotlin
data class OrderSummary(
    val subtotal: Double,
    val deliveryFee: Double = 2.99,
    val tax: Double = 0.0,
    val total: Double = subtotal + deliveryFee + tax
)
```

## API Integration

### CartRepository Methods
- **cartItems**: StateFlow<List<CartItem>>
- **totalPrice**: StateFlow<Double>
- **refreshCart()**: Reload cart data
- **removeItem(productId)**: Remove specific item
- **clearCart()**: Empty entire cart

### CheckoutService Methods
- **processCheckoutAsync()**: Asynchronous checkout processing
- **calculateTotals()**: Price and fee calculations
- **createOrder()**: Generate order record
- **processPayment()**: Handle payment processing

### Firebase Integration
- **Orders Collection**: Store completed orders
- **Cart Collection**: User-specific cart data
- **Inventory Updates**: Reduce stock quantities
- **Transaction Logging**: Order history tracking

## Business Logic

### Price Calculations
```kotlin
val subtotal = cartItems.sumOf { it.price * it.quantity }
val deliveryFee = 2.99 // Fixed delivery fee
val tax = subtotal * 0.08 // 8% tax rate (configurable)
val total = subtotal + deliveryFee + tax
```

### Checkout Process
1. **Validation**: Verify cart contents and user authentication
2. **Inventory Check**: Confirm product availability
3. **Price Calculation**: Calculate final totals
4. **Payment Processing**: Handle payment method
5. **Order Creation**: Generate order record
6. **Cart Clearing**: Empty user's cart
7. **Confirmation**: Display success message

### Error Scenarios
- Empty cart attempts
- Insufficient inventory
- Payment failures
- Network connectivity issues
- User authentication problems

## User Interactions

### Primary Actions
1. **View Cart Items**: Scroll through cart contents
2. **Remove Items**: Delete specific products from cart
3. **Update Quantities**: Modify item quantities (if implemented)
4. **Process Checkout**: Complete purchase transaction
5. **Back Navigation**: Return to shopping/previous screen

### Secondary Actions
- **Continue Shopping**: Navigate back to store browsing
- **View Product Details**: Navigate to product pages
- **Contact Support**: Help with checkout issues
- **Save for Later**: Move items to wishlist (if implemented)

### Feedback & Confirmation
- **Loading Indicators**: Visual feedback during processing
- **Success Messages**: Order confirmation
- **Error Messages**: Clear problem descriptions
- **Navigation**: Automatic redirect after success

## Web Implementation Notes

### React/Next.js Implementation
```jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar
} from '@mui/material';
import { ArrowBack, Delete } from '@mui/icons-material';

const CheckoutScreen = () => {
  const router = useRouter();
  const { cartItems, removeFromCart, getTotalPrice, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const deliveryFee = 2.99;
  const subtotal = getTotalPrice();
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setProcessing(true);
    setError('');
    
    try {
      const orderData = {
        items: cartItems,
        subtotal,
        deliveryFee,
        tax,
        total,
        timestamp: new Date()
      };

      const result = await checkoutAPI.processOrder(orderData);
      
      if (result.success) {
        // Clear cart and redirect to confirmation
        await clearCart();
        router.push(`/order-confirmation/${result.orderId}`);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to process order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      setError('Failed to remove item');
    }
  };

  if (cartItems.length === 0 && !processing) {
    return (
      <Container>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => router.push('/')}
            sx={{ mt: 2 }}
          >
            Continue Shopping
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => router.back()}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ ml: 2 }}>
          Checkout
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Cart Items */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Order Items
          </Typography>
          <List>
            {cartItems.map((item, index) => (
              <ListItem 
                key={item.productId}
                divider={index < cartItems.length - 1}
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    onClick={() => handleRemoveItem(item.productId)}
                    disabled={processing}
                  >
                    <Delete />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar 
                    src={item.productImage} 
                    alt={item.productName}
                    sx={{ width: 56, height: 56 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={item.productName}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {item.shopName}
                      </Typography>
                      <Typography variant="body2">
                        ${item.price} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Order Summary
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Subtotal</Typography>
            <Typography>${subtotal.toFixed(2)}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Delivery Fee</Typography>
            <Typography>${deliveryFee.toFixed(2)}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography>Tax</Typography>
            <Typography>${tax.toFixed(2)}</Typography>
          </Box>
          
          <Divider />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Typography variant="h6">Total</Typography>
            <Typography variant="h6" color="primary">
              ${total.toFixed(2)}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Checkout Button */}
      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={handleCheckout}
        disabled={processing || cartItems.length === 0}
        sx={{ mb: 4 }}
      >
        {processing ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={24} sx={{ mr: 1 }} />
            Processing...
          </Box>
        ) : (
          `Complete Order - $${total.toFixed(2)}`
        )}
      </Button>
    </Container>
  );
};
```

### Checkout Service Integration
```javascript
// checkoutService.js
class CheckoutService {
  async processOrder(orderData) {
    try {
      // Validate cart items
      await this.validateCartItems(orderData.items);
      
      // Process payment (integrate with Stripe/PayPal)
      const paymentResult = await this.processPayment(orderData);
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.error);
      }
      
      // Create order record
      const order = await this.createOrderRecord(orderData, paymentResult);
      
      // Update inventory
      await this.updateInventory(orderData.items);
      
      // Send confirmation email
      await this.sendOrderConfirmation(order);
      
      return {
        success: true,
        orderId: order.id,
        message: 'Order processed successfully'
      };
      
    } catch (error) {
      console.error('Checkout error:', error);
      return {
        success: false,
        message: error.message || 'Failed to process order'
      };
    }
  }
  
  async validateCartItems(items) {
    // Check inventory availability
    for (const item of items) {
      const product = await productsAPI.getById(item.productId);
      if (!product.inStock || product.stockQuantity < item.quantity) {
        throw new Error(`${item.productName} is no longer available`);
      }
    }
  }
  
  async processPayment(orderData) {
    // Integrate with payment processor
    // This is a simplified example
    return {
      success: true,
      transactionId: 'txn_' + Date.now(),
      amount: orderData.total
    };
  }
}

export const checkoutService = new CheckoutService();
```

## Security Considerations
- **Payment Security**: PCI DSS compliance
- **Data Validation**: Server-side validation
- **Authentication**: Verify user session
- **Inventory Locking**: Prevent overselling
- **Transaction Logging**: Audit trail
- **Error Handling**: Don't expose sensitive information

## Testing Requirements
- Empty cart scenarios
- Payment processing flows
- Inventory validation
- Error handling (network, payment failures)
- Loading state management
- Order confirmation
- Cart state consistency

## Performance Optimizations
- **Lazy Loading**: Order history
- **Debounced Updates**: Cart modifications
- **Optimistic Updates**: UI responsiveness
- **Caching**: Product information
- **Progressive Enhancement**: Core functionality first
