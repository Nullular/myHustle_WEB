'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Plus, X, Upload, Image as ImageIcon, Crop, RotateCcw, Check } from 'lucide-react';
import { imageUploadService } from '@/lib/firebase/storage';
import { imageCropService, CropArea, CropMode, getCropModeForUsage } from '@/lib/utils/imageCrop';
import '@/styles/imageCropUpload.css';

interface ImageCropUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  uploadPath: string;
  usage: 'product' | 'service' | 'store-logo' | 'store-banner';
  title?: string;
  subtitle?: string;
  className?: string;
  enableManualCrop?: boolean; // Allow manual cropping interface
}

interface CropState {
  file: File;
  imageUrl: string;
  cropArea: CropArea;
  imageWidth: number;
  imageHeight: number;
}

export default function ImageCropUpload({
  images,
  onImagesChange,
  maxImages = 4,
  uploadPath,
  usage,
  title = "Images",
  subtitle,
  className = "",
  enableManualCrop = true
}: ImageCropUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropState, setCropState] = useState<CropState | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [dragStartCrop, setDragStartCrop] = useState<CropArea | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);

  const cropMode = getCropModeForUsage(usage);
  const defaultSubtitle = subtitle || `Add up to ${maxImages} ${cropMode === 'square' ? 'square' : 'rectangular'} photos. ${usage === 'store-banner' ? 'Banner will be cropped to 16:9 ratio.' : 'Images will be cropped to perfect squares.'}`;

  /**
   * Calculate the initial crop area for an image with fixed dimensions
   */
  const calculateFixedCropArea = useCallback((imageWidth: number, imageHeight: number, containerWidth: number, containerHeight: number) => {
    const aspectRatio = cropMode === 'square' ? 1 : 16/9;
    
    // Calculate fixed crop size based on container and image
    let cropWidth, cropHeight;
    
    if (cropMode === 'square') {
      // For square, use 60% of the smaller container dimension
      const containerMin = Math.min(containerWidth, containerHeight);
      const targetSize = containerMin * 0.6;
      
      // Scale to image coordinates
      const scaleX = imageWidth / containerWidth;
      const scaleY = imageHeight / containerHeight;
      const scale = Math.max(scaleX, scaleY);
      
      cropWidth = cropHeight = targetSize * scale;
    } else {
      // For banner (16:9), use 80% of container width
      const targetWidth = containerWidth * 0.8;
      const targetHeight = targetWidth / aspectRatio;
      
      // Scale to image coordinates
      const scaleX = imageWidth / containerWidth;
      const scaleY = imageHeight / containerHeight;
      
      cropWidth = targetWidth * scaleX;
      cropHeight = targetHeight * scaleY;
    }

    // Ensure crop doesn't exceed image bounds
    cropWidth = Math.min(cropWidth, imageWidth);
    cropHeight = Math.min(cropHeight, imageHeight);
    
    // If needed, adjust to maintain aspect ratio
    if (cropMode === 'square') {
      const minDimension = Math.min(cropWidth, cropHeight);
      cropWidth = cropHeight = minDimension;
    } else {
      if (cropWidth / cropHeight > aspectRatio) {
        cropWidth = cropHeight * aspectRatio;
      } else {
        cropHeight = cropWidth / aspectRatio;
      }
    }

    // Center the crop area
    const x = (imageWidth - cropWidth) / 2;
    const y = (imageHeight - cropHeight) / 2;

    return {
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: cropWidth,
      height: cropHeight
    };
  }, [cropMode]);

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    const filesToProcess = files.slice(0, remainingSlots);

    if (filesToProcess.length < files.length) {
      alert(`You can only upload ${remainingSlots} more images.`);
    }

    for (const file of filesToProcess) {
      if (enableManualCrop) {
        await showCropInterface(file);
      } else {
        await uploadWithAutoCrop(file);
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Show cropping interface
  const showCropInterface = async (file: File) => {
    const img = new Image();
    const imageUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      // Use fixed crop area calculation
      const containerRect = { width: 600, height: 400 }; // Default container size
      const initialCropArea = calculateFixedCropArea(
        img.width,
        img.height,
        containerRect.width,
        containerRect.height
      );

      setCropState({
        file,
        imageUrl,
        cropArea: initialCropArea,
        imageWidth: img.width,
        imageHeight: img.height
      });
      setShowCropModal(true);
    };

    img.src = imageUrl;
  };

  // Upload with automatic cropping
  const uploadWithAutoCrop = async (file: File) => {
    setUploading(true);
    try {
      const downloadURL = await imageUploadService.uploadImageWithCrop(
        file,
        uploadPath,
        usage
      );
      onImagesChange([...images, downloadURL]);
      console.log('✅ Image uploaded successfully with auto-crop');
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle crop confirmation
  const handleCropConfirm = async () => {
    if (!cropState) return;

    setUploading(true);
    setShowCropModal(false);

    try {
      const downloadURL = await imageUploadService.uploadImageWithCustomCrop(
        cropState.file,
        uploadPath,
        cropState.cropArea,
        cropMode
      );
      
      onImagesChange([...images, downloadURL]);
      console.log('✅ Image uploaded successfully with custom crop');
    } catch (error) {
      console.error('❌ Error uploading cropped image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      setCropState(null);
    }
  };

  // Handle crop area drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cropState) return;
    
    setIsDragging(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setDragStartCrop({ ...cropState.cropArea });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !cropState || !dragStartCrop || !cropContainerRef.current) return;

    const rect = cropContainerRef.current.getBoundingClientRect();
    const scaleX = cropState.imageWidth / rect.width;
    const scaleY = cropState.imageHeight / rect.height;

    const deltaX = (e.clientX - dragStartPos.x) * scaleX;
    const deltaY = (e.clientY - dragStartPos.y) * scaleY;

    // Calculate new position (only repositioning, not resizing)
    let newX = dragStartCrop.x + deltaX;
    let newY = dragStartCrop.y + deltaY;

    // Keep crop area within image bounds
    newX = Math.max(0, Math.min(cropState.imageWidth - cropState.cropArea.width, newX));
    newY = Math.max(0, Math.min(cropState.imageHeight - cropState.cropArea.height, newY));

    setCropState(prev => prev ? {
      ...prev,
      cropArea: { 
        ...prev.cropArea, 
        x: newX, 
        y: newY 
        // width and height remain fixed
      }
    } : null);
  }, [isDragging, cropState, dragStartCrop, dragStartPos]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStartPos({ x: 0, y: 0 });
    setDragStartCrop(null);
  }, []);

  // Add event listeners for drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle image removal
  const handleRemoveImage = async (index: number) => {
    const imageUrl = images[index];
    try {
      // Remove from state immediately for better UX
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
      
      // Try to delete from Firebase Storage in background
      // Don't block the UI if deletion fails
      imageUploadService.deleteImage(imageUrl).catch((error) => {
        console.warn('Failed to delete image from storage (non-blocking):', error);
      });
      
      console.log('🗑️ Image removed from list successfully');
    } catch (error) {
      console.error('❌ Error removing image:', error);
      // We don't revert the UI change since removal from list succeeded
    }
  };

  // Reset crop area
  const resetCropArea = () => {
    if (!cropState || !cropContainerRef.current) return;
    
    const rect = cropContainerRef.current.getBoundingClientRect();
    const initialCropArea = calculateFixedCropArea(
      cropState.imageWidth,
      cropState.imageHeight,
      rect.width,
      rect.height
    );
    
    setCropState(prev => prev ? {
      ...prev,
      cropArea: initialCropArea
    } : null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      {title && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm">{defaultSubtitle}</p>
        </div>
      )}

      {/* Images Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {/* Existing Images */}
        {images.map((imageUrl, index) => (
          <div
            key={index}
            className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-inner border border-gray-200"
          >
            <img
              src={imageUrl}
              alt={`Upload ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => handleRemoveImage(index)}
              title="Remove image"
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
            >
              <X size={14} />
            </button>
            {index === 0 && (
              <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                Main
              </div>
            )}
          </div>
        ))}

        {/* Upload Button */}
        {images.length < maxImages && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            ) : (
              <>
                <Plus size={24} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-500 text-center px-2">
                  Add {cropMode === 'square' ? 'Square' : 'Banner'} Image
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload images"
      />

      {/* Upload Progress */}
      {uploading && (
        <div className="text-center text-sm text-gray-600">
          Uploading and processing image...
        </div>
      )}

      {/* Crop Modal */}
      {showCropModal && cropState && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Crop Image ({cropMode === 'square' ? 'Square' : '16:9 Banner'})
              </h3>
              <button
                onClick={() => setShowCropModal(false)}
                title="Close crop modal"
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Crop Interface */}
            <div className="p-4">
              <div 
                ref={cropContainerRef}
                className="relative max-w-full max-h-96 mx-auto bg-gray-100 rounded-lg overflow-hidden"
              >
                <img
                  ref={cropImageRef}
                  src={cropState.imageUrl}
                  alt="Crop preview"
                  className="max-w-full max-h-96 object-contain"
                />
                
                {/* Crop Overlay */}
                <div
                  className="crop-overlay"
                  style={{
                    left: `${(cropState.cropArea.x / cropState.imageWidth) * 100}%`,
                    top: `${(cropState.cropArea.y / cropState.imageHeight) * 100}%`,
                    width: `${(cropState.cropArea.width / cropState.imageWidth) * 100}%`,
                    height: `${(cropState.cropArea.height / cropState.imageHeight) * 100}%`,
                  }}
                  onMouseDown={handleMouseDown}
                >
                  {/* Center indicator */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-4 h-4 border-2 border-white rounded-full bg-blue-500"></div>
                  </div>
                </div>
              </div>

              {/* Crop Instructions */}
              <p className="text-sm text-gray-600 text-center mt-4">
                Drag the blue area to reposition your crop. The crop size is fixed to ensure consistent {cropMode === 'square' ? 'square' : 'banner'} dimensions.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t flex items-center justify-between">
              <button
                onClick={resetCropArea}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCcw size={16} />
                Reset
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCropModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropConfirm}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  <Check size={16} />
                  {uploading ? 'Uploading...' : 'Crop & Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}