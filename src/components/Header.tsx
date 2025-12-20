import { Menu, X, ChevronRight, Phone, Mail, ArrowRight, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
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
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${isScrolled ? 'bg-white shadow-xl py-2' : 'bg-[#1C3D5A] py-5'
          }`}
      >
        {/* Desktop Top Bar (Hidden on Scroll) */}
        <div
          className={`hidden md:block overflow-hidden transition-all duration-300 ${isScrolled ? 'max-h-0 opacity-0 mb-0' : 'max-h-10 opacity-100 border-b border-white/10 pb-3 mb-3'
            }`}
        >
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-[13px] font-medium text-slate-300">
            <div className="flex gap-6">
              <a href="tel:+256783676313" className="flex items-center gap-2 hover:text-yellow-400 transition-colors">
                <Phone size={14} className="text-yellow-400" /> +256 783 676 313
              </a>
              <a href="mailto:reverence101@gmail.com" className="flex items-center gap-2 hover:text-yellow-400 transition-colors">
                <Mail size={14} className="text-yellow-400" /> reverence101@gmail.com
              </a>
            </div>
            <div className="text-yellow-400/80 tracking-widest uppercase text-[10px] font-bold">
              Innovating from Kampala, Uganda
            </div>
          </div>
        </div>

        <nav className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-12">
            <Link to="/" className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg transition-colors ${isScrolled ? 'bg-[#1C3D5A]' : 'bg-white'}`}>
                <img src="/logo.svg" alt="Logo" className="h-7 w-auto" />
              </div>
              <div className="flex flex-col">
                <span className={`text-lg md:text-xl font-black tracking-tight leading-none transition-colors ${isScrolled ? 'text-[#1C3D5A]' : 'text-white'}`}>
                  Reverence
                </span>
                <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-yellow-400 mt-0.5">
                  Technology
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {['Home', 'Services', 'Blog', 'Careers'].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    if (item === 'Blog' || item === 'Careers') {
                      window.location.href = `/${item.toLowerCase()}`;
                    } else {
                      navigateToSection(item.toLowerCase());
                    }
                  }}
                  className={`text-sm font-bold transition-all hover:text-yellow-500 relative group ${isScrolled ? 'text-slate-700' : 'text-slate-200'
                    }`}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-500 transition-all group-hover:w-full" />
                </button>
              ))}
              <button
                onClick={() => navigateToSection('contact')}
                className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all duration-300 shadow-lg ${isScrolled ? 'bg-[#1C3D5A] text-white hover:bg-yellow-500' : 'bg-yellow-400 text-[#1C3D5A] hover:bg-white'
                  }`}
              >
                Get Started
              </button>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className={`md:hidden p-2 rounded-xl transition-all ${isScrolled ? 'text-[#1C3D5A] bg-slate-100' : 'text-white bg-white/10'
                }`}
            >
              <Menu size={24} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/90 z-[100] backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white z-[110] shadow-2xl flex flex-col overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="flex justify-between items-center p-8 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <div className="bg-[#1C3D5A] p-1.5 rounded-lg">
                    <img src="/logo.svg" alt="Logo" className="h-6 w-auto" />
                  </div>
                  <span className="text-xl font-black text-[#1C3D5A]">Reverence</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-3 bg-slate-100 rounded-2xl text-slate-900">
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="p-8 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Menu</p>
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
                    className="flex items-center justify-between w-full p-4 text-lg font-black text-[#1C3D5A] bg-slate-50 rounded-2xl hover:bg-yellow-50 transition-all group"
                  >
                    {item}
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-yellow-600 transition-colors" />
                  </button>
                ))}
              </div>

              {/* Contact Information (Brought from Desktop Header) */}
              <div className="mt-auto p-8 bg-slate-50 border-t border-slate-100 space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Get in Touch</p>
                  <div className="space-y-4">
                    <a href="tel:+256783676313" className="flex items-center gap-4 text-slate-700 hover:text-blue-600 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600">
                        <Phone size={18} />
                      </div>
                      <span className="font-bold text-sm">+256 783 676 313</span>
                    </a>
                    <a href="mailto:reverence101@gmail.com" className="flex items-center gap-4 text-slate-700 hover:text-blue-600 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600">
                        <Mail size={18} />
                      </div>
                      <span className="font-bold text-sm">reverence101@gmail.com</span>
                    </a>
                    <div className="flex items-center gap-4 text-slate-700">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-yellow-500">
                        <MapPin size={18} />
                      </div>
                      <span className="font-bold text-sm leading-tight">Kampala, Uganda</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => { navigateToSection('contact'); setIsMenuOpen(false); }}
                  className="w-full bg-[#1C3D5A] text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all"
                >
                  Start a Project <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}