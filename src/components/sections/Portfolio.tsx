import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface PortfolioItem {
  title: string;
  category: string;
  image: string;
  description: string;
}

const Portfolio = () => {
  const portfolioItems: PortfolioItem[] = [
    {
      title: 'E-commerce Website',
      category: 'Web Development',
      image: 'https://static.vecteezy.com/system/resources/previews/028/713/706/non_2x/blue-geometric-abstract-background-modern-minimalist-presentation-background-business-and-technology-banner-background-vector.jpg',
      description: 'A responsive e-commerce platform with advanced filtering and payment integration.',
    },
    {
      title: 'Health & Fitness App',
      category: 'Mobile App',
      image: 'https://riseapps.co/wp-content/uploads/2024/08/Doctor-Appointment-App-Development.png',
      description: 'A cross-platform mobile application for tracking fitness goals and workout routines.',
    },
    {
      title: 'Learning Management System',
      category: 'Educational Technology',
      image: 'https://uitop.design/wp-content/uploads/2024/01/Unified_App_for_Schools1.png',
      description: 'A comprehensive system for educational institutions with course management and student tracking.',
    },
    {
      title: 'CRM Dashboard',
      category: 'SaaS Solution',
      image: 'https://cdn.prod.website-files.com/5e593fb060cf877cf875dd1f/67b77d7b8fdf67abaf87b439_saas-tech-webflow-template.png',
      description: 'A customizable CRM dashboard with sales analytics and customer management tools.',
    },
    {
      title: 'Real Estate Platform',
      category: 'Web Application',
      image: 'https://www.prismetric.com/wp-content/uploads/2024/05/real-estate-app-development-service.png',
      description: 'A property listing and management platform with interactive maps and real-time notifications.',
    },
    {
      title: 'Financial Analytics Tool',
      category: 'SaaS Solution',
      image: 'https://mergewebsites.s3.eu-central-1.amazonaws.com/Hero_d683e1306b.png',
      description: 'A financial analytics application with data visualization and reporting capabilities.',
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 15,
      },
    },
  };

  return (
    <section id="portfolio" className="py-20 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
      <motion.div
        className="absolute top-40 left-10 w-48 h-48 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, 40, 0],
          y: [0, 40, 0],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          repeat: Infinity,
          duration: 10,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-40 right-10 w-64 h-64 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-full blur-3xl"
        animate={{
          x: [0, -50, 0],
          y: [0, 50, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          repeat: Infinity,
          duration: 8,
          ease: "easeInOut",
        }}
      />

      {/* Subtle Particle Effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 4 + 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold text-white mb-4 bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            Our Portfolio
          </motion.h2>
          <motion.p
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
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
              whileHover={{ y: -15, scale: 1.02, transition: { duration: 0.3 } }}
              className="relative group"
            >
              {/* Glowing effect behind card */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 rounded-2xl blur-lg"
                whileHover={{ opacity: 0.3 }}
                transition={{ duration: 0.3 }}
              />
              
              <Card className="overflow-hidden backdrop-blur-md bg-white/5 border border-gray-500/20 rounded-2xl shadow-xl transition-all duration-500 hover:shadow-2xl hover:border-gray-400/40 h-full relative">
                {/* Subtle gradient border effect */}
                <div className="absolute inset-0 border border-transparent rounded-2xl bg-gradient-to-r from-transparent via-blue-500/20 to-transparent animate-pulse" />
                
                <div className="relative h-64 overflow-hidden">
                  <motion.img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover rounded-t-2xl"
                    whileHover={{ scale: 1.15 }}
                    transition={{ duration: 0.6 }}
                  />
                  {/* Overlay with category */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 flex items-end"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-4 w-full">
                      <span className="text-white font-medium text-sm bg-blue-600/50 px-3 py-1 rounded-full">{item.category}</span>
                    </div>
                  </motion.div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">{item.title}</h3>
                  <p className="text-gray-300 mb-4">{item.description}</p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-blue-500 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 rounded-lg transition-all duration-300"
                    >
                      View Project
                    </Button>
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
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              className="relative bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-4 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-800 transition-all duration-300 overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              View All Projects
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Portfolio;