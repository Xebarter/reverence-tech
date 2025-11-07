import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#1C3D5A] z-50 shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-white">
              Reverence <span className="text-[#2DBE7E]">Technology</span>
            </h1>
          </div>

          <div className="hidden md:flex space-x-8">
            <button
              onClick={() => scrollToSection('home')}
              className="text-[#E5E8EB] hover:text-[#2DBE7E] transition-colors duration-300 font-medium"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="text-[#E5E8EB] hover:text-[#2DBE7E] transition-colors duration-300 font-medium"
            >
              Services
            </button>
            <Link
              to="/blog"
              className="text-[#E5E8EB] hover:text-[#2DBE7E] transition-colors duration-300 font-medium"
            >
              Blog
            </Link>
            <Link
              to="/careers"
              className="text-[#E5E8EB] hover:text-[#2DBE7E] transition-colors duration-300 font-medium"
            >
              Careers
            </Link>
            <button
              onClick={() => scrollToSection('contact')}
              className="bg-[#2DBE7E] text-white px-6 py-2 rounded-lg hover:bg-[#25a169] transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-[#2DBE7E] transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-6 space-y-4">
            <button
              onClick={() => scrollToSection('home')}
              className="block w-full text-left text-[#E5E8EB] hover:text-[#2DBE7E] transition-colors py-2 font-medium"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="block w-full text-left text-[#E5E8EB] hover:text-[#2DBE7E] transition-colors py-2 font-medium"
            >
              Services
            </button>
            <Link
              to="/blog"
              className="block w-full text-left text-[#E5E8EB] hover:text-[#2DBE7E] transition-colors py-2 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Blog
            </Link>
            <Link
              to="/careers"
              className="block w-full text-left text-[#E5E8EB] hover:text-[#2DBE7E] transition-colors py-2 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Careers
            </Link>
            <button
              onClick={() => scrollToSection('contact')}
              className="block w-full bg-[#2DBE7E] text-white px-6 py-3 rounded-lg hover:bg-[#25a169] transition-all font-medium"
            >
              Get Started
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}