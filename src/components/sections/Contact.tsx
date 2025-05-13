'use client';

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';

const ContactInfo = ({ icon: Icon, title, details, index }: { icon: React.ElementType; title: string; details: string; index: number }) => (
  <motion.div
    className="flex items-start mb-6 group"
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.15, type: "spring", stiffness: 70 }}
  >
    <motion.div
      className="h-12 w-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 shadow-lg bg-[#00d66b]"
      whileHover={{
        scale: 1.1,
        boxShadow: "0 0 15px rgba(0, 214, 107, 0.5)",
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

const SocialButton = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
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
            Have questions or ready to start your next project? Reach out to our team, and we’ll respond within 24 hours.
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
            <h3 className="text-xl font-semibold mb-6 text-[#ad00ff]">Contact Information</h3>
            <p className="mb-8 text-gray-700 text-sm">
              Fill out the form, and our team will get back to you promptly. We’re here to assist with all your inquiries.
            </p>

            <div className="space-y-6">
              <ContactInfo icon={Phone} title="Phone" details="+256 783 676 313" index={0} />
              <ContactInfo icon={Mail} title="Email" details="sebenock047@gmail.com" index={1} />
              <ContactInfo icon={MapPin} title="Office" details="Mutungo Zone 1" index={2} />
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
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 text-sm">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    className="bg-[#fff6ea] border border-[#ffd60a]/50 text-gray-800 placeholder:text-gray-500 focus:ring-2 focus:ring-[#ffd60a] focus:border-[#ffd60a] h-10 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 text-sm">Your Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="bg-[#fff6ea] border border-[#ffd60a]/50 text-gray-800 placeholder:text-gray-500 focus:ring-2 focus:ring-[#ffd60a] focus:border-[#ffd60a] h-10 rounded-lg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-gray-700 text-sm">Subject</Label>
                <Input
                  id="subject"
                  placeholder="How can we help you?"
                  className="bg-[#fff6ea] border border-[#ffd60a]/50 text-gray-800 placeholder:text-gray-500 focus:ring-2 focus:ring-[#ffd60a] focus:border-[#ffd60a] h-10 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-gray-700 text-sm">Message</Label>
                <textarea
                  id="message"
                  rows={5}
                  className="min-h-[120px] w-full rounded-lg border border-[#ffd60a]/50 bg-[#fff6ea] px-3 py-2 text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ffd60a] focus:border-[#ffd60a]"
                  placeholder="Tell us about your project or inquiry..."
                />
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.3 }}>
                <Button
                  type="submit"
                  className="w-full h-12 text-base bg-[#00d66b] text-white shadow-lg hover:bg-[#00ba5e] transition-all duration-300 rounded-lg group relative overflow-hidden"
                >
                  Send Message
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
            className="flex items-center space-x-2 bg-[#ad00ff] hover:bg-[#9900e6] text-white px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
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
