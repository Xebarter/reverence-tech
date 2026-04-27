"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import UserDashboard from "../../components/UserDashboard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <SEO title="Dashboard" />
      <Header />
      <main className="pt-20">
        <UserDashboard />
      </main>
      <Footer />
    </div>
  );
}

