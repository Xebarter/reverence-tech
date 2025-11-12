import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1C3D5A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-2xl font-bold mb-4">
              Reverence <span className="text-[#2DBE7E]">Technology</span>
            </h3>
            <p className="text-[#E5E8EB] mb-6 leading-relaxed">
              Empowering East Africa through innovative technology solutions that bridge the digital divide.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com/reverencetech"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-3 rounded-lg hover:bg-[#F2B134] transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://twitter.com/reverencetech"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-3 rounded-lg hover:bg-[#F2B134] transition-all duration-300"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://linkedin.com/company/reverence-technology"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-3 rounded-lg hover:bg-[#F2B134] transition-all duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://instagram.com/reverencetech"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-3 rounded-lg hover:bg-[#F2B134] transition-all duration-300"
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
                  className="text-[#E5E8EB] hover:text-[#2DBE7E] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-[#E5E8EB] hover:text-[#2DBE7E] transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="text-[#E5E8EB] hover:text-[#2DBE7E] transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <a
                  href="/#contact"
                  className="text-[#E5E8EB] hover:text-[#2DBE7E] transition-colors"
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
                  className="hover:text-[#2DBE7E] transition-colors"
                >
                  Web Development
                </a>
              </li>
              <li>
                <a
                  href="/#services"
                  className="hover:text-[#2DBE7E] transition-colors"
                >
                  E-Commerce Solutions
                </a>
              </li>
              <li>
                <a
                  href="/#services"
                  className="hover:text-[#2DBE7E] transition-colors"
                >
                  Cloud Migration
                </a>
              </li>
              <li>
                <a
                  href="/#services"
                  className="hover:text-[#2DBE7E] transition-colors"
                >
                  Cybersecurity
                </a>
              </li>
              <li>
                <a
                  href="/#services"
                  className="hover:text-[#2DBE7E] transition-colors"
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
                <Mail className="text-[#2DBE7E] flex-shrink-0 mt-1" size={20} />
                <div>
                  <a
                    href="mailto:info@reverencetech.ug"
                    className="text-[#E5E8EB] hover:text-[#2DBE7E] transition-colors"
                  >
                    info@reverencetech.ug
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="text-[#F2B134] flex-shrink-0 mt-1" size={20} />
                <div>
                  <a
                    href="tel:+256700000000"
                    className="text-[#E5E8EB] hover:text-[#2DBE7E] transition-colors"
                  >
                    +256 700 000 000
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#E5E8EB] text-sm">
              © {currentYear} Reverence Technology. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="/privacy" className="text-[#E5E8EB] hover:text-[#2DBE7E] transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-[#E5E8EB] hover:text-[#2DBE7E] transition-colors">
                Terms of Service
              </a>
              <a href="/cookies" className="text-[#E5E8EB] hover:text-[#2DBE7E] transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}