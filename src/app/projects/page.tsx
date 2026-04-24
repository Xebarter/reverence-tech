"use client";

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProjectsList from '../../components/Projects/ProjectsList';
import SEO from '../../components/SEO';

export default function ProjectsPage() {
  return (
    <div className="min-h-screen">
      <SEO title="Projects" />
      <Header />
      <main className="pt-20">
        <ProjectsList />
      </main>
      <Footer />
    </div>
  );
}

