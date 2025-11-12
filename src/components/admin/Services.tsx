import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Service {
  id: string;
  package_name: string;
  description: string;
  key_features: { feature: string }[];
  target_audience: { audience: string }[];
  suggested_pricing: string;
  display_order: number;
  created_at: string;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Omit<Service, 'id' | 'created_at'>>({
    package_name: '',
    description: '',
    key_features: [],
    target_audience: [],
    suggested_pricing: '',
    display_order: 0,
  });
  const [newFeature, setNewFeature] = useState('');
  const [newAudience, setNewAudience] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingService) {
        // Update existing service
        const { error } = await supabase
          .from('services')
          .update(formData)
          .eq('id', editingService.id);
        
        if (error) throw error;
      } else {
        // Create new service
        const { error } = await supabase
          .from('services')
          .insert([formData]);
        
        if (error) throw error;
      }
      
      // Reset form
      resetForm();
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      package_name: '',
      description: '',
      key_features: [],
      target_audience: [],
      suggested_pricing: '',
      display_order: 0,
    });
    setNewFeature('');
    setNewAudience('');
    setEditingService(null);
    setShowForm(false);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      package_name: service.package_name,
      description: service.description,
      key_features: [...service.key_features],
      target_audience: [...service.target_audience],
      suggested_pricing: service.suggested_pricing,
      display_order: service.display_order,
    });
    setShowForm(true);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        key_features: [...formData.key_features, { feature: newFeature.trim() }],
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...formData.key_features];
    newFeatures.splice(index, 1);
    setFormData({ ...formData, key_features: newFeatures });
  };

  const addAudience = () => {
    if (newAudience.trim()) {
      setFormData({
        ...formData,
        target_audience: [...formData.target_audience, { audience: newAudience.trim() }],
      });
      setNewAudience('');
    }
  };

  const removeAudience = (index: number) => {
    const newAudienceList = [...formData.target_audience];
    newAudienceList.splice(index, 1);
    setFormData({ ...formData, target_audience: newAudienceList });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Services</h1>
              <p className="text-gray-600 mt-2">Manage service packages and offerings</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center justify-center px-4 py-2 w-full sm:w-auto bg-[#1C3D5A] text-white rounded-lg hover:bg-[#143040] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50"
            >
              <Plus size={20} className="mr-2" />
              Add Service
            </button>
          </div>
        </div>

        {showForm && (
          <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    value={formData.package_name}
                    onChange={(e) => setFormData({ ...formData, package_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 focus:border-transparent transition-colors"
                    placeholder="Enter package name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Suggested Pricing *
                  </label>
                  <input
                    type="text"
                    value={formData.suggested_pricing}
                    onChange={(e) => setFormData({ ...formData, suggested_pricing: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 focus:border-transparent transition-colors"
                    placeholder="e.g., $99/month"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 focus:border-transparent transition-colors"
                    placeholder="0"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 focus:border-transparent transition-colors resize-vertical"
                    placeholder="Describe the service package"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Features
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 mb-2">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Add a feature"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 focus:border-transparent transition-colors"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-4 py-2 bg-[#1C3D5A] text-white rounded-md hover:bg-[#143040] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 flex-shrink-0 whitespace-nowrap"
                      disabled={!newFeature.trim()}
                    >
                      Add
                    </button>
                  </div>
                  {formData.key_features.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.key_features.map((featureObj, index) => (
                        <div key={index} className="flex items-center bg-[#1C3D5A]/5 text-[#1C3D5A] rounded-full px-3 py-1">
                          <span className="text-sm">{featureObj.feature}</span>
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="ml-2 text-[#1C3D5A]/70 hover:text-[#1C3D5A] transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Audience
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 mb-2">
                    <input
                      type="text"
                      value={newAudience}
                      onChange={(e) => setNewAudience(e.target.value)}
                      placeholder="Add target audience"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 focus:border-transparent transition-colors"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAudience())}
                    />
                    <button
                      type="button"
                      onClick={addAudience}
                      className="px-4 py-2 bg-[#1C3D5A] text-white rounded-md hover:bg-[#143040] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 flex-shrink-0 whitespace-nowrap"
                      disabled={!newAudience.trim()}
                    >
                      Add
                    </button>
                  </div>
                  {formData.target_audience.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.target_audience.map((audienceObj, index) => (
                        <div key={index} className="flex items-center bg-[#1C3D5A]/5 text-[#1C3D5A] rounded-full px-3 py-1">
                          <span className="text-sm">{audienceObj.audience}</span>
                          <button
                            type="button"
                            onClick={() => removeAudience(index)}
                            className="ml-2 text-[#1C3D5A]/70 hover:text-[#1C3D5A] transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end sm:space-x-3 sm:space-y-0 space-y-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500/50 w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1C3D5A] text-white rounded-md hover:bg-[#143040] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 w-full sm:w-auto"
                >
                  {editingService ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{service.package_name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:ml-4">
                    <span className="px-3 py-1 bg-[#1C3D5A]/10 text-[#1C3D5A] rounded-full text-sm font-medium whitespace-nowrap">
                      {service.suggested_pricing}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs whitespace-nowrap">
                      Order: {service.display_order}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-xs text-gray-500 font-medium">Features:</span>
                  {service.key_features.slice(0, 3).map((featureObj, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#1C3D5A]/10 text-[#1C3D5A]">
                      {featureObj.feature}
                    </span>
                  ))}
                  {service.key_features.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                      +{service.key_features.length - 3}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(service)}
                    className="text-[#1C3D5A] hover:text-[#143040] p-1 rounded focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]/50 transition-colors"
                    aria-label="Edit service"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="text-red-600 hover:text-red-900 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-colors"
                    aria-label="Delete service"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            
            {services.length === 0 && !loading && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="text-gray-400 mb-4">
                  <Plus className="mx-auto h-12 w-12" />
                </div>
                <p className="text-gray-500 text-lg">No services found</p>
                <p className="text-gray-400 mt-1">Get started by adding your first service package.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}