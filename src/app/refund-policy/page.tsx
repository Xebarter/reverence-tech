"use client";

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import RefundPolicy from '../../components/RefundPolicy';
import SEO from '../../components/SEO';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen">
      <SEO title="Refund Policy" />
      <Header />
      <main className="pt-20">
        <RefundPolicy />
      </main>
      <Footer />
    </div>
  );
}

