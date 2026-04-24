'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Check,
  Sparkles,
  ShieldCheck,
  Zap,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { describeFunctionsHttpError } from '../lib/describeFunctionsHttpError';
import { initiateDpoCheckout } from '../lib/initiateDpoCheckout';

/* -------------------- Types -------------------- */
interface Service {
  id: string;
  package_name: string;
  description: string;
  key_features: { feature: string }[];
  target_audience: { audience: string }[];
  suggested_pricing: string;
  display_order: number;
  created_at: string;
}

function parseUgxAmountRange(pricing: string): { min: number; max: number | null } {
  // Supports strings like:
  // - "UGX 500,000 – 1,000,000"
  // - "UGX 2,500,000+"
  // - "From $999" (best-effort fallback)
  const normalized = (pricing || '').replace(/\s+/g, ' ').trim();
  const rangeMatch = normalized.match(/(?:UGX|UGS)\s*([0-9][0-9,]*)\s*[-\u2013]\s*([0-9][0-9,]*)/i);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1].replace(/,/g, ''), 10);
    const max = parseInt(rangeMatch[2].replace(/,/g, ''), 10);
    return { min, max };
  }

  const plusMatch = normalized.match(/(?:UGX|UGS)\s*([0-9][0-9,]*)\s*\+/i);
  if (plusMatch) {
    const min = parseInt(plusMatch[1].replace(/,/g, ''), 10);
    return { min, max: null };
  }

  // Fallback: first number in the string.
  const anyNumberMatch = normalized.match(/([0-9][0-9,]*)(?:\.[0-9]+)?/);
  if (anyNumberMatch) {
    const min = parseInt(anyNumberMatch[1].replace(/,/g, ''), 10);
    return { min, max: null };
  }

  return { min: 0, max: null };
}

