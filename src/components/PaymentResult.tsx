import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, XCircle, ShieldCheck, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

type PaymentStatus = 'paid' | 'failed' | 'pending' | 'refunded' | null;

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order') || '';

  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(null);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [polling, setPolling] = useState(false);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber) return;

    let isMounted = true;
    let intervalId: number | undefined;
    let attempts = 0;
    const maxAttempts = 24; // ~2 minutes with 5s interval
    const intervalMs = 5000;

    const fetchStatus = async () => {
      if (!isMounted) return null;

      setError('');
      try {
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('payment_status, payment_reference, order_status')
          .eq('order_number', orderNumber)
          .maybeSingle();

        if (fetchError) {
          setPaymentStatus(null);
          setPaymentReference(null);
          setOrderStatus(null);
          if (isMounted) {
            setError('We’re still waiting for payment confirmation. Please try again in a moment.');
          }
          setLastCheckedAt(
            new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          );
          return null;
        }

        const nextPaymentStatus = (data?.payment_status as PaymentStatus) || null;
        const nextPaymentReference = (data?.payment_reference as string | null) || null;
        const nextOrderStatus = (data?.order_status as string | null) || null;

        if (!isMounted) return null;

        setPaymentStatus(nextPaymentStatus);
        setPaymentReference(nextPaymentReference);
        setOrderStatus(nextOrderStatus);
        setLastCheckedAt(
          new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        );

        return nextPaymentStatus;
      } catch {
        setPaymentStatus(null);
        setPaymentReference(null);
        setOrderStatus(null);
        if (isMounted) setError('Failed to check payment status. Please refresh or try again.');
        setLastCheckedAt(
          new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        );
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

      const shouldContinue = !(initialStatus && initialStatus !== 'pending');
      if (!shouldContinue) return;

      setPolling(true);
      intervalId = window.setInterval(async () => {
        if (!isMounted) return;

        attempts += 1;
        if (attempts >= maxAttempts) {
          if (intervalId) window.clearInterval(intervalId);
          intervalId = undefined;
          setPolling(false);
          return;
        }

        const nextPaymentStatus = await fetchStatus();

        if (nextPaymentStatus && nextPaymentStatus !== 'pending') {
          if (intervalId) window.clearInterval(intervalId);
          intervalId = undefined;
          setPolling(false);
        }
      }, intervalMs);
    })();

    return () => {
      isMounted = false;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [orderNumber, refreshNonce]);

  const statusConfig =
    paymentStatus === 'paid'
      ? { icon: CheckCircle2, label: 'Payment received', tone: 'emerald' }
      : paymentStatus === 'failed'
        ? { icon: XCircle, label: 'Payment failed', tone: 'red' }
        : paymentStatus === 'refunded'
          ? { icon: XCircle, label: 'Payment refunded', tone: 'slate' }
          : paymentStatus === 'pending'
            ? { icon: Clock, label: 'Payment pending', tone: 'amber' }
            : { icon: ShieldCheck, label: 'Payment status pending verification', tone: 'slate' };

  const Icon = statusConfig.icon;

  const iconClass =
    statusConfig.tone === 'emerald'
      ? 'text-emerald-600'
      : statusConfig.tone === 'red'
        ? 'text-red-600'
        : statusConfig.tone === 'amber'
          ? 'text-amber-600'
          : 'text-slate-600';

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
            <Icon
              size={20}
              className={iconClass}
            />
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

          {(paymentStatus === 'pending' || paymentStatus === null) && (
            <div className="flex justify-center mb-4">
              <button
                type="button"
                onClick={() => setRefreshNonce((n) => n + 1)}
                disabled={loading || polling}
                className="px-4 py-2 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <RefreshCw size={18} className={polling ? 'animate-spin' : ''} />
                Refresh status
              </button>
            </div>
          )}

          {(loading || polling) && (
            <div className="text-slate-600 mb-4">Updating payment status…</div>
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
                Thanks for your payment. Our team will follow up with next steps for{' '}
                your service request.
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
                Your payment is being processed. This page updates automatically once our system
                receives confirmation from DPO Pay.
              </p>
            ) : (
              <p className="text-slate-700">
                We couldn’t verify your payment status yet. Please keep your order reference and
                check again shortly.
              </p>
            )}

            {(paymentReference || orderStatus) && (
              <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-700 mb-2">Payment Details</div>
                {paymentReference && (
                  <div className="text-sm text-slate-700 mb-1">
                    Payment ref: <span className="font-mono font-bold">{paymentReference}</span>
                  </div>
                )}
                {orderStatus && (
                  <div className="text-sm text-slate-700">
                    Order status: <span className="font-bold capitalize">{orderStatus}</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 text-xs text-slate-500 text-center">
              {lastCheckedAt ? `Last updated: ${lastCheckedAt}. ` : ''}
              Status updates automatically once our system receives confirmation from DPO Pay.
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

