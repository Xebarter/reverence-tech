"use client";

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import OrderTracking from '../../components/OrderTracking';
import SEO from '../../components/SEO';

export default function OrdersPage() {
  return (
    <div className="min-h-screen">
      <SEO title="Order Tracking" />
      <Header />
      <main className="pt-20">
        <OrderTracking />
      </main>
      <Footer />
    </div>
  );
}

