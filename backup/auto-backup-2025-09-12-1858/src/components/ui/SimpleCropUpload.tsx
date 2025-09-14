'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  const [zoom, setZoom] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);

  // Fixed aspect ratio for square crops, keep resizable but not reshapeable
  const aspectRatio = 1;

  // Create dynamic zoom style
  const zoomStyle = useMemo(() => ({
    transform: `scale(${zoom})`
  }), [zoom]);

  // Memoized initial crop settings to prevent re-renders
  const initialCrop = useMemo((): CropType => ({
    unit: '%',
    width: 60,
    height: 60,
    x: 20,
    y: 20,
  }), []);

  const onSelectFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      processNextFile(files, 0);
    }
  }, []);

  const processNextFile = useCallback((files: File[], index: number) => {
    if (index >= files.length) {
      return;
    }

    const file = files[index];
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const imageUrl = reader.result?.toString() || '';
      setImageToCrop(imageUrl);
      setCurrentImageIndex(index);
      setCrop(initialCrop);
    });
    reader.readAsDataURL(file);
  }, [initialCrop]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setCrop(initialCrop);
    setZoom(1); // Reset zoom when new image loads
  }, [initialCrop]);

  // Zoom handlers
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prevZoom => Math.max(0.5, Math.min(3, prevZoom + delta)));
  }, []);

  const handleTouchStart = useRef<{ touches: React.TouchList | null; zoom: number }>({ touches: null, zoom: 1 });

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && handleTouchStart.current.touches) {
      e.preventDefault();
      
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      const initialTouch1 = handleTouchStart.current.touches[0];
      const initialTouch2 = handleTouchStart.current.touches[1];
      const initialDistance = Math.sqrt(
        Math.pow(initialTouch2.clientX - initialTouch1.clientX, 2) + 
        Math.pow(initialTouch2.clientY - initialTouch1.clientY, 2)
      );

      const scale = currentDistance / initialDistance;
      const newZoom = handleTouchStart.current.zoom * scale;
      setZoom(Math.max(0.5, Math.min(3, newZoom)));
    }
  }, []);

  const handleTouchStartCapture = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      handleTouchStart.current = {
        touches: e.touches,
        zoom: zoom
      };
    }
  }, [zoom]);

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

    // The image is scaled by zoom, so we need to adjust our calculations
    // The displayed image dimensions
    const displayedWidth = image.width * zoom;
    const displayedHeight = image.height * zoom;
    
    // Scale from displayed coordinates to natural image coordinates
    const scaleX = image.naturalWidth / displayedWidth;
    const scaleY = image.naturalHeight / displayedHeight;

    // Calculate offset for centering (since zoom transforms from center)
    const offsetX = (displayedWidth - image.width) / 2;
    const offsetY = (displayedHeight - image.height) / 2;

    // Adjust crop coordinates to account for zoom and centering
    const adjustedCrop = {
      x: (crop.x + offsetX) * scaleX,
      y: (crop.y + offsetY) * scaleY,
      width: crop.width * scaleX,
      height: crop.height * scaleY
    };

    // Set canvas to desired output size
    canvas.width = crop.width;
    canvas.height = crop.height;

    // Draw the cropped portion
    ctx.drawImage(
      image,
      adjustedCrop.x,
      adjustedCrop.y,
      adjustedCrop.width,
      adjustedCrop.height,
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
  }, [zoom]);

  const handleCropConfirm = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !imageToCrop) {
      console.warn('⚠️ Missing required data for crop confirm');
      return;
    }

    try {
      setIsUploading(true);
      console.log('🔄 Starting crop and upload process...');
      
      const croppedFile = await getCroppedImg(
        imgRef.current,
        completedCrop,
        `cropped-image-${Date.now()}.jpg`
      );

      // For single image uploads (like logos), delete existing images first
      if (maxImages === 1 && images.length > 0) {
        console.log('🔄 Replacing existing image...');
        for (const oldImageUrl of images) {
          try {
            await imageUploadService.deleteImage(oldImageUrl);
            console.log('🗑️ Old image deleted successfully');
          } catch (deleteError: any) {
            if (deleteError?.code === 'storage/object-not-found') {
              console.warn('ℹ️ Image already deleted or does not exist, continuing...');
            } else {
              console.warn('⚠️ Could not delete old image:', deleteError.message);
            }
          }
        }
      }

      // Upload to Firebase Storage
      const finalUploadPath = uploadPath || (cropType === 'square' ? 'products/images' : 'shops/banners');
      console.log('📤 Uploading to path:', finalUploadPath);
      
      const downloadURL = await imageUploadService.uploadImage(croppedFile, finalUploadPath);
      console.log('✅ Upload successful, URL:', downloadURL);

      // Update images array
      const newImages = maxImages === 1 ? [downloadURL] : [...images, downloadURL];
      if (newImages.length <= maxImages) {
        onImagesChange(newImages);
        console.log('✅ Images state updated successfully');
      }

      // Reset crop modal state
      handleCropCancel();
      
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [completedCrop, imageToCrop, images, onImagesChange, maxImages, cropType, uploadPath, getCroppedImg]);

  const handleCropCancel = useCallback(() => {
    if (imageToCrop && imageToCrop.startsWith('data:')) {
      // Only revoke if it's a blob URL
      try {
        URL.revokeObjectURL(imageToCrop);
      } catch (e) {
        // Ignore errors for data URLs
      }
    }
    setImageToCrop(null);
    setCurrentImageIndex(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
  }, [imageToCrop]);

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

      {/* Crop Modal - USING PORTAL TO PREVENT ELEVATION CONFLICTS */}
      {imageToCrop && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center crop-modal-overlay p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">
              Crop {cropType === 'square' ? 'Square' : 'Banner'} Image
            </h3>
            
            <div className="mb-4 relative">
              <div 
                ref={cropContainerRef}
                className="overflow-hidden rounded-lg bg-gray-100 crop-container"
                onWheel={handleWheel}
                onTouchStart={handleTouchStartCapture}
                onTouchMove={handleTouchMove}
              >
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspectRatio}
                  minWidth={100}
                  minHeight={100}
                  keepSelection={true}
                  disabled={isUploading}
                  ruleOfThirds={true}
                >
                  <img
                    ref={imgRef}
                    alt="Crop preview"
                    src={imageToCrop}
                    className="crop-preview-image crop-zoom-scale"
                    onLoad={onImageLoad}
                    {...({ style: zoomStyle } as any)}
                  />
                </ReactCrop>
              </div>
              
              {/* Zoom Indicator */}
              <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                Zoom: {Math.round(zoom * 100)}%
              </div>
              
              {/* Zoom Instructions */}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                Mouse wheel or pinch to zoom
              </div>
              
              {/* Loading Overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Processing...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 border-t pt-4">
              <button
                type="button"
                onClick={handleCropCancel}
                disabled={isUploading}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropConfirm}
                disabled={!completedCrop || isUploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Crop className="w-4 h-4" />
                    <span>Save Cropped Image</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
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