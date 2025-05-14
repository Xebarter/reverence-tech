'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';

// Define package and add-on interfaces for TypeScript
interface Package {
  name: string;
  price: string;
  usdPrice: string;
  idealFor: string;
  description: string;
  timeline: string;
  features: {
    design: string[];
    functionality: string[];
    seo: string[];
    support: string[];
  };
}

interface AddOn {
  name: string;
  price: string;
  usdPrice: string;
  description: string;
}

const packages: Package[] = [
  {
    name: 'Launch',
    price: 'UGX 1.8M – 3.5M',
    usdPrice: '~USD 485–945',
    idealFor: 'Small businesses, freelancers, personal blogs, or portfolios',
    description:
      'Kickstart your online presence with a sleek, mobile-friendly website designed in your vibrant brand colors. Perfect for showcasing services or portfolios with built-in lead capture.',
    timeline: '3–5 weeks',
    features: {
      design: [
        'Up to 8 pages (Home, About, Services, Contact, Blog, Portfolio, FAQ, Testimonials)',
        'Responsive design (mobile, tablet, desktop) with vibrant CTAs',
        'WordPress theme customized with your brand colors',
      ],
      functionality: [
        'Contact form with email notifications',
        'Social media integration (Facebook, Twitter, Instagram, LinkedIn)',
        'Google Analytics for visitor tracking',
      ],
      seo: ['Basic SEO (meta tags, sitemap, alt text optimization)', 'Fast-loading design (optimized images, caching)'],
      support: [
        'Free domain (1 year, .com/.ug)',
        'Basic hosting setup (1 year, ~UGX 200,000 value)',
        'Free SSL certificate (secure https)',
        '1-month post-launch support',
      ],
    },
  },
  {
    name: 'Grow',
    price: 'UGX 4M – 7.5M',
    usdPrice: '~USD 1,080–2,025',
    idealFor: 'SMEs, startups, and growing businesses needing advanced features',
    description:
      'Scale your business with a robust website featuring eCommerce or booking capabilities, styled with dynamic animations. Includes advanced SEO to boost visibility.',
    timeline: '5–8 weeks',
    features: {
      design: ['Up to 15 custom pages', 'Premium WordPress theme with animations', 'Accessibility compliance (WCAG 2.1 basics)'],
      functionality: [
        'Contact form with email notifications',
        'CMS (WordPress) with user training',
        'Basic eCommerce (WooCommerce, up to 20 products) or booking system',
        'WhatsApp or live chat integration',
      ],
      seo: ['Advanced SEO (keyword research, 5 optimized pages, schema markup)', 'Google Analytics and Search Console setup', 'PWA support for app-like mobile experience'],
      support: [
        'Free domain (1 year)',
        'Premium hosting setup (1 year, ~UGX 400,000 value)',
        'SSL certificate and basic security (firewall)',
        '3-month post-launch support',
      ],
    },
  },
  {
    name: 'Store',
    price: 'UGX 8M – 18M',
    usdPrice: '~USD 2,160–4,865',
    idealFor: 'Businesses selling products or services online (retail, restaurants)',
    description:
      'Launch a full-featured online store with secure payments and inventory management, designed to convert with bold buttons and highlights. SEO drives traffic.',
    timeline: '8–12 weeks',
    features: {
      design: ['Up to 25 pages (Home, Shop, About, Contact, Blog, Policies)', 'Custom WooCommerce or Shopify design', 'Product page animations'],
      functionality: [
        'Full eCommerce setup (unlimited products, cart, checkout)',
        'Secure payment gateways (Mobile Money, Visa, PayPal)',
        'Contact form with email notifications',
        'Inventory and order management',
        'Customer accounts and order tracking',
      ],
      seo: ['Comprehensive SEO (10 optimized pages, technical SEO, local SEO)', 'Marketing tools (discounts, coupons, email capture)', 'Google Analytics, heatmaps for user behavior'],
      support: [
        'Free domain (1 year)',
        'High-performance hosting (1 year, ~UGX 700,000 value)',
        'Advanced security (SSL, malware scanning)',
        '6-month post-launch support',
      ],
    },
  },
  {
    name: 'Enterprise',
    price: 'UGX 10M – 25M',
    usdPrice: '~USD 2,700–6,755',
    idealFor: 'Large businesses, NGOs, institutions, or government agencies',
    description:
      'A premium, high-performance website with advanced features like multi-language support and API integrations, styled with bold CTAs and accents.',
    timeline: '12–20 weeks',
    features: {
      design: ['30+ custom pages or dynamic structure', 'Bespoke WordPress theme with micro-interactions', 'Multi-language support (e.g., English, Luganda)'],
      functionality: [
        'Advanced CMS with custom admin panel',
        'Contact form with email notifications',
        'Membership or user login system',
        'API integrations (e.g., payment, SMS, ERP)',
      ],
      seo: ['Enterprise SEO (15 optimized pages, technical audits, link-building strategy)', 'Conversion rate optimization (CRO) with A/B testing', 'Analytics suite (Google Analytics, Tag Manager, heatmaps)'],
      support: [
        'Free domain (1 year)',
        'Dedicated hosting (1 year, ~UGX 1,200,000 value)',
        'Premium security (firewall, DDoS protection, anti-spam)',
        '12-month post-launch support',
      ],
    },
  },
  {
    name: 'Custom',
    price: 'UGX 20M – 60M+',
    usdPrice: '~USD 5,405–16,215+',
    idealFor: 'Marketplaces, booking platforms, SaaS, or unique systems',
    description:
      'A fully tailored web application built for scalability, with real-time features and custom APIs, designed in your vibrant style for innovative projects.',
    timeline: '16–30 weeks',
    features: {
      design: ['Custom UI/UX design with vibrant backgrounds', 'Interactive prototypes and animations'],
      functionality: [
        'Fully custom backend (Node.js, Laravel, or similar)',
        'User authentication and role-based access',
        'Contact form with email notifications',
        'Real-time features (chat, notifications, live updates)',
        'Custom API development',
      ],
      seo: ['SEO tailored to app goals (e.g., marketplace visibility)', 'Scalable cloud hosting (AWS, Google Cloud)', 'Performance optimization (CDN, caching)'],
      support: [
        'Free domain (1 year)',
        'Enterprise-grade hosting (1 year, ~UGX 2,000,000 value)',
        'Advanced security and compliance (GDPR, local data laws)',
        '12-month support with optional maintenance',
      ],
    },
  },
];

