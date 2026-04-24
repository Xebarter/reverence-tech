"use client";

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import TermsAndConditions from '../../components/TermsAndConditions';
import SEO from '../../components/SEO';

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <SEO title="Terms & Conditions" />
      <Header />
      <main className="pt-20">
        <TermsAndConditions />
      </main>
      <Footer />
    </div>
  );
}

