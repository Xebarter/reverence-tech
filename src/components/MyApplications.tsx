'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { useUser } from '../UserContext';
import { Briefcase, Calendar, ChevronRight, Info, Loader2 } from 'lucide-react';

type ApplicationRow = {
  id: string;
  job_id: string;
  status: string | null;
  created_at: string;
  jobs?: { id: string; title: string; location: string | null } | null;
};

export default function MyApplications() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [rows, setRows] = useState<ApplicationRow[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const redirectToAuth = useMemo(() => `/auth?redirect=${encodeURIComponent('/applications')}`, []);

  useEffect(() => {
    if (!loading && !user) router.replace(redirectToAuth);
  }, [loading, user, router, redirectToAuth]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setBusy(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('job_applications')
          .select('id, job_id, status, created_at, jobs ( id, title, location )')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setRows((data as any) || []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load your applications.');
      } finally {
        setBusy(false);
      }
    };
    load();
  }, [user]);

  if (loading || (busy && rows.length === 0)) {
    return (
      <div className="min-h-[60vh] bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-slate-500 font-bold">
          <Loader2 className="animate-spin" size={18} />
          Loading applications...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] bg-[#F8FAFC] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white border border-slate-100 shadow-sm rounded-[2rem] p-8">
          <Info className="w-14 h-14 text-slate-200 mx-auto mb-4" />
          <h2 className="text-xl font-black text-[#1C3D5A] mb-2">Sign in required</h2>
          <p className="text-slate-500 font-medium mb-6">Create an account or sign in to track your job applications.</p>
          <button
            onClick={() => router.push(redirectToAuth)}
            className="w-full py-3 bg-[#1C3D5A] text-white rounded-2xl font-black hover:bg-yellow-500 hover:text-[#1C3D5A] transition-all"
          >
            Sign in / Create account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F8FAFC]">
      <section className="relative pt-24 pb-14 bg-[#1C3D5A] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-400 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-400 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-black tracking-widest text-yellow-400 uppercase bg-yellow-400/10 border border-yellow-400/20 rounded-full">
            Your dashboard
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3 flex items-center gap-3">
            <Briefcase className="text-yellow-400" /> My Applications
          </h1>
          <p className="text-slate-300 font-medium max-w-2xl">
            Track every role you’ve applied for and the current status of each application.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-10 pb-20">
        <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl shadow-slate-200/60 border border-slate-100">
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl text-sm border bg-rose-50 border-rose-100 text-rose-700 font-semibold">
              {error}
            </div>
          )}

          {rows.length === 0 ? (
            <div className="py-14 text-center">
              <Info className="w-14 h-14 text-slate-200 mx-auto mb-4" />
              <h2 className="text-xl font-black text-[#1C3D5A] mb-2">No applications yet</h2>
              <p className="text-slate-500 font-medium mb-7">Browse open roles and submit your first application.</p>
              <button
                onClick={() => router.push('/careers')}
                className="px-8 py-3 bg-yellow-400 text-[#1C3D5A] rounded-2xl font-black hover:bg-[#1C3D5A] hover:text-white transition-all"
              >
                View open roles
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {rows.map((r) => (
                <button
                  key={r.id}
                  onClick={() => router.push(`/job/${r.job_id}`)}
                  className="w-full text-left p-5 md:p-6 rounded-[1.5rem] border border-slate-100 hover:border-yellow-300 hover:bg-slate-50 transition-all flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="font-black text-[#1C3D5A] text-lg truncate">
                        {r.jobs?.title || 'Job'}
                      </div>
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600">
                        {r.status || 'new'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500 font-semibold">
                      <span className="inline-flex items-center gap-2">
                        <Calendar size={16} className="text-slate-300" />
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                      {r.jobs?.location ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          {r.jobs.location}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <ChevronRight className="text-slate-300 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

