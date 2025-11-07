import { useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';
import { Star } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  // Handle escape key press
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Add event listeners
  useState(() => {
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  });

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#E5E8EB] rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>,
    document.body
  );
};

export default function SubmitTestimonial({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    role: '',
    content: '',
    rating: 0,
    avatar_url: '',
  });
  
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleRatingClick = (rating: number) => {
    setFormData({ ...formData, rating });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    // Validate required fields
    if (!formData.name || !formData.company || !formData.content || formData.rating === 0) {
      setError('Please fill in all required fields and provide a rating.');
      setSubmitting(false);
      return;
    }

    try {
      const { error: submitError } = await supabase
        .from('testimonials')
        .insert([
          {
            name: formData.name,
            company: formData.company,
            role: formData.role,
            content: formData.content,
            rating: formData.rating,
            avatar_url: formData.avatar_url || null,
            is_active: false, // Default to inactive until reviewed
          }
        ]);

      if (submitError) throw submitError;

      setSubmitted(true);
      
      // Reset form after successful submission
      setFormData({
        name: '',
        company: '',
        role: '',
        content: '',
        rating: 0,
        avatar_url: '',
      });
    } catch (err) {
      setError('Failed to submit testimonial. Please try again.');
      console.error('Error submitting testimonial:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmitted(false);
    setFormData({
      name: '',
      company: '',
      role: '',
      content: '',
      rating: 0,
      avatar_url: '',
    });
  };

  const handleClose = () => {
    onClose();
    // Reset form when closing
    setTimeout(() => {
      setSubmitted(false);
      setError('');
      setFormData({
        name: '',
        company: '',
        role: '',
        content: '',
        rating: 0,
        avatar_url: '',
      });
    }, 300);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1C3D5A] mb-2">
                Share Your <span className="text-[#2DBE7E]">Experience</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We'd love to hear about your experience working with us. Your feedback helps us improve and inspires others.
              </p>
            </div>
            <button 
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-3xl leading-none font-bold ml-4"
              aria-label="Close form"
            >
              &times;
            </button>
          </div>
        </div>

        {submitted ? (
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-[#2DBE7E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[#2DBE7E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-600 mb-6">
              Your testimonial has been submitted successfully. It will be reviewed and published shortly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleResetForm}
                className="px-6 py-3 bg-[#1C3D5A] text-white rounded-lg hover:bg-[#143040] transition-colors"
              >
                Submit Another Testimonial
              </button>
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-[#1C3D5A] mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#2DBE7E] focus:ring-2 focus:ring-[#2DBE7E]/20 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-semibold text-[#1C3D5A] mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#2DBE7E] focus:ring-2 focus:ring-[#2DBE7E]/20 outline-none transition-all"
                    placeholder="Company Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="role" className="block text-sm font-semibold text-[#1C3D5A] mb-2">
                    Role/Position
                  </label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#2DBE7E] focus:ring-2 focus:ring-[#2DBE7E]/20 outline-none transition-all"
                    placeholder="Your Position"
                  />
                </div>

                <div>
                  <label htmlFor="avatar_url" className="block text-sm font-semibold text-[#1C3D5A] mb-2">
                    Avatar URL (optional)
                  </label>
                  <input
                    type="url"
                    id="avatar_url"
                    name="avatar_url"
                    value={formData.avatar_url}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#2DBE7E] focus:ring-2 focus:ring-[#2DBE7E]/20 outline-none transition-all"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1C3D5A] mb-2">
                  Rating *
                </label>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-3xl focus:outline-none"
                    >
                      <Star
                        className={`${
                          star <= (hoverRating || formData.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                  <span className="ml-3 text-gray-600">
                    {formData.rating > 0 ? `${formData.rating} of 5 stars` : 'Select rating'}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-semibold text-[#1C3D5A] mb-2">
                  Your Testimonial *
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#2DBE7E] focus:ring-2 focus:ring-[#2DBE7E]/20 outline-none transition-all resize-none"
                  placeholder="Share your experience working with us..."
                />
              </div>

              <div className="pt-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-8 py-4 bg-[#1C3D5A] text-white rounded-lg hover:bg-[#143040] transition-all duration-300 font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Testimonial'}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full sm:w-auto px-8 py-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-300 font-semibold text-lg flex items-center justify-center gap-2"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-center text-sm text-gray-500 mt-3">
                  * Required fields
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </Modal>
  );
}