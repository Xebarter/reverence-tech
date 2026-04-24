"use client";

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PaymentResult from '../../components/PaymentResult';
import SEO from '../../components/SEO';

export default function PaymentResultPage() {
  return (
    <div className="min-h-screen">
      <SEO title="Payment Result" />
      <Header />
      <main className="pt-20">
        <PaymentResult />
      </main>
      <Footer />
    </div>
  );
}

