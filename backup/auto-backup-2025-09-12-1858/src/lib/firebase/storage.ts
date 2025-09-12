import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';
import { imageCropService, CropMode, CropArea, getCropModeForUsage } from '@/lib/utils/imageCrop';

export class ImageUploadService {
  private static instance: ImageUploadService;
  
  static getInstance(): ImageUploadService {
    if (!ImageUploadService.instance) {
      ImageUploadService.instance = new ImageUploadService();
    }
    return ImageUploadService.instance;
  }

  /**
   * Upload an image file to Firebase Storage
   * @param file - The image file to upload
   * @param path - The storage path (e.g., 'products/productId', 'shops/shopId', 'services/serviceId')
   * @param fileName - Optional custom file name
   * @returns Promise<string> - The download URL of the uploaded image
   */
  async uploadImage(file: File, path: string, fileName?: string): Promise<string> {
    try {
      // Validate file type
      if (!this.isValidImageFile(file)) {
        throw new Error('Invalid file type. Please upload an image file (JPEG, PNG, WebP, GIF).');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size too large. Please upload an image smaller than 5MB.');
      }

      // Generate unique filename if not provided
      const fileExtension = file.name.split('.').pop();
      const finalFileName = fileName || `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
      
      // Create storage reference
      const imageRef = ref(storage, `${path}/${finalFileName}`);
      
      console.log('📤 Uploading image to:', `${path}/${finalFileName}`);
      
      // Upload file
      const snapshot = await uploadBytes(imageRef, file);
      console.log('✅ Image uploaded successfully');
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('🔗 Download URL:', downloadURL);
      
      return downloadURL;
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      throw error;
    }
  }

  /**
   * Upload image with automatic cropping based on usage
   * @param file - The image file to upload
   * @param path - The storage path
   * @param usage - The usage type (determines crop mode)
   * @param fileName - Optional custom file name
   * @returns Promise<string> - The download URL of the uploaded image
   */
  async uploadImageWithCrop(
    file: File,
    path: string,
    usage: 'product' | 'service' | 'store-logo' | 'store-banner',
    fileName?: string
  ): Promise<string> {
    try {
      // Validate file type
      if (!this.isValidImageFile(file)) {
        throw new Error('Invalid file type. Please upload an image file (JPEG, PNG, WebP, GIF).');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size too large. Please upload an image smaller than 5MB.');
      }

      const cropMode = getCropModeForUsage(usage);
      console.log(`🎨 Auto-cropping image for ${usage} (${cropMode} mode)`);

      // Auto-crop the image
      const croppedFile = await imageCropService.autoCrop(file, cropMode);

      // Upload the cropped image
      return this.uploadImage(croppedFile, path, fileName);
    } catch (error) {
      console.error('❌ Error uploading image with crop:', error);
      throw error;
    }
  }

  /**
   * Upload image with custom crop area
   * @param file - The image file to upload
   * @param path - The storage path
   * @param cropArea - Custom crop area
   * @param cropMode - Crop mode (square or banner)
   * @param fileName - Optional custom file name
   * @returns Promise<string> - The download URL of the uploaded image
   */
  async uploadImageWithCustomCrop(
    file: File,
    path: string,
    cropArea: CropArea,
    cropMode: CropMode,
    fileName?: string
  ): Promise<string> {
    try {
      // Validate file type
      if (!this.isValidImageFile(file)) {
        throw new Error('Invalid file type. Please upload an image file (JPEG, PNG, WebP, GIF).');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size too large. Please upload an image smaller than 5MB.');
      }

      const config = imageCropService.getCropConfig(cropMode);
      console.log(`🎨 Cropping image with custom area (${cropMode} mode)`);

      // Crop the image with custom area
      const croppedFile = await imageCropService.cropImage(file, cropArea, config);

      // Upload the cropped image
      return this.uploadImage(croppedFile, path, fileName);
    } catch (error) {
      console.error('❌ Error uploading image with custom crop:', error);
      throw error;
    }
  }

  /**
   * Upload multiple images
   * @param files - Array of image files
   * @param path - The storage path
   * @returns Promise<string[]> - Array of download URLs
   */
  async uploadMultipleImages(files: File[], path: string): Promise<string[]> {
    const uploadPromises = files.map((file, index) => 
      this.uploadImage(file, path, `image_${index}_${Date.now()}`)
    );
    
    return Promise.all(uploadPromises);
  }

  /**
   * Delete an image from Firebase Storage
   * @param imageUrl - The download URL of the image to delete
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract the storage path from the download URL
      console.log('🗑️ Attempting to delete image:', imageUrl);
      
      // Parse the download URL to extract the storage path
      const url = new URL(imageUrl);
      const pathSegments = url.pathname.split('/');
      
      // Find the path after '/o/' in the URL
      const oIndex = pathSegments.findIndex(segment => segment === 'o');
      if (oIndex === -1 || oIndex === pathSegments.length - 1) {
        throw new Error('Invalid Firebase Storage URL format');
      }
      
      // Get the encoded path and decode it
      const encodedPath = pathSegments[oIndex + 1];
      const decodedPath = decodeURIComponent(encodedPath);
      
      console.log('🗑️ Extracted storage path:', decodedPath);
      
      // Create storage reference using the decoded path
      const imageRef = ref(storage, decodedPath);
      await deleteObject(imageRef);
      
      console.log('🗑️ Image deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting image:', error);
      
      // Don't throw the error if it's object-not-found
      // The image might have already been deleted or never existed
      if (error instanceof Error && error.message.includes('object-not-found')) {
        console.log('ℹ️ Image already deleted or does not exist, continuing...');
        return;
      }
      
      throw error;
    }
  }

  /**
   * Validate if file is a valid image
   */
  private isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    return validTypes.includes(file.type);
  }

  /**
   * Compress image before upload (optional utility)
   * @param file - Original image file
   * @param maxWidth - Maximum width in pixels
   * @param quality - Compression quality (0-1)
   * @returns Promise<File> - Compressed image file
   */
  async compressImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          const compressedFile = new File([blob!], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        }, file.type, quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
}

export const imageUploadService = ImageUploadService.getInstance();