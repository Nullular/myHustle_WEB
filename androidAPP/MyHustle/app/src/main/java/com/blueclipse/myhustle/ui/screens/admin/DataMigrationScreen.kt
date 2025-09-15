package com.blueclipse.myhustle.ui.screens.admin

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.blueclipse.myhustle.data.migration.ShopHoursMigration
import com.blueclipse.myhustle.ui.components.ColoredTopBar
import kotlinx.coroutines.launch

/**
 * Admin screen to run data migrations
 * This should only be accessible to developers/admins
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DataMigrationScreen(
    onBack: () -> Unit
) {
    var isRunning by remember { mutableStateOf(false) }
    var migrationResult by remember { mutableStateOf<String?>(null) }
    val coroutineScope = rememberCoroutineScope()
    
    Scaffold(
        topBar = {
            ColoredTopBar(
                title = "Data Migration",
                onBack = onBack,
                cornerRadius = 24.dp
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "Shop Operating Hours Migration",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold
            )
            
            Text(
                text = "This will update existing shops to use the new openTime24/closeTime24 fields " +
                      "instead of the legacy availability string. Only shops that don't already have " +
                      "operating hours set will be updated.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Button(
                onClick = {
                    if (!isRunning) {
                        isRunning = true
                        migrationResult = null
                        coroutineScope.launch {
                            try {
                                ShopHoursMigration.migrateShopHours()
                                migrationResult = "Migration completed successfully!"
                            } catch (e: Exception) {
                                migrationResult = "Migration failed: ${e.message}"
                            } finally {
                                isRunning = false
                            }
                        }
                    }
                },
                enabled = !isRunning,
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary
                )
            ) {
                if (isRunning) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(16.dp),
                        color = MaterialTheme.colorScheme.onPrimary,
                        strokeWidth = 2.dp
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                }
                Text(if (isRunning) "Running Migration..." else "Run Migration")
            }
            
            migrationResult?.let { result ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = if (result.contains("successfully")) {
                            Color(0xFF4CAF50).copy(alpha = 0.1f)
                        } else {
                            Color(0xFFF44336).copy(alpha = 0.1f)
                        }
                    )
                ) {
                    Text(
                        text = result,
                        modifier = Modifier.padding(16.dp),
                        color = if (result.contains("successfully")) {
                            Color(0xFF4CAF50)
                        } else {
                            Color(0xFFF44336)
                        },
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Text(
                text = "⚠️ Warning: This operation modifies your database. " +
                      "Make sure you have a backup before proceeding.",
                style = MaterialTheme.typography.bodySmall,
                color = Color(0xFFFF9800),
                fontWeight = FontWeight.Medium
            )
        }
    }
}
