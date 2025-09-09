# Create Store Screen Documentation

## Purpose & Function
The Create Store Screen allows users to register their business on the MyHustle platform. It provides a comprehensive form for entering business information, uploading media, and setting up store details to begin offering products and services.

## Screen Overview
- **File**: `CreateStoreScreen.kt`
- **Type**: Business Registration Screen
- **User Types**: Authenticated users becoming business owners

## UI Components & Layout

### Top App Bar
- **Custom Design**: Increased height (112dp) with balanced padding
- **Back Button**: Arrow back icon for navigation
- **Title**: "Create Your Store" with branding
- **Background**: Theme background color
- **Elevation**: Surface-level styling

### Store Information Section

#### Basic Information
- **Store Name**: Text field with validation
- **Store Description**: Multi-line text area
- **Category**: Dropdown selection from predefined categories
- **Address**: Location text field
- **Phone**: Phone number input with formatting
- **Email**: Email address with validation

#### Operating Hours
- **Open Time**: Time picker (24-hour format storage)
- **Close Time**: Time picker (24-hour format storage)
- **Format**: Stored as "HH:mm" strings (e.g., "08:00", "18:00")
- **Display**: Converted to user-friendly format

### Media Upload Section

#### Logo Upload
- **Image Picker**: Gallery selection for logo
- **Preview**: Circular image preview (logo shape)
- **Size**: Appropriate for logo display
- **Format**: Standard image formats (PNG, JPG)

#### Banner Upload
- **Image Picker**: Gallery selection for banner
- **Preview**: Full-width banner preview
- **Aspect Ratio**: Optimized for banner display
- **Format**: High-resolution images

#### Gallery Upload
- **Multiple Selection**: Choose multiple gallery images
- **Preview Grid**: Show selected images in grid
- **Management**: Add/remove individual images
- **Limit**: Reasonable number limit (e.g., 10 images)

### Category Selection
- **Predefined Options**: Common business categories
- **Examples**: Restaurant, Retail, Services, Tech, Beauty, etc.
- **Custom Input**: Option for "Other" category
- **Visual Design**: Chip-based selection or dropdown

### Save Actions
- **Save Button**: Primary action button
- **Loading State**: Progress indicator during save
- **Validation**: Form validation before submission
- **Error Handling**: Display save errors clearly

## Data Flow & State Management

### Form State Variables
```kotlin
var storeName by remember { mutableStateOf("") }
var storeDescription by remember { mutableStateOf("") }
var storeCategory by remember { mutableStateOf("") }
var storeAddress by remember { mutableStateOf("") }
var storePhone by remember { mutableStateOf("") }
var storeEmail by remember { mutableStateOf("") }
var openTime24 by remember { mutableStateOf("08:00") }
var closeTime24 by remember { mutableStateOf("18:00") }
```

### Media State Variables
```kotlin
var selectedLogoUri by remember { mutableStateOf<Uri?>(null) }
var selectedBannerUri by remember { mutableStateOf<Uri?>(null) }
var selectedGalleryUris by remember { mutableStateOf<List<Uri>>(emptyList()) }
```

### Save State Variables
```kotlin
var isSaving by remember { mutableStateOf(false) }
var saveError by remember { mutableStateOf<String?>(null) }
```

### Image Selection Launchers
```kotlin
val logoLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.GetContent()
) { uri -> if (uri != null) selectedLogoUri = uri }

val bannerLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.GetContent()
) { uri -> if (uri != null) selectedBannerUri = uri }

val galleryLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.GetMultipleContents()
) { uris -> selectedGalleryUris = uris }
```

## Data Models

### Shop Model (Creation)
```kotlin
data class Shop(
    val id: String = "",
    val name: String,
    val description: String,
    val ownerId: String,
    val category: String,
    val location: String = "",
    val address: String,
    val phone: String,
    val email: String,
    val website: String = "",
    val logoUrl: String = "",
    val bannerUrl: String = "",
    val coverImageUrl: String = "",
    val rating: Double = 0.0,
    val totalReviews: Int = 0,
    val isVerified: Boolean = false,
    val isPremium: Boolean = false,
    val isActive: Boolean = true,
    val availability: String = "Available",
    val openTime24: String = "08:00",
    val closeTime24: String = "18:00",
    val responseTime: String = "Within 24 hours",
    val operatingHours: Map<String, String> = emptyMap(),
    val socialMedia: Map<String, String> = emptyMap(),
    val tags: List<String> = emptyList(),
    val specialties: List<String> = emptyList(),
    val priceRange: String = "$$",
    val deliveryOptions: List<String> = emptyList(),
    val paymentMethods: List<String> = emptyList(),
    val catalog: List<CatalogItem> = emptyList(),
    val createdAt: Timestamp = Timestamp.now(),
    val updatedAt: Timestamp = Timestamp.now()
)
```

### Validation Model
```kotlin
data class StoreValidation(
    val isValid: Boolean,
    val errors: Map<String, String>
)
```

### Image Upload Model
```kotlin
data class ImageUploadResult(
    val success: Boolean,
    val url: String?,
    val error: String?
)
```

## API Integration

