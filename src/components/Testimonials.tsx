import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import {
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
  MessageSquarePlus,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function Testimonials({
  onShowTestimonialForm
}: {
  onShowTestimonialForm: () => void;
}) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (testimonials.length > 1) startCarousel();
    return () => stopCarousel();
  }, [testimonials]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (err) {
      console.error('Failed to load testimonials', err);
    } finally {
      setLoading(false);
    }
  };

  const startCarousel = () => {
    stopCarousel();
    intervalRef.current = setInterval(() => {
      navigate(1);
    }, 9000);
  };

  const stopCarousel = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const navigate = (dir: number) => {
    setDirection(dir);
    setCurrentIndex((prev) => {
      if (dir === 1) return (prev + 1) % testimonials.length;
      return prev === 0 ? testimonials.length - 1 : prev - 1;
    });
  };

  // Variants optimized for mobile (smaller x-offset to prevent horizontal scroll issues)
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 animate-pulse">
          <div className="h-8 w-48 bg-slate-200 rounded mb-6 mx-auto" />
          <div className="h-64 bg-slate-100 rounded-3xl" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-20">
          <span className="text-indigo-600 text-[10px] md:text-xs font-black tracking-[0.25em] uppercase">
            Client Testimonials
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-4 mb-4 md:mb-6 tracking-tight">
            Trusted by Organizations
          </h2>
          <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto">
            Our clients trust us to deliver secure, reliable, and impactful
            digital solutions.
          </p>
        </div>

        {testimonials.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl py-12 md:py-20 text-center px-6">
            <User size={40} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No testimonials yet</h3>
            <button
              onClick={onShowTestimonialForm}
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
            >
              <MessageSquarePlus size={18} />
              Submit Testimonial
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* Testimonial Card Container - Height is dynamic for mobile content */}
            <div className="relative min-h-[400px] md:min-h-[320px] flex items-center">
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={(_, info) => {
                    if (info.offset.x > 100) navigate(-1);
                    else if (info.offset.x < -100) navigate(1);
                  }}
                  className="w-full cursor-grab active:cursor-grabbing"
                >
                  <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 md:p-10 shadow-sm">
                    <Quote className="absolute top-4 right-4 md:top-6 md:right-6 text-indigo-100 w-10 h-10 md:w-12 md:h-12" />

                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < testimonials[currentIndex].rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                        />
                      ))}
                    </div>

                    <p className="text-slate-700 text-base md:text-lg leading-relaxed italic mb-8">
                      “{testimonials[currentIndex].content}”
                    </p>

                    <div className="flex items-center gap-3 md:gap-4">
                      <img
                        src={testimonials[currentIndex].avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonials[currentIndex].name)}&background=4f46e5&color=fff`}
                        alt={testimonials[currentIndex].name}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border border-white shadow"
                      />
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-900 truncate">
                          {testimonials[currentIndex].name}
                        </p>
                        <p className="text-xs md:text-sm text-slate-500 truncate">
                          {testimonials[currentIndex].role && `${testimonials[currentIndex].role}, `}
                          <span className="text-indigo-600 font-medium">
                            {testimonials[currentIndex].company}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Pagination Dots (Crucial for Mobile UX) */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
                  className={`h-1.5 rounded-full transition-all ${i === currentIndex ? 'w-6 bg-indigo-600' : 'w-1.5 bg-slate-300'}`}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between mt-8 gap-6">
              <button
                onClick={onShowTestimonialForm}
                className="order-2 md:order-1 text-slate-500 hover:text-indigo-600 font-bold text-sm flex items-center gap-2 transition"
              >
                <MessageSquarePlus size={18} />
                Share your experience
              </button>

              <div className="order-1 md:order-2 flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-3 md:p-2 rounded-full border border-slate-200 hover:bg-slate-900 hover:text-white transition bg-white shadow-sm"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  onClick={() => navigate(1)}
                  className="p-3 md:p-2 rounded-full border border-slate-200 hover:bg-slate-900 hover:text-white transition bg-white shadow-sm"
                  aria-label="Next testimonial"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}