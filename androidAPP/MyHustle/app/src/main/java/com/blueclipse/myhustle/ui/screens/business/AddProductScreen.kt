package com.blueclipse.myhustle.ui.screens.business

import androidx.compose.foundation.background
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.PressInteraction
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.window.Dialog
import com.blueclipse.myhustle.ui.components.ColoredTopBar
import com.blueclipse.myhustle.ui.theme.HustleColors
import com.blueclipse.myhustle.data.Constants.Categories.ALL_CATEGORIES
import com.blueclipse.myhustle.ui.theme.fontFamily
import me.nikhilchaudhari.library.NeuInsets
import me.nikhilchaudhari.library.neumorphic
import me.nikhilchaudhari.library.shapes.Punched

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddProductScreen(
    onBack: () -> Unit = {},
    onSaveProduct: (ProductData) -> Unit = {}
) {
    var productName by remember { mutableStateOf("") }
    var productDescription by remember { mutableStateOf("") }
    var productPrice by remember { mutableStateOf("") }
    var productCategory by remember { mutableStateOf("") }
    var stockQuantity by remember { mutableStateOf("") }
    var productSKU by remember { mutableStateOf("") }
    var expensePerUnit by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("Fashion & Accessories") }
    var showCategoryDropdown by remember { mutableStateOf(false) }
    
    // Variant state
    var variants by remember { mutableStateOf(listOf<ProductVariantData>()) }
    var sizeVariants by remember { mutableStateOf(listOf<SizeVariantData>()) }
    var showVariantDialog by remember { mutableStateOf(false) }
    var showSizeVariantDialog by remember { mutableStateOf(false) }
    
    val categories = ALL_CATEGORIES

    Scaffold(
        topBar = {
            ColoredTopBar(
                title = "Add New Product",
                onBack = onBack,
                cornerRadius = 0.dp
            )
        },
        bottomBar = {
            ProductBottomActions(
                onSave = {
                    val productData = ProductData(
                        name = productName,
                        description = productDescription,
                        price = productPrice.toDoubleOrNull() ?: 0.0,
                        category = selectedCategory,
                        stockQuantity = stockQuantity.toIntOrNull() ?: 0,
                        sku = productSKU,
                        expensePerUnit = expensePerUnit.toDoubleOrNull() ?: 0.0,
                        variants = variants,
                        sizeVariants = sizeVariants
                    )
                    onSaveProduct(productData)
                },
                onDiscard = onBack,
                isValid = productName.isNotBlank() && productPrice.isNotBlank()
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // Product Images Section
            ProductImageSection()
            
            // Basic Information
            ProductBasicInfoSection(
                productName = productName,
                onNameChange = { productName = it },
                productDescription = productDescription,
                onDescriptionChange = { productDescription = it }
            )
            
            // Pricing & Category
            ProductPricingSection(
                productPrice = productPrice,
                onPriceChange = { productPrice = it },
                selectedCategory = selectedCategory,
                onCategorySelect = { selectedCategory = it },
                categories = categories,
                showDropdown = showCategoryDropdown,
                onDropdownToggle = { showCategoryDropdown = it },
                expensePerUnit = expensePerUnit,
                onExpensePerUnitChange = { expensePerUnit = it }
            )
            
            // Inventory Section
            ProductInventorySection(
                stockQuantity = stockQuantity,
                onStockChange = { stockQuantity = it },
                productSKU = productSKU,
                onSKUChange = { productSKU = it }
            )
            
            // Product Variants Section
            ProductVariantsSection(
                variants = variants,
                onAddVariant = { showVariantDialog = true },
                onRemoveVariant = { index ->
                    variants = variants.toMutableList().apply { removeAt(index) }
                }
            )
            
            // Size Variants Section
            SizeVariantsSection(
                sizeVariants = sizeVariants,
                onAddSizeVariant = { showSizeVariantDialog = true },
                onRemoveSizeVariant = { index ->
                    sizeVariants = sizeVariants.toMutableList().apply { removeAt(index) }
                }
            )
            
            Spacer(modifier = Modifier.height(80.dp))
        }
    }
    
    // Variant Dialog
    if (showVariantDialog) {
        AddVariantDialog(
            onDismiss = { showVariantDialog = false },
            onAddVariant = { variant ->
                variants = variants + variant
                showVariantDialog = false
            }
        )
    }
    
    // Size Variant Dialog
    if (showSizeVariantDialog) {
        AddSizeVariantDialog(
            onDismiss = { showSizeVariantDialog = false },
            onAddSizeVariant = { sizeVariant ->
                sizeVariants = sizeVariants + sizeVariant
                showSizeVariantDialog = false
            }
        )
    }
}

