package com.blueclipse.myhustle.ui.screens

import android.Manifest
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.draw.clip
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import coil.compose.rememberAsyncImagePainter
import coil.request.ImageRequest
import com.blueclipse.myhustle.data.model.Shop
import com.blueclipse.myhustle.data.repository.FirebaseShopRepository
import com.blueclipse.myhustle.data.repository.EnhancedShopRepository
import com.blueclipse.myhustle.data.model.EnhancedShop
import com.blueclipse.myhustle.ui.theme.HustleColors
import com.google.firebase.auth.FirebaseAuth
import me.nikhilchaudhari.library.neumorphic
import me.nikhilchaudhari.library.NeuInsets
import me.nikhilchaudhari.library.shapes.Punched
import me.nikhilchaudhari.library.shapes.Pressed
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateStoreScreen(
    onBack: () -> Unit,
    onSave: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val repository = FirebaseShopRepository.instance
    val enhancedRepository = EnhancedShopRepository.instance
    val auth = FirebaseAuth.getInstance()
    
    // Save state
    var isSaving by remember { mutableStateOf(false) }
    var saveError by remember { mutableStateOf<String?>(null) }
    var showError by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    
    // Form state
    var storeName by remember { mutableStateOf("") }
    var storeDescription by remember { mutableStateOf("") }
    var storeCategory by remember { mutableStateOf("") }
    var storeAddress by remember { mutableStateOf("") }
    var storePhone by remember { mutableStateOf("") }
    var storeEmail by remember { mutableStateOf("") }
    // Operating hours (24h) state
    var openTime24 by remember { mutableStateOf("08:00") }
    var closeTime24 by remember { mutableStateOf("18:00") }
    
    // Media state
    var selectedLogoUri by remember { mutableStateOf<Uri?>(null) }
    var selectedBannerUri by remember { mutableStateOf<Uri?>(null) }
    var selectedGalleryUris by remember { mutableStateOf<List<Uri>>(emptyList()) }
    
    // Permission handling
    val permissionToRequest = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        Manifest.permission.READ_MEDIA_IMAGES
    } else {
        Manifest.permission.READ_EXTERNAL_STORAGE
    }
    
    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (!isGranted) {
            errorMessage = "Permission required to access images"
            showError = true
        }
    }
    
    fun checkAndRequestPermission(onPermissionGranted: () -> Unit) {
        when (ContextCompat.checkSelfPermission(context, permissionToRequest)) {
            PackageManager.PERMISSION_GRANTED -> {
                onPermissionGranted()
            }
            else -> {
                permissionLauncher.launch(permissionToRequest)
            }
        }
    }
    
    // Image pickers for device gallery
    val logoLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri -> if (uri != null) selectedLogoUri = uri }
    
    val bannerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri -> if (uri != null) selectedBannerUri = uri }
    
    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetMultipleContents()
    ) { uris -> selectedGalleryUris = uris }

    Scaffold(
        topBar = {
            // Custom top bar without neumorphic
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(112.dp), // Increased height
                color = MaterialTheme.colorScheme.background
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(top = 24.dp, start = 16.dp, end = 16.dp, bottom = 12.dp), // Balanced padding
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(
                            modifier = Modifier
                                .size(48.dp)
                                .clickable { onBack() }
                                .neumorphic(
                                    lightShadowColor = HustleColors.lightShadow,
                                    darkShadowColor = HustleColors.darkShadow,
                                    elevation = 4.dp,
                                    neuInsets = NeuInsets(1.dp, 1.dp),
                                    strokeWidth = 1.dp,
                                    neuShape = Punched.Rounded(radius = 16.dp)
                                ),
                            shape = RoundedCornerShape(16.dp),
                            color = Color.White
                        ) {
                            Box(
                                modifier = Modifier.fillMaxSize(),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    Icons.AutoMirrored.Filled.ArrowBack,
                                    contentDescription = "Back",
                                    tint = HustleColors.BlueAccent,
                                    modifier = Modifier.size(24.dp)
                                )
                            }
                        }
                        
                        Spacer(modifier = Modifier.width(16.dp))
                        
                        Column {
                            Text(
                                text = "Create New Store",
                                style = MaterialTheme.typography.headlineSmall,
                                fontWeight = FontWeight.Bold,
                                color = Color.Black
                            )
                            Text(
                                text = "Build your business presence",
                                style = MaterialTheme.typography.bodyMedium,
                                color = Color.Gray
                            )
                        }
                    }
                    
                    // Save Button - Solid blue without neumorphic
                    Surface(
                        modifier = Modifier
                            .height(48.dp)
                            .clickable(enabled = !isSaving) {
                                coroutineScope.launch {
                                    isSaving = true
                                    saveError = null
                                    
                                    try {
                                        Log.d("CreateStore", "🏪 Starting to save store: $storeName")
                                        
                                        // Get current user ID
                                        val currentUser = auth.currentUser
                                        if (currentUser == null) {
                                            saveError = "User not authenticated. Please log in first."
                                            return@launch
                                        }
                                        
                                        val userId = currentUser.uid
                                        Log.d("CreateStore", "👤 Current user ID: $userId")
                                    
                                        // Validate time format
                                        fun isValidTime24(t: String): Boolean {
                                            val parts = t.split(":")
                                            if (parts.size != 2) return false
                                            val h = parts[0].toIntOrNull() ?: return false
                                            val m = parts[1].toIntOrNull() ?: return false
                                            if (h !in 0..24) return false
                                            if (h == 24 && m != 0) return false
                                            if (m !in 0..59) return false
                                            return true
                                        }

                                        if (!isValidTime24(openTime24) || !isValidTime24(closeTime24)) {
                                            saveError = "Please enter valid 24h times (HH:mm). Close can be 24:00."
                                            return@launch
                                        }
                                        val (openH, openM) = openTime24.split(":").map { it.toInt() }
                                        val (closeH, closeM) = closeTime24.split(":").map { it.toInt() }
                                        val openMin = openH * 60 + openM
                                        val closeMin = if (closeH == 24 && closeM == 0) 24 * 60 else closeH * 60 + closeM
                                        if (closeMin <= openMin) {
                                            saveError = "Closing time must be after opening time."
                                            return@launch
                                        }

                                        // Create enhanced shop object (without images initially)
                                        val newShop = EnhancedShop(
                                            id = "", // Firebase will generate this
                                            name = storeName.trim(),
                                            description = storeDescription.trim(),
                                            category = storeCategory.trim(),
                                            address = storeAddress.trim(),
                                            phone = storePhone.trim(),
                                            email = storeEmail.trim(),
                                            rating = 0f,
                                            isFavorite = false,
                                            availability = listOf("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"),
                                            logo = null, // Will be set after upload
                                            banner = null, // Will be set after upload
                                            gallery = emptyList(),
                                            catalog = emptyList(),
                                            verified = false,
                                            established = "",
                                            totalSales = 0,
                                            responseTime = ""
                                        )
                                        
                                        Log.d("CreateStore", "📦 Created enhanced shop object: ${newShop.name}")
                                        Log.d("CreateStore", "📸 Uploading images: Logo=${selectedLogoUri != null}, Banner=${selectedBannerUri != null}, Gallery=${selectedGalleryUris.size}")
                                        
                                        // Use EnhancedShopRepository to create shop with media uploads
                                        val result = enhancedRepository.createShop(
                                            shop = newShop,
                                            logoUri = selectedLogoUri,
                                            bannerUri = selectedBannerUri,
                                            galleryUris = selectedGalleryUris,
                                            context = context
                                        )
                                        
                                        if (result.isSuccess) {
                                            Log.d("CreateStore", "✅ Store with images saved successfully with ID: ${result.getOrNull()}")
                                            onSave()
                                        } else {
                                            val errorMsg = result.exceptionOrNull()?.message ?: "Failed to save store and upload images"
                                            Log.e("CreateStore", "❌ Failed to save store with images: $errorMsg")
                                            saveError = errorMsg
                                        }
                                    } catch (e: Exception) {
                                        Log.e("CreateStore", "💥 Exception saving store", e)
                                        saveError = e.message ?: "An unexpected error occurred"
                                    } finally {
                                        isSaving = false
                                    }
                                }
                            },
                        shape = RoundedCornerShape(16.dp),
                        color = if (isSaving) Color.Gray.copy(alpha = 0.6f) else HustleColors.BlueAccent
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            if (isSaving) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(16.dp),
                                    strokeWidth = 2.dp,
                                    color = Color.White
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                            }
                            Text(
                                text = if (isSaving) "Saving..." else "Save",
                                color = Color.White,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 24.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp),
            contentPadding = PaddingValues(vertical = 24.dp)
        ) {
            // Progress Indicator
            item {
                ProgressSection()
            }
            
            // Error Display
            saveError?.let { error ->
                item {
                    ErrorCard(error = error)
                }
            }
            
            // Basic Information Section
            item {
                BasicInfoSection(
                    storeName = storeName,
                    onStoreNameChange = { storeName = it },
                    storeDescription = storeDescription,
                    onStoreDescriptionChange = { storeDescription = it },
                    storeCategory = storeCategory,
                    onStoreCategoryChange = { storeCategory = it }
                )
            }

            // Operating Hours Section
            item {
                OperatingHoursSection(
                    openTime = openTime24,
                    onOpenTimeChange = { openTime24 = it },
                    closeTime = closeTime24,
                    onCloseTimeChange = { closeTime24 = it }
                )
            }
            
            // Contact Information Section
            item {
                ContactInfoSection(
                    storeAddress = storeAddress,
                    onAddressChange = { storeAddress = it },
                    storePhone = storePhone,
                    onPhoneChange = { storePhone = it },
                    storeEmail = storeEmail,
                    onEmailChange = { storeEmail = it }
                )
            }
            
            // Media Assets Section
            item {
                MediaAssetsSection(
                    selectedLogoUri = selectedLogoUri,
                    selectedBannerUri = selectedBannerUri,
                    selectedGalleryUris = selectedGalleryUris,
                    onLogoFromDevice = { 
                        checkAndRequestPermission { logoLauncher.launch("image/*") }
                    },
                    onBannerFromDevice = { 
                        checkAndRequestPermission { bannerLauncher.launch("image/*") }
                    },
                    onGalleryFromDevice = { 
                        checkAndRequestPermission { galleryLauncher.launch("image/*") }
                    },
                    onRemoveLogo = { selectedLogoUri = null },
                    onRemoveBanner = { selectedBannerUri = null },
                    onRemoveGalleryImage = { uri ->
                        selectedGalleryUris = selectedGalleryUris.filter { it != uri }
                    }
                )
            }
        }
    }
}