const addOns: AddOn[] = [
  {
    name: 'Basic SEO Optimization',
    price: 'UGX 600,000',
    usdPrice: '~USD 160',
    description: 'Keyword research and on-page SEO for 3 pages.',
  },
  {
    name: 'Advanced SEO Optimization',
    price: 'UGX 2,500,000',
    usdPrice: '~USD 675',
    description: 'Full SEO audit, link building, and 10 pages optimized.',
  },
  {
    name: 'Content Writing (Per Page)',
    price: 'UGX 150,000',
    usdPrice: '~USD 40',
    description: 'Professional copywriting with SEO keywords.',
  },
  {
    name: 'Logo & Branding',
    price: 'UGX 800,000 – 2,500,000',
    usdPrice: '~USD 215–675',
    description: 'Logo design, brand guidelines, and color palette.',
  },
  {
    name: 'Social Media Setup',
    price: 'UGX 400,000',
    usdPrice: '~USD 110',
    description: 'Profile setup and optimization for 3 platforms.',
  },
  {
    name: 'Maintenance Plan (Per Month)',
    price: 'UGX 250,000 – 600,000',
    usdPrice: '~USD 65–160',
    description: 'Updates, backups, and security scans.',
  },
  {
    name: 'AI Chatbot Integration',
    price: 'UGX 1,500,000',
    usdPrice: '~USD 405',
    description: 'Automated customer support with WhatsApp or web chat.',
  },
];

