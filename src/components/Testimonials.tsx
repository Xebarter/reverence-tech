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
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 9000);
  };

  const stopCarousel = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const navigate = (dir: number) => {
    stopCarousel();
    setDirection(dir);
    setCurrentIndex((prev) =>
      dir === 1
        ? (prev + 1) % testimonials.length
        : prev === 0
          ? testimonials.length - 1
          : prev - 1
    );
    startCarousel();
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir < 0 ? 120 : -120,
      opacity: 0
    })
  };

  if (loading) {
    return (
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 animate-pulse">
          <div className="h-8 w-48 bg-slate-200 rounded mb-6 mx-auto" />
          <div className="h-48 bg-slate-100 rounded-3xl" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="text-indigo-600 text-xs font-black tracking-[0.25em] uppercase">
            Client Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mt-4 mb-6 tracking-tight">
            Trusted by Organizations Across the Region
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Our clients trust us to deliver secure, reliable, and impactful
            digital solutions. Here is what they say.
          </p>
        </div>

        {/* Empty State */}
        {testimonials.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl py-20 text-center">
            <User size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No testimonials yet
            </h3>
            <p className="text-slate-500 mb-8">
              Be the first to share your experience working with us.
            </p>
            <button
              onClick={onShowTestimonialForm}
              className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
            >
              <MessageSquarePlus size={18} />
              Submit Testimonial
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* Testimonial Card */}
            <div className="relative h-[260px]">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="absolute inset-0"
                >
                  <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 md:p-10 shadow-sm h-full flex flex-col justify-between">
                    <Quote className="absolute top-6 right-6 text-indigo-100" size={48} />

                    <div>
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={
                              i < testimonials[currentIndex].rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }
                          />
                        ))}
                      </div>

                      <p className="text-slate-700 text-lg leading-relaxed italic mb-8">
                        “{testimonials[currentIndex].content}”
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <img
                        src={
                          testimonials[currentIndex].avatar_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            testimonials[currentIndex].name
                          )}&background=4f46e5&color=fff`
                        }
                        alt={testimonials[currentIndex].name}
                        className="w-14 h-14 rounded-full object-cover border border-white shadow"
                      />
                      <div>
                        <p className="font-bold text-slate-900">
                          {testimonials[currentIndex].name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {testimonials[currentIndex].role &&
                            `${testimonials[currentIndex].role}, `}
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

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-10 gap-6">
              <button
                onClick={onShowTestimonialForm}
                className="text-slate-500 hover:text-indigo-600 font-bold text-sm flex items-center gap-2 transition"
              >
                <MessageSquarePlus size={18} />
                Share your experience
              </button>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 rounded-full border border-slate-200 hover:bg-slate-900 hover:text-white transition"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  onClick={() => navigate(1)}
                  className="p-2 rounded-full border border-slate-200 hover:bg-slate-900 hover:text-white transition"
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