// New Neumorphic Section Components
@Composable
private fun ProgressSection() {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .neumorphic(
                lightShadowColor = HustleColors.lightShadow,
                darkShadowColor = HustleColors.darkShadow,
                elevation = 4.dp,
                neuInsets = NeuInsets(4.dp, 4.dp),
                strokeWidth = 2.dp,
                neuShape = Punched.Rounded(radius = 20.dp)
            ),
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                ProgressStep(
                    stepNumber = 1,
                    title = "Basic Info",
                    isActive = true,
                    isCompleted = false
                )
                
                Divider(
                    modifier = Modifier
                        .width(40.dp)
                        .height(2.dp),
                    color = HustleColors.BlueAccent.copy(alpha = 0.3f)
                )
                
                ProgressStep(
                    stepNumber = 2,
                    title = "Contact",
                    isActive = false,
                    isCompleted = false
                )
                
                Divider(
                    modifier = Modifier
                        .width(40.dp)
                        .height(2.dp),
                    color = Color.Gray.copy(alpha = 0.3f)
                )
                
                ProgressStep(
                    stepNumber = 3,
                    title = "Media",
                    isActive = false,
                    isCompleted = false
                )
            }
        }
    }
}

@Composable
private fun ProgressStep(
    stepNumber: Int,
    title: String,
    isActive: Boolean,
    isCompleted: Boolean
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Surface(
            modifier = Modifier
                .size(40.dp)
                .clip(RoundedCornerShape(16.dp))
                .neumorphic(
                    lightShadowColor = HustleColors.lightShadow,
                    darkShadowColor = HustleColors.darkShadow,
                    elevation = if (isActive) 8.dp else 6.dp,
                    neuInsets = NeuInsets(4.dp, 4.dp),
                    strokeWidth = if (isActive) 8.dp else 2.dp,
                    neuShape = if (isActive) Pressed.Rounded(radius = 4.dp) else Punched.Rounded(radius = 20.dp)
                ),
            shape = RoundedCornerShape(16.dp),
            color = when {
                isCompleted -> HustleColors.BlueAccent
                isActive -> MaterialTheme.colorScheme.surface
                else -> MaterialTheme.colorScheme.surface
            }
        ) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                if (isCompleted) {
                    Icon(
                        Icons.Default.Check,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                } else {
                    Text(
                        text = stepNumber.toString(),
                        fontWeight = FontWeight.Bold,
                        color = when {
                            isActive -> HustleColors.BlueAccent
                            else -> Color.Gray
                        }
                    )
                }
            }
        }
        
        Text(
            text = title,
            style = MaterialTheme.typography.bodySmall,
            fontWeight = if (isActive) FontWeight.Bold else FontWeight.Normal,
            color = if (isActive) Color.Black else Color.Gray,
            textAlign = TextAlign.Center
        )
    }
}

