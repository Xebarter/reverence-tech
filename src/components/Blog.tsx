import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

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
            published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            category: {
              name: 'Business',
              slug: 'business'
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Loading Blog Posts...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Reverence Technology Blog</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Insights, tutorials, and news from our team of experts
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">No blog posts yet</h2>
            <p className="text-gray-600">Check back later for new content!</p>
          </div>
        ) : (
          // If there's exactly one post, center it and make it larger for emphasis.
          isSingle ? (
            <div className="flex justify-center">
              {posts.map((post) => (
                <article key={post.id} className="w-full max-w-4xl bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {post.cover_image_url ? (
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="w-full h-96 md:h-[36rem] object-cover"
                    />
                  ) : (
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-96 md:h-[36rem]" />
                  )}

                  <div className="p-8 sm:p-10 flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {post.category?.name || 'General'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(post.published_at), 'MMM d, yyyy')}
                      </span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                      {post.title}
                    </h2>

                    <p className="text-gray-700 mb-6 text-lg">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-4">
                      <span className="text-sm font-medium text-gray-900">
                        By {post.author}
                      </span>
                      <Link
                        to={`/blog/${post.slug}`}
                        className="text-green-600 hover:text-green-800 font-medium text-sm whitespace-nowrap"
                      >
                        Read more →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {post.cover_image_url ? (
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48" />
                  )}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {post.category?.name || 'General'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(post.published_at), 'MMM d, yyyy')}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h2>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-4">
                      <span className="text-sm font-medium text-gray-900">
                        By {post.author}
                      </span>
                      <Link
                        to={`/blog/${post.slug}`}
                        className="text-green-600 hover:text-green-800 font-medium text-sm whitespace-nowrap"
                      >
                        Read more →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}