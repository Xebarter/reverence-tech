'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '#services', label: 'Services' },
    { href: '#about', label: 'About' }
  ]

  return (
    <motion.header
      className="w-full bg-[#fff6ea] shadow-md fixed top-0 left-0 right-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo and Branding */}
        <Link href="/" className="flex items-center space-x-3 group">
          <Image
            src="/logo.svg"
            alt="Reverence Tech Logo"
            width={48}
            height={48}
            className="h-12 w-12 object-contain transition-transform group-hover:scale-105"
            priority
          />
          <span className="text-2xl font-bold tracking-tight text-[#ff5831] group-hover:opacity-90 transition-opacity">
            Reverence Tech
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map(({ href, label }, idx) => (
            <Link
              key={idx}
              href={href}
              className="text-sm font-medium text-gray-800 hover:text-[#00d66b] transition-colors"
            >
              {label}
            </Link>
          ))}
          <Link href="#contact">
            <span className="inline-block px-4 py-2 text-sm font-medium text-white bg-[#ff5831] rounded-md hover:bg-[#ad00ff] transition-colors">
              Get in Touch
            </span>
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button
            className="text-gray-800 hover:text-[#ff5831] focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            key="mobile-menu"
            className="md:hidden bg-[#fff6ea] shadow-inner"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="container mx-auto px-6 py-4 flex flex-col space-y-4">
              {navLinks.map(({ href, label }, idx) => (
                <Link
                  key={idx}
                  href={href}
                  onClick={toggleMenu}
                  className="text-sm font-medium text-gray-800 hover:text-[#00d66b] transition-colors"
                >
                  {label}
                </Link>
              ))}
              <Link href="#contact" onClick={toggleMenu}>
                <span className="inline-block w-full text-center px-4 py-2 text-sm font-medium text-white bg-[#ff5831] rounded-md hover:bg-[#ad00ff] transition-colors">
                  Get in Touch
                </span>
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

export default Header
