import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Star, Quote } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

  // If using Supabase storage or Unsplash, add optimization params
  if (url.includes('unsplash.com')) {
    return `${url}&w=${width}&q=75&auto=format&fit=crop&fm=webp`;
  }
  if (url.includes('supabase.co')) {
    // For Supabase storage, add transform params
    return `${url}?width=${width}&quality=75&resize=cover&format=webp`;
  }
  return url;
};

// Create a smaller thumbnail URL for initial loading
const getThumbnailUrl = (url: string): string => {
  if (!url) return url;

  if (url.includes('unsplash.com')) {
    return `${url}&w=50&h=50&q=20&blur=2&auto=format&fm=webp`;
  }
  if (url.includes('supabase.co')) {
    return `${url}?width=50&height=50&quality=20&resize=cover&format=webp`;
  }
  return url;
};

// Create a medium quality image for progressive loading
const getMediumQualityUrl = (url: string): string => {
  if (!url) return url;

  if (url.includes('unsplash.com')) {
    return `${url}&w=400&q=50&auto=format&fit=crop&fm=webp`;
  }
  if (url.includes('supabase.co')) {
    return `${url}?width=400&quality=50&resize=cover&format=webp`;
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
  const preloadedImages = useRef<Set<string>>(new Set());
  const carouselRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const [testimonialsVisible, setTestimonialsVisible] = useState(false);
  // Track loaded images to prevent flickering
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  // State for managing text transitions
  const [textTransitionState, setTextTransitionState] = useState<'idle' | 'fadingOut' | 'fadingIn'>('idle');

  // Track image loading states for better UX
  const [imageLoadStates, setImageLoadStates] = useState<Record<string, 'loading' | 'loaded' | 'error'>>({});

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

  // Optimized preload images for carousel with better progressive loading
  const preloadImage = (imageUrl: string) => {
    if (!imageUrl || preloadedImages.current.has(imageUrl)) return;

    // Mark image as loading
    setImageLoadStates(prev => ({ ...prev, [imageUrl]: 'loading' }));
    preloadedImages.current.add(imageUrl);

    // Create a single image loader with a promise-based approach
    const loadImage = (url: string, isFallback = false): Promise<string> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve(url);
        img.onerror = () => reject(`Failed to load image: ${url}`);
      });
    };

    // Try loading in this order: thumbnail -> medium -> full
    const thumbnailUrl = getThumbnailUrl(imageUrl);
    const mediumUrl = getMediumQualityUrl(imageUrl);
    const fullUrl = getOptimizedImageUrl(imageUrl, 1024);

    // Start with the smallest possible version
    loadImage(thumbnailUrl)
      .then(() => {
        // Once thumbnail is loaded, update the state to show it
        setImageLoadStates(prev => ({ ...prev, [imageUrl]: 'loading' }));
        
        // Then try to load the medium version
        return loadImage(mediumUrl);
      })
      .then(() => {
        // Finally load the full version
        return loadImage(fullUrl);
      })
      .then(() => {
        // Image fully loaded
        setLoadedImages(prev => new Set(prev).add(imageUrl));
        setImageLoadStates(prev => ({ ...prev, [imageUrl]: 'loaded' }));
      })
      .catch((error) => {
        console.warn('Image loading failed:', error);
        setImageLoadStates(prev => ({ ...prev, [imageUrl]: 'error' }));
      });

    // Add preload link for the full image in the background
    if ('connection' in navigator && (navigator as any).connection?.effectiveType === '4g') {
      // Only preload on fast connections
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = fullUrl;
      link.fetchPriority = 'high';
      document.head.appendChild(link);
    }
  };

  // Intersection Observer for testimonials lazy loading
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
    // Preload first image immediately with high priority
    if (heroImages.length > 0) {
      preloadImage(heroImages[0].image_url);
    }

    // Set up intersection observer for lazy loading other images
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const imgElement = entry.target as HTMLImageElement;
          const imgUrl = imgElement.dataset.src;
          if (imgUrl) {
            preloadImage(imgUrl);
            observer.unobserve(imgElement); // Stop observing once loaded
          }
        }
      });
    }, {
      rootMargin: '200px', // Start loading when within 200px of viewport
      threshold: 0.01
    });

    // Observe all carousel images
    const carouselImages = document.querySelectorAll('.carousel-image[data-src]');
    carouselImages.forEach(img => observer.observe(img));

    // Set up carousel rotation
    let interval: NodeJS.Timeout;
    if (heroImages.length > 1 || valuePropositions.length > 1) {
      interval = setInterval(() => {
        if (heroImages.length > 1) {
          setCurrentImageIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % heroImages.length;
            // Preload the next image in the sequence
            const nextNextIndex = (nextIndex + 1) % heroImages.length;
            if (heroImages[nextNextIndex]) {
              preloadImage(heroImages[nextNextIndex].image_url);
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
        
        // Preload first few images immediately
        if (valid.length > 0) {
          preloadImage(valid[0].image_url);
        }
        if (valid.length > 1) {
          preloadImage(valid[1].image_url);
        }
      }
    } catch (error) {
      console.error('Error fetching hero images:', error);
      // Fallback to default images if fetch fails
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
      
      // Preload fallback images
      preloadImage(fallbackImages[0].image_url);
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
    <section id="home" className="pt-24 sm:pt-20 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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
                    className={`transition-all duration-500 ease-in-out ${index === currentValueIndex ? 
                      (textTransitionState === 'fadingOut' ? 'opacity-0' : 'opacity-100') : 
                      'opacity-0 absolute invisible'}`
                    }
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
          <div className="order-1 lg:order-2 relative h-64 sm:h-80 lg:h-[500px] rounded-3xl overflow-hidden border border-white/30 shadow-xl backdrop-blur-sm" ref={carouselRef}>
            {/* Beautiful gradient background that shows while images are loading */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#f2b134] to-[#00eedf]"></div>
            
            {heroImages.map((image, index) => {
              const isCurrent = index === currentImageIndex;
              const isLoaded = loadedImages.has(image.image_url);
              const loadState = imageLoadStates[image.image_url];
              
              return (
                <div
                  key={image.id}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                    isCurrent ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {/* Show image with progressive loading - no static placeholders */}
                  <img
                    src={isCurrent || index === 0 ? getOptimizedImageUrl(image.image_url, 400) : ''}
                    data-src={image.image_url}
                    srcSet={`
                      ${getOptimizedImageUrl(image.image_url, 400)} 400w,
                      ${getOptimizedImageUrl(image.image_url, 800)} 800w,
                      ${getOptimizedImageUrl(image.image_url, 1024)} 1024w,
                      ${getOptimizedImageUrl(image.image_url, 1536)} 1536w,
                      ${getOptimizedImageUrl(image.image_url, 1920)} 1920w
                    `}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 50vw"
                    alt={image.title}
                    className="w-full h-full object-cover carousel-image"
                    loading={isCurrent || index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={index === 0 ? "high" : "auto"}
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
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Testimonials section replacing the previous service cards */}
        <div className="mt-12 sm:mt-16 lg:mt-20" ref={testimonialsRef}>
          <h2 className="text-xl sm:text-2xl font-bold text-center text-[#1C3D5A] mb-6 sm:mb-8">What Our Clients Say</h2>
          {testimonialsVisible && testimonials.length > 0 ? (
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
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 640px) 40px, 48px"
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
          ) : testimonialsVisible ? (
            <div className="text-center py-6 sm:py-8 bg-white/30 backdrop-blur-sm rounded-xl border border-white/20">
              <Quote className="mx-auto text-[#1C3D5A]/50 mb-3 sm:mb-4" size={24} />
              <p className="text-[#1C3D5A]/80 text-sm sm:text-base">No testimonials available yet.</p>
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 bg-white/30 backdrop-blur-sm rounded-xl border border-white/20">
              <Quote className="mx-auto text-[#1C3D5A]/50 mb-3 sm:mb-4" size={24} />
              <p className="text-[#1C3D5A]/80 text-sm sm:text-base">Loading testimonials...</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}