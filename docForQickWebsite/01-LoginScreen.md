# Login Screen Documentation

## Purpose & Function
The Login Screen provides user authentication functionality, allowing existing users to sign into their MyHustle accounts using email and password credentials.

## Screen Overview
- **File**: `LoginScreen.kt`
- **Type**: Authentication Screen
- **User Types**: All (Customers, Business Owners, Admins)

## UI Components & Layout

### Visual Design
- **Background**: Gradient background (Primary to Blue Accent colors)
- **Layout**: Centered card design with branding
- **Theme**: Material Design 3 with custom HustleColors

### Header Section
- **App Logo**: "MyHustle" text (48sp, bold)
- **Welcome Message**: "Welcome Back!" subtitle
- **Styling**: White text on gradient background

### Login Form Card
- **Container**: Material Card with elevation and rounded corners
- **Background**: Surface color with 8dp elevation
- **Padding**: 24dp internal padding

### Form Fields
1. **Email Field**
   - Type: OutlinedTextField
   - Validation: Email format
   - Icon: Email icon (leading)
   - Keyboard: Email input type
   - Auto-clear error on change

2. **Password Field**
   - Type: OutlinedTextField (password)
   - Icon: Lock icon (leading)
   - Toggle: Show/hide password (trailing icon)
   - Keyboard: Password input type
   - Visual transformation: Password masking

### Action Buttons
1. **Sign In Button**
   - Type: Primary button (full width, 48dp height)
   - Color: Primary theme color
   - Loading State: Shows CircularProgressIndicator
   - Validation: Requires both fields filled

2. **Sign Up Link**
   - Type: TextButton
   - Layout: Horizontal row with descriptive text
   - Action: Navigate to SignUp screen

### Error Handling
- **Error Display**: Red text below form fields
- **Error Types**: Validation errors, authentication failures
- **Auto-clear**: Errors clear when user starts typing

## Data Flow & State Management

### Local State
```kotlin
var email by remember { mutableStateOf("") }
var password by remember { mutableStateOf("") }
var passwordVisible by remember { mutableStateOf(false) }
var errorMessage by remember { mutableStateOf<String?>(null) }
```

### Authentication State
- **ViewModel**: AuthViewModel
- **Loading State**: `isLoading.collectAsState()`
- **User State**: `currentUser.collectAsState()`

### Navigation Flow
1. User enters credentials
2. Validation checks (client-side)
3. AuthViewModel.signIn() called
4. Firebase Authentication processing
5. Success: Navigate to main app
6. Failure: Display error message

## Data Models

### Input Data
- **Email**: String (email format validation)
- **Password**: String (minimum length validation)

### Authentication Response
- **Success**: FirebaseUser object
- **Failure**: Error message string

## API Integration

### Firebase Authentication
- **Method**: `signInWithEmailAndPassword()`
- **Parameters**: email, password
- **Response**: FirebaseUser or Exception

### Error Handling
- Invalid credentials
- Network errors
- Account disabled
- Too many attempts

## Business Logic

### Validation Rules
1. **Email**: Must be valid email format
2. **Password**: Cannot be empty
3. **Both fields**: Must be filled before submission

### Authentication Flow
1. Client-side validation
2. Firebase authentication request
3. Success handling (navigation)
4. Error handling (display message)

## User Interactions

### Primary Actions
- **Type in email field**: Update email state, clear errors
- **Type in password field**: Update password state, clear errors
- **Toggle password visibility**: Show/hide password text
- **Tap Sign In**: Validate and attempt authentication
- **Tap Sign Up link**: Navigate to registration screen

### Accessibility
- Content descriptions for icons
- Keyboard navigation support
- Screen reader compatibility

## Web Implementation Notes

### React/Next.js Implementation
```jsx
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  IconButton,
  InputAdornment 
} from '@mui/material';

const LoginScreen = ({ onNavigateToSignUp, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="login-container">
      <Card className="login-card">
        <CardContent>
          <Typography variant="h4">MyHustle</Typography>
          <Typography variant="h6">Welcome Back!</Typography>
          
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
            />
            
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            {error && <Typography color="error">{error}</Typography>}
            
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              size="large"
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </form>
          
          <Button onClick={onNavigateToSignUp}>
            Don't have an account? Sign Up
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};
```

### CSS Styling (Tailwind CSS)
```css
.login-container {
  @apply min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex items-center justify-center p-6;
}

.login-card {
  @apply w-full max-w-md bg-white rounded-lg shadow-lg;
}
```

### State Management (Redux Toolkit)
```javascript
// authSlice.js
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null
  },
  reducers: {
    signInStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    signInSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload;
    },
    signInFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});
```

## Testing Considerations
- Form validation edge cases
- Network error handling
- Loading state display
- Navigation flow
- Accessibility compliance
- Cross-browser compatibility

## Performance Notes
- Minimal re-renders with proper state management
- Lazy loading of authentication components
- Debounced validation
- Optimized error handling
