'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import { toast } from 'sonner';

const ContactInfo = ({
  icon: Icon,
  title,
  details,
  index,
}: {
  icon: React.ElementType;
  title: string;
  details: string;
  index: number;
}) => (
  <motion.div
    className="flex items-start mb-6 group"
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{
      duration: 0.5,
      delay: index * 0.15,
      type: 'spring',
      stiffness: 70,
    }}
  >
    <motion.div
      className="h-12 w-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 shadow-lg bg-[#00d66b]"
      whileHover={{
        scale: 1.1,
        boxShadow: '0 0 15px rgba(0, 214, 107, 0.5)',
      }}
      transition={{ duration: 0.3 }}
    >
      <Icon className="h-5 w-5 text-white" />
    </motion.div>
    <div className="group-hover:translate-x-1 transition-transform">
      <h3 className="text-lg font-semibold mb-1 text-[#ff5831]">{title}</h3>
      <p className="text-gray-600 text-sm">{details}</p>
    </div>
  </motion.div>
);

const SocialButton = ({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) => (
  <motion.button
    className="h-10 w-10 rounded-full bg-[#ad00ff]/10 flex items-center justify-center border border-[#ad00ff] shadow-md hover:shadow-lg transition-all"
    aria-label={label}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.3 }}
  >
    <Icon className="h-4 w-4 text-[#ad00ff]" />
  </motion.button>
);

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // EmailJS configuration
  const emailjsConfig = {
    serviceId: 'service_gonxe1h', // Replace with your EmailJS Service ID
    templateId: 'template_utmsy9p', // Replace with your Contact Template ID
    publicKey: 'oYnSIhJP3tQ7bDho3', // Replace with your EmailJS Public Key
  };

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init(emailjsConfig.publicKey);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');

    // Generate timestamp in EAT
    const currentTime = new Date().toLocaleString('en-US', {
      timeZone: 'Africa/Nairobi',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    // Prepare form data with timestamp
    const submissionData = {
      ...formData,
      time: currentTime,
    };

    try {
      await emailjs.send(
        emailjsConfig.serviceId,
        emailjsConfig.templateId,
        submissionData
      );

      setStatus('sent');
      setFormData({ name: '', email: '', subject: '', message: '' });
      toast.success('Message sent successfully! We’ll get back to you soon.', {
        position: 'top-right',
        duration: 3000,
      });
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      setStatus('error');
      toast.error('Failed to send message. Please try again later.', {
        position: 'top-right',
        duration: 3000,
      });
      console.error('EmailJS error:', error);
    }
  };

  return (
    <section id="contact" className="py-16 bg-[#fff6ea] relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#00d66b] mb-4">
            Contact Us
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Have questions or ready to start your next project? Reach out to our team,
            and we’ll respond within 24 hours.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 gap-8 bg-white rounded-xl shadow-2xl border border-[#ffd60a]/40 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Left Column: Contact Info */}
          <div className="p-8">
            <h3 className="text-xl font-semibold mb-6 text-[#ad00ff]">
              Contact Information
            </h3>
            <p className="mb-8 text-gray-700 text-sm">
              Fill out the form, and our team will get back to you promptly. We’re here
              to assist with all your inquiries.
            </p>

            <div className="space-y-6">
              <ContactInfo
                icon={Phone}
                title="Phone"
                details="+256 783 676 313"
                index={0}
              />
              <ContactInfo
                icon={Mail}
                title="Email"
                details="sebenock02777@gmail.com"
                index={1}
              />
              <ContactInfo
                icon={MapPin}
                title="Office"
                details="Mutungo Zone 1"
                index={2}
              />
            </div>

            <div className="mt-12">
              <h4 className="font-semibold mb-4 text-gray-700 text-sm">Follow Us</h4>
              <div className="flex space-x-3">
                <SocialButton icon={Facebook} label="Facebook" />
                <SocialButton icon={Twitter} label="Twitter" />
                <SocialButton icon={Instagram} label="Instagram" />
                <SocialButton icon={Linkedin} label="LinkedIn" />
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 text-sm">
                    Your Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="bg-[#fff6ea] border border-[#ffd60a]/50 text-gray-800 placeholder:text-gray-500 text-sm focus:ring-gray-300 focus:border-gray-300 h-10 rounded-md"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 text-sm">
                    Your Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="bg-[#fff6ea] border border-[#ffd60a]/50 text-gray-800 placeholder:text-gray-500 text-sm focus:ring-gray-300 focus:border-gray-300 h-10 rounded-md"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-gray-700 text-sm">
                  Subject
                </Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  className="bg-[#fff6ea] border border-[#ffd60a]/50 text-gray-800 placeholder:text-gray-500 text-sm focus:ring-gray-300 focus:border-gray-300 h-10 rounded-md"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-gray-700 text-sm">
                  Message
                </Label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="min-h-[120px] w-full rounded-md border border-[#ffd60a]/50 bg-[#fff6ea] px-3 py-2 text-gray-800 placeholder:text-gray-500 text-sm focus:outline-none focus:ring-gray-300 focus:border-gray-300"
                  placeholder="Tell us about your project or inquiry..."
                  required
                />
              </div>
              {status === 'error' && (
                <p className="text-red-600 text-sm">Failed to send message. Please try again.</p>
              )}
              {status === 'sent' && (
                <p className="text-[#00d66b] text-sm">
                  Message sent successfully! We'll get back to you soon.
                </p>
              )}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  type="submit"
                  className="w-full h-12 text-base bg-[#00d66b] text-white shadow-lg hover:bg-[#00ba5e] transition-all duration-300 rounded-md group relative overflow-hidden"
                  disabled={status === 'sending'}
                >
                  {status === 'sending'
                    ? 'Sending...'
                    : status === 'sent'
                    ? 'Message Sent!'
                    : 'Send Message'}
                  <ArrowUp className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            </form>
          </div>
        </motion.div>

        {/* Back to Top Button */}
        <motion.div
          className="flex justify-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center space-x-2 bg-[#ad00ff] hover:bg-[#9900e6] text-white px-5 py-2 rounded-md shadow-md hover:shadow-lg transition-all"
          >
            <ArrowUp className="h-4 w-4" />
            <span className="font-medium text-sm">Back to Top</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;