'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import {
  MapPin,
  DollarSign,
  ArrowRight,
  Briefcase,
  Zap,
  Globe,
  Heart,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from './SEO';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

type Job = {
  id: string;
  title?: string | null;
  location?: string | null;
  employment_type?: string | null;
  salary_range?: string | null;
  description?: string | null;
  responsibilities?: string[] | null;
  created_at?: string | null;
};

function formatPostedDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: '2-digit', year: 'numeric' }).format(d);
}

export default function Careers() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [employmentType, setEmploymentType] = useState<'all' | string>('all');
  const [location, setLocation] = useState<'all' | string>('all');
  const router = useRouter();

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

  const employmentTypeOptions = useMemo(() => {
    const types = new Set<string>();
    for (const j of jobs) {
      const t = (j.employment_type || '').trim();
      if (t) types.add(t);
    }
    return ['all', ...Array.from(types).sort((a, b) => a.localeCompare(b))];
  }, [jobs]);

  const locationOptions = useMemo(() => {
    const locs = new Set<string>();
    for (const j of jobs) {
      const l = (j.location || '').trim();
      if (l) locs.add(l);
    }
    return ['all', ...Array.from(locs).sort((a, b) => a.localeCompare(b))];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((job) => {
      if (employmentType !== 'all' && (job.employment_type || '') !== employmentType) return false;
      if (location !== 'all' && (job.location || '') !== location) return false;
      if (!q) return true;

      const haystack = [
        job.title,
        job.location,
        job.employment_type,
        job.salary_range,
        job.description,
        ...(job.responsibilities || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [jobs, query, employmentType, location]);

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/70 animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
      <div className="space-y-3">
        <div className="h-4 bg-slate-100 rounded w-1/2" />
        <div className="h-4 bg-slate-100 rounded w-1/3" />
      </div>
      <div className="mt-6 h-12 bg-slate-200 rounded-xl w-full" />
    </div>
  );

  return (
    <div className="bg-[#F8FAFC]">
      <SEO title="Careers | Join Reverence Technology" />

      {/* Hero Section */}
      <section className="relative pt-28 md:pt-32 pb-14 md:pb-16 overflow-hidden bg-gradient-to-b from-[#14324C] via-[#1C3D5A] to-[#1C3D5A]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_20%_10%,rgba(250,204,21,0.9),transparent_40%),radial-gradient(circle_at_90%_80%,rgba(59,130,246,0.8),transparent_45%)]" />
          <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:48px_48px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-[11px] font-semibold tracking-[0.22em] text-yellow-200 uppercase bg-white/10 border border-white/10 rounded-full">
              Careers
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Build products that matter.
            </h1>
            <p className="max-w-2xl mx-auto text-lg leading-relaxed text-slate-200/90">
              Join Reverence Technology and help deliver reliable software for businesses across East Africa—fast, secure, and built to last.
            </p>
          </motion.div>

          {/* Search + Filters (Hero) */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-10 md:mt-12"
          >
            <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-5 shadow-2xl shadow-slate-950/20">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center">
                <div className="md:col-span-6">
                  <label className="sr-only" htmlFor="job-search">
                    Search roles
                  </label>
                  <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-200" />
                    <input
                      id="job-search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by title, skill, or keyword…"
                      className="w-full h-12 md:h-13 rounded-2xl bg-slate-950/15 border border-white/10 text-white placeholder:text-slate-300 pl-11 pr-11 outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400/30"
                    />
                    {query.trim().length > 0 && (
                      <button
                        type="button"
                        onClick={() => setQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="Clear search"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="md:col-span-3">
                  <label className="sr-only" htmlFor="employmentType">
                    Employment type
                  </label>
                  <div className="relative">
                    <SlidersHorizontal size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-200" />
                    <select
                      id="employmentType"
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value)}
                      className="w-full h-12 md:h-13 rounded-2xl bg-slate-950/15 border border-white/10 text-white pl-10 pr-4 outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400/30"
                    >
                      {employmentTypeOptions.map((t) => (
                        <option key={t} value={t} className="text-slate-900">
                          {t === 'all' ? 'All types' : t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="md:col-span-3">
                  <label className="sr-only" htmlFor="location">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-200" />
                    <select
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full h-12 md:h-13 rounded-2xl bg-slate-950/15 border border-white/10 text-white pl-10 pr-4 outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400/30"
                    >
                      {locationOptions.map((l) => (
                        <option key={l} value={l} className="text-slate-900">
                          {l === 'all' ? 'All locations' : l}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 px-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <Briefcase size={18} className="text-yellow-400" />
                  <span>
                    {loading ? 'Loading roles…' : `${filteredJobs.length} of ${jobs.length} roles`}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(employmentType !== 'all' || location !== 'all' || query.trim()) && (
                    <button
                      type="button"
                      onClick={() => {
                        setEmploymentType('all');
                        setLocation('all');
                        setQuery('');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 border border-white/10 text-white font-semibold text-sm hover:bg-white/15 transition-colors"
                    >
                      Reset filters <X size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('open-roles');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-yellow-400 text-[#1C3D5A] font-semibold text-sm hover:bg-white transition-colors"
                  >
                    Explore roles <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16">
        {/* Culture / Perks Section */}
        <div className="mb-10 md:mb-12">
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-slate-500">Working here</p>
          <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">A team built for delivery</h2>
          <p className="mt-3 text-slate-600 max-w-2xl">
            We care about craft, velocity, and trust. You’ll work with clear priorities, strong feedback loops, and a calm, professional environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-24">
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
        <div id="open-roles" className="scroll-mt-28 flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-10 border-b border-slate-200 pb-6 md:pb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">Open positions</h2>
            <p className="text-slate-600">Explore roles and apply in minutes.</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <Briefcase size={18} />
            <span>{loading ? 'Loading…' : `${filteredJobs.length} roles available`}</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="py-16 md:py-20 text-center bg-white rounded-3xl shadow-sm border border-slate-200/70 px-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-center mb-5">
              <Search className="text-slate-300" size={26} />
            </div>
            <p className="text-xl font-extrabold text-slate-900 tracking-tight">No matching roles</p>
            <p className="text-slate-500 max-w-xl mx-auto mt-2">
              Try a different search term, or reset filters to see all open positions.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setEmploymentType('all');
                  setLocation('all');
                  setQuery('');
                }}
                className="px-6 py-3 rounded-2xl font-semibold text-[#1C3D5A] bg-yellow-400 hover:bg-[#1C3D5A] hover:text-white transition-colors"
              >
                Reset filters
              </button>
              <a
                href="mailto:reverencetech1@gmail.com?subject=Career%20opportunities"
                className="px-6 py-3 rounded-2xl font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Send your CV
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredJobs.map((job) => (
              <motion.div
                whileHover={{ y: -3 }}
                key={job.id}
                className="bg-white p-7 md:p-8 rounded-2xl shadow-sm border border-slate-200/70 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                onClick={() => router.push(`/job/${job.id}`)}
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 group-hover:text-[#1C3D5A] transition-colors">
                      {job.title || 'Untitled role'}
                    </h3>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-lg border border-slate-200/70">
                        {job.employment_type || 'Role'}
                      </span>
                      {formatPostedDate(job.created_at) && (
                        <span className="text-[11px] text-slate-500">Posted {formatPostedDate(job.created_at)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mb-5">
                    <div className="flex items-center text-slate-600 text-sm font-medium">
                      <MapPin size={16} className="mr-1.5 text-slate-500" />
                      {job.location || 'Location flexible'}
                    </div>
                    {job.salary_range && (
                      <div className="flex items-center text-slate-600 text-sm font-medium">
                        <DollarSign size={16} className="mr-1.5 text-slate-500" />
                        {job.salary_range}
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    {job.description ? (
                      <p className="text-slate-600 line-clamp-2 text-sm leading-relaxed mb-4">
                        {job.description}
                      </p>
                    ) : (
                      <p className="text-slate-500 text-sm leading-relaxed mb-4">
                        Open role at Reverence Technology.
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {(job.responsibilities || []).slice(0, 2).map((r: string, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-slate-50 text-slate-700 text-[11px] font-semibold rounded-lg border border-slate-200/70"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button className="flex items-center justify-center w-full py-3.5 font-semibold text-[#1C3D5A] bg-yellow-400 rounded-2xl group-hover:bg-[#1C3D5A] group-hover:text-white transition-all duration-300">
                  View role <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CultureCard({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="p-7 md:p-8 bg-white rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-slate-50 border border-slate-200/70 rounded-2xl flex items-center justify-center mb-5">
        {icon}
      </div>
      <h3 className="text-lg font-extrabold tracking-tight text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}