@Composable
private fun ErrorCard(error: String) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .neumorphic(
                lightShadowColor = Color.Red.copy(alpha = 0.3f),
                darkShadowColor = Color.Red.copy(alpha = 0.5f),
                elevation = 4.dp,
                neuInsets = NeuInsets(2.dp, 2.dp),
                strokeWidth = 2.dp,
                neuShape = Punched.Rounded(radius = 16.dp)
            ),
        shape = RoundedCornerShape(16.dp),
        color = Color.Red.copy(alpha = 0.1f)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                Icons.Default.Error,
                contentDescription = null,
                tint = Color.Red,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Text(
                text = error,
                color = Color.Red.copy(alpha = 0.8f),
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}

@Composable
private fun BasicInfoSection(
    storeName: String,
    onStoreNameChange: (String) -> Unit,
    storeDescription: String,
    onStoreDescriptionChange: (String) -> Unit,
    storeCategory: String,
    onStoreCategoryChange: (String) -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .neumorphic(
                lightShadowColor = HustleColors.lightShadow,
                darkShadowColor = HustleColors.darkShadow,
                elevation = 4.dp,
                neuInsets = NeuInsets(4.dp, 4.dp),
                strokeWidth = 2.dp,
                neuShape = Punched.Rounded(radius = 20.dp)
            ),
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .neumorphic(
                            neuShape = Pressed.Rounded(radius = 4.dp),
                            lightShadowColor = HustleColors.lightShadow,
                            darkShadowColor = HustleColors.darkShadow,
                            elevation = 8.dp,
                            neuInsets = NeuInsets(4.dp, 4.dp),
                            strokeWidth = 8.dp
                        ),
                    shape = RoundedCornerShape(16.dp),
                    color = MaterialTheme.colorScheme.surface
                ) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.Store,
                            contentDescription = null,
                            tint = HustleColors.BlueAccent,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
                
                Spacer(modifier = Modifier.width(16.dp))
                
                Column {
                    Text(
                        text = "Basic Information",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                    Text(
                        text = "Tell us about your store",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.Gray
                    )
                }
            }
            
            NeumorphicTextField(
                value = storeName,
                onValueChange = onStoreNameChange,
                label = "Store Name",
                placeholder = "Enter your store name",
                leadingIcon = Icons.Default.StoreMallDirectory
            )
            
            NeumorphicTextField(
                value = storeDescription,
                onValueChange = onStoreDescriptionChange,
                label = "Description",
                placeholder = "Describe your store and what you offer",
                leadingIcon = Icons.Default.Description,
                minLines = 3
            )
            
            NeumorphicTextField(
                value = storeCategory,
                onValueChange = onStoreCategoryChange,
                label = "Category",
                placeholder = "e.g., Food & Beverage, Tech Services",
                leadingIcon = Icons.Default.Category
            )
        }
    }
}

