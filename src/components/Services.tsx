'use client';

import { useState, useEffect } from 'react';
import {
  ChevronRight,
  Check,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

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

interface Inquiry {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company?: string;
  service_interest: string;
  message: string;
  status: string;
  created_at: string;
}

/* -------------------- Component -------------------- */
export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);

  const [formData, setFormData] = useState<
    Omit<Inquiry, 'id' | 'status' | 'created_at'>
  >({
    full_name: '',
    email: '',
    phone: '',
    company: '',
    service_interest: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

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
    setSelectedService(next);
    setFormData(prev => ({
      ...prev,
      service_interest: next?.package_name ?? '',
    }));
    setShowContactForm(true);
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const { error } = await supabase.from('inquiries').insert([formData]);
      if (error) throw error;

      setSubmitted(true);
      setTimeout(() => {
        setShowContactForm(false);
        setSubmitted(false);
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          company: '',
          service_interest: '',
          message: '',
        });
      }, 3500);
    } catch {
      setError(
        'Your inquiry could not be submitted at this time. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="py-24 bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">
            Loading service offerings…
          </p>
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
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold mb-6"
          >
            <ShieldCheck size={16} />
            Trusted Digital Solutions
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6"
          >
            Solutions Designed for{' '}
            <span className="text-indigo-600">Growth & Stability</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            We deliver reliable, secure, and scalable digital services for
            startups, institutions, and enterprises across East Africa.
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
                        : 'bg-indigo-50 text-indigo-600'
                        }`}
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
                        className={
                          featured ? 'text-amber-400' : 'text-indigo-600'
                        }
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
                    ? 'bg-amber-400 text-slate-900 hover:bg-amber-300'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
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
        {showContactForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContactForm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl"
            >
              <div className="p-10">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      <Check size={40} />
                    </div>
                    <h4 className="text-2xl font-bold text-slate-900">
                      Inquiry Received
                    </h4>
                    <p className="text-slate-600 mt-2">
                      Our team will contact you within 24 business hours.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                  >
                    {error && (
                      <div className="col-span-full p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                        {error}
                      </div>
                    )}

                    <input
                      required
                      name="full_name"
                      placeholder="Full Name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="input"
                    />

                    <input
                      required
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      className="input"
                    />

                    <input
                      required
                      name="phone"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input"
                    />

                    <select
                      name="service_interest"
                      value={formData.service_interest}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value="">Select Service</option>
                      {services.map(s => (
                        <option key={s.id} value={s.package_name}>
                          {s.package_name}
                        </option>
                      ))}
                      <option value="Custom Solution">Custom Solution</option>
                    </select>

                    <textarea
                      required
                      name="message"
                      rows={4}
                      placeholder="Briefly describe your needs"
                      value={formData.message}
                      onChange={handleChange}
                      className="input col-span-full resize-none"
                    />

                    <button
                      type="submit"
                      disabled={submitting}
                      className="col-span-full py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition"
                    >
                      {submitting ? 'Submitting…' : 'Submit Inquiry'}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
