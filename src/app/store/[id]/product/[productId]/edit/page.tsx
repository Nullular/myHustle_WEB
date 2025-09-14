'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Save,
  Package,
  Trash2,
  Plus,
  X
} from 'lucide-react';

import { NeuButton, NeuCard } from '@/components/ui';
import SimpleCropUpload from '@/components/ui/SimpleCropUploadWrapper';
import { useAuthStore } from '@/lib/store/auth';
import { useShop } from '@/hooks/useShops';
import { productRepository } from '@/lib/firebase/repositories';
import { Product, ProductVariant, SizeVariant } from '@/types/models';
import { PRODUCT_CATEGORIES } from '@/lib/data/categories';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const storeId = params.id as string;
  const productId = params.productId as string;
  const { shop, loading: shopLoading } = useShop(storeId);
  
  // Form state
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency] = useState('ZAR');
  const [category, setCategory] = useState('Electronics');
  const [stockQuantity, setStockQuantity] = useState('');
  const [inStock, setInStock] = useState(true);
  const [active, setActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [weight, setWeight] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [specifications, setSpecifications] = useState<Record<string, string>>({});
  
  // Images
  const [productImages, setProductImages] = useState<string[]>([]);
  // Variants
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [sizeVariants, setSizeVariants] = useState<SizeVariant[]>([]);
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [showSizeVariantDialog, setShowSizeVariantDialog] = useState(false);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [newTag, setNewTag] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  // Currency is fixed to ZAR (R)

  // Check if user is the owner of this store
  const isOwner = user && shop && user.id === shop.ownerId;

  // Load existing product data
  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) return;
      
      try {
        console.log('🔍 Loading product:', productId);
        const productData = await productRepository.getProductById(productId);
        
        if (productData && isOwner) {
          console.log('📦 Product loaded:', productData);
          setProduct(productData);
          setProductName(productData.name);
          setDescription(productData.description);
          setPrice(productData.price.toString());
          // Currency fixed to ZAR; ignore stored value
          setCategory(productData.category);
          setStockQuantity(productData.stockQuantity.toString());
          setInStock(productData.inStock);
          setActive(productData.active);
          setIsFeatured(productData.isFeatured);
          setWeight(productData.weight.toString());
          setTags(productData.tags || []);
          setSpecifications(productData.specifications || {});
          setProductImages(productData.imageUrls || []);
          setVariants(productData.variants || []);
          setSizeVariants(productData.sizeVariants || []);
        }
      } catch (error) {
        console.error('❌ Error loading product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOwner) {
      loadProduct();
    } else {
      setIsLoading(false);
    }
  }, [productId, isOwner]);

  const isFormValid = () => {
    return productName.trim() !== '' &&
           description.trim() !== '' &&
           price.trim() !== '' &&
           !isNaN(Number(price)) &&
           Number(price) > 0 &&
           stockQuantity.trim() !== '' &&
           !isNaN(Number(stockQuantity)) &&
           Number(stockQuantity) >= 0;
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setSpecifications({
        ...specifications,
        [newSpecKey.trim()]: newSpecValue.trim()
      });
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  const handleRemoveSpecification = (keyToRemove: string) => {
    const newSpecs = { ...specifications };
    delete newSpecs[keyToRemove];
    setSpecifications(newSpecs);
  };

  const handleSaveProduct = async () => {
    console.log('💾 Starting product update...');
    console.log('📝 Form validation:', isFormValid());
    
    if (!isFormValid() || !user || !product) {
      console.log('❌ Form invalid, no user, or no product');
      return;
    }

    setIsSaving(true);

    try {
      const updatedProduct: Product = {
        ...product,
        name: productName,
        description: description,
        price: Number(price),
  currency: 'ZAR',
        category: category,
        stockQuantity: Number(stockQuantity),
        inStock: inStock,
        active: active,
        isFeatured: isFeatured,
        weight: Number(weight) || 0,
        tags: tags,
        specifications: specifications,
        imageUrls: productImages,
        primaryImageUrl: productImages[0] || '',
        variants: variants,
        sizeVariants: sizeVariants,
        updatedAt: Date.now(),
      };

      console.log('🔄 Updating product with data:', updatedProduct);

      const success = await productRepository.updateProduct(updatedProduct);

      if (success) {
        console.log('✅ Product updated successfully');
        
        // Navigate back to catalog management
        setTimeout(() => {
          console.log('🔄 Navigating back to catalog...');
          router.push(`/store/${storeId}/catalog`);
        }, 1000);
      } else {
        throw new Error('Failed to update product');
      }
    } catch (error) {
      console.error('❌ Error updating product:', error);
      alert('Failed to update product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!product) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
    );
    
    if (confirmDelete) {
      try {
        console.log('🗑️ Deleting product:', product.id);
        const success = await productRepository.deleteProduct(product.id);
        
        if (success) {
          console.log('✅ Product deleted successfully');
          router.push(`/store/${storeId}/catalog`);
        } else {
          throw new Error('Failed to delete product');
        }
      } catch (error) {
        console.error('❌ Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  if (shopLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!shop || !isOwner || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {!shop ? 'Store not found' : 
             !isOwner ? 'You don\'t have permission to edit this product' :
             'Product not found'}
          </p>
          <NeuButton onClick={() => router.back()}>
            Go Back
          </NeuButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <NeuButton
                variant="default"
                onClick={() => router.back()}
              >
                <ArrowLeft size={20} />
              </NeuButton>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
                <p className="text-gray-600 text-sm">
                  Update "{product.name}" details
                </p>
              </div>
            </div>
            
            {/* Delete Button */}
            <NeuButton
              onClick={handleDeleteProduct}
              variant="default"
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 size={20} />
            </NeuButton>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto">
        <div className="px-4 py-6 space-y-6">
          {/* Product Images */}
          <NeuCard className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Product Images</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Upload up to 6 high-quality images of your product. The first image will be used as the primary image.
                </p>
              </div>
              <SimpleCropUpload
                images={productImages}
                onImagesChange={setProductImages}
                maxImages={6}
                uploadPath={`products/${productId}`}
                usage="product"
                title=""
                subtitle=""
              />
            </div>
          </NeuCard>

          {/* Basic Information */}
          <NeuCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your product in detail..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select product category"
                  >
                    {PRODUCT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </NeuCard>

          {/* Pricing & Inventory */}
          <NeuCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Pricing & Inventory</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <div className="flex">
                    <div className="px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-gray-700 select-none">ZAR (R)</div>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      step="0.01"
                      min="0"
                      className="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Status Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">In Stock</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Featured</span>
                </label>
              </div>
            </div>
          </NeuCard>

          {/* Tags */}
          <NeuCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tags</h3>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a tag (e.g., wireless, bluetooth, premium)"
                />
                <NeuButton onClick={handleAddTag}>
                  <Plus size={16} />
                </NeuButton>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                        title={`Remove ${tag} tag`}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </NeuCard>

          {/* Specifications */}
          <NeuCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Specifications</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newSpecKey}
                  onChange={(e) => setNewSpecKey(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Specification name (e.g., Material)"
                />
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSpecification()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Value (e.g., Stainless Steel)"
                  />
                  <NeuButton onClick={handleAddSpecification}>
                    <Plus size={16} />
                  </NeuButton>
                </div>
              </div>

              {Object.keys(specifications).length > 0 && (
                <div className="space-y-2">
                  {Object.entries(specifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-800">{key}:</span>
                        <span className="ml-2 text-gray-600">{value}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveSpecification(key)}
                        className="text-red-600 hover:text-red-800"
                        title={`Remove ${key} specification`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </NeuCard>

          {/* Product Variants */}
          <NeuCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Product Variants</h3>
              <NeuButton onClick={() => setShowVariantDialog(true)} variant="default">
                <Plus className="mr-2" size={16} /> Add Variant
              </NeuButton>
            </div>
            {variants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No variants added yet</p>
                <p className="text-sm">Add color, material, or other variants</p>
              </div>
            ) : (
              <div className="space-y-3">
                {variants.map((v, idx) => (
                  <div key={v.id || idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm">
                      <span className="font-medium">{v.name}:</span>
                      <span className="ml-2 text-gray-700">{v.value}</span>
                      <span className="ml-4 text-green-600 font-medium">R{Number(v.price).toFixed(2)}</span>
                      {typeof v.stockQuantity === 'number' && (
                        <span className="ml-4 text-gray-600">Stock: {v.stockQuantity}</span>
                      )}
                    </div>
                    <button
                      onClick={() => setVariants(prev => prev.filter((_, i) => i !== idx))}
                      className="text-red-600 hover:text-red-800"
                      title="Remove variant"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </NeuCard>

          {/* Size Variants */}
          <NeuCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Size Variants</h3>
              <NeuButton onClick={() => setShowSizeVariantDialog(true)} variant="default">
                <Plus className="mr-2" size={16} /> Add Size
              </NeuButton>
            </div>
            {sizeVariants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No sizes added yet</p>
                <p className="text-sm">Add different sizes and pricing</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sizeVariants.map((sv, idx) => (
                  <div key={sv.id || idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm">
                      <span className="font-medium">Size {sv.size}</span>
                      <span className="ml-4 text-green-600 font-medium">R{Number(sv.price).toFixed(2)}</span>
                      {typeof sv.stockQuantity === 'number' && (
                        <span className="ml-4 text-gray-600">Stock: {sv.stockQuantity}</span>
                      )}
                    </div>
                    <button
                      onClick={() => setSizeVariants(prev => prev.filter((_, i) => i !== idx))}
                      className="text-red-600 hover:text-red-800"
                      title="Remove size variant"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </NeuCard>

          {/* Save Button */}
          <div className="flex justify-end space-x-4 pt-6">
            <NeuButton
              variant="default"
              onClick={() => router.back()}
              disabled={isSaving}
            >
              Cancel
            </NeuButton>
            
            <NeuButton
              onClick={handleSaveProduct}
              disabled={!isFormValid() || isSaving}
              className="min-w-[150px]"
            >
              {isSaving ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <>
                  <Save className="mr-2" size={16} />
                  Save Changes
                </>
              )}
            </NeuButton>
          </div>
        </div>
      </div>

      {/* Variant Dialog */}
      {showVariantDialog && (
        <AddVariantDialog
          onClose={() => setShowVariantDialog(false)}
          onAddVariant={(variant) => {
            setVariants(prev => [
              ...prev,
              {
                id: `variant-${prev.length}`,
                name: variant.name,
                value: variant.value,
                price: variant.price,
                imageUrl: variant.imageUrl || '',
                stockQuantity: variant.stockQuantity ?? 0,
                active: true,
              }
            ]);
          }}
        />
      )}

      {/* Size Variant Dialog */}
      {showSizeVariantDialog && (
        <AddSizeVariantDialog
          onClose={() => setShowSizeVariantDialog(false)}
          onAddSizeVariant={(sizeVariant) => {
            setSizeVariants(prev => [
              ...prev,
              {
                id: `size-${prev.length}`,
                size: sizeVariant.size,
                price: sizeVariant.price,
                stockQuantity: sizeVariant.stockQuantity ?? 0,
                active: true,
              }
            ]);
          }}
        />
      )}
    </div>
  );
}

// Minimal dialogs reused from add-product style
function AddVariantDialog({
  onClose,
  onAddVariant
}: {
  onClose: () => void;
  onAddVariant: (variant: { name: string; value: string; price: number; imageUrl?: string; stockQuantity?: number }) => void;
}) {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');

  const handleSave = () => {
    if (!name || !value || !price) return;
    onAddVariant({ name, value, price: Number(price), stockQuantity: Number(stockQuantity) || 0 });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-xl font-bold mb-4">Add Product Variant</h3>
        <div className="space-y-4">
          <input className="w-full px-3 py-2 border rounded-lg" placeholder="Variant Name (e.g., Color)" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full px-3 py-2 border rounded-lg" placeholder="Value (e.g., Red)" value={value} onChange={(e) => setValue(e.target.value)} />
          <input className="w-full px-3 py-2 border rounded-lg" placeholder="Price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          <input className="w-full px-3 py-2 border rounded-lg" placeholder="Stock Quantity" type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
          <button onClick={handleSave} disabled={!name || !value || !price} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">Add Variant</button>
        </div>
      </div>
    </div>
  );
}

function AddSizeVariantDialog({
  onClose,
  onAddSizeVariant
}: {
  onClose: () => void;
  onAddSizeVariant: (sizeVariant: { size: string; price: number; stockQuantity?: number }) => void;
}) {
  const [size, setSize] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');

  const handleSave = () => {
    if (!size || !price) return;
    onAddSizeVariant({ size, price: Number(price), stockQuantity: Number(stockQuantity) || 0 });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-xl font-bold mb-4">Add Size Variant</h3>
        <div className="space-y-4">
          <input className="w-full px-3 py-2 border rounded-lg" placeholder="Size (e.g., S, M, L)" value={size} onChange={(e) => setSize(e.target.value)} />
          <input className="w-full px-3 py-2 border rounded-lg" placeholder="Price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          <input className="w-full px-3 py-2 border rounded-lg" placeholder="Stock Quantity" type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
          <button onClick={handleSave} disabled={!size || !price} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">Add Size</button>
        </div>
      </div>
    </div>
  );
}