@Composable
private fun OperatingHoursSection(
    openTime: String,
    onOpenTimeChange: (String) -> Unit,
    closeTime: String,
    onCloseTimeChange: (String) -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .neumorphic(
                lightShadowColor = HustleColors.lightShadow,
                darkShadowColor = HustleColors.darkShadow,
                elevation = 4.dp,
                neuInsets = NeuInsets(4.dp, 4.dp),
                strokeWidth = 2.dp,
                neuShape = Punched.Rounded(radius = 20.dp)
            ),
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .neumorphic(
                            neuShape = Pressed.Rounded(radius = 4.dp),
                            lightShadowColor = HustleColors.lightShadow,
                            darkShadowColor = HustleColors.darkShadow,
                            elevation = 8.dp,
                            neuInsets = NeuInsets(4.dp, 4.dp),
                            strokeWidth = 8.dp
                        ),
                    shape = RoundedCornerShape(16.dp),
                    color = MaterialTheme.colorScheme.surface
                ) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = Icons.Default.Schedule,
                            contentDescription = null,
                            tint = HustleColors.BlueAccent,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
                Spacer(modifier = Modifier.width(16.dp))
                Column {
                    Text(
                        text = "Operating Hours",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                    Text(
                        text = "Set daily opening and closing times (24h, e.g. 08:00 – 18:00; use 24:00 to indicate midnight)",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.Gray
                    )
                }
            }

            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                NeumorphicTextField(
                    value = openTime,
                    onValueChange = onOpenTimeChange,
                    label = "Opens (24h)",
                    placeholder = "08:00",
                    leadingIcon = Icons.Default.AccessTime,
                    modifier = Modifier.weight(1f)
                )
                NeumorphicTextField(
                    value = closeTime,
                    onValueChange = onCloseTimeChange,
                    label = "Closes (24h)",
                    placeholder = "18:00",
                    leadingIcon = Icons.Default.AccessTime,
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}

