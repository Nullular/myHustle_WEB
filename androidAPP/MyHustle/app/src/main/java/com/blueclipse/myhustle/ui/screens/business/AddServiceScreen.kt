package com.blueclipse.myhustle.ui.screens.business

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
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
import com.blueclipse.myhustle.ui.components.ColoredTopBar
import com.blueclipse.myhustle.ui.theme.HustleColors
import com.blueclipse.myhustle.data.Constants.Categories.ALL_CATEGORIES
import com.blueclipse.myhustle.ui.theme.fontFamily
import me.nikhilchaudhari.library.NeuInsets
import me.nikhilchaudhari.library.neumorphic
import me.nikhilchaudhari.library.shapes.Punched

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddServiceScreen(
    onBack: () -> Unit = {},
    onSaveService: (ServiceData) -> Unit = {}
) {
    var serviceName by remember { mutableStateOf("") }
    var serviceDescription by remember { mutableStateOf("") }
    var basePrice by remember { mutableStateOf("") }
    var duration by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("Health & Wellness") }
    var showCategoryDropdown by remember { mutableStateOf(false) }
    var isAvailable by remember { mutableStateOf(true) }
    var allowsMultiDayBooking by remember { mutableStateOf(false) }
    var maxBookingsPerDay by remember { mutableStateOf("") }
    var advanceBookingDays by remember { mutableStateOf("30") }
    var expensePerUnit by remember { mutableStateOf("") }
    
    val serviceCategories = ALL_CATEGORIES

    Scaffold(
        topBar = {
            ColoredTopBar(
                title = "Add New Service",
                onBack = onBack,
                cornerRadius = 0.dp
            )
        },
        bottomBar = {
            ServiceBottomActions(
                onSave = {
                    val serviceData = ServiceData(
                        name = serviceName,
                        description = serviceDescription,
                        basePrice = basePrice.toDoubleOrNull() ?: 0.0,
                        duration = duration,
                        category = selectedCategory,
                        isAvailable = isAvailable,
                        allowsMultiDayBooking = allowsMultiDayBooking,
                        maxBookingsPerDay = maxBookingsPerDay.toIntOrNull() ?: 10,
                        advanceBookingDays = advanceBookingDays.toIntOrNull() ?: 30,
                        expensePerUnit = expensePerUnit.toDoubleOrNull() ?: 0.0
                    )
                    onSaveService(serviceData)
                },
                onDiscard = onBack,
                isValid = serviceName.isNotBlank() && basePrice.isNotBlank() && duration.isNotBlank()
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
            // Service Images Section
            ServiceImageSection()
            
            // Basic Information
            ServiceBasicInfoSection(
                serviceName = serviceName,
                onNameChange = { serviceName = it },
                serviceDescription = serviceDescription,
                onDescriptionChange = { serviceDescription = it }
            )
            
            // Pricing & Duration
            ServicePricingSection(
                basePrice = basePrice,
                onPriceChange = { basePrice = it },
                duration = duration,
                onDurationChange = { duration = it },
                expensePerUnit = expensePerUnit,
                onExpensePerUnitChange = { expensePerUnit = it }
            )
            
            // Category & Availability
            ServiceCategorySection(
                selectedCategory = selectedCategory,
                onCategorySelect = { selectedCategory = it },
                categories = serviceCategories,
                showDropdown = showCategoryDropdown,
                onDropdownToggle = { showCategoryDropdown = it },
                isAvailable = isAvailable,
                onAvailabilityChange = { isAvailable = it },
                allowsMultiDayBooking = allowsMultiDayBooking,
                onMultiDayBookingChange = { allowsMultiDayBooking = it }
            )
            
            // Booking Configuration
            ServiceBookingSection(
                maxBookingsPerDay = maxBookingsPerDay,
                onMaxBookingsChange = { maxBookingsPerDay = it },
                advanceBookingDays = advanceBookingDays,
                onAdvanceBookingChange = { advanceBookingDays = it }
            )
            
            Spacer(modifier = Modifier.height(80.dp))
        }
    }
}

