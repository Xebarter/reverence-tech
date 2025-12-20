import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Share2, Bookmark, Clock, ChevronRight } from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';
import SEO from './SEO';
import { supabase } from '../lib/supabase';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Reading progress bar logic
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select(`*, category:blog_categories(name, slug)`)
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        if (error) throw error;
        setPost(data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 flex justify-center">
        <div className="max-w-3xl w-full px-6 space-y-8">
          <div className="h-4 w-24 bg-slate-100 animate-pulse rounded" />
          <div className="h-12 w-full bg-slate-100 animate-pulse rounded-xl" />
          <div className="h-96 w-full bg-slate-100 animate-pulse rounded-[2rem]" />
        </div>
      </div>
    );
  }

  if (!post) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-9xl font-black text-slate-200">404</h1>
        <p className="text-slate-500 mb-8 font-medium">Article vanished into the digital void.</p>
        <Link to="/blog" className="px-8 py-3 bg-[#1C3D5A] text-white rounded-xl font-bold">Return Home</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <SEO title={post.title} description={post.excerpt} ogType="article" />

      {/* Reading Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-yellow-400 z-[100] origin-left" style={{ scaleX }} />

      {/* Breadcrumbs & Navigation */}
      <nav className="fixed top-20 left-0 right-0 bg-white/80 backdrop-blur-md z-40 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/blog" className="flex items-center text-slate-500 hover:text-[#1C3D5A] font-bold text-sm transition-colors">
            <ArrowLeft size={16} className="mr-2" /> All Stories
          </Link>
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            Home <ChevronRight size={12} /> Blog <ChevronRight size={12} /> <span className="text-[#1C3D5A]">{post.category?.name}</span>
          </div>
        </div>
      </nav>

      <main className="pt-40 pb-24">
        <article className="max-w-4xl mx-auto px-6">

          {/* Header Section */}
          <header className="text-center mb-12">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest mb-6 inline-block">
                {post.category?.name || 'Perspective'}
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-[#1C3D5A] leading-[1.1] mb-8 tracking-tight">
                {post.title}
              </h1>

              <div className="flex items-center justify-center gap-6 text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-[#1C3D5A] font-black border-2 border-white shadow-sm">
                    {post.author[0]}
                  </div>
                  <span className="text-slate-900 font-bold">{post.author}</span>
                </div>
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <div className="flex items-center gap-1.5 text-sm">
                  <Calendar size={16} /> {format(new Date(post.published_at), 'MMM d, yyyy')}
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-sm">
                  <Clock size={16} /> 6 min read
                </div>
              </div>
            </motion.div>
          </header>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="relative mb-16"
          >
            {post.cover_image_url ? (
              <img
                src={post.cover_image_url}
                className="w-full h-[500px] object-cover rounded-[2.5rem] shadow-2xl"
                alt={post.title}
              />
            ) : (
              <div className="w-full h-[300px] bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200">
                <Bookmark size={64} />
              </div>
            )}
          </motion.div>

          {/* Post Content */}
          <div className="grid lg:grid-cols-[1fr_auto] gap-12 relative">

            {/* Sidebar Share (Desktop) */}
            <aside className="hidden lg:block sticky top-48 h-fit">
              <div className="flex flex-col gap-4">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-tighter mb-2">Share</div>
                <ShareButton platform="linkedin" />
                <ShareButton platform="twitter" />
                <ShareButton platform="whatsapp" />
              </div>
            </aside>

            {/* Main Rich Text */}
            <div className="prose prose-lg prose-slate max-w-none 
              prose-headings:font-black prose-headings:text-[#1C3D5A] 
              prose-p:text-slate-600 prose-p:leading-[1.8]
              prose-strong:text-[#1C3D5A] prose-strong:font-bold
              prose-img:rounded-3xl prose-img:shadow-xl
              prose-blockquote:border-l-4 prose-blockquote:border-yellow-400 prose-blockquote:bg-slate-50 prose-blockquote:py-2 prose-blockquote:rounded-r-2xl
              ">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
          </div>

          {/* Footer Card */}
          <footer className="mt-20 p-8 md:p-12 bg-[#F8FAFC] rounded-[3rem] border border-slate-100 flex flex-col md:flex-row items-center gap-8">
            <div className="shrink-0">
              <div className="w-24 h-24 rounded-full bg-yellow-400 flex items-center justify-center text-3xl font-black text-[#1C3D5A]">
                {post.author[0]}
              </div>
            </div>
            <div className="text-center md:text-left flex-1">
              <h4 className="text-xl font-black text-[#1C3D5A] mb-2">Written by {post.author}</h4>
              <p className="text-slate-600 leading-relaxed mb-4">
                Sharing insights from the frontlines of Reverence Technology. Focused on building digital solutions that drive progress in East Africa.
              </p>
              <div className="flex gap-4 justify-center md:justify-start">
                <Link to="/blog" className="text-blue-600 font-bold text-sm hover:underline">More from this author</Link>
              </div>
            </div>
          </footer>
        </article>
      </main>
    </div>
  );
}

// Simple internal component for the sidebar
function ShareButton({ platform }: { platform: string }) {
  const icons: any = {
    linkedin: <Share2 size={18} />,
    twitter: <span className="font-bold text-xs">X</span>,
    whatsapp: <span className="font-bold text-xs">WA</span>
  };

  return (
    <button className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-[#1C3D5A] hover:text-white hover:border-[#1C3D5A] transition-all">
      {icons[platform]}
    </button>
  );
}