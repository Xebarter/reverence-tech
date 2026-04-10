import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react';
import { fetchOrderStatus, confirmDpoResult } from '../lib/dpo';

type PaymentStatus = 'paid' | 'failed' | 'pending' | 'refunded' | null;

export default function PaymentResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const orderNumber = searchParams.get('order') || '';
  const statusToken = searchParams.get('t') || '';

  const dpoResult = searchParams.get('Result') || searchParams.get('result') || '';
  const dpoTransRef = searchParams.get('TransRef') || searchParams.get('transRef') || '';

  const dpoSaysSuccess = dpoResult === '000';
  const dpoSaysFailed = dpoResult === '002' || dpoResult === '003';

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    dpoSaysSuccess ? 'paid' : dpoSaysFailed ? 'failed' : null,
  );
  const [paymentReference, setPaymentReference] = useState<string | null>(dpoTransRef || null);
  const [orderStatus, setOrderStatus] = useState<string | null>(
    dpoSaysSuccess ? 'confirmed' : null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [polling, setPolling] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const intervalRef = useRef<number | undefined>(undefined);
  const confirmFired = useRef(false);

  const now = () =>
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // -- Path A: DPO gave us a result in the URL -> confirm with server immediately --
  useEffect(() => {
    if (!orderNumber || !statusToken || confirmFired.current) return;
    if (!dpoSaysSuccess && !dpoSaysFailed) return;

    confirmFired.current = true;

    (async () => {
      try {
        const snapshot = await confirmDpoResult({
          orderNumber,
          statusToken,
          dpoResult,
          transRef: dpoTransRef || undefined,
        });

        setPaymentStatus((snapshot.payment_status as PaymentStatus) || paymentStatus);
        setPaymentReference(snapshot.payment_reference || dpoTransRef || null);
        setOrderStatus(snapshot.order_status || orderStatus);
        setLastCheckedAt(now());
      } catch {
        setLastCheckedAt(now());
      }
    })();
  }, [orderNumber, statusToken, dpoResult, dpoTransRef]);

  // -- Path B: No DPO result in URL -> poll via /api/orders/status --
  const handleRefresh = () => {
    if (intervalRef.current !== undefined) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    setPolling(false);
    setRefreshNonce((n) => n + 1);
  };

  useEffect(() => {
    if (dpoSaysSuccess || dpoSaysFailed) return;
    if (!orderNumber || !statusToken) return;

    let isMounted = true;
    let attempts = 0;
    const maxAttempts = 24;
    const intervalMs = 5000;

    const fetchStatus = async () => {
      if (!isMounted) return null;
      setError('');
      try {
        const snapshot = await fetchOrderStatus(orderNumber, statusToken);
        if (!isMounted) return null;

        const next = (snapshot?.payment_status as PaymentStatus) || null;
        setPaymentStatus(next);
        setPaymentReference(snapshot?.payment_reference ?? null);
        setOrderStatus(snapshot?.order_status ?? null);
        setLastCheckedAt(now());
        return next;
      } catch {
        if (isMounted) setError('Failed to check payment status. Please try again.');
        setLastCheckedAt(now());
        return null;
      }
    };

    (async () => {
      setLoading(true);
      setError('');
      setPolling(false);

      const initial = await fetchStatus();
      if (!isMounted) return;
      setLoading(false);

      if (initial && initial !== 'pending') return;

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
  }, [orderNumber, refreshNonce, statusToken, dpoSaysSuccess, dpoSaysFailed]);

  // -- Auto-navigate to orders page after paid --
  useEffect(() => {
    if (paymentStatus !== 'paid' || !orderNumber) return;
    const id = window.setTimeout(() => {
      navigate(`/orders?order=${encodeURIComponent(orderNumber)}`);
    }, 3000);
    return () => window.clearTimeout(id);
  }, [navigate, orderNumber, paymentStatus]);

  // -- UI rendering --
  const statusConfig =
    paymentStatus === 'paid'
      ? { icon: CheckCircle2, label: 'Payment successful', tone: 'emerald' }
      : paymentStatus === 'failed'
        ? { icon: XCircle, label: 'Payment failed', tone: 'red' }
        : paymentStatus === 'refunded'
          ? { icon: XCircle, label: 'Payment refunded', tone: 'slate' }
          : paymentStatus === 'pending'
            ? { icon: Clock, label: 'Payment pending', tone: 'amber' }
            : { icon: Clock, label: 'Checking payment status…', tone: 'slate' };

  const Icon = statusConfig.icon;

  const iconClass =
    statusConfig.tone === 'emerald'
      ? 'text-emerald-600'
      : statusConfig.tone === 'red'
        ? 'text-red-600'
        : statusConfig.tone === 'amber'
          ? 'text-amber-600'
          : 'text-slate-600';

  const showRefresh = !dpoSaysSuccess && (paymentStatus === 'pending' || paymentStatus === null);

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-slate-50 to-white min-h-screen">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <Icon size={48} className={iconClass} />
          </div>

          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">
            {statusConfig.label}
          </h1>

          {orderNumber && (
            <div className="text-sm text-slate-500 mb-6">
              Order: <span className="font-mono font-bold text-slate-700">{orderNumber}</span>
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
            {paymentStatus === 'paid' ? (
              <p className="text-slate-700">
                Thanks for your payment! Our team will follow up with next steps for your order.
                Redirecting to order tracking…
              </p>
            ) : paymentStatus === 'failed' ? (
              <p className="text-slate-700">
                The payment did not complete. Please try again, or contact us with your order
                reference.
              </p>
            ) : paymentStatus === 'refunded' ? (
              <p className="text-slate-700">
                Your payment was refunded. If you were charged, your bank may take a few days to
                show the refund.
              </p>
            ) : paymentStatus === 'pending' ? (
              <p className="text-slate-700">
                Your payment is being processed. This page checks automatically.
              </p>
            ) : (
              <p className="text-slate-700">
                We're verifying your payment status. Please wait a moment…
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

            {lastCheckedAt && (
              <div className="mt-4 text-xs text-slate-500 text-center">
                Last checked: {lastCheckedAt}
              </div>
            )}

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