const Catalogue: React.FC = () => {
  // State to track open/closed state for packages and add-ons
  const [packagesOpen, setPackagesOpen] = useState(false);
  const [addOnsOpen, setAddOnsOpen] = useState(false);

  // Toggle functions for each section
  const togglePackages = () => setPackagesOpen((prev) => !prev);
  const toggleAddOns = () => setAddOnsOpen((prev) => !prev);

  // Animation variants for staggered reveal
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  // Animation for accordion content
  const accordionVariants = {
    collapsed: { height: 0, opacity: 0, overflow: 'hidden' },
    expanded: { height: 'auto', opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  };

  // Animation for checkmarks
  const checkmarkVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.2, type: 'spring', stiffness: 200 } },
  };

  return (
    <section className="py-16 bg-[#fff6ea] relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#ff5831] mb-2 relative">
            Our Website Packages
            <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#00d66b]"></span>
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Choose a package tailored to your needs, from simple portfolios to complex web applications. All packages include lead capture via our contact form.
          </p>
        </motion.div>

        {/* Packages Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.name}
              variants={cardVariants}
              className="bg-white rounded-xl shadow-lg p-6 border border-[#ffd60a]/50 hover:shadow-xl hover:border-[#ffd60a] transition-all duration-300 flex flex-col"
            >
              {/* Card Header (Always Visible) */}
              <button
                onClick={togglePackages}
                className="flex justify-between items-center w-full text-left focus:outline-none focus:ring-2 focus:ring-[#ffd60a] rounded-lg"
                aria-expanded={packagesOpen}
                aria-controls={`package-details-${index}`}
              >
                <div>
                  <h3 className="text-2xl font-extrabold text-[#00d66b] mb-2">{pkg.name}</h3>
                  <p className="text-[#ad00ff] text-lg font-semibold mb-2 bg-clip-text bg-gradient-to-r from-[#ad00ff] to-[#ff5831]">
                    {pkg.price}
                  </p>
                  <p className="text-gray-600 text-sm">{pkg.usdPrice}</p>
                </div>
                <motion.div
                  animate={{ rotate: packagesOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-[#ffd60a]/20 rounded-full p-1"
                >
                  {packagesOpen ? (
                    <ChevronUp className="w-6 h-6 text-[#ffd60a]" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-[#ffd60a]" />
                  )}
                </motion.div>
              </button>

              {/* Collapsible Content */}
              <AnimatePresence>
                {packagesOpen && (
                  <motion.div
                    variants={accordionVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    id={`package-details-${index}`}
                    className="mt-4 flex-1"
                  >
                    <p className="text-gray-700 text-sm mb-4 font-medium">{pkg.idealFor}</p>
                    <p className="text-gray-600 text-sm mb-6">{pkg.description}</p>

                    {/* Features */}
                    <h4 className="text-sm font-bold text-[#ff5831] mb-2">Design</h4>
                    <ul className="space-y-2 mb-4">
                      {pkg.features.design.map((feature, i) => (
                        <motion.li
                          key={i}
                          variants={checkmarkVariants}
                          initial="hidden"
                          animate="visible"
                          className="flex items-start text-sm text-gray-700"
                        >
                          <CheckCircle className="w-4 h-4 text-[#ffd60a] mr-2 mt-1" />
                          {feature}
                        </motion.li>
                      ))}
                    </ul>
                    <h4 className="text-sm font-bold text-[#ff5831] mb-2">Functionality</h4>
                    <ul className="space-y-2 mb-4">
                      {pkg.features.functionality.map((feature, i) => (
                        <motion.li
                          key={i}
                          variants={checkmarkVariants}
                          initial="hidden"
                          animate="visible"
                          className="flex items-start text-sm text-gray-700"
                        >
                          <CheckCircle className="w-4 h-4 text-[#ffd60a] mr-2 mt-1" />
                          {feature}
                        </motion.li>
                      ))}
                    </ul>
                    <h4 className="text-sm font-bold text-[#ff5831] mb-2">SEO & Performance</h4>
                    <ul className="space-y-2 mb-4">
                      {pkg.features.seo.map((feature, i) => (
                        <motion.li
                          key={i}
                          variants={checkmarkVariants}
                          initial="hidden"
                          animate="visible"
                          className="flex items-start text-sm text-gray-700"
                        >
                          <CheckCircle className="w-4 h-4 text-[#ffd60a] mr-2 mt-1" />
                          {feature}
                        </motion.li>
                      ))}
                    </ul>
                    <h4 className="text-sm font-bold text-[#ff5831] mb-2">Support & Hosting</h4>
                    <ul className="space-y-2 mb-6">
                      {pkg.features.support.map((feature, i) => (
                        <motion.li
                          key={i}
                          variants={checkmarkVariants}
                          initial="hidden"
                          animate="visible"
                          className="flex items-start text-sm text-gray-700"
                        >
                          <CheckCircle className="w-4 h-4 text-[#ffd60a] mr-2 mt-1" />
                          {feature}
                        </motion.li>
                      ))}
                    </ul>

                    <p className="text-xs text-gray-500 mb-4 text-center">Timeline: {pkg.timeline}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA Button (Always Visible) */}
              <Link href="#contact">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="w-full bg-gradient-to-r from-[#00d66b] to-[#ffd60a] text-white py-3 rounded-lg hover:from-[#00ba5e] hover:to-[#ff5831] transition-all duration-300 shadow-md">
                    Get Started
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Add-Ons Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#ff5831] mb-2 relative">
            Optional Add-Ons
            <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#00d66b]"></span>
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Enhance your website with our tailored add-ons to boost functionality, visibility, and branding.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {addOns.map((addOn, index) => (
            <motion.div
              key={addOn.name}
              variants={cardVariants}
              className="bg-white rounded-xl p-6 border border-[#ffd60a]/50 hover:shadow-xl hover:border-[#ffd60a] transition-all duration-300"
            >
              {/* Card Header (Always Visible) */}
              <button
                onClick={toggleAddOns}
                className="flex justify-between items-center w-full text-left focus:outline-none focus:ring-2 focus:ring-[#ffd60a] rounded-lg"
                aria-expanded={addOnsOpen}
                aria-controls={`addon-details-${index}`}
              >
                <div>
                  <h3 className="text-xl font-extrabold text-[#00d66b] mb-2">{addOn.name}</h3>
                  <p className="text-[#ad00ff] text-lg font-semibold mb-2 bg-clip-text bg-gradient-to-r from-[#ad00ff] to-[#ff5831]">
                    {addOn.price}
                  </p>
                  <p className="text-gray-600 text-sm">{addOn.usdPrice}</p>
                </div>
                <motion.div
                  animate={{ rotate: addOnsOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-[#ffd60a]/20 rounded-full p-1"
                >
                  {addOnsOpen ? (
                    <ChevronUp className="w-6 h-6 text-[#ffd60a]" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-[#ffd60a]" />
                  )}
                </motion.div>
              </button>

              {/* Collapsible Content */}
              <AnimatePresence>
                {addOnsOpen && (
                  <motion.div
                    variants={accordionVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    id={`addon-details-${index}`}
                    className="mt-4"
                  >
                    <p className="text-gray-700 text-sm mb-6">{addOn.description}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA Button (Always Visible) */}
              <Link href="#contact">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="w-full bg-gradient-to-r from-[#ad00ff] to-[#ff5831] text-white py-3 rounded-lg hover:from-[#9900e6] hover:to-[#ffd60a] transition-all duration-300 shadow-md">
                    Add to Package
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mt-12"
        >
          <h3 className="text-2xl font-extrabold text-[#ff5831] mb-4">Ready to Build Your Website?</h3>
          <p className="text-gray-700 mb-6">
            Contact us today for a custom quote or to discuss your project needs.
          </p>
          <Link href="#contact">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-gradient-to-r from-[#00d66b] to-[#ffd60a] text-white px-8 py-4 rounded-lg hover:from-[#00ba5e] hover:to-[#ff5831] transition-all duration-300 shadow-lg">
                Get a Quote
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Catalogue;