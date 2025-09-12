'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Camera,
  Plus,
  X,
  Package,
  DollarSign,
  Hash,
  Tag,
  Palette,
  Shirt
} from 'lucide-react';

import { NeuButton, NeuCard } from '@/components/ui';
import SimpleCropUpload from '@/components/ui/SimpleCropUploadWrapper';
import { useAuthStore } from '@/lib/store/auth';
import { productRepository } from '@/lib/firebase/repositories';
import { Product } from '@/types/models';

interface ProductVariant {
  name: string;
  value: string;
  price: number;
  imageUrl: string;
  stockQuantity: number;
}

interface SizeVariant {
  size: string;
  price: number;
  stockQuantity: number;
}

interface AddProductPageProps {
  params: Promise<{ id: string }>;
}

export default function AddProductPage({ params }: AddProductPageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [storeId, setStoreId] = useState<string>('');
  
  // Form state
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Electronics');
  const [stockQuantity, setStockQuantity] = useState('');
  const [productSKU, setProductSKU] = useState('');
  const [expensePerUnit, setExpensePerUnit] = useState('');
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [sizeVariants, setSizeVariants] = useState<SizeVariant[]>([]);
  
  // UI state
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [showSizeVariantDialog, setShowSizeVariantDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const categories = [
    'Electronics', 'Clothing', 'Home & Garden', 'Sports', 
    'Beauty', 'Books', 'Toys', 'Food & Beverages', 'Other'
  ];

  // Resolve async params
  useEffect(() => {
    params.then(({ id }) => setStoreId(id));
  }, [params]);

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const isFormValid = () => {
    return productName.trim() !== '' && 
           productPrice.trim() !== '' && 
           !isNaN(Number(productPrice)) &&
           Number(productPrice) > 0;
  };

  const handleSaveProduct = async () => {
    if (!isFormValid() || !user || !storeId) return;

    setIsLoading(true);
    try {
      const productData: Omit<Product, 'id'> = {
        name: productName.trim(),
        description: productDescription.trim(),
        price: Number(productPrice),
        primaryImageUrl: selectedImages[0] || '',
        imageUrls: selectedImages,
        currency: 'USD',
        category: selectedCategory,
        inStock: Number(stockQuantity) > 0,
        stockQuantity: Number(stockQuantity) || 0,
        unitsSold: 0,
        expensePerUnit: 0,
        rating: 0,
        totalReviews: 0,
        shopId: storeId,
        ownerId: user.id,
        active: true,
        isFeatured: false,
        tags: [],
        specifications: {},
        weight: 0,
        dimensions: {
          length: 0,
          width: 0,
          height: 0,
          unit: 'cm'
        },
        variants: variants.map((v, index) => ({
          id: `variant-${index}`,
          name: v.name,
          value: v.value,
          price: v.price,
          imageUrl: v.imageUrl,
          stockQuantity: v.stockQuantity,
          active: true
        })),
        sizeVariants: sizeVariants.map((sv, index) => ({
          id: `size-${index}`,
          size: sv.size,
          price: sv.price,
          stockQuantity: sv.stockQuantity,
          active: true
        })),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const productId = await productRepository.addProduct(productData);
      
      if (productId) {
        console.log('✅ Product created successfully:', productId);
        router.push(`/store/${storeId}/manage`);
      } else {
        throw new Error('Failed to create product');
      }
    } catch (error) {
      console.error('❌ Error creating product:', error);
      alert('Failed to create product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscardProduct = () => {
    router.back();
  };

  const addVariant = (variant: ProductVariant) => {
    setVariants([...variants, variant]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const addSizeVariant = (sizeVariant: SizeVariant) => {
    setSizeVariants([...sizeVariants, sizeVariant]);
  };

  const removeSizeVariant = (index: number) => {
    setSizeVariants(sizeVariants.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <NeuButton
                variant="default"
                onClick={handleDiscardProduct}
              >
                <ArrowLeft size={20} />
              </NeuButton>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Add New Product</h1>
                <p className="text-gray-600 text-sm">
                  Create a new product for your store
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 py-6 space-y-6">
          {/* Product Images Section */}
          <SimpleCropUpload
            images={selectedImages}
            onImagesChange={setSelectedImages}
            maxImages={4}
            uploadPath={`products/${storeId}`}
            usage="product"
            title="Product Images"
            subtitle="Add up to 4 photos. First photo will be the main product image."
          />

          {/* Basic Information */}
          <NeuCard className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Describe your product..."
                />
              </div>
            </div>
          </NeuCard>

          {/* Pricing & Category */}
          <NeuCard className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Pricing & Category</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expense Per Unit
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={expensePerUnit}
                    onChange={(e) => setExpensePerUnit(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    aria-label="Product category"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </NeuCard>

          {/* Inventory Section */}
          <NeuCard className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Inventory</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU (Optional)
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={productSKU}
                    onChange={(e) => setProductSKU(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Product SKU"
                  />
                </div>
              </div>
            </div>
          </NeuCard>

          {/* Product Variants */}
          <ProductVariantsSection
            variants={variants}
            onAddVariant={() => setShowVariantDialog(true)}
            onRemoveVariant={removeVariant}
          />

          {/* Size Variants */}
          <SizeVariantsSection
            sizeVariants={sizeVariants}
            onAddSizeVariant={() => setShowSizeVariantDialog(true)}
            onRemoveSizeVariant={removeSizeVariant}
          />

          {/* Bottom Actions */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex space-x-4">
            <NeuButton
              variant="default"
              onClick={handleDiscardProduct}
              className="flex-1"
              disabled={isLoading}
            >
              Discard
            </NeuButton>
            
            <NeuButton
              onClick={handleSaveProduct}
              className="flex-1"
              disabled={!isFormValid() || isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Product'}
            </NeuButton>
          </div>

          {/* Bottom Spacing */}
          <div className="h-6"></div>
        </div>
      </div>

      {/* Variant Dialog */}
      {showVariantDialog && (
        <AddVariantDialog
          onClose={() => setShowVariantDialog(false)}
          onAddVariant={addVariant}
        />
      )}

      {/* Size Variant Dialog */}
      {showSizeVariantDialog && (
        <AddSizeVariantDialog
          onClose={() => setShowSizeVariantDialog(false)}
          onAddSizeVariant={addSizeVariant}
        />
      )}
    </div>
  );
}

// Product Image Section Component
function ProductImageSection({ 
  selectedImages, 
  onImagesChange 
}: { 
  selectedImages: string[]; 
  onImagesChange: (images: string[]) => void;
}) {
  const handleImageUpload = () => {
    // TODO: Implement image picker/upload
    console.log('Open image picker');
  };

  return (
    <NeuCard className="p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Product Images</h2>
      
      <div className="flex space-x-4 overflow-x-auto">
        {/* Main image placeholder */}
        <div
          onClick={handleImageUpload}
          className="w-32 h-32 border-2 border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors bg-blue-50"
        >
          <Camera className="h-8 w-8 text-blue-500 mb-2" />
          <span className="text-sm text-blue-600 font-medium">Add Photo</span>
        </div>
        
        {/* Additional image slots */}
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            onClick={handleImageUpload}
            className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
          >
            <Plus className="h-6 w-6 text-gray-400" />
          </div>
        ))}
      </div>
      
      <p className="text-sm text-gray-500 mt-2">
        Add up to 4 photos. First photo will be the main product image.
      </p>
    </NeuCard>
  );
}

// Product Variants Section
function ProductVariantsSection({
  variants,
  onAddVariant,
  onRemoveVariant
}: {
  variants: ProductVariant[];
  onAddVariant: () => void;
  onRemoveVariant: (index: number) => void;
}) {
  return (
    <NeuCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Product Variants</h2>
        <NeuButton
          onClick={onAddVariant}
          variant="default"
          className="flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Variant</span>
        </NeuButton>
      </div>
      
      {variants.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Palette className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>No variants added yet</p>
          <p className="text-sm">Add color, material, or other variants</p>
        </div>
      ) : (
        <div className="space-y-3">
          {variants.map((variant, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium">{variant.name}:</span>
                <span className="ml-2 text-gray-600">{variant.value}</span>
                <span className="ml-4 text-green-600 font-medium">${variant.price.toFixed(2)}</span>
              </div>
              <button
                onClick={() => onRemoveVariant(index)}
                className="text-red-500 hover:text-red-700 p-1"
                aria-label={`Remove variant ${index + 1}`}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </NeuCard>
  );
}

// Size Variants Section
function SizeVariantsSection({
  sizeVariants,
  onAddSizeVariant,
  onRemoveSizeVariant
}: {
  sizeVariants: SizeVariant[];
  onAddSizeVariant: () => void;
  onRemoveSizeVariant: (index: number) => void;
}) {
  return (
    <NeuCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Size Variants</h2>
        <NeuButton
          onClick={onAddSizeVariant}
          variant="default"
          className="flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Size</span>
        </NeuButton>
      </div>
      
      {sizeVariants.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Shirt className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>No sizes added yet</p>
          <p className="text-sm">Add different sizes and pricing</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sizeVariants.map((sizeVariant, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium">Size {sizeVariant.size}</span>
                <span className="ml-4 text-green-600 font-medium">${sizeVariant.price.toFixed(2)}</span>
                <span className="ml-4 text-gray-600">Stock: {sizeVariant.stockQuantity}</span>
              </div>
              <button
                onClick={() => onRemoveSizeVariant(index)}
                className="text-red-500 hover:text-red-700 p-1"
                aria-label={`Remove size variant ${index + 1}`}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </NeuCard>
  );
}

// Add Variant Dialog
function AddVariantDialog({
  onClose,
  onAddVariant
}: {
  onClose: () => void;
  onAddVariant: (variant: ProductVariant) => void;
}) {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');

  const handleSave = () => {
    if (name && value && price) {
      onAddVariant({
        name,
        value,
        price: Number(price),
        imageUrl: '',
        stockQuantity: Number(stockQuantity) || 0
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-xl font-bold mb-4">Add Product Variant</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Variant Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Color, Material"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Value
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Red, Cotton"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Quantity
            </label>
            <input
              type="number"
              min="0"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name || !value || !price}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Variant
          </button>
        </div>
      </div>
    </div>
  );
}

// Add Size Variant Dialog
function AddSizeVariantDialog({
  onClose,
  onAddSizeVariant
}: {
  onClose: () => void;
  onAddSizeVariant: (sizeVariant: SizeVariant) => void;
}) {
  const [size, setSize] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');

  const handleSave = () => {
    if (size && price) {
      onAddSizeVariant({
        size,
        price: Number(price),
        stockQuantity: Number(stockQuantity) || 0
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-xl font-bold mb-4">Add Size Variant</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Size
            </label>
            <input
              type="text"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., S, M, L, XL"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Quantity
            </label>
            <input
              type="number"
              min="0"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!size || !price}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Size
          </button>
        </div>
      </div>
    </div>
  );
}