### FirebaseShopRepository Methods
- **createShop(shop)**: Create new shop record
- **uploadShopImages(shopId, images)**: Upload media files
- **validateShopData(shop)**: Server-side validation

### Firebase Services
- **Authentication**: Get current user ID
- **Firestore**: Store shop documents
- **Storage**: Upload images and media files
- **Security Rules**: Validate shop creation permissions

### Image Upload Process
1. **Validation**: Check file size and format
2. **Compression**: Optimize images for storage
3. **Upload**: Store in Firebase Storage
4. **URL Generation**: Get public download URLs
5. **Database Update**: Store URLs in shop document

## Business Logic

### Form Validation
```kotlin
fun validateStoreForm(
    name: String,
    description: String,
    category: String,
    address: String,
    phone: String,
    email: String
): StoreValidation {
    val errors = mutableMapOf<String, String>()
    
    if (name.isBlank()) {
        errors["name"] = "Store name is required"
    }
    
    if (description.isBlank()) {
        errors["description"] = "Store description is required"
    }
    
    if (category.isBlank()) {
        errors["category"] = "Please select a category"
    }
    
    if (address.isBlank()) {
        errors["address"] = "Address is required"
    }
    
    if (phone.isBlank()) {
        errors["phone"] = "Phone number is required"
    } else if (!isValidPhoneNumber(phone)) {
        errors["phone"] = "Please enter a valid phone number"
    }
    
    if (email.isBlank()) {
        errors["email"] = "Email is required"
    } else if (!isValidEmail(email)) {
        errors["email"] = "Please enter a valid email address"
    }
    
    return StoreValidation(errors.isEmpty(), errors)
}
```

### Operating Hours Validation
```kotlin
fun validateOperatingHours(openTime: String, closeTime: String): Boolean {
    val (openHour, openMin) = openTime.split(":").map { it.toIntOrNull() ?: 0 }
    val (closeHour, closeMin) = closeTime.split(":").map { it.toIntOrNull() ?: 0 }
    
    val openMinutes = openHour * 60 + openMin
    val closeMinutes = closeHour * 60 + closeMin
    
    return closeMinutes > openMinutes
}
```

### Save Process
```kotlin
suspend fun saveStore() {
    isSaving = true
    saveError = null
    
    try {
        // Validate form
        val validation = validateStoreForm(...)
        if (!validation.isValid) {
            saveError = validation.errors.values.first()
            return
        }
        
        // Create shop object
        val shop = Shop(
            name = storeName.trim(),
            description = storeDescription.trim(),
            ownerId = auth.currentUser?.uid ?: "",
            category = storeCategory,
            address = storeAddress.trim(),
            phone = storePhone.trim(),
            email = storeEmail.trim(),
            openTime24 = openTime24,
            closeTime24 = closeTime24
        )
        
        // Save shop to repository
        val result = repository.createShop(shop)
        if (result.isSuccess) {
            val shopId = result.getOrNull()
            
            // Upload images if selected
            uploadShopImages(shopId, selectedLogoUri, selectedBannerUri, selectedGalleryUris)
            
            onSave()
        } else {
            saveError = result.exceptionOrNull()?.message ?: "Failed to create store"
        }
        
    } catch (e: Exception) {
        saveError = e.message ?: "An error occurred"
    } finally {
        isSaving = false
    }
}
```

## User Interactions

### Primary Actions
1. **Fill Form Fields**: Enter store information
2. **Select Category**: Choose business category
3. **Set Operating Hours**: Define business hours
4. **Upload Logo**: Select and preview logo image
5. **Upload Banner**: Select and preview banner image
6. **Upload Gallery**: Select multiple gallery images
7. **Save Store**: Submit form and create store
8. **Back Navigation**: Cancel and return to previous screen

### Image Management
- **Logo Selection**: Open gallery picker for logo
- **Banner Selection**: Open gallery picker for banner
- **Gallery Selection**: Multi-select for gallery images
- **Image Preview**: Show selected images before upload
- **Image Removal**: Remove selected images before save

### Form Interactions
- **Real-time Validation**: Validate fields as user types
- **Error Display**: Show validation errors inline
- **Auto-formatting**: Format phone numbers automatically
- **Character Limits**: Enforce reasonable text limits

## Web Implementation Notes

