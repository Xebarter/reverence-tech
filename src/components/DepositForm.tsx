import { useState, useEffect } from 'react';
import { X, CreditCard, Smartphone, Building2, Wallet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface DepositFormProps {
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    category: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}



export default function DepositForm({ product, isOpen, onClose, onSuccess }: DepositFormProps) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    deposit_amount: '',
    payment_method: 'mobile_money' as 'mobile_money' | 'bank_transfer' | 'cash' | 'other',
    payment_reference: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  // Note: Keeping for future enhancements; currently unused in UI
  const [, setExistingDeposits] = useState<any[]>([]);
  const [totalDeposited, setTotalDeposited] = useState(0);

  useEffect(() => {
    if (isOpen && product) {
      fetchExistingDeposits();
    }
  }, [isOpen, product]);

  const fetchExistingDeposits = async () => {
    if (!product) return;
    
    try {
      // For now, we'll check by product_id only
      // In a real app, you'd also filter by customer email/phone after they enter it
      const { data, error } = await supabase
        .from('customer_deposits')
        .select('*')
        .eq('product_id', product.id)
        .in('status', ['pending', 'confirmed'])
        .order('created_at', { ascending: false});

      if (error) throw error;
      
      const deposits = data || [];
      setExistingDeposits(deposits);
      
      // Calculate total deposited (this would normally be per customer)
      const total = deposits.reduce((sum, d) => sum + parseFloat(d.total_deposited || 0), 0);
      setTotalDeposited(total);
    } catch (err) {
      console.error('Error fetching deposits:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const calculateRemaining = () => {
    if (!product || !formData.deposit_amount) return product?.price || 0;
    const deposit = parseFloat(formData.deposit_amount) || 0;
    return Math.max(0, product.price - deposit - totalDeposited);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!product) {
      setError('No product selected');
      setSubmitting(false);
      return;
    }

    const depositAmount = parseFloat(formData.deposit_amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setError('Please enter a valid deposit amount');
      setSubmitting(false);
      return;
    }

    if (depositAmount > product.price) {
      setError('Deposit amount cannot exceed product price');
      setSubmitting(false);
      return;
    }

    try {
      const newTotalDeposited = totalDeposited + depositAmount;
      const remainingBalance = product.price - newTotalDeposited;
      const isCompleted = remainingBalance <= 0;

      const depositData = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        deposit_amount: depositAmount,
        total_deposited: newTotalDeposited,
        remaining_balance: Math.max(0, remainingBalance),
        status: isCompleted ? 'completed' : 'pending',
        payment_method: formData.payment_method,
        payment_reference: formData.payment_reference || null,
        notes: formData.notes || null,
        completed_at: isCompleted ? new Date().toISOString() : null,
      };

      const { error: insertError } = await supabase
        .from('customer_deposits')
        .insert([depositData]);

      if (insertError) throw insertError;

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
        if (onSuccess) onSuccess();
        // Reset form
        setFormData({
          customer_name: '',
          customer_email: '',
          customer_phone: '',
          deposit_amount: '',
          payment_method: 'mobile_money',
          payment_reference: '',
          notes: '',
        });
      }, 3000);
    } catch (err: any) {
      console.error('Error submitting deposit:', err);
      setError(err.message || 'Failed to submit deposit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !product) return null;

  const remaining = calculateRemaining();
  const progress = product.price > 0 ? ((totalDeposited / product.price) * 100) : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Make a Deposit</h2>
              <p className="text-slate-600 mt-1">Secure your purchase with a deposit</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={24} className="text-slate-500" />
            </button>
          </div>

          <div className="p-6">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} className="text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Deposit Submitted!</h3>
                <p className="text-slate-600">We've received your deposit. Our team will confirm it shortly.</p>
              </motion.div>
            ) : (
              <>
                {/* Product Info */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6 border border-indigo-100">
                  <div className="flex gap-4">
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded-xl"
                      />
                    )}
                    <div className="flex-1">
                      <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1">
                        {product.category}
                      </div>
                      <h3 className="text-xl font-extrabold text-slate-900 mb-2">{product.name}</h3>
                      <div className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {new Intl.NumberFormat('en-UG', {
                          style: 'currency',
                          currency: 'UGX',
                          minimumFractionDigits: 0,
                        }).format(product.price)}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {totalDeposited > 0 && (
                    <div className="mt-4 pt-4 border-t border-indigo-200">
                      <div className="flex justify-between text-sm font-semibold mb-2">
                        <span className="text-slate-600">Total Deposited</span>
                        <span className="text-indigo-600">
                          {new Intl.NumberFormat('en-UG', {
                            style: 'currency',
                            currency: 'UGX',
                            minimumFractionDigits: 0,
                          }).format(totalDeposited)} / {new Intl.NumberFormat('en-UG', {
                            style: 'currency',
                            currency: 'UGX',
                            minimumFractionDigits: 0,
                          }).format(product.price)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        {remaining > 0 ? (
                          <span>Remaining: {new Intl.NumberFormat('en-UG', {
                            style: 'currency',
                            currency: 'UGX',
                            minimumFractionDigits: 0,
                          }).format(remaining)}</span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">Fully Paid!</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Customer Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Full Name *
                      </label>
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
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Email Address *
                      </label>
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
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Phone Number *
                    </label>
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

                  {/* Deposit Amount */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Deposit Amount (UGX) *
                    </label>
                    <input
                      type="number"
                      name="deposit_amount"
                      value={formData.deposit_amount}
                      onChange={handleChange}
                      required
                      min="1"
                      max={product.price}
                      step="1000"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-lg font-bold"
                      placeholder="Enter amount"
                    />
                    <div className="mt-2 text-sm text-slate-500">
                      {formData.deposit_amount && (
                        <div>
                          <span className="font-semibold">Remaining after deposit: </span>
                          <span className="text-indigo-600 font-bold">
                            {new Intl.NumberFormat('en-UG', {
                              style: 'currency',
                              currency: 'UGX',
                              minimumFractionDigits: 0,
                            }).format(remaining)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Payment Method *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
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
                            onClick={() => setFormData(prev => ({ ...prev, payment_method: method.value as any }))}
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
                  </div>

                  {/* Payment Reference */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Payment Reference / Transaction ID
                    </label>
                    <input
                      type="text"
                      name="payment_reference"
                      value={formData.payment_reference}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      placeholder="Enter transaction ID or reference"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Please provide your payment reference for verification
                    </p>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"
                      placeholder="Any additional information..."
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
                    >
                      <AlertCircle size={20} />
                      <span className="text-sm font-medium">{error}</span>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard size={20} />
                          Submit Deposit
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

