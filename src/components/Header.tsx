import { Menu, X, ChevronRight, Phone, Mail, ArrowRight, MapPin, ShoppingCart, Package, CreditCard, ShoppingBag, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../CartContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, cartCount, removeFromCart, getTotal } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if we need to scroll to a section after page load
  useEffect(() => {
    const scrollToSection = () => {
      // First check localStorage for section to scroll to
      const storedSectionId = localStorage.getItem('scrollToSection');
      if (storedSectionId) {
        localStorage.removeItem('scrollToSection'); // Remove it so we don't scroll again
        attemptScroll(storedSectionId);
        return;
      }
      
      // If no stored section, check for hash in URL
      const hash = window.location.hash;
      if (hash) {
        const sectionId = hash.substring(1); // Remove the #
        attemptScroll(sectionId);
      }
    };

    const attemptScroll = (sectionId: string) => {
      const element = document.getElementById(sectionId);
      if (element) {
        // Try immediately first
        scrollToElement(element);
      } else {
        // If element not found, wait a bit and try again
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            scrollToElement(element);
          }
        }, 500);
      }
    };

    const scrollToElement = (element: HTMLElement) => {
      const header = document.querySelector('header');
      const headerHeight = header ? header.offsetHeight : 0;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    };

    // Scroll to section if we're on the home page
    if (location.pathname === '/') {
      scrollToSection();
    }
  }, [location]);

  const navigateToSection = (sectionId: string) => {
    const scrollToElement = (element: HTMLElement) => {
      const header = document.querySelector('header');
      const headerHeight = header ? header.offsetHeight : 0;
      const offsetPosition = element.getBoundingClientRect().top + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    };

    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        scrollToElement(element);
      }
      setIsMenuOpen(false);
    } else {
      localStorage.setItem('scrollToSection', sectionId);
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
              <a href="mailto:reverencetech1@gmail.com" className="flex items-center gap-2 hover:text-yellow-400 transition-colors">
                <Mail size={14} className="text-yellow-400" /> reverencetech1@gmail.com
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
              {['Home', 'Services', 'FAQ', 'Blog', 'Careers'].map((item) => (
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
                onClick={() => navigateToSection('projects')}
                className={`text-sm font-bold transition-all hover:text-yellow-500 relative group ${isScrolled ? 'text-slate-700' : 'text-slate-200'
                  }`}
              >
                Portfolio
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-500 transition-all group-hover:w-full" />
              </button>
              
              {/* Cart Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  className={`p-2.5 rounded-xl transition-all duration-300 relative ${
                    isScrolled 
                      ? 'bg-slate-100 text-slate-700 hover:bg-yellow-400 hover:text-white' 
                      : 'bg-white/10 text-white hover:bg-yellow-400 hover:text-[#1C3D5A]'
                  }`}
                >
                  <ShoppingCart size={20} />
                  {/* Cart Badge */}
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isCartOpen && (
                    <>
                      {/* Backdrop to close dropdown */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsCartOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 max-h-[600px] flex flex-col"
                      >
                        <div className="p-4 bg-gradient-to-br from-[#1C3D5A] to-[#2a5a7f] text-white">
                          <h3 className="font-black text-lg">Shopping Cart</h3>
                          <p className="text-xs text-slate-200 mt-1">
                            {cartCount > 0 ? `${cartCount} item${cartCount > 1 ? 's' : ''} in cart` : 'Your cart is empty'}
                          </p>
                        </div>

                        {/* Cart Items Preview */}
                        {cartItems.length > 0 && (
                          <div className="flex-1 overflow-y-auto p-3 border-b border-slate-100 max-h-64">
                            {cartItems.map((item) => (
                              <div key={item.product_id} className="flex gap-3 p-3 bg-slate-50 rounded-xl mb-2">
                                {item.product_image && (
                                  <img 
                                    src={item.product_image} 
                                    alt={item.product_name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-sm text-slate-800 truncate">{item.product_name}</h4>
                                  <p className="text-xs text-slate-500">{item.category}</p>
                                  <p className="text-sm font-bold text-[#1C3D5A] mt-1">
                                    UGX {item.product_price.toLocaleString()} × {item.quantity}
                                  </p>
                                </div>
                                <button
                                  onClick={() => removeFromCart(item.product_id)}
                                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors h-fit"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Total and Actions */}
                        {cartItems.length > 0 && (
                          <div className="p-4 bg-slate-50">
                            <div className="flex justify-between items-center mb-4">
                              <span className="font-bold text-slate-700">Total:</span>
                              <span className="font-black text-xl text-[#1C3D5A]">
                                UGX {getTotal().toLocaleString()}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                navigate('/checkout', { state: { cartItems } });
                                setIsCartOpen(false);
                              }}
                              className="w-full bg-gradient-to-r from-[#1C3D5A] to-[#2a5a7f] text-white py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                            >
                              <ShoppingCart size={18} />
                              View Cart & Checkout
                            </button>
                          </div>
                        )}
                        
                        <div className="p-2 border-t border-slate-100">
                          <Link
                            to="/shop"
                            onClick={() => setIsCartOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100">
                              <ShoppingBag size={18} />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-sm text-slate-800">Shop</div>
                              <div className="text-xs text-slate-500">Browse products</div>
                            </div>
                          </Link>

                          <Link
                            to="/orders"
                            onClick={() => setIsCartOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-100">
                              <Package size={18} />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-sm text-slate-800">Track Orders</div>
                              <div className="text-xs text-slate-500">Check order status</div>
                            </div>
                          </Link>

                          <Link
                            to="/deposits"
                            onClick={() => setIsCartOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-100">
                              <CreditCard size={18} />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-sm text-slate-800">Track Deposits</div>
                              <div className="text-xs text-slate-500">View deposit status</div>
                            </div>
                          </Link>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

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
                {['Home', 'Services', 'FAQ', 'Blog', 'Careers'].map((item) => (
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
                <button
                  onClick={() => {
                    navigateToSection('projects');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center justify-between w-full p-4 text-lg font-black text-[#1C3D5A] bg-slate-50 rounded-2xl hover:bg-yellow-50 transition-all group"
                >
                  Portfolio
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-yellow-600 transition-colors" />
                </button>
                
                {/* Quick Access Section */}
                <div className="pt-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Quick Access</p>
                  
                  <Link
                    to="/shop"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 w-full p-4 text-base font-black text-[#1C3D5A] bg-blue-50 rounded-2xl hover:bg-blue-100 transition-all group mb-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-blue-600">
                      <ShoppingBag size={20} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-black text-sm">Shop</div>
                      <div className="text-xs text-slate-600 font-normal">Browse products</div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </Link>

                  <Link
                    to="/orders"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 w-full p-4 text-base font-black text-[#1C3D5A] bg-green-50 rounded-2xl hover:bg-green-100 transition-all group mb-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-green-600">
                      <Package size={20} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-black text-sm">Track Orders</div>
                      <div className="text-xs text-slate-600 font-normal">Check order status</div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-green-600 transition-colors" />
                  </Link>

                  <Link
                    to="/deposits"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 w-full p-4 text-base font-black text-[#1C3D5A] bg-purple-50 rounded-2xl hover:bg-purple-100 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-purple-600">
                      <CreditCard size={20} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-black text-sm">Track Deposits</div>
                      <div className="text-xs text-slate-600 font-normal">View deposit status</div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-purple-600 transition-colors" />
                  </Link>
                </div>
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
                    <a href="mailto:reverencetech1@gmail.com" className="flex items-center gap-4 text-slate-700 hover:text-blue-600 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600">
                        <Mail size={18} />
                      </div>
                      <span className="font-bold text-sm">reverencetech1@gmail.com</span>
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