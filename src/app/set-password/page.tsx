"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { useUser } from "../../UserContext";
import { supabase } from "../../lib/supabase";
import { AlertCircle, Loader2, Lock } from "lucide-react";

export default function SetPasswordPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/auth?redirect=/set-password");
  }, [loading, user, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      window.setTimeout(() => router.replace("/dashboard"), 800);
    } catch (e: any) {
      setError(e?.message || "Failed to set password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SEO title="Set Password" />
      <Header />
      <main className="pt-20">
        <div className="min-h-[calc(100vh-80px)] bg-[#F8FAFC]">
          <section className="relative pt-24 pb-14 bg-[#1C3D5A] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-400 rounded-full blur-[120px]" />
              <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-400 rounded-full blur-[120px]" />
            </div>
            <div className="max-w-3xl mx-auto px-4 relative z-10 text-center">
              <span className="inline-block px-4 py-1.5 mb-6 text-xs font-black tracking-widest text-yellow-400 uppercase bg-yellow-400/10 border border-yellow-400/20 rounded-full">
                Secure your account
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-3 flex items-center justify-center gap-3">
                <Lock className="text-yellow-400" /> Set your password
              </h1>
              <p className="text-slate-300 font-medium">
                Create a password to access your dashboard and view your purchased services.
              </p>
            </div>
          </section>

          <div className="max-w-3xl mx-auto px-4 -mt-10 pb-20">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/60 border border-slate-100">
              {error && (
                <div className="mb-6 bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              {done ? (
                <div className="text-center py-10">
                  <div className="text-[#1C3D5A] font-black text-2xl mb-2">Password set!</div>
                  <div className="text-slate-500 font-medium">Redirecting you to your dashboard…</div>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">New password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-yellow-400 outline-none transition-all font-semibold"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Confirm password</label>
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-yellow-400 outline-none transition-all font-semibold"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      required
                      minLength={6}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={busy || loading || !user}
                    className="w-full py-4 bg-[#1C3D5A] text-white rounded-2xl font-black text-lg transition-all hover:bg-yellow-500 hover:text-[#1C3D5A] disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10"
                  >
                    {busy ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save password"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

