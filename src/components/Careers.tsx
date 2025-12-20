import { useState, useEffect } from 'react';
import { MapPin, Clock, DollarSign, ArrowRight, Briefcase, Zap, Globe, Heart, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from './SEO';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Careers() {
  const [jobs, setJobs] = useState<any[]>([]);
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
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const SkeletonCard = () => (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
      <div className="space-y-3">
        <div className="h-4 bg-slate-100 rounded w-1/2" />
        <div className="h-4 bg-slate-100 rounded w-1/3" />
      </div>
      <div className="mt-6 h-12 bg-slate-200 rounded-xl w-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO title="Careers | Join Reverence Technology" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-[#1C3D5A] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-400 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-400 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-black tracking-widest text-yellow-400 uppercase bg-yellow-400/10 border border-yellow-400/20 rounded-full">
              We're Hiring
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
              Build the future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                East African Tech
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg leading-relaxed text-slate-300">
              Join a team of visionaries, engineers, and creatives dedicated to solving real-world problems through digital excellence.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Culture / Perks Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <CultureCard
            icon={<Zap className="text-yellow-500" />}
            title="High Impact"
            desc="Your code and designs directly affect the lives of thousands across the region."
          />
          <CultureCard
            icon={<Globe className="text-blue-500" />}
            title="Remote Friendly"
            desc="We value output over hours. Work from where you are most inspired."
          />
          <CultureCard
            icon={<Heart className="text-red-500" />}
            title="Whole Human Care"
            desc="Competitive salaries, health benefits, and a culture that respects your time."
          />
        </div>

        {/* Job List Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-slate-200 pb-8">
          <div>
            <h2 className="text-3xl font-black text-[#1C3D5A]">Open Positions</h2>
            <p className="text-slate-500 font-medium">Find your next challenge</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
            <Briefcase size={18} />
            <span>{jobs.length} roles available</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[3rem] shadow-sm border border-slate-100">
            <Search className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-xl font-bold text-slate-800">No active openings right now</p>
            <p className="text-slate-500">Check back soon or follow us on LinkedIn.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {jobs.map((job) => (
              <motion.div
                whileHover={{ y: -5 }}
                key={job.id}
                className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50 hover:border-yellow-400 transition-all cursor-pointer group flex flex-col justify-between"
                onClick={() => navigate(`/job/${job.id}`)}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-black text-[#1C3D5A] group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </h3>
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded-lg">
                      {job.employment_type}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center text-slate-500 text-sm font-medium">
                      <MapPin size={16} className="mr-1.5 text-blue-500" />
                      {job.location}
                    </div>
                    {job.salary_range && (
                      <div className="flex items-center text-slate-500 text-sm font-medium">
                        <DollarSign size={16} className="mr-1.5 text-green-500" />
                        {job.salary_range}
                      </div>
                    )}
                  </div>

                  <div className="mb-8">
                    <p className="text-slate-600 line-clamp-2 text-sm leading-relaxed italic mb-4">
                      "{job.description}"
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {job.responsibilities.slice(0, 2).map((r: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button className="flex items-center justify-center w-full py-4 font-black text-[#1C3D5A] bg-yellow-400 rounded-2xl group-hover:bg-[#1C3D5A] group-hover:text-white transition-all duration-300">
                  View Role & Apply <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CultureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-black text-[#1C3D5A] mb-3">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}