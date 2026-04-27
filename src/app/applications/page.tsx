"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import MyApplications from "../../components/MyApplications";
import SEO from "../../components/SEO";

export default function ApplicationsPage() {
  return (
    <div className="min-h-screen">
      <SEO title="My Applications" />
      <Header />
      <main className="pt-20">
        <MyApplications />
      </main>
      <Footer />
    </div>
  );
}

