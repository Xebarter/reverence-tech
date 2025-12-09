import { Menu, X, ChevronRight, Phone, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const navigateToSection = (sectionId: string) => {
    if (location.pathname === '/') {
      scrollToSection(sectionId);
    } else {
      window.location.href = `/#${sectionId}`;
    }
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-primary-500 z-50 shadow-lg">
      {/* Contact Strip */}
      <div className="bg-yellow-400 text-primary-800 py-1 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center text-xs md:text-sm">
          <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-4 mb-1 md:mb-0">
            <span className="flex items-center"><Phone size={14} className="mr-1" /> +256 783 676 313</span>
          </div>
          <div className="flex justify-center md:justify-start">
            <span className="flex items-center"><Mail size={14} className="mr-1" /> reverencetechnology1@gmail.com</span>
          </div>
        </div>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/logo.svg" 
                alt="Reverence Technology Logo" 
                className="h-8 w-auto mr-3"
              />
              <div className="text-base md:text-xl font-bold text-white flex flex-col md:flex-row items-start md:items-center">
                <span>Reverence</span>
                <span className="text-yellow-400 md:ml-2 mt-0.5 md:mt-0 text-xs md:text-sm">Technology</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-6 items-center">
            <button
              onClick={() => navigateToSection('home')}
              className="text-white hover:text-yellow-400 transition-colors duration-300 font-medium text-sm h-10 flex items-center border-b-2 border-transparent hover:border-yellow-400/50"
            >
              Home
            </button>
            <button
              onClick={() => navigateToSection('services')}
              className="text-white hover:text-yellow-400 transition-colors duration-300 font-medium text-sm h-10 flex items-center border-b-2 border-transparent hover:border-yellow-400/50"
            >
              Services
            </button>
            <Link
              to="/blog"
              className="text-white hover:text-yellow-400 transition-colors duration-300 font-medium text-sm h-10 flex items-center border-b-2 border-transparent hover:border-yellow-400/50"
            >
              Blog
            </Link>
            <Link
              to="/careers"
              className="text-white hover:text-yellow-400 transition-colors duration-300 font-medium text-sm h-10 flex items-center border-b-2 border-transparent hover:border-yellow-400/50"
            >
              Careers
            </Link>
            <button
              onClick={() => navigateToSection('contact')}
              className="bg-yellow-400 text-primary-700 px-4 py-1.5 rounded-lg hover:bg-yellow-500 transition-all duration-300 font-medium text-sm h-10 flex items-center shadow-md hover:shadow-lg"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="text-white hover:text-yellow-400 transition-colors h-10 w-10 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-md"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu Drawer - Slides in from right */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-primary-500 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close Button */}
        <div className="flex justify-end p-4 border-b border-gray-700">
          <button
            onClick={closeMenu}
            className="text-white hover:text-yellow-400 transition-colors p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="px-4 py-6 space-y-3">
          <button
            onClick={() => { 
              navigateToSection('home');
              closeMenu(); 
            }}
            className="flex w-full justify-between items-center text-white hover:text-yellow-400 transition-colors py-3 font-medium text-base border-b border-primary-400"
          >
            <span>Home</span>
            <ChevronRight size={18} className="text-gray-500" />
          </button>
          <button
            onClick={() => { 
              navigateToSection('services');
              closeMenu(); 
            }}
            className="flex w-full justify-between items-center text-white hover:text-yellow-400 transition-colors py-3 font-medium text-base border-b border-primary-400"
          >
            <span>Services</span>
            <ChevronRight size={18} className="text-gray-500" />
          </button>
          <Link
            to="/blog"
            className="flex w-full justify-between items-center text-white hover:text-yellow-400 transition-colors py-3 font-medium text-base border-b border-primary-400"
            onClick={closeMenu}
          >
            <span>Blog</span>
            <ChevronRight size={18} className="text-gray-500" />
          </Link>
          <Link
            to="/careers"
            className="flex w-full justify-between items-center text-white hover:text-yellow-400 transition-colors py-3 font-medium text-base border-b border-primary-400"
            onClick={closeMenu}
          >
            <span>Careers</span>
            <ChevronRight size={18} className="text-gray-500" />
          </Link>
          <button
            onClick={() => { 
              navigateToSection('contact');
              closeMenu(); 
            }}
            className="w-full bg-yellow-400 text-primary-700 px-4 py-3 rounded-lg hover:bg-yellow-500 transition-all font-medium text-base mt-4 shadow-md hover:shadow-lg flex items-center justify-center"
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}