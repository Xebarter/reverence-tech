import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
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
      // Map form data to database columns
      const inquiryData = {
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number,
        company_name: formData.company_name,
        interested_package: formData.interested_package,
        message: formData.message,
      };

      const { error: submitError } = await supabase
        .from('inquiries')
        .insert([inquiryData]);

      if (submitError) throw submitError;

      setSubmitted(true);
      setFormData({
        full_name: '',
        email: '',
        phone_number: '',
        company_name: '',
        interested_package: '',
        message: '',
      });

      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError('Failed to submit inquiry. Please try again.');
      console.error('Error submitting inquiry:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#4B0082] mb-4">
            Get In <span className="text-[#2DBE7E]">Touch</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ready to transform your business with technology? Contact us today for a free consultation
            and let's discuss how we can help you achieve your digital goals.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold text-[#4B0082] mb-8">Contact Information</h3>

            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4">
                <div className="bg-[#2DBE7E]/10 p-3 rounded-lg">
                  <MapPin className="text-[#2DBE7E]" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-[#4B0082] mb-1">Our Office</h4>
                  <p className="text-gray-600">Kampala, Uganda</p>
                  <p className="text-gray-600">Plot 123, Tech Hub Road</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[#F2B134]/10 p-3 rounded-lg">
                  <Phone className="text-[#F2B134]" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-[#4B0082] mb-1">Call Us</h4>
                  <p className="text-gray-600">+256 700 000 000</p>
                  <p className="text-gray-600">+256 800 000 000</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[#4B0082]/10 p-3 rounded-lg">
                  <Mail className="text-[#4B0082]" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-[#4B0082] mb-1">Email Us</h4>
                  <p className="text-gray-600">info@reverencetech.ug</p>
                  <p className="text-gray-600">support@reverencetech.ug</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#4B0082] to-[#2d004e] rounded-xl p-8 text-white">
              <h4 className="text-xl font-bold mb-4">Office Hours</h4>
              <div className="space-y-2 text-[#E5E8EB]">
                <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                <p>Saturday: 9:00 AM - 2:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-sm">
                  We also offer 24/7 emergency support for enterprise clients and critical systems.
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-[#E5E8EB] rounded-xl p-8">
              <h3 className="text-2xl font-bold text-[#4B0082] mb-6">Send Us a Message</h3>

              {submitted && (
                <div className="bg-[#2DBE7E]/10 border border-[#2DBE7E] text-[#4B0082] p-4 rounded-lg mb-6">
                  Thank you for your inquiry! We'll get back to you within 24 hours.
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-300 text-red-800 p-4 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-semibold text-[#4B0082] mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#4B0082] focus:ring-2 focus:ring-[#4B0082]/20 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-[#4B0082] mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#4B0082] focus:ring-2 focus:ring-[#4B0082]/20 outline-none transition-all"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-[#4B0082] mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#4B0082] focus:ring-2 focus:ring-[#4B0082]/20 outline-none transition-all"
                      placeholder="+256 700 000 000"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-semibold text-[#4B0082] mb-2">
                    Company/Organization
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#4B0082] focus:ring-2 focus:ring-[#4B0082]/20 outline-none transition-all"
                    placeholder="Your Company Name"
                  />
                </div>

                <div>
                  <label htmlFor="service_interest" className="block text-sm font-semibold text-[#4B0082] mb-2">
                    Service Interest *
                  </label>
                  <select
                    id="service_interest"
                    name="interested_package"
                    value={formData.interested_package}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#2DBE7E] focus:ring-2 focus:ring-[#2DBE7E]/20 outline-none transition-all"
                  >
                    <option value="">Select a service</option>
                    <option value="Starter Web Package">Starter Web Package</option>
                    <option value="E-Commerce Growth Kit">E-Commerce Growth Kit</option>
                    <option value="Custom Software Bundle">Custom Software Bundle</option>
                    <option value="Cloud Migration Pro">Cloud Migration Pro</option>
                    <option value="Cyber Security Shield">Cyber Security Shield</option>
                    <option value="Digital Marketing Boost">Digital Marketing Boost</option>
                    <option value="Networking & Infrastructure Kit">Networking & Infrastructure Kit</option>
                    <option value="Fintech Compliance Pack">Fintech Compliance Pack</option>
                    <option value="IT Consulting Enterprise">IT Consulting Enterprise</option>
                    <option value="Hardware & Repair All-In">Hardware & Repair All-In</option>
                    <option value="Solar-Powered Tech Hub Kit">Solar-Powered Tech Hub Kit</option>
                    <option value="E-Learning Pro Suite">E-Learning Pro Suite</option>
                    <option value="AI Integration & Automation Lab">AI Integration & Automation Lab</option>
                    <option value="Brand Identity & Design Package">Brand Identity & Design Package</option>
                    <option value="Community Wi-Fi Access Network">Community Wi-Fi Access Network</option>
                    <option value="Agri-Digital Connect">Agri-Digital Connect</option>
                    <option value="Government & NGO Systems Suite">Government & NGO Systems Suite</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-[#4B0082] mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#4B0082] focus:ring-2 focus:ring-[#4B0082]/20 outline-none transition-all resize-none"
                    placeholder="Tell us about your project or inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#F2B134] text-white py-4 rounded-lg hover:bg-[#d89e2d] transition-all duration-300 font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    'Sending...'
                  ) : (
                    <>
                      Send Message
                      <Send size={20} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
