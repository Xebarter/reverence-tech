import { useState, useEffect } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

  // Add CSS for the pulse animation
  const pulseKeyframes = `
    @keyframes pulse {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(242, 177, 52, 0.4);
      }
      50% {
        box-shadow: 0 0 0 10px rgba(242, 177, 52, 0);
      }
    }
    
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `;

  // Determine how many services to show based on state
  const servicesToShow = showAllServices ? services : services.slice(0, 6);

  return (
    <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#E5E8EB]">
      <style>{pulseKeyframes}</style>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-2xl font-bold flex items-center">
            <span className="text-yellow-400 mr-2">Get in Touch</span>
          </h3>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive technology solutions designed for businesses, organizations, and institutions
            across Uganda and East Africa. Choose the package that fits your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {servicesToShow.map((service, index) => {
            // Determine if this is the center card (featured)
            const isCenterCard = index === 1 && servicesToShow.length >= 3;
            
            return (
              <div
                key={service.id}
                className={`
                  rounded-2xl transition-all duration-500 overflow-hidden cursor-pointer
                  ${isCenterCard ? 
                    'md:hover:-translate-y-6 md:z-20 bg-primary-700 text-white border-4 border-yellow-400 shadow-2xl hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] md:hover:scale-105 animate-pulse' : 
                    'bg-white text-gray-800 border border-gray-200 hover:shadow-xl hover:-translate-y-1 md:z-10'
                  }
                `}
                onClick={() => setSelectedService(service)}
                style={{
                  ...(isCenterCard ? {
                    transform: 'translateY(-1rem) scale(1.02)',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                  } : {})
                }}
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className={`
                      text-xl font-bold leading-tight
                      ${isCenterCard ? 'text-white' : 'text-[#1C3D5A] group-hover:text-[#2DBE7E]'}
                    `}>
                      {service.package_name}
                    </h3>
                    <ChevronRight 
                      className={isCenterCard ? 'text-yellow-400' : 'text-[#2DBE7E]'} 
                      size={24} 
                    />
                  </div>

                  <p className={`
                    mb-6 leading-relaxed line-clamp-3
                    ${isCenterCard ? 'text-gray-200' : 'text-gray-600'}
                  `}>
                    {service.description}
                  </p>

                  <div className="mb-6">
                    <div className={`
                      text-sm font-semibold mb-3
                      ${isCenterCard ? 'text-yellow-400' : 'text-[#1C3D5A]'}
                    `}>
                      Key Features:
                    </div>
                    <ul className="space-y-2">
                      {service.key_features.slice(0, 3).map((featureObj, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check 
                            className={isCenterCard ? 'text-yellow-400 flex-shrink-0 mt-0.5' : 'text-[#2DBE7E] flex-shrink-0 mt-0.5'} 
                            size={16} 
                          />
                          <span className={isCenterCard ? 'text-gray-200' : 'text-gray-600'}>
                            {featureObj.feature}
                          </span>
                        </li>
                      ))}
                      {service.key_features.length > 3 && (
                        <li className={`
                          text-sm font-medium
                          ${isCenterCard ? 'text-yellow-400' : 'text-[#2DBE7E]'}
                        `}>
                          +{service.key_features.length - 3} more features
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className={`
                    pt-6 border-t
                    ${isCenterCard ? 'border-gray-400/30' : 'border-gray-200'}
                  `}>
                    <div className={`
                      text-2xl font-bold mb-2
                      ${isCenterCard ? 'text-yellow-400' : 'text-[#1C3D5A]'}
                    `}>
                      {service.suggested_pricing}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGetStarted(service);
                      }}
                      className={`
                        w-full py-3 rounded-lg transition-all duration-300 font-semibold
                        ${isCenterCard ? 
                          'bg-yellow-400 text-primary-700 hover:bg-yellow-500' : 
                          'bg-primary-700 text-white hover:bg-primary-800'
                        }
                      `}
                    >
                      Get Started
                    </button>
                  </div>
                </div>
                
                {isCenterCard && (
                  <div className="bg-primary-700 p-6 text-white">
                    <span className="font-bold text-sm">MOST POPULAR</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {services.length > 6 && (
          <div className="text-center mt-12">
            <button
              onClick={() => setShowAllServices(!showAllServices)}
              className="inline-flex items-center px-6 py-3 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition-colors duration-300 font-semibold"
            >
              {showAllServices ? 'View Less' : 'View More'}
              <ChevronRight 
                className={`ml-2 transition-transform duration-300 ${showAllServices ? 'rotate-90' : 'rotate-(-90)'}`} 
                size={20} 
              />
            </button>
          </div>
        )}
        
        <div className="mt-12 text-center">
          <button
            onClick={() => {
              setSelectedService(null);
              handleGetStarted(null);
            }}
            className="w-full max-w-md mx-auto bg-yellow-400 text-primary-700 hover:bg-yellow-500 transition-all duration-300 font-semibold text-lg py-4 px-8 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Request a Consultation
          </button>
        </div>

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