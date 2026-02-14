import { useState } from 'react';
import { Search, Package, Calendar, Truck, CheckCircle2, Clock, XCircle, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

export default function OrderTracking() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [searching, setSearching] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !phone && !orderNumber) {
      setError('Please enter your email, phone number, or order number');
      return;
    }

    setSearching(true);
    setLoading(true);
    setError('');

    try {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (orderNumber) {
        query = query.eq('order_number', orderNumber);
      } else if (email) {
        query = query.eq('customer_email', email);
      } else if (phone) {
        query = query.eq('customer_phone', phone);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setOrders(data || []);
      if (data && data.length === 0) {
        setError('No orders found. Please check your information and try again.');
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return true;
    return order.order_status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock, label: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2, label: 'Confirmed' },
      processing: { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Package, label: 'Processing' },
      shipped: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Truck, label: 'Shipped' },
      delivered: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Cancelled' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.color}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const getPaymentBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock, label: 'Pending' },
      paid: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Paid' },
      failed: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Failed' },
      refunded: { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: XCircle, label: 'Refunded' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.color}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-slate-50 to-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
            Track Your <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Orders</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Enter your order number, email, or phone number to view your order status
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border-2 border-slate-100 p-6 mb-8"
        >
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Order Number
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-mono"
                placeholder="ORD-2025-XXXX-XXXX"
              />
            </div>
            <div className="text-center text-sm text-slate-500 font-semibold">OR</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  placeholder="+256 700 000 000"
                />
              </div>
            </div>
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading || searching}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Search size={20} />
              {loading ? 'Searching...' : 'Track Order'}
            </button>
          </form>
        </motion.div>

        {/* Results */}
        {orders.length > 0 && (
          <>
            {/* Filter */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex gap-2 flex-wrap">
                {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                      statusFilter === status
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-6">
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg border-2 border-slate-100 p-6 hover:shadow-xl transition-all"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1">Order Number</div>
                          <h3 className="text-2xl font-extrabold text-slate-900 mb-2">{order.order_number}</h3>
                          <div className="flex gap-2">
                            {getStatusBadge(order.order_status)}
                            {getPaymentBadge(order.payment_status)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-semibold text-slate-500 mb-1">Total Amount</div>
                          <div className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {formatPrice(order.total_amount)}
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="mb-4">
                        <div className="text-sm font-bold text-slate-700 mb-2">Order Items ({Array.isArray(order.items) ? order.items.length : 0})</div>
                        <div className="space-y-2">
                          {Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                              {item.product_image && (
                                <img src={item.product_image} alt={item.product_name} className="w-12 h-12 object-cover rounded-lg" />
                              )}
                              <div className="flex-1">
                                <div className="font-semibold text-slate-900 text-sm">{item.product_name}</div>
                                <div className="text-xs text-slate-500">Qty: {item.quantity} × {formatPrice(item.product_price)}</div>
                              </div>
                              <div className="font-bold text-slate-900">{formatPrice(item.subtotal || item.product_price * item.quantity)}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-slate-500 font-semibold mb-1 flex items-center gap-1">
                            <MapPin size={14} />
                            Shipping Address
                          </div>
                          <div className="text-slate-900 font-medium">
                            {order.shipping_address}, {order.city}, {order.country}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 font-semibold mb-1 flex items-center gap-1">
                            <Calendar size={14} />
                            Order Date
                          </div>
                          <div className="text-slate-900 font-medium">{formatDate(order.created_at)}</div>
                        </div>
                        {order.tracking_number && (
                          <div>
                            <div className="text-slate-500 font-semibold mb-1 flex items-center gap-1">
                              <Truck size={14} />
                              Tracking Number
                            </div>
                            <div className="text-slate-900 font-bold font-mono">{order.tracking_number}</div>
                          </div>
                        )}
                        {order.shipped_at && (
                          <div>
                            <div className="text-slate-500 font-semibold mb-1">Shipped On</div>
                            <div className="text-slate-900 font-medium">{formatDate(order.shipped_at)}</div>
                          </div>
                        )}
                        {order.delivered_at && (
                          <div>
                            <div className="text-slate-500 font-semibold mb-1">Delivered On</div>
                            <div className="text-slate-900 font-medium">{formatDate(order.delivered_at)}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {orders.length === 0 && !loading && searching && (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-slate-200">
            <Package className="mx-auto text-slate-400 mb-4" size={48} />
            <p className="text-slate-600 text-lg font-semibold">No orders found</p>
            <p className="text-slate-500 text-sm mt-2">Please check your order number, email, or phone number and try again.</p>
          </div>
        )}
      </div>
    </section>
  );
}

