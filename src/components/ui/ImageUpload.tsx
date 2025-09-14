'use client';

import React, { useState, useRef } from 'react';
import { Camera, Plus, X, Upload, Image as ImageIcon } from 'lucide-react';
import { imageUploadService } from '@/lib/firebase/storage';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  uploadPath: string; // e.g., 'products/productId', 'shops/shopId'
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 4,
  uploadPath,
  title = "Images",
  subtitle = `Add up to ${maxImages} photos. First photo will be the main image.`,
  className = ""
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Check if adding these files would exceed the limit
    const remainingSlots = maxImages - images.length;
    const filesToUpload = files.slice(0, remainingSlots);

    if (filesToUpload.length < files.length) {
      alert(`You can only upload ${remainingSlots} more images.`);
    }

    setUploading(true);
    setUploadProgress(new Array(filesToUpload.length).fill(0));

    try {
      const uploadPromises = filesToUpload.map(async (file, index) => {
        try {
          // Compress image before upload for better performance
          const compressedFile = await imageUploadService.compressImage(file);
          
          // Upload the compressed image
          const downloadURL = await imageUploadService.uploadImage(
            compressedFile,
            uploadPath
          );
          
          // Update progress
          setUploadProgress(prev => {
            const newProgress = [...prev];
            newProgress[index] = 100;
            return newProgress;
          });
          
          return downloadURL;
        } catch (error) {
          console.error(`Failed to upload image ${index + 1}:`, error);
          throw error;
        }
      });

      const newImageUrls = await Promise.all(uploadPromises);
      onImagesChange([...images, ...newImageUrls]);
      
      console.log('✅ All images uploaded successfully');
    } catch (error) {
      console.error('❌ Error uploading images:', error);
      alert('Failed to upload some images. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageUrl = images[index];
    
    try {
      // Remove from state immediately for better UX
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
      
      // Delete from Firebase Storage in background
      await imageUploadService.deleteImage(imageUrl);
      console.log('🗑️ Image removed successfully');
    } catch (error) {
      console.error('❌ Error removing image:', error);
      // Note: We don't revert the UI change since the image is already removed from the form
      // The user can re-upload if needed
    }
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
      <p className="text-sm text-gray-500 mb-4">{subtitle}</p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Existing images */}
        {images.map((imageUrl, index) => (
          <div key={index} className="relative group">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={imageUrl}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Remove button */}
            <button
              onClick={() => handleRemoveImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              disabled={uploading}
              title="Remove image"
              aria-label="Remove image"
            >
              <X size={12} />
            </button>
            
            {/* Main image indicator */}
            {index === 0 && (
              <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                Main
              </div>
            )}
          </div>
        ))}
        
        {/* Upload slots */}
        {Array.from({ length: maxImages - images.length }).map((_, index) => (
          <div
            key={`slot-${index}`}
            onClick={uploading ? undefined : openFileSelector}
            className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
              uploading 
                ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
                : index === 0 && images.length === 0
                  ? 'border-blue-400 bg-blue-50 hover:border-blue-500 hover:bg-blue-100'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
            }`}
          >
            {uploading && uploadProgress[index] !== undefined ? (
              <div className="flex flex-col items-center">
                <Upload className="h-6 w-6 text-blue-500 mb-1 animate-pulse" />
                <div className="w-16 bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress[index] || 0}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                {index === 0 && images.length === 0 ? (
                  <>
                    <Camera className="h-8 w-8 text-blue-500 mb-1" />
                    <span className="text-sm text-blue-600 font-medium">Add Photo</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-6 w-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Add More</span>
                  </>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      
      {/* Upload status */}
      {uploading && (
        <div className="mt-4 flex items-center justify-center space-x-2 text-blue-600">
          <Upload className="h-4 w-4 animate-pulse" />
          <span className="text-sm">Uploading images...</span>
        </div>
      )}
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading || images.length >= maxImages}
        title="Select images to upload"
        aria-label="Select images to upload"
      />
      
      {/* File requirements */}
      <div className="mt-3 text-xs text-gray-400">
        <p>• Supported formats: JPEG, PNG, WebP, GIF</p>
        <p>• Maximum file size: 5MB per image</p>
        <p>• Images will be compressed for optimal performance</p>
      </div>
    </div>
  );
}