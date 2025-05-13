import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ number, label }: { number: string; label: string }) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
      className="relative"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 rounded-xl blur-lg"
        whileHover={{ opacity: 0.3 }}
        transition={{ duration: 0.3 }}
      />
      <div className="p-6 rounded-xl backdrop-blur-md bg-white/10 border border-orange-400/20 shadow-xl text-center h-full transition-all duration-500 hover:shadow-2xl hover:border-orange-500/40 relative overflow-hidden">
        <div className="absolute inset-0 border border-transparent rounded-xl bg-gradient-to-r from-transparent via-[#ff5831]/20 to-transparent animate-pulse" />
        <motion.p
          className="text-4xl font-extrabold text-[#ff5831] mb-2"
          initial={{ scale: 0.9 }}
          whileInView={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 120 }}
        >
          {number}
        </motion.p>
        <p className="text-gray-700 text-sm">{label}</p>
      </div>
    </motion.div>
  );
};

const FeatureItem = ({
  number,
  title,
  description,
  index,
}: {
  number: string;
  title: string;
  description: string;
  index: number;
}) => {
  return (
    <motion.div
      className="flex items-start group"
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.6,
        delay: index * 0.2,
        type: "spring",
        stiffness: 70,
      }}
    >
      <motion.div
        className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff5831] to-[#ffd60a] flex items-center justify-center flex-shrink-0 mt-1 shadow-lg"
        whileHover={{
          scale: 1.15,
          rotate: 10,
          boxShadow: "0 0 15px rgba(255, 88, 49, 0.5)",
        }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-white font-bold">{number}</span>
      </motion.div>
      <div className="ml-4">
        <h4 className="text-xl font-semibold text-[#222] mb-2 group-hover:text-[#ff5831] transition-colors duration-300">
          {title}
        </h4>
        <p className="text-[#555]">{description}</p>
      </div>
    </motion.div>
  );
};

const About = () => {
  return (
    <section id="about" className="py-20 bg-[#fff6ea] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,88,49,0.05)_0%,transparent_70%)]" />
      
      {/* Glow Blobs */}
      <motion.div
        className="absolute -top-40 -right-40 w-96 h-96 bg-[#ad00ff]/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#00d66b]/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Particle Effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#ff5831] rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-extrabold text-[#222] mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              About Reverence Technology
            </motion.h2>

            <motion.p
              className="text-[#444] mb-6 text-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Reverence Technology is a leading provider of digital solutions, dedicated to helping businesses succeed
              in an increasingly technology-driven world.
            </motion.p>

            <motion.p
              className="text-[#444] mb-6 text-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Our team of experienced developers, designers, and strategists work together to create solutions
              that are not only visually appealing but also functionally powerful and scalable.
            </motion.p>

            <div className="space-y-6">
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
              className="rounded-xl overflow-hidden mb-10 shadow-2xl relative"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 0 30px rgba(255, 88, 49, 0.3)",
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0"
                whileHover={{ opacity: 0.3 }}
                transition={{ duration: 0.3 }}
              />
              <img
                src="https://static.vecteezy.com/system/resources/previews/024/140/509/non_2x/abstract-futuristic-geometry-line-background-modern-shiny-blue-rounded-lines-technology-background-template-technology-background-for-cover-banner-brochure-business-free-vector.jpg"
                alt="Team collaboration"
                className="w-full h-auto object-cover rounded-xl"
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
  );
};

export default About;
