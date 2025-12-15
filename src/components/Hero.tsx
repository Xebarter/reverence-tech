import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Star, Quote } from 'lucide-react';
import { supabase } from '../lib/supabase';

// --- CORE OPTIMIZATION FUNCTIONS (Slightly refined for mobile efficiency) ---

interface HeroImage {
  id: string;
  title: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

// Helper function to generate optimized image URL with responsive sizing
const getOptimizedImageUrl = (url: string, width: number): string => {
  if (!url) return url;

  // Use smaller default widths for mobile to save bandwidth
  const quality = width < 600 ? 70 : 75;

  if (url.includes('unsplash.com')) {
    return `${url}&w=${width}&q=${quality}&auto=format&fit=crop&fm=webp`;
  }
  if (url.includes('supabase.co')) {
    return `${url}?width=${width}&quality=${quality}&resize=cover&format=webp`;
  }
  return url;
};

// Create a *very small, low-quality* thumbnail URL for the initial blurry placeholder (LQIP)
const getThumbnailUrl = (url: string): string => {
  if (!url) return url;

  if (url.includes('unsplash.com')) {
    // Keep it tiny for max speed
    return `${url}&w=20&h=20&q=10&blur=2&auto=format&fm=webp`;
  }
  if (url.includes('supabase.co')) {
    return `${url}?width=20&height=20&quality=10&resize=cover&format=webp`;
  }
  return url;
};

// Create a medium quality image for faster progressive loading after the thumbnail
const getMediumQualityUrl = (url: string): string => {
  if (!url) return url;

  if (url.includes('unsplash.com')) {
    // Use a mobile-friendly width (360px) for the medium quality
    return `${url}&w=360&q=50&auto=format&fit=crop&fm=webp`;
  }
  if (url.includes('supabase.co')) {
    return `${url}?width=360&quality=50&resize=cover&format=webp`;
  }
  return url;
};

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

  const carouselRef = useRef<HTMLDivElement>(null);
  const imageLoadState = useRef<Map<string, string>>(new Map());
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const [testimonialsVisible, setTestimonialsVisible] = useState(false);
  const [textTransitionState, setTextTransitionState] = useState<'idle' | 'fadingOut' | 'fadingIn'>('idle');

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

