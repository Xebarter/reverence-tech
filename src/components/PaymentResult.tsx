import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, XCircle, ShieldCheck, RefreshCw } from 'lucide-react';
import { fetchOrderStatus } from '../lib/fetchOrderStatus';
import { adminSupabase } from '../lib/supabase';

type PaymentStatus = 'paid' | 'failed' | 'pending' | 'refunded' | null;

export default function PaymentResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order') || '';
  const statusToken = searchParams.get('t') || '';

  // DPO appends Result + TransRef to the RedirectURL after payment.
  // Result=000 → success, 002/003 → failed, 001 → not paid yet.
  const dpoResultInUrl = searchParams.get('Result') || searchParams.get('result') || '';
  const dpoTransRefInUrl = searchParams.get('TransRef') || searchParams.get('transRef') || '';
  const dpoSaysSuccess = dpoResultInUrl === '000';
  const dpoSaysFailed = dpoResultInUrl === '002' || dpoResultInUrl === '003';

  const canFetch = useMemo(() => Boolean(orderNumber && statusToken), [orderNumber, statusToken]);

  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(null);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [polling, setPolling] = useState(false);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);

  // Track interval externally so manual refresh can cancel it immediately.
  const intervalRef = useRef<number | undefined>(undefined);

  const handleRefresh = () => {
    // Cancel any running poll so the new fetch isn't blocked.
    if (intervalRef.current !== undefined) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    setPolling(false);
    setRefreshNonce((n) => n + 1);
  };

  useEffect(() => {
    if (!orderNumber) return;

    let isMounted = true;
    let attempts = 0;
    const maxAttempts = 24; // ~2 minutes at 5 s intervals
    const intervalMs = 5000;

    const fetchStatus = async () => {
      if (!isMounted) return null;

      setError('');
      try {
        const snapshot = canFetch
          ? await fetchOrderStatus(orderNumber, statusToken)
          : await (async () => {
              const { data, error } = await adminSupabase
                .from('orders')
                .select('payment_status, payment_reference, order_status')
                .eq('order_number', orderNumber)
                .maybeSingle();
              if (error) throw error;
              return {
                payment_status: (data?.payment_status as any) ?? null,
                payment_reference: (data?.payment_reference as any) ?? null,
                order_status: (data?.order_status as any) ?? null,
              };
            })();

        const nextStatus = (snapshot?.payment_status as PaymentStatus) || null;
        const nextRef = snapshot?.payment_reference ?? null;
        const nextOrderStatus = snapshot?.order_status ?? null;

        if (!isMounted) return null;

        setPaymentStatus(nextStatus);
        setPaymentReference(nextRef || dpoTransRefInUrl || null);
        setOrderStatus(nextOrderStatus);
        setLastCheckedAt(
          new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        );

        return nextStatus;
      } catch {
        if (isMounted) {
          setError('Failed to check payment status. Please try again.');
          setLastCheckedAt(
            new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          );
        }
        return null;
      }
    };

    (async () => {
      setLoading(true);
      setError('');
      setPolling(false);
      setLastCheckedAt(null);

      const initialStatus = await fetchStatus();
      if (!isMounted) return;
      setLoading(false);

      const isTerminal = initialStatus && initialStatus !== 'pending';
      if (isTerminal) return;

      // Only auto-poll if status is still uncertain.
      setPolling(true);
      intervalRef.current = window.setInterval(async () => {
        if (!isMounted) return;

        attempts += 1;
        if (attempts >= maxAttempts) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = undefined;
          if (isMounted) setPolling(false);
          return;
        }

        const next = await fetchStatus();
        if (next && next !== 'pending') {
          window.clearInterval(intervalRef.current);
          intervalRef.current = undefined;
          if (isMounted) setPolling(false);
        }
      }, intervalMs);
    })();

    return () => {
      isMounted = false;
      if (intervalRef.current !== undefined) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [canFetch, orderNumber, refreshNonce, statusToken]);

  useEffect(() => {
    if (paymentStatus !== 'paid' || !orderNumber) return;
    const id = window.setTimeout(() => {
      navigate(`/orders?order=${encodeURIComponent(orderNumber)}`);
    }, 2500);
    return () => window.clearTimeout(id);
  }, [navigate, orderNumber, paymentStatus]);

  // --- Derive display status (DB is authoritative; DPO URL is a hint only) ---
  const displayStatus: PaymentStatus =
    paymentStatus ??
    (dpoSaysSuccess ? 'pending' : dpoSaysFailed ? 'failed' : null);

  const statusConfig =
    displayStatus === 'paid'
      ? { icon: CheckCircle2, label: 'Payment received', tone: 'emerald' }
      : displayStatus === 'failed'
        ? { icon: XCircle, label: 'Payment failed', tone: 'red' }
        : displayStatus === 'refunded'
          ? { icon: XCircle, label: 'Payment refunded', tone: 'slate' }
          : displayStatus === 'pending'
            ? { icon: Clock, label: 'Payment pending', tone: 'amber' }
            : { icon: ShieldCheck, label: 'Verifying payment…', tone: 'slate' };

  const Icon = statusConfig.icon;

  const iconClass =
    statusConfig.tone === 'emerald'
      ? 'text-emerald-600'
      : statusConfig.tone === 'red'
        ? 'text-red-600'
        : statusConfig.tone === 'amber'
          ? 'text-amber-600'
          : 'text-slate-600';

  const showRefresh = displayStatus === 'pending' || displayStatus === null;

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-slate-50 to-white min-h-screen">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
            {statusConfig.label}
          </h1>

          <div className="flex items-center justify-center gap-3 mb-6">
            <Icon size={20} className={iconClass} />
            <div className="text-sm text-slate-600">
              {orderNumber ? (
                <>
                  Order: <span className="font-mono font-bold">{orderNumber}</span>
                </>
              ) : (
                'Payment session completed'
              )}
            </div>
          </div>

          {/* DPO URL hint banner — shown only while DB status hasn't resolved yet */}
          {dpoSaysSuccess && (displayStatus === 'pending' || displayStatus === null) && !loading && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800 font-medium">
              DPO reports the payment was successful — confirming with our system…
            </div>
          )}

          {showRefresh && (
            <div className="flex justify-center mb-4">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-2 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <RefreshCw size={18} className={polling ? 'animate-spin' : ''} />
                {polling ? 'Checking…' : 'Refresh status'}
              </button>
            </div>
          )}

          {loading && (
            <div className="text-slate-600 mb-4">Checking payment status…</div>
          )}

          {error && (
            <div
              className="p-4 bg-red-50 text-red-700 rounded-xl text-sm inline-block mb-4"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-100 p-6 text-left">
            {displayStatus === 'paid' ? (
              <p className="text-slate-700">
                Thanks for your payment. Our team will follow up with next steps for your service
                request.
              </p>
            ) : displayStatus === 'failed' ? (
              <p className="text-slate-700">
                The payment did not complete. Please try again, or contact us with your order
                reference.
              </p>
            ) : displayStatus === 'refunded' ? (
              <p className="text-slate-700">
                Your payment was refunded. If you were charged, your bank may take a few days to
                show the refund.
              </p>
            ) : displayStatus === 'pending' ? (
              <p className="text-slate-700">
                Your payment is being processed. This page updates automatically once our system
                receives confirmation from DPO Pay.
              </p>
            ) : (
              <p className="text-slate-700">
                We couldn't verify your payment status yet. Please keep your order reference and
                check again shortly.
              </p>
            )}

            {(paymentReference || orderStatus) && (
              <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-700 mb-2">Payment Details</div>
                {paymentReference && (
                  <div className="text-sm text-slate-700 mb-1">
                    Payment ref:{' '}
                    <span className="font-mono font-bold">{paymentReference}</span>
                  </div>
                )}
                {orderStatus && (
                  <div className="text-sm text-slate-700">
                    Order status:{' '}
                    <span className="font-bold capitalize">{orderStatus}</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 text-xs text-slate-500 text-center">
              {lastCheckedAt ? `Last checked: ${lastCheckedAt}. ` : ''}
              {polling ? 'Checking automatically every 5 seconds…' : 'Status updates automatically once DPO Pay confirms.'}
            </div>

            <div className="mt-6 flex gap-3 justify-center">
              <Link
                to="/orders"
                className="px-6 py-3 bg-[#1C3D5A] text-white font-bold rounded-xl hover:bg-[#152f45] transition"
              >
                Track Orders
              </Link>
              <Link
                to="/"
                className="px-6 py-3 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition"
              >
                Return Home
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
