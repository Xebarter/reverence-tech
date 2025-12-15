import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#4b0082] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-2xl font-bold mb-4">
              Reverence <span className="text-yellow-400">Technology</span>
            </h3>
            <p className="text-white/90 mb-6 leading-relaxed">
              Empowering East Africa through innovative technology solutions that bridge the digital divide.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com/reverencetech"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-3 rounded-lg hover:bg-yellow-400 hover:text-purple-700 transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://twitter.com/reverencetech"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-3 rounded-lg hover:bg-yellow-400 hover:text-purple-700 transition-all duration-300"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://linkedin.com/company/reverence-technology"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-3 rounded-lg hover:bg-yellow-400 hover:text-purple-700 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://instagram.com/reverencetech"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-3 rounded-lg hover:bg-yellow-400 hover:text-purple-700 transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-white/90 hover:text-yellow-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-white/90 hover:text-yellow-400 transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="text-white/90 hover:text-yellow-400 transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <a
                  href="/#contact"
                  className="text-white/90 hover:text-yellow-400 transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4">Our Services</h4>
            <ul className="space-y-3 text-[#E5E8EB]">
              <li>
                <a
                  href="/#services"
                  className="hover:text-yellow-400 transition-colors"
                >
                  Web Development
                </a>
              </li>
              <li>
                <a
                  href="/#services"
                  className="hover:text-yellow-400 transition-colors"
                >
                  E-Commerce Solutions
                </a>
              </li>
              <li>
                <a
                  href="/#services"
                  className="hover:text-yellow-400 transition-colors"
                >
                  Cloud Migration
                </a>
              </li>
              <li>
                <a
                  href="/#services"
                  className="hover:text-yellow-400 transition-colors"
                >
                  Cybersecurity
                </a>
              </li>
              <li>
                <a
                  href="/#services"
                  className="hover:text-yellow-400 transition-colors"
                >
                  IT Consulting
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4">Contact Info</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="text-yellow-400 flex-shrink-0 mt-1" size={20} />
                <div>
                  <a
                    href="mailto:reverencetechnology1@gmail.com"
                    className="text-white/90 hover:text-yellow-400 transition-colors"
                  >
                    reverencetechnology1@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="text-yellow-400 flex-shrink-0 mt-1" size={20} />
                <div>
                  <a
                    href="tel:+256783676313"
                    className="text-white/90 hover:text-yellow-400 transition-colors"
                  >
                    +256 783 676 313
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/90 text-sm">
              {currentYear} Reverence Technology. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="/privacy" className="text-white/90 hover:text-yellow-400 transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-white/90 hover:text-yellow-400 transition-colors">
                Terms of Service
              </a>
              <a href="/cookies" className="text-white/90 hover:text-yellow-400 transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
