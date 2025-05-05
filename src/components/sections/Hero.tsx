import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'

const Hero = () => {
  return (
    <section className="relative flex flex-col items-center justify-center h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 px-6 text-center overflow-hidden">
      {/* Decorative Background Blur */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#0077B6]/30 rounded-full blur-[120px] z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-blue-300/20 rounded-full blur-[100px] z-0" />

      {/* Hero Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="relative z-10 max-w-3xl mx-auto"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-[#0077B6]">
            Transforming Ideas
          </span>{' '}
          into Reality
        </h1>

        <p className="text-lg md:text-xl text-gray-700 mt-6">
          We craft seamless digital experiences using cutting-edge technology and modern design.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link href="#contact">
            <Button
              size="lg"
              variant="outline"
              className="border-[#0077B6] text-[#0077B6] hover:bg-[#0077B6]/10 px-8 py-4 text-base rounded-xl transition-all duration-300"
            >
              Contact Us
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  )
}

export default Hero
