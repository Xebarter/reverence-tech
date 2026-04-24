"use client";

import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import JobDetails from '../../../components/JobDetails';
import SEO from '../../../components/SEO';

export default function JobDetailsPage() {
  return (
    <div className="min-h-screen">
      <SEO title="Job" />
      <Header />
      <main className="pt-20">
        <JobDetails />
      </main>
      <Footer />
    </div>
  );
}

