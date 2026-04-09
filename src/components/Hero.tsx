import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Star, ChevronLeft, ChevronRight, Shield, Award, Users, BadgeCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

/* ---------------- IMAGE OPTIMIZATION HELPERS ---------------- */
const withSearchParams = (rawUrl: string, params: Record<string, string | number>) => {
  try {
    const u = new URL(rawUrl);
    Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, String(v)));
    return u.toString();
  } catch {
    return rawUrl;
  }
};

const getOptimizedImageUrl = (url: string, width: number): string => {
  if (!url) return url;
  const quality = width < 600 ? 70 : 80;

  if (url.includes('unsplash.com')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=${width}&q=${quality}&auto=format&fit=crop&fm=webp`;
  }

  // Supabase Storage public (or signed) URLs should use the render endpoint for transforms.
  // Many hero images are stored as: /storage/v1/object/public/<bucket>/<path>
  // Transform endpoint:        /storage/v1/render/image/public/<bucket>/<path>
  if (url.includes('/storage/v1/object/')) {
    try {
      const u = new URL(url);
      u.pathname = u.pathname.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
      u.pathname = u.pathname.replace('/storage/v1/object/sign/', '/storage/v1/render/image/sign/');
      return withSearchParams(u.toString(), { width, quality, resize: 'cover', format: 'webp' });
    } catch {
      return url;
    }
  }

  // Fallback: don't try to transform unknown URLs.
  return url;
};

type HeroImage = {
  id: string;
  image_url: string;
  title?: string | null;
  created_at?: string;
};

type Testimonial = {
  id: string;
  name: string;
  content: string;
  rating: number;
  avatar_url?: string | null;
  role?: string | null;
  company?: string | null;
  created_at?: string;
};

/* ---------------- COMPONENT ---------------- */
export default function Hero() {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /* ---------------- DATA FETCHING ---------------- */
  const fetchHeroImages = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_images')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      const cleaned = (data as HeroImage[] | null | undefined)?.filter((d) => d.image_url?.trim()) ?? [];
      if (cleaned.length) {
        setHeroImages(cleaned);
        return;
      }

      // If the table is reachable but has no active/valid images, still show a safe fallback.
      setHeroImages([
        {
          id: 'fallback',
          image_url:
            'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=2000&q=80',
          title: 'Default',
        },
      ]);
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
        .limit(10);

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
    }, 7000);
  };

  const stopTestimonialCarousel = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleTestimonialNavigate = (direction: number) => {
    stopTestimonialCarousel();
    if (direction === 1) {
      setCurrentTestimonialIndex(prev => (prev + 1) % testimonials.length);
    } else {
      setCurrentTestimonialIndex(prev =>
        prev === 0 ? testimonials.length - 1 : prev - 1
      );
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
    }, 6500);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  useEffect(() => {
    if (testimonials.length > 1) startTestimonialCarousel();
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

  const stats = [
    { value: '5+', label: 'Years Experience', icon: Award },
    { value: '75+', label: 'Happy Clients', icon: Users },
    { value: '50+', label: 'Projects Delivered', icon: Shield },
  ];

  /* ---------------- RENDER ---------------- */
  return (
    <section id="home" className="relative overflow-hidden bg-[#1C3D5A]">

      {/* ── Subtle texture / grid overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Warm glow top-right */}
      <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-amber-400/10 blur-[120px] pointer-events-none" />
      {/* Cool glow bottom-left */}
      <div className="absolute bottom-0 -left-24 w-[400px] h-[400px] rounded-full bg-sky-400/10 blur-[100px] pointer-events-none" />

      {/* ═══════════════════════════════════════════
          MAIN HERO GRID
      ═══════════════════════════════════════════ */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-44 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* ── LEFT: COPY ── */}
          <div className="space-y-8">

            {/* Location badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-amber-300 text-sm font-semibold backdrop-blur-sm"
            >
              <BadgeCheck size={15} />
              🇺🇬 Kampala, Uganda &nbsp;·&nbsp; Serving East Africa
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="text-4xl sm:text-5xl xl:text-[3.4rem] font-black text-white leading-[1.1] tracking-tight">
                Build Your Digital&nbsp;
                <span className="text-amber-400 relative">
                  Future
                  <svg
                    className="absolute -bottom-1 left-0 w-full"
                    viewBox="0 0 200 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 6 Q50 2 100 5 Q150 8 198 4"
                      stroke="#FCD34D"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </span>
                &nbsp;with Uganda's Leading Tech Partner
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
                We craft high-performance websites, mobile apps, and custom software that help businesses across East Africa grow faster and compete smarter.
              </p>
            </motion.div>

            {/* Trust signals row */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap gap-3"
            >
              {stats.map(({ value, label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/8 border border-white/15 backdrop-blur-sm"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                >
                  <div className="p-2 rounded-lg bg-amber-400/20 text-amber-300">
                    <Icon size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="text-lg font-black text-white leading-none">{value}</div>
                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">{label}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 pt-2"
            >
              <button
                onClick={() => scrollToSection('services')}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#1C3D5A] font-black text-base shadow-lg shadow-amber-400/25 transition-all duration-300 hover:shadow-xl hover:shadow-amber-400/30 active:scale-[0.98]"
              >
                Get a Free Quote
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-white/25 text-white font-bold text-base hover:bg-white/10 hover:border-white/40 transition-all duration-300 active:scale-[0.98]"
              >
                Talk to Us
              </button>
            </motion.div>
          </div>

          {/* ── RIGHT: IMAGE ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            className="relative w-full max-w-md mx-auto mt-12 lg:mt-0 lg:max-w-none"
          >
            {/* Decorative ring */}
            <div className="absolute -inset-4 rounded-[2.5rem] border border-white/10 pointer-events-none" />
            <div className="absolute -inset-8 rounded-[3rem] border border-white/5 pointer-events-none" />

            {/* Main image frame */}
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-[#152f45] shadow-2xl ring-1 ring-white/10">
              <AnimatePresence mode="wait">
                {heroImages.length > 0 && (
                  <motion.img
                    key={heroImages[currentImageIndex].id}
                    src={getOptimizedImageUrl(heroImages[currentImageIndex].image_url, 900)}
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: 'easeInOut' }}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="Web design and software development in Kampala Uganda – Reverence Technology"
                    onError={(e) => {
                      const img = e.currentTarget;
                      const fallback =
                        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=2000&q=80';
                      if (img.src !== fallback) img.src = fallback;
                    }}
                  />
                )}
              </AnimatePresence>
              {/* Gradient overlay for readability of floating card */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1d2c]/80 via-transparent to-transparent pointer-events-none" />

              {/* Floating verified badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, type: 'spring', bounce: 0.4 }}
                className="absolute top-5 right-5 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-sm shadow-lg"
              >
                <BadgeCheck size={16} className="text-emerald-500" />
                <span className="text-xs font-bold text-slate-800">Verified Partner</span>
              </motion.div>

              {/* Floating stat row at bottom */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6, type: 'spring', bounce: 0.3 }}
                className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-xl rounded-xl p-4 shadow-xl"
              >
                <div className="flex items-center justify-around">
                  {[
                    { n: '5+', l: 'Years' },
                    { n: '75+', l: 'Clients' },
                    { n: '50+', l: 'Projects' },
                  ].map(({ n, l }, i) => (
                    <div key={l} className={`flex-1 text-center ${i < 2 ? 'border-r border-slate-100' : ''}`}>
                      <div className="text-2xl font-black text-[#1C3D5A]">{n}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{l}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          TESTIMONIALS STRIP  (white band)
      ═══════════════════════════════════════════ */}
      <div className="relative z-10 bg-white" ref={testimonialsRef}>
        {testimonials.length > 0 && (
          <div className="max-w-4xl mx-auto px-6 py-12">
            <p className="text-center text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 mb-8">
              What our clients say
            </p>

            <div className="relative">
              <div className="relative h-[160px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTestimonialIndex}
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -60 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0 flex items-center"
                  >
                    <div className="flex items-start gap-6 w-full">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-slate-100 shadow-sm">
                          <img
                            src={
                              testimonials[currentTestimonialIndex].avatar_url ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                testimonials[currentTestimonialIndex].name
                              )}&background=1C3D5A&color=fff`
                            }
                            className="w-full h-full object-cover"
                            alt={testimonials[currentTestimonialIndex].name}
                          />
                        </div>
                        <div className="absolute -bottom-1.5 -right-1.5 bg-amber-400 p-1 rounded-md shadow">
                          <Star size={9} className="fill-white text-white" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Stars */}
                        <div className="flex gap-0.5 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={13}
                              className={
                                i < testimonials[currentTestimonialIndex].rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-200 fill-slate-200'
                              }
                            />
                          ))}
                        </div>
                        <p className="text-slate-700 leading-relaxed line-clamp-2 text-base italic mb-3">
                          "{testimonials[currentTestimonialIndex].content}"
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900">
                            {testimonials[currentTestimonialIndex].name}
                          </p>
                          {(testimonials[currentTestimonialIndex].role || testimonials[currentTestimonialIndex].company) && (
                            <>
                              <span className="text-slate-300">·</span>
                              <p className="text-xs text-slate-500 truncate">
                                {testimonials[currentTestimonialIndex].role}
                                {testimonials[currentTestimonialIndex].role && testimonials[currentTestimonialIndex].company && ', '}
                                <span className="text-[#1C3D5A] font-semibold">
                                  {testimonials[currentTestimonialIndex].company}
                                </span>
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-1.5">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        stopTestimonialCarousel();
                        setCurrentTestimonialIndex(index);
                        startTestimonialCarousel();
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === currentTestimonialIndex
                          ? 'w-6 bg-[#1C3D5A]'
                          : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTestimonialNavigate(-1)}
                    className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-[#1C3D5A] hover:text-white hover:border-[#1C3D5A] transition-all"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    onClick={() => handleTestimonialNavigate(1)}
                    className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-[#1C3D5A] hover:text-white hover:border-[#1C3D5A] transition-all"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </section>
  );
}
