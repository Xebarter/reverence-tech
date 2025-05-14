'use client';

import type React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Globe,
  Smartphone,
  Cloud,
  GraduationCap,
  Settings,
} from 'lucide-react';
import { motion } from 'framer-motion';

const ServiceCard = ({
  title,
  description,
  icon: Icon,
  iconColor,
  index,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        type: 'spring',
        stiffness: 80,
      }}
      whileHover={{
        y: -15,
        scale: 1.02,
        transition: { duration: 0.3, ease: 'easeOut' },
      }}
      className="relative h-full"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 rounded-2xl blur-lg pointer-events-none"
        whileHover={{ opacity: 0.3 }}
        transition={{ duration: 0.3 }}
      />
      <Card className="h-full relative backdrop-blur-md bg-white/60 border border-orange-300/20 rounded-2xl shadow-xl transition-all duration-500 hover:shadow-2xl hover:border-orange-400/40 overflow-hidden">
        <div className="absolute inset-0 border border-transparent rounded-2xl bg-gradient-to-r from-transparent via-[#ff5831]/10 to-transparent animate-pulse pointer-events-none" />
        <CardHeader className="relative z-10">
          <motion.div
            className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${iconColor} shadow-lg`}
            whileHover={{
              scale: 1.15,
              rotate: 10,
              boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
              transition: { duration: 0.3 },
            }}
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
          >
            <Icon className="text-white" size={28} />
          </motion.div>
          <CardTitle className="text-lg sm:text-xl font-bold text-[#333]">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <CardDescription className="text-sm sm:text-base text-[#555]">
            {description}
          </CardDescription>
        </CardContent>
        {/* Footer removed to eliminate Learn More button */}
      </Card>
    </motion.div>
  );
};

const Services = () => {
  const services = [
    
    {
      title: 'Mobile App Development',
      description:
        'Native and cross-platform mobile application development for iOS and Android devices with seamless user experiences.',
      icon: Smartphone,
      iconColor: 'bg-[#00d66b]',
    },
    {
      title: 'SaaS Solutions',
      description:
        'Scalable and secure software-as-a-service products with subscription models tailored to your business needs.',
      icon: Cloud,
      iconColor: 'bg-[#ad00ff]',
    },
    {
      title: 'Educational Technology',
      description:
        'Interactive e-learning platforms and educational apps that enhance teaching and learning experiences.',
      icon: GraduationCap,
      iconColor: 'bg-[#ffd60a]',
    },
    {
      title: 'System Optimization',
      description:
        'Performance enhancement, code refactoring, and technical debt reduction for existing web applications.',
      icon: Settings,
      iconColor: 'bg-[#ff5831]',
    },
  ];

  return (
    <section
      id="services"
      className="py-12 sm:py-20 bg-[#fff6ea] relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.03)_0%,transparent_70%)] pointer-events-none" />
      <motion.div
        className="absolute top-0 right-0 w-48 h-48 sm:w-80 sm:h-80 bg-[#ad00ff]/10 rounded-full blur-3xl pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-56 h-56 sm:w-96 sm:h-96 bg-[#00d66b]/10 rounded-full blur-3xl pointer-events-none"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#333] mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Other Services
          </motion.h2>
          <motion.p
            className="text-base sm:text-xl text-[#444] max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Apart from engaging websites, provide end-to-end technology solutions that help businesses
            transform and thrive in the digital age.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={service.title}
              title={service.title}
              description={service.description}
              icon={service.icon}
              iconColor={service.iconColor}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
