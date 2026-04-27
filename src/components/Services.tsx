'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Check,
  Lock,
  MapPin,
  Sparkles,
  ShieldCheck,
  User,
  Zap,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { describeFunctionsHttpError } from '../lib/describeFunctionsHttpError';

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

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-slate-500"
    >
      {children}
    </label>
  );
}

/* -------------------- Component -------------------- */
export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'processing'>('details');
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

  const fieldInputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-[0.9375rem] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#1C3D5A] focus:ring-2 focus:ring-[#1C3D5A]/12';

  const stepIndex = checkoutStep === 'details' ? 0 : 1;
  const checkoutSteps = [
    { key: 'details', label: 'Your details' },
    { key: 'done', label: 'Confirmation' },
  ] as const;

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

  const handleDetailsSubmit = async (e: React.FormEvent) => {
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
    await submitServiceOrder();
  };

  const submitServiceOrder = async () => {
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
        payment_method: 'other' as const,
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

      const resp = await fetch('/api/orders/create-service-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: orderData, startHostedCheckout: true }),
      });

      const json = (await resp.json().catch(() => null)) as {
        orderNumber?: string;
        statusToken?: string;
        hostedCheckoutUrl?: string;
        error?: string;
      } | null;

      if (!resp.ok) {
        throw new Error(json?.error || `Request failed (HTTP ${resp.status})`);
      }

      const orderNumber = json?.orderNumber;
      const serverStatusToken = json?.statusToken;
      if (!orderNumber || !serverStatusToken) {
        throw new Error('Invalid response from server');
      }

      setPendingOrderNumber(orderNumber);
      setPendingStatusToken(serverStatusToken);

      if (json.hostedCheckoutUrl) {
        setCheckoutStep('processing');
        window.location.href = json.hostedCheckoutUrl;
        return;
      }

      setCheckoutStep('processing');
      const nextUrl = `${window.location.origin}/payment-result?kind=service&order=${encodeURIComponent(orderNumber)}&t=${encodeURIComponent(serverStatusToken)}`;
      window.location.href = nextUrl;
    } catch (e: unknown) {
      console.error('Service order error:', e);
      const fromHttp = await describeFunctionsHttpError(e);
      setError(
        fromHttp ??
        (e instanceof Error ? e.message : null) ??
        'Failed to submit your request. Please try again.',
      );
      setProcessing(false);
      setCheckoutStep('details');
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

      {/* Service checkout dialog */}
      <AnimatePresence>
        {checkoutOpen && selectedService && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (processing || checkoutStep === 'processing') return;
                resetCheckout();
              }}
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-[6px]"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="checkout-dialog-title"
              initial={{ opacity: 0, y: 16, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.985 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_24px_72px_-12px_rgba(15,23,42,0.22)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Scroll lives here (not on motion.div): transforms from Framer Motion break overflow scrolling on the same node in several browsers. */}
              <div className="max-h-[min(90vh,880px)] overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch]">
                <div className="space-y-6 bg-gradient-to-b from-slate-50/90 via-white to-white px-5 py-5 sm:space-y-7 sm:px-8 sm:py-6">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-md border border-[#1C3D5A]/15 bg-[#1C3D5A]/[0.06] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1C3D5A]">
                            Secure checkout
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                            <Lock className="h-3 w-3 text-emerald-600" aria-hidden />
                            {'Private & secure'}
                          </span>
                        </div>
                        <h4
                          id="checkout-dialog-title"
                          className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
                        >
                          {checkoutStep === 'details' ? 'Complete your request' : 'Submitting your request'}
                        </h4>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                          {checkoutStep === 'processing'
                            ? 'Saving your order and opening the secure payment page.'
                            : 'Tell us what you need. We will follow up to confirm scope and next steps.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (processing || checkoutStep === 'processing') return;
                          resetCheckout();
                        }}
                        disabled={processing || checkoutStep === 'processing'}
                        className={`shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 ${processing || checkoutStep === 'processing' ? 'cursor-not-allowed opacity-40' : ''
                          }`}
                        aria-label="Close checkout"
                      >
                        <X size={22} strokeWidth={2} />
                      </button>
                    </div>

                    <div className="mt-5 rounded-xl border border-slate-200/80 bg-white/80 p-3 sm:p-4">
                      <div className="flex items-center justify-between gap-2">
                        {checkoutSteps.map((s, idx) => {
                          const done = idx < stepIndex;
                          const current = idx === stepIndex;
                          return (
                            <div key={s.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                              <div className="flex w-full items-center gap-0">
                                {idx > 0 && (
                                  <div
                                    className={`h-px flex-1 rounded-full ${done || current ? 'bg-[#1C3D5A]/35' : 'bg-slate-200'}`}
                                    aria-hidden
                                  />
                                )}
                                <div
                                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${done
                                      ? 'bg-[#1C3D5A] text-white shadow-sm shadow-[#1C3D5A]/25'
                                      : current
                                        ? 'bg-white text-[#1C3D5A] ring-2 ring-[#1C3D5A]/25 ring-offset-2 ring-offset-white'
                                        : 'border border-slate-200 bg-slate-50 text-slate-400'
                                    }`}
                                  aria-current={current ? 'step' : undefined}
                                >
                                  {done ? <Check className="h-4 w-4" strokeWidth={2.5} /> : idx + 1}
                                </div>
                                {idx < checkoutSteps.length - 1 && (
                                  <div
                                    className={`h-px flex-1 rounded-full ${done ? 'bg-[#1C3D5A]/35' : 'bg-slate-200'}`}
                                    aria-hidden
                                  />
                                )}
                              </div>
                              <span
                                className={`max-w-[5.5rem] text-center text-[10px] font-semibold uppercase tracking-wide sm:max-w-none sm:text-[11px] ${current ? 'text-[#1C3D5A]' : 'text-slate-400'
                                  }`}
                              >
                                {s.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div
                      className="mb-5 rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-800"
                      role="alert"
                      aria-live="polite"
                    >
                      {error}
                    </div>
                  )}

                  {checkoutStep === 'details' && (
                    <form onSubmit={handleDetailsSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-5">
                      <div className="sm:col-span-2">
                        <div className="mb-3 flex items-center gap-2 text-slate-800">
                          <User className="h-4 w-4 text-[#1C3D5A]" aria-hidden />
                          <h5 className="text-sm font-semibold tracking-tight">Contact</h5>
                        </div>
                      </div>

                      <div>
                        <FieldLabel htmlFor="checkout-full-name">Full name</FieldLabel>
                        <input
                          id="checkout-full-name"
                          required
                          name="full_name"
                          autoComplete="name"
                          placeholder="As it appears on your invoice"
                          value={formData.full_name}
                          onChange={handleChange}
                          className={fieldInputClass}
                        />
                      </div>

                      <div>
                        <FieldLabel htmlFor="checkout-email">Email</FieldLabel>
                        <input
                          id="checkout-email"
                          required
                          type="email"
                          name="email"
                          autoComplete="email"
                          placeholder="you@company.com"
                          value={formData.email}
                          onChange={handleChange}
                          className={fieldInputClass}
                        />
                      </div>

                      <div>
                        <FieldLabel htmlFor="checkout-phone">Phone</FieldLabel>
                        <input
                          id="checkout-phone"
                          required
                          name="phone"
                          autoComplete="tel"
                          placeholder="+256 …"
                          value={formData.phone}
                          onChange={handleChange}
                          className={fieldInputClass}
                        />
                      </div>

                      <div>
                        <FieldLabel htmlFor="checkout-company">Company (optional)</FieldLabel>
                        <input
                          id="checkout-company"
                          name="company"
                          autoComplete="organization"
                          placeholder="Organization name"
                          value={formData.company}
                          onChange={handleChange}
                          className={fieldInputClass}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <div className="mb-3 mt-1 flex items-center gap-2 border-t border-slate-100 pt-5 text-slate-800">
                          <MapPin className="h-4 w-4 text-[#1C3D5A]" aria-hidden />
                          <h5 className="text-sm font-semibold tracking-tight">Location</h5>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <FieldLabel htmlFor="checkout-address">Street address</FieldLabel>
                        <input
                          id="checkout-address"
                          required
                          name="address"
                          autoComplete="street-address"
                          placeholder="Building, street, district"
                          value={formData.address}
                          onChange={handleChange}
                          className={fieldInputClass}
                        />
                      </div>

                      <div>
                        <FieldLabel htmlFor="checkout-city">City</FieldLabel>
                        <input
                          id="checkout-city"
                          required
                          name="city"
                          autoComplete="address-level2"
                          placeholder="City"
                          value={formData.city}
                          onChange={handleChange}
                          className={fieldInputClass}
                        />
                      </div>

                      <div>
                        <FieldLabel htmlFor="checkout-country">Country</FieldLabel>
                        <select
                          id="checkout-country"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          className={`${fieldInputClass} cursor-pointer appearance-none bg-[length:1rem] bg-[right_0.65rem_center] bg-no-repeat pr-10`}
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                          }}
                        >
                          <option value="Uganda">Uganda</option>
                          <option value="Kenya">Kenya</option>
                          <option value="Tanzania">Tanzania</option>
                          <option value="Rwanda">Rwanda</option>
                          <option value="South Sudan">South Sudan</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 sm:p-5">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                                Service & amount
                              </p>
                              <p className="mt-1 text-base font-bold text-slate-900">{selectedService.package_name}</p>
                              <p className="text-sm text-slate-500">{selectedService.suggested_pricing}</p>
                            </div>
                            <div className="mt-3 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-right sm:mt-0">
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Due now</p>
                              <p className="text-lg font-bold tabular-nums text-[#1C3D5A]">
                                {new Intl.NumberFormat('en-UG', {
                                  style: 'currency',
                                  currency: 'UGX',
                                  minimumFractionDigits: 0,
                                }).format(formData.amount || 0)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 border-t border-slate-200/80 pt-4">
                            <FieldLabel htmlFor="checkout-amount-display">Amount (UGX)</FieldLabel>
                            {amountRange.max ? (
                              <div className="space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-slate-500">
                                  <span>
                                    From{' '}
                                    {new Intl.NumberFormat('en-UG', {
                                      style: 'currency',
                                      currency: 'UGX',
                                      minimumFractionDigits: 0,
                                    }).format(amountRange.min)}
                                  </span>
                                  <span>
                                    Up to{' '}
                                    {new Intl.NumberFormat('en-UG', {
                                      style: 'currency',
                                      currency: 'UGX',
                                      minimumFractionDigits: 0,
                                    }).format(amountRange.max)}
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
                                  onChange={(e) => e.preventDefault()}
                                  className="h-2 w-full cursor-not-allowed appearance-none rounded-full bg-slate-200 accent-[#1C3D5A] opacity-70"
                                />

                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    disabled
                                    className="flex-1 cursor-not-allowed rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-400 opacity-60"
                                    onClick={() => setFormData((prev) => ({ ...prev, amount: amountRange.min }))}
                                  >
                                    Min
                                  </button>
                                  <button
                                    type="button"
                                    disabled
                                    className="flex-1 cursor-not-allowed rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-400 opacity-60"
                                    onClick={() =>
                                      setFormData((prev) => ({
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
                                    className="flex-1 cursor-not-allowed rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-400 opacity-60"
                                    onClick={() => setFormData((prev) => ({ ...prev, amount: amountRange.max as number }))}
                                  >
                                    Max
                                  </button>
                                </div>

                                <input
                                  id="checkout-amount-display"
                                  required
                                  type="number"
                                  name="amount"
                                  min={1}
                                  step={1000}
                                  value={formData.amount || 0}
                                  readOnly
                                  className={`${fieldInputClass} cursor-not-allowed bg-slate-100/90 text-slate-700`}
                                />
                              </div>
                            ) : (
                              <input
                                id="checkout-amount-display"
                                required
                                type="number"
                                name="amount"
                                min={1}
                                step={1000}
                                value={formData.amount || 0}
                                readOnly
                                className={`${fieldInputClass} cursor-not-allowed bg-slate-100/90 text-slate-700`}
                              />
                            )}
                            <p className="mt-2 text-xs leading-relaxed text-slate-500">
                              This is the amount you are requesting. Final pricing and scope can be agreed before any
                              payment.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <FieldLabel htmlFor="checkout-notes">Project brief</FieldLabel>
                        <textarea
                          id="checkout-notes"
                          name="notes"
                          rows={4}
                          placeholder="Goals, timeline, and any must-have features or constraints"
                          value={formData.notes}
                          onChange={handleChange}
                          className={`${fieldInputClass} resize-none`}
                        />
                      </div>

                      <div className="sm:col-span-2 pt-1">
                        <button
                          type="submit"
                          disabled={processing}
                          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#1C3D5A] py-3.5 text-[0.9375rem] font-semibold text-white shadow-lg shadow-[#1C3D5A]/20 transition hover:bg-[#152f45] disabled:opacity-60"
                        >
                          <Lock className="h-4 w-4 opacity-90" aria-hidden />
                          {processing ? 'Submitting…' : 'Continue to payment'}
                          <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
                        </button>
                      </div>
                    </form>
                  )}

                  {checkoutStep === 'processing' && (
                    <div className="py-8 text-center sm:py-10">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 shadow-inner">
                        <div className="h-9 w-9 border-2 border-slate-200 border-t-[#1C3D5A] rounded-full animate-spin" />
                      </div>
                      <h4 className="mt-5 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                        Almost done…
                      </h4>
                      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
                        {pendingOrderNumber ? (
                          <>
                            Order reference{' '}
                            <span className="font-mono font-semibold text-slate-900">{pendingOrderNumber}</span>
                          </>
                        ) : (
                          'Saving your order…'
                        )}
                      </p>
                      <p className="mx-auto mt-2 max-w-md text-xs text-slate-500">
                        If the page does not redirect, you can still track your order using the links below.
                      </p>

                      {pendingOrderNumber && (
                        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                          <Link
                            href={`/payment-result?order=${encodeURIComponent(pendingOrderNumber)}&t=${encodeURIComponent(pendingStatusToken)}`}
                            className="inline-flex items-center justify-center rounded-xl bg-[#1C3D5A] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-[#1C3D5A]/20 transition hover:bg-[#152f45]"
                          >
                            View status
                          </Link>
                          <Link
                            href="/orders"
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                          >
                            Track order
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
