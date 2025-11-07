import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  employment_type: string;
  salary_range: string | null;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  is_published: boolean;
  application_link: string | null;
  created_at: string;
  updated_at: string;
}

interface JobApplication {
  id: string;
  job_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  cover_letter: string | null;
  resume_url: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  job?: Job; // For displaying job title
}

export default function CareersManagement() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [viewingApplication, setViewingApplication] = useState<JobApplication | null>(null);
  const [formData, setFormData] = useState<Omit<Job, 'id' | 'created_at' | 'updated_at'>>({
    title: '',
    description: '',
    location: '',
    employment_type: '',
    salary_range: '',
    responsibilities: [],
    requirements: [],
    benefits: [],
    is_published: false,
    application_link: ''
  });
  const [newListItem, setNewListItem] = useState({
    responsibility: '',
    requirement: '',
    benefit: ''
  });

  useEffect(() => {
    fetchJobs();
    if (activeTab === 'applications') {
      fetchApplications();
    }
  }, [activeTab]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job:jobs(title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddListItem = (field: 'responsibilities' | 'requirements' | 'benefits') => {
    const newValue = newListItem[field.slice(0, -1) as keyof typeof newListItem];
    if (!newValue.trim()) return;

    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], newValue.trim()]
    }));

    setNewListItem(prev => ({
      ...prev,
      [field.slice(0, -1)]: ''
    }));
  };

  const handleRemoveListItem = (field: 'responsibilities' | 'requirements' | 'benefits', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingJob) {
        // Update existing job
        const { error } = await supabase
          .from('jobs')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingJob.id);

        if (error) throw error;
      } else {
        // Create new job
        const { error } = await supabase
          .from('jobs')
          .insert([formData]);

        if (error) throw error;
      }

      // Reset form and refresh data
      setIsModalOpen(false);
      setEditingJob(null);
      resetForm();
      fetchJobs();
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Error saving job. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      employment_type: '',
      salary_range: '',
      responsibilities: [],
      requirements: [],
      benefits: [],
      is_published: false,
      application_link: ''
    });
    setNewListItem({
      responsibility: '',
      requirement: '',
      benefit: ''
    });
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      location: job.location,
      employment_type: job.employment_type,
      salary_range: job.salary_range,
      responsibilities: job.responsibilities,
      requirements: job.requirements,
      benefits: job.benefits,
      is_published: job.is_published,
      application_link: job.application_link
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Error deleting job. Please try again.');
    }
  };

  const togglePublishStatus = async (job: Job) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ 
          is_published: !job.is_published,
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);

      if (error) throw error;
      fetchJobs();
    } catch (error) {
      console.error('Error updating publish status:', error);
      alert('Error updating publish status. Please try again.');
    }
  };

  const handleViewApplication = (application: JobApplication) => {
    setViewingApplication(application);
    setIsApplicationModalOpen(true);
  };

  const handleUpdateApplicationStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      fetchApplications();
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Error updating application status. Please try again.');
    }
  };

  const handleUpdateApplicationNotes = async (id: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ 
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      fetchApplications();
    } catch (error) {
      console.error('Error updating application notes:', error);
      alert('Error updating application notes. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Careers Management</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Careers Management</h1>
        {activeTab === 'jobs' && (
          <button
            onClick={() => {
              setEditingJob(null);
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-[#1C3D5A] text-white px-4 py-2 rounded-lg hover:bg-[#2DBE7E] transition-colors font-medium"
          >
            Add New Job
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'jobs'
                ? 'border-[#1C3D5A] text-[#1C3D5A]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Job Postings
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'applications'
                ? 'border-[#1C3D5A] text-[#1C3D5A]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Applications
            {applications.length > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1C3D5A] text-white">
                {applications.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Job Postings Tab */}
      {activeTab === 'jobs' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {jobs.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No job postings yet.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{job.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{job.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {job.employment_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => togglePublishStatus(job)}
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          job.is_published 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {job.is_published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(job)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {applications.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No job applications yet.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{application.full_name}</div>
                      <div className="text-sm text-gray-500">{application.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{application.job?.title || 'Unknown Position'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(application.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        application.status === 'new' ? 'bg-yellow-100 text-yellow-800' :
                        application.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                        application.status === 'interview' ? 'bg-purple-100 text-purple-800' :
                        application.status === 'hired' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewApplication(application)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Job Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}
                </h2>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingJob(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1C3D5A] focus:border-[#1C3D5A]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Location *
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1C3D5A] focus:border-[#1C3D5A]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="employment_type" className="block text-sm font-medium text-gray-700 mb-1">
                      Employment Type *
                    </label>
                    <input
                      type="text"
                      id="employment_type"
                      name="employment_type"
                      value={formData.employment_type}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Full-time, Part-time, Contract"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1C3D5A] focus:border-[#1C3D5A]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="salary_range" className="block text-sm font-medium text-gray-700 mb-1">
                      Salary Range
                    </label>
                    <input
                      type="text"
                      id="salary_range"
                      name="salary_range"
                      value={formData.salary_range || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., UGX 2,000,000 - 3,500,000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1C3D5A] focus:border-[#1C3D5A]"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="application_link" className="block text-sm font-medium text-gray-700 mb-1">
                      Application Link
                    </label>
                    <input
                      type="text"
                      id="application_link"
                      name="application_link"
                      value={formData.application_link || ''}
                      onChange={handleInputChange}
                      placeholder="External application form URL (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1C3D5A] focus:border-[#1C3D5A]"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Job Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1C3D5A] focus:border-[#1C3D5A]"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Responsibilities</h3>
                  <div className="flex mb-2">
                    <input
                      type="text"
                      value={newListItem.responsibility}
                      onChange={(e) => setNewListItem({...newListItem, responsibility: e.target.value})}
                      placeholder="Add a responsibility"
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-[#1C3D5A] focus:border-[#1C3D5A]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddListItem('responsibilities')}
                      className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-r-md"
                    >
                      Add
                    </button>
                  </div>
                  <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                    {formData.responsibilities.map((item, index) => (
                      <li key={index} className="flex justify-between items-center px-4 py-2">
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveListItem('responsibilities', index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Requirements</h3>
                  <div className="flex mb-2">
                    <input
                      type="text"
                      value={newListItem.requirement}
                      onChange={(e) => setNewListItem({...newListItem, requirement: e.target.value})}
                      placeholder="Add a requirement"
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-[#1C3D5A] focus:border-[#1C3D5A]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddListItem('requirements')}
                      className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-r-md"
                    >
                      Add
                    </button>
                  </div>
                  <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                    {formData.requirements.map((item, index) => (
                      <li key={index} className="flex justify-between items-center px-4 py-2">
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveListItem('requirements', index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Benefits</h3>
                  <div className="flex mb-2">
                    <input
                      type="text"
                      value={newListItem.benefit}
                      onChange={(e) => setNewListItem({...newListItem, benefit: e.target.value})}
                      placeholder="Add a benefit"
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-[#1C3D5A] focus:border-[#1C3D5A]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddListItem('benefits')}
                      className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-r-md"
                    >
                      Add
                    </button>
                  </div>
                  <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                    {formData.benefits.map((item, index) => (
                      <li key={index} className="flex justify-between items-center px-4 py-2">
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveListItem('benefits', index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex items-center mb-6">
                  <input
                    id="is_published"
                    name="is_published"
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-[#1C3D5A] focus:ring-[#1C3D5A] border-gray-300 rounded"
                  />
                  <label htmlFor="is_published" className="ml-2 block text-sm text-gray-900">
                    Publish this job posting
                  </label>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingJob(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1C3D5A] text-white rounded-lg hover:bg-[#2DBE7E] transition-colors font-medium"
                  >
                    {editingJob ? 'Update Job' : 'Create Job'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Application Detail Modal */}
      {isApplicationModalOpen && viewingApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                <button 
                  onClick={() => {
                    setIsApplicationModalOpen(false);
                    setViewingApplication(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Applicant Information</h3>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{viewingApplication.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{viewingApplication.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{viewingApplication.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Applied Position</p>
                      <p className="font-medium">{viewingApplication.job?.title || 'Unknown Position'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Application Status</h3>
                  <div className="mt-2 flex items-center space-x-4">
                    <select
                      value={viewingApplication.status}
                      onChange={(e) => handleUpdateApplicationStatus(viewingApplication.id, e.target.value)}
                      className="block w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1C3D5A] focus:border-[#1C3D5A] sm:text-sm"
                    >
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="interview">Interview</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      viewingApplication.status === 'new' ? 'bg-yellow-100 text-yellow-800' :
                      viewingApplication.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                      viewingApplication.status === 'interview' ? 'bg-purple-100 text-purple-800' :
                      viewingApplication.status === 'hired' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {viewingApplication.status.charAt(0).toUpperCase() + viewingApplication.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Cover Letter</h3>
                  <div className="mt-2 bg-gray-50 p-4 rounded-md">
                    {viewingApplication.cover_letter ? (
                      <p className="whitespace-pre-line">{viewingApplication.cover_letter}</p>
                    ) : (
                      <p className="text-gray-500 italic">No cover letter provided</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Internal Notes</h3>
                  <div className="mt-2">
                    <textarea
                      value={viewingApplication.notes || ''}
                      onChange={(e) => handleUpdateApplicationNotes(viewingApplication.id, e.target.value)}
                      rows={3}
                      className="shadow-sm focus:ring-[#1C3D5A] focus:border-[#1C3D5A] block w-full sm:text-sm border border-gray-300 rounded-md p-3"
                      placeholder="Add notes about this application..."
                    />
                  </div>
                </div>
                
                {viewingApplication.resume_url && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Resume</h3>
                    <div className="mt-2">
                      <a 
                        href={viewingApplication.resume_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#1C3D5A] hover:text-[#2DBE7E] font-medium"
                      >
                        Download Resume (PDF)
                      </a>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setIsApplicationModalOpen(false);
                      setViewingApplication(null);
                    }}
                    className="px-4 py-2 bg-[#1C3D5A] text-white rounded-lg hover:bg-[#2DBE7E] transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}