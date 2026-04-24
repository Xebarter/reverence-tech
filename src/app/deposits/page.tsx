"use client";

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import DepositTracking from '../../components/DepositTracking';
import SEO from '../../components/SEO';

export default function DepositsPage() {
  return (
    <div className="min-h-screen">
      <SEO title="Deposits" />
      <Header />
      <main className="pt-20">
        <DepositTracking />
      </main>
      <Footer />
    </div>
  );
}

