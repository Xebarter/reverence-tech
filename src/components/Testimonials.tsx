import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Star, Quote, ChevronLeft, ChevronRight, MessageSquarePlus, User } from 'lucide-react';
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

export default function Testimonials({ onShowTestimonialForm }: { onShowTestimonialForm: () => void }) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // For Framer Motion slide direction
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (testimonials.length > 1) {
      startCarousel();
    }
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
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const startCarousel = () => {
    stopCarousel();
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000);
  };

  const stopCarousel = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleNavigate = (newDirection: number) => {
    stopCarousel();
    setDirection(newDirection);
    if (newDirection === 1) {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    } else {
      setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    }
    startCarousel();
  };

  const goToTestimonial = (index: number) => {
    stopCarousel();
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    startCarousel();
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  if (loading) {
    return (
      <section className="py-24 bg-white flex justify-center">
        <div className="w-full max-w-4xl px-4">
          <div className="h-10 w-48 bg-slate-100 animate-pulse rounded-lg mx-auto mb-4" />
          <div className="h-64 w-full bg-slate-50 animate-pulse rounded-[2rem]" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
      {/* Abstract background Trust Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-[0.03]">
        <svg width="100%" height="100%"><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" /></pattern><rect width="100%" height="100%" fill="url(#grid)" /></svg>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-indigo-600 font-black tracking-[0.2em] text-xs uppercase mb-4 block"
          >
            Success Stories
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight"
          >
            Voices of <span className="text-indigo-600">Trust</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-500 max-w-2xl mx-auto"
          >
            We pride ourselves on delivering excellence. Here is what our partners across East Africa have to say about our impact.
          </motion.p>
        </div>

        {testimonials.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <User className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-xl font-bold text-slate-900">Be the first to share!</h3>
            <p className="text-slate-500 mb-8">We value your feedback and partnership.</p>
            <button
              onClick={onShowTestimonialForm}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 mx-auto"
            >
              <MessageSquarePlus size={20} /> Submit Testimonial
            </button>
          </div>
        ) : (
          <div className="relative group">
            <div className="relative h-[450px] sm:h-[380px] md:h-[320px]">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.4 } }}
                  className="absolute inset-0"
                >
                  <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm h-full flex flex-col justify-center">
                    <Quote className="text-indigo-200 absolute top-8 right-12" size={80} strokeWidth={1} />

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg ring-1 ring-slate-200">
                          <img
                            src={testimonials[currentIndex].avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonials[currentIndex].name)}&background=4f46e5&color=fff`}
                            alt={testimonials[currentIndex].name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-amber-400 p-1.5 rounded-full shadow-md">
                          <Star size={14} className="fill-slate-900 text-slate-900" />
                        </div>
                      </div>

                      <div className="flex-1 text-center md:text-left">
                        <div className="flex justify-center md:justify-start gap-1 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={18}
                              className={i < testimonials[currentIndex].rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                            />
                          ))}
                        </div>

                        <p className="text-xl md:text-2xl text-slate-700 font-medium italic leading-relaxed mb-6">
                          "{testimonials[currentIndex].content}"
                        </p>

                        <div>
                          <h4 className="text-lg font-black text-slate-900">{testimonials[currentIndex].name}</h4>
                          <p className="text-slate-500 font-medium">
                            {testimonials[currentIndex].role && `${testimonials[currentIndex].role} @ `}
                            <span className="text-indigo-600 font-bold">{testimonials[currentIndex].company}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-12 gap-8">
              <button
                onClick={onShowTestimonialForm}
                className="order-2 sm:order-1 text-slate-500 hover:text-indigo-600 font-bold text-sm flex items-center gap-2 transition-colors"
              >
                <MessageSquarePlus size={18} /> Add Your Own Story
              </button>

              <div className="order-1 sm:order-2 flex items-center gap-4">
                <button
                  onClick={() => handleNavigate(-1)}
                  className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                  aria-label="Previous"
                >
                  <ChevronLeft size={24} />
                </button>

                <div className="flex gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToTestimonial(index)}
                      className={`h-2 transition-all duration-300 rounded-full ${index === currentIndex ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200 hover:bg-slate-300'
                        }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => handleNavigate(1)}
                  className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                  aria-label="Next"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}