import { useState, useEffect } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Service {
  id: string;
  package_name: string;
  description: string;
  key_features: string[];
  target_audience: string[];
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

  const handleGetStarted = (service: Service) => {
    setSelectedService(service);
    setFormData({
      ...formData,
      service_interest: service.package_name,
    });
    setShowContactForm(true);
    
    // Scroll to contact form when opening it
    setTimeout(() => {
      const element = document.getElementById('service-contact-form');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleContactFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        company: '',
        service_interest: selectedService?.package_name || '',
        message: '',
      });

      // Close the modal after 3 seconds
      setTimeout(() => {
        setShowContactForm(false);
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      setError('Failed to submit inquiry. Please try again.');
      console.error('Error submitting inquiry:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#E5E8EB]">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-96 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  // Determine how many services to show based on state
  const servicesToShow = showAllServices ? services : services.slice(0, 6);

  return (
    <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#E5E8EB]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#1C3D5A] mb-4">
            Our <span className="text-[#2DBE7E]">Service Packages</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive technology solutions designed for businesses, organizations, and institutions
            across Uganda and East Africa. Choose the package that fits your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesToShow.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer"
              onClick={() => setSelectedService(service)}
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-[#1C3D5A] group-hover:text-[#2DBE7E] transition-colors leading-tight">
                    {service.package_name}
                  </h3>
                  <ChevronRight className="text-[#2DBE7E] flex-shrink-0 group-hover:translate-x-1 transition-transform" size={24} />
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">
                  {service.description}
                </p>

                <div className="mb-6">
                  <div className="text-sm font-semibold text-[#1C3D5A] mb-3">Key Features:</div>
                  <ul className="space-y-2">
                    {service.key_features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="text-[#2DBE7E] flex-shrink-0 mt-0.5" size={16} />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {service.key_features.length > 3 && (
                      <li className="text-sm text-[#2DBE7E] font-medium">
                        +{service.key_features.length - 3} more features
                      </li>
                    )}
                  </ul>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="text-2xl font-bold text-[#1C3D5A] mb-2">
                    {service.suggested_pricing}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGetStarted(service);
                    }}
                    className="w-full bg-[#F2B134] text-white py-3 rounded-lg hover:bg-[#d89e2d] transition-all duration-300 font-semibold"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {services.length > 6 && (
          <div className="text-center mt-12">
            <button
              onClick={() => setShowAllServices(!showAllServices)}
              className="inline-flex items-center px-6 py-3 bg-[#1C3D5A] text-white rounded-lg hover:bg-[#143040] transition-colors duration-300 font-semibold"
            >
              {showAllServices ? 'View Less' : 'View More'}
              <ChevronRight 
                className={`ml-2 transition-transform duration-300 ${showAllServices ? 'rotate-90' : 'rotate-(-90)'}`} 
                size={20} 
              />
            </button>
          </div>
        )}

        {selectedService && !showContactForm && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedService(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-3xl font-bold text-[#1C3D5A]">
                    {selectedService.package_name}
                  </h3>
                  <button
                    onClick={() => setSelectedService(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  {selectedService.description}
                </p>

                <div className="mb-8">
                  <h4 className="text-xl font-bold text-[#1C3D5A] mb-4">Key Features</h4>
                  <ul className="space-y-3">
                    {selectedService.key_features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="text-[#2DBE7E] flex-shrink-0 mt-1" size={20} />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-8">
                  <h4 className="text-xl font-bold text-[#1C3D5A] mb-4">Perfect For</h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedService.target_audience.map((audience, idx) => (
                      <span
                        key={idx}
                        className="bg-[#2DBE7E]/10 text-[#1C3D5A] px-4 py-2 rounded-full text-sm font-medium"
                      >
                        {audience}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-[#E5E8EB] rounded-xl p-6 mb-8">
                  <div className="text-sm text-gray-600 mb-2">Investment Range</div>
                  <div className="text-3xl font-bold text-[#1C3D5A]">
                    {selectedService.suggested_pricing}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedService(null);
                    handleGetStarted(selectedService);
                  }}
                  className="w-full bg-[#F2B134] text-white py-4 rounded-lg hover:bg-[#d89e2d] transition-all duration-300 font-semibold text-lg"
                >
                  Request a Consultation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contact Form Modal */}
        {showContactForm && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowContactForm(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-[#1C3D5A]">Request a Consultation</h3>
                    <p className="text-gray-600 mt-2">
                      {selectedService?.package_name && `Interested in our ${selectedService.package_name}?`}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowContactForm(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {submitted ? (
                  <div className="bg-[#2DBE7E]/10 border border-[#2DBE7E] text-[#1C3D5A] p-6 rounded-lg mb-6 text-center">
                    <h4 className="font-bold text-lg mb-2">Thank You!</h4>
                    <p>Thank you for your inquiry! We'll get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactFormSubmit} className="space-y-6">
                    {error && (
                      <div className="bg-red-50 border border-red-300 text-red-800 p-4 rounded-lg">
                        {error}
                      </div>
                    )}

                    <div>
                      <label htmlFor="full_name" className="block text-sm font-semibold text-[#1C3D5A] mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleContactFormChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#2DBE7E] focus:ring-2 focus:ring-[#2DBE7E]/20 outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-[#1C3D5A] mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleContactFormChange}
                          required
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#2DBE7E] focus:ring-2 focus:ring-[#2DBE7E]/20 outline-none transition-all"
                          placeholder="john@example.com"
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-semibold text-[#1C3D5A] mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleContactFormChange}
                          required
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#2DBE7E] focus:ring-2 focus:ring-[#2DBE7E]/20 outline-none transition-all"
                          placeholder="+256 700 000 000"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-semibold text-[#1C3D5A] mb-2">
                        Company/Organization
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleContactFormChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#2DBE7E] focus:ring-2 focus:ring-[#2DBE7E]/20 outline-none transition-all"
                        placeholder="Your Company Name"
                      />
                    </div>

                    <div>
                      <label htmlFor="service_interest" className="block text-sm font-semibold text-[#1C3D5A] mb-2">
                        Service Interest *
                      </label>
                      <select
                        id="service_interest"
                        name="service_interest"
                        value={formData.service_interest}
                        onChange={(e) => setFormData({...formData, service_interest: e.target.value})}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#2DBE7E] focus:ring-2 focus:ring-[#2DBE7E]/20 outline-none transition-all"
                        disabled={!!selectedService}
                      >
                        <option value="">Select a service</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.package_name}>
                            {service.package_name}
                          </option>
                        ))}
                        <option value="General Inquiry">General Inquiry</option>
                      </select>
                      {selectedService && (
                        <p className="text-sm text-gray-500 mt-1">
                          Pre-selected: {selectedService.package_name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-[#1C3D5A] mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleContactFormChange}
                        required
                        rows={5}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#2DBE7E] focus:ring-2 focus:ring-[#2DBE7E]/20 outline-none transition-all resize-none"
                        placeholder="Tell us about your project or inquiry..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-[#F2B134] text-white py-4 rounded-lg hover:bg-[#d89e2d] transition-all duration-300 font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}