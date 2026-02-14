import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, X, Package } from 'lucide-react';
import { adminSupabase } from '../../lib/supabase';

interface ShopProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  stock_quantity: number;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  specifications: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface ProductPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  specifications: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface PackageProduct {
  product_id: string;
  quantity: number;
  product?: ShopProduct;
}

const PRODUCT_CATEGORIES = [
  'Computer',
  'Laptop',
  'Desktop',
  'Accessory',
  'Monitor',
  'Keyboard',
  'Mouse',
  'Headset',
  'Webcam',
  'Printer',
  'Storage',
  'RAM',
  'Processor',
  'Graphics Card',
  'Motherboard',
  'Power Supply',
  'Other'
];

const PACKAGE_CATEGORIES = [
  'Bundle',
  'Starter Kit',
  'Complete Setup',
  'Office Package',
  'Gaming Package',
  'Student Package',
  'Professional Package',
  'Other'
];

export default function Shop() {
  const [activeTab, setActiveTab] = useState<'products' | 'packages'>('products');
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [packages, setPackages] = useState<ProductPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ShopProduct | null>(null);
  const [editingPackage, setEditingPackage] = useState<ProductPackage | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Product form data
  const [formData, setFormData] = useState<Omit<ShopProduct, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    description: '',
    price: 0,
    category: 'Computer',
    image_url: null,
    stock_quantity: 0,
    is_featured: false,
    is_active: true,
    display_order: 0,
    specifications: {},
  });
  
  // Package form data
  const [packageFormData, setPackageFormData] = useState<Omit<ProductPackage, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    description: '',
    price: 0,
    category: 'Bundle',
    image_url: null,
    is_featured: false,
    is_active: true,
    display_order: 0,
    specifications: {},
  });
  
  const [packageProducts, setPackageProducts] = useState<PackageProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedProductQuantity, setSelectedProductQuantity] = useState<number>(1);
  
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchPackages();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await adminSupabase
        .from('shop_products')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const { data, error } = await adminSupabase
        .from('product_packages')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `shop-products/${fileName}`;

      const { error: uploadError } = await adminSupabase.storage
        .from('hero-images') // Using existing bucket, or create a shop-products bucket
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = adminSupabase.storage
        .from('hero-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: data.publicUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        const { error } = await adminSupabase
          .from('shop_products')
          .update(formData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
      } else {
        const { error } = await adminSupabase
          .from('shop_products')
          .insert([formData]);
        
        if (error) throw error;
      }
      
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const { error } = await adminSupabase
        .from('shop_products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'Computer',
      image_url: null,
      stock_quantity: 0,
      is_featured: false,
      is_active: true,
      display_order: 0,
      specifications: {},
    });
    setSpecKey('');
    setSpecValue('');
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product: ShopProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image_url: product.image_url,
      stock_quantity: product.stock_quantity,
      is_featured: product.is_featured,
      is_active: product.is_active,
      display_order: product.display_order,
      specifications: product.specifications || {},
    });
    setShowForm(true);
  };

  const addSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      setFormData({
        ...formData,
        specifications: {
          ...formData.specifications,
          [specKey.trim()]: specValue.trim(),
        },
      });
      setSpecKey('');
      setSpecValue('');
    }
  };

  const removeSpecification = (key: string) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    setFormData({ ...formData, specifications: newSpecs });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Package-specific functions
  const handlePackageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPackage) {
        // Update existing package
        const { error: packageError } = await adminSupabase
          .from('product_packages')
          .update(packageFormData)
          .eq('id', editingPackage.id);
        
        if (packageError) throw packageError;

        // Delete existing package products
        await adminSupabase
          .from('package_products')
          .delete()
          .eq('package_id', editingPackage.id);

        // Insert new package products
        if (packageProducts.length > 0) {
          const packageProductsData = packageProducts.map(pp => ({
            package_id: editingPackage.id,
            product_id: pp.product_id,
            quantity: pp.quantity,
          }));

          const { error: productsError } = await adminSupabase
            .from('package_products')
            .insert(packageProductsData);
          
          if (productsError) throw productsError;
        }
      } else {
        // Create new package
        const { data: newPackage, error: packageError } = await adminSupabase
          .from('product_packages')
          .insert([packageFormData])
          .select()
          .single();
        
        if (packageError) throw packageError;

        // Insert package products
        if (packageProducts.length > 0) {
          const packageProductsData = packageProducts.map(pp => ({
            package_id: newPackage.id,
            product_id: pp.product_id,
            quantity: pp.quantity,
          }));

          const { error: productsError } = await adminSupabase
            .from('package_products')
            .insert(packageProductsData);
          
          if (productsError) throw productsError;
        }
      }
      
      resetPackageForm();
      fetchPackages();
    } catch (error) {
      console.error('Error saving package:', error);
      alert('Failed to save package');
    }
  };

  const handlePackageDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this package?')) return;
    
    try {
      const { error } = await adminSupabase
        .from('product_packages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Failed to delete package');
    }
  };

  const handlePackageEdit = async (pkg: ProductPackage) => {
    setEditingPackage(pkg);
    setPackageFormData({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      category: pkg.category,
      image_url: pkg.image_url,
      is_featured: pkg.is_featured,
      is_active: pkg.is_active,
      display_order: pkg.display_order,
      specifications: pkg.specifications || {},
    });

    // Fetch package products
    try {
      const { data, error } = await adminSupabase
        .from('package_products')
        .select('product_id, quantity')
        .eq('package_id', pkg.id);

      if (error) throw error;
      setPackageProducts(data || []);
    } catch (error) {
      console.error('Error fetching package products:', error);
    }

    setShowForm(true);
  };

  const resetPackageForm = () => {
    setPackageFormData({
      name: '',
      description: '',
      price: 0,
      category: 'Bundle',
      image_url: null,
      is_featured: false,
      is_active: true,
      display_order: 0,
      specifications: {},
    });
    setPackageProducts([]);
    setSelectedProductId('');
    setSelectedProductQuantity(1);
    setSpecKey('');
    setSpecValue('');
    setEditingPackage(null);
    setShowForm(false);
  };

  const addProductToPackage = () => {
    if (selectedProductId) {
      const existingIndex = packageProducts.findIndex(pp => pp.product_id === selectedProductId);
      if (existingIndex >= 0) {
        // Update quantity if product already in package
        const updated = [...packageProducts];
        updated[existingIndex].quantity += selectedProductQuantity;
        setPackageProducts(updated);
      } else {
        // Add new product to package
        setPackageProducts([
          ...packageProducts,
          { product_id: selectedProductId, quantity: selectedProductQuantity }
        ]);
      }
      setSelectedProductId('');
      setSelectedProductQuantity(1);
    }
  };

  const removeProductFromPackage = (productId: string) => {
    setPackageProducts(packageProducts.filter(pp => pp.product_id !== productId));
  };

  const updatePackageProductQuantity = (productId: string, quantity: number) => {
    setPackageProducts(packageProducts.map(pp =>
      pp.product_id === productId ? { ...pp, quantity } : pp
    ));
  };

  const handlePackageImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `shop-packages/${fileName}`;

      const { error: uploadError } = await adminSupabase.storage
        .from('hero-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = adminSupabase.storage
        .from('hero-images')
        .getPublicUrl(filePath);

      setPackageFormData({ ...packageFormData, image_url: data.publicUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shop Management</h1>
              <p className="text-gray-600 mt-2">Manage products and packages</p>
            </div>
            <button
              onClick={() => {
                if (activeTab === 'products') {
                  resetForm();
                } else {
                  resetPackageForm();
                }
                setShowForm(true);
              }}
              className="flex items-center justify-center px-4 py-2 w-full sm:w-auto bg-[#1C3D5A] text-white rounded-lg hover:bg-[#143040] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50"
            >
              <Plus size={20} className="mr-2" />
              {activeTab === 'products' ? 'Add Product' : 'Add Package'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => {
                setActiveTab('products');
                setShowForm(false);
              }}
              className={`pb-3 px-2 font-semibold transition-colors border-b-2 ${
                activeTab === 'products'
                  ? 'border-[#1C3D5A] text-[#1C3D5A]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Products ({products.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('packages');
                setShowForm(false);
              }}
              className={`pb-3 px-2 font-semibold transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'packages'
                  ? 'border-[#1C3D5A] text-[#1C3D5A]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package size={18} />
              Packages ({packages.length})
            </button>
          </div>
        </div>

        {showForm && activeTab === 'products' && (
          <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 focus:border-transparent"
                    placeholder="e.g., Dell Latitude 5520"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 focus:border-transparent"
                    required
                  >
                    {PRODUCT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (UGX) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 focus:border-transparent"
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 focus:border-transparent"
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 focus:border-transparent resize-vertical"
                    placeholder="Product description..."
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Image
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.image_url && (
                      <div className="relative">
                        <img
                          src={formData.image_url}
                          alt="Product preview"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image_url: null })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                    <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                      <Upload size={20} className="mr-2 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        {uploading ? 'Uploading...' : formData.image_url ? 'Change Image' : 'Upload Image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-4 h-4 text-[#1C3D5A] border-gray-300 rounded focus:ring-[#1C3D5A]/50"
                    />
                    <span className="text-sm font-medium text-gray-700">Feature in Hero Section</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-[#1C3D5A] border-gray-300 rounded focus:ring-[#1C3D5A]/50"
                    />
                    <span className="text-sm font-medium text-gray-700">Active (Visible to customers)</span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specifications
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      value={specKey}
                      onChange={(e) => setSpecKey(e.target.value)}
                      placeholder="Spec name (e.g., RAM)"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 focus:border-transparent"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={specValue}
                        onChange={(e) => setSpecValue(e.target.value)}
                        placeholder="Spec value (e.g., 16GB)"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={addSpecification}
                        className="px-4 py-2 bg-[#1C3D5A] text-white rounded-md hover:bg-[#143040] transition-colors"
                        disabled={!specKey.trim() || !specValue.trim()}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  {Object.keys(formData.specifications).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(formData.specifications).map(([key, value]) => (
                        <div key={key} className="flex items-center bg-[#1C3D5A]/5 text-[#1C3D5A] rounded-full px-3 py-1">
                          <span className="text-sm font-medium">{key}:</span>
                          <span className="text-sm ml-1">{value}</span>
                          <button
                            type="button"
                            onClick={() => removeSpecification(key)}
                            className="ml-2 text-[#1C3D5A]/70 hover:text-[#1C3D5A] transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end sm:space-x-3 sm:space-y-0 space-y-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500/50 w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1C3D5A] text-white rounded-md hover:bg-[#143040] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 w-full sm:w-auto"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        )}

        {showForm && activeTab === 'packages' && (
          <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingPackage ? 'Edit Package' : 'Add New Package'}
            </h2>
            
            <form onSubmit={handlePackageSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    value={packageFormData.name}
                    onChange={(e) => setPackageFormData({ ...packageFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 focus:border-transparent"
                    placeholder="e.g., Complete Office Setup"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={packageFormData.category}
                    onChange={(e) => setPackageFormData({ ...packageFormData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 focus:border-transparent"
                    required
                  >
                    {PACKAGE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package Price (UGX) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={packageFormData.price}
                    onChange={(e) => setPackageFormData({ ...packageFormData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 focus:border-transparent"
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={packageFormData.display_order}
                    onChange={(e) => setPackageFormData({ ...packageFormData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={packageFormData.description}
                    onChange={(e) => setPackageFormData({ ...packageFormData, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 focus:border-transparent resize-vertical"
                    placeholder="Package description..."
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package Image
                  </label>
                  <div className="flex items-center gap-4">
                    {packageFormData.image_url && (
                      <div className="relative">
                        <img
                          src={packageFormData.image_url}
                          alt="Package preview"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => setPackageFormData({ ...packageFormData, image_url: null })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                    <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                      <Upload size={20} className="mr-2 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        {uploading ? 'Uploading...' : packageFormData.image_url ? 'Change Image' : 'Upload Image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePackageImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Products in Package *
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                      <select
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        className="sm:col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 focus:border-transparent"
                      >
                        <option value="">Select a product...</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} - {formatPrice(product.price)}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          value={selectedProductQuantity}
                          onChange={(e) => setSelectedProductQuantity(parseInt(e.target.value) || 1)}
                          placeholder="Qty"
                          className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={addProductToPackage}
                          className="px-4 py-2 bg-[#1C3D5A] text-white rounded-md hover:bg-[#143040] transition-colors whitespace-nowrap"
                          disabled={!selectedProductId}
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {packageProducts.length > 0 ? (
                      <div className="space-y-2">
                        {packageProducts.map((pp) => {
                          const product = products.find(p => p.id === pp.product_id);
                          return (
                            <div key={pp.product_id} className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{product?.name}</p>
                                <p className="text-sm text-gray-600">{product && formatPrice(product.price)} × {pp.quantity}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={pp.quantity}
                                  onChange={(e) => updatePackageProductQuantity(pp.product_id, parseInt(e.target.value) || 1)}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeProductFromPackage(pp.product_id)}
                                  className="text-red-600 hover:text-red-900 p-1"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            Total individual price: {formatPrice(packageProducts.reduce((sum, pp) => {
                              const product = products.find(p => p.id === pp.product_id);
                              return sum + (product ? product.price * pp.quantity : 0);
                            }, 0))}
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            Package price: {formatPrice(packageFormData.price)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No products added yet</p>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      checked={packageFormData.is_featured}
                      onChange={(e) => setPackageFormData({ ...packageFormData, is_featured: e.target.checked })}
                      className="w-4 h-4 text-[#1C3D5A] border-gray-300 rounded focus:ring-[#1C3D5A]/50"
                    />
                    <span className="text-sm font-medium text-gray-700">Feature in Hero Section</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={packageFormData.is_active}
                      onChange={(e) => setPackageFormData({ ...packageFormData, is_active: e.target.checked })}
                      className="w-4 h-4 text-[#1C3D5A] border-gray-300 rounded focus:ring-[#1C3D5A]/50"
                    />
                    <span className="text-sm font-medium text-gray-700">Active (Visible to customers)</span>
                  </label>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end sm:space-x-3 sm:space-y-0 space-y-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetPackageForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500/50 w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1C3D5A] text-white rounded-md hover:bg-[#143040] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 w-full sm:w-auto"
                >
                  {editingPackage ? 'Update Package' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'products' ? (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      </div>
                      <div className="flex flex-col sm:items-end gap-2">
                        <span className="px-3 py-1 bg-[#1C3D5A]/10 text-[#1C3D5A] rounded-full text-sm font-medium whitespace-nowrap">
                          {formatPrice(product.price)}
                        </span>
                        <div className="flex gap-2">
                          {product.is_featured && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium">
                              Featured
                            </span>
                          )}
                          {product.is_active ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">Category:</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                        {product.category}
                      </span>
                      <span className="text-xs text-gray-500 font-medium ml-2">Stock:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        product.stock_quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock_quantity}
                      </span>
                      <span className="text-xs text-gray-500 font-medium ml-2">Order:</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                        {product.display_order}
                      </span>
                    </div>
                    {Object.keys(product.specifications || {}).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {Object.entries(product.specifications).slice(0, 3).map(([key, value]) => (
                          <span key={key} className="text-xs text-gray-600">
                            <span className="font-medium">{key}:</span> {value}
                          </span>
                        ))}
                        {Object.keys(product.specifications).length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{Object.keys(product.specifications).length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-[#1C3D5A] hover:text-[#143040] p-1 rounded focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 transition-colors"
                    aria-label="Edit product"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-900 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-colors"
                    aria-label="Delete product"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            
            {products.length === 0 && !loading && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="text-gray-400 mb-4">
                  <Plus className="mx-auto h-12 w-12" />
                </div>
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400 mt-1">Get started by adding your first product.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  {pkg.image_url && (
                    <img
                      src={pkg.image_url}
                      alt={pkg.name}
                      className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Package size={18} className="text-purple-600" />
                          <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{pkg.description}</p>
                      </div>
                      <div className="flex flex-col sm:items-end gap-2">
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium whitespace-nowrap">
                          {formatPrice(pkg.price)}
                        </span>
                        <div className="flex gap-2">
                          {pkg.is_featured && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium">
                              Featured
                            </span>
                          )}
                          {pkg.is_active ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">Category:</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                        {pkg.category}
                      </span>
                      <span className="text-xs text-gray-500 font-medium ml-2">Order:</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                        {pkg.display_order}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handlePackageEdit(pkg)}
                    className="text-[#1C3D5A] hover:text-[#143040] p-1 rounded focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 transition-colors"
                    aria-label="Edit package"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handlePackageDelete(pkg.id)}
                    className="text-red-600 hover:text-red-900 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-colors"
                    aria-label="Delete package"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            
            {packages.length === 0 && !loading && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="text-gray-400 mb-4">
                  <Package className="mx-auto h-12 w-12" />
                </div>
                <p className="text-gray-500 text-lg">No packages found</p>
                <p className="text-gray-400 mt-1">Get started by adding your first package.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

