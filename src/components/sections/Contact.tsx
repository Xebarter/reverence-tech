'use client'

import type React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowUp } from 'lucide-react'
import { motion } from 'framer-motion'

const ContactInfo = ({ icon: Icon, title, details, index }: { icon: React.ElementType; title: string; details: string; index: number }) => (
  <motion.div
    className="flex items-start mb-8 group"
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.2 }}
  >
    <motion.div
      className="h-14 w-14 bg-white/10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 backdrop-blur-sm border border-white/20"
      whileHover={{
        scale: 1.1,
        rotate: 5,
        backgroundColor: "rgba(255, 255, 255, 0.2)"
      }}
    >
      <Icon className="h-6 w-6 text-white group-hover:text-primary transition-colors" />
    </motion.div>
    <div className="group-hover:translate-x-1 transition-transform">
      <h3 className="text-lg font-semibold mb-1 text-white group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-white/80 group-hover:text-white transition-colors">{details}</p>
    </div>
  </motion.div>
)

const SocialButton = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
  <motion.button
    className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20"
    aria-label={label}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
  >
    <Icon className="h-5 w-5 text-white hover:text-primary transition-colors" />
  </motion.button>
)

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-gradient-to-br from-gray-900 to-gray-950 relative overflow-hidden">
      {/* Floating blobs */}
      <motion.div className="absolute top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full filter blur-3xl opacity-30 -z-10" animate={{ x: [0, 20, 0], y: [0, 30, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/10 rounded-full filter blur-3xl opacity-30 -z-10" animate={{ x: [0, -20, 0], y: [0, -30, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} />

      {/* Animated background dots */}
      <div className="absolute inset-0 overflow-hidden opacity-10 -z-20">
        {[...Array(20)].map((_, i) => (
          <motion.div key={i} className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ y: [0, Math.random() * 100 - 50], opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, delay: Math.random() * 5 }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4">
        <motion.div className="text-center mb-20" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <motion.h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-primary">Let's Connect</motion.h2>
          <motion.p className="text-xl text-gray-300 max-w-3xl mx-auto">Ready to start your next project or have questions? Reach out to our team and we'll respond within 24 hours.</motion.p>
        </motion.div>

        <motion.div className="grid md:grid-cols-2 gap-0 bg-white/5 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm border border-white/10"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Left Column: Contact Info */}
          <div className="p-10 md:p-14 bg-gradient-to-b from-primary/90 to-primary/70">
            <h3 className="text-2xl font-bold mb-8 text-white">Contact Information</h3>
            <p className="mb-10 text-white/80 font-light">Fill out the form and our team will get back to you promptly. We're here to help with all your inquiries.</p>

            <div className="space-y-8">
              <ContactInfo icon={Phone} title="Phone" details="+256 783 676 313" index={0} />
              <ContactInfo icon={Mail} title="Email" details="sebenock047@gmail.com" index={1} />
              <ContactInfo icon={MapPin} title="Office" details="Mutungo Zone 1" index={2} />
            </div>

            <div className="mt-16">
              <h4 className="font-semibold mb-6 text-white/90">Follow Our Journey</h4>
              <div className="flex space-x-4">
                <SocialButton icon={Facebook} label="Facebook" />
                <SocialButton icon={Twitter} label="Twitter" />
                <SocialButton icon={Instagram} label="Instagram" />
                <SocialButton icon={Linkedin} label="LinkedIn" />
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="p-10 md:p-14 bg-white/5 backdrop-blur-sm">
            <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-white/80">Your Name</Label>
                  <Input id="name" placeholder="John Doe" className="bg-white/5 border-white/20 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 h-12" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-white/80">Your Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" className="bg-white/5 border-white/20 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 h-12" />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="subject" className="text-white/80">Subject</Label>
                <Input id="subject" placeholder="How can we help you?" className="bg-white/5 border-white/20 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 h-12" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="message" className="text-white/80">Message</Label>
                <textarea id="message" rows={5} className="min-h-[180px] w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50" placeholder="Tell us about your project or inquiry..." />
              </div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button type="submit" className="w-full h-14 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all shadow-lg">
                  Send Message
                  <ArrowUp className="ml-2 w-5 h-5" />
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
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full shadow-md transition-all border border-white/20 backdrop-blur-sm"
          >
            <ArrowUp className="h-5 w-5" />
            <span className="font-medium">Back to Top</span>
          </button>
        </motion.div>
      </div>
    </section>
  )
}

export default Contact
