import { Menu, X, ChevronRight, Phone, Mail, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Handle glass effect and height transition on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateToSection = (sectionId: string) => {
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setIsMenuOpen(false);
      }
    } else {
      window.location.href = `/#${sectionId}`;
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-white/90 backdrop-blur-md shadow-md py-2'
          : 'bg-[#1C3D5A] py-4'
        }`}
    >
      {/* Contact Strip - Hidden on Scroll for a focused UI */}
      {!isScrolled && (
        <div className="hidden md:block border-b border-white/10 pb-3 mb-3">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-[13px] font-medium text-slate-300">
            <div className="flex gap-6">
              <a href="tel:+256783676313" className="flex items-center gap-2 hover:text-yellow-400 transition-colors">
                <Phone size={14} className="text-yellow-400" /> +256 783 676 313
              </a>
              <a href="mailto:reverencetechnology1@gmail.com" className="flex items-center gap-2 hover:text-yellow-400 transition-colors">
                <Mail size={14} className="text-yellow-400" /> reverencetechnology1@gmail.com
              </a>
            </div>
            <div className="text-yellow-400/80 tracking-widest uppercase text-[10px]">
              Innovating from Kampala, Uganda
            </div>
          </div>
        </div>
      )}

      <nav className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-12">
          {/* Restored Original Logo Branding */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.svg"
              alt="Reverence Technology Logo"
              className={`transition-all duration-300 ${isScrolled ? 'h-8' : 'h-10'} w-auto`}
            />
            <div className="flex flex-col">
              <span className={`text-lg md:text-xl font-black tracking-tight leading-none transition-colors ${isScrolled ? 'text-[#1C3D5A]' : 'text-white'}`}>
                Reverence
              </span>
              <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-yellow-400 mt-0.5">
                Technology
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {['Home', 'Services', 'Blog', 'Careers'].map((item) => (
              <button
                key={item}
                onClick={() => {
                  if (item === 'Blog' || item === 'Careers') {
                    // Actual navigation for separate pages
                    window.location.href = `/${item.toLowerCase()}`;
                  } else {
                    navigateToSection(item.toLowerCase());
                  }
                }}
                className={`text-sm font-bold transition-all hover:text-yellow-500 relative group ${isScrolled ? 'text-slate-600' : 'text-slate-200'
                  }`}
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-500 transition-all group-hover:w-full" />
              </button>
            ))}

            <button
              onClick={() => navigateToSection('contact')}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-md flex items-center gap-2 ${isScrolled
                  ? 'bg-[#1C3D5A] text-white hover:bg-yellow-500 hover:text-[#1C3D5A]'
                  : 'bg-yellow-400 text-[#1C3D5A] hover:bg-white hover:text-[#1C3D5A]'
                }`}
            >
              Get Started <ArrowRight size={16} />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className={`md:hidden p-2 rounded-lg transition-colors ${isScrolled ? 'text-[#1C3D5A] bg-slate-100' : 'text-white bg-white/10'
              }`}
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white z-[70] shadow-2xl p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-10">
                <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
                <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-900">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 flex-1">
                {['Home', 'Services', 'Blog', 'Careers'].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      if (item === 'Blog' || item === 'Careers') {
                        window.location.href = `/${item.toLowerCase()}`;
                      } else {
                        navigateToSection(item.toLowerCase());
                      }
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center justify-between w-full text-2xl font-bold text-slate-900 hover:text-yellow-500 transition-colors group"
                  >
                    {item}
                    <ChevronRight className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>

              <div className="mt-auto pt-8 border-t border-slate-100">
                <button
                  onClick={() => { navigateToSection('contact'); setIsMenuOpen(false); }}
                  className="w-full bg-[#1C3D5A] text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl"
                >
                  Start a Project <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}