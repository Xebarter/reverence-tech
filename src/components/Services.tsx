import { useState, useEffect } from 'react';
import { ChevronRight, Check, X, Send, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

// --- Types ---
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

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);
  const [formData, setFormData] = useState<Omit<Inquiry, 'id' | 'status' | 'created_at'>>({
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
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = (service?: Service | null) => {
    const nextService = service ?? null;
    setSelectedService(nextService);
    setFormData(prev => ({
      ...prev,
      service_interest: nextService?.package_name ?? '',
    }));
    setShowContactForm(true);
  };

  const handleContactFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContactFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const { error: submitError } = await supabase
        .from('inquiries')
        .insert([formData]);

      if (submitError) throw submitError;

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
      }, 3000);
    } catch (err) {
      setError('Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="py-24 bg-slate-50 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading our solutions...</p>
        </div>
      </section>
    );
  }

  const servicesToShow = showAllServices ? services : services.slice(0, 6);

  return (
    <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-bold mb-6"
          >
            <Sparkles size={16} />
            <span>TAILORED SOLUTIONS</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight"
          >
            Powering Your <span className="text-indigo-600">Digital Future</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            From high-growth startups to established institutions, we provide the technical expertise
            needed to scale across Uganda and East Africa.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesToShow.map((service, index) => {
            const isFeatured = index === 1; // Middle card highlighting
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className={`group relative flex flex-col h-full rounded-3xl p-8 transition-all duration-300 ${isFeatured
                    ? 'bg-slate-900 text-white shadow-2xl ring-4 ring-amber-400/20'
                    : 'bg-white text-slate-900 border border-slate-200 shadow-sm hover:shadow-xl'
                  }`}
              >
                {isFeatured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${isFeatured ? 'bg-amber-400/10 text-amber-400' : 'bg-indigo-50 text-indigo-600'}`}>
                      {index % 3 === 0 ? <Zap size={24} /> : index % 3 === 1 ? <ShieldCheck size={24} /> : <Sparkles size={24} />}
                    </div>
                    <span className={`text-2xl font-black ${isFeatured ? 'text-amber-400' : 'text-slate-900'}`}>
                      {service.suggested_pricing}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{service.package_name}</h3>
                  <p className={`text-sm leading-relaxed ${isFeatured ? 'text-slate-400' : 'text-slate-500'}`}>
                    {service.description}
                  </p>
                </div>

                <div className="space-y-4 flex-grow mb-8">
                  <p className={`text-xs font-bold uppercase tracking-wider ${isFeatured ? 'text-amber-400/80' : 'text-indigo-600/80'}`}>
                    Key Capabilities
                  </p>
                  <ul className="space-y-3">
                    {service.key_features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <Check className={`mt-0.5 flex-shrink-0 ${isFeatured ? 'text-amber-400' : 'text-indigo-600'}`} size={16} />
                        <span className={isFeatured ? 'text-slate-300' : 'text-slate-600'}>{feature.feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleGetStarted(service)}
                  className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isFeatured
                      ? 'bg-amber-400 text-slate-900 hover:bg-amber-300'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                >
                  Choose Package <ChevronRight size={18} />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* View More / View Less */}
        {services.length > 6 && (
          <div className="mt-16 text-center">
            <button
              onClick={() => setShowAllServices(!showAllServices)}
              className="px-8 py-3 bg-white border border-slate-200 text-slate-900 font-bold rounded-full hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
            >
              {showAllServices ? 'Show Featured Only' : `View All ${services.length} Services`}
              <ChevronRight className={`transition-transform ${showAllServices ? 'rotate-90' : ''}`} size={20} />
            </button>
          </div>
        )}

        {/* Consultation CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-24 p-12 rounded-[3rem] bg-indigo-600 text-white text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <h3 className="text-3xl font-bold mb-4 relative z-10">Don't see exactly what you need?</h3>
          <p className="text-indigo-100 mb-8 max-w-xl mx-auto relative z-10">
            We specialize in custom developments and enterprise integrations. Let's discuss your specific requirements.
          </p>
          <button
            onClick={() => handleGetStarted(null)}
            className="px-10 py-4 bg-white text-indigo-600 font-black rounded-2xl hover:bg-amber-400 hover:text-slate-900 transition-all shadow-xl relative z-10"
          >
            Book Free Consultation
          </button>
        </motion.div>
      </div>

      {/* --- Contact Form Modal --- */}
      <AnimatePresence>
        {showContactForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContactForm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 sm:p-12">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-3xl font-black text-slate-900">Let's Talk Business</h3>
                    <p className="text-slate-500 mt-2">
                      {selectedService ? `You're inquiring about: ${selectedService.package_name}` : "Tell us what you're looking for."}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowContactForm(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900"
                  >
                    <X size={24} />
                  </button>
                </div>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 text-center"
                  >
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check size={40} />
                    </div>
                    <h4 className="text-2xl font-bold text-slate-900">Inquiry Received!</h4>
                    <p className="text-slate-500 mt-2">Our team will reach out to you within the next 24 hours.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleContactFormSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {error && <div className="col-span-full p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>}

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                      <input
                        required
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleContactFormChange}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                        placeholder="e.g. Mukasa Ivan"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                      <input
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleContactFormChange}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                        placeholder="ivan@company.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                      <input
                        required
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleContactFormChange}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                        placeholder="+256 7xx xxxxxx"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Service</label>
                      <select
                        name="service_interest"
                        value={formData.service_interest}
                        onChange={handleContactFormChange}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select Service</option>
                        {services.map(s => <option key={s.id} value={s.package_name}>{s.package_name}</option>)}
                        <option value="Custom Solution">Custom Solution</option>
                      </select>
                    </div>

                    <div className="col-span-full space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">How can we help?</label>
                      <textarea
                        required
                        name="message"
                        value={formData.message}
                        onChange={handleContactFormChange}
                        rows={4}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all resize-none"
                        placeholder="Tell us about your project goals..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="col-span-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {submitting ? 'Processing...' : <><Send size={20} /> Submit Inquiry</>}
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