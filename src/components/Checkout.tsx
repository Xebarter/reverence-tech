import { useState } from 'react';
import { ArrowLeft, CreditCard, Smartphone, Building2, Wallet, MapPin, Package, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { adminSupabase } from '../lib/supabase';
import { useCart } from '../CartContext';
import { describeFunctionsHttpError } from '../lib/describeFunctionsHttpError';
import { initiateDpoCheckout } from '../lib/initiateDpoCheckout';

interface CheckoutProps {
  onClose?: () => void;
}

type PaymentMethod = 'dpo' | 'mobile_money' | 'bank_transfer' | 'cash' | 'other';

export default function Checkout({ onClose }: CheckoutProps) {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, clearCart, getTotal } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    city: '',
    country: 'Uganda',
    payment_method: 'dpo' as PaymentMethod,
    payment_reference: '',
    notes: '',
  });

  const isPaymentReferenceRequired =
    formData.payment_method === 'mobile_money' || formData.payment_method === 'bank_transfer';

  const paymentVerification = (() => {
    if (formData.payment_method === 'dpo') {
      return {
        title: 'Secure DPO checkout',
        description:
          'After placing your order, you will be redirected to DPO Pay to complete your payment securely.',
      };
    }

    if (formData.payment_method === 'mobile_money' || formData.payment_method === 'bank_transfer') {
      return {
        title: 'Payment verification',
        description:
          'After you place your order, we will verify your transaction using the reference/transaction ID you provide. Please keep it for your records.',
      };
    }

    if (formData.payment_method === 'cash') {
      return {
        title: 'Cash handling',
        description:
          'Your order will be marked pending until we confirm delivery/pickup details with you. We may contact you if we need more information.',
      };
    }

    return {
      title: 'Secure processing',
      description:
        'Your order will be marked pending while we review your payment details. We will follow up using the email and phone you provide.',
    };
  })();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleUpdateQuantity = (productId: string, change: number) => {
    const item = cartItems.find(item => item.product_id === productId);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      updateQuantity(productId, newQuantity);
    }
  };

  const calculateSubtotal = () => {
    return getTotal();
  };

  const calculateShipping = () => {
    // Simple shipping calculation - can be made more complex
    return 50000; // 50,000 UGX default shipping
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (cartItems.length === 0) {
      setError('Your cart is empty');
      setSubmitting(false);
      return;
    }

    if (isPaymentReferenceRequired && !formData.payment_reference.trim()) {
      setError('Please enter your payment reference/transaction ID.');
      setSubmitting(false);
      return;
    }

    try {
      const isDpoPayment = formData.payment_method === 'dpo';
      const orderData = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        shipping_address: formData.shipping_address,
        city: formData.city,
        country: formData.country,
        payment_method: isDpoPayment ? 'dpo' : formData.payment_method,
        payment_reference: isDpoPayment ? null : formData.payment_reference || null,
        payment_status: 'pending',
        order_status: 'pending',
        total_amount: calculateTotal(),
        shipping_fee: calculateShipping(),
        items: cartItems.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          product_price: item.product_price,
          product_image: item.product_image,
          category: item.category,
          quantity: item.quantity,
          subtotal: item.product_price * item.quantity,
        })),
        notes: formData.notes || null,
      };

      if (isDpoPayment) {
        const redirectUrl = `${window.location.origin}/payment-result`;

        const { redirectUrl: dpoRedirectUrl } = await initiateDpoCheckout(orderData, {
          amount: calculateTotal(),
          currency: 'UGX',
          serviceName: 'Shop Order',
          customer: {
            fullName: formData.customer_name,
            email: formData.customer_email,
            phone: formData.customer_phone,
          },
          redirectUrl,
        });

        clearCart();
        window.location.href = dpoRedirectUrl;
        return;
      }

      const { data, error: insertError } = await adminSupabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (insertError) throw insertError;

      setOrderNumber(data.order_number);
      setSubmitted(true);
      
      // Clear cart only after the order record is created.
      clearCart();
    } catch (err: unknown) {
      console.error('Error submitting order:', err);
      const fromHttp = await describeFunctionsHttpError(err);
      setError(
        fromHttp ??
          (err instanceof Error ? err.message : null) ??
          'Sorry, we couldn’t place your order. Please check your details and try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0 && !submitted) {
    return (
      <section className="py-24 px-4 bg-gradient-to-b from-slate-50 to-white min-h-screen">
        <div className="max-w-4xl mx-auto text-center">
          <Package className="mx-auto text-slate-400 mb-4" size={64} />
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Your Cart is Empty</h1>
          <p className="text-slate-600 mb-8">Add some products to your cart to continue.</p>
          <button
            onClick={() => {
              if (onClose) onClose();
              else navigate('/#shop');
            }}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </section>
    );
  }

  if (submitted) {
    return (
      <section className="py-24 px-4 bg-gradient-to-b from-slate-50 to-white min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Order Placed Successfully!</h1>
          <p className="text-xl text-slate-600 mb-6">
            Your order number is: <span className="font-bold text-indigo-600">{orderNumber}</span>
          </p>
          <p className="text-slate-600 mb-4">
            We’ve received your order. It’s currently pending review, and we’ll update the status soon.
            You can track it anytime using your order number.
          </p>
          {isPaymentReferenceRequired && formData.payment_reference.trim() && (
            <p className="text-xs text-slate-500 mb-8">
              Payment reference:{' '}
              <span className="font-mono font-bold text-indigo-600">{formData.payment_reference.trim()}</span>
            </p>
          )}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                if (onClose) onClose();
                else navigate('/');
              }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
            >
              Return Home
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors"
            >
              Track Order
            </button>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="py-10 sm:py-16 lg:py-24 px-4 bg-gradient-to-b from-slate-50 to-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => {
              if (onClose) onClose();
              else navigate('/#shop');
            }}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold">Back to Shop</span>
          </button>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">Checkout</h1>
          <p className="text-slate-600">Complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-100 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Customer Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="customer_email"
                      value={formData.customer_email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="customer_phone"
                      value={formData.customer_phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      placeholder="+256 700 000 000"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-100 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <MapPin size={24} className="text-indigo-600" />
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Street Address *</label>
                    <input
                      type="text"
                      name="shipping_address"
                      value={formData.shipping_address}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      placeholder="Street address, building, apartment"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        placeholder="Kampala"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Country *</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        placeholder="Uganda"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-100 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <CreditCard size={24} className="text-indigo-600" />
                  Payment Method
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[
                    { value: 'dpo', label: 'DPO Pay', icon: CreditCard },
                    { value: 'mobile_money', label: 'Mobile Money', icon: Smartphone },
                    { value: 'bank_transfer', label: 'Bank Transfer', icon: Building2 },
                    { value: 'cash', label: 'Cash', icon: Wallet },
                    { value: 'other', label: 'Other', icon: CreditCard },
                  ].map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, payment_method: method.value as PaymentMethod }))}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.payment_method === method.value
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 hover:border-indigo-300 text-slate-700'
                        }`}
                      >
                        <Icon size={24} className="mx-auto mb-2" />
                        <div className="text-xs font-bold">{method.label}</div>
                      </button>
                    );
                  })}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Payment Reference / Transaction ID{' '}
                    {isPaymentReferenceRequired ? (
                      <span className="text-red-600">*</span>
                    ) : (
                      <span className="text-slate-500 font-semibold">(optional)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="payment_reference"
                    value={formData.payment_reference}
                    onChange={handleChange}
                    required={isPaymentReferenceRequired}
                    className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all ${
                      isPaymentReferenceRequired && !formData.payment_reference.trim()
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                    }`}
                    placeholder={isPaymentReferenceRequired ? 'Enter transaction ID or reference *' : 'Enter transaction ID or reference (optional)'}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    {isPaymentReferenceRequired
                      ? 'Required for Mobile Money and Bank Transfer.'
                      : 'You can leave this blank if paying with DPO, cash, or other methods.'}
                  </p>
                </div>
              </div>

              {/* Trust / Next steps */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck size={22} className="text-indigo-600 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">{paymentVerification.title}</div>
                    <p className="text-sm text-slate-600 mt-1">{paymentVerification.description}</p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  By placing your order, you agree to our{' '}
                  <Link to="/terms" className="font-semibold text-indigo-700 hover:text-indigo-800 underline">
                    Terms &amp; Conditions
                  </Link>{' '}
                  and{' '}
                  <Link
                    to="/refund-policy"
                    className="font-semibold text-indigo-700 hover:text-indigo-800 underline"
                  >
                    Refund Policy
                  </Link>
                  .
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-100 p-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Additional Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"
                  placeholder="Any special instructions or notes..."
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  role="alert"
                  aria-live="polite"
                  className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
                >
                  <AlertCircle size={20} />
                  <span className="text-sm font-medium">{error}</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {submitting ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    Processing Order...
                  </>
                ) : (
                  <>
                    <CreditCard size={24} />
                    {formData.payment_method === 'dpo' ? 'Proceed to DPO Pay' : 'Place Order'}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-100 p-6 lg:sticky lg:top-24 max-h-[calc(100vh-14rem)] overflow-y-auto">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.product_id} className="flex gap-4 pb-4 border-b border-slate-200 last:border-0">
                    {item.product_image && (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-sm mb-1">{item.product_name}</h3>
                      <p className="text-xs text-slate-500 mb-2">{item.category}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.product_id, -1)}
                            className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-100"
                          >
                            -
                          </button>
                          <span className="font-bold text-slate-900 w-8 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.product_id, 1)}
                            className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-100"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-900">{formatPrice(item.product_price * item.quantity)}</div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product_id)}
                            className="text-xs text-red-600 hover:text-red-700 mt-1"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatPrice(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-semibold">{formatPrice(calculateShipping())}</span>
                </div>
                <div className="flex justify-between text-xl font-extrabold text-slate-900 pt-4 border-t border-slate-200">
                  <span>Total</span>
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {formatPrice(calculateTotal())}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

