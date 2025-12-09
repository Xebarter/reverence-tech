import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
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
  created_at: string;
  category?: {
    name: string;
    slug: string;
  } | null;
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
            id,
            title,
            slug,
            excerpt,
            cover_image_url,
            author,
            published_at,
            created_at,
            category:blog_categories(name, slug)
          `)
          .eq('is_published', true)
          .order('published_at', { ascending: false });

        if (error) throw error;
        
        // Process the data to ensure it matches our BlogPost interface
        const processedData = (data || []).map((post: any) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          cover_image_url: post.cover_image_url,
          author: post.author,
          published_at: post.published_at,
          created_at: post.created_at,
          category: post.category ? {
            name: post.category.name,
            slug: post.category.slug
          } : null
        }));
        
        setPosts(processedData);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden pt-20">
        {/* Background gradient */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#f2b134] to-[#4B0082] opacity-20"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Loading Blog Posts...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f2b134] to-[#4B0082] opacity-20"></div>
      </div>
      <SEO
        title="Blog"
        description="Latest insights and news from Reverence Technology about technology, digital innovation, and business transformation in East Africa."
        keywords="technology blog, digital innovation, East Africa, Uganda, web development, cloud migration, cybersecurity"
        ogTitle="Blog | Reverence Technology"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Blog</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Stay updated with the latest insights on technology, digital innovation, and business transformation in East Africa.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-700 text-lg font-medium">No blog posts available at the moment. Check back soon!</p>
          </div>
        ) : posts.length === 1 ? (
          // Special layout for a single post - centered and enlarged
          <div className="flex justify-center">
            <article className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 w-full max-w-4xl border border-white/40 hover:bg-white/80">
              {posts[0].cover_image_url ? (
                <img
                  src={posts[0].cover_image_url}
                  alt={posts[0].title}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="bg-white/30 border-2 border-dashed border-gray-300 rounded-xl w-full h-96 flex items-center justify-center">
                  <span className="text-gray-600 text-xl font-medium">No image</span>
                </div>
              )}
              <div className="p-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-lg font-medium bg-[#4B0082]/10 text-[#4B0082]">
                    {posts[0].category?.name || 'General'}
                  </span>
                  <time dateTime={posts[0].published_at} className="text-lg text-gray-700 font-medium">
                    {format(new Date(posts[0].published_at), 'MMMM d, yyyy')}
                  </time>
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  <Link to={`/blog/${posts[0].slug}`} className="hover:text-[#360061] transition-colors">
                    {posts[0].title}
                  </Link>
                </h2>
                <p className="text-gray-800 text-xl mb-8 leading-relaxed">
                  {posts[0].excerpt}
                </p>
                <div className="flex flex-wrap items-center justify-between">
                  <span className="text-lg font-medium text-gray-900">{posts[0].author}</span>
                  <Link
                    to={`/blog/${posts[0].slug}`}
                    className="text-white font-medium text-lg flex items-center px-6 py-3 bg-[#4B0082] rounded-lg hover:bg-[#360061] transition-all duration-300 shadow-lg"
                  >
                    Read full article
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {posts.map((post) => (
              <article key={post.id} className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 w-full border border-white/40 hover:bg-white/80 group">
                {post.cover_image_url ? (
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="bg-white/30 border-2 border-dashed border-gray-300 rounded-xl w-full h-64 flex items-center justify-center">
                    <span className="text-gray-600 text-lg font-medium">No image</span>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#4B0082]/10 text-[#4B0082]">
                      {post.category?.name || 'General'}
                    </span>
                    <time dateTime={post.published_at || post.created_at} className="text-sm text-gray-700 font-medium">
                      {format(new Date(post.published_at || post.created_at), 'MMM d, yyyy')}
                    </time>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2">
                    <Link to={`/blog/${post.slug}`} className="hover:text-[#360061] transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-gray-800 mb-5 line-clamp-4 text-lg font-medium">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-gray-900">{post.author}</span>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="text-[#4B0082] hover:text-[#360061] font-medium flex items-center text-lg"
                    >
                      Read more
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}