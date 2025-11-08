import { useState, useEffect } from 'react';
import { MapPin, Clock, DollarSign } from 'lucide-react';
import SEO from './SEO';

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

  useEffect(() => {
    // In a real implementation, this would fetch from Supabase
    // For now, we'll simulate with sample data
    const fetchJobs = async () => {
      try {
        // This is a placeholder - in a real app, you would fetch from your Supabase database
        const sampleJobs: Job[] = [
          {
            id: '1',
            title: 'Senior Frontend Developer',
            description: 'We are looking for an experienced frontend developer to join our team and help build cutting-edge web applications for our clients in East Africa.',
            location: 'Kampala, Uganda (Remote available)',
            employment_type: 'Full-time',
            salary_range: '$1,200 - $1,800',
            responsibilities: [
              'Develop responsive web applications using React and TypeScript',
              'Collaborate with UX/UI designers to implement pixel-perfect interfaces',
              'Optimize applications for maximum speed and scalability',
              'Participate in code reviews and contribute to team knowledge sharing'
            ],
            requirements: [
              '3+ years of experience with React and TypeScript',
              'Strong knowledge of modern CSS and responsive design',
              'Experience with state management libraries (Redux, Context API)',
              'Familiarity with testing frameworks like Jest and React Testing Library'
            ],
            benefits: [
              'Competitive salary',
              'Flexible working hours',
              'Health insurance',
              'Professional development opportunities'
            ],
            is_published: true,
            application_link: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            title: 'DevOps Engineer',
            description: 'Join our infrastructure team to design and maintain our cloud-based solutions that power businesses across East Africa.',
            location: 'Kampala, Uganda (Remote available)',
            employment_type: 'Full-time',
            salary_range: '$1,500 - $2,200',
            responsibilities: [
              'Design and implement CI/CD pipelines',
              'Manage cloud infrastructure on AWS/GCP',
              'Monitor and optimize system performance',
              'Ensure security and compliance of our infrastructure'
            ],
            requirements: [
              '3+ years of DevOps experience',
              'Strong knowledge of Docker and Kubernetes',
              'Experience with cloud platforms (AWS, GCP)',
              'Proficiency in Infrastructure as Code tools (Terraform)'
            ],
            benefits: [
              'Competitive salary',
              'Remote work options',
              'Learning budget for conferences and courses',
              'Stock options'
            ],
            is_published: true,
            application_link: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];

        setJobs(sampleJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Loading Career Opportunities...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <SEO 
        title="Careers"
        description="Join our team at Reverence Technology and help empower East Africa through digital innovation. We're hiring talented developers, designers, and tech professionals."
        keywords="careers, jobs, technology jobs, Uganda, East Africa, digital innovation, web development"
        ogTitle="Careers | Reverence Technology"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Our Team</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Help us empower East Africa through digital innovation. We're looking for passionate individuals 
            who want to make a difference in the tech landscape of Uganda and beyond.
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No positions available at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{job.title}</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-5 h-5 mr-2 text-gray-400" />
                      <span>{job.employment_type}</span>
                    </div>
                    {job.salary_range && (
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="w-5 h-5 mr-2 text-gray-400" />
                        <span>{job.salary_range}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Responsibilities</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {job.responsibilities.slice(0, 3).map((resp, index) => (
                        <li key={index}>{resp}</li>
                      ))}
                      {job.responsibilities.length > 3 && (
                        <li className="text-blue-600">And more...</li>
                      )}
                    </ul>
                  </div>
                  
                  <button 
                    onClick={() => {
                      // In a real implementation, this would open a modal or navigate to application page
                      alert('In a real application, this would open the job application form');
                    }}
                    className="w-full bg-[#1C3D5A] text-white py-3 px-4 rounded-lg hover:bg-[#143040] transition-colors font-medium"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Work With Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-[#F2B134] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Impactful Work</h3>
              <p className="text-gray-600">
                Contribute to projects that make a real difference in East Africa's digital transformation.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#2DBE7E] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Growth Opportunities</h3>
              <p className="text-gray-600">
                Continuous learning and professional development in cutting-edge technologies.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#1C3D5A] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Inclusive Culture</h3>
              <p className="text-gray-600">
                Collaborative environment that values diversity and encourages innovation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
