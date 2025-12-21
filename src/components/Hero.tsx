import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Star, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

/* ---------------- IMAGE OPTIMIZATION HELPERS ---------------- */
const getOptimizedImageUrl = (url: string, width: number): string => {
  if (!url) return url;
  const quality = width < 600 ? 70 : 80;
  if (url.includes('unsplash.com')) {
    return `${url}&w=${width}&q=${quality}&auto=format&fit=crop&fm=webp`;
  }
  if (url.includes('supabase.co')) {
    return `${url}?width=${width}&quality=${quality}&resize=cover&format=webp`;
  }
  return url;
};

/* ---------------- COMPONENT ---------------- */
export default function Hero() {
  const [heroImages, setHeroImages] = useState<any[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentValueIndex, setCurrentValueIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const valuePropositions = [
    {
      valueProposition: 'Reliable digital solutions built for long-term growth.',
      copy:
        'We design and engineer websites, applications, and systems that strengthen credibility, improve efficiency, and support sustainable business expansion.'
    },
    {
      valueProposition: 'From strategy to execution,  delivered with precision.',
      copy:
        'We translate ideas into robust digital products using modern technology, clear processes, and proven development standards.'
    },
    {
      valueProposition: 'Your website is a business asset, not just a presence.',
      copy:
        'We create professional, high-performing websites that build trust, convert users, and represent your organization with confidence.'
    }
  ];

  /* ---------------- DATA FETCHING ---------------- */
  const fetchHeroImages = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data?.length) {
        setHeroImages(data.filter((d: any) => d.image_url?.trim()));
      }
    } catch {
      setHeroImages([
        {
          id: 'fallback',
          image_url:
            'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=2000&q=80',
          title: 'Default'
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
        .limit(10); // Get more testimonials for carousel

      if (error) throw error;
      setTestimonials(data || []);
    } catch {
      setTestimonials([]);
    }
  };

  /* ---------------- CAROUSEL FUNCTIONS ---------------- */
  const startTestimonialCarousel = () => {
    stopTestimonialCarousel();
    intervalRef.current = setInterval(() => {
      setCurrentTestimonialIndex(prev => (prev + 1) % testimonials.length);
    }, 7000); // Rotate every 7 seconds
  };

  const stopTestimonialCarousel = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleTestimonialNavigate = (direction: number) => {
    stopTestimonialCarousel();
    if (direction === 1) {
      setCurrentTestimonialIndex(prev => (prev + 1) % testimonials.length);
    } else {
      setCurrentTestimonialIndex(prev => (prev === 0 ? testimonials.length - 1 : prev - 1));
    }
    startTestimonialCarousel();
  };

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    fetchHeroImages();
    fetchTestimonials();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (heroImages.length > 0) {
        setCurrentImageIndex(prev => (prev + 1) % heroImages.length);
      }
      setCurrentValueIndex(prev => (prev + 1) % valuePropositions.length);
    }, 6500);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  useEffect(() => {
    if (testimonials.length > 1) {
      startTestimonialCarousel();
    }
    return () => stopTestimonialCarousel();
  }, [testimonials]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting,
      { threshold: 0.15 }
    );

    if (testimonialsRef.current) observer.observe(testimonialsRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  /* ---------------- RENDER ---------------- */
  return (
    <section
      id="home"
      className="relative pt-40 pb-24 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100"
    >
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-indigo-100/40 blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[420px] h-[420px] rounded-full bg-slate-200/50 blur-[160px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
          {/* LEFT: CONTENT */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-sm font-medium shadow-sm"
            >
              <CheckCircle2 size={16} className="text-indigo-600" />
              Trusted Digital Solutions Partner
            </motion.div>

            <div className="min-h-[260px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentValueIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                >
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
                    {valuePropositions[currentValueIndex].valueProposition}
                  </h1>
                  <p className="mt-6 text-lg text-slate-600 max-w-xl leading-relaxed">
                    {valuePropositions[currentValueIndex].copy}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => scrollToSection('services')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg shadow-md transition"
              >
                Request a Quote <ArrowRight size={20} />
              </button>

              <button
                onClick={() => scrollToSection('contact')}
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-lg hover:bg-slate-50 transition"
              >
                Contact Us
              </button>
            </div>
          </div>

          {/* RIGHT: IMAGE */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-slate-200 shadow-2xl border border-slate-200"
            >
              <AnimatePresence mode="wait">
                {heroImages.length > 0 && (
                  <motion.img
                    key={heroImages[currentImageIndex].id}
                    src={getOptimizedImageUrl(
                      heroImages[currentImageIndex].image_url,
                      900
                    )}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="Professional digital solutions"
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* TESTIMONIALS CAROUSEL */}
        <div className="mt-28" ref={testimonialsRef}>
          <h2 className="text-center text-sm font-semibold text-slate-500 uppercase tracking-[0.25em] mb-14">
            Client Feedback
          </h2>

          {testimonials.length > 0 ? (
            <div className="relative group">
              <div className="relative h-[180px]"> {/* Reduced height for thinner cards */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTestimonialIndex}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-full flex items-center">
                      <div className="flex items-center gap-6 w-full">
                        <div className="relative flex-shrink-0">
                          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow ring-1 ring-slate-200">
                            <img
                              src={
                                testimonials[currentTestimonialIndex].avatar_url ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  testimonials[currentTestimonialIndex].name
                                )}&background=6366F1&color=fff`
                              }
                              className="w-full h-full object-cover"
                              alt={testimonials[currentTestimonialIndex].name}
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-amber-400 p-1 rounded-full shadow-sm">
                            <Star size={10} className="fill-slate-900 text-slate-900" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={
                                  i < testimonials[currentTestimonialIndex].rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-200"
                                }
                              />
                            ))}
                          </div>

                          <p className="text-slate-600 italic leading-relaxed mb-3 line-clamp-2">
                            "{testimonials[currentTestimonialIndex].content}"
                          </p>

                          <div>
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {testimonials[currentTestimonialIndex].name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {testimonials[currentTestimonialIndex].role}
                              {testimonials[currentTestimonialIndex].role && ', '}
                              <span className="text-indigo-600 font-medium">
                                {testimonials[currentTestimonialIndex].company}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between mt-6">
                <div className="flex gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        stopTestimonialCarousel();
                        setCurrentTestimonialIndex(index);
                        startTestimonialCarousel();
                      }}
                      className={`h-1.5 transition-all duration-300 rounded-full ${index === currentTestimonialIndex
                        ? 'w-6 bg-indigo-600'
                        : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                        }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleTestimonialNavigate(-1)}
                    className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => handleTestimonialNavigate(1)}
                    className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={16} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <div className="h-20 bg-slate-100 rounded mb-8 animate-pulse" />
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 animate-pulse" />
                    <div>
                      <div className="h-4 bg-slate-200 rounded w-24 mb-2 animate-pulse" />
                      <div className="h-3 bg-slate-100 rounded w-16 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}