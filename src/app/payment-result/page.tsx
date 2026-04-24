"use client";

import { Suspense } from 'react';
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
        <Suspense fallback={<div className="px-6 py-16 text-slate-500">Loading payment result…</div>}>
          <PaymentResult />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

