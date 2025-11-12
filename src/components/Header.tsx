import { Menu, X, ChevronRight } from 'lucide-react';
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
    <header className="fixed top-0 left-0 right-0 bg-[#1C3D5A] z-50 shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/logo.svg" 
                alt="Reverence Technology Logo" 
                className="h-10 w-auto mr-3"
              />
              <div className="text-base md:text-2xl font-bold text-white flex flex-col md:flex-row items-start md:items-center">
                <span>Reverence</span>
                <span className="text-[#F2B134] md:ml-2 mt-0.5 md:mt-0 text-xs md:text-base">Technology</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8 items-center">
            <button
              onClick={() => navigateToSection('home')}
              className="text-[#E5E8EB] hover:text-[#F2B134] transition-colors duration-300 font-medium text-base h-12 flex items-center border-b-2 border-transparent hover:border-[#F2B134]/50"
            >
              Home
            </button>
            <button
              onClick={() => navigateToSection('services')}
              className="text-[#E5E8EB] hover:text-[#F2B134] transition-colors duration-300 font-medium text-base h-12 flex items-center border-b-2 border-transparent hover:border-[#F2B134]/50"
            >
              Services
            </button>
            <Link
              to="/blog"
              className="text-[#E5E8EB] hover:text-[#F2B134] transition-colors duration-300 font-medium text-base h-12 flex items-center border-b-2 border-transparent hover:border-[#F2B134]/50"
            >
              Blog
            </Link>
            <Link
              to="/careers"
              className="text-[#E5E8EB] hover:text-[#F2B134] transition-colors duration-300 font-medium text-base h-12 flex items-center border-b-2 border-transparent hover:border-[#F2B134]/50"
            >
              Careers
            </Link>
            <button
              onClick={() => navigateToSection('contact')}
              className="bg-[#F2B134] text-white px-6 py-2 rounded-lg hover:bg-[#d89e2d] transition-all duration-300 font-medium text-base h-12 flex items-center shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="text-white hover:text-[#F2B134] transition-colors h-12 w-12 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#F2B134] rounded-md"
              aria-label="Open menu"
            >
              <Menu size={24} />
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
        className={`fixed top-0 right-0 h-full w-80 bg-[#1C3D5A] z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close Button */}
        <div className="flex justify-end p-6 border-b border-gray-700">
          <button
            onClick={closeMenu}
            className="text-[#E5E8EB] hover:text-[#F2B134] transition-colors p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F2B134]"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="px-6 py-8 space-y-4">
          <button
            onClick={() => { 
              navigateToSection('home');
              closeMenu(); 
            }}
            className="flex w-full justify-between items-center text-[#E5E8EB] hover:text-[#F2B134] transition-colors py-4 font-medium text-lg border-b border-gray-700"
          >
            <span>Home</span>
            <ChevronRight size={20} className="text-gray-500" />
          </button>
          <button
            onClick={() => { 
              navigateToSection('services');
              closeMenu(); 
            }}
            className="flex w-full justify-between items-center text-[#E5E8EB] hover:text-[#F2B134] transition-colors py-4 font-medium text-lg border-b border-gray-700"
          >
            <span>Services</span>
            <ChevronRight size={20} className="text-gray-500" />
          </button>
          <Link
            to="/blog"
            className="flex w-full justify-between items-center text-[#E5E8EB] hover:text-[#F2B134] transition-colors py-4 font-medium text-lg border-b border-gray-700"
            onClick={closeMenu}
          >
            <span>Blog</span>
            <ChevronRight size={20} className="text-gray-500" />
          </Link>
          <Link
            to="/careers"
            className="flex w-full justify-between items-center text-[#E5E8EB] hover:text-[#F2B134] transition-colors py-4 font-medium text-lg border-b border-gray-700"
            onClick={closeMenu}
          >
            <span>Careers</span>
            <ChevronRight size={20} className="text-gray-500" />
          </Link>
          <button
            onClick={() => { 
              navigateToSection('contact');
              closeMenu(); 
            }}
            className="w-full bg-[#F2B134] text-white px-6 py-4 rounded-lg hover:bg-[#d89e2d] transition-all font-medium text-lg mt-6 shadow-lg hover:shadow-xl flex items-center justify-center"
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}