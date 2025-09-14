'use client';

import React, { useState, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { imageUploadService } from '@/lib/firebase/storage';
import { getCropModeForUsage } from '@/lib/utils/imageCrop';

interface SimpleImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  uploadPath: string;
  usage: 'product' | 'service' | 'store-logo' | 'store-banner';
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function SimpleImageUpload({
  images,
  onImagesChange,
  maxImages = 4,
  uploadPath,
  usage,
  title = "Images",
  subtitle,
  className = ""
}: SimpleImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cropMode = getCropModeForUsage(usage);
  const defaultSubtitle = subtitle || `Add up to ${maxImages} ${cropMode === 'square' ? 'square' : 'rectangular'} photos. Images will be automatically cropped.`;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    const filesToUpload = files.slice(0, remainingSlots);

    if (filesToUpload.length < files.length) {
      alert(`You can only upload ${remainingSlots} more images.`);
    }

    setUploading(true);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        return await imageUploadService.uploadImageWithCrop(
          file,
          uploadPath,
          usage
        );
      });

      const newImageUrls = await Promise.all(uploadPromises);
      onImagesChange([...images, ...newImageUrls]);
      console.log('✅ All images uploaded successfully with auto-crop');
    } catch (error) {
      console.error('❌ Error uploading images:', error);
      alert('Failed to upload some images. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageUrl = images[index];
    try {
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
      await imageUploadService.deleteImage(imageUrl);
      console.log('🗑️ Image removed successfully');
    } catch (error) {
      console.error('❌ Error removing image:', error);
    }
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
            className={`relative bg-gray-100 rounded-lg overflow-hidden shadow-inner border border-gray-200 ${
              usage === 'store-banner' ? 'aspect-video' : 'aspect-square'
            }`}
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
            className={`bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50 ${
              usage === 'store-banner' ? 'aspect-video' : 'aspect-square'
            }`}
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
          Uploading and cropping images...
        </div>
      )}
    </div>
  );
}