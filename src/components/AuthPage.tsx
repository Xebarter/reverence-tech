'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { useUser } from '../UserContext';
import { AlertCircle, Loader2, Lock, Mail, User2 } from 'lucide-react';

type Mode = 'signin' | 'signup';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useUser();

  const redirectTo = useMemo(() => {
    const raw = searchParams?.get('redirect') || '/';
    // Basic guard: only allow internal redirects
    if (raw.startsWith('http://') || raw.startsWith('https://')) return '/';
    return raw.startsWith('/') ? raw : '/';
  }, [searchParams]);

  const [mode, setMode] = useState<Mode>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace(redirectTo);
  }, [loading, user, router, redirectTo]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || undefined,
            },
          },
        });
        if (error) throw error;
        setMessage('Account created. You are signed in and can continue.');
        router.replace(redirectTo);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace(redirectTo);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F8FAFC]">
      <section className="relative pt-24 pb-14 bg-[#1C3D5A] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-400 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-400 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-3xl mx-auto px-4 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-black tracking-widest text-yellow-400 uppercase bg-yellow-400/10 border border-yellow-400/20 rounded-full">
            Careers account
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4">
            {mode === 'signup' ? 'Create your account' : 'Sign in to continue'}
          </h1>
          <p className="text-slate-300 font-medium">
            You’ll use this account to submit and track your job applications.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 -mt-10 pb-20">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/60 border border-slate-100">
          <div className="flex items-center justify-between gap-3 mb-8">
            <div className="flex bg-slate-100 rounded-2xl p-1">
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null); setMessage(null); }}
                className={`px-5 py-2.5 rounded-xl font-black text-sm transition-all ${
                  mode === 'signin' ? 'bg-white shadow text-[#1C3D5A]' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); setMessage(null); }}
                className={`px-5 py-2.5 rounded-xl font-black text-sm transition-all ${
                  mode === 'signup' ? 'bg-white shadow text-[#1C3D5A]' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Create account
              </button>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
              <Lock size={14} />
            </div>
          </div>

          {(error || message) && (
            <div
              className={`mb-6 px-4 py-3 rounded-xl flex items-start gap-3 text-sm border ${
                error ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
              }`}
            >
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <div className="font-semibold">{error || message}</div>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Full name</label>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-yellow-400 transition-all">
                  <User2 size={18} className="text-slate-400" />
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-transparent outline-none text-slate-800 font-semibold placeholder:text-slate-400"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email</label>
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-yellow-400 transition-all">
                <Mail size={18} className="text-slate-400" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent outline-none text-slate-800 font-semibold placeholder:text-slate-400"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Password</label>
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-yellow-400 transition-all">
                <Lock size={18} className="text-slate-400" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent outline-none text-slate-800 font-semibold placeholder:text-slate-400"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  minLength={6}
                />
              </div>
              <p className="text-xs text-slate-400 font-medium ml-1">
                Minimum 6 characters.
              </p>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-4 bg-[#1C3D5A] text-white rounded-2xl font-black text-lg transition-all hover:bg-yellow-500 hover:text-[#1C3D5A] disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10"
            >
              {busy ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Please wait...
                </>
              ) : mode === 'signup' ? (
                'Create account'
              ) : (
                'Sign in'
              )}
            </button>

            <div className="text-center text-xs text-slate-500 font-medium pt-2">
              After signing in, we’ll return you to <span className="font-black text-slate-700">{redirectTo}</span>.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

