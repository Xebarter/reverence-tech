import { useState, useEffect } from 'react';
import { MapPin, Clock, DollarSign } from 'lucide-react';
import SEO from './SEO';
import { useNavigate } from 'react-router-dom';
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

export default function Careers() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      // Log detailed Supabase error info to help diagnose 404/permission issues
      console.error('Error fetching jobs:', error);
      try {
        console.error('Error details:', {
          message: (error as any)?.message,
          status: (error as any)?.status,
          details: (error as any)?.details
        });
      } catch (err) {
        // swallow
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Loading Career Opportunities...</h1>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mt-8 max-w-2xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50">
      <SEO
        title="Careers"
        description="Join our team at Reverence Technology and help empower East Africa through digital innovation. We're hiring talented developers, designers, and tech professionals."
        keywords="careers, jobs, technology jobs, Uganda, East Africa, digital innovation, web development"
        ogTitle="Careers | Reverence Technology"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Our Team</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Help us empower East Africa through digital innovation. We're looking for passionate individuals
            who want to make a difference in the tech landscape of Uganda and beyond.
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 max-w-2xl mx-auto">
              <p className="text-gray-700 text-lg">No positions available at the moment. Check back soon!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {jobs.map((job) => (
              <div 
                key={job.id} 
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-gray-200 group"
                onClick={() => navigate(`/job/${job.id}`)}
              >
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-900 transition-colors duration-200">{job.title}</h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-700">
                      <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Clock className="w-5 h-5 mr-2 text-blue-600" />
                      <span>{job.employment_type}</span>
                    </div>
                    {job.salary_range && (
                      <div className="flex items-center text-gray-700">
                        <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                        <span>{job.salary_range}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Responsibilities</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {job.responsibilities.slice(0, 3).map((resp, index) => (
                        <li key={index}>{resp}</li>
                      ))}
                      {job.responsibilities.length > 3 && (
                        <li className="text-blue-600 font-medium">And more...</li>
                      )}
                    </ul>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/job/${job.id}`);
                    }}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 py-3 px-4 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all font-medium shadow-md"
                  >
                    View Details & Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Work With Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-800">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Impactful Work</h3>
              <p className="text-gray-700">
                Contribute to projects that make a real difference in East Africa's digital transformation.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-800">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Growth Opportunities</h3>
              <p className="text-gray-700">
                Continuous learning and professional development in cutting-edge technologies.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-yellow-800">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Inclusive Culture</h3>
              <p className="text-gray-700">
                Collaborative environment that values diversity and encourages innovation.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
