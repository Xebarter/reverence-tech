import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, DollarSign, ArrowLeft, Check, Loader2 } from 'lucide-react';
import SEO from './SEO';
import JobApplicationForm from './JobApplicationForm';
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
  is_published: boolean;
  application_link: string | null;
  created_at: string;
  updated_at: string;
}

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplicationFormOpen, setIsApplicationFormOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJobDetails(id);
    }
  }, [id]);

  const fetchJobDetails = async (jobId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      
      if (!data) {
        setError('Job not found');
        return;
      }

      // Debugging: log the actual data being fetched
      console.log('Job data fetched:', data);
      console.log('Responsibilities:', data.responsibilities);
      console.log('Requirements:', data.requirements);
      console.log('Benefits:', data.benefits);

      setJob(data);
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError('Failed to load job details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const renderListItems = (items: string[] | string | null | undefined) => {
    // Handle case where items might be stored as a JSON string instead of an array
    let parsedItems: string[] = [];
    
    if (Array.isArray(items)) {
      parsedItems = items;
    } else if (typeof items === 'string') {
      try {
        parsedItems = JSON.parse(items);
      } catch (e) {
        // If parsing fails, treat as a single item
        parsedItems = [items];
      }
    }
    
    // Filter out any null or undefined items
    parsedItems = parsedItems.filter(item => item != null && item !== '');
    
    if (parsedItems.length === 0) {
      return (
        <li className="text-gray-500 italic">No items specified</li>
      );
    }
    
    return parsedItems.map((item, index) => (
      <li key={index} className="flex items-start">
        <span className="text-[#2DBE7E] mr-2">•</span>
        <span className="text-gray-700">{item}</span>
      </li>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Loading Job Details...</h1>
          </div>
          <div className="bg-white/30 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20 mt-8 max-w-2xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200/50 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200/50 rounded w-full"></div>
              <div className="h-4 bg-gray-200/50 rounded w-5/6 mx-auto"></div>
              <div className="h-4 bg-gray-200/50 rounded w-2/3 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white/30 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center border border-white/20">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-700 mb-6">{error || 'Job not found'}</p>
            <button
              onClick={() => navigate('/careers')}
              className="px-6 py-3 bg-[#1C3D5A] text-white rounded-lg hover:bg-[#143040] transition-colors"
            >
              Back to Careers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={`${job.title} | Reverence Technology Careers`}
        description={`Join our team as a ${job.title} at Reverence Technology. ${job.description.substring(0, 150)}...`}
        keywords={`careers, job, ${job.title}, technology jobs, Uganda, East Africa`}
        ogTitle={`${job.title} | Reverence Technology Careers`}
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Back Button */}
        <button
          onClick={() => navigate('/careers')}
          className="group flex items-center text-[#1C3D5A] hover:text-[#2DBE7E] mb-8 transition-all duration-300 font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to all jobs
        </button>

        {/* Job Details Card */}
        <div className="bg-white/30 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden mb-8 border border-white/30 animate-fade-in-up">
          <div className="p-8 lg:p-10">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {job.title}
            </h1>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center text-gray-700">
                <MapPin className="w-5 h-5 mr-2 text-[#1C3D5A]" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Clock className="w-5 h-5 mr-2 text-[#1C3D5A]" />
                <span>{job.employment_type}</span>
              </div>
              {job.salary_range && (
                <div className="flex items-center text-gray-700">
                  <DollarSign className="w-5 h-5 mr-2 text-[#1C3D5A]" />
                  <span>{job.salary_range}</span>
                </div>
              )}
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Responsibilities */}
          <div className="bg-white/30 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/30 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-2xl font-bold text-[#1C3D5A] mb-6">Key Responsibilities</h2>
            <ul className="space-y-3">
              {renderListItems(job.responsibilities)}
            </ul>
          </div>

          {/* Requirements */}
          <div className="bg-white/30 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/30 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h2 className="text-2xl font-bold text-[#1C3D5A] mb-6">Requirements</h2>
            <ul className="space-y-3">
              {renderListItems(job.requirements)}
            </ul>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white/30 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8 border border-white/30 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <h2 className="text-2xl font-bold text-[#1C3D5A] mb-6">What We Offer</h2>
          <ul className="space-y-3">
            {renderListItems(job.benefits)}
          </ul>
        </div>

        {/* Apply Section */}
        <div className="bg-white/30 backdrop-blur-lg rounded-3xl shadow-2xl p-8 text-center border border-white/30 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Join Our Team?</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">Take the first step towards an exciting career with Reverence Technology.</p>
          <button
            onClick={() => setIsApplicationFormOpen(true)}
            className="w-full lg:w-auto px-12 py-4 bg-gradient-to-r from-[#1C3D5A] to-[#2DBE7E] text-white rounded-2xl hover:from-[#143040] hover:to-[#1C9C6E] transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
          >
            <Check className="w-5 h-5" />
            Apply Now
          </button>
        </div>

        {/* About Company */}
        <div className="bg-white/30 backdrop-blur-lg rounded-3xl shadow-2xl p-8 lg:p-10 border border-white/30 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <h2 className="text-3xl font-bold text-[#1C3D5A] mb-6">About Reverence Technology</h2>
          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              Reverence Technology is a leading Ugandan tech company dedicated to empowering East Africa 
              through digital innovation. We specialize in creating cutting-edge solutions that address 
              local challenges while positioning our clients for global success.
            </p>
            <p>
              Join our team of passionate professionals who are transforming the technology landscape 
              across East Africa, one innovative solution at a time. We're looking for driven individuals 
              like you to help shape the future.
            </p>
          </div>
        </div>
      </div>

      {isApplicationFormOpen && job && (
        <JobApplicationForm
          jobId={job.id}
          jobTitle={job.title}
          onClose={() => setIsApplicationFormOpen(false)}
          onSubmitSuccess={() => {
            setIsApplicationFormOpen(false);
          }}
        />
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
      `}</style>
    </div>
  );
}