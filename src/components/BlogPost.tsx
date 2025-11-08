import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import SEO from './SEO';

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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
            <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
            <Link 
              to="/blog" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
      <SEO 
        title={post.title}
        description={post.excerpt}
        keywords={`technology, cloud migration, digital innovation, ${post.category?.name || ''}`}
        ogTitle={post.title}
        ogDescription={post.excerpt}
        ogType="article"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article>
          <header className="mb-8">
            <Link 
              to="/blog" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Blog
            </Link>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
              <span>By <span className="font-medium">{post.author}</span></span>
              <time dateTime={post.published_at}>
                {format(new Date(post.published_at), 'MMMM d, yyyy')}
              </time>
              {post.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {post.category.name}
                </span>
              )}
            </div>
            
            {post.cover_image_url ? (
              <img 
                src={post.cover_image_url} 
                alt={post.title}
                className="w-full h-96 object-cover rounded-xl mb-8"
              />
            ) : (
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-96 mb-8" />
            )}
          </header>
          
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
        </article>
      </div>
    </div>
  );
}