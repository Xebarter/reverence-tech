import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
  application_link: string | null;
  created_at: string;
}

export default function Careers() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [applicationData, setApplicationData] = useState({
    job_id: '',
    full_name: '',
    email: '',
    phone: '',
    cover_letter: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      // Upload resume if provided
      let resumeUrl = null;
      if (resumeFile) {
        const fileExt = resumeFile.name.split('.').pop();
        const fileName = `${applicationData.job_id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, resumeFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);
        
        resumeUrl = publicUrl;
      }

      // Insert application data
      const { error: insertError } = await supabase
        .from('job_applications')
        .insert([{
          job_id: applicationData.job_id,
          full_name: applicationData.full_name,
          email: applicationData.email,
          phone: applicationData.phone,
          cover_letter: applicationData.cover_letter,
          resume_url: resumeUrl,
        }]);

      if (insertError) throw insertError;

      // Reset form
      setApplicationData({
        job_id: '',
        full_name: '',
        email: '',
        phone: '',
        cover_letter: '',
      });
      setResumeFile(null);
      setSubmitSuccess(true);
      
      // Close modal after success
      setTimeout(() => {
        const modal = document.getElementById(`apply-modal-${applicationData.job_id}`);
        if (modal) {
          modal.classList.add('hidden');
        }
        setSubmitSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmitError('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Loading Careers...</h1>
            <p className="text-lg text-gray-600">Please wait while we load our job opportunities.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Our Team</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We're always looking for talented individuals to join our growing team. 
            Check out our current openings and apply today.
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Open Positions</h2>
            <p className="text-gray-600">
              We don't have any open positions at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {job.location}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {job.employment_type}
                      </span>
                      {job.salary_range && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          {job.salary_range}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-gray-600 line-clamp-3">{job.description}</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <button 
                        onClick={() => document.getElementById(`job-modal-${job.id}`)?.classList.remove('hidden')}
                        className="text-[#1C3D5A] font-medium hover:text-[#2DBE7E] transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                    <div>
                      {job.application_link ? (
                        <a 
                          href={job.application_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-[#2DBE7E] text-white px-4 py-2 rounded-lg hover:bg-[#25a169] transition-colors font-medium"
                        >
                          Apply Now
                        </a>
                      ) : (
                        <button 
                          onClick={() => {
                            document.getElementById(`job-modal-${job.id}`)?.classList.add('hidden');
                            const modal = document.getElementById(`apply-modal-${job.id}`);
                            if (modal) {
                              modal.classList.remove('hidden');
                              setApplicationData(prev => ({
                                ...prev,
                                job_id: job.id
                              }));
                            }
                          }}
                          className="bg-[#2DBE7E] text-white px-4 py-2 rounded-lg hover:bg-[#25a169] transition-colors font-medium"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job Detail Modals */}
      {jobs.map((job) => (
        <div 
          key={`detail-${job.id}`} 
          id={`job-modal-${job.id}`} 
          className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              e.currentTarget.classList.add('hidden');
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
                <button 
                  onClick={() => document.getElementById(`job-modal-${job.id}`)?.classList.add('hidden')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {job.location}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {job.employment_type}
                  </span>
                  {job.salary_range && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      {job.salary_range}
                    </span>
                  )}
                </div>
                
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 mb-6">{job.description}</p>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Responsibilities</h3>
                  <ul className="list-disc pl-5 mb-6 space-y-1">
                    {job.responsibilities.map((resp, index) => (
                      <li key={index} className="text-gray-600">{resp}</li>
                    ))}
                  </ul>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h3>
                  <ul className="list-disc pl-5 mb-6 space-y-1">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="text-gray-600">{req}</li>
                    ))}
                  </ul>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Benefits</h3>
                  <ul className="list-disc pl-5 mb-6 space-y-1">
                    {job.benefits.map((benefit, index) => (
                      <li key={index} className="text-gray-600">{benefit}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button 
                  onClick={() => document.getElementById(`job-modal-${job.id}`)?.classList.add('hidden')}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                {job.application_link ? (
                  <a 
                    href={job.application_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-[#2DBE7E] text-white px-4 py-2 rounded-lg hover:bg-[#25a169] transition-colors font-medium"
                  >
                    Apply Now
                  </a>
                ) : (
                  <button 
                    onClick={() => {
                      document.getElementById(`job-modal-${job.id}`)?.classList.add('hidden');
                      const modal = document.getElementById(`apply-modal-${job.id}`);
                      if (modal) {
                        modal.classList.remove('hidden');
                        setApplicationData(prev => ({
                          ...prev,
                          job_id: job.id
                        }));
                      }
                    }}
                    className="bg-[#2DBE7E] text-white px-4 py-2 rounded-lg hover:bg-[#25a169] transition-colors font-medium"
                  >
                    Apply for this Position
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Application Modals */}
      {jobs.map((job) => (
        <div 
          key={`apply-${job.id}`} 
          id={`apply-modal-${job.id}`} 
          className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              e.currentTarget.classList.add('hidden');
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Apply for {job.title}</h2>
                <button 
                  onClick={() => document.getElementById(`apply-modal-${job.id}`)?.classList.add('hidden')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {submitSuccess ? (
                <div className="bg-green-50 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Application submitted successfully!
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleApplicationSubmit} className="space-y-4">
                  {submitError && (
                    <div className="bg-red-50 p-4 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-red-800">
                            {submitError}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor={`full_name-${job.id}`} className="block text-sm font-medium text-gray-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id={`full_name-${job.id}`}
                      name="full_name"
                      value={applicationData.full_name}
                      onChange={handleApplicationChange}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1C3D5A] focus:border-[#1C3D5A]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`email-${job.id}`} className="block text-sm font-medium text-gray-700">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id={`email-${job.id}`}
                      name="email"
                      value={applicationData.email}
                      onChange={handleApplicationChange}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1C3D5A] focus:border-[#1C3D5A]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`phone-${job.id}`} className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id={`phone-${job.id}`}
                      name="phone"
                      value={applicationData.phone}
                      onChange={handleApplicationChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1C3D5A] focus:border-[#1C3D5A]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`cover_letter-${job.id}`} className="block text-sm font-medium text-gray-700">
                      Cover Letter
                    </label>
                    <textarea
                      id={`cover_letter-${job.id}`}
                      name="cover_letter"
                      value={applicationData.cover_letter}
                      onChange={handleApplicationChange}
                      rows={4}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1C3D5A] focus:border-[#1C3D5A]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`resume-${job.id}`} className="block text-sm font-medium text-gray-700">
                      Resume (PDF, DOC, DOCX)
                    </label>
                    <input
                      type="file"
                      id={`resume-${job.id}`}
                      name="resume"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1C3D5A] focus:border-[#1C3D5A]"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => document.getElementById(`apply-modal-${job.id}`)?.classList.add('hidden')}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#1C3D5A] text-white rounded-lg hover:bg-[#2DBE7E] transition-colors font-medium disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}