import { useState } from 'react';
import { Plus, Edit, Trash2, Star } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  company: string;
  role: string;
  content: string;
  rating: number;
  avatarUrl: string;
  isActive: boolean;
  createdAt: string;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      company: 'TechStart Uganda',
      role: 'CEO',
      content: 'Reverence Technology transformed our digital presence. Their team delivered beyond our expectations with a solution tailored for the Ugandan market.',
      rating: 5,
      avatarUrl: 'https://randomuser.me/api/portraits/women/32.jpg',
      isActive: true,
      createdAt: '2023-03-10',
    },
    {
      id: '2',
      name: 'Michael Okafor',
      company: 'Nile Logistics',
      role: 'CTO',
      content: 'The custom software solution helped us streamline operations and reduce costs by 30%. Highly recommended for businesses in East Africa.',
      rating: 4,
      avatarUrl: 'https://randomuser.me/api/portraits/men/54.jpg',
      isActive: true,
      createdAt: '2023-04-22',
    },
  ]);
  
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    role: '',
    content: '',
    rating: 5,
    avatarUrl: '',
    isActive: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTestimonial) {
      // Update existing testimonial
      setTestimonials(testimonials.map(t => 
        t.id === editingTestimonial.id 
          ? { ...t, ...formData } 
          : t
      ));
    } else {
      // Add new testimonial
      const newTestimonial: Testimonial = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setTestimonials([...testimonials, newTestimonial]);
    }
    
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    setTestimonials(testimonials.filter(t => t.id !== id));
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      company: testimonial.company,
      role: testimonial.role,
      content: testimonial.content,
      rating: testimonial.rating,
      avatarUrl: testimonial.avatarUrl,
      isActive: testimonial.isActive,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      company: '',
      role: '',
      content: '',
      rating: 5,
      avatarUrl: '',
      isActive: true,
    });
    setEditingTestimonial(null);
    setShowForm(false);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Testimonials</h1>
            <p className="text-gray-600 mt-2">Manage customer testimonials and reviews</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center px-4 py-2 bg-[#1C3D5A] text-white rounded-lg hover:bg-[#143040] transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Add Testimonial
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company *
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role/Position
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar URL
                </label>
                <input
                  type="text"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Testimonial Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="text-2xl focus:outline-none"
                    >
                      {star <= formData.rating ? '★' : '☆'}
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-500">({formData.rating}/5)</span>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-[#1C3D5A] focus:ring-[#1C3D5A] border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Publish testimonial
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#1C3D5A] text-white rounded-md hover:bg-[#143040] transition-colors"
              >
                {editingTestimonial ? 'Update Testimonial' : 'Add Testimonial'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start">
              <img
                src={testimonial.avatarUrl}
                alt={testimonial.name}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://placehold.co/100x100?text=Avatar';
                }}
              />
              <div className="ml-4 flex-1">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</p>
                  </div>
                  {testimonial.isActive && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Published
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  {renderStars(testimonial.rating)}
                </div>
                <p className="mt-3 text-gray-700 italic">"{testimonial.content}"</p>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(testimonial)}
                    className="p-2 text-gray-500 hover:text-indigo-600"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    className="p-2 text-gray-500 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {testimonials.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Star className="mx-auto text-gray-400" size={48} />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No testimonials</h3>
          <p className="mt-1 text-gray-500">Get started by adding a new testimonial.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 px-4 py-2 bg-[#1C3D5A] text-white rounded-md hover:bg-[#143040] transition-colors"
          >
            Add Testimonial
          </button>
        </div>
      )}
    </div>
  );
}