package com.blueclipse.myhustle.data.util

import android.content.Context
import android.net.Uri
import android.util.Log
import java.io.File

/**
 * Manages local shop assets from the SHOP_ASSETS folder
 * Provides access to logos, banners, and catalog images for store creation
 */
object LocalAssetManager {
    
    private const val ASSETS_FOLDER = "SHOP_ASSETS"
    
    data class ShopAssets(
        val shopName: String,
        val logoFiles: List<File> = emptyList(),
        val bannerFiles: List<File> = emptyList(),
        val catalogFiles: List<File> = emptyList()
    )
    
    /**
     * Scan the SHOP_ASSETS folder and return organized assets by shop
     */
    fun getAvailableShopAssets(context: Context): Map<String, ShopAssets> {
        val assetsMap = mutableMapOf<String, ShopAssets>()
        
        try {
            // Get the app's external files directory (where SHOP_ASSETS should be placed)
            val appDir = File(context.getExternalFilesDir(null)?.parent ?: return emptyMap())
            val shopAssetsDir = File(appDir.parent, ASSETS_FOLDER)
            
            Log.d("LocalAssetManager", "🔍 Looking for assets in: ${shopAssetsDir.absolutePath}")
            
            if (!shopAssetsDir.exists()) {
                Log.w("LocalAssetManager", "⚠️ SHOP_ASSETS folder not found at: ${shopAssetsDir.absolutePath}")
                return emptyMap()
            }
            
            // Scan each shop folder
            shopAssetsDir.listFiles()?.forEach { shopFolder ->
                if (shopFolder.isDirectory) {
                    val shopName = shopFolder.name
                    Log.d("LocalAssetManager", "📁 Found shop folder: $shopName")
                    
                    val storeAssetsDir = File(shopFolder, "store_assets")
                    if (storeAssetsDir.exists()) {
                        val shopAssets = ShopAssets(
                            shopName = shopName,
                            logoFiles = getFilesFromFolder(File(storeAssetsDir, "logo")),
                            bannerFiles = getFilesFromFolder(File(storeAssetsDir, "banner")),
                            catalogFiles = getFilesFromFolder(File(storeAssetsDir, "catalog"))
                        )
                        
                        assetsMap[shopName] = shopAssets
                        Log.d("LocalAssetManager", "✅ $shopName: ${shopAssets.logoFiles.size} logos, ${shopAssets.bannerFiles.size} banners, ${shopAssets.catalogFiles.size} catalog items")
                    }
                }
            }
        } catch (e: Exception) {
            Log.e("LocalAssetManager", "❌ Error scanning shop assets", e)
        }
        
        return assetsMap
    }
    
    /**
     * Get all image files from a specific folder
     */
    private fun getFilesFromFolder(folder: File): List<File> {
        if (!folder.exists() || !folder.isDirectory) return emptyList()
        
        return folder.listFiles { file ->
            file.isFile && file.extension.lowercase() in listOf("jpg", "jpeg", "png", "webp")
        }?.toList() ?: emptyList()
    }
    
    /**
     * Copy asset to app's internal storage and return URI
     */
    fun copyAssetToInternal(context: Context, sourceFile: File): Uri? {
        return try {
            val internalDir = File(context.filesDir, "imported_assets")
            internalDir.mkdirs()
            
            val destinationFile = File(internalDir, "${System.currentTimeMillis()}_${sourceFile.name}")
            sourceFile.copyTo(destinationFile, overwrite = true)
            
            Uri.fromFile(destinationFile)
        } catch (e: Exception) {
            Log.e("LocalAssetManager", "Failed to copy asset: ${sourceFile.absolutePath}", e)
            null
        }
    }
    
    /**
     * Get assets specifically for the tech repairs shop
     */
    fun getTechRepairsAssets(context: Context): ShopAssets? {
        val allAssets = getAvailableShopAssets(context)
        return allAssets["tech repairs"] ?: allAssets["tech_repairs"]
    }
    
    /**
     * Create sample store data using local assets
     */
    fun createStoreFromAssets(context: Context, shopName: String): Map<String, Uri> {
        val assets = getAvailableShopAssets(context)[shopName] ?: return emptyMap()
        val result = mutableMapOf<String, Uri>()
        
        // Copy logo
        assets.logoFiles.firstOrNull()?.let { logoFile ->
            copyAssetToInternal(context, logoFile)?.let { uri ->
                result["logo"] = uri
            }
        }
        
        // Copy banner  
        assets.bannerFiles.firstOrNull()?.let { bannerFile ->
            copyAssetToInternal(context, bannerFile)?.let { uri ->
                result["banner"] = uri
            }
        }
        
        return result
    }
    
    /**
     * Quick setup for tech repairs store using local assets
     */
    fun quickSetupTechRepairs(context: Context): Map<String, Any> {
        val assets = getTechRepairsAssets(context)
        val uris = createStoreFromAssets(context, "tech repairs")
        
        return mapOf(
            "name" to "Tech Repairs & Services",
            "description" to "Professional phone and laptop repairs with quick turnaround times",
            "category" to "Technology Services",
            "address" to "456 Tech Street, Digital District",
            "phone" to "+1 (555) 234-5678",
            "email" to "contact@techrepairs.com",
            "logoUri" to (uris["logo"] ?: ""),
            "bannerUri" to (uris["banner"] ?: ""),
            "assetsAvailable" to (assets != null)
        )
    }
}
