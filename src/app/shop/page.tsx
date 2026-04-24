"use client";

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Shop from '../../components/Shop';
import SEO from '../../components/SEO';

export default function ShopPage() {
  return (
    <div className="min-h-screen">
      <SEO title="Shop" />
      <Header />
      <main className="pt-20">
        <Shop />
      </main>
      <Footer />
    </div>
  );
}

