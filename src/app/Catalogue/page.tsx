'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      seo: [
        'Basic SEO (meta tags, sitemap, alt text optimization)',
        'Fast-loading design (optimized images, caching)',
      ],
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
      design: [
        'Up to 15 custom pages',
        'Premium WordPress theme with animations',
        'Accessibility compliance (WCAG 2.1 basics)',
      ],
      functionality: [
        'Contact form with email notifications',
        'CMS (WordPress) with user training',
        'Basic eCommerce (WooCommerce, up to 20 products) or booking system',
        'WhatsApp or live chat integration',
      ],
      seo: [
        'Advanced SEO (keyword research, 5 optimized pages, schema markup)',
        'Google Analytics and Search Console setup',
        'PWA support for app-like mobile experience',
      ],
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
    idealFor:
      'Businesses selling products or services online (retail, restaurants)',
    description:
      'Launch a full-featured online store with secure payments and inventory management, designed to convert with bold buttons and highlights. SEO drives traffic.',
    timeline: '8–12 weeks',
    features: {
      design: [
        'Up to 25 pages (Home, Shop, About, Contact, Blog, Policies)',
        'Custom WooCommerce or Shopify design',
        'Product page animations',
      ],
      functionality: [
        'Full eCommerce setup (unlimited products, cart, checkout)',
        'Secure payment gateways (Mobile Money, Visa, PayPal)',
        'Contact form with email notifications',
        'Inventory and order management',
        'Customer accounts and order tracking',
      ],
      seo: [
        'Comprehensive SEO (10 optimized pages, technical SEO, local SEO)',
        'Marketing tools (discounts, coupons, email capture)',
        'Google Analytics, heatmaps for user behavior',
      ],
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
    idealFor:
      'Large businesses, NGOs, institutions, or government agencies',
    description:
      'A premium, high-performance website with advanced features like multi-language support and API integrations, styled with bold CTAs and accents.',
    timeline: '12–20 weeks',
    features: {
      design: [
        '30+ custom pages or dynamic structure',
        'Bespoke WordPress theme with micro-interactions',
        'Multi-language support (e.g., English, Luganda)',
      ],
      functionality: [
        'Advanced CMS with custom admin panel',
        'Contact form with email notifications',
        'Membership or user login system',
        'API integrations (e.g., payment, SMS, ERP)',
      ],
      seo: [
        'Enterprise SEO (15 optimized pages, technical audits, link-building strategy)',
        'Conversion rate optimization (CRO) with A/B testing',
        'Analytics suite (Google Analytics, Tag Manager, heatmaps)',
      ],
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
    idealFor:
      'Marketplaces, booking platforms, SaaS, or unique systems',
    description:
      'A fully tailored web application built for scalability, with real-time features and custom APIs, designed in your vibrant style for innovative projects.',
    timeline: '16–30 weeks',
    features: {
      design: [
        'Custom UI/UX design with vibrant backgrounds',
        'Interactive prototypes and animations',
      ],
      functionality: [
        'Fully custom backend (Node.js, Laravel, or similar)',
        'User authentication and role-based access',
        'Contact form with email notifications',
        'Real-time features (chat, notifications, live updates)',
        'Custom API development',
      ],
      seo: [
        'SEO tailored to app goals (e.g., marketplace visibility)',
        'Scalable cloud hosting (AWS, Google Cloud)',
        'Performance optimization (CDN, caching)',
      ],
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

const Catalogue = () => {
  // State to track open/closed state of each card
  const [openCards, setOpenCards] = useState<{ [key: string]: boolean }>({});

  // Toggle card open/closed state
  const toggleCard = (cardId: string) => {
    setOpenCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  // Animation for accordion content
  const accordionVariants = {
    collapsed: {
      height: 0,
      opacity: 0,
      overflow: 'hidden',
    },
    expanded: {
      height: 'auto',
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  return (
    <div className="min-h-screen bg-[#fff6ea]">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-[#ff5831] mb-6">
            Website Packages
          </h1>
          <p className="text-gray-700 max-w-3xl mx-auto text-lg">
            Choose a package tailored to your needs, from simple portfolios to
            complex web applications. All packages include responsive design and
            lead capture.
          </p>
        </motion.div>

        {/* Packages Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-20"
        >
          {packages.map((pkg, index) => {
            const cardId = `package-${index}`;
            const isOpen = !!openCards[cardId];

            return (
              <motion.div
                key={pkg.name}
                variants={cardVariants}
                className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
              >
                <div className="p-6">
                  {/* Card Header */}
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-[#ff5831] mb-2">
                      {pkg.name}
                    </h3>
                    <p className="text-[#ad00ff] text-xl font-semibold">
                      {pkg.price}
                    </p>
                    <p className="text-gray-500 text-sm">{pkg.usdPrice}</p>
                  </div>

                  <p className="text-gray-700 text-sm font-medium mb-4">
                    {pkg.idealFor}
                  </p>
                  <p className="text-gray-600 text-sm mb-6">
                    {pkg.description}
                  </p>

                  {/* Timeline */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-gray-500 text-sm">Timeline</span>
                    <span className="bg-[#ff5831]/10 text-[#ff5831] text-sm py-1 px-3 rounded-full font-medium">
                      {pkg.timeline}
                    </span>
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={() => toggleCard(cardId)}
                    className="flex items-center justify-center w-full py-3 px-4 bg-[#ffd60a]/10 text-[#ffd60a] rounded-lg font-medium hover:bg-[#ffd60a]/20 transition-colors duration-200"
                  >
                    {isOpen ? 'Hide Details' : 'View Details'}
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 ml-2" />
                    ) : (
                      <ChevronDown className="w-5 h-5 ml-2" />
                    )}
                  </button>

                  {/* Expandable Content */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        variants={accordionVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        className="mt-6"
                      >
                        {/* Features */}
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-bold text-[#00d66b] mb-3 flex items-center">
                              <span className="w-1 h-4 bg-[#00d66b] mr-2 rounded-full"></span>
                              Design
                            </h4>
                            <ul className="space-y-2">
                              {pkg.features.design.map((feature, i) => (
                                <li
                                  key={i}
                                  className="flex items-start text-sm leading-relaxed text-gray-700"
                                >
                                  <span className="text-[#00d66b] mr-2 text-lg">
                                    •
                                  </span>{' '}
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-sm font-bold text-[#ff5831] mb-3 flex items-center">
                              <span className="w-1 h-4 bg-[#ff5831] mr-2 rounded-full"></span>
                              Functionality
                            </h4>
                            <ul className="space-y-2">
                              {pkg.features.functionality.map((feature, i) => (
                                <li
                                  key={i}
                                  className="flex items-start text-sm leading-relaxed text-gray-700"
                                >
                                  <span className="text-[#ff5831] mr-2 text-lg">
                                    •
                                  </span>{' '}
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-sm font-bold text-[#ffd60a] mb-3 flex items-center">
                              <span className="w-1 h-4 bg-[#ffd60a] mr-2 rounded-full"></span>
                              SEO & Performance
                            </h4>
                            <ul className="space-y-2">
                              {pkg.features.seo.map((feature, i) => (
                                <li
                                  key={i}
                                  className="flex items-start text-sm leading-relaxed text-gray-700"
                                >
                                  <span className="text-[#ffd60a] mr-2 text-lg">
                                    •
                                  </span>{' '}
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-sm font-bold text-[#ad00ff] mb-3 flex items-center">
                              <span className="w-1 h-4 bg-[#ad00ff] mr-2 rounded-full"></span>
                              Support & Hosting
                            </h4>
                            <ul className="space-y-2">
                              {pkg.features.support.map((feature, i) => (
                                <li
                                  key={i}
                                  className="flex items-start text-sm leading-relaxed text-gray-700"
                                >
                                  <span className="text-[#ad00ff] mr-2 text-lg">
                                    •
                                  </span>{' '}
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* CTA Button */}
                <div className="px-6 pb-6">
                  <a
                    href="#contact"
                    className="block w-full py-3 px-6 bg-[#00d66b] text-white text-center font-semibold rounded-lg transition-colors duration-300 hover:bg-[#00ba5e]"
                  >
                    Get Started
                  </a>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Add-Ons Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-[#ad00ff] mb-4">
            Optional Add-Ons
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Enhance your website with tailored add-ons to boost functionality,
            visibility, and branding.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16"
        >
          {addOns.map((addOn, index) => (
            <motion.div
              key={addOn.name}
              variants={cardVariants}
              className="bg-white rounded-xl p-5 shadow hover:shadow-md transition-shadow duration-300"
            >
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-[#ff5831]">
                  {addOn.name}
                </h3>
                <p className="text-[#00d66b] font-medium">{addOn.price}</p>
                <p className="text-gray-500 text-xs">{addOn.usdPrice}</p>
              </div>
              <p className="text-gray-600 text-sm mb-4">{addOn.description}</p>
              <a
                href="#contact"
                className="block w-full py-2 px-4 bg-[#ad00ff]/10 text-[#ad00ff] text-center font-medium rounded-lg transition-colors duration-300 hover:bg-[#ad00ff]/20"
              >
                Add to Package
              </a>
            </motion.div>
          ))}
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center bg-white p-10 rounded-2xl shadow-lg max-w-3xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-[#ff5831] mb-4">
            Ready to Build Your Website?
          </h3>
          <p className="text-gray-700 mb-6">
            Contact us today for a custom quote or to discuss your project needs.
          </p>
          <a
            href="#contact"
            className="inline-block py-4 px-8 bg-[#00d66b] text-white font-semibold rounded-lg transition-colors duration-300 hover:bg-[#00ba5e]"
          >
            Get a Free Quote
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default Catalogue;
