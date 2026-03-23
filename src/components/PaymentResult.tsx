import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
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

  useEffect(() => {
    if (!orderNumber) return;

    let isMounted = true;
    setLoading(true);
    setError('');

    (async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('payment_status, payment_reference, order_status')
          .eq('order_number', orderNumber)
          .maybeSingle();

        if (fetchError) {
          // RLS policies can prevent reads; still show a generic confirmation page.
          if (isMounted) {
            setPaymentStatus(null);
            setPaymentReference(null);
            setOrderStatus(null);
          }
          return;
        }

        if (!isMounted) return;
        setPaymentStatus((data?.payment_status as PaymentStatus) || null);
        setPaymentReference((data?.payment_reference as string | null) || null);
        setOrderStatus((data?.order_status as string | null) || null);
      } catch {
        if (!isMounted) return;
        setPaymentStatus(null);
        setPaymentReference(null);
        setOrderStatus(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [orderNumber]);

  const statusConfig =
    paymentStatus === 'paid'
      ? { icon: CheckCircle2, label: 'Payment received', tone: 'emerald' }
      : paymentStatus === 'failed'
        ? { icon: XCircle, label: 'Payment failed', tone: 'red' }
        : paymentStatus === 'refunded'
          ? { icon: XCircle, label: 'Payment refunded', tone: 'slate' }
          : { icon: Clock, label: 'Payment pending', tone: 'amber' };

  const Icon = statusConfig.icon;

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
              className={
                paymentStatus === 'paid'
                  ? 'text-emerald-600'
                  : paymentStatus === 'failed' || paymentStatus === 'refunded'
                    ? 'text-red-600'
                    : 'text-amber-600'
              }
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

          {loading && <div className="text-slate-600 mb-4">Checking payment status…</div>}

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm inline-block mb-4">
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
            ) : (
              <p className="text-slate-700">
                Your payment is being processed. This page may update once our system receives
                DPO Pay confirmation.
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

