'use client';

import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import Services from '@/components/sections/Services';
import About from '@/components/sections/About';
import Catalogue from '@/components/sections/Catalogue';
// import Portfolio from '@/components/sections/Portfolio';
import Contact from '@/components/sections/Contact';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const closestAnchor = target.closest('a');

      if (closestAnchor?.hash) {
        const id = closestAnchor.hash.slice(1); // remove '#'
        const element = document.getElementById(id);

        if (element) {
          e.preventDefault();
          window.scrollTo({
            top: element.offsetTop - 80,
            behavior: 'smooth',
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="min-h-screen flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Header />
        <main className="flex-grow">
          <Hero />
          <Catalogue />
          <Services />
          <About />
          <Contact />
        </main>
        <Footer />
      </motion.div>
    </AnimatePresence>
  );
}
