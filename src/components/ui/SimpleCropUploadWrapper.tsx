import React from 'react';
import { ImageUploadWithCrop } from './SimpleCropUpload';

interface SimpleCropUploadWrapperProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  uploadPath: string;
  usage: 'product' | 'service' | 'store-logo' | 'store-banner';
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function SimpleCropUploadWrapper({
  images,
  onImagesChange,
  maxImages = 4,
  uploadPath,
  usage,
  title,
  subtitle,
  className = ""
}: SimpleCropUploadWrapperProps) {
  const cropType = usage === 'store-banner' ? 'banner' : 'square';
  
  return (
    <div className={className}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
          {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
        </div>
      )}
      
      <ImageUploadWithCrop
        images={images}
        onImagesChange={onImagesChange}
        cropType={cropType}
        maxImages={maxImages}
        placeholder={`Upload ${cropType === 'square' ? 'square' : 'banner'} image`}
      />
    </div>
  );
}