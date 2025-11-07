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
    <section id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#1C3D5A] to-[#143040] relative overflow-hidden">
      {/* Carousel Background */}
      <div className="absolute inset-0 z-0">
        {heroImages.length > 0 ? (
          <div className="relative w-full h-full">
            {heroImages.map((image, index) => (
              <div 
                key={image.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentImageIndex ? 'opacity-20' : 'opacity-0'
                }`}
                style={{
                  backgroundImage: `url(${image.image_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-200 border-2 border-dashed w-full h-full opacity-20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1C3D5A] to-[#143040] opacity-70"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Empowering East Africa Through
            <span className="text-[#2DBE7E]"> Digital Innovation</span>
          </h1>
          <p className="text-xl text-[#E5E8EB] mb-8 max-w-3xl mx-auto leading-relaxed">
            From rural communities to enterprise corporations, we deliver cutting-edge technology solutions
            tailored for the Ugandan market and beyond.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => scrollToSection('services')}
              className="bg-[#2DBE7E] text-white px-8 py-4 rounded-lg hover:bg-[#25a169] transition-all duration-300 font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-2"
            >
              Explore Our Services
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="bg-transparent border-2 border-[#2DBE7E] text-[#2DBE7E] px-8 py-4 rounded-lg hover:bg-[#2DBE7E] hover:text-white transition-all duration-300 font-semibold text-lg"
            >
              Contact Us
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20">
            <div className="bg-[#2DBE7E] w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Code className="text-white" size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Custom Development</h3>
            <p className="text-[#E5E8EB] leading-relaxed">
              Tailored web and mobile applications designed for your unique business needs and local workflows.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20">
            <div className="bg-[#F2B134] w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Globe className="text-white" size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Digital Transformation</h3>
            <p className="text-[#E5E8EB] leading-relaxed">
              Modernize your operations with cloud solutions, e-commerce platforms, and digital marketing.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20">
            <div className="bg-[#1C3D5A] w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Shield className="text-[#2DBE7E]" size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Enterprise Security</h3>
            <p className="text-[#E5E8EB] leading-relaxed">
              Protect your business with comprehensive cybersecurity solutions and 24/7 threat monitoring.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}