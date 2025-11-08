import { useState, useEffect } from 'react';
import { ArrowRight, Code, Globe, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HeroImage {
  id: string;
  title: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

export default function Hero() {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    fetchHeroImages();
  }, []);

  useEffect(() => {
    if (heroImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Change image every 5 seconds

      return () => clearInterval(interval);
    }
  }, [heroImages]);

  const fetchHeroImages = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_images')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setHeroImages(data);
      }
    } catch (error) {
      console.error('Error fetching hero images:', error);
      // Fallback to default images if fetch fails
      setHeroImages([
        {
          id: '1',
          title: 'Default Hero Image',
          image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80',
          is_active: true,
          created_at: new Date().toISOString(),
        }
      ]);
    }
  };

  return (
    <section id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-[#E5E8EB] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#E5E8EB] opacity-100"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div>
            <div className="p-0 md:p-0 rounded-none bg-transparent shadow-none border-none">
              <h1 className="text-4xl sm:text-5xl lg:text-5xl font-bold text-[#1C3D5A] mb-6 leading-tight">
                Empowering East Africa Through
                <span className="text-[#F2B134]"> Digital Innovation</span>
              </h1>
              <p className="text-xl text-[#1C3D5A]/80 mb-8 max-w-2xl leading-relaxed">
                From rural communities to enterprise corporations, we deliver cutting-edge technology solutions
                tailored for the Ugandan market and beyond.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => scrollToSection('services')}
                  className="bg-[#1C3D5A] text-white px-8 py-4 rounded-xl hover:bg-[#143040] transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
                >
                  Explore Our Services
                  <ArrowRight size={20} />
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="bg-transparent border-2 border-[#1C3D5A] text-[#1C3D5A] px-8 py-4 rounded-xl hover:bg-[#1C3D5A] hover:text-white transition-all duration-300 font-semibold text-lg"
                >
                  Contact Us
                </button>
              </div>
            </div>
          </div>

          {/* Right side - Carousel */}
          <div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden border border-[#1C3D5A]/10 shadow-lg">
            {heroImages.length > 0 ? (
              <>
                {heroImages.map((image, index) => (
                  <div 
                    key={image.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <img 
                      src={image.image_url} 
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1C3D5A] to-transparent opacity-30"></div>
                  </div>
                ))}
              </>
            ) : (
              <div className="bg-gray-200 border-2 border-dashed w-full h-full flex items-center justify-center">
                <span className="text-gray-500">No images available</span>
              </div>
            )}
            
            {/* Carousel indicators */}
            {heroImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentImageIndex 
                        ? 'bg-[#1C3D5A] w-6' 
                        : 'bg-[#1C3D5A]/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-8 rounded-2xl hover:shadow-lg transition-all duration-300 border border-[#1C3D5A]/10">
            <div className="bg-[#1C3D5A]/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <Code className="text-[#1C3D5A]" size={28} />
            </div>
            <h3 className="text-xl font-bold text-[#1C3D5A] mb-3">Custom Development</h3>
            <p className="text-[#1C3D5A]/80 leading-relaxed">
              Tailored web and mobile applications designed for your unique business needs and local workflows.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl hover:shadow-lg transition-all duration-300 border border-[#1C3D5A]/10">
            <div className="bg-[#1C3D5A]/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <Globe className="text-[#1C3D5A]" size={28} />
            </div>
            <h3 className="text-xl font-bold text-[#1C3D5A] mb-3">Digital Transformation</h3>
            <p className="text-[#1C3D5A]/80 leading-relaxed">
              Modernize your operations with cloud solutions, e-commerce platforms, and digital marketing.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl hover:shadow-lg transition-all duration-300 border border-[#1C3D5A]/10">
            <div className="bg-[#1C3D5A]/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <Shield className="text-[#F2B134]" size={28} />
            </div>
            <h3 className="text-xl font-bold text-[#1C3D5A] mb-3">Enterprise Security</h3>
            <p className="text-[#1C3D5A]/80 leading-relaxed">
              Protect your business with comprehensive cybersecurity solutions and 24/7 threat monitoring.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
