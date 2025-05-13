'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
} from 'lucide-react'
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
      <footer className="bg-[#fff6ea] text-gray-900 pt-12 pb-6 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-2xl font-extrabold text-[#ff5831] mb-4">Reverence Tech</h3>
              <p className="text-gray-700 mb-4">
                We build websites, web and mobile apps, supply SAAS products, provide educational technology services,
                and optimize existing systems.
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="text-[#ff5831] hover:text-[#00d66b] transition">
                  <Facebook size={20} />
                </Link>
                <Link href="#" className="text-[#ffd60a] hover:text-[#ff5831] transition">
                  <Twitter size={20} />
                </Link>
                <Link href="#" className="text-[#00d66b] hover:text-[#ad00ff] transition">
                  <Instagram size={20} />
                </Link>
                <Link href="#" className="text-[#ad00ff] hover:text-[#ffd60a] transition">
                  <Linkedin size={20} />
                </Link>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-bold text-lg text-[#ff5831] mb-4">Our Services</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-800 hover:text-[#00d66b]">Website Development</Link></li>
                <li><Link href="#" className="text-gray-800 hover:text-[#ff5831]">Mobile App Development</Link></li>
                <li><Link href="#" className="text-gray-800 hover:text-[#ffd60a]">SaaS Solutions</Link></li>
                <li><Link href="#" className="text-gray-800 hover:text-[#ad00ff]">Educational Technology</Link></li>
                <li><Link href="#" className="text-gray-800 hover:text-[#00d66b]">System Optimization</Link></li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-lg text-[#00d66b] mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-800 hover:text-[#ff5831]">About Us</Link></li>
                <li><Link href="#" className="text-gray-800 hover:text-[#ad00ff]">Our Projects</Link></li>
                <li><Link href="#" className="text-gray-800 hover:text-[#ffd60a]">Client Testimonials</Link></li>
                <li><Link href="#" className="text-gray-800 hover:text-[#00d66b]">Careers</Link></li>
                <li><Link href="#" className="text-gray-800 hover:text-[#ff5831]">Contact Us</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-bold text-lg text-[#ad00ff] mb-4">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <MapPin size={20} className="mr-2 text-[#ff5831]" />
                  <span className="text-gray-700">Mutungo Zone 1, Kampala, Uganda</span>
                </li>
                <li className="flex items-center">
                  <Phone size={20} className="mr-2 text-[#00d66b]" />
                  <span className="text-gray-700">+256 783 676 313</span>
                </li>
                <li className="flex items-center">
                  <Mail size={20} className="mr-2 text-[#ad00ff]" />
                  <span className="text-gray-700">sebenock047@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8 bg-[#ffd60a]" />

          <div className="text-center text-sm text-gray-600">
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
            className="fixed bottom-6 right-6 bg-[#ff5831] hover:bg-[#ad00ff] text-white p-3 rounded-full shadow-lg z-50"
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
