"use client";

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Careers from '../../components/Careers';
import SEO from '../../components/SEO';

export default function CareersPage() {
  return (
    <div className="min-h-screen">
      <SEO title="Careers" />
      <Header />
      <main className="pt-20">
        <Careers />
      </main>
      <Footer />
    </div>
  );
}

