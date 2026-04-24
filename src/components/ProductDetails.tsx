 'use client';

import { useState } from 'react';
import { X, ShoppingCart, CreditCard, Package, CheckCircle2, Star, TrendingUp, Shield, Truck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCart } from '../CartContext';
import DepositForm from './DepositForm';

interface ProductDetailsProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string | null;
    stock_quantity: number;
    is_featured: boolean;
    specifications: Record<string, any>;
    is_package?: boolean;
    package_products?: Array<{
      product_id: string;
      quantity: number;
      product: {
        id: string;
        name: string;
        price: number;
        image_url: string | null;
      };
    }>;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetails({ product, isOpen, onClose }: ProductDetailsProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleBuyNow = () => {
    const cartItem = {
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      product_image: product.image_url,
      quantity: quantity,
      category: product.category,
    };

    addToCart(cartItem);
    router.push('/checkout');
    onClose();
  };

  const handleMakeDeposit = () => {
    setShowDepositForm(true);
  };

  const handleDepositClose = () => {
    setShowDepositForm(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full my-8 relative"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 z-10 p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-500" />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Left: Image */}
                <div className="relative aspect-square lg:aspect-auto lg:h-[600px] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden rounded-t-3xl lg:rounded-l-3xl lg:rounded-tr-none">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Package size={80} />
                    </div>
                  )}
                  {product.is_package && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                      <Package size={14} />
                      Package Deal
                    </div>
                  )}
                  {product.is_featured && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                      <Star size={14} className="fill-white" />
                      Featured
                    </div>
                  )}
                  {!product.is_package && product.stock_quantity > 0 ? (
                    <div className="absolute bottom-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                      <CheckCircle2 size={14} />
                      {product.stock_quantity} in Stock
                    </div>
                  ) : !product.is_package ? (
                    <div className="absolute bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                      Out of Stock
                    </div>
                  ) : null}
                </div>

                {/* Right: Details */}
                <div className="p-8 lg:p-10 overflow-y-auto max-h-[600px]">
                  {/* Category & Name */}
                  <div className="mb-6">
                    <div className="inline-block px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wide mb-3">
                      {product.category}
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
                      {product.name}
                    </h1>
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {formatPrice(product.price)}
                      </div>
                      {product.is_package ? (
                        <div className="flex items-center gap-1.5 text-purple-600 text-sm font-semibold">
                          <Package size={16} />
                          {product.package_products?.length || 0} Items Included
                        </div>
                      ) : product.stock_quantity > 0 ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold">
                          <CheckCircle2 size={16} />
                          Available
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-3">Description</h2>
                    <p className="text-slate-600 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Package Contents */}
                  {product.is_package && product.package_products && product.package_products.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-slate-900 mb-3">Package Includes</h2>
                      <div className="space-y-2">
                        {product.package_products.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 bg-purple-50 rounded-lg p-3 border border-purple-200">
                            {item.product?.image_url ? (
                              <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="w-12 h-12 object-cover rounded-md"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-purple-100 rounded-md flex items-center justify-center">
                                <Package size={20} className="text-purple-600" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900">{item.product?.name}</p>
                              <p className="text-xs text-slate-600">Quantity: {item.quantity}</p>
                            </div>
                            <div className="text-sm font-semibold text-purple-600">
                              {formatPrice((item.product?.price || 0) * item.quantity)}
                            </div>
                          </div>
                        ))}
                        <div className="mt-3 pt-3 border-t border-purple-200 bg-purple-50 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Total Individual Price:</span>
                            <span className="text-sm line-through text-slate-500">
                              {formatPrice(product.package_products.reduce((sum, item) => 
                                sum + ((item.product?.price || 0) * item.quantity), 0))}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="font-bold text-slate-900">Package Price:</span>
                            <span className="text-lg font-extrabold text-purple-600">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                          <div className="mt-2 text-center">
                            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                              Save {formatPrice(product.package_products.reduce((sum, item) => 
                                sum + ((item.product?.price || 0) * item.quantity), 0) - product.price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Specifications */}
                  {product.specifications && Object.keys(product.specifications).length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-slate-900 mb-3">Specifications</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                              {key}
                            </div>
                            <div className="text-sm font-bold text-slate-900">
                              {String(value)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trust Badges */}
                  <div className="mb-6 flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
                      <Shield className="text-emerald-600" size={16} />
                      <span className="text-xs font-semibold text-emerald-700">Warranty Included</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                      <Truck className="text-blue-600" size={16} />
                      <span className="text-xs font-semibold text-blue-700">Fast Delivery</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg border border-purple-200">
                      <TrendingUp className="text-purple-600" size={16} />
                      <span className="text-xs font-semibold text-purple-700">Best Price</span>
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  {(product.is_package || product.stock_quantity > 0) && (
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Quantity</label>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 border-2 border-slate-200 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="px-4 py-3 hover:bg-slate-50 transition-colors"
                          >
                            -
                          </button>
                          <span className="px-6 py-3 font-bold text-slate-900 min-w-[60px] text-center">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuantity(product.is_package ? quantity + 1 : Math.min(product.stock_quantity, quantity + 1))}
                            className="px-4 py-3 hover:bg-slate-50 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-sm text-slate-600">
                          <span className="font-semibold">Total:</span>{' '}
                          <span className="font-bold text-indigo-600 text-lg">
                            {formatPrice(product.price * quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {(product.is_package || product.stock_quantity > 0) ? (
                    <div className="space-y-3">
                      <button
                        onClick={handleBuyNow}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transform hover:scale-105 text-lg"
                      >
                        <ShoppingCart size={20} />
                        Buy Now
                        <ArrowRight size={20} />
                      </button>
                      <button
                        onClick={handleMakeDeposit}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transform hover:scale-105"
                      >
                        <CreditCard size={20} />
                        Make a Deposit
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-center">
                      <p className="text-red-700 font-semibold">This product is currently out of stock</p>
                      <p className="text-red-600 text-sm mt-1">Please check back later or contact us for availability</p>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="text-xs text-slate-500 space-y-1">
                      <p className="flex items-center gap-2">
                        <CheckCircle2 size={14} />
                        Secure payment processing
                      </p>
                      <p className="flex items-center gap-2">
                        <Truck size={14} />
                        Free delivery on orders over 500,000 UGX
                      </p>
                      <p className="flex items-center gap-2">
                        <Shield size={14} />
                        1-year warranty on all products
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deposit Form Modal */}
      <DepositForm
        product={product}
        isOpen={showDepositForm}
        onClose={handleDepositClose}
        onSuccess={() => {
          handleDepositClose();
          onClose();
        }}
      />
    </>
  );
}