@Composable
private fun ContactInfoSection(
    storeAddress: String,
    onAddressChange: (String) -> Unit,
    storePhone: String,
    onPhoneChange: (String) -> Unit,
    storeEmail: String,
    onEmailChange: (String) -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .neumorphic(
                lightShadowColor = HustleColors.lightShadow,
                darkShadowColor = HustleColors.darkShadow,
                elevation = 4.dp,
                neuInsets = NeuInsets(4.dp, 4.dp),
                strokeWidth = 2.dp,
                neuShape = Punched.Rounded(radius = 20.dp)
            ),
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .neumorphic(
                            neuShape = Pressed.Rounded(radius = 4.dp),
                            lightShadowColor = HustleColors.lightShadow,
                            darkShadowColor = HustleColors.darkShadow,
                            elevation = 8.dp,
                            neuInsets = NeuInsets(4.dp, 4.dp),
                            strokeWidth = 8.dp
                        ),
                    shape = RoundedCornerShape(16.dp),
                    color = MaterialTheme.colorScheme.surface
                ) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.ContactPage,
                            contentDescription = null,
                            tint = HustleColors.BlueAccent,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
                
                Spacer(modifier = Modifier.width(16.dp))
                
                Column {
                    Text(
                        text = "Contact Information",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                    Text(
                        text = "How customers can reach you",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.Gray
                    )
                }
            }
            
            NeumorphicTextField(
                value = storeAddress,
                onValueChange = onAddressChange,
                label = "Address",
                placeholder = "123 Main St, City, State",
                leadingIcon = Icons.Default.LocationOn
            )
            
            NeumorphicTextField(
                value = storePhone,
                onValueChange = onPhoneChange,
                label = "Phone",
                placeholder = "+1 (555) 123-4567",
                leadingIcon = Icons.Default.Phone
            )
            
            NeumorphicTextField(
                value = storeEmail,
                onValueChange = onEmailChange,
                label = "Email",
                placeholder = "contact@yourstore.com",
                leadingIcon = Icons.Default.Email
            )
        }
    }
}

