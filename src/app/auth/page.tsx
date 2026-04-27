"use client";

import { Suspense } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AuthPage from "../../components/AuthPage";
import SEO from "../../components/SEO";

export default function Auth() {
  return (
    <div className="min-h-screen">
      <SEO title="Sign in" />
      <Header />
      <main className="pt-20">
        <Suspense
          fallback={
            <div className="min-h-[60vh] bg-[#F8FAFC] flex items-center justify-center p-6">
              <div className="text-slate-500 font-bold">Loading...</div>
            </div>
          }
        >
          <AuthPage />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

