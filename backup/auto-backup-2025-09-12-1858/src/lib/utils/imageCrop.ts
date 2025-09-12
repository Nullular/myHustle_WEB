/**
 * Image Cropping Utility for MyHustle
 * Handles cropping images for different use cases:
 * - Square (1:1) for products, services, store logos
 * - Rectangular (16:9) for store banners
 */

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type CropMode = 'square' | 'banner';

export interface CropConfig {
  mode: CropMode;
  maxWidth: number;
  maxHeight: number;
  quality: number;
}

export class ImageCropService {
  private static instance: ImageCropService;

  static getInstance(): ImageCropService {
    if (!ImageCropService.instance) {
      ImageCropService.instance = new ImageCropService();
    }
    return ImageCropService.instance;
  }

  /**
   * Get the aspect ratio for different crop modes
   */
  private getAspectRatio(mode: CropMode): number {
    switch (mode) {
      case 'square':
        return 1; // 1:1 ratio
      case 'banner':
        return 16 / 9; // 16:9 ratio for banners
      default:
        return 1;
    }
  }

  /**
   * Get default crop configuration for different modes
   */
  getCropConfig(mode: CropMode): CropConfig {
    switch (mode) {
      case 'square':
        return {
          mode,
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.9
        };
      case 'banner':
        return {
          mode,
          maxWidth: 1200,
          maxHeight: 675, // 16:9 ratio
          quality: 0.9
        };
      default:
        return {
          mode: 'square',
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.9
        };
    }
  }

  /**
   * Calculate the initial crop area for an image
   */
  calculateInitialCropArea(
    imageWidth: number,
    imageHeight: number,
    mode: CropMode
  ): CropArea {
    const aspectRatio = this.getAspectRatio(mode);
    
    let cropWidth, cropHeight;
    
    if (mode === 'square') {
      // For square, use the smaller dimension
      const minDimension = Math.min(imageWidth, imageHeight);
      cropWidth = cropHeight = minDimension;
    } else {
      // For banner (16:9), fit within image bounds
      if (imageWidth / imageHeight > aspectRatio) {
        // Image is wider than target ratio
        cropHeight = imageHeight;
        cropWidth = cropHeight * aspectRatio;
      } else {
        // Image is taller than target ratio
        cropWidth = imageWidth;
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
  }

  /**
   * Crop an image using canvas
   */
  async cropImage(
    file: File,
    cropArea: CropArea,
    config: CropConfig
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            throw new Error('Could not get canvas context');
          }

          // Set canvas dimensions to the crop size
          canvas.width = cropArea.width;
          canvas.height = cropArea.height;

          // Draw the cropped portion of the image
          ctx.drawImage(
            img,
            cropArea.x,
            cropArea.y,
            cropArea.width,
            cropArea.height,
            0,
            0,
            cropArea.width,
            cropArea.height
          );

          // Resize if necessary
          const finalCanvas = this.resizeCanvas(canvas, config.maxWidth, config.maxHeight);

          // Convert to blob
          finalCanvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob from canvas'));
                return;
              }

              const croppedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });

              resolve(croppedFile);
            },
            file.type,
            config.quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Resize canvas while maintaining aspect ratio
   */
  private resizeCanvas(
    sourceCanvas: HTMLCanvasElement,
    maxWidth: number,
    maxHeight: number
  ): HTMLCanvasElement {
    const { width: sourceWidth, height: sourceHeight } = sourceCanvas;
    
    // Calculate the scaling factor
    const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight, 1);
    
    if (scale >= 1) {
      // No resizing needed
      return sourceCanvas;
    }

    // Create new canvas with scaled dimensions
    const targetCanvas = document.createElement('canvas');
    const targetCtx = targetCanvas.getContext('2d')!;
    
    targetCanvas.width = sourceWidth * scale;
    targetCanvas.height = sourceHeight * scale;

    // Use high-quality scaling
    targetCtx.imageSmoothingEnabled = true;
    targetCtx.imageSmoothingQuality = 'high';

    // Draw the scaled image
    targetCtx.drawImage(
      sourceCanvas,
      0,
      0,
      sourceWidth,
      sourceHeight,
      0,
      0,
      targetCanvas.width,
      targetCanvas.height
    );

    return targetCanvas;
  }

  /**
   * Validate if the crop area is valid
   */
  validateCropArea(
    cropArea: CropArea,
    imageWidth: number,
    imageHeight: number,
    mode: CropMode
  ): boolean {
    const { x, y, width, height } = cropArea;
    
    // Check bounds
    if (x < 0 || y < 0 || x + width > imageWidth || y + height > imageHeight) {
      return false;
    }

    // Check minimum size
    if (width < 100 || height < 100) {
      return false;
    }

    // Check aspect ratio for specific modes
    const expectedRatio = this.getAspectRatio(mode);
    const actualRatio = width / height;
    const tolerance = 0.01;

    if (Math.abs(actualRatio - expectedRatio) > tolerance) {
      return false;
    }

    return true;
  }

  /**
   * Get preview URL for cropped area
   */
  async getPreviewUrl(
    file: File,
    cropArea: CropArea
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;

          canvas.width = cropArea.width;
          canvas.height = cropArea.height;

          ctx.drawImage(
            img,
            cropArea.x,
            cropArea.y,
            cropArea.width,
            cropArea.height,
            0,
            0,
            cropArea.width,
            cropArea.height
          );

          resolve(canvas.toDataURL());
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for preview'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Auto-crop image with intelligent center detection
   */
  async autoCrop(file: File, mode: CropMode): Promise<File> {
    const img = await this.loadImage(file);
    const cropArea = this.calculateInitialCropArea(img.width, img.height, mode);
    const config = this.getCropConfig(mode);
    
    return this.cropImage(file, cropArea, config);
  }

  /**
   * Load image and get dimensions
   */
  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      
      img.src = URL.createObjectURL(file);
    });
  }
}

export const imageCropService = ImageCropService.getInstance();

// Helper function to determine crop mode based on usage
export function getCropModeForUsage(usage: 'product' | 'service' | 'store-logo' | 'store-banner'): CropMode {
  switch (usage) {
    case 'product':
    case 'service':
    case 'store-logo':
      return 'square';
    case 'store-banner':
      return 'banner';
    default:
      return 'square';
  }
}