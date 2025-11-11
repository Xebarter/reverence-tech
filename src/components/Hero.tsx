import { useState, useEffect } from 'react';
import { ArrowRight, Code, Globe, Shield, Star, Quote } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HeroImage {
  id: string;
  title: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

interface Testimonial {
  id: string;
  name: string;
  company: string;
  role: string | null;
  content: string;
  rating: number;
  avatar_url: string | null;
  created_at: string;
  is_active: boolean;
}

export default function Hero() {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentValueIndex, setCurrentValueIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  const valuePropositions = [
    {
      valueProposition: "We help businesses go digital - and grow beyond.",
      copy: "We partner with you to build websites, apps, and systems that elevate your brand and automate your operations. We’re your long-term tech ally."
    },
    {
      valueProposition: "Transforming ideas into digital realities.",
      copy: "We craft powerful digital products that bring your vision to life — from concept to code. Let’s turn your idea into something the world can experience."
    },
    {
      valueProposition: "Your website isn’t just a page - it’s a business engine",
      copy: "We design and develop websites that attract customers, boost trust, and drive real growth for Ugandan businesses and startups."
    }
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    fetchHeroImages();
    fetchTestimonials();
  }, []);

  useEffect(() => {
    // Use a single interval to synchronize both carousels
    if (heroImages.length > 1 || valuePropositions.length > 1) {
      const interval = setInterval(() => {
        if (heroImages.length > 1) {
          setCurrentImageIndex((prevIndex) =>
            prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
          );
        }
        
        if (valuePropositions.length > 1) {
          setCurrentValueIndex((prevIndex) =>
            prevIndex === valuePropositions.length - 1 ? 0 : prevIndex + 1
          );
        }
      }, 7000); // Change both image and text every 7 seconds

      return () => clearInterval(interval);
    }
  }, [heroImages, valuePropositions.length]);

  const fetchHeroImages = async () => {
    try {
      // Fetch all uploaded hero images. The admin UI stores the public URL in
      // `image_url`. We show all uploaded images so the carousel reflects what
      // was uploaded via /admin/hero-images. If you prefer only active images,
      // you can re-enable filtering by `is_active`.
      const { data, error } = await supabase
        .from('hero_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Filter out any rows without an image_url to avoid blank slides
        const valid = data.filter((d: any) => d.image_url && d.image_url.trim() !== '');
        setHeroImages(valid);
        setCurrentImageIndex(0); // reset carousel to the first image when images load
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

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3); // Limit to 3 testimonials

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 sm:w-4 sm:h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <section id="home" className="pt-16 sm:pt-20 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background elements with gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f2b134] to-[#00c7f2] opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Left side - Text content with value proposition carousel */}
          <div className="order-2 lg:order-1">
            <div className="p-4 sm:p-6 lg:p-8 rounded-2xl bg-white/30 backdrop-blur-lg border border-white/20 shadow-xl">
              {/* Value Proposition Carousel */}
              <div className="relative mb-6 sm:mb-8">
                {valuePropositions.map((item, index) => (
                  <div
                    key={index}
                    className={`transition-all duration-1000 ease-in-out ${
                      index === currentValueIndex ? 'opacity-100 static' : 'opacity-0 absolute invisible'
                    }`}
                  >
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1C3D5A] mb-4 sm:mb-6 leading-tight">
                      {item.valueProposition}
                    </h1>
                    <p className="text-lg sm:text-xl text-[#1C3D5A]/90 max-w-2xl leading-relaxed">
                      {item.copy}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => scrollToSection('services')}
                  className="bg-[#f2b134] text-[#1C3D5A] px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-[#d89e2d] transition-all duration-300 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 min-w-0 flex-1 justify-center"
                >
                  Get a Quote
                  <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="bg-transparent border-2 border-[#1C3D5A] text-[#1C3D5A] px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-[#1C3D5A] hover:text-white transition-all duration-300 font-semibold text-base sm:text-lg backdrop-blur-sm min-w-0 flex-1 justify-center"
                >
                  Contact Us
                </button>
              </div>
            </div>
          </div>

          {/* Right side - Carousel */}
          <div className="order-1 lg:order-2 relative h-64 sm:h-80 lg:h-[500px] rounded-3xl overflow-hidden border border-white/30 shadow-xl backdrop-blur-sm">
            {heroImages.length > 0 ? (
              <>
                {heroImages.map((image, index) => (
                  <div
                    key={image.id}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                  >
                    <img
                      src={image.image_url}
                      alt={image.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1C3D5A]/40 to-transparent"></div>
                  </div>
                ))}
              </>
            ) : (
              <div className="bg-gray-200/20 border-2 border-dashed border-white/30 backdrop-blur-sm w-full h-full flex items-center justify-center">
                <span className="text-[#1C3D5A] font-medium text-sm sm:text-base">No images available</span>
              </div>
            )}

            {/* Carousel indicators */}
            {heroImages.length > 1 && (
              <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all backdrop-blur-sm ${index === currentImageIndex
                        ? 'bg-[#f2b134] w-5 sm:w-6'
                        : 'bg-[#1C3D5A]/50'
                      }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Testimonials section replacing the previous service cards */}
        <div className="mt-12 sm:mt-16 lg:mt-20">
          <h2 className="text-xl sm:text-2xl font-bold text-center text-[#1C3D5A] mb-6 sm:mb-8">What Our Clients Say</h2>
          {testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id} 
                  className="bg-white/30 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center mb-3 sm:mb-4">
                    <img
                      src={testimonial.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=2DBE7E&color=fff`}
                      alt={testimonial.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=2DBE7E&color=fff`;
                      }}
                    />
                    <div className="ml-3 sm:ml-4 min-w-0">
                      <h3 className="font-semibold text-[#1C3D5A] text-sm sm:text-base truncate">{testimonial.name}</h3>
                      <p className="text-xs sm:text-sm text-[#1C3D5A]/80 truncate">{testimonial.role ? `${testimonial.role}, ` : ''}{testimonial.company}</p>
                    </div>
                  </div>
                  <div className="mb-2 sm:mb-3">
                    {renderStars(testimonial.rating)}
                  </div>
                  <p className="text-[#1C3D5A] text-xs sm:text-sm italic leading-relaxed">"{testimonial.content}"</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 bg-white/30 backdrop-blur-sm rounded-xl border border-white/20">
              <Quote className="mx-auto text-[#1C3D5A]/50 mb-3 sm:mb-4" size={24} className="sm:w-8 sm:h-8" />
              <p className="text-[#1C3D5A]/80 text-sm sm:text-base">No testimonials available yet.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}