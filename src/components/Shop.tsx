'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Star, ChevronRight, Package, Search, Shield, CheckCircle2, TrendingUp, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../CartContext';
import DepositForm from './DepositForm';
import ProductDetails from './ProductDetails';

/* -------------------- Types -------------------- */
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
}

/* -------------------- Component -------------------- */
export default function Shop() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('shop_products')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const productsData = data || [];
      setProducts(productsData);
      
      // Get featured products
      const featured = productsData
        .filter(p => p.is_featured)
        .slice(0, 6);
      setFeaturedProducts(featured);
    } catch (err) {
      console.error('Products fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
  
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleProductClick = (product: ShopProduct) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  const handleBuyNow = (product: ShopProduct) => {
    // Add product to cart using CartContext
    const cartItem = {
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      product_image: product.image_url,
      quantity: 1,
      category: product.category,
    };

    addToCart(cartItem);

    // Navigate to checkout
    navigate('/checkout');
  };

  const handleMakeDeposit = (product: ShopProduct) => {
    setSelectedProduct(product);
    setShowDepositForm(true);
  };

  const handleDepositSuccess = () => {
    // Optionally refresh products or show success message
    fetchProducts();
  };

  if (loading) {
    return (
      <section id="shop" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="shop" className="py-24 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 text-indigo-700 text-sm font-bold mb-6 shadow-sm"
          >
            <Package size={18} className="text-indigo-600" />
            Computer Shop
          </motion.div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-4 leading-tight">
            Computers & <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Accessories</span>
          </h2>
          <p className="text-xl lg:text-2xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
            Quality computers, laptops, and accessories for your business and personal needs
          </p>
          
          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-8"
          >
            <div className="flex items-center gap-2 text-slate-600">
              <Shield className="text-emerald-500" size={20} />
              <span className="text-sm font-semibold">Warranty Included</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <CheckCircle2 className="text-indigo-500" size={20} />
              <span className="text-sm font-semibold">Quality Assured</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <TrendingUp className="text-purple-500" size={20} />
              <span className="text-sm font-semibold">Best Prices</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Search and Filter */}
        <div className="mb-12 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm font-medium transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
                    : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 shadow-sm'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <Star className="text-amber-400 fill-amber-400" size={24} />
              Featured Products
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg border-2 border-slate-100 hover:shadow-2xl hover:border-indigo-200 transition-all duration-300 group transform hover:-translate-y-2 cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Package size={48} />
                      </div>
                    )}
                    {product.is_featured && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                        <Star size={12} className="fill-white" />
                        Featured
                      </div>
                    )}
                    {product.stock_quantity === 0 && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-white font-bold text-lg">Out of Stock</span>
                      </div>
                    )}
                    {product.stock_quantity > 0 && (
                      <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        In Stock
                      </div>
                    )}
                  </div>
                  <div className="p-6 bg-white">
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wide">
                        {product.category}
                      </span>
                    </div>
                    <h4 className="text-xl font-extrabold text-slate-900 mb-2 line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                      <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {formatPrice(product.price)}
                      </span>
                      {product.stock_quantity > 0 && (
                        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 size={14} />
                          {product.stock_quantity} available
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMakeDeposit(product);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transform hover:scale-105 text-sm"
                      >
                        <CreditCard size={16} />
                        Deposit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyNow(product);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:scale-105 text-sm"
                      >
                        <ShoppingCart size={16} />
                        Buy Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* All Products Section */}
        <div>
          <h3 className="text-2xl font-bold text-slate-900 mb-8">
            All Products {filteredProducts.length > 0 && `(${filteredProducts.length})`}
          </h3>
          
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <Package className="mx-auto text-slate-400 mb-4" size={48} />
              <p className="text-slate-600 text-lg">No products found</p>
              <p className="text-slate-500 text-sm mt-2">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-md border-2 border-slate-100 hover:shadow-2xl hover:border-indigo-200 transition-all duration-300 group cursor-pointer transform hover:-translate-y-1"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Package size={48} />
                      </div>
                    )}
                    {product.stock_quantity === 0 && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-white font-bold">Out of Stock</span>
                      </div>
                    )}
                    {product.stock_quantity > 0 && (
                      <div className="absolute top-3 left-3 bg-emerald-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
                        In Stock
                      </div>
                    )}
                  </div>
                  <div className="p-5 bg-white">
                    <div className="mb-2">
                      <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wide">
                        {product.category}
                      </span>
                    </div>
                    <h4 className="text-lg font-extrabold text-slate-900 mb-2 line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="text-slate-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                      <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMakeDeposit(product);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-bold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 text-xs transform hover:scale-105"
                      >
                        <CreditCard size={14} />
                        Deposit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyNow(product);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 text-xs transform hover:scale-105"
                      >
                        <ShoppingCart size={14} />
                        Buy Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Details Modal */}
      <ProductDetails
        product={selectedProduct}
        isOpen={showProductDetails}
        onClose={() => {
          setShowProductDetails(false);
          setSelectedProduct(null);
        }}
      />

      {/* Deposit Form Modal */}
      <DepositForm
        product={selectedProduct}
        isOpen={showDepositForm}
        onClose={() => {
          setShowDepositForm(false);
          setSelectedProduct(null);
        }}
        onSuccess={handleDepositSuccess}
      />
    </section>
  );
}

