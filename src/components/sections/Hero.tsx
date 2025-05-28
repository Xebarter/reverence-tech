'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser'; // Import EmailJS

const Hero = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    company: '',
    budget: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  const handleOpenModal = () => setShowModal(true);

  const handleCloseModal = () => {
    setShowModal(false);
    if (submitSuccess) {
      setSubmitSuccess(false);
      setFormData({
        email: '',
        phone: '',
        company: '',
        budget: '',
        description: '',
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send form data using EmailJS
      await emailjs.send(
        'service_r715yet', // Replace with your EmailJS Service ID
        'template_dzuk3kd', // Replace with your EmailJS Template ID
        formData, // Pass the form data directly
        'rFJHUz0d1a97DJjTT' // Replace with your EmailJS User ID
      );

      setIsSubmitting(false);
      setSubmitSuccess(true);
      console.log('Form submitted successfully:', formData);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Failed to submit form:', error);
      alert('There was an error submitting the form. Please try again later.');
    }
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

      {/* Hero content */}
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
          <Button
            size="lg"
            onClick={handleOpenModal}
            className="relative text-white px-8 py-4 text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            style={{ backgroundColor: '#ad00ff' }}
          >
            Get In Touch
          </Button>
        </motion.div>
      </motion.div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#fff6ea] rounded-xl shadow-xl w-full max-w-md relative border border-[#ffd60a]"
          >
            {/* Solid bar header */}
            <

div className="h-2 w-full bg-[#ff5831]" />

            <div className="p-6">
              {!submitSuccess ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-[#2d3748]">Tell us about your project</h3>
                    <button
                      onClick={handleCloseModal}
                      className="text-[#4a5568] hover:text-[#2d3748] transition-colors"
                      aria-label="Close form"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-[#2d3748] mb-1">
                        Email address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        className="w-full px-3 py-2 border border-[#ffd60a] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#00d66b]"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-[#2d3748] mb-1">
                        Phone number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (123) 456-7890"
                        className="w-full px-3 py-2 border border-[#ffd60a] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#00d66b]"
                      />
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-[#2d3748] mb-1">
                        Company/Business name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        required
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Your company name"
                        className="w-full px-3 py-2 border border-[#ffd60a] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#00d66b]"
                      />
                    </div>

                    <div>
                      <label htmlFor="budget" className="block text-sm font-medium text-[#2d3748] mb-1">
                        Budget range
                      </label>
                      <select
                        id="budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-[#ffd60a] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#00d66b]"
                      >
                        <option value="">Select a budget range</option>
                        <option value="< $5,000">Less than $5,000</option>
                        <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                        <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                        <option value="$25,000 - $50,000">$25,000 - $50,000</option>
                        <option value="> $50,000">More than $50,000</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-[#2d3748] mb-1">
                        Project description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows="3"
                        required
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Tell us briefly about your project or business needs"
                        className="w-full px-3 py-2 border border-[#ffd60a] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#00d66b]"
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#ad00ff] text-white py-2 rounded-md hover:bg-[#9700e0] transition-colors"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Submitting...
                          </span>
                        ) : (
                          'Submit'
                        )}
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="py-8 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="h-12 w-12 rounded-full bg-[#00d66b] flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[#2d3748] mb-2">Thank you!</h3>
                  <p className="text-[#4a5568] mb-6">We've received your information and will be in touch soon.</p>
                  <Button
                    onClick={handleCloseModal}
                    className="bg-[#00d66b] text-white py-2 px-6 rounded-md hover:bg-[#00bb5d] transition-colors"
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
};

// Initialize EmailJS with your User ID (run this once, e.g., in a useEffect or outside the component)
emailjs.init('YOUR_USER_ID'); // Replace with your EmailJS User ID

export default Hero;