@Composable
private fun MediaAssetsSection(
    selectedLogoUri: Uri?,
    selectedBannerUri: Uri?,
    selectedGalleryUris: List<Uri>,
    onLogoFromDevice: () -> Unit,
    onBannerFromDevice: () -> Unit,
    onGalleryFromDevice: () -> Unit,
    onRemoveLogo: () -> Unit,
    onRemoveBanner: () -> Unit,
    onRemoveGalleryImage: (Uri) -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .neumorphic(
                lightShadowColor = HustleColors.lightShadow,
                darkShadowColor = HustleColors.darkShadow,
                elevation = 4.dp,
                neuInsets = NeuInsets(4.dp, 4.dp),
                strokeWidth = 2.dp,
                neuShape = Punched.Rounded(radius = 20.dp)
            ),
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .neumorphic(
                            neuShape = Pressed.Rounded(radius = 4.dp),
                            lightShadowColor = HustleColors.lightShadow,
                            darkShadowColor = HustleColors.darkShadow,
                            elevation = 8.dp,
                            neuInsets = NeuInsets(4.dp, 4.dp),
                            strokeWidth = 8.dp
                        ),
                    shape = RoundedCornerShape(16.dp),
                    color = MaterialTheme.colorScheme.surface
                ) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.PhotoLibrary,
                            contentDescription = null,
                            tint = HustleColors.BlueAccent,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
                
                Spacer(modifier = Modifier.width(16.dp))
                
                Column {
                    Text(
                        text = "Media Assets",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                    Text(
                        text = "Add images to showcase your store",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.Gray
                    )
                }
            }
            
            // Logo Section
            NeumorphicMediaPicker(
                title = "Store Logo",
                description = "Square image for your store logo",
                selectedUri = selectedLogoUri,
                onPickFromDevice = onLogoFromDevice,
                onRemove = onRemoveLogo,
                aspectRatio = 1f
            )
            
            // Banner Section
            NeumorphicMediaPicker(
                title = "Store Banner",
                description = "Wide image for your store header",
                selectedUri = selectedBannerUri,
                onPickFromDevice = onBannerFromDevice,
                onRemove = onRemoveBanner,
                aspectRatio = 16f/9f
            )
            
            // Gallery Section
            if (selectedGalleryUris.isNotEmpty()) {
                Column {
                    Text(
                        text = "Gallery Images",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                    LazyRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(selectedGalleryUris) { uri ->
                            NeumorphicImagePreview(
                                uri = uri,
                                onRemove = { onRemoveGalleryImage(uri) },
                                aspectRatio = 1f
                            )
                        }
                    }
                }
            }
            
            // Add Gallery Button - Solid blue without neumorphic
            Surface(
                modifier = Modifier.clickable { onGalleryFromDevice() },
                shape = RoundedCornerShape(12.dp),
                color = HustleColors.BlueAccent
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.PhotoLibrary,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Add Gallery Images",
                        color = Color.White,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }
    }
}

@Composable
private fun NeumorphicTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    placeholder: String,
    leadingIcon: androidx.compose.ui.graphics.vector.ImageVector,
    minLines: Int = 1,
    modifier: Modifier = Modifier
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(8.dp),
        modifier = modifier
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Medium,
            color = Color.Black
        )
        
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .neumorphic(
                    lightShadowColor = HustleColors.lightShadow,
                    darkShadowColor = HustleColors.darkShadow,
                    elevation = 4.dp,
                    neuInsets = NeuInsets(4.dp, 4.dp),
                    strokeWidth = 2.dp,
                    neuShape = Punched.Rounded(radius = 12.dp)
                ),
            shape = RoundedCornerShape(12.dp),
            color = MaterialTheme.colorScheme.surface
        ) {
            TextField(
                value = value,
                onValueChange = onValueChange,
                placeholder = {
                    Text(
                        text = placeholder,
                        color = Color.Gray.copy(alpha = 0.6f)
                    )
                },
                leadingIcon = {
                    Icon(
                        leadingIcon,
                        contentDescription = null,
                        tint = HustleColors.BlueAccent,
                        modifier = Modifier.size(20.dp)
                    )
                },
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = Color.Transparent,
                    unfocusedContainerColor = Color.Transparent,
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent
                ),
                modifier = Modifier.fillMaxWidth(),
                minLines = minLines
            )
        }
    }
}

