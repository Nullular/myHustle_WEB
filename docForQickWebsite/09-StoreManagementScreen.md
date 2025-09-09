# Store Management Screen Documentation

## Purpose & Function
The Store Management Screen serves as the main dashboard for business owners to manage their store operations. It provides access to all business management functions including bookings, orders, inventory, analytics, and content management.

## Screen Overview
- **File**: `StoreManagementScreen.kt` (located in `ui/screens/business/`)
- **Type**: Business Management Dashboard
- **User Types**: Business owners and administrators

## UI Components & Layout

### Top App Bar (ColoredTopBar)
- **Back Button**: Navigate to home/previous screen
- **Title**: "Store Management" or business name
- **Background**: Branded color scheme
- **System Back Handling**: BackHandler for gesture navigation

### Management Options Grid
- **Layout**: LazyColumn with management option cards
- **Card Design**: Material Design cards with:
  - Icon (left side)
  - Title (primary text)
  - Description (secondary text)
  - Color coding for different functions
  - Click interaction with ripple effect

### Management Option Categories

#### 1. Customer Interaction
- **Booking Management**
  - Icon: CalendarToday
  - Color: Purple (#9C27B0)
  - Function: Manage customer bookings and requests

- **Order Management**
  - Icon: ShoppingCart
  - Color: Blue (#2196F3)
  - Function: Manage customer orders and deliveries

#### 2. Content Management
- **Add Product**
  - Icon: Add
  - Color: Primary theme color
  - Function: Add new products to inventory

- **Add Service**
  - Icon: Build
  - Color: Blue accent
  - Function: Create new service offerings

#### 3. Business Operations
- **Inventory Management**
  - Icon: Inventory
  - Color: Secondary theme color
  - Function: Manage stock levels and product details

- **Analytics**
  - Icon: Analytics/BarChart
  - Color: Green accent
  - Function: View business performance metrics

- **Accounting**
  - Icon: AccountBalance
  - Color: Teal accent
  - Function: Financial tracking and reports

## Data Flow & State Management

### Props and Parameters
```kotlin
@Composable
fun StoreManagementScreen(
    shopId: String? = null,
    onBack: () -> Unit = {},
    onAddProductClick: (String?) -> Unit = {},
    onAddServiceClick: (String?) -> Unit = {},
    onInventoryClick: () -> Unit = {},
    onAnalyticsClick: () -> Unit = {},
    onAccountingClick: () -> Unit = {},
    onBookingManagementClick: () -> Unit = {},
    onOrderManagementClick: () -> Unit = {}
)
```

### Management Option Model
```kotlin
data class ManagementOption(
    val id: String,
    val title: String,
    val description: String,
    val icon: ImageVector,
    val color: Color,
    val onClick: () -> Unit
)
```

### Navigation Actions
- Each management option triggers specific navigation callback
- ShopId is passed to relevant functions (Add Product/Service)
- Debug logging for navigation tracking

## Business Logic

### Navigation Flow
```kotlin
val managementOptions = listOf(
    ManagementOption(
        id = "booking_management",
        title = "Booking Management",
        description = "Manage customer bookings and requests",
        icon = Icons.Filled.CalendarToday,
        color = Color(0xFF9C27B0),
        onClick = onBookingManagementClick
    ),
    ManagementOption(
        id = "order_management",
        title = "Order Management", 
        description = "Manage customer orders and deliveries",
        icon = Icons.Filled.ShoppingCart,
        color = Color(0xFF2196F3),
        onClick = {
            Log.d("OrderNavDebug", "Order Management clicked!")
            onOrderManagementClick()
        }
    ),
    // ... additional options
)
```

### Access Control
- **Authentication Check**: Verify user is business owner
- **Shop Ownership**: Validate user owns the shop being managed
- **Permission Levels**: Different access for admins vs owners

### Feature Availability
- **Conditional Display**: Show/hide options based on subscription tier
- **Beta Features**: Flag new features for testing
- **Regional Features**: Enable/disable based on location

## User Interactions

### Primary Actions
1. **Navigate to Booking Management**: View and manage customer appointments
2. **Navigate to Order Management**: Handle product orders and fulfillment
3. **Add New Product**: Create product listings
4. **Add New Service**: Create service offerings
5. **View Inventory**: Manage stock and product details
6. **View Analytics**: Business performance insights
7. **View Accounting**: Financial reports and tracking
8. **Back Navigation**: Return to home screen

### Secondary Actions
- **Quick Actions**: Common tasks from dashboard
- **Settings**: Store configuration options
- **Help**: Documentation and support links

### Visual Feedback
- **Card Elevation**: Hover/press feedback
- **Color Coding**: Visual categorization
- **Loading States**: Progress indicators for navigation

## Web Implementation Notes

### React/Next.js Implementation
```jsx
import { useRouter } from 'next/router';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import {
  ArrowBack,
  CalendarToday,
  ShoppingCart,
  Add,
  Build,
  Inventory,
  Analytics,
  AccountBalance
} from '@mui/icons-material';

const StoreManagementScreen = () => {
  const router = useRouter();
  const { shopId } = router.query;
  const { user } = useAuth();

  const managementOptions = [
    {
      id: 'booking_management',
      title: 'Booking Management',
      description: 'Manage customer bookings and requests',
      icon: CalendarToday,
      color: '#9C27B0',
      path: `/business/bookings/${shopId}`
    },
    {
      id: 'order_management',
      title: 'Order Management',
      description: 'Manage customer orders and deliveries',
      icon: ShoppingCart,
      color: '#2196F3',
      path: `/business/orders/${shopId}`
    },
    {
      id: 'add_product',
      title: 'Add Product',
      description: 'Add new products to your inventory',
      icon: Add,
      color: '#1976D2',
      path: `/business/products/add?shopId=${shopId}`
    },
    {
      id: 'add_service',
      title: 'Add Service',
      description: 'Create new service offerings',
      icon: Build,
      color: '#0288D1',
      path: `/business/services/add?shopId=${shopId}`
    },
    {
      id: 'inventory',
      title: 'Inventory Management',
      description: 'Manage stock levels and product details',
      icon: Inventory,
      color: '#388E3C',
      path: `/business/inventory/${shopId}`
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View business performance metrics',
      icon: Analytics,
      color: '#F57C00',
      path: `/business/analytics/${shopId}`
    },
    {
      id: 'accounting',
      title: 'Accounting',
      description: 'Financial tracking and reports',
      icon: AccountBalance,
      color: '#00796B',
      path: `/business/accounting/${shopId}`
    }
  ];

  const handleOptionClick = (option) => {
    router.push(option.path);
  };

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <Container>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => router.back()}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ ml: 2 }}>
          Store Management
        </Typography>
      </Box>

      {/* Management Options Grid */}
      <Grid container spacing={3}>
        {managementOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <Grid item xs={12} sm={6} md={4} key={option.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardActionArea 
                  onClick={() => handleOptionClick(option)}
                  sx={{ height: '100%', p: 2 }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        backgroundColor: option.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2
                      }}
                    >
                      <IconComponent 
                        sx={{ 
                          fontSize: 32, 
                          color: 'white' 
                        }} 
                      />
                    </Box>
                    
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ 
                        fontWeight: 'bold',
                        color: 'text.primary'
                      }}
                    >
                      {option.title}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                    >
                      {option.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Quick Stats Section (Optional) */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Quick Overview
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  12
                </Typography>
                <Typography variant="body2">
                  Pending Bookings
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="secondary">
                  8
                </Typography>
                <Typography variant="body2">
                  New Orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  $1,234
                </Typography>
                <Typography variant="body2">
                  Today's Revenue
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  5
                </Typography>
                <Typography variant="body2">
                  Low Stock Items
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};
```

### Business Dashboard Hook
```javascript
// useBusiness.js
import { useState, useEffect } from 'react';

export const useBusiness = (shopId) => {
  const [businessData, setBusinessData] = useState(null);
  const [stats, setStats] = useState({
    pendingBookings: 0,
    newOrders: 0,
    todayRevenue: 0,
    lowStockItems: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessData = async () => {
      if (!shopId) return;
      
      try {
        const [business, businessStats] = await Promise.all([
          businessAPI.getById(shopId),
          businessAPI.getStats(shopId)
        ]);
        
        setBusinessData(business);
        setStats(businessStats);
      } catch (error) {
        console.error('Error fetching business data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();

    // Set up real-time updates for stats
    const unsubscribe = businessAPI.subscribeToStats(shopId, setStats);
    return () => unsubscribe && unsubscribe();
  }, [shopId]);

  return {
    businessData,
    stats,
    loading
  };
};
```

### Permission-based Navigation
```jsx
const ManagementOptionCard = ({ option, userPermissions }) => {
  const hasPermission = userPermissions.includes(option.permission);
  
  return (
    <Card 
      sx={{ 
        opacity: hasPermission ? 1 : 0.5,
        pointerEvents: hasPermission ? 'auto' : 'none'
      }}
    >
      <CardActionArea disabled={!hasPermission}>
        {/* Card content */}
        {!hasPermission && (
          <Box sx={{ 
            position: 'absolute', 
            top: 8, 
            right: 8,
            backgroundColor: 'error.main',
            color: 'white',
            borderRadius: 1,
            px: 1,
            py: 0.5
          }}>
            <Typography variant="caption">
              Premium
            </Typography>
          </Box>
        )}
      </CardActionArea>
    </Card>
  );
};
```

## Security Considerations
- **Authentication**: Verify user is logged in
- **Authorization**: Check user owns the business
- **Permission Levels**: Different access for different roles
- **API Security**: Secure backend endpoints
- **Data Validation**: Validate shop ownership on server

## Performance Considerations
- **Lazy Loading**: Load dashboard data on demand
- **Caching**: Cache business statistics
- **Real-time Updates**: Efficient WebSocket connections
- **Progressive Enhancement**: Core functionality first

## Analytics Integration
- **Usage Tracking**: Track which management features are used
- **Performance Monitoring**: Monitor load times
- **Error Tracking**: Log navigation errors
- **User Behavior**: Understand management workflows

## Accessibility Features
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels
- **Focus Management**: Logical tab order
- **Touch Targets**: Sufficient button sizes
- **Color Independence**: Don't rely solely on color coding