@Composable
private fun ProductImageSection() {
    Column {
        Text(
            text = "Product Images",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black,
            fontFamily = fontFamily
        )
        
        Spacer(modifier = Modifier.height(12.dp))
        
        Row(
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Main image placeholder
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
                        contentDescription = "Add Photo",
                        tint = HustleColors.BlueAccent,
                        modifier = Modifier.size(32.dp)
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Main Photo",
                        fontSize = 12.sp,
                        color = HustleColors.BlueAccent
                    )
                }
            }
            
            // Additional images
            repeat(2) {
                Surface(
                    modifier = Modifier
                        .size(120.dp)
                        .clickable { /* TODO: Image picker */ },
                    shape = RoundedCornerShape(12.dp),
                    color = Color.Gray.copy(alpha = 0.1f),
                    border = BorderStroke(1.dp, Color.Gray.copy(alpha = 0.3f))
                ) {
                    Box(
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Add,
                            contentDescription = "Add Photo",
                            tint = Color.Gray,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ProductBasicInfoSection(
    productName: String,
    onNameChange: (String) -> Unit,
    productDescription: String,
    onDescriptionChange: (String) -> Unit
) {
    Column {
        Text(
            text = "Basic Information",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black,
            fontFamily = fontFamily
        )
        
        Spacer(modifier = Modifier.height(12.dp))
        
        ElevatedTextField(
            value = productName,
            onValueChange = onNameChange,
            label = "Product Name",
            modifier = Modifier.fillMaxWidth()
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        ElevatedTextField(
            value = productDescription,
            onValueChange = onDescriptionChange,
            label = "Description",
            modifier = Modifier
                .fillMaxWidth()
                .height(120.dp),
            maxLines = 4
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ProductPricingSection(
    productPrice: String,
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
        
        Spacer(modifier = Modifier.height(12.dp))
        
        Row(
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            ElevatedTextField(
                value = productPrice,
                onValueChange = onPriceChange,
                label = "Price",
                leadingIcon = {
                    Text("$", fontWeight = FontWeight.Bold, color = HustleColors.BlueAccent)
                },
                modifier = Modifier.weight(1f),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal)
            )
            
            ElevatedTextField(
                value = expensePerUnit,
                onValueChange = onExpensePerUnitChange,
                label = "Expense/Unit",
                leadingIcon = {
                    Text("$", fontWeight = FontWeight.Bold, color = HustleColors.BlueAccent)
                },
                modifier = Modifier.weight(1f),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal)
            )
        }
        
        Spacer(modifier = Modifier.height(12.dp))
        
        Row(
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Box(modifier = Modifier.weight(1f)) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onDropdownToggle(!showDropdown) }
                ) {
                    OutlinedTextField(
                        value = selectedCategory,
                        onValueChange = { },
                        label = { Text("Category") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        readOnly = true,
                        enabled = false,
                        trailingIcon = {
                            Icon(
                                imageVector = if (showDropdown) Icons.Filled.ExpandLess else Icons.Filled.ExpandMore,
                                contentDescription = "Dropdown"
                            )
                        },
                        colors = OutlinedTextFieldDefaults.colors(
                            disabledBorderColor = HustleColors.BlueAccent,
                            disabledLabelColor = HustleColors.BlueAccent,
                            disabledTextColor = Color.Black
                        )
                    )
                }
                
                DropdownMenu(
                    expanded = showDropdown,
                    onDismissRequest = { onDropdownToggle(false) },
                    modifier = Modifier.background(androidx.compose.ui.graphics.Color.White)
                ) {
                    categories.forEach { category ->
                        DropdownMenuItem(
                            text = { Text(category) },
                            onClick = {
                                onCategorySelect(category)
                                onDropdownToggle(false)
                            }
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ProductInventorySection(
    stockQuantity: String,
    onStockChange: (String) -> Unit,
    productSKU: String,
    onSKUChange: (String) -> Unit
) {
    Column {
        Text(
            text = "Inventory Management",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black,
            fontFamily = fontFamily
        )
        
        Spacer(modifier = Modifier.height(12.dp))
        
        Row(
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            ElevatedTextField(
                value = stockQuantity,
                onValueChange = onStockChange,
                label = "Stock Quantity",
                modifier = Modifier.weight(1f),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
            )
            
            ElevatedTextField(
                value = productSKU,
                onValueChange = onSKUChange,
                label = "SKU (Optional)",
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
private fun ProductBottomActions(
    onSave: () -> Unit,
    onDiscard: () -> Unit,
    isValid: Boolean
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = Color.White,
        shadowElevation = 8.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 24.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            OutlinedButton(
                onClick = onDiscard,
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(1.dp, Color.Gray)
            ) {
                Text("Discard", color = Color.Gray)
            }
            
            Button(
                onClick = onSave,
                enabled = isValid,
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = HustleColors.BlueAccent
                )
            ) {
                Text("Save Product", color = Color.White)
            }
        }
    }
}

data class ProductData(
    val name: String,
    val description: String,
    val price: Double,
    val category: String,
    val stockQuantity: Int,
    val sku: String,
    val expensePerUnit: Double,
    val variants: List<ProductVariantData> = emptyList(),
    val sizeVariants: List<SizeVariantData> = emptyList()
)

data class ProductVariantData(
    val name: String,
    val value: String,
    val price: Double,
    val imageUrl: String = "",
    val stockQuantity: Int
)

data class SizeVariantData(
    val size: String,
    val price: Double,
    val stockQuantity: Int
)

@Composable
private fun ProductVariantsSection(
    variants: List<ProductVariantData>,
    onAddVariant: () -> Unit,
    onRemoveVariant: (Int) -> Unit
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Product Variants (Optional)",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black,
                fontFamily = fontFamily
            )
            
            OutlinedButton(
                onClick = onAddVariant,
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = HustleColors.BlueAccent
                ),
                border = BorderStroke(1.dp, HustleColors.BlueAccent)
            ) {
                Icon(
                    imageVector = Icons.Filled.Add,
                    contentDescription = "Add Variant",
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text("Add Variant")
            }
        }
        
        Spacer(modifier = Modifier.height(12.dp))
        
        if (variants.isNotEmpty()) {
            variants.forEachIndexed { index, variant ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    shape = RoundedCornerShape(8.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = HustleColors.LightestBlue.copy(alpha = 0.3f)
                    )
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "${variant.name}: ${variant.value}",
                                fontWeight = FontWeight.Medium,
                                fontSize = 14.sp
                            )
                            Text(
                                text = "$${variant.price} • Stock: ${variant.stockQuantity}",
                                fontSize = 12.sp,
                                color = Color.Gray
                            )
                        }
                        
                        IconButton(
                            onClick = { onRemoveVariant(index) }
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Delete,
                                contentDescription = "Remove Variant",
                                tint = Color.Red,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            }
        } else {
            Text(
                text = "No variants added yet",
                fontSize = 14.sp,
                color = Color.Gray,
                modifier = Modifier.padding(vertical = 8.dp)
            )
        }
    }
}

@Composable
private fun SizeVariantsSection(
    sizeVariants: List<SizeVariantData>,
    onAddSizeVariant: () -> Unit,
    onRemoveSizeVariant: (Int) -> Unit
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Size Variants (Optional)",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black,
                fontFamily = fontFamily
            )
            
            OutlinedButton(
                onClick = onAddSizeVariant,
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = HustleColors.BlueAccent
                ),
                border = BorderStroke(1.dp, HustleColors.BlueAccent)
            ) {
                Icon(
                    imageVector = Icons.Filled.Add,
                    contentDescription = "Add Size",
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text("Add Size")
            }
        }
        
        Spacer(modifier = Modifier.height(12.dp))
        
        if (sizeVariants.isNotEmpty()) {
            sizeVariants.forEachIndexed { index, sizeVariant ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    shape = RoundedCornerShape(8.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = HustleColors.LightestBlue.copy(alpha = 0.3f)
                    )
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Size: ${sizeVariant.size}",
                                fontWeight = FontWeight.Medium,
                                fontSize = 14.sp
                            )
                            Text(
                                text = "$${sizeVariant.price} • Stock: ${sizeVariant.stockQuantity}",
                                fontSize = 12.sp,
                                color = Color.Gray
                            )
                        }
                        
                        IconButton(
                            onClick = { onRemoveSizeVariant(index) }
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Delete,
                                contentDescription = "Remove Size",
                                tint = Color.Red,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            }
        } else {
            Text(
                text = "No size variants added yet",
                fontSize = 14.sp,
                color = Color.Gray,
                modifier = Modifier.padding(vertical = 8.dp)
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AddVariantDialog(
    onDismiss: () -> Unit,
    onAddVariant: (ProductVariantData) -> Unit
) {
    var variantName by remember { mutableStateOf("") }
    var variantValue by remember { mutableStateOf("") }
    var variantPrice by remember { mutableStateOf("") }
    var variantStock by remember { mutableStateOf("") }
    
    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = "Add Product Variant",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                
                ElevatedTextField(
                    value = variantName,
                    onValueChange = { variantName = it },
                    label = "Variant Name (e.g., Color, Material)",
                    modifier = Modifier.fillMaxWidth()
                )
                
                ElevatedTextField(
                    value = variantValue,
                    onValueChange = { variantValue = it },
                    label = "Variant Value (e.g., Red, Cotton)",
                    modifier = Modifier.fillMaxWidth()
                )
                
                ElevatedTextField(
                    value = variantPrice,
                    onValueChange = { variantPrice = it },
                    label = "Price",
                    leadingIcon = { Text("$") },
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal)
                )
                
                ElevatedTextField(
                    value = variantStock,
                    onValueChange = { variantStock = it },
                    label = "Stock Quantity",
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
                
                // Image upload placeholder
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(100.dp)
                        .clickable { /* TODO: Image picker */ },
                    shape = RoundedCornerShape(12.dp),
                    color = Color.Gray.copy(alpha = 0.1f),
                    border = BorderStroke(1.dp, Color.Gray.copy(alpha = 0.3f))
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            imageVector = Icons.Filled.CameraAlt,
                            contentDescription = "Add Variant Image",
                            tint = Color.Gray,
                            modifier = Modifier.size(24.dp)
                        )
                        Text(
                            text = "Add Variant Image (Optional)",
                            fontSize = 12.sp,
                            color = Color.Gray
                        )
                    }
                }
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Cancel")
                    }
                    
                    Button(
                        onClick = {
                            if (variantName.isNotBlank() && variantValue.isNotBlank() && 
                                variantPrice.isNotBlank()) {
                                val variant = ProductVariantData(
                                    name = variantName,
                                    value = variantValue,
                                    price = variantPrice.toDoubleOrNull() ?: 0.0,
                                    stockQuantity = variantStock.toIntOrNull() ?: 0
                                )
                                onAddVariant(variant)
                            }
                        },
                        enabled = variantName.isNotBlank() && variantValue.isNotBlank() && variantPrice.isNotBlank(),
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = HustleColors.BlueAccent
                        )
                    ) {
                        Text("Add Variant", color = Color.White)
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AddSizeVariantDialog(
    onDismiss: () -> Unit,
    onAddSizeVariant: (SizeVariantData) -> Unit
) {
    var size by remember { mutableStateOf("") }
    var sizePrice by remember { mutableStateOf("") }
    var sizeStock by remember { mutableStateOf("") }
    
    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = "Add Size Variant",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                
                ElevatedTextField(
                    value = size,
                    onValueChange = { size = it },
                    label = "Size (e.g., Small, Medium, Large, XL)",
                    modifier = Modifier.fillMaxWidth()
                )
                
                ElevatedTextField(
                    value = sizePrice,
                    onValueChange = { sizePrice = it },
                    label = "Price",
                    leadingIcon = { Text("$") },
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal)
                )
                
                ElevatedTextField(
                    value = sizeStock,
                    onValueChange = { sizeStock = it },
                    label = "Stock Quantity",
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Cancel")
                    }
                    
                    Button(
                        onClick = {
                            if (size.isNotBlank() && sizePrice.isNotBlank()) {
                                val sizeVariant = SizeVariantData(
                                    size = size,
                                    price = sizePrice.toDoubleOrNull() ?: 0.0,
                                    stockQuantity = sizeStock.toIntOrNull() ?: 0
                                )
                                onAddSizeVariant(sizeVariant)
                            }
                        },
                        enabled = size.isNotBlank() && sizePrice.isNotBlank(),
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = HustleColors.BlueAccent
                        )
                    ) {
                        Text("Add Size", color = Color.White)
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ElevatedTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    placeholder: String = "",
    modifier: Modifier = Modifier,
    leadingIcon: (@Composable () -> Unit)? = null,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default,
    maxLines: Int = 1
) {
    Box(
        modifier = modifier
            .neumorphic(
                neuShape = Punched.Rounded(12.dp),
                lightShadowColor = HustleColors.lightShadow,
                darkShadowColor = HustleColors.darkShadow,
                elevation = 6.dp,
                neuInsets = NeuInsets(6.dp, 6.dp),
                strokeWidth = 6.dp
            )
            .background(Color.White, RoundedCornerShape(12.dp))
            .clip(RoundedCornerShape(12.dp))
    ) {
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            label = { Text(label) },
            placeholder = if (placeholder.isNotEmpty()) { { Text(placeholder) } } else null,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            leadingIcon = leadingIcon,
            keyboardOptions = keyboardOptions,
            maxLines = maxLines,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Color.Transparent,
                unfocusedBorderColor = Color.Transparent,
                focusedLabelColor = HustleColors.BlueAccent,
                unfocusedContainerColor = Color.Transparent,
                focusedContainerColor = Color.Transparent
            )
        )
    }
}
