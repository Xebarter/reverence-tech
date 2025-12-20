import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, Inquiry } from '../lib/supabase';

export default function Contact() {
  const [formData, setFormData] = useState<Omit<Inquiry, 'id' | 'created_at'>>({
    full_name: '',
    email: '',
    phone_number: '',
    company_name: '',
    interested_package: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const { error: submitError } = await supabase
        .from('inquiries')
        .insert([formData]);

      if (submitError) throw submitError;

      setSubmitted(true);
      setFormData({
        full_name: '', email: '', phone_number: '',
        company_name: '', interested_package: '', message: '',
      });
      // Keep success message visible for longer for better UX
      setTimeout(() => setSubmitted(false), 8000);
    } catch (err) {
      setError('Connection error. Please check your internet and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <section id="contact" className="py-24 px-4 bg-slate-50 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-indigo-100 rounded-full blur-3xl opacity-50" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

          {/* Left Column: Context & Trust */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">
                Let’s build your <br />
                <span className="text-indigo-600 underline decoration-indigo-200 decoration-8 underline-offset-4">digital future</span>.
              </h2>
              <p className="text-xl text-slate-600 mb-12 leading-relaxed">
                Based in Kampala, serving the world. We combine local expertise with global tech standards.
              </p>

              {/* Contact Cards */}
              <div className="space-y-4 mb-12">
                {[
                  { icon: MapPin, title: "Our Headquarters", detail: "Mutungo, Zone 1, Kampala, Uganda", color: "bg-blue-500" },
                  { icon: Phone, title: "Direct Line", detail: "+256 783 676 313", color: "bg-emerald-500" },
                  { icon: Mail, title: "Email Support", detail: "reverencetechnology1@gmail.com", color: "bg-indigo-500" }
                ].map((item, idx) => (
                  <div key={idx} className="group flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className={`${item.color} p-3 rounded-xl text-white mr-4`}>
                      <item.icon size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.title}</p>
                      <p className="text-slate-900 font-semibold">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Office Hours / Trust Badge */}
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                <ShieldCheck className="absolute -right-4 -bottom-4 text-white/5" size={160} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4 text-indigo-400">
                    <Clock size={18} />
                    <span className="font-bold uppercase tracking-wider text-xs">Availability</span>
                  </div>
                  <h4 className="text-xl font-bold mb-4">We're here when you need us.</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
                    <div>
                      <p className="text-white font-medium">Mon — Fri</p>
                      <p>8:00 AM - 6:00 PM</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Saturday</p>
                      <p>9:00 AM - 2:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: The Form */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/60 border border-slate-100 relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-20 text-center"
                  >
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-2">Message Received!</h3>
                    <p className="text-slate-500 text-lg">We've received your inquiry and will reach out <br /> within 24 business hours.</p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-8 text-indigo-600 font-bold hover:underline"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="h-10 w-1 bg-indigo-600 rounded-full" />
                      <h3 className="text-2xl font-bold text-slate-900">Project Inquiry</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                        <input
                          required
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
                          placeholder="E.g. David Okello"
                          className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Work Email</label>
                        <input
                          required
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="david@company.com"
                          className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                        <input
                          required
                          type="tel"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleChange}
                          placeholder="+256..."
                          className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Company (Optional)</label>
                        <input
                          name="company_name"
                          value={formData.company_name}
                          onChange={handleChange}
                          placeholder="Your Organization"
                          className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Interested Service</label>
                      <select
                        required
                        name="interested_package"
                        value={formData.interested_package}
                        onChange={handleChange}
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select a service category</option>
                        <optgroup label="Web & Software">
                          <option value="Starter Web Package">Starter Web Package</option>
                          <option value="E-Commerce Growth Kit">E-Commerce Growth Kit</option>
                          <option value="Custom Software Bundle">Custom Software Bundle</option>
                        </optgroup>
                        <optgroup label="Enterprise">
                          <option value="Cyber Security Shield">Cyber Security Shield</option>
                          <option value="Cloud Migration Pro">Cloud Migration Pro</option>
                          <option value="AI Integration">AI Integration & Automation</option>
                        </optgroup>
                        <option value="General Inquiry">General Inquiry</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Your Message</label>
                      <textarea
                        required
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Tell us about your goals..."
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"
                      />
                    </div>

                    {error && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm font-medium">
                        {error}
                      </motion.p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="group w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all duration-300 disabled:opacity-50 shadow-lg shadow-indigo-200"
                    >
                      {submitting ? "Processing..." : "Send Message"}
                      <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>

                    <p className="text-center text-xs text-slate-400">
                      By submitting, you agree to our privacy policy and terms of service.
                    </p>
                  </form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}