import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface PortfolioItem {
  title: string
  category: string
  image: string
  description: string
}

const Portfolio = () => {
  const portfolioItems: PortfolioItem[] = [
    {
      title: 'E-commerce Website',
      category: 'Web Development',
      image: 'https://static.vecteezy.com/system/resources/previews/028/713/706/non_2x/blue-geometric-abstract-background-modern-minimalist-presentation-background-business-and-technology-banner-background-vector.jpg',
      description: 'A responsive e-commerce platform with advanced filtering and payment integration.'
    },
    {
      title: 'Health & Fitness App',
      category: 'Mobile App',
      image: 'https://riseapps.co/wp-content/uploads/2024/08/Doctor-Appointment-App-Development.png',
      description: 'A cross-platform mobile application for tracking fitness goals and workout routines.'
    },
    {
      title: 'Learning Management System',
      category: 'Educational Technology',
      image: 'https://uitop.design/wp-content/uploads/2024/01/Unified_App_for_Schools1.png',
      description: 'A comprehensive system for educational institutions with course management and student tracking.'
    },
    {
      title: 'CRM Dashboard',
      category: 'SaaS Solution',
      image: 'https://cdn.prod.website-files.com/5e593fb060cf877cf875dd1f/67b77d7b8fdf67abaf87b439_saas-tech-webflow-template.png',
      description: 'A customizable CRM dashboard with sales analytics and customer management tools.'
    },
    {
      title: 'Real Estate Platform',
      category: 'Web Application',
      image: 'https://www.prismetric.com/wp-content/uploads/2024/05/real-estate-app-development-service.png',
      description: 'A property listing and management platform with interactive maps and real-time notifications.'
    },
    {
      title: 'Financial Analytics Tool',
      category: 'SaaS Solution',
      image: 'https://mergewebsites.s3.eu-central-1.amazonaws.com/Hero_d683e1306b.png',
      description: 'A financial analytics application with data visualization and reporting capabilities.'
    }
  ]

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 12
      }
    }
  }

  return (
    <section id="portfolio" className="py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white opacity-60 z-0" />

      <motion.div
        className="absolute top-40 left-10 w-40 h-40 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 z-0"
        animate={{
          x: [0, 30, 0],
          y: [0, 30, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 8,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute bottom-40 right-10 w-60 h-60 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 z-0"
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 10,
          ease: "easeInOut"
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            Our Portfolio
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Explore some of our recent projects and see how we've helped businesses across different industries.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {portfolioItems.map((item, index) => (
            <motion.div
              key={item.title}
              variants={cardVariants}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <Card className="overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 h-full">
                <div className="relative h-64 overflow-hidden group">
                  <motion.img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  />
                  {/* Overlay with category */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-4 w-full">
                      <span className="text-white font-medium">{item.category}</span>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="outline" size="sm">View Project</Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button size="lg" className="px-8">
              View All Projects
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Portfolio
