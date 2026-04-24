"use client";

import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ProjectDetails from '../../../components/Projects/ProjectDetails';
import SEO from '../../../components/SEO';

export default function ProjectDetailsPage() {
  return (
    <div className="min-h-screen">
      <SEO title="Project" />
      <Header />
      <main className="pt-20">
        <ProjectDetails />
      </main>
      <Footer />
    </div>
  );
}

