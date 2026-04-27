'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { useUser } from '../UserContext';
import { Briefcase, FileText, Info, LayoutDashboard, Loader2, ShoppingBag, Wrench } from 'lucide-react';

type OrderRow = {
  id: string;
  order_number: string;
  created_at: string;
  payment_status: string | null;
  order_status: string | null;
  total_amount: number;
  items: any;
};

type JobAppRow = {
  id: string;
  created_at: string;
  status: string | null;
  jobs?: { id: string; title: string; location: string | null } | null;
};

function isServiceOrder(items: unknown): boolean {
  if (!Array.isArray(items)) return false;
  return items.some((it) => it && typeof it === 'object' && (it as any).category === 'service');
}

export default function UserDashboard() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [busy, setBusy] = useState(true);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [apps, setApps] = useState<JobAppRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const redirectToAuth = useMemo(() => `/auth?redirect=${encodeURIComponent('/dashboard')}`, []);

  useEffect(() => {
    if (!loading && !user) router.replace(redirectToAuth);
  }, [loading, user, router, redirectToAuth]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setBusy(true);
      setError(null);
      try {
        const [ordersRes, appsRes] = await Promise.all([
          supabase
            .from('orders')
            .select('id,order_number,created_at,payment_status,order_status,total_amount,items')
            .order('created_at', { ascending: false })
            .limit(20),
          supabase
            .from('job_applications')
            .select('id,created_at,status,jobs ( id, title, location )')
            .order('created_at', { ascending: false })
            .limit(10),
        ]);

        if (ordersRes.error) throw ordersRes.error;
        if (appsRes.error) throw appsRes.error;

        setOrders((ordersRes.data as any) || []);
        setApps((appsRes.data as any) || []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load dashboard.');
      } finally {
        setBusy(false);
      }
    };
    load();
  }, [user]);

  if (loading || busy) {
    return (
      <div className="min-h-[60vh] bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-slate-500 font-bold">
          <Loader2 className="animate-spin" size={18} />
          Loading dashboard...
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
          <p className="text-slate-500 font-medium mb-6">Create an account or sign in to access your dashboard.</p>
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

  const paidServiceOrders = orders.filter((o) => isServiceOrder(o.items) && o.payment_status === 'paid');
  const otherOrders = orders.filter((o) => !isServiceOrder(o.items));

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F8FAFC]">
      <section className="relative pt-24 pb-14 bg-[#1C3D5A] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-400 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-400 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-black tracking-widest text-yellow-400 uppercase bg-yellow-400/10 border border-yellow-400/20 rounded-full">
            Account
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3 flex items-center gap-3">
            <LayoutDashboard className="text-yellow-400" /> Dashboard
          </h1>
          <p className="text-slate-300 font-medium">
            Welcome, <span className="font-black text-white">{user.email}</span>
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-10 pb-20 space-y-8">
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard title="Paid Services" value={paidServiceOrders.length} icon={<Wrench className="text-emerald-600" />} />
          <StatCard title="Orders" value={otherOrders.length} icon={<ShoppingBag className="text-blue-600" />} />
          <StatCard title="Job Applications" value={apps.length} icon={<Briefcase className="text-yellow-600" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-[2rem] p-7 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <Wrench className="text-emerald-600" />
                <h2 className="text-xl font-black text-[#1C3D5A]">Your Services</h2>
              </div>
              <button
                onClick={() => router.push('/orders')}
                className="text-sm font-black text-slate-500 hover:text-[#1C3D5A] transition"
              >
                View all
              </button>
            </div>
            {paidServiceOrders.length === 0 ? (
              <EmptyState
                title="No paid services yet"
                desc="After you pay for a service, it will appear here automatically."
                actionLabel="Browse services"
                onAction={() => router.push('/#services')}
              />
            ) : (
              <div className="space-y-3">
                {paidServiceOrders.slice(0, 6).map((o) => (
                  <RowCard
                    key={o.id}
                    title={String((Array.isArray(o.items) ? o.items[0]?.product_name : '') || 'Service')}
                    meta={`Order ${o.order_number} • ${new Date(o.created_at).toLocaleDateString()}`}
                    badge={o.order_status || 'processing'}
                    onClick={() => router.push(`/orders?order=${encodeURIComponent(o.order_number)}`)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-[2rem] p-7 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <Briefcase className="text-yellow-600" />
                <h2 className="text-xl font-black text-[#1C3D5A]">Your Applications</h2>
              </div>
              <button
                onClick={() => router.push('/applications')}
                className="text-sm font-black text-slate-500 hover:text-[#1C3D5A] transition"
              >
                View all
              </button>
            </div>
            {apps.length === 0 ? (
              <EmptyState
                title="No applications yet"
                desc="Apply for a role to start tracking your application here."
                actionLabel="View careers"
                onAction={() => router.push('/careers')}
              />
            ) : (
              <div className="space-y-3">
                {apps.slice(0, 6).map((a) => (
                  <RowCard
                    key={a.id}
                    title={a.jobs?.title || 'Job'}
                    meta={`${new Date(a.created_at).toLocaleDateString()}${a.jobs?.location ? ` • ${a.jobs.location}` : ''}`}
                    badge={a.status || 'new'}
                    onClick={() => router.push('/applications')}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-7 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <FileText className="text-blue-600" />
              <h2 className="text-xl font-black text-[#1C3D5A]">Recent Activity</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MiniCTA
              title="Track an order"
              desc="Use order tracking if you checked out without signing in."
              action="Open tracking"
              onClick={() => router.push('/orders')}
            />
            <MiniCTA
              title="Update your password"
              desc="Improve account security anytime."
              action="Set password"
              onClick={() => router.push('/set-password')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">{icon}</div>
      <div>
        <div className="text-xs font-black uppercase tracking-widest text-slate-400">{title}</div>
        <div className="text-3xl font-black text-[#1C3D5A]">{value}</div>
      </div>
    </div>
  );
}

function RowCard({
  title,
  meta,
  badge,
  onClick,
}: {
  title: string;
  meta: string;
  badge: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-5 rounded-[1.5rem] border border-slate-100 hover:border-yellow-300 hover:bg-slate-50 transition-all flex items-center justify-between gap-4"
    >
      <div className="min-w-0">
        <div className="font-black text-[#1C3D5A] truncate">{title}</div>
        <div className="text-sm text-slate-500 font-semibold mt-1">{meta}</div>
      </div>
      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 shrink-0">
        {badge}
      </span>
    </button>
  );
}

function EmptyState({
  title,
  desc,
  actionLabel,
  onAction,
}: {
  title: string;
  desc: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="py-10 text-center">
      <Info className="w-12 h-12 text-slate-200 mx-auto mb-3" />
      <div className="text-lg font-black text-[#1C3D5A]">{title}</div>
      <div className="text-slate-500 font-medium mt-1 mb-6">{desc}</div>
      <button
        onClick={onAction}
        className="px-7 py-3 bg-yellow-400 text-[#1C3D5A] rounded-2xl font-black hover:bg-[#1C3D5A] hover:text-white transition-all"
      >
        {actionLabel}
      </button>
    </div>
  );
}

function MiniCTA({
  title,
  desc,
  action,
  onClick,
}: {
  title: string;
  desc: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="p-6 rounded-[1.75rem] border border-slate-100 bg-slate-50/60">
      <div className="text-lg font-black text-[#1C3D5A]">{title}</div>
      <div className="text-slate-500 font-medium mt-1 mb-5">{desc}</div>
      <button onClick={onClick} className="px-5 py-2.5 bg-[#1C3D5A] text-white rounded-2xl font-black hover:bg-yellow-500 hover:text-[#1C3D5A] transition-all">
        {action}
      </button>
    </div>
  );
}

