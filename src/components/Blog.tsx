import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, User, ArrowRight, BookOpen, Search, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from './SEO';
import { supabase } from '../lib/supabase';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string | null;
  author: string;
  published_at: string;
  category: { name: string; slug: string } | null;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select(`
            id, title, slug, excerpt, cover_image_url, author, published_at,
            category:blog_categories(name, slug)
          `)
          .eq('is_published', true)
          .order('published_at', { ascending: false });

        if (error) throw error;
        setPosts(data.map((p: any) => ({
          ...p,
          category: Array.isArray(p.category) ? p.category[0] : p.category
        })));
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const SkeletonCard = () => (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 animate-pulse">
      <div className="bg-slate-200 h-52 rounded-2xl mb-4" />
      <div className="h-4 bg-slate-200 rounded w-1/4 mb-4" />
      <div className="h-6 bg-slate-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-slate-200 rounded w-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <SEO title="Insights & News | Reverence Technology" />

      {/* Hero Header */}
      <header className="relative bg-[#1C3D5A] pt-32 pb-40 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-yellow-400/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-black uppercase tracking-[0.2em] mb-6">
              <BookOpen size={14} /> The Reverence Blog
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
              Insights for the <span className="text-yellow-400">Digital Frontier</span>
            </h1>
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Expert perspectives on technology, innovation, and business growth in the East African landscape.
            </p>
          </motion.div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center shadow-xl shadow-slate-200/50">
            <Search className="mx-auto text-slate-200 mb-6" size={64} />
            <h3 className="text-2xl font-bold text-slate-800">No stories found yet</h3>
            <p className="text-slate-500">We're currently drafting some amazing content. Stay tuned!</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Post */}
            {posts[0] && (
              <motion.article
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-900/5 border border-slate-100 flex flex-col lg:flex-row"
              >
                <div className="lg:w-3/5 h-[400px] lg:h-auto overflow-hidden">
                  {posts[0].cover_image_url ? (
                    <img src={posts[0].cover_image_url} alt={posts[0].title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300"><BookOpen size={48} /></div>
                  )}
                </div>
                <div className="lg:w-2/5 p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                      {posts[0].category?.name || 'Featured'}
                    </span>
                    <span className="text-slate-400 text-xs flex items-center gap-1 font-medium">
                      <Calendar size={14} /> {format(new Date(posts[0].published_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <h2 className="text-3xl font-black text-[#1C3D5A] mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                    <Link to={`/blog/${posts[0].slug}`}>{posts[0].title}</Link>
                  </h2>
                  <p className="text-slate-600 mb-8 line-clamp-3 leading-relaxed">
                    {posts[0].excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#1C3D5A]">
                      <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-xs">
                        {posts[0].author[0]}
                      </div>
                      {posts[0].author}
                    </div>
                    <Link to={`/blog/${posts[0].slug}`} className="text-blue-600 font-black text-sm flex items-center gap-1 group/btn">
                      Read Article <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            )}

            {/* Post Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.slice(1).map((post, idx) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
                >
                  <div className="h-52 overflow-hidden relative">
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-3 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[#1C3D5A] text-[10px] font-black uppercase tracking-widest shadow-sm">
                        {post.category?.name || 'Insight'}
                      </span>
                    </div>
                    {post.cover_image_url ? (
                      <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200"><Tag size={32} /></div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase mb-3">
                      <Calendar size={12} /> {format(new Date(post.published_at), 'MMM d, yyyy')}
                    </div>
                    <h3 className="text-xl font-bold text-[#1C3D5A] mb-3 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed italic">
                      "{post.excerpt}"
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        <User size={12} /> {post.author}
                      </span>
                      <Link to={`/blog/${post.slug}`} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[#1C3D5A] group-hover:bg-yellow-400 transition-colors">
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}