/* -------------------- Component -------------------- */
export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'confirm' | 'processing'>('details');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const [showAllServices, setShowAllServices] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    country: 'Uganda',
    amount: 0,
    notes: '',
  });

  const [amountRange, setAmountRange] = useState<{ min: number; max: number | null }>({
    min: 0,
    max: null,
  });

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [pendingOrderNumber, setPendingOrderNumber] = useState<string>('');
  const [pendingStatusToken, setPendingStatusToken] = useState<string>('');

  const inputClass =
    'w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all';

  const stepIndex = checkoutStep === 'details' ? 0 : checkoutStep === 'confirm' ? 1 : 2;

  const resetCheckout = useCallback(() => {
    setCheckoutOpen(false);
    setSelectedService(null);
    setCheckoutStep('details');
    setAmountRange({ min: 0, max: null });
    setProcessing(false);
    setError('');
    setPendingOrderNumber('');
    setPendingStatusToken('');
  }, []);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (!checkoutOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (processing || checkoutStep === 'processing') return;
      resetCheckout();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [checkoutOpen, processing, checkoutStep, resetCheckout]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      console.error('Service fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = (service?: Service | null) => {
    const next = service ?? null;
    if (!next) return;

    const { min, max } = parseUgxAmountRange(next.suggested_pricing);

    setSelectedService(next);
    setAmountRange({ min, max });
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      city: '',
      country: 'Uganda',
      amount: min,
      notes: '',
    });
    setCheckoutStep('details');
    setProcessing(false);
    setError('');
    setCheckoutOpen(true);
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name === 'amount') {
        return { ...prev, amount: Math.max(0, Number(value || 0)) };
      }
      return { ...prev, [name as keyof typeof prev]: value } as typeof prev;
    });
    setError('');
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedService) {
      setError('Please select a service package.');
      return;
    }
    if (!formData.amount || formData.amount <= 0) {
      setError('Please enter a valid amount to pay.');
      return;
    }
    setCheckoutStep('confirm');
  };

  const handlePayWithDpo = async () => {
    if (!selectedService) return;
    if (!formData.amount || formData.amount <= 0) return;
    if (!formData.full_name || !formData.email || !formData.phone) return;

    setProcessing(true);
    setError('');

    try {
      const orderData = {
        customer_name: formData.full_name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: formData.address || 'N/A',
        city: formData.city || 'N/A',
        country: formData.country || 'Uganda',
        payment_method: 'dpo' as const,
        payment_reference: null,
        payment_status: 'pending' as const,
        order_status: 'pending' as const,
        total_amount: formData.amount,
        shipping_fee: 0,
        items: [
          {
            product_id: selectedService.id,
            product_name: selectedService.package_name,
            product_price: formData.amount,
            product_image: null,
            category: 'service',
            quantity: 1,
            subtotal: formData.amount,
          },
        ],
        notes: formData.notes || null,
      };

      // Use Vercel Serverless (/api) in production, so DPO sees an HTTPS origin and
      // the server-to-server call comes from your Vercel deployment (not the browser).
      const redirectUrl = `${window.location.origin}/payment-result`;

      const { orderNumber, redirectUrl: dpoRedirectUrl, statusToken: serverStatusToken } = await initiateDpoCheckout(
        orderData,
        {
          amount: formData.amount,
          currency: 'UGX',
          serviceName: selectedService.package_name,
          customer: {
            fullName: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            company: formData.company || null,
          },
          redirectUrl,
        },
      );

      setPendingOrderNumber(orderNumber);
      setPendingStatusToken(serverStatusToken || '');

      setCheckoutStep('processing');
      window.location.href = dpoRedirectUrl;
    } catch (e: unknown) {
      console.error('DPO payment error:', e);
      const fromHttp = await describeFunctionsHttpError(e);
      setError(
        fromHttp ??
          (e instanceof Error ? e.message : null) ??
          'Failed to initiate payment. Please try again.',
      );
      setProcessing(false);
      setCheckoutStep('confirm');
      setPendingOrderNumber('');
      setPendingStatusToken('');
    }
  };

  if (loading) {
    return (
      <section className="py-24 bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#1C3D5A] rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading service offerings…</p>
        </div>
      </section>
    );
  }

  const servicesToShow = showAllServices ? services : services.slice(0, 6);

  return (
    <section
      id="services"
      className="relative py-24 px-4 bg-slate-50 overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#1C3D5A]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-semibold mb-6"
            style={{ backgroundColor: 'rgba(28,61,90,0.07)', borderColor: 'rgba(28,61,90,0.15)', color: '#1C3D5A' }}
          >
            <ShieldCheck size={15} />
            Trusted Digital Solutions
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6"
          >
            Solutions designed for{' '}
            <span className="text-amber-500">growth & stability</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-500 max-w-2xl mx-auto"
          >
            Reliable, secure, and scalable digital services for startups,
            institutions, and enterprises across East Africa.
          </motion.p>
        </div>

        {/* Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesToShow.map((service, index) => {
            const featured = index === 1;

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className={`relative flex flex-col rounded-3xl p-8 transition ${featured
                  ? 'bg-slate-900 text-white shadow-2xl ring-2 ring-amber-400/20'
                  : 'bg-white border border-slate-200 shadow-sm hover:shadow-xl'
                  }`}
              >
                {featured && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-[10px] font-black px-4 py-1 rounded-full tracking-widest">
                    MOST SELECTED
                  </span>
                )}

                <div className="mb-8">
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`p-3 rounded-2xl ${featured
                        ? 'bg-amber-400/10 text-amber-400'
                        : 'bg-[#1C3D5A]/8 text-[#1C3D5A]'
                        }`}
                      style={!featured ? { backgroundColor: 'rgba(28,61,90,0.08)' } : {}}
                    >
                      {index % 3 === 0 ? (
                        <Zap size={24} />
                      ) : index % 3 === 1 ? (
                        <ShieldCheck size={24} />
                      ) : (
                        <Sparkles size={24} />
                      )}
                    </div>
                    <span
                      className={`text-xl font-black ${featured ? 'text-amber-400' : 'text-slate-900'
                        }`}
                    >
                      {service.suggested_pricing}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold mb-3">
                    {service.package_name}
                  </h3>
                  <p
                    className={`text-sm ${featured ? 'text-slate-400' : 'text-slate-600'
                      }`}
                  >
                    {service.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {service.key_features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Check
                        size={16}
                        className={featured ? 'text-amber-400' : 'text-[#1C3D5A]'}
                      />
                      <span
                        className={
                          featured ? 'text-slate-300' : 'text-slate-600'
                        }
                      >
                        {f.feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleGetStarted(service)}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition ${featured
                    ? 'bg-amber-400 text-[#1C3D5A] hover:bg-amber-300'
                    : 'bg-[#1C3D5A] text-white hover:bg-[#152f45]'
                    }`}
                >
                  Request This Service <ChevronRight size={18} />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* View toggle */}
        {services.length > 6 && (
          <div className="mt-16 text-center">
            <button
              onClick={() => setShowAllServices(!showAllServices)}
              className="px-8 py-3 bg-white border border-slate-200 rounded-full font-semibold hover:bg-slate-50"
            >
              {showAllServices
                ? 'Show Featured Services'
                : `View All ${services.length} Services`}
            </button>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      <AnimatePresence>
        {checkoutOpen && selectedService && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (processing || checkoutStep === 'processing') return;
                resetCheckout();
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden"
            >
              <div className="p-6 sm:p-10">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className="text-center flex-1">
                    <h4 className="text-2xl font-extrabold text-slate-900">
                      {checkoutStep === 'details'
                        ? 'Service Checkout'
                        : checkoutStep === 'confirm'
                          ? 'Confirm & Pay'
                          : 'Processing Payment'}
                    </h4>
                    <p className="text-slate-600 mt-2">
                      Payments are handled securely by DPO Pay.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (processing || checkoutStep === 'processing') return;
                      resetCheckout();
                    }}
                    disabled={processing || checkoutStep === 'processing'}
                    className={`p-2 rounded-full hover:bg-slate-100 transition-colors ${
                      processing || checkoutStep === 'processing' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    aria-label="Close checkout"
                  >
                    <X size={22} className="text-slate-500" />
                  </button>
                </div>

                {/* Stepper */}
                <div className="flex items-center justify-between mb-8 px-3">
                  {[
                    { key: 'details', label: 'Details' },
                    { key: 'confirm', label: 'Confirm' },
                    { key: 'processing', label: 'Pay' },
                  ].map((s, idx) => {
                    const active = idx <= stepIndex;
                    return (
                      <div key={s.key} className="flex-1 flex items-center gap-3">
                        <div className="flex items-center justify-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                              active
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                : 'border-slate-200 bg-white text-slate-400'
                            }`}
                          >
                            <span className="text-sm font-extrabold">{idx + 1}</span>
                          </div>
                        </div>
                        {idx < 2 && (
                          <div className={`h-1 flex-1 rounded-full ${active ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                        )}
                        {idx === stepIndex && (
                          <div className="whitespace-nowrap text-sm font-bold text-slate-900">
                            {s.label}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {error && (
                  <div
                    className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm"
                    role="alert"
                    aria-live="polite"
                  >
                    {error}
                  </div>
                )}

                {checkoutStep === 'details' && (
                  <form
                    onSubmit={handleNext}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                  >
                    <input
                      required
                      name="full_name"
                      placeholder="Full Name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className={inputClass}
                    />

                    <input
                      required
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      className={inputClass}
                    />

                    <input
                      required
                      name="phone"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                      className={inputClass}
                    />

                    <input
                      name="company"
                      placeholder="Company (optional)"
                      value={formData.company}
                      onChange={handleChange}
                      className={inputClass}
                    />

                    <input
                      required
                      name="address"
                      placeholder="Address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`${inputClass} sm:col-span-2`}
                    />

                    <input
                      required
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                      className={inputClass}
                    />

                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="Uganda">Uganda</option>
                      <option value="Kenya">Kenya</option>
                      <option value="Tanzania">Tanzania</option>
                      <option value="Rwanda">Rwanda</option>
                      <option value="South Sudan">South Sudan</option>
                      <option value="Other">Other</option>
                    </select>

                    <div className="sm:col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="text-sm font-bold text-slate-700 mb-2">
                        Selected Service
                      </div>
                      <div className="text-slate-900 font-extrabold">
                        {selectedService.package_name}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {selectedService.suggested_pricing}
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Amount to Pay (UGX) *
                        </label>
                        {amountRange.max ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                              <span>
                                Suggested: {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(amountRange.min)}
                              </span>
                              <span>
                                Up to: {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(amountRange.max)}
                              </span>
                            </div>

                            <input
                              required
                              type="range"
                              name="amount"
                              min={amountRange.min}
                              max={amountRange.max}
                              step={1000}
                              value={formData.amount || amountRange.min}
                              disabled
                              onChange={(e) =>
                                e.preventDefault()
                              }
                              className="w-full accent-indigo-600 opacity-60 cursor-not-allowed"
                            />

                            <div className="flex gap-3">
                              <button
                                type="button"
                                disabled
                                className="flex-1 py-2 rounded-xl border-2 border-slate-200 text-slate-700 font-bold opacity-60 cursor-not-allowed transition"
                                onClick={() => setFormData(prev => ({ ...prev, amount: amountRange.min }))}
                              >
                                Min
                              </button>
                              <button
                                type="button"
                                disabled
                                className="flex-1 py-2 rounded-xl border-2 border-slate-200 text-slate-700 font-bold opacity-60 cursor-not-allowed transition"
                                onClick={() =>
                                  setFormData(prev => ({
                                    ...prev,
                                    amount:
                                      Math.round(((amountRange.min + (amountRange.max as number)) / 2) / 1000) * 1000,
                                  }))
                                }
                              >
                                Mid
                              </button>
                              <button
                                type="button"
                                disabled
                                className="flex-1 py-2 rounded-xl border-2 border-indigo-500 text-indigo-700 font-bold opacity-60 cursor-not-allowed transition"
                                onClick={() => setFormData(prev => ({ ...prev, amount: amountRange.max as number }))}
                              >
                                Max
                              </button>
                            </div>

                            <input
                              required
                              type="number"
                              name="amount"
                              min={1}
                              step={1000}
                              value={formData.amount || 0}
                              readOnly
                              className={`${inputClass} bg-slate-100 cursor-not-allowed`}
                            />
                          </div>
                        ) : (
                          <input
                            required
                            type="number"
                            name="amount"
                            min={1}
                            step={1000}
                            value={formData.amount || 0}
                            readOnly
                            className={`${inputClass} bg-slate-100 cursor-not-allowed`}
                          />
                        )}
                        <p className="mt-1 text-xs text-slate-500">
                          This payment will be sent to DPO Pay. Final scope can be agreed by email after payment.
                        </p>
                      </div>
                    </div>

                    <textarea
                      required
                      name="notes"
                      rows={4}
                      placeholder="Briefly describe your needs"
                      value={formData.notes}
                      onChange={handleChange}
                      className={`${inputClass} col-span-full resize-none`}
                    />

                    <button
                      type="submit"
                      disabled={processing}
                      className="col-span-full py-5 bg-[#1C3D5A] text-white font-bold rounded-2xl hover:bg-[#152f45] transition disabled:opacity-60"
                    >
                      Continue to Payment
                    </button>
                  </form>
                )}

                {checkoutStep === 'confirm' && (
                  <div className="space-y-5">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="text-sm font-bold text-slate-700 mb-2">
                        Payment Summary
                      </div>
                      <div className="text-slate-900 font-extrabold">
                        {selectedService.package_name}
                      </div>
                      <div className="text-slate-600 mt-2 text-sm">
                        Amount: <span className="font-bold text-slate-900">{new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(formData.amount || 0)}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Payment method: DPO Pay (cards/secure checkout)
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-1">
                        <div>
                          Customer: <span className="font-bold text-slate-700">{formData.full_name}</span> ({formData.email})
                        </div>
                        <div>
                          Phone: <span className="font-bold text-slate-700">{formData.phone}</span>
                        </div>
                        <div>
                          Address: <span className="font-bold text-slate-700">{formData.address}</span>, {formData.city}, {formData.country}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900">
                      <div className="font-bold mb-1">What happens next?</div>
                      <div className="text-sm">
                        You will be redirected over HTTPS to DPO Pay to complete the payment securely. Once DPO Pay confirms,
                        our system updates your order status automatically. Keep the order reference shown during processing so you can check status anytime.
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setCheckoutStep('details');
                          setPendingOrderNumber('');
                          setPendingStatusToken('');
                        }}
                        className="flex-1 py-4 border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handlePayWithDpo}
                        disabled={processing}
                        className="flex-1 py-4 bg-[#1C3D5A] text-white font-bold rounded-2xl hover:bg-[#152f45] transition disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {processing ? 'Redirecting…' : 'Pay with DPO Pay'}
                      </button>
                    </div>
                  </div>
                )}

                {checkoutStep === 'processing' && (
                  <div className="text-center py-10">
                    <div className="mx-auto mb-4 w-12 h-12 border-4 border-slate-200 border-t-[#1C3D5A] rounded-full animate-spin" />
                    <h4 className="text-xl font-bold text-slate-900 mb-2">
                      Redirecting to DPO Pay…
                    </h4>
                    <p className="text-slate-600 text-sm">
                      {pendingOrderNumber ? (
                        <>
                          Order ref: <span className="font-bold font-mono text-slate-900">{pendingOrderNumber}</span>
                        </>
                      ) : (
                        'Preparing your secure checkout…'
                      )}
                    </p>
                    <p className="text-slate-600 text-sm mt-1">
                      If you are not redirected automatically, return and track your order using the reference above.
                    </p>

                    {pendingOrderNumber && (
                      <div className="mt-5 flex gap-3 justify-center">
                        <Link
                          href={`/payment-result?order=${encodeURIComponent(pendingOrderNumber)}&t=${encodeURIComponent(pendingStatusToken)}`}
                          className="px-5 py-2 bg-[#1C3D5A] text-white font-bold rounded-xl hover:bg-[#152f45] transition"
                        >
                          Check payment status
                        </Link>
                        <Link
                          href="/orders"
                          className="px-5 py-2 border-2 border-[#1C3D5A] text-[#1C3D5A] font-bold rounded-xl hover:bg-[#1C3D5A]/5 transition"
                        >
                          Track order
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
