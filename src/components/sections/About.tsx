import React from 'react'
import { motion } from 'framer-motion'

const StatCard = ({ number, label }: { number: string; label: string }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-6 rounded-lg bg-white shadow-sm border border-gray-100 text-center h-full">
        <motion.p
          className="text-4xl font-bold text-primary mb-2"
          initial={{ scale: 0.9 }}
          whileInView={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          {number}
        </motion.p>
        <p className="text-gray-600">{label}</p>
      </div>
    </motion.div>
  )
}

const FeatureItem = ({
  number,
  title,
  description,
  index
}: {
  number: string;
  title: string;
  description: string;
  index: number;
}) => {
  return (
    <motion.div
      className="flex items-start"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay: index * 0.2,
        type: "spring",
        stiffness: 50
      }}
    >
      <motion.div
        className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1"
        whileHover={{
          scale: 1.1,
          backgroundColor: "#dbeafe",
          rotate: 5
        }}
        transition={{ duration: 0.2 }}
      >
        <span className="text-primary font-bold">{number}</span>
      </motion.div>
      <div className="ml-4">
        <h4 className="text-xl font-semibold mb-2">{title}</h4>
        <p className="text-gray-600">
          {description}
        </p>
      </div>
    </motion.div>
  )
}

const About = () => {
  return (
    <section id="about" className="py-20 relative overflow-hidden">
      {/* Background decoration */}
      <motion.div
        className="absolute -top-40 -right-40 w-96 h-96 bg-blue-50 rounded-full opacity-50 z-0"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.3, 0.5]
        }}
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-50 rounded-full opacity-50 z-0"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.3, 0.5]
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut"
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              About Reverence Technology
            </motion.h2>

            <motion.p
              className="text-gray-600 mb-6 text-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Reverence Technology is a leading provider of digital solutions, dedicated to helping businesses succeed
              in an increasingly technology-driven world. We combine creative design with technical expertise to
              deliver outstanding results.
            </motion.p>

            <motion.p
              className="text-gray-600 mb-6 text-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Our team of experienced developers, designers, and strategists work together to create solutions
              that are not only visually appealing but also functionally powerful and scalable.
            </motion.p>

            <div className="space-y-4">
              <FeatureItem
                number="1"
                title="Client-Focused Approach"
                description="We prioritize understanding your business goals and challenges to deliver solutions that truly make a difference."
                index={0}
              />
              <FeatureItem
                number="2"
                title="Cutting-Edge Technology"
                description="We stay updated with the latest technological advancements to ensure your solutions are modern and future-proof."
                index={1}
              />
              <FeatureItem
                number="3"
                title="Quality Assurance"
                description="Every project undergoes rigorous testing to ensure high performance, security, and user satisfaction."
                index={2}
              />
            </div>
          </motion.div>

          <div>
            <motion.div
              className="rounded-lg overflow-hidden mb-10 shadow-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
            >
              <img
                src="https://static.vecteezy.com/system/resources/previews/024/140/509/non_2x/abstract-futuristic-geometry-line-background-modern-shiny-blue-rounded-lines-technology-background-template-technology-background-for-cover-banner-brochure-business-free-vector.jpg"
                alt="Team collaboration"
                className="w-full h-auto object-cover"
              />
            </motion.div>

            <div className="grid grid-cols-2 gap-6">
              <StatCard number="200+" label="Projects Completed" />
              <StatCard number="50+" label="Happy Clients" />
              <StatCard number="10+" label="Years Experience" />
              <StatCard number="24/7" label="Customer Support" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
