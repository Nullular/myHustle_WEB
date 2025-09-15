package com.blueclipse.myhustle.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.ViewModule
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import java.time.LocalDate
import java.time.LocalTime

/**
 * Represents a simple product in the catalog.
 */
data class Product(
    val id: String,
    val name: String,
    val description: String,
    val price: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CatalogScreen(
    onBack: () -> Unit
) {
    // Sample products; replace with real data source
    val products = remember {
        listOf(
            Product("p1", "Service A", "Description A", "$10"),
            Product("p2", "Service B", "Description B", "$20"),
            Product("p3", "Service C", "Description C", "$30")
        )
    }

    var isGrid by rememberSaveable { mutableStateOf(true) }
    var showBookingDialog by remember { mutableStateOf(false) }
    var selectedProduct by remember { mutableStateOf<Product?>(null) }
    var selectedDate by remember { mutableStateOf<LocalDate?>(null) }
    var selectedTime by remember { mutableStateOf<LocalTime?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Catalog & Booking") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.CalendarToday, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { isGrid = false }) {
                        Icon(Icons.Default.List, contentDescription = "List View")
                    }
                    IconButton(onClick = { isGrid = true }) {
                        Icon(Icons.Default.ViewModule, contentDescription = "Grid View")
                    }
                }
            )
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding)) {
            if (isGrid) {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    items(products) { product ->
                        ProductCard(
                            product = product,
                            onBook = {
                                selectedProduct = product
                                showBookingDialog = true
                            }
                        )
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(products) { product ->
                        ProductCard(
                            product = product,
                            onBook = {
                                selectedProduct = product
                                showBookingDialog = true
                            }
                        )
                    }
                }
            }

            if (showBookingDialog && selectedProduct != null) {
                BookingDialog(
                    product = selectedProduct!!,
                    onDateSelected = { date -> selectedDate = date },
                    onTimeSelected = { time -> selectedTime = time },
                    onConfirm = {
                        // TODO: handle booking confirmation logic
                        showBookingDialog = false
                    },
                    onDismiss = { showBookingDialog = false }
                )
            }
        }
    }
}

@Composable
private fun ProductCard(
    product: Product,
    onBook: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onBook() },
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(product.name, style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(4.dp))
            Text(product.description, style = MaterialTheme.typography.bodyMedium)
            Spacer(modifier = Modifier.height(8.dp))
            Text(product.price, style = MaterialTheme.typography.labelLarge)
            Spacer(modifier = Modifier.height(8.dp))
            Button(onClick = onBook, modifier = Modifier.align(Alignment.End)) {
                Text("Book")
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun BookingDialog(
    product: Product,
    onDateSelected: (LocalDate) -> Unit,
    onTimeSelected: (LocalTime) -> Unit,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Book ${product.name}") },
        text = {
            Column {
                Text("Select date and time:")
                Spacer(modifier = Modifier.height(8.dp))
                // TODO: Replace with real DatePicker and TimePicker components
                DatePickerPlaceholder(onDateSelected)
                Spacer(modifier = Modifier.height(8.dp))
                TimePickerPlaceholder(onTimeSelected)
            }
        },
        confirmButton = {
            TextButton(onClick = onConfirm) {
                Text("Confirm")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Composable
private fun DatePickerPlaceholder(onDateSelected: (LocalDate) -> Unit) {
    // TODO: Integrate Material3 DatePicker or AndroidView date picker
    Text("[Date Picker]")
}

@Composable
private fun TimePickerPlaceholder(onTimeSelected: (LocalTime) -> Unit) {
    // TODO: Integrate Material3 TimePicker or AndroidView time picker
    Text("[Time Picker]")
}
