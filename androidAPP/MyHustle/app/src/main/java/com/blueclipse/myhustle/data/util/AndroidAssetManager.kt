package com.blueclipse.myhustle.data.util

import android.content.Context
import android.graphics.BitmapFactory
import android.net.Uri
import android.util.Log
import java.io.File
import java.io.FileOutputStream
import java.io.IOException

/**
 * Android Assets Manager for shop assets
 * Handles assets stored in app/src/main/assets/shop_assets/
 */
object AndroidAssetManager {
    
    private const val ASSETS_BASE_PATH = "shop_assets"
    
    data class AssetItem(
        val name: String,
        val path: String,
        val type: AssetType
    )
    
    enum class AssetType {
        LOGO, BANNER, CATALOG_ITEM
    }
    
    /**
     * Get all available shop assets from the assets folder
     */
    fun getAvailableAssets(context: Context): Map<String, List<AssetItem>> {
        val assetsMap = mutableMapOf<String, List<AssetItem>>()
        
        try {
            val assetManager = context.assets
            
            // List shop folders in assets/shop_assets/
            val shopFolders = assetManager.list(ASSETS_BASE_PATH) ?: return emptyMap()
            
            shopFolders.forEach { shopFolder ->
                val shopAssets = mutableListOf<AssetItem>()
                
                // Check for logos
                try {
                    val logoPath = "$ASSETS_BASE_PATH/$shopFolder/logo"
                    val logoFiles = assetManager.list(logoPath) ?: emptyArray()
                    logoFiles.forEach { logoFile ->
                        if (isImageFile(logoFile)) {
                            shopAssets.add(
                                AssetItem(
                                    name = logoFile,
                                    path = "$logoPath/$logoFile",
                                    type = AssetType.LOGO
                                )
                            )
                        }
                    }
                } catch (e: IOException) {
                    // Logo folder might not exist
                }
                
                // Check for banners
                try {
                    val bannerPath = "$ASSETS_BASE_PATH/$shopFolder/banner"
                    val bannerFiles = assetManager.list(bannerPath) ?: emptyArray()
                    bannerFiles.forEach { bannerFile ->
                        if (isImageFile(bannerFile)) {
                            shopAssets.add(
                                AssetItem(
                                    name = bannerFile,
                                    path = "$bannerPath/$bannerFile",
                                    type = AssetType.BANNER
                                )
                            )
                        }
                    }
                } catch (e: IOException) {
                    // Banner folder might not exist
                }
                
                // Check for catalog items
                try {
                    val catalogPath = "$ASSETS_BASE_PATH/$shopFolder/catalog"
                    val catalogFiles = assetManager.list(catalogPath) ?: emptyArray()
                    catalogFiles.forEach { catalogFile ->
                        if (isImageFile(catalogFile)) {
                            shopAssets.add(
                                AssetItem(
                                    name = catalogFile,
                                    path = "$catalogPath/$catalogFile",
                                    type = AssetType.CATALOG_ITEM
                                )
                            )
                        }
                    }
                } catch (e: IOException) {
                    // Catalog folder might not exist
                }
                
                if (shopAssets.isNotEmpty()) {
                    assetsMap[shopFolder] = shopAssets
                    Log.d("AndroidAssetManager", "✅ Found ${shopAssets.size} assets for shop: $shopFolder")
                }
            }
            
        } catch (e: Exception) {
            Log.e("AndroidAssetManager", "❌ Error scanning assets", e)
        }
        
        return assetsMap
    }
    
    /**
     * Copy asset from assets folder to internal storage and return URI
     */
    fun copyAssetToFile(context: Context, assetPath: String): Uri? {
        return try {
            val assetManager = context.assets
            val inputStream = assetManager.open(assetPath)
            
            // Create internal file
            val fileName = assetPath.substringAfterLast("/")
            val outputFile = File(context.filesDir, "temp_assets")
            outputFile.mkdirs()
            val file = File(outputFile, "${System.currentTimeMillis()}_$fileName")
            
            // Copy asset to file
            val outputStream = FileOutputStream(file)
            inputStream.copyTo(outputStream)
            inputStream.close()
            outputStream.close()
            
            Uri.fromFile(file)
        } catch (e: Exception) {
            Log.e("AndroidAssetManager", "Failed to copy asset: $assetPath", e)
            null
        }
    }
    
    /**
     * Get asset as drawable resource (for preview)
     */
    fun getAssetDrawable(context: Context, assetPath: String) = try {
        val inputStream = context.assets.open(assetPath)
        val bitmap = BitmapFactory.decodeStream(inputStream)
        inputStream.close()
        bitmap
    } catch (e: Exception) {
        null
    }
    
    private fun isImageFile(fileName: String): Boolean {
        val extension = fileName.substringAfterLast(".", "").lowercase()
        return extension in listOf("jpg", "jpeg", "png", "webp", "bmp")
    }
    
    /**
     * Quick setup for Tech Repairs using assets
     */
    fun getTechRepairsQuickSetup(context: Context): Map<String, Any> {
        val allAssets = getAvailableAssets(context)
        val techAssets = allAssets["tech_repairs"] ?: allAssets["tech-repairs"] ?: emptyList()
        
        val logoAsset = techAssets.find { it.type == AssetType.LOGO }
        val bannerAsset = techAssets.find { it.type == AssetType.BANNER }
        
        return mapOf(
            "name" to "Tech Repairs & Services",
            "description" to "Professional smartphone and laptop repair services with quick turnaround times and quality guarantee.",
            "category" to "Technology & Electronics",
            "address" to "456 Tech Boulevard, Digital District",
            "phone" to "+1 (555) 234-5678",
            "email" to "contact@techrepairs.com",
            "logoUri" to (logoAsset?.let { copyAssetToFile(context, it.path) } ?: ""),
            "bannerUri" to (bannerAsset?.let { copyAssetToFile(context, it.path) } ?: ""),
            "hasAssets" to (logoAsset != null || bannerAsset != null)
        )
    }
}
