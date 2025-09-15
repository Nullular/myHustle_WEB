package com.blueclipse.myhustle.ui.screens.business

import androidx.compose.foundation.background
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.blueclipse.myhustle.data.model.Product
import com.blueclipse.myhustle.data.model.Service
import com.blueclipse.myhustle.data.repository.ProductRepository
import com.blueclipse.myhustle.data.repository.ServiceRepository
import com.blueclipse.myhustle.ui.components.ColoredTopBar
import com.blueclipse.myhustle.ui.theme.HustleColors
import com.blueclipse.myhustle.ui.theme.fontFamily
import kotlinx.coroutines.launch
import me.nikhilchaudhari.library.NeuInsets
import me.nikhilchaudhari.library.neumorphic
import me.nikhilchaudhari.library.shapes.Pressed

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChangeListingScreen(
    listingId: String,
    listingType: String, // "product" or "service"
    onBack: () -> Unit = {}
) {
    var product by remember { mutableStateOf<Product?>(null) }
    var service by remember { mutableStateOf<Service?>(null) }
    var isLoading by remember { mutableStateOf(true) }
    var isSaving by remember { mutableStateOf(false) }
    var isDeleting by remember { mutableStateOf(false) }
    var showDeleteDialog by remember { mutableStateOf(false) }
    
    val coroutineScope = rememberCoroutineScope()
    
    // Form fields for products
    var productName by remember { mutableStateOf("") }
    var productDescription by remember { mutableStateOf("") }
    var productPrice by remember { mutableStateOf("") }
    var productCategory by remember { mutableStateOf("") }
    var stockQuantity by remember { mutableStateOf("") }
    var productSKU by remember { mutableStateOf("") }
    var productExpensePerUnit by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("Electronics") }
    var showCategoryDropdown by remember { mutableStateOf(false) }
    
    // Form fields for services
    var serviceName by remember { mutableStateOf("") }
    var serviceDescription by remember { mutableStateOf("") }
    var basePrice by remember { mutableStateOf("") }
    var duration by remember { mutableStateOf("") }
    var serviceCategory by remember { mutableStateOf("") }
    var serviceExpensePerUnit by remember { mutableStateOf("") }
    var isAvailable by remember { mutableStateOf(true) }
    var maxBookingsPerDay by remember { mutableStateOf("") }
    var advanceBookingDays by remember { mutableStateOf("30") }
    
    val categories = listOf(
        "Electronics", "Clothing", "Home & Garden", "Sports", 
        "Beauty", "Books", "Toys", "Food & Beverages", "Other"
    )
    
    val serviceCategories = listOf(
        "Beauty & Wellness", "Health & Fitness", "Home Services", 
        "Professional Services", "Automotive", "Education & Training",
        "Photography", "Event Planning", "Repair Services", "Other"
    )

    // Load existing data
    LaunchedEffect(listingId, listingType) {
        try {
            if (listingType == "product") {
                val result = ProductRepository.instance.getProductById(listingId)
                if (result.isSuccess) {
                    val prod = result.getOrNull()
                    if (prod != null) {
                        product = prod
                        productName = prod.name
                        productDescription = prod.description
                        productPrice = prod.price.toString()
                        selectedCategory = prod.category
                        productCategory = prod.category
                        stockQuantity = prod.stockQuantity.toString()
                        productSKU = ""  // SKU not in Product model
                        productExpensePerUnit = prod.expensePerUnit.toString()
                    }
                }
            } else {
                val result = ServiceRepository.instance.getServiceById(listingId)
                if (result.isSuccess) {
                    val serv = result.getOrNull()
                    if (serv != null) {
                        service = serv
                        serviceName = serv.name
                        serviceDescription = serv.description
                        basePrice = serv.basePrice.toString()
                        duration = serv.estimatedDuration.toString()
                        serviceCategory = serv.category
                        serviceExpensePerUnit = serv.expensePerUnit.toString()
                        isAvailable = serv.isActive
                        maxBookingsPerDay = "10"  // Default value
                        advanceBookingDays = "30"  // Default value
                    }
                }
            }
        } catch (e: Exception) {
            println("Error loading listing: ${e.message}")
        } finally {
            isLoading = false
        }
    }

    fun saveChanges() {
        coroutineScope.launch {
            isSaving = true
            try {
                if (listingType == "product" && product != null) {
                    val updatedProduct = product!!.copy(
                        name = productName,
                        description = productDescription,
                        price = productPrice.toDoubleOrNull() ?: product!!.price,
                        category = selectedCategory,
                        stockQuantity = stockQuantity.toIntOrNull() ?: product!!.stockQuantity,
                        expensePerUnit = productExpensePerUnit.toDoubleOrNull() ?: 0.0,
                        updatedAt = System.currentTimeMillis()
                    )
                    
                    val result = ProductRepository.instance.updateProduct(updatedProduct)
                    if (result.isSuccess) {
                        onBack()
                    }
                } else if (listingType == "service" && service != null) {
                    val updatedService = service!!.copy(
                        name = serviceName,
                        description = serviceDescription,
                        basePrice = basePrice.toDoubleOrNull() ?: service!!.basePrice,
                        category = serviceCategory,
                        estimatedDuration = duration.toIntOrNull() ?: service!!.estimatedDuration,
                        expensePerUnit = serviceExpensePerUnit.toDoubleOrNull() ?: 0.0,
                        isActive = isAvailable,
                        updatedAt = System.currentTimeMillis()
                    )
                    
                    val result = ServiceRepository.instance.updateService(updatedService)
                    if (result.isSuccess) {
                        onBack()
                    }
                }
            } catch (e: Exception) {
                println("Error saving changes: ${e.message}")
            } finally {
                isSaving = false
            }
        }
    }

    fun deleteListing() {
        coroutineScope.launch {
            isDeleting = true
            try {
                if (listingType == "product" && product != null) {
                    val result = ProductRepository.instance.deleteProduct(product!!.id)
                    if (result.isSuccess) {
                        onBack()
                    }
                } else if (listingType == "service" && service != null) {
                    val result = ServiceRepository.instance.deleteService(service!!.id)
                    if (result.isSuccess) {
                        onBack()
                    }
                }
            } catch (e: Exception) {
                println("Error deleting listing: ${e.message}")
            } finally {
                isDeleting = false
                showDeleteDialog = false
            }
        }
    }

    Scaffold(
        topBar = {
            ColoredTopBar(
                title = "Edit ${if (listingType == "product") "Product" else "Service"}",
                onBack = onBack,
                cornerRadius = 0.dp
            )
        },
        bottomBar = {
            ChangeListingBottomActions(
                onSave = { saveChanges() },
                onDiscard = onBack,
                onDelete = { showDeleteDialog = true },
                isValid = if (listingType == "product") {
                    productName.isNotBlank() && productPrice.isNotBlank()
                } else {
                    serviceName.isNotBlank() && basePrice.isNotBlank() && duration.isNotBlank()
                },
                isSaving = isSaving,
                isDeleting = isDeleting
            )
        }
    ) { paddingValues ->
        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = HustleColors.BlueAccent)
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(20.dp)
            ) {
                if (listingType == "product") {
                    // Product editing sections
                    ChangeListingImageSection()
                    
                    // Content card with neumorphic styling
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(20.dp))
                            .neumorphic(
                                lightShadowColor = HustleColors.lightShadow,
                                darkShadowColor = HustleColors.darkShadow,
                                elevation = 8.dp,
                                neuInsets = NeuInsets(6.dp, 6.dp),
                                strokeWidth = 4.dp,
                                neuShape = Pressed.Rounded(radius = 8.dp)
                            )
                            .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(20.dp))
                            .padding(24.dp)
                    ) {
                        Column(
                            verticalArrangement = Arrangement.spacedBy(20.dp)
                        ) {
                            ChangeListingBasicInfoSection(
                                name = productName,
                                onNameChange = { productName = it },
                                description = productDescription,
                                onDescriptionChange = { productDescription = it },
                                type = "Product"
                            )
                            
                            ChangeListingPricingSection(
                                price = productPrice,
                                onPriceChange = { productPrice = it },
                                selectedCategory = selectedCategory,
                                onCategorySelect = { selectedCategory = it },
                                categories = categories,
                                showDropdown = showCategoryDropdown,
                                onDropdownToggle = { showCategoryDropdown = it },
                                expensePerUnit = productExpensePerUnit,
                                onExpensePerUnitChange = { productExpensePerUnit = it }
                            )
                            
                            ChangeListingInventorySection(
                                stockQuantity = stockQuantity,
                                onStockChange = { stockQuantity = it }
                            )
                        }
                    }
                } else {
                    // Service editing sections
                    ChangeListingImageSection()
                    
                    // Content card with neumorphic styling
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(20.dp))
                            .neumorphic(
                                lightShadowColor = HustleColors.lightShadow,
                                darkShadowColor = HustleColors.darkShadow,
                                elevation = 8.dp,
                                neuInsets = NeuInsets(6.dp, 6.dp),
                                strokeWidth = 4.dp,
                                neuShape = Pressed.Rounded(radius = 8.dp)
                            )
                            .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(20.dp))
                            .padding(24.dp)
                    ) {
                        Column(
                            verticalArrangement = Arrangement.spacedBy(20.dp)
                        ) {
                            ChangeListingBasicInfoSection(
                                name = serviceName,
                                onNameChange = { serviceName = it },
                                description = serviceDescription,
                                onDescriptionChange = { serviceDescription = it },
                                type = "Service"
                            )
                            
                            ChangeListingServicePricingSection(
                                basePrice = basePrice,
                                onPriceChange = { basePrice = it },
                                duration = duration,
                                onDurationChange = { duration = it },
                                selectedCategory = serviceCategory,
                                onCategorySelect = { serviceCategory = it },
                                categories = serviceCategories,
                                expensePerUnit = serviceExpensePerUnit,
                                onExpensePerUnitChange = { serviceExpensePerUnit = it }
                            )
                            
                            ChangeListingServiceDetailsSection(
                                isAvailable = isAvailable,
                                onAvailabilityChange = { isAvailable = it }
                            )
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(80.dp))
            }
        }
    }
    
    // Delete confirmation dialog
    if (showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = {
                Text("Delete ${if (listingType == "product") "Product" else "Service"}")
            },
            text = {
                Text("Are you sure you want to delete this ${listingType}? This action cannot be undone.")
            },
            confirmButton = {
                TextButton(
                    onClick = { deleteListing() },
                    colors = ButtonDefaults.textButtonColors(
                        contentColor = Color.Red
                    )
                ) {
                    Text("Delete")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
private fun ChangeListingImageSection() {
    Column {
        Text(
            text = "Images",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black,
            fontFamily = fontFamily
        )
        
        Spacer(modifier = Modifier.height(12.dp))
        
        Surface(
            modifier = Modifier
                .size(120.dp)
                .clickable { /* TODO: Image picker */ },
            shape = RoundedCornerShape(12.dp),
            color = HustleColors.LightestBlue,
            border = BorderStroke(2.dp, HustleColors.Primary.copy(alpha = 0.3f))
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Icon(
                    imageVector = Icons.Filled.CameraAlt,
                    contentDescription = "Change Photo",
                    tint = HustleColors.Primary.copy(alpha = 0.6f),
                    modifier = Modifier.size(32.dp)
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Change Image",
                    fontSize = 12.sp,
                    color = HustleColors.Primary.copy(alpha = 0.6f),
                    fontFamily = fontFamily
                )
            }
        }
    }
}

@Composable
private fun ChangeListingBasicInfoSection(
    name: String,
    onNameChange: (String) -> Unit,
    description: String,
    onDescriptionChange: (String) -> Unit,
    type: String
) {
    Column {
        Text(
            text = "Basic Information",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black,
            fontFamily = fontFamily
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        OutlinedTextField(
            value = name,
            onValueChange = onNameChange,
            label = { Text("$type Name") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = HustleColors.BlueAccent,
                focusedLabelColor = HustleColors.BlueAccent
            )
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        OutlinedTextField(
            value = description,
            onValueChange = onDescriptionChange,
            label = { Text("Description") },
            modifier = Modifier
                .fillMaxWidth()
                .height(120.dp),
            maxLines = 5,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = HustleColors.BlueAccent,
                focusedLabelColor = HustleColors.BlueAccent
            )
        )
    }
}

@Composable
private fun ChangeListingPricingSection(
    price: String,
    onPriceChange: (String) -> Unit,
    selectedCategory: String,
    onCategorySelect: (String) -> Unit,
    categories: List<String>,
    showDropdown: Boolean,
    onDropdownToggle: (Boolean) -> Unit,
    expensePerUnit: String,
    onExpensePerUnitChange: (String) -> Unit
) {
    Column {
        Text(
            text = "Pricing & Category",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black,
            fontFamily = fontFamily
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Row(
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            OutlinedTextField(
                value = price,
                onValueChange = onPriceChange,
                label = { Text("Price ($)") },
                modifier = Modifier.weight(1f),
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = HustleColors.BlueAccent,
                    focusedLabelColor = HustleColors.BlueAccent
                )
            )
            
            OutlinedTextField(
                value = expensePerUnit,
                onValueChange = onExpensePerUnitChange,
                label = { Text("Expense/Unit ($)") },
                modifier = Modifier.weight(1f),
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = HustleColors.BlueAccent,
                    focusedLabelColor = HustleColors.BlueAccent
                )
            )
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Category Dropdown
        Box {
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onDropdownToggle(!showDropdown) },
                shape = RoundedCornerShape(4.dp),
                border = BorderStroke(1.dp, Color.Gray.copy(alpha = 0.5f)),
                color = Color.Transparent
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = selectedCategory,
                        fontSize = 16.sp,
                        color = Color.Black
                    )
                    Icon(
                        imageVector = if (showDropdown) Icons.Filled.ExpandLess else Icons.Filled.ExpandMore,
                        contentDescription = "Dropdown",
                        tint = Color.Gray
                    )
                }
            }
            
            if (showDropdown) {
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .offset(y = 60.dp),
                    shape = RoundedCornerShape(4.dp),
                    shadowElevation = 8.dp,
                    color = Color.White
                ) {
                    LazyColumn(
                        modifier = Modifier.heightIn(max = 200.dp)
                    ) {
                        itemsIndexed(categories) { index, category ->
                            Text(
                                text = category,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        onCategorySelect(category)
                                        onDropdownToggle(false)
                                    }
                                    .padding(16.dp),
                                fontSize = 16.sp,
                                color = Color.Black
                            )
                            if (index < categories.size - 1) {
                                HorizontalDivider(
                                    color = Color.Gray.copy(alpha = 0.2f),
                                    thickness = 1.dp
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ChangeListingServicePricingSection(
    basePrice: String,
    onPriceChange: (String) -> Unit,
    duration: String,
    onDurationChange: (String) -> Unit,
    selectedCategory: String,
    onCategorySelect: (String) -> Unit,
    categories: List<String>,
    expensePerUnit: String,
    onExpensePerUnitChange: (String) -> Unit
) {
    Column {
        Text(
            text = "Pricing & Duration",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black,
            fontFamily = fontFamily
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Row(
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            OutlinedTextField(
                value = basePrice,
                onValueChange = onPriceChange,
                label = { Text("Base Price ($)") },
                modifier = Modifier.weight(1f),
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = HustleColors.BlueAccent,
                    focusedLabelColor = HustleColors.BlueAccent
                )
            )
            
            OutlinedTextField(
                value = duration,
                onValueChange = onDurationChange,
                label = { Text("Duration (min)") },
                modifier = Modifier.weight(1f),
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = HustleColors.BlueAccent,
                    focusedLabelColor = HustleColors.BlueAccent
                )
            )
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        OutlinedTextField(
            value = expensePerUnit,
            onValueChange = onExpensePerUnitChange,
            label = { Text("Expense Per Service ($)") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = HustleColors.BlueAccent,
                focusedLabelColor = HustleColors.BlueAccent
            )
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = "Category: $selectedCategory",
            fontSize = 16.sp,
            color = Color.Black,
            fontFamily = fontFamily
        )
    }
}

@Composable
private fun ChangeListingInventorySection(
    stockQuantity: String,
    onStockChange: (String) -> Unit
) {
    Column {
        Text(
            text = "Inventory",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black,
            fontFamily = fontFamily
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        OutlinedTextField(
            value = stockQuantity,
            onValueChange = onStockChange,
            label = { Text("Stock Quantity") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = HustleColors.BlueAccent,
                focusedLabelColor = HustleColors.BlueAccent
            )
        )
    }
}

@Composable
private fun ChangeListingServiceDetailsSection(
    isAvailable: Boolean,
    onAvailabilityChange: (Boolean) -> Unit
) {
    Column {
        Text(
            text = "Service Details",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black,
            fontFamily = fontFamily
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            Switch(
                checked = isAvailable,
                onCheckedChange = onAvailabilityChange,
                colors = SwitchDefaults.colors(
                    checkedThumbColor = HustleColors.BlueAccent,
                    checkedTrackColor = HustleColors.BlueAccent.copy(alpha = 0.3f)
                )
            )
            
            Spacer(modifier = Modifier.width(12.dp))
            
            Text(
                text = if (isAvailable) "Service Available" else "Service Unavailable",
                fontSize = 16.sp,
                color = Color.Black,
                fontFamily = fontFamily
            )
        }
    }
}

@Composable
private fun ChangeListingBottomActions(
    onSave: () -> Unit,
    onDiscard: () -> Unit,
    onDelete: () -> Unit = {},
    isValid: Boolean,
    isSaving: Boolean,
    isDeleting: Boolean = false
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth(),
        shadowElevation = 8.dp,
        color = Color.White
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedButton(
                onClick = onDelete,
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(1.dp, Color.Red),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = Color.Red
                )
            ) {
                if (isDeleting) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(16.dp),
                        color = Color.Red,
                        strokeWidth = 2.dp
                    )
                } else {
                    Text("Delete")
                }
            }
            
            OutlinedButton(
                onClick = onDiscard,
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(1.dp, HustleColors.BlueAccent)
            ) {
                Text("Discard", color = HustleColors.BlueAccent)
            }
            
            Button(
                onClick = onSave,
                enabled = isValid && !isSaving && !isDeleting,
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = HustleColors.BlueAccent
                )
            ) {
                if (isSaving) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(16.dp),
                        color = Color.White,
                        strokeWidth = 2.dp
                    )
                } else {
                    Text("Save", color = Color.White)
                }
            }
        }
    }
}
