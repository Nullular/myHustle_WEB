'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Crop } from 'lucide-react';
import ReactCrop, { Crop as CropType, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { imageUploadService } from '@/lib/firebase/storage';

export interface ImageUploadWithCropProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  cropType: 'square' | 'banner';
  maxImages?: number;
  className?: string;
  placeholder?: string;
  uploadPath?: string;
}

export const ImageUploadWithCrop: React.FC<ImageUploadWithCropProps> = ({
  images,
  onImagesChange,
  cropType,
  maxImages = 1,
  className = '',
  placeholder,
  uploadPath
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatio = 1; // Always square crop regardless of usage type

  const onSelectFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      // Process files sequentially to avoid crop modal conflicts
      processNextFile(files, 0);
    }
  }, []);

  const processNextFile = (files: File[], index: number) => {
    if (index >= files.length) {
      return; // All files processed
    }

    const file = files[index];
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const imageUrl = reader.result?.toString() || '';
      setImageToCrop(imageUrl);
      setCurrentImageIndex(index);
      // Initialize crop with fixed square dimensions
      const newCrop: CropType = {
        unit: '%',
        width: 60,  // Fixed width
        height: 60, // Fixed height (square)
        x: 20,      // Centered horizontally  
        y: 20,      // Centered vertically
      };
      setCrop(newCrop);
    });
    reader.readAsDataURL(file);
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    // Set fixed square crop on image load
    const newCrop: CropType = {
      unit: '%',
      width: 60,  // Fixed width
      height: 60, // Fixed height (square) 
      x: 20,      // Centered horizontally
      y: 20,      // Centered vertically
    };
    
    setCrop(newCrop);
  }, []);

  const onCropComplete = useCallback((crop: PixelCrop) => {
    setCompletedCrop(crop);
  }, []);

  const getCroppedImg = useCallback((
    image: HTMLImageElement,
    crop: PixelCrop,
    fileName: string
  ): Promise<File> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            throw new Error('Canvas is empty');
          }
          const file = new File([blob], fileName, { type: 'image/jpeg' });
          resolve(file);
        },
        'image/jpeg',
        0.9
      );
    });
  }, []);

  const handleCropConfirm = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !imageToCrop) {
      return;
    }

    try {
      setIsUploading(true);
      
      const croppedFile = await getCroppedImg(
        imgRef.current,
        completedCrop,
        `cropped-image-${Date.now()}.jpg`
      );

      // For single image uploads (like logos), delete existing images first
      if (maxImages === 1 && images.length > 0) {
        console.log('🔄 Replacing existing image...');
        // Delete old image from storage
        for (const oldImageUrl of images) {
          try {
            await imageUploadService.deleteImage(oldImageUrl);
            console.log('🗑️ Old image deleted successfully');
          } catch (deleteError: any) {
            if (deleteError?.code === 'storage/object-not-found') {
              console.warn('⚠️ Old image was already deleted or path not found');
            } else {
              console.warn('⚠️ Could not delete old image from storage:', deleteError.message);
            }
          }
        }
      }

      // Upload to Firebase Storage with proper path
      const finalUploadPath = uploadPath || (cropType === 'square' ? 'products/images' : 'shops/banners');
      const downloadURL = await imageUploadService.uploadImage(croppedFile, finalUploadPath);

      // For single image (logo), replace entirely. For multiple images, add to array
      const newImages = maxImages === 1 ? [downloadURL] : [...images, downloadURL];
      if (newImages.length <= maxImages) {
        onImagesChange(newImages);
      }

      // Reset state
      setImageToCrop(null);
      setCurrentImageIndex(null);
      setCrop(undefined);
      setCompletedCrop(undefined);
      
      console.log('✅ Image uploaded successfully');
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [completedCrop, imageToCrop, images, onImagesChange, maxImages, cropType, getCroppedImg]);

  const handleCropCancel = () => {
    if (imageToCrop) {
      // Clean up the object URL to prevent memory leaks
      URL.revokeObjectURL(imageToCrop);
    }
    setImageToCrop(null);
    setCurrentImageIndex(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  const removeImage = async (index: number) => {
    try {
      const imageUrl = images[index];
      
      // Remove from local state first (immediate UI update)
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
      
      // Try to delete from Firebase Storage (graceful failure)
      try {
        await imageUploadService.deleteImage(imageUrl);
        console.log('🗑️ Image removed successfully from storage');
      } catch (deleteError: any) {
        // Log warning but don't fail the operation if image doesn't exist in storage
        if (deleteError?.code === 'storage/object-not-found') {
          console.warn('⚠️ Image was already deleted from storage or path not found');
        } else {
          console.warn('⚠️ Could not delete image from storage:', deleteError.message);
        }
        // Don't throw error - local removal was successful
      }
      
      console.log('✅ Image removed from list');
    } catch (error) {
      console.error('❌ Error removing image:', error);
      // In case of any other error, you might want to restore the image
      // but for now we'll keep it removed from UI since that's what user expects
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Button - Only show when no images */}
      {images.length === 0 && (
        <div className={`relative ${
          cropType === 'square' ? 'aspect-square' : 'aspect-video'
        } max-w-sm mx-auto`}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onSelectFile}
            accept="image/*"
            multiple={maxImages > 1}
            className="hidden"
            aria-label="Upload images"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors disabled:opacity-50"
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500 text-center px-2">
              {placeholder || `Upload ${cropType === 'square' ? 'square' : 'banner'} image`}
            </span>
            {isUploading && (
              <div className="mt-2 text-xs text-blue-600">Uploading...</div>
            )}
          </button>
        </div>
      )}

      {/* Image Preview Grid - Show uploaded images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {/* Display uploaded images */}
          {images.map((imageUrl, index) => (
            <div key={index} className={`relative group ${
              cropType === 'square' ? 'aspect-square' : 'aspect-video'
            }`}>
              <img
                src={imageUrl}
                alt={`Uploaded ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                aria-label={`Remove image ${index + 1}`}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          {/* Add more images button (if under max limit) */}
          {images.length < maxImages && (
            <div className={`relative ${
              cropType === 'square' ? 'aspect-square' : 'aspect-video'
            }`}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500 text-center px-1">
                      Add Image
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Crop Modal */}
      {imageToCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-4">
              Crop {cropType === 'square' ? 'Square' : 'Banner'} Image
            </h3>
            
            <div className="mb-4">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}  // Force square aspect ratio
                minWidth={150}  // Minimum crop size
                minHeight={150} // Minimum crop size
                maxWidth={300}  // Maximum crop size  
                maxHeight={300} // Maximum crop size
                keepSelection={true}  // Keep selection visible
                disabled={false}  // Allow repositioning but maintain square shape
              >
                <img
                  ref={imgRef}
                  alt="Crop preview"
                  src={imageToCrop}
                  className="max-h-96 max-w-full"
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCropCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropConfirm}
                disabled={!completedCrop || isUploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Crop className="w-4 h-4" />
                    <span>Crop & Upload</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onSelectFile}
        accept="image/*"
        multiple={maxImages > 1}
        className="hidden"
        aria-label="Upload images"
      />
    </div>
  );
};