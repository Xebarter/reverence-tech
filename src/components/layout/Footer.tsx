'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowUp } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'

const Footer = () => {
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <footer className="bg-gray-900 text-white pt-12 pb-6 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Information */}
            <div>
              <h3 className="text-2xl font-bold mb-4">Reverence Tech</h3>
              <p className="text-gray-400 mb-4">
                We build websites, web and mobile apps, supply SAAS products, provide educational technology services,
                and optimize existing systems.
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-400 hover:text-blue-500">
                  <Facebook size={20} />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-blue-400">
                  <Twitter size={20} />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-pink-500">
                  <Instagram size={20} />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-blue-600">
                  <Linkedin size={20} />
                </Link>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-bold text-lg mb-4">Our Services</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-primary">Website Development</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-primary">Mobile App Development</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-primary">SaaS Solutions</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-primary">Educational Technology</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-primary">System Optimization</Link></li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-primary">About Us</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-primary">Our Projects</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-primary">Client Testimonials</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-primary">Careers</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-primary">Contact Us</Link></li>
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="font-bold text-lg mb-4">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <MapPin size={20} className="mr-2 text-primary flex-shrink-0 mt-1" />
                  <span className="text-gray-400">Mutungo Zone 1, Kampala, Uganda</span>
                </li>
                <li className="flex items-center">
                  <Phone size={20} className="mr-2 text-primary flex-shrink-0" />
                  <span className="text-gray-400">+256 783 676 313</span>
                </li>
                <li className="flex items-center">
                  <Mail size={20} className="mr-2 text-primary flex-shrink-0" />
                  <span className="text-gray-400">sebenock047@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8 bg-gray-800" />

          <div className="text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} Reverence Technology. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showButton && (
          <motion.button
            onClick={scrollToTop}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-50"
            aria-label="Back to top"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}

export default Footer