@Composable
private fun ServiceImageSection() {
    Column {
        Text(
            text = "Service Images",
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
private fun ServiceBasicInfoSection(
    serviceName: String,
    onNameChange: (String) -> Unit,
    serviceDescription: String,
    onDescriptionChange: (String) -> Unit
) {
    Column {
        Text(
            text = "Service Details",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black,
            fontFamily = fontFamily
        )
        
        Spacer(modifier = Modifier.height(12.dp))
        
        ElevatedTextField(
            value = serviceName,
            onValueChange = onNameChange,
            label = "Service Name",
            modifier = Modifier.fillMaxWidth()
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        ElevatedTextField(
            value = serviceDescription,
            onValueChange = onDescriptionChange,
            label = "Service Description",
            placeholder = "Describe what's included in this service...",
            modifier = Modifier
                .fillMaxWidth()
                .height(120.dp),
            maxLines = 4
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ServicePricingSection(
    basePrice: String,
    onPriceChange: (String) -> Unit,
    duration: String,
    onDurationChange: (String) -> Unit,
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
        
        Spacer(modifier = Modifier.height(12.dp))
        
        Row(
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            ElevatedTextField(
                value = basePrice,
                onValueChange = onPriceChange,
                label = "Base Price",
                modifier = Modifier.weight(1f),
                leadingIcon = {
                    Text("$", fontWeight = FontWeight.Bold, color = HustleColors.BlueAccent)
                },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal)
            )
            
            ElevatedTextField(
                value = duration,
                onValueChange = onDurationChange,
                label = "Duration",
                placeholder = "e.g., 1 hour",
                modifier = Modifier.weight(1f)
            )
        }
        
        Spacer(modifier = Modifier.height(12.dp))
        
        ElevatedTextField(
            value = expensePerUnit,
            onValueChange = onExpensePerUnitChange,
            label = "Expense Per Service",
            modifier = Modifier.fillMaxWidth(),
            leadingIcon = {
                Text("$", fontWeight = FontWeight.Bold, color = HustleColors.BlueAccent)
            },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal)
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ServiceCategorySection(
    selectedCategory: String,
    onCategorySelect: (String) -> Unit,
    categories: List<String>,
    showDropdown: Boolean,
    onDropdownToggle: (Boolean) -> Unit,
    isAvailable: Boolean,
    onAvailabilityChange: (Boolean) -> Unit,
    allowsMultiDayBooking: Boolean,
    onMultiDayBookingChange: (Boolean) -> Unit
) {
    Column {
        Text(
            text = "Category & Availability",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black,
            fontFamily = fontFamily
        )
        
        Spacer(modifier = Modifier.height(12.dp))
        
        Box {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
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
                    .clickable { onDropdownToggle(!showDropdown) }
            ) {
                OutlinedTextField(
                    value = selectedCategory,
                    onValueChange = { },
                    label = { Text("Service Category") },
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
                        disabledBorderColor = Color.Transparent,
                        disabledLabelColor = HustleColors.BlueAccent,
                        disabledTextColor = Color.Black,
                        disabledContainerColor = Color.Transparent
                    )
                )
            }
            
            DropdownMenu(
                expanded = showDropdown,
                onDismissRequest = { onDropdownToggle(false) }
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
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.fillMaxWidth()
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
            Column {
                Text(
                    text = "Service Available",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color.Black
                )
                Text(
                    text = if (isAvailable) "Customers can book this service" else "Service temporarily unavailable",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.fillMaxWidth()
        ) {
            Switch(
                checked = allowsMultiDayBooking,
                onCheckedChange = onMultiDayBookingChange,
                colors = SwitchDefaults.colors(
                    checkedThumbColor = HustleColors.BlueAccent,
                    checkedTrackColor = HustleColors.BlueAccent.copy(alpha = 0.3f)
                )
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(
                    text = "Allow Multi-Day Booking",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color.Black
                )
                Text(
                    text = if (allowsMultiDayBooking) "Customers can book multiple consecutive days" else "Single day bookings only",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ServiceBookingSection(
    maxBookingsPerDay: String,
    onMaxBookingsChange: (String) -> Unit,
    advanceBookingDays: String,
    onAdvanceBookingChange: (String) -> Unit
) {
    Column {
        Text(
            text = "Booking Configuration",
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
                value = maxBookingsPerDay,
                onValueChange = onMaxBookingsChange,
                label = "Max Bookings/Day",
                placeholder = "10",
                modifier = Modifier.weight(1f),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
            )
            
            ElevatedTextField(
                value = advanceBookingDays,
                onValueChange = onAdvanceBookingChange,
                label = "Advance Booking (days)",
                placeholder = "30",
                modifier = Modifier.weight(1f),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
            )
        }
        
        Spacer(modifier = Modifier.height(8.dp))
        
        Text(
            text = "Configure how far in advance customers can book and daily capacity limits",
            fontSize = 12.sp,
            color = Color.Gray,
            lineHeight = 16.sp
        )
    }
}

@Composable
private fun ServiceBottomActions(
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
                .padding(16.dp),
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
                Text("Save Service", color = Color.White)
            }
        }
    }
}

data class ServiceData(
    val name: String,
    val description: String,
    val basePrice: Double,
    val duration: String,
    val category: String,
    val isAvailable: Boolean,
    val allowsMultiDayBooking: Boolean,
    val maxBookingsPerDay: Int,
    val advanceBookingDays: Int,
    val expensePerUnit: Double
)

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
