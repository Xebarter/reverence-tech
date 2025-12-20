import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Banknote, ArrowLeft, CheckCircle2, Briefcase, Info, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
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
}

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplicationFormOpen, setIsApplicationFormOpen] = useState(false);

  useEffect(() => {
    if (id) fetchJobDetails(id);
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
      setJob(data);
    } catch (err) {
      setError('Failed to load job details.');
    } finally {
      setLoading(false);
    }
  };

  const parseList = (items: any) => {
    if (Array.isArray(items)) return items;
    if (typeof items === 'string') {
      try { return JSON.parse(items); } catch { return [items]; }
    }
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-6">
          <div className="h-12 bg-slate-200 animate-pulse rounded-2xl w-2/3 mx-auto" />
          <div className="h-64 bg-white rounded-[2rem] shadow-sm animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <Info className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-[#1C3D5A] mb-2">Oops! Job not found</h2>
          <p className="text-slate-500 mb-8">This position may have been filled or the link has expired.</p>
          <button onClick={() => navigate('/careers')} className="px-8 py-3 bg-[#1C3D5A] text-white rounded-xl font-bold">
            View All Openings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <SEO
        title={`${job.title} | Careers`}
        description={`Join Reverence Technology as a ${job.title}.`}
      />

      {/* Hero Header */}
      <div className="bg-[#1C3D5A] pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/careers')}
            className="flex items-center text-slate-400 hover:text-yellow-400 mb-8 transition-colors font-bold text-sm uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Careers
          </button>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight"
          >
            {job.title}
          </motion.h1>

          <div className="flex flex-wrap gap-6 text-slate-300">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <MapPin size={18} className="text-yellow-400" /> {job.location}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <Clock size={18} className="text-yellow-400" /> {job.employment_type}
            </div>
            {job.salary_range && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <Banknote size={18} className="text-yellow-400" /> {job.salary_range}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black text-[#1C3D5A] mb-6 flex items-center gap-3">
                <Briefcase className="text-yellow-500" /> Role Overview
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line">
                {job.description}
              </p>

              <hr className="my-10 border-slate-100" />

              <div className="space-y-10">
                <section>
                  <h3 className="text-xl font-bold text-[#1C3D5A] mb-6">Key Responsibilities</h3>
                  <div className="grid gap-4">
                    {parseList(job.responsibilities).map((item: string, i: number) => (
                      <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-colors">
                        <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />
                        <span className="text-slate-700 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-[#1C3D5A] mb-6">Requirements</h3>
                  <div className="grid gap-3">
                    {parseList(job.requirements).map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2.5 shrink-0" />
                        <span className="text-slate-600 leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            {/* Company Section */}
            <div className="bg-gradient-to-br from-[#1C3D5A] to-[#0B1221] rounded-[2.5rem] p-10 text-white relative overflow-hidden">
              <Sparkles className="absolute top-10 right-10 text-yellow-400/20 w-24 h-24" />
              <h2 className="text-2xl font-black mb-6">About Reverence Technology</h2>
              <p className="text-slate-300 leading-relaxed mb-6 text-lg">
                We are a hub of innovation in Kampala, building technology that matters for East Africa.
                Join a culture of excellence, ownership, and digital transformation.
              </p>
              <div className="flex gap-4">
                <div className="px-4 py-2 bg-white/10 rounded-xl text-sm font-bold">Innovation First</div>
                <div className="px-4 py-2 bg-white/10 rounded-xl text-sm font-bold">Local Impact</div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-blue-900/5 border border-slate-100">
                <h3 className="text-lg font-black text-[#1C3D5A] mb-6">What We Offer</h3>
                <div className="space-y-4 mb-8">
                  {parseList(job.benefits).map((benefit: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-slate-600">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={16} />
                      </div>
                      <span className="text-sm font-semibold">{benefit}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setIsApplicationFormOpen(true)}
                  className="w-full py-4 bg-yellow-400 hover:bg-[#1C3D5A] hover:text-white text-[#1C3D5A] rounded-2xl font-black text-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-yellow-400/20"
                >
                  Apply for this Role
                </button>
                <p className="text-center text-slate-400 text-xs mt-4 font-medium">
                  Takes less than 3 minutes to apply
                </p>
              </div>

              <div className="bg-blue-50 rounded-[2rem] p-8 border border-blue-100">
                <h4 className="font-bold text-[#1C3D5A] mb-2">Have Questions?</h4>
                <p className="text-sm text-slate-600 mb-4">Contact our recruitment team for more details about our hiring process.</p>
                <a href="mailto:careers@reverencetechnology.com" className="text-blue-600 font-bold text-sm hover:underline">
                  careers@reverencetechnology.com
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {isApplicationFormOpen && (
        <JobApplicationForm
          jobId={job.id}
          jobTitle={job.title}
          onClose={() => setIsApplicationFormOpen(false)}
          onSubmitSuccess={() => setIsApplicationFormOpen(false)}
        />
      )}
    </div>
  );
}