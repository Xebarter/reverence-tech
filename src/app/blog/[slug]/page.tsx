"use client";

import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import BlogPost from '../../../components/BlogPost';
import SEO from '../../../components/SEO';

export default function BlogPostPage() {
  return (
    <div className="min-h-screen">
      <SEO title="Blog" />
      <Header />
      <main className="pt-20">
        <BlogPost />
      </main>
      <Footer />
    </div>
  );
}

