import { Mail, Phone, MapPin, Clock, Facebook, Twitter, Linkedin, Instagram, ArrowUp } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToSection = (sectionId: string) => {
    // Check if we're on the home page
    if (window.location.pathname === '/') {
      // We're on the home page, scroll to the section
      const element = document.getElementById(sectionId);
      if (element) {
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 0;
        const offsetPosition = element.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    } else {
      // We're on another page, store the section ID and navigate to home
      localStorage.setItem('scrollToSection', sectionId);
      window.location.href = `/#${sectionId}`;
    }
  };

  return (
    <footer className="bg-[#0B1221] text-white pt-20 pb-10 relative">
      {/* Subtle Background Pattern for a premium feel */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none">
        <svg width="100%" height="100%">
          <pattern id="footer-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#footer-grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 justify-items-start">

          {/* Brand Column */}
          <div>
            <h3 className="text-2xl font-bold mb-6 tracking-tight">
              Reverence <span className="text-indigo-500">Technology</span>
            </h3>
            <p className="text-slate-400 leading-relaxed mb-8">
              Delivering innovative technology solutions to empower businesses in the digital age.
            </p>
            <div className="flex space-x-4">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="text-white/60 hover:text-white transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links - Restored Original Routing */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="/" className="text-slate-400 hover:text-white transition-all duration-300 border-b-2 border-transparent hover:border-indigo-500 pb-1">Home</a></li>
              <li><button onClick={() => navigateToSection('about')} className="text-slate-400 hover:text-white transition-all duration-300 border-b-2 border-transparent hover:border-indigo-500 pb-1 text-left">About Us</button></li>
              <li><button onClick={() => navigateToSection('services')} className="text-slate-400 hover:text-white transition-all duration-300 border-b-2 border-transparent hover:border-indigo-500 pb-1 text-left">Services</button></li>
              <li><button onClick={() => navigateToSection('faq')} className="text-slate-400 hover:text-white transition-all duration-300 border-b-2 border-transparent hover:border-indigo-500 pb-1 text-left">FAQ</button></li>
              <li><button onClick={() => navigateToSection('projects')} className="text-slate-400 hover:text-white transition-all duration-300 border-b-2 border-transparent hover:border-indigo-500 pb-1 text-left">Portfolio</button></li>
              <li><a href="/blog" className="text-slate-400 hover:text-white transition-all duration-300 border-b-2 border-transparent hover:border-indigo-500 pb-1">Blog</a></li>
              <li><a href="/careers" className="text-slate-400 hover:text-white transition-all duration-300 border-b-2 border-transparent hover:border-indigo-500 pb-1">Careers</a></li>
              <li><button onClick={() => navigateToSection('contact')} className="text-slate-400 hover:text-white transition-all duration-300 border-b-2 border-transparent hover:border-indigo-500 pb-1 text-left">Contact</button></li>
            </ul>
          </div>

          {/* Services Links - Restored Original Routing */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Services</h4>
            <ul className="space-y-3">
              <li><button onClick={() => navigateToSection('services')} className="text-slate-400 hover:text-white transition-all duration-300 border-b-2 border-transparent hover:border-indigo-500 pb-1 text-left">Web Development</button></li>
              <li><button onClick={() => navigateToSection('services')} className="text-slate-400 hover:text-white transition-all duration-300 border-b-2 border-transparent hover:border-indigo-500 pb-1 text-left">Mobile Apps</button></li>
              <li><button onClick={() => navigateToSection('services')} className="text-slate-400 hover:text-white transition-all duration-300 border-b-2 border-transparent hover:border-indigo-500 pb-1 text-left">Cloud Solutions</button></li>
              <li><button onClick={() => navigateToSection('services')} className="text-slate-400 hover:text-white transition-all duration-300 border-b-2 border-transparent hover:border-indigo-500 pb-1 text-left">UI/UX Design</button></li>
              <li><button onClick={() => navigateToSection('services')} className="text-slate-400 hover:text-white transition-all duration-300 border-b-2 border-transparent hover:border-indigo-500 pb-1 text-left">Consulting</button></li>
              <li><button onClick={() => navigateToSection('projects')} className="text-slate-400 hover:text-white transition-all duration-300 border-b-2 border-transparent hover:border-indigo-500 pb-1 text-left">Our Projects</button></li>
            </ul>
          </div>

          {/* Contact Info Column */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Info</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 mt-1 text-indigo-500 flex-shrink-0" />
                <span className="text-slate-400">Mutungo, Zone 1, Kampala</span>
              </li>
              <li className="flex items-start">
                <Phone className="w-5 h-5 mr-3 mt-1 text-indigo-500 flex-shrink-0" />
                <a href="tel:+256783676313" className="text-slate-400 hover:text-white transition-colors">
                  +256 783 676 313
                </a>
              </li>
              <li className="flex items-start">
                <Mail className="w-5 h-5 mr-3 mt-1 text-indigo-500 flex-shrink-0" />
                <a href="mailto:reverencetech1@gmail.com" className="text-slate-400 hover:text-white transition-colors">
                  reverencetech1@gmail.com
                </a>
              </li>
              <li className="flex items-start">
                <Clock className="w-5 h-5 mr-3 mt-1 text-indigo-500 flex-shrink-0" />
                <div>
                  <p className="text-slate-400">Mon-Fri: 9AM - 5PM</p>
                  <p className="text-slate-400">Sat-Sun: Closed</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-500 text-sm mb-4 md:mb-0">
            &copy; {currentYear} Reverence Technology. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <button 
              onClick={scrollToTop}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              Back to top <ArrowUp size={16} />
            </button>
            <div className="flex gap-4">
              <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;