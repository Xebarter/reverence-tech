import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Star, Quote } from 'lucide-react';

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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (testimonials.length > 1) {
      startCarousel();
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
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
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % testimonials.length);
    }, 7000); // Change testimonial every 7 seconds
  };

  const goToPrevious = () => {
    setCurrentIndex(prevIndex => (prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      startCarousel();
    }
  };

  const goToNext = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % testimonials.length);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      startCarousel();
    }
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      startCarousel();
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const handleSubmitTestimonial = () => {
    // Call the parent function to show the testimonial form
    onShowTestimonialForm();
  };

  if (loading) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
          
          <div className="overflow-hidden">
            <div className="bg-gray-50 rounded-xl p-8 h-80">
              <div className="animate-pulse">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gray-200"></div>
                  <div className="ml-6">
                    <div className="h-6 bg-gray-200 rounded w-32 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#1C3D5A] mb-4">
            Client <span className="text-[#2DBE7E]">Testimonials</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Hear what our clients have to say about working with us
          </p>
          
          <button
            onClick={handleSubmitTestimonial}
            className="mt-6 px-6 py-3 bg-[#1C3D5A] text-white rounded-lg hover:bg-[#143040] transition-colors duration-300 font-semibold inline-flex items-center"
          >
            Submit Your Testimonial
          </button>
        </div>

        {testimonials.length === 0 ? (
          <div className="text-center py-12">
            <Quote className="mx-auto text-gray-300" size={48} />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No testimonials yet</h3>
            <p className="mt-1 text-gray-500">Be the first to share your experience with us.</p>
            <button
              onClick={handleSubmitTestimonial}
              className="mt-4 px-4 py-2 bg-[#F2B134] text-white rounded-md hover:bg-[#d89e2d] transition-colors"
            >
              Share Your Experience
            </button>
          </div>
        ) : (
          <div className="relative overflow-hidden">
            {/* Carousel container */}
            <div 
              className="flex transition-transform duration-1000 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id} 
                  className="w-full flex-shrink-0 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 shadow-lg border border-gray-200"
                  style={{ minWidth: '100%' }}
                >
                  <div className="flex flex-col md:flex-row md:items-center mb-6">
                    <div className="flex items-center">
                      <img
                        src={testimonial.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=2DBE7E&color=fff`}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=2DBE7E&color=fff`;
                        }}
                      />
                      <div className="ml-6">
                        <h3 className="text-xl font-bold text-gray-900">{testimonial.name}</h3>
                        <p className="text-gray-600">{testimonial.role ? `${testimonial.role}, ` : ''}{testimonial.company}</p>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-auto">
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-3">Rating:</span>
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-gray-700 text-lg italic leading-relaxed">"{testimonial.content}"</p>
                  </div>
                  
                  <div className="text-gray-500 text-right">
                    <span>
                      {new Date(testimonial.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation arrows */}
            {testimonials.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all duration-300 focus:outline-none"
                  aria-label="Previous testimonial"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={goToNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all duration-300 focus:outline-none"
                  aria-label="Next testimonial"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Dots indicator */}
            {testimonials.length > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex ? 'bg-[#1C3D5A] w-6' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}