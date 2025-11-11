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
      try {
        console.error('Error details:', {
          message: (error as any)?.message,
          status: (error as any)?.status,
          details: (error as any)?.details
        });
      } catch (err) { }
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
          .insert([{
            ...formData,
            salary_range: formData.salary_range || null,
            application_link: formData.application_link || null
          }]);

        if (error) throw error;
      }

      // Reset form and close modal
      resetForm();
      setIsModalOpen(false);
      fetchJobs();
    } catch (error) {
      console.error('Error saving job:', error);
      try {
        console.error('Error details:', {
          message: (error as any)?.message,
          status: (error as any)?.status,
          details: (error as any)?.details
        });
      } catch (err) { }
      alert('Error saving job. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;

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

  const handleStatusChange = async (applicationId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', applicationId);

      if (error) throw error;
      fetchApplications();
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Error updating application status. Please try again.');
    }
  };

  const resetForm = () => {
    setEditingJob(null);
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

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      location: job.location,
      employment_type: job.employment_type,
      salary_range: job.salary_range || '',
      responsibilities: [...job.responsibilities],
      requirements: [...job.requirements],
      benefits: [...job.benefits],
      is_published: job.is_published,
      application_link: job.application_link || ''
    });
    setNewListItem({
      responsibility: '',
      requirement: '',
      benefit: ''
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const addListItem = (type: 'responsibility' | 'requirement' | 'benefit') => {
    const newItem = newListItem[type].trim();
    if (!newItem) return;

    setFormData(prev => {
      const key = `${type}s` as keyof typeof formData;
      const currentList = Array.isArray(prev[key]) ? [...prev[key] as string[]] : [];
      return {
        ...prev,
        [key]: [...currentList, newItem]
      };
    });

    setNewListItem(prev => ({
      ...prev,
      [type]: ''
    }));
  };

  const removeListItem = (type: 'responsibility' | 'requirement' | 'benefit', index: number) => {
    setFormData(prev => {
      const key = `${type}s` as keyof typeof formData;
      const currentList = Array.isArray(prev[key]) ? [...prev[key] as string[]] : [];
      return {
        ...prev,
        [key]: currentList.filter((_: string, i: number) => i !== index)
      };
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent, type: 'responsibility' | 'requirement' | 'benefit') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addListItem(type);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Careers Management</h1>
        <p className="text-gray-600 mt-2">
          Manage job postings and applications
        </p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'jobs'
                ? 'border-[#1C3D5A] text-[#1C3D5A]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Job Postings ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'applications'
                ? 'border-[#1C3D5A] text-[#1C3D5A]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Applications ({applications.length})
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1C3D5A]"></div>
        </div>
      ) : activeTab === 'jobs' ? (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={openCreateModal}
              className="bg-[#1C3D5A] text-white px-4 py-2 rounded-md hover:bg-[#143040] transition-colors"
            >
              Create New Job
            </button>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No job postings yet.</p>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posted
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{job.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{job.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{job.employment_type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${job.is_published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {job.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(job.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(job)}
                          className="text-[#1C3D5A] hover:text-[#143040] mr-3"
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
            </div>
          )}
        </div>
      ) : (
        <div>
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No job applications yet.</p>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
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
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{application.full_name}</div>
                        <div className="text-sm text-gray-500">{application.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{application.job?.title || 'Unknown Position'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(application.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={application.status}
                          onChange={(e) => handleStatusChange(application.id, e.target.value)}
                          className="text-sm rounded-md border-gray-300 shadow-sm focus:border-[#1C3D5A] focus:ring focus:ring-[#1C3D5A] focus:ring-opacity-50"
                        >
                          <option value="new">New</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="interview">Interview</option>
                          <option value="rejected">Rejected</option>
                          <option value="hired">Hired</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setViewingApplication(application);
                            setIsApplicationModalOpen(true);
                          }}
                          className="text-[#1C3D5A] hover:text-[#143040]"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Job Title *</label>
                    <input
                      type="text"
                      id="title"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#1C3D5A] focus:border-[#1C3D5A]"
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location *</label>
                    <input
                      type="text"
                      id="location"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#1C3D5A] focus:border-[#1C3D5A]"
                    />
                  </div>

                  <div>
                    <label htmlFor="employment_type" className="block text-sm font-medium text-gray-700">Employment Type *</label>
                    <select
                      id="employment_type"
                      required
                      value={formData.employment_type}
                      onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#1C3D5A] focus:border-[#1C3D5A]"
                    >
                      <option value="">Select type</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="salary_range" className="block text-sm font-medium text-gray-700">Salary Range</label>
                    <input
                      type="text"
                      id="salary_range"
                      placeholder="$1,200 - $1,800"
                      value={formData.salary_range || ''}
                      onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#1C3D5A] focus:border-[#1C3D5A]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description *</label>
                    <textarea
                      id="description"
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#1C3D5A] focus:border-[#1C3D5A]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Responsibilities</label>
                    <div className="flex">
                      <input
                        type="text"
                        value={newListItem.responsibility}
                        onChange={(e) => setNewListItem({ ...newListItem, responsibility: e.target.value })}
                        onKeyPress={(e) => handleKeyPress(e, 'responsibility')}
                        className="flex-1 border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#1C3D5A] focus:border-[#1C3D5A]"
                        placeholder="Add a responsibility"
                      />
                      <button
                        type="button"
                        onClick={() => addListItem('responsibility')}
                        className="bg-gray-200 border border-l-0 border-gray-300 rounded-r-md px-4 py-2 text-gray-700 hover:bg-gray-300"
                      >
                        Add
                      </button>
                    </div>
                    {formData.responsibilities.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Added Responsibilities:</div>
                        <ul className="space-y-1">
                          {formData.responsibilities.map((item, index) => (
                            <li key={index} className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded border border-blue-100">
                              <span className="text-sm text-gray-800">• {item}</span>
                              <button
                                type="button"
                                onClick={() => removeListItem('responsibility', index)}
                                className="text-red-500 hover:text-red-700 ml-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
                    <div className="flex">
                      <input
                        type="text"
                        value={newListItem.requirement}
                        onChange={(e) => setNewListItem({ ...newListItem, requirement: e.target.value })}
                        onKeyPress={(e) => handleKeyPress(e, 'requirement')}
                        className="flex-1 border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#1C3D5A] focus:border-[#1C3D5A]"
                        placeholder="Add a requirement"
                      />
                      <button
                        type="button"
                        onClick={() => addListItem('requirement')}
                        className="bg-gray-200 border border-l-0 border-gray-300 rounded-r-md px-4 py-2 text-gray-700 hover:bg-gray-300"
                      >
                        Add
                      </button>
                    </div>
                    {formData.requirements.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Added Requirements:</div>
                        <ul className="space-y-1">
                          {formData.requirements.map((item, index) => (
                            <li key={index} className="flex items-center justify-between bg-yellow-50 px-3 py-2 rounded border border-yellow-100">
                              <span className="text-sm text-gray-800">• {item}</span>
                              <button
                                type="button"
                                onClick={() => removeListItem('requirement', index)}
                                className="text-red-500 hover:text-red-700 ml-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Benefits</label>
                    <div className="flex">
                      <input
                        type="text"
                        value={newListItem.benefit}
                        onChange={(e) => setNewListItem({ ...newListItem, benefit: e.target.value })}
                        onKeyPress={(e) => handleKeyPress(e, 'benefit')}
                        className="flex-1 border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#1C3D5A] focus:border-[#1C3D5A]"
                        placeholder="Add a benefit"
                      />
                      <button
                        type="button"
                        onClick={() => addListItem('benefit')}
                        className="bg-gray-200 border border-l-0 border-gray-300 rounded-r-md px-4 py-2 text-gray-700 hover:bg-gray-300"
                      >
                        Add
                      </button>
                    </div>
                    {formData.benefits.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Added Benefits:</div>
                        <ul className="space-y-1">
                          {formData.benefits.map((item, index) => (
                            <li key={index} className="flex items-center justify-between bg-green-50 px-3 py-2 rounded border border-green-100">
                              <span className="text-sm text-gray-800">• {item}</span>
                              <button
                                type="button"
                                onClick={() => removeListItem('benefit', index)}
                                className="text-red-500 hover:text-red-700 ml-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center">
                      <input
                        id="is_published"
                        type="checkbox"
                        checked={formData.is_published}
                        onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                        className="h-4 w-4 text-[#1C3D5A] border-gray-300 rounded focus:ring-[#1C3D5A]"
                      />
                      <label htmlFor="is_published" className="ml-2 block text-sm text-gray-900">
                        Publish this job posting
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1C3D5A]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1C3D5A] hover:bg-[#143040] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1C3D5A]"
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
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
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
                  <h3 className="text-lg font-medium text-gray-900">{viewingApplication.full_name}</h3>
                  <p className="text-gray-600">{viewingApplication.job?.title || 'Unknown Position'}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{viewingApplication.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {viewingApplication.phone || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Applied</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(viewingApplication.created_at)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={viewingApplication.status}
                      onChange={(e) => handleStatusChange(viewingApplication.id, e.target.value)}
                      className="mt-1 text-sm rounded-md border-gray-300 shadow-sm focus:border-[#1C3D5A] focus:ring focus:ring-[#1C3D5A] focus:ring-opacity-50"
                    >
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="interview">Interview</option>
                      <option value="rejected">Rejected</option>
                      <option value="hired">Hired</option>
                    </select>
                  </div>
                </div>

                {viewingApplication.cover_letter && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cover Letter</label>
                    <div className="mt-1 bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{viewingApplication.cover_letter}</p>
                    </div>
                  </div>
                )}

                {viewingApplication.resume_url && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Resume</label>
                    <div className="mt-1">
                      <a
                        href={viewingApplication.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1C3D5A]"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
                        </svg>
                        Download Resume
                      </a>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Internal Notes</label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={viewingApplication.notes || ''}
                    onChange={async (e) => {
                      const newNotes = e.target.value;
                      setViewingApplication({ ...viewingApplication, notes: newNotes });

                      try {
                        await supabase
                          .from('job_applications')
                          .update({ notes: newNotes, updated_at: new Date().toISOString() })
                          .eq('id', viewingApplication.id);
                      } catch (error) {
                        console.error('Error updating notes:', error);
                      }
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#1C3D5A] focus:border-[#1C3D5A]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}