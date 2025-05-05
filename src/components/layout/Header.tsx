'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="w-full bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold text-primary">Reverence Tech</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-gray-700 hover:text-primary font-medium">
            Home
          </Link>
          <Link href="#services" className="text-gray-700 hover:text-primary font-medium">
            Services
          </Link>
          <Link href="#about" className="text-gray-700 hover:text-primary font-medium">
            About
          </Link>
          <Link href="#portfolio" className="text-gray-700 hover:text-primary font-medium">
            Portfolio
          </Link>
        </nav>

        <div className="hidden md:block">
          <Link href="#contact">
            <Button size="sm" className="rounded-md">
              Get in Touch
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link href="/" className="text-gray-700 hover:text-primary font-medium" onClick={toggleMenu}>
              Home
            </Link>
            <Link href="#services" className="text-gray-700 hover:text-primary font-medium" onClick={toggleMenu}>
              Services
            </Link>
            <Link href="#about" className="text-gray-700 hover:text-primary font-medium" onClick={toggleMenu}>
              About
            </Link>
            <Link href="#portfolio" className="text-gray-700 hover:text-primary font-medium" onClick={toggleMenu}>
              Portfolio
            </Link>
            <Link href="#contact">
              <Button size="sm" className="w-full rounded-md" onClick={toggleMenu}>
                Get in Touch
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
