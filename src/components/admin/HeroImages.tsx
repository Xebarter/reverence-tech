import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface HeroImage {
  id: string;
  title: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}

export default function HeroImages() {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingImage, setEditingImage] = useState<HeroImage | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    isActive: false,
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchHeroImages();
  }, []);

  const fetchHeroImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hero_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const images = data.map(img => ({
        id: img.id,
        title: img.title,
        imageUrl: img.image_url,
        isActive: img.is_active,
        createdAt: new Date(img.created_at).toLocaleDateString()
      }));

      setHeroImages(images);
    } catch (error) {
      console.error('Error fetching hero images:', error);
      alert('Error fetching hero images');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingImage) {
        // Update existing image
        const { error } = await supabase
          .from('hero_images')
          .update({
            title: formData.title,
            image_url: formData.imageUrl,
            is_active: formData.isActive
          })
          .eq('id', editingImage.id);

        if (error) throw error;
      } else {
        // Add new image
        const { error } = await supabase
          .from('hero_images')
          .insert({
            title: formData.title,
            image_url: formData.imageUrl,
            is_active: formData.isActive
          });

        if (error) throw error;
      }
      
      await fetchHeroImages();
      resetForm();
    } catch (error) {
      console.error('Error saving hero image:', error);
      alert('Error saving hero image');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this hero image?')) return;
    
    try {
      const { error } = await supabase
        .from('hero_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchHeroImages();
    } catch (error) {
      console.error('Error deleting hero image:', error);
      alert('Error deleting hero image');
    }
  };

  const handleEdit = (image: HeroImage) => {
    setEditingImage(image);
    setFormData({
      title: image.title,
      imageUrl: image.imageUrl,
      isActive: image.isActive,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      imageUrl: '',
      isActive: false,
    });
    setEditingImage(null);
    setShowForm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      
      if (!file) return;

      // Validate file type
      if (!file.type.match('image.*')) {
        throw new Error('Please select an image file');
      }

      // Upload image to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `hero-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('hero-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('hero-images')
        .getPublicUrl(filePath);

      // Update form data with new image URL
      setFormData({ ...formData, imageUrl: publicUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(error instanceof Error ? error.message : 'Error uploading image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hero Images</h1>
            <p className="text-gray-600 mt-2">Manage images displayed on the homepage hero section</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center px-4 py-2 bg-[#1C3D5A] text-white rounded-lg hover:bg-[#143040] transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Add Image
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingImage ? 'Edit Hero Image' : 'Add New Hero Image'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image
                </label>
                <div className="flex items-start space-x-2">
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="Enter image URL or upload file"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C3D5A]"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    disabled={uploading}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center whitespace-nowrap disabled:opacity-50"
                  >
                    {uploading ? (
                      <div className="w-4 h-4 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Upload size={18} className="mr-1" />
                        Upload
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-[#1C3D5A] focus:ring-[#1C3D5A] border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Set as active image
                  </label>
                </div>
              </div>
              
              {formData.imageUrl && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preview
                  </label>
                  <div className="border border-gray-300 rounded-md overflow-hidden">
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://placehold.co/600x400?text=Invalid+Image+URL';
                      }}
                    />
                  </div>
                </div>
              )}
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
                className="px-4 py-2 bg-[#1C3D5A] text-white rounded-md hover:bg-[#143040] transition-colors flex items-center"
                disabled={uploading}
              >
                <Upload size={18} className="mr-2" />
                {editingImage ? 'Update Image' : 'Upload Image'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {heroImages.map((image) => (
            <div key={image.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative">
                <img 
                  src={image.imageUrl} 
                  alt={image.title} 
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://placehold.co/600x400?text=Invalid+Image+URL';
                  }}
                />
                {image.isActive && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Active
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{image.title}</h3>
                <p className="text-sm text-gray-500 mt-1">Added: {image.createdAt}</p>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => handleEdit(image)}
                    className="p-2 text-gray-500 hover:text-indigo-600"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="p-2 text-gray-500 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && heroImages.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <ImageIcon className="mx-auto text-gray-400" size={48} />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No hero images</h3>
          <p className="mt-1 text-gray-500">Get started by adding a new hero image.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 px-4 py-2 bg-[#1C3D5A] text-white rounded-md hover:bg-[#143040] transition-colors"
          >
            Add Image
          </button>
        </div>
      )}
    </div>
  );
}