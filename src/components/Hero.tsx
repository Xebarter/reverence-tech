import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Star, CheckCircle2, Rocket } from 'lucide-react';
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
  const [testimonialsVisible, setTestimonialsVisible] = useState(false);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  const valuePropositions = [
    {
      valueProposition: 'Reliable digital solutions built for long-term growth.',
      copy:
        'We design and engineer websites, applications, and systems that strengthen credibility, improve efficiency, and support sustainable business expansion.'
    },
    {
      valueProposition: 'From strategy to execution — delivered with precision.',
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
        .limit(3);

      if (error) throw error;
      setTestimonials(data || []);
    } catch {
      setTestimonials([]);
    }
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
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setTestimonialsVisible(true),
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
      className="relative pt-28 pb-24 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100"
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

              <div className="absolute bottom-5 left-5 right-5 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-600 text-white">
                    <Rocket size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                      Proven Capability
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      Delivering dependable digital outcomes
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* TESTIMONIALS */}
        <div className="mt-28" ref={testimonialsRef}>
          <h2 className="text-center text-sm font-semibold text-slate-500 uppercase tracking-[0.25em] mb-14">
            Client Feedback
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={testimonialsVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.12 }}
                className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                <p className="text-slate-600 italic leading-relaxed mb-8">
                  “{t.content}”
                </p>

                <div className="flex items-center gap-4">
                  <img
                    src={
                      t.avatar_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        t.name
                      )}&background=6366F1&color=fff`
                    }
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                    alt={t.name}
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {t.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t.role}
                      {t.role && ', '}
                      {t.company}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
