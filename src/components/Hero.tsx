import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Star, ChevronLeft, ChevronRight, Package, Shield, Award, Users, BadgeCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProductDetails from './ProductDetails';

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
  const navigate = useNavigate();
  const [heroImages, setHeroImages] = useState<any[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /* ---------------- SINGLE VALUE PROPOSITION ---------------- */
  const valueProposition = {
    headline: 'Leading Web Design & Software Development Company in Uganda',
    subheadline: 'Custom Websites, Mobile Apps & IT Solutions for East Africa',
    copy:
      'Professional web design, software development, and mobile app solutions in Kampala, Uganda. We help businesses across East Africa build powerful digital platforms that drive growth. 5+ years experience, 75+ satisfied clients.'
  };

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
        .limit(10);

      if (error) throw error;
      setTestimonials(data || []);
    } catch {
      setTestimonials([]);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('shop_products')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('display_order', { ascending: true })
        .limit(6);

      if (error) throw error;
      setFeaturedProducts(data || []);
    } catch {
      setFeaturedProducts([]);
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
    fetchFeaturedProducts();
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 text-slate-700 text-sm font-semibold shadow-sm backdrop-blur-sm"
            >
              <BadgeCheck size={16} className="text-indigo-600" />
              🇺🇬 Based in Kampala, Uganda | Serving East Africa
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                {valueProposition.headline}
              </h1>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {valueProposition.subheadline}
              </h2>
              <p className="text-lg lg:text-xl text-slate-600 max-w-2xl leading-relaxed font-medium">
                {valueProposition.copy}
              </p>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex flex-wrap items-center gap-4 pt-4"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                <Award className="text-amber-500" size={20} />
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">5+ Years</div>
                  <div className="text-sm font-bold text-slate-900">Experience</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                <Users className="text-indigo-500" size={20} />
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">75+ Clients</div>
                  <div className="text-sm font-bold text-slate-900">Satisfied</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                <Shield className="text-emerald-500" size={20} />
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Trusted</div>
                  <div className="text-sm font-bold text-slate-900">Partner</div>
                </div>
              </div>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => scrollToSection('services')}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 transform hover:scale-105"
              >
                Request a Quote <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => scrollToSection('contact')}
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-slate-300 bg-white text-slate-700 font-bold text-lg hover:bg-slate-50 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Contact Us
              </button>
            </div>
          </div>

          {/* RIGHT: IMAGE */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 shadow-2xl shadow-indigo-500/20 border-2 border-white/50"
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
                    alt="Web design and software development company in Kampala Uganda - Reverence Technology"
                  />
                )}
              </AnimatePresence>
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent pointer-events-none" />
            </motion.div>
            {/* Floating stats card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="absolute -bottom-6 left-0 right-0 mx-auto w-11/12 bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-slate-200/50"
            >
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-extrabold text-slate-900">5+</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Years</div>
                </div>
                <div className="border-x border-slate-200">
                  <div className="text-2xl font-extrabold text-slate-900">75+</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Clients</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-900">50+</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Projects</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* FEATURED PRODUCTS SECTION */}
        {featuredProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-20"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-4">
                <Package size={16} />
                Featured Products
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                Shop Our Latest Computers & Accessories
              </h2>
              <p className="text-slate-600">
                Quality hardware for your business and personal needs
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => handleProductClick(product)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    {product.image_url ? (
                      <img
                        src={getOptimizedImageUrl(product.image_url, 400)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Package size={48} />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-amber-400 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Star size={12} className="fill-white" />
                      Featured
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                        {product.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-bold text-indigo-600">
                        {formatPrice(product.price)}
                      </span>
                      {product.stock_quantity > 0 && (
                        <span className="text-xs text-green-600 font-medium">
                          In Stock
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-semibold text-sm">
                      Click to view details
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-8">
              <button
                onClick={() => navigate('/shop')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
              >
                View All Products <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {/* TESTIMONIALS CAROUSEL */}
        <div className="mt-28" ref={testimonialsRef}>
          <h2 className="text-center text-sm font-semibold text-slate-500 uppercase tracking-[0.25em] mb-14">
            Client Feedback
          </h2>

          {testimonials.length > 0 ? (
            <div className="relative group">
              <div className="relative h-[180px]">
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
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-200'
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
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleTestimonialNavigate(-1)}
                    className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => handleTestimonialNavigate(1)}
                    className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Product Details Modal */}
      <ProductDetails
        product={selectedProduct}
        isOpen={showProductDetails}
        onClose={() => {
          setShowProductDetails(false);
          setSelectedProduct(null);
        }}
      />

    </section>
  );
}