### React/Next.js Implementation
```jsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  IconButton,
  Avatar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { ArrowBack, PhotoCamera, Upload } from '@mui/icons-material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

const CreateStoreScreen = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    storeCategory: '',
    storeAddress: '',
    storePhone: '',
    storeEmail: '',
    openTime: new Date().setHours(8, 0),
    closeTime: new Date().setHours(18, 0)
  });
  const [images, setImages] = useState({
    logo: null,
    banner: null,
    gallery: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { user } = useAuth();

  const categories = [
    'Restaurant',
    'Retail',
    'Services',
    'Technology',
    'Beauty & Wellness',
    'Health & Medical',
    'Education',
    'Entertainment',
    'Other'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleImageUpload = (type, files) => {
    if (type === 'gallery') {
      setImages(prev => ({
        ...prev,
        gallery: [...prev.gallery, ...Array.from(files)]
      }));
    } else {
      setImages(prev => ({
        ...prev,
        [type]: files[0]
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.storeName.trim()) {
      newErrors.storeName = 'Store name is required';
    }
    
    if (!formData.storeDescription.trim()) {
      newErrors.storeDescription = 'Store description is required';
    }
    
    if (!formData.storeCategory) {
      newErrors.storeCategory = 'Please select a category';
    }
    
    if (!formData.storeAddress.trim()) {
      newErrors.storeAddress = 'Address is required';
    }
    
    if (!formData.storePhone.trim()) {
      newErrors.storePhone = 'Phone number is required';
    }
    
    if (!formData.storeEmail.trim()) {
      newErrors.storeEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.storeEmail)) {
      newErrors.storeEmail = 'Please enter a valid email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Upload images first
      const uploadedImages = await uploadStoreImages(images);
      
      // Create store data
      const storeData = {
        ...formData,
        ownerId: user.uid,
        logoUrl: uploadedImages.logo || '',
        bannerUrl: uploadedImages.banner || '',
        galleryUrls: uploadedImages.gallery || [],
        openTime24: formatTimeAs24Hour(formData.openTime),
        closeTime24: formatTimeAs24Hour(formData.closeTime)
      };
      
      // Save store
      const result = await storeAPI.create(storeData);
      
      if (result.success) {
        router.push(`/business/management/${result.storeId}`);
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      setErrors({ general: 'Failed to create store. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => router.back()}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ ml: 2 }}>
          Create Your Store
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Store Name"
                value={formData.storeName}
                onChange={(e) => handleInputChange('storeName', e.target.value)}
                error={!!errors.storeName}
                helperText={errors.storeName}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.storeCategory}>
                <InputLabel>Category *</InputLabel>
                <Select
                  value={formData.storeCategory}
                  label="Category *"
                  onChange={(e) => handleInputChange('storeCategory', e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={formData.storeDescription}
                onChange={(e) => handleInputChange('storeDescription', e.target.value)}
                error={!!errors.storeDescription}
                helperText={errors.storeDescription}
                required
              />
            </Grid>
            
            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Contact Information
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.storeAddress}
                onChange={(e) => handleInputChange('storeAddress', e.target.value)}
                error={!!errors.storeAddress}
                helperText={errors.storeAddress}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.storePhone}
                onChange={(e) => handleInputChange('storePhone', e.target.value)}
                error={!!errors.storePhone}
                helperText={errors.storePhone}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.storeEmail}
                onChange={(e) => handleInputChange('storeEmail', e.target.value)}
                error={!!errors.storeEmail}
                helperText={errors.storeEmail}
                required
              />
            </Grid>
            
            {/* Operating Hours */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Operating Hours
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TimePicker
                label="Opening Time"
                value={new Date(formData.openTime)}
                onChange={(newValue) => handleInputChange('openTime', newValue.getTime())}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TimePicker
                label="Closing Time"
                value={new Date(formData.closeTime)}
                onChange={(newValue) => handleInputChange('closeTime', newValue.getTime())}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            
            {/* Image Uploads */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Store Images
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Logo
                </Typography>
                <input
                  accept="image/*"
                  type="file"
                  id="logo-upload"
                  style={{ display: 'none' }}
                  onChange={(e) => handleImageUpload('logo', e.target.files)}
                />
                <label htmlFor="logo-upload">
                  <Avatar
                    sx={{ 
                      width: 100, 
                      height: 100, 
                      margin: 'auto',
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.8 }
                    }}
                    src={images.logo ? URL.createObjectURL(images.logo) : ''}
                  >
                    <PhotoCamera />
                  </Avatar>
                </label>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Banner
                </Typography>
                <input
                  accept="image/*"
                  type="file"
                  id="banner-upload"
                  style={{ display: 'none' }}
                  onChange={(e) => handleImageUpload('banner', e.target.files)}
                />
                <label htmlFor="banner-upload">
                  <Box
                    sx={{
                      width: '100%',
                      height: 120,
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      backgroundImage: images.banner ? `url(${URL.createObjectURL(images.banner)})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      '&:hover': { opacity: 0.8 }
                    }}
                  >
                    {!images.banner && <Upload />}
                  </Box>
                </label>
              </Box>
            </Grid>
            
            {errors.general && (
              <Grid item xs={12}>
                <Alert severity="error">
                  {errors.general}
                </Alert>
              </Grid>
            )}
            
            {/* Action Buttons */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Creating Store...' : 'Create Store'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};
```

## Performance Considerations
- **Image Optimization**: Compress images before upload
- **Lazy Loading**: Load form sections progressively
- **Validation Debouncing**: Debounce validation checks
- **Memory Management**: Clean up image previews
- **Progress Indicators**: Show upload progress

## Security Considerations
- **Authentication**: Verify user is logged in
- **File Validation**: Validate image types and sizes
- **Data Sanitization**: Clean user input
- **Rate Limiting**: Prevent spam store creation
- **Upload Security**: Scan uploaded files

## Accessibility Features
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper form labels
- **Error Announcements**: Accessible error messages
- **Focus Management**: Logical tab order
- **Image Alt Text**: Descriptive alternative text
