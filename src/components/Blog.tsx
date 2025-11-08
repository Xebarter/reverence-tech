import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import SEO from './SEO';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string | null;
  author: string;
  published_at: string;
  category?: {
    name: string;
    slug: string;
  };
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const isSingle = posts.length === 1;

  useEffect(() => {
    // In a real implementation, this would fetch from Supabase
    // For now, we'll simulate with sample data
    const fetchPosts = async () => {
      try {
        // This is a placeholder - in a real app, you would fetch from your Supabase database
        const samplePosts: BlogPost[] = [
          {
            id: '1',
            title: 'Getting Started with Cloud Migration',
            slug: 'getting-started-with-cloud-migration',
            excerpt: 'Learn the essential steps for migrating your business to the cloud...',
            cover_image_url: null,
            author: 'Jane Smith',
            published_at: new Date().toISOString(),
            category: {
              name: 'Technology',
              slug: 'technology'
            }
          },
          {
            id: '2',
            title: 'The Future of Fintech in East Africa',
            slug: 'future-of-fintech-east-africa',
            excerpt: 'Exploring the trends shaping the fintech landscape in East Africa...',
            cover_image_url: null,
            author: 'John Doe',
            published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            category: {
              name: 'Business',
              slug: 'business'
            }
          },
          {
            id: '3',
            title: 'Building Scalable Web Applications',
            slug: 'building-scalable-web-applications',
            excerpt: 'Best practices for creating web applications that can handle growth...',
            cover_image_url: null,
            author: 'Alice Johnson',
            published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            category: {
              name: 'Engineering',
              slug: 'engineering'
            }
          }
        ];

        setPosts(samplePosts);
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
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Loading Blog Posts...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <SEO 
        title="Blog"
        description="Latest insights and news from Reverence Technology about technology, digital innovation, and business transformation in East Africa."
        keywords="technology blog, digital innovation, East Africa, Uganda, web development, cloud migration, cybersecurity"
        ogTitle="Blog | Reverence Technology"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Blog</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest insights on technology, digital innovation, and business transformation in East Africa.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No blog posts available at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                {post.cover_image_url ? (
                  <img 
                    src={post.cover_image_url} 
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48" />
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {post.category?.name || 'General'}
                    </span>
                    <time dateTime={post.published_at} className="text-sm text-gray-500">
                      {format(new Date(post.published_at), 'MMM d, yyyy')}
                    </time>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    <Link to={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{post.author}</span>
                    <Link 
                      to={`/blog/${post.slug}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
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