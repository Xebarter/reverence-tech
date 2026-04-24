"use client";

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Checkout from '../../components/Checkout';
import SEO from '../../components/SEO';

export default function CheckoutPage() {
  return (
    <div className="min-h-screen">
      <SEO title="Checkout" />
      <Header />
      <main className="pt-20">
        <Checkout />
      </main>
      <Footer />
    </div>
  );
}