@Composable
private fun NeumorphicImagePreview(
    uri: Uri,
    onRemove: () -> Unit,
    aspectRatio: Float
) {
    val context = LocalContext.current
    
    Surface(
        modifier = Modifier
            .width(120.dp)
            .aspectRatio(aspectRatio)
            .neumorphic(
                lightShadowColor = HustleColors.lightShadow,
                darkShadowColor = HustleColors.darkShadow,
                elevation = 4.dp,
                neuInsets = NeuInsets(2.dp, 2.dp),
                strokeWidth = 1.dp,
                neuShape = Punched.Rounded(radius = 12.dp)
            ),
        shape = RoundedCornerShape(12.dp),
        color = Color.White
    ) {
        Box {
            Image(
                painter = rememberAsyncImagePainter(
                    ImageRequest.Builder(context)
                        .data(uri)
                        .build()
                ),
                contentDescription = null,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop
            )
            
            Surface(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(8.dp)
                    .clickable { onRemove() }
                    .neumorphic(
                        lightShadowColor = HustleColors.lightShadow,
                        darkShadowColor = HustleColors.darkShadow,
                        elevation = 2.dp,
                        neuInsets = NeuInsets(1.dp, 1.dp),
                        strokeWidth = 1.dp,
                        neuShape = Pressed.Rounded(radius = 20.dp)
                    ),
                shape = CircleShape,
                color = Color.Red.copy(alpha = 0.9f)
            ) {
                Icon(
                    Icons.Default.Close,
                    contentDescription = "Remove",
                    tint = Color.White,
                    modifier = Modifier
                        .padding(6.dp)
                        .size(14.dp)
                )
            }
        }
    }
}

@Composable
private fun NeumorphicMediaPicker(
    title: String,
    description: String,
    selectedUri: Uri?,
    onPickFromDevice: () -> Unit,
    onRemove: () -> Unit,
    aspectRatio: Float
) {
    val context = LocalContext.current
    
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                Text(
                    text = description,
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray
                )
            }
            
            Surface(
                modifier = Modifier.clickable { onPickFromDevice() },
                shape = RoundedCornerShape(12.dp),
                color = HustleColors.BlueAccent
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.PhotoLibrary,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Choose Image",
                        color = Color.White,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }
        
        selectedUri?.let { uri ->
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(aspectRatio)
                    .neumorphic(
                        lightShadowColor = HustleColors.lightShadow,
                        darkShadowColor = HustleColors.darkShadow,
                        elevation = 4.dp,
                        neuInsets = NeuInsets(2.dp, 2.dp),
                        strokeWidth = 1.dp,
                        neuShape = Punched.Rounded(radius = 12.dp)
                    ),
                shape = RoundedCornerShape(12.dp),
                color = Color.White
            ) {
                Box {
                    Image(
                        painter = rememberAsyncImagePainter(
                            ImageRequest.Builder(context)
                                .data(uri)
                                .build()
                        ),
                        contentDescription = title,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                    
                    Surface(
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .padding(8.dp)
                            .clickable { onRemove() }
                            .neumorphic(
                                lightShadowColor = HustleColors.lightShadow,
                                darkShadowColor = HustleColors.darkShadow,
                                elevation = 2.dp,
                                neuInsets = NeuInsets(1.dp, 1.dp),
                                strokeWidth = 1.dp,
                                neuShape = Pressed.Rounded(radius = 20.dp)
                            ),
                        shape = CircleShape,
                        color = Color.Red.copy(alpha = 0.9f)
                    ) {
                        Icon(
                            Icons.Default.Close,
                            contentDescription = "Remove",
                            tint = Color.White,
                            modifier = Modifier
                                .padding(8.dp)
                                .size(16.dp)
                        )
                    }
                }
            }
        }
    }
}
