# Sign Up Screen Documentation

## Purpose & Function
The Sign Up Screen allows new users to create MyHustle accounts with email and password, including password confirmation validation and user type selection.

## Screen Overview
- **File**: `SignUpScreen.kt`
- **Type**: Authentication Screen
- **User Types**: All prospective users (Customers, Business Owners)

## UI Components & Layout

### Visual Design
- **Background**: Same gradient as Login Screen (Primary to Blue Accent)
- **Layout**: Centered card design with branding
- **Theme**: Material Design 3 with custom HustleColors

### Header Section
- **App Logo**: "MyHustle" text (48sp, bold)
- **Welcome Message**: "Join the Hustle!" subtitle
- **Styling**: White text on gradient background

### Registration Form Card
- **Container**: Material Card with elevation and rounded corners
- **Background**: Surface color with 8dp elevation
- **Padding**: 24dp internal padding

### Form Fields
1. **Email Field**
   - Type: OutlinedTextField
   - Validation: Email format validation
   - Icon: Email icon (leading)
   - Keyboard: Email input type
   - Real-time validation feedback

2. **Password Field**
   - Type: OutlinedTextField (password)
   - Icon: Lock icon (leading)
   - Toggle: Show/hide password (trailing icon)
   - Validation: Minimum 6 characters
   - Visual transformation: Password masking

3. **Confirm Password Field**
   - Type: OutlinedTextField (password)
   - Icon: Lock icon (leading)
   - Toggle: Show/hide password (trailing icon)
   - Validation: Must match password
   - Visual transformation: Password masking

### Action Buttons
1. **Sign Up Button**
   - Type: Primary button (full width, 48dp height)
   - Color: Primary theme color
   - Loading State: Shows CircularProgressIndicator
   - Validation: All fields must be valid

2. **Login Link**
   - Type: TextButton
   - Layout: Horizontal row with descriptive text
   - Action: Navigate to Login screen

### Error Handling & Validation
- **Real-time validation**: Form validation on field changes
- **Error Display**: Red text below form fields
- **Validation Rules**:
  - Email: Valid email format required
  - Password: Minimum 6 characters
  - Confirm Password: Must match password field

## Data Flow & State Management

### Local State
```kotlin
var email by remember { mutableStateOf("") }
var password by remember { mutableStateOf("") }
var confirmPassword by remember { mutableStateOf("") }
var passwordVisible by remember { mutableStateOf(false) }
var confirmPasswordVisible by remember { mutableStateOf(false) }
var errorMessage by remember { mutableStateOf<String?>(null) }
```

### Validation Logic
```kotlin
fun validateForm(): String? {
    return when {
        email.isBlank() -> "Email is required"
        !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches() -> "Please enter a valid email"
        password.isBlank() -> "Password is required"
        password.length < 6 -> "Password must be at least 6 characters"
        confirmPassword != password -> "Passwords don't match"
        else -> null
    }
}
```

### Authentication State
- **ViewModel**: AuthViewModel
- **Loading State**: `isLoading.collectAsState()`
- **User State**: `currentUser.collectAsState()`

## Data Models

### User Registration Data
```kotlin
data class RegistrationData(
    val email: String,
    val password: String,
    val userType: UserType = UserType.CUSTOMER
)
```

### Validation Response
```kotlin
data class ValidationResult(
    val isValid: Boolean,
    val errorMessage: String?
)
```

## API Integration

### Firebase Authentication
- **Method**: `createUserWithEmailAndPassword()`
- **Parameters**: email, password
- **Response**: FirebaseUser or Exception

### User Profile Creation
- **Collection**: `users`
- **Document ID**: Firebase Auth UID
- **Initial Data**: User profile with default values

### Error Handling
- Email already in use
- Weak password
- Network errors
- Invalid email format

## Business Logic

### Registration Flow
1. Client-side validation (all fields)
2. Firebase user creation
3. User profile document creation
4. Success: Navigate to main app
5. Failure: Display specific error message

### Default User Settings
- **UserType**: CUSTOMER (default)
- **Profile**: Empty UserProfile with defaults
- **Verification**: false (initially)
- **Active**: true

## User Interactions

### Primary Actions
- **Type in fields**: Update state, trigger validation
- **Toggle password visibility**: Show/hide password text
- **Tap Sign Up**: Validate form and create account
- **Tap Login link**: Navigate to login screen

### Validation Triggers
- Real-time validation on field changes
- Form submission validation
- Auto-clear errors when user starts typing

## Web Implementation Notes

### React/Next.js Implementation
```jsx
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const SignUpScreen = ({ onNavigateToLogin, onSignUpSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords don\'t match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      // Create user profile document
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: formData.email,
        displayName: '',
        userType: 'CUSTOMER',
        verified: false,
        active: true,
        createdAt: new Date(),
        profile: {
          firstName: '',
          lastName: '',
          phone: '',
          address: {}
        }
      });
      
      onSignUpSuccess();
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="signup-container">
      <Card className="signup-card">
        <CardContent>
          <Typography variant="h4">MyHustle</Typography>
          <Typography variant="h6">Join the Hustle!</Typography>
          
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
              margin="normal"
            />
            
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              error={!!errors.password}
              helperText={errors.password}
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
            
            <TextField
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              fullWidth
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            {errors.general && (
              <Typography color="error">{errors.general}</Typography>
            )}
            
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              size="large"
            >
              {loading ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>
          </form>
          
          <Button onClick={onNavigateToLogin}>
            Already have an account? Sign In
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};
```

### Form Validation Hook
```javascript
import { useState, useCallback } from 'react';

const useFormValidation = (initialState, validate) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((name, value) => {
    setValues(prev => ({...prev, [name]: value}));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({...prev, [name]: ''}));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (callback) => {
    const validationErrors = validate(values);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await callback(values);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validate]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit
  };
};
```

## Security Considerations
- Client-side validation (UX)
- Server-side validation (Firebase rules)
- Password strength requirements
- Email verification (optional)
- Rate limiting for registration attempts

## Testing Requirements
- Form validation scenarios
- Password matching validation
- Error message display
- Loading state handling
- Navigation flow
- Firebase integration testing
