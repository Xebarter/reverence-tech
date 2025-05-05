"use client"

import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Hero from '@/components/sections/Hero'
import Services from '@/components/sections/Services'
import About from '@/components/sections/About'
import Portfolio from '@/components/sections/Portfolio'
import Contact from '@/components/sections/Contact'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  // State to handle client-side only rendering for animations
  const [isMounted, setIsMounted] = useState(false);

  // Enable smooth scrolling when clicking on navigation links
  useEffect(() => {
    // Set mounted state for client-side only animations
    setIsMounted(true);

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const closestAnchor = target.closest('a');

      if (closestAnchor?.href && closestAnchor.href.includes('#')) {
        const id = closestAnchor.href.split('#')[1];
        if (id) {
          e.preventDefault();
          const element = document.getElementById(id);
          if (element) {
            window.scrollTo({
              top: element.offsetTop - 80, // Adjust for header height
              behavior: 'smooth'
            });
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  // Render without animations until client-side hydration is complete
  if (!isMounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Hero />
          <Services />
          <About />
          <Portfolio />
          <Contact />
        </main>
        <Footer />
      </div>
    );
  }

  // Client-side rendering with animations
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
          <Services />
          <About />
          <Portfolio />
          <Contact />
        </main>
        <Footer />
      </motion.div>
    </AnimatePresence>
  )
}
