"use client";

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Blog from '../../components/Blog';
import SEO from '../../components/SEO';

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      <SEO title="Blog" />
      <Header />
      <main className="pt-20">
        <Blog />
      </main>
      <Footer />
    </div>
  );
}

