'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <section
      className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden"
      style={{ backgroundColor: '#fff6ea' }}
    >
      {/* Floating accent blocks */}
      <div className="absolute w-24 h-24 bg-[#ff5831] rounded-xl top-12 left-8 opacity-10 blur-sm animate-bounce-slow" />
      <div className="absolute w-20 h-20 bg-[#00d66b] rounded-full bottom-16 right-12 opacity-10 blur-sm animate-bounce-slower" />
      <div className="absolute w-14 h-14 bg-[#ffd60a] rotate-45 top-40 right-24 opacity-10 blur-sm animate-pulse" />
      <div className="absolute w-16 h-16 bg-[#ad00ff] rounded-lg bottom-32 left-10 opacity-10 blur-sm animate-ping" />

      {/* Hero Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-5xl mx-auto"
      >
        <motion.h1
          variants={textVariants}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-[#2d3748]"
        >
          <span className="text-[#ff5831]">Innovating</span>{' '}
          for a Better <span className="text-[#00d66b]">Future</span>
        </motion.h1>

        <motion.p
          variants={textVariants}
          className="text-lg md:text-xl mt-6 max-w-2xl mx-auto text-[#4a5568]"
        >
          We deliver sophisticated and effective solutions through thoughtful design and cutting-edge technology.
        </motion.p>

        <motion.div
          variants={textVariants}
          className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link href="#contact" aria-label="Contact us to discuss your project">
            <Button
              size="lg"
              className="relative text-white px-8 py-4 text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group"
              style={{ backgroundColor: '#ad00ff' }}
            >
              <span
                className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                aria-hidden="true"
              />
              Get In Touch
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
