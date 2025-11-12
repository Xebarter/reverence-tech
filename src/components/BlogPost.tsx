import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import SEO from './SEO';
import { supabase } from '../lib/supabase';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image_url: string | null;
  author: string;
  published_at: string;
  created_at: string;
  category?: {
    name: string;
    slug: string;
  };
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select(`
            id,
            title,
            slug,
            content,
            excerpt,
            cover_image_url,
            author,
            published_at,
            created_at,
            category:blog_categories(name, slug)
          `)
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        if (error) throw error;
        if (data) {
          // Create a clean post object with proper typing
          const postData: BlogPost = {
            id: data.id,
            title: data.title,
            slug: data.slug,
            content: data.content,
            excerpt: data.excerpt,
            cover_image_url: data.cover_image_url,
            author: data.author,
            published_at: data.published_at,
            created_at: data.created_at,
            category: data.category && typeof data.category === 'object' && !Array.isArray(data.category)
              ? {
                name: (data.category as any).name,
                slug: (data.category as any).slug
              }
              : undefined
          };

          setPost(postData);
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden pt-20">
        {/* Background gradient */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#f2b134] to-[#00c7f2] opacity-20"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="rounded-full bg-gray-200 h-12 w-12 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen relative overflow-hidden pt-20">
        {/* Background gradient */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#f2b134] to-[#00c7f2] opacity-20"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="text-center py-12">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-8 max-w-2xl mx-auto border border-white/40 hover:bg-white/80 transition-all duration-300">
              <div className="text-6xl mb-4">😢</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Post Not Found</h1>
              <p className="text-gray-800 mb-8 text-lg font-medium">
                The blog post you're looking for doesn't exist or has been removed.
              </p>
              <Link
                to="/blog"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
              >
                Back to Blog
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f2b134] to-[#00c7f2] opacity-20"></div>
      </div>

      <SEO
        title={post.title}
        description={post.excerpt}
        keywords={`technology, cloud migration, digital innovation, ${post.category?.name || ''}`}
        ogTitle={post.title}
        ogDescription={post.excerpt}
        ogType="article"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <article className="bg-white/70 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/40 hover:bg-white/80 transition-all duration-300">
          <header className="px-6 pt-8 pb-4 border-b border-white/30">
            <Link
              to="/blog"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors duration-200 font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Blog
            </Link>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <div className="mb-6">
                <p className="text-xl text-gray-800 italic border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r-lg font-medium">
                  {post.excerpt}
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 text-gray-700 mb-6 font-medium">
              <div className="flex items-center">
                <div className="bg-gray-300 border-2 border-dashed rounded-xl w-10 h-10 mr-3" />
                <span>By <span className="font-bold text-gray-900">{post.author}</span></span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <time dateTime={post.published_at || post.created_at} className="font-bold text-gray-900">
                  {format(new Date(post.published_at || post.created_at), 'MMMM d, yyyy')}
                </time>
              </div>
              {post.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                  {post.category.name}
                </span>
              )}
            </div>
          </header>

          {post.cover_image_url ? (
            <div className="px-6 pt-4">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-96 object-cover rounded-xl mb-8 shadow-md"
              />
            </div>
          ) : (
            <div className="px-6 pt-4">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 rounded-xl w-full h-96 mb-8 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span className="text-gray-500 mt-2 block">No cover image</span>
                </div>
              </div>
            </div>
          )}

          <div className="px-6 pb-8">
            <div
              className="prose prose-lg max-w-none prose-headings:scroll-mt-20 prose-headings:text-gray-900 prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-6 prose-h1:mt-8 prose-h2:text-3xl prose-h2:font-semibold prose-h2:mb-5 prose-h2:mt-7 prose-h3:text-2xl prose-h3:font-medium prose-h3:mb-4 prose-h3:mt-6 prose-h4:text-xl prose-h4:font-medium prose-h4:mb-3 prose-h4:mt-5 prose-p:text-gray-800 prose-p:leading-relaxed prose-p:mb-4 prose-a:text-blue-600 prose-a:hover:text-blue-800 prose-a:underline hover:prose-a:no-underline prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:text-gray-800 prose-blockquote:font-medium prose-blockquote:mb-6 prose-blockquote:mt-6 prose-strong:text-gray-900 prose-em:text-gray-800 prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4 prose-ul:mt-4 prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4 prose-ol:mt-4 prose-li:text-gray-800 prose-li:mb-1 prose-code:before:hidden prose-code:after:hidden prose-code:bg-gray-900/30 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-gray-900 prose-code:font-mono prose-pre:bg-gray-900/50 prose-pre:text-white/90 prose-pre:p-4 prose-pre:rounded-xl prose-pre:mb-6 prose-pre:mt-4 prose-pre:border prose-pre:border-white/20 prose-img:rounded-xl prose-img:shadow-md prose-img:max-w-full prose-img:mb-6 prose-img:mt-4 prose-hr:my-10 prose-table:w-full prose-table:mb-6 prose-table:mt-6 prose-thead:bg-white/20 prose-tbody:tr:nth-child(even):bg-white/10 prose-th:text-left prose-th:font-semibold prose-th:py-2 prose-th:px-3 prose-th:text-gray-900 prose-td:text-gray-800 prose-td:py-2 prose-td:px-3"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>

        <div className="mt-8 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/40 hover:bg-white/80 transition-all duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Enjoyed this post?</h3>
              <p className="text-gray-800 font-medium">Share it with others or read more from our blog!</p>
            </div>
            <div className="flex space-x-3">
              {/* WhatsApp */}
              <a 
                href={`https://wa.me/?text=Check%20out%20this%20article:%20${encodeURIComponent(window.location.href)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors duration-200 shadow-md hover:shadow-lg"
                aria-label="Share on WhatsApp"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
              </a>
              
              {/* X (Twitter) */}
              <a 
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors duration-200 shadow-md hover:shadow-lg"
                aria-label="Share on X (Twitter)"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              
              {/* Facebook */}
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                aria-label="Share on Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.048v-3.472h3.048v-2.644c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.472h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z" />
                </svg>
              </a>
              
              {/* LinkedIn */}
              <a 
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors duration-200 shadow-md hover:shadow-lg"
                aria-label="Share on LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              
              {/* Instagram - linking to main page since Instagram doesn't allow direct sharing */}
              <a 
                href="https://www.instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:opacity-90 transition-opacity duration-200 shadow-md hover:shadow-lg"
                aria-label="Visit our Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
          >
            Back to Blog
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m-7-7H3"></path>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}