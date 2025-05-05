import type React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Globe, Smartphone, Cloud, GraduationCap, Settings } from 'lucide-react'
import { motion } from 'framer-motion'

const ServiceCard = ({
  title,
  description,
  icon: Icon,
  iconColor,
  index
}: {
  title: string
  description: string
  icon: React.ElementType
  iconColor: string
  index: number
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        type: "spring",
        stiffness: 50
      }}
      whileHover={{
        y: -10,
        transition: { duration: 0.2 }
      }}
    >
      <Card className="h-full border border-gray-200 transition-all duration-300 hover:shadow-md hover:border-primary/50 overflow-hidden">
        <CardHeader>
          <motion.div
            className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${iconColor}`}
            whileHover={{
              scale: 1.1,
              rotate: 5,
              transition: { duration: 0.2 }
            }}
          >
            <Icon className="text-white" size={24} />
          </motion.div>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-base text-gray-600">{description}</CardDescription>
        </CardContent>
        <CardFooter>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="outline" size="sm" className="mt-4">
              Learn More
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

const Services = () => {
  const services = [
    {
      title: 'Website Development',
      description: 'Custom website design and development with responsive layouts, optimized for search engines and conversion.',
      icon: Globe,
      iconColor: 'bg-blue-600'
    },
    {
      title: 'Mobile App Development',
      description: 'Native and cross-platform mobile application development for iOS and Android devices with seamless user experiences.',
      icon: Smartphone,
      iconColor: 'bg-green-600'
    },
    {
      title: 'SaaS Solutions',
      description: 'Scalable and secure software-as-a-service products with subscription models tailored to your business needs.',
      icon: Cloud,
      iconColor: 'bg-purple-600'
    },
    {
      title: 'Educational Technology',
      description: 'Interactive e-learning platforms and educational apps that enhance teaching and learning experiences.',
      icon: GraduationCap,
      iconColor: 'bg-orange-600'
    },
    {
      title: 'System Optimization',
      description: 'Performance enhancement, code refactoring, and technical debt reduction for existing web applications.',
      icon: Settings,
      iconColor: 'bg-red-600'
    }
  ]

  return (
    <section id="services" className="py-20 bg-gray-50 relative overflow-hidden">
      {/* Background decoration elements */}
      <motion.div
        className="absolute top-20 right-0 w-64 h-64 bg-blue-200 rounded-full opacity-20 -z-10"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 0.2 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      />
      <motion.div
        className="absolute bottom-20 left-0 w-96 h-96 bg-purple-200 rounded-full opacity-20 -z-10"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 0.2 }}
        transition={{ duration: 1, delay: 0.3 }}
        viewport={{ once: true }}
      />

      <div className="container mx-auto px-4 relative">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
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
            Our Services
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            We provide end-to-end technology solutions that help businesses transform and thrive in the digital age.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
  )
}

export default Services
