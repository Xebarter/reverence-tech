import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';
import { Star, Upload } from 'lucide-react';

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
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPEG, PNG, GIF, etc.)');
        return;
      }
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('File size must be less than 2MB');
        return;
      }
      
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return null;
    
    try {
      // Validate file type and size (max 2MB)
      if (!avatarFile.type.match('image.*')) {
        throw new Error('Please select a valid image file (JPEG, PNG, GIF)');
      }
      if (avatarFile.size > 2 * 1024 * 1024) {
        throw new Error('Image size must be less than 2MB');
      }

      // Generate unique file name
      const fileExt = avatarFile.name.split('.').pop()?.toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('testimonials')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('testimonials')
        .getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error('Failed to generate public URL');
      }

      return publicUrl;
    } catch (err) {
      console.error('Error uploading avatar:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to upload avatar image');
    }
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
      // Upload avatar if provided
      let uploadedAvatarUrl = null;
      if (avatarFile) {
        uploadedAvatarUrl = await uploadAvatar();
      }
      
      const { error: submitError } = await supabase
        .from('testimonials')
        .insert([
          {
            name: formData.name,
            company: formData.company,
            role: formData.role,
            content: formData.content,
            rating: formData.rating,
            avatar_url: uploadedAvatarUrl || null,
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
      });
      setAvatarFile(null);
      setAvatarPreview(null);
      setAvatarUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit testimonial. Please try again.');
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
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      });
      setAvatarFile(null);
      setAvatarPreview(null);
      setAvatarUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
                  <label className="block text-sm font-semibold text-[#1C3D5A] mb-2">
                    Avatar (optional)
                  </label>
                  <div className="flex items-center space-x-4">
                    {avatarPreview ? (
                      <div className="relative">
                        <img 
                          src={avatarPreview} 
                          alt="Avatar preview" 
                          className="w-16 h-16 rounded-full object-cover border-2 border-[#1C3D5A]"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          aria-label="Remove avatar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Upload className="mr-2" size={18} />
                        {avatarFile ? 'Change Avatar' : 'Upload Avatar'}
                      </button>
                      <p className="text-xs text-gray-500 mt-1">JPEG, PNG, GIF (max 2MB)</p>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>
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