  const preloadImage = (imageUrl: string, priority: 'thumbnail' | 'medium' | 'full' = 'full') => {
    if (!imageUrl) return;

    if (priority === 'full' && imageLoadState.current.get(imageUrl) === 'full') return;
    if (priority === 'medium' && ['medium', 'full'].includes(imageLoadState.current.get(imageUrl) || '')) return;
    if (priority === 'thumbnail' && ['thumbnail', 'medium', 'full'].includes(imageLoadState.current.get(imageUrl) || '')) return;


    const loadImage = (url: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve();
        img.onerror = () => reject(`Failed to load image: ${url}`);
      });
    };

    const thumbnailUrl = getThumbnailUrl(imageUrl);
    const mediumUrl = getMediumQualityUrl(imageUrl);

    const loadSequence = [];

    if (priority === 'thumbnail' || priority === 'medium' || priority === 'full') {
      loadSequence.push({ url: thumbnailUrl, state: 'thumbnail' });
    }
    if (priority === 'medium' || priority === 'full') {
      loadSequence.push({ url: mediumUrl, state: 'medium' });
    }
    if (priority === 'full') {
      loadSequence.push({ url: getOptimizedImageUrl(imageUrl, 1920), state: 'full' });
    }

    let lastState = imageLoadState.current.get(imageUrl) || '';

    loadSequence.reduce((promise, step) => {
      return promise.then(() => {
        if (lastState !== 'full' && (step.state === 'thumbnail' && lastState !== 'thumbnail') || (step.state === 'medium' && lastState !== 'medium')) {
          return loadImage(step.url).then(() => {
            imageLoadState.current.set(imageUrl, step.state);
            lastState = step.state;
          });
        }
        return Promise.resolve();
      });
    }, Promise.resolve()).catch((error) => {
      console.warn('Image progressive loading failed:', error);
    });

    if (priority === 'full' && 'connection' in navigator && (navigator as any).connection?.effectiveType === '4g') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = getOptimizedImageUrl(imageUrl, 1536);
      link.setAttribute('fetchpriority', 'high');
      document.head.appendChild(link);
    }
  };


  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !testimonialsVisible) {
            setTestimonialsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (testimonialsRef.current) {
      observer.observe(testimonialsRef.current);
    }

    return () => observer.disconnect();
  }, [testimonialsVisible]);

  useEffect(() => {
    if (heroImages.length > 0) {
      preloadImage(heroImages[0].image_url, 'full');
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const imgElement = entry.target as HTMLImageElement;
          const imgUrl = imgElement.dataset.src;
          if (imgUrl) {
            preloadImage(imgUrl, 'medium');
          }
        }
      });
    }, {
      rootMargin: '200px',
      threshold: 0.01
    });

    const carouselImages = document.querySelectorAll('.carousel-image[data-src]');
    carouselImages.forEach(img => observer.observe(img));


    let interval: NodeJS.Timeout;
    if (heroImages.length > 1 || valuePropositions.length > 1) {
      interval = setInterval(() => {
        if (heroImages.length > 1) {
          setCurrentImageIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % heroImages.length;
            const nextNextIndex = (nextIndex + 1) % heroImages.length;
            if (heroImages[nextNextIndex]) {
              preloadImage(heroImages[nextNextIndex].image_url, 'full');
            }
            return nextIndex;
          });
        }

        if (valuePropositions.length > 1) {
          setTextTransitionState('fadingOut');
          setTimeout(() => {
            setCurrentValueIndex((prevIndex) =>
              (prevIndex + 1) % valuePropositions.length
            );
            setTextTransitionState('fadingIn');
            setTimeout(() => setTextTransitionState('idle'), 300);
          }, 300);
        }
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
      observer.disconnect();
    };
  }, [heroImages, valuePropositions.length]);

  const fetchHeroImages = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const valid = data.filter((d: any) => d.image_url && d.image_url.trim() !== '');
        setHeroImages(valid);
        setCurrentImageIndex(0);

        if (valid.length > 0) {
          preloadImage(valid[0].image_url, 'full');
        }
        if (valid.length > 1) {
          preloadImage(valid[1].image_url, 'medium');
        }
      }
    } catch (error) {
      console.error('Error fetching hero images:', error);
      const fallbackImages = [
        {
          id: '1',
          title: 'Default Hero Image',
          image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80',
          is_active: true,
          created_at: new Date().toISOString(),
        }
      ];
      setHeroImages(fallbackImages);
      preloadImage(fallbackImages[0].image_url, 'full');
    }
  };

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);

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
    // Increased pt-28 on mobile to ensure the hero section is completely below the fixed header
    <section id="home" className="pt-28 sm:pt-20 lg:pt-32 pb-8 sm:pb-16 lg:pb-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-primary-500 opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Adjusted gap for mobile (gap-6) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 items-center">

          {/* Left side - Text content */}
          <div className="order-2 lg:order-1">
            {/* Reduced padding on mobile (p-4) */}
            <div className="p-4 sm:p-6 lg:p-8 rounded-2xl bg-white/30 backdrop-blur-lg border border-white/20 shadow-xl">
              {/* Value Proposition Carousel */}
              <div className="relative mb-4 sm:mb-6">
                {valuePropositions.map((item, index) => (
                  <div
                    key={index}
                    className={`transition-all duration-500 ease-in-out ${index === currentValueIndex ?
                      (textTransitionState === 'fadingOut' ? 'opacity-0' : 'opacity-100') :
                      'opacity-0 absolute invisible'}`
                    }
                  >
                    {/* Adjusted text size for small screens (text-2xl) */}
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-primary-700 mb-3 sm:mb-4 leading-snug">
                      {item.valueProposition}
                    </h1>
                    {/* Adjusted copy text size for small screens (text-base) */}
                    <p className="text-base sm:text-xl text-primary-800/90 max-w-2xl leading-relaxed">
                      {item.copy}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action Buttons - Adjusted sizing and stacking for mobile */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
                <button
                  onClick={() => scrollToSection('services')}
                  // Reduced vertical padding (py-3) on mobile
                  className="bg-yellow-400 text-primary-700 px-6 py-3 rounded-xl hover:bg-yellow-500 transition-all duration-300 font-semibold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center gap-2 w-full justify-center sm:py-4 sm:text-lg sm:w-auto sm:flex-1"
                >
                  Get a Quote
                  <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  // Reduced vertical padding (py-3) on mobile
                  className="bg-transparent border-2 border-primary-700 text-primary-700 px-6 py-3 rounded-xl hover:bg-primary-700 hover:text-white transition-all duration-300 font-semibold text-base backdrop-blur-sm w-full justify-center sm:py-4 sm:text-lg sm:w-auto sm:flex-1"
                >
                  Contact Us
                </button>
              </div>
            </div>
          </div>

          {/* Right side - Carousel */}
          {/* Ensured height scales properly on small screens (h-60) */}
          <div className="order-1 lg:order-2 relative h-60 sm:h-80 lg:h-[500px] rounded-3xl overflow-hidden border border-white/30 shadow-xl backdrop-blur-sm" ref={carouselRef}>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-primary-400"></div>

            {heroImages.map((image, index) => {
              const isCurrent = index === currentImageIndex;
              const isFirst = index === 0;
              const currentSrc = isCurrent || isFirst ? getOptimizedImageUrl(image.image_url, 400) : getThumbnailUrl(image.image_url);

              return (
                <div
                  key={image.id}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${isCurrent ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                  <img
                    src={currentSrc}
                    data-src={image.image_url}
                    // Optimized srcset for smaller screen density
                    srcSet={`
                      ${getOptimizedImageUrl(image.image_url, 360)} 360w,
                      ${getOptimizedImageUrl(image.image_url, 600)} 600w,
                      ${getOptimizedImageUrl(image.image_url, 1024)} 1024w,
                      ${getOptimizedImageUrl(image.image_url, 1536)} 1536w`}
                    // Prioritized 100vw on smaller screens
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 50vw"
                    alt={image.title}
                    className="w-full h-full object-cover carousel-image"
                    loading={isFirst ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={isFirst ? "high" : "auto"}
                    width="1024"
                    height="500"
                    style={{
                      backgroundColor: '#f0f4f8',
                      backgroundImage: `url(${getThumbnailUrl(image.image_url)})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      transition: 'opacity 0.3s ease-in-out'
                    }}
                    onLoad={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.backgroundImage = 'none';
                    }}
                  />
                </div>
              );
            })}

            {/* Carousel indicators - Minified size for small screens */}
            {heroImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-2">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all backdrop-blur-sm ${index === currentImageIndex
                        ? 'bg-yellow-400 w-4 sm:w-6'
                        : 'bg-primary-700/50'
                      }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Testimonials section */}
        <div className="mt-10 sm:mt-16 lg:mt-20" ref={testimonialsRef}>
          <h2 className="text-xl sm:text-2xl font-bold text-center text-[#4B0082] mb-5 sm:mb-8">What Our Clients Say</h2>
          {testimonialsVisible && testimonials.length > 0 ? (
            // Removed md:grid-cols-3 to allow stacking on very small screens, 
            // relying on default grid-cols-1 or ensuring minimum padding
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  // Ensured tighter padding (p-4) on small screens
                  className="bg-white/30 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center mb-3">
                    <img
                      src={testimonial.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=2DBE7E&color=fff&size=96`}
                      alt={testimonial.name}
                      // Fixed size for avatar, w-10 h-10 looks better on mobile
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      loading="lazy"
                      decoding="async"
                      width="40"
                      height="40"
                      sizes="40px"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=2DBE7E&color=fff&size=96`;
                      }}
                    />
                    <div className="ml-3 min-w-0">
                      <h3 className="font-semibold text-[#4B0082] text-sm truncate">{testimonial.name}</h3>
                      {/* Used text-xs for smaller mobile text, making role/company less prominent */}
                      <p className="text-xs text-[#4B0082]/80 truncate">{testimonial.role ? `${testimonial.role}, ` : ''}{testimonial.company}</p>
                    </div>
                  </div>
                  <div className="mb-2">
                    {renderStars(testimonial.rating)}
                  </div>
                  {/* Used text-sm for testimonial content for readability */}
                  <p className="text-[#4B0082] text-sm italic leading-relaxed">"{testimonial.content}"</p>
                </div>
              ))}
            </div>
          ) : testimonialsVisible ? (
            <div className="text-center py-6 bg-white/30 backdrop-blur-sm rounded-xl border border-white/20">
              <Quote className="mx-auto text-[#4B0082]/50 mb-3" size={24} />
              <p className="text-[#4B0082]/80 text-sm">No testimonials available yet.</p>
            </div>
          ) : (
            <div className="text-center py-6 bg-white/30 backdrop-blur-sm rounded-xl border border-white/20">
              <Quote className="mx-auto text-[#4B0082]/50 mb-3" size={24} />
              <p className="text-[#4B0082]/80 text-sm">Loading testimonials...</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}