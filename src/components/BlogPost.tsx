import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image_url: string | null;
  author: string;
  published_at: string;
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
    // In a real implementation, this would fetch from Supabase based on the slug
    // For now, we'll simulate with sample data
    const fetchPost = async () => {
      try {
        // This is a placeholder - in a real app, you would fetch from your Supabase database
        // based on the slug parameter
        const samplePost: BlogPost = {
          id: '1',
          title: 'Getting Started with Cloud Migration',
          slug: 'getting-started-with-cloud-migration',
          content: `
            <h2>Introduction to Cloud Migration</h2>
            <p>Cloud migration is the process of moving data, applications, and other business elements from on-premises infrastructure to the cloud.</p>
            
            <h2>Benefits of Cloud Migration</h2>
            <p>Migrating to the cloud offers numerous benefits including cost savings, scalability, and improved security.</p>
            
            <h2>Steps to Migrate to the Cloud</h2>
            <p>1. Assess your current infrastructure<br/>
               2. Choose the right cloud service provider<br/>
               3. Plan your migration strategy<br/>
               4. Execute the migration<br/>
               5. Optimize and monitor performance</p>
          `,
          excerpt: 'Learn the essential steps for migrating your business to the cloud...',
          cover_image_url: null,
          author: 'Jane Smith',
          published_at: new Date().toISOString(),
          category: {
            name: 'Technology',
            slug: 'technology'
          }
        };

        setPost(samplePost);
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
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Loading Blog Post...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
            <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
            <Link
              to="/blog"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {post.cover_image_url ? (
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64" />
          )}

          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {post.category?.name || 'General'}
              </span>
              <span className="text-gray-500">
                {format(new Date(post.published_at), 'MMMM d, yyyy')}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            <div className="flex items-center mb-8">
              <div className="text-gray-700">
                <span className="font-medium">By {post.author}</span>
              </div>
            </div>

            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <div className="mt-12 pt-8 border-t border-gray-200">
              <Link
                to="/blog"
                className="inline-flex items-center text-green-600 hover:text-green-800 font-medium"
              >
                ← Back to Blog
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}