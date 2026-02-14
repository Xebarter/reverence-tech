import { useState } from 'react';
import { Search, Package, Calendar, CheckCircle2, Clock, XCircle, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

export default function DepositTracking() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [searching, setSearching] = useState(false);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !phone) {
      setError('Please enter your email or phone number');
      return;
    }

    setSearching(true);
    setLoading(true);
    setError('');

    try {
      let query = supabase
        .from('customer_deposits')
        .select('*')
        .order('created_at', { ascending: false });

      if (email) {
        query = query.eq('customer_email', email);
      }
      if (phone) {
        query = query.eq('customer_phone', phone);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setDeposits(data || []);
      if (data && data.length === 0) {
        setError('No deposits found. Please check your email or phone number.');
      }
    } catch (err: any) {
      console.error('Error fetching deposits:', err);
      setError(err.message || 'Failed to fetch deposits. Please try again.');
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const filteredDeposits = deposits.filter(deposit => {
    if (statusFilter === 'all') return true;
    return deposit.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock, label: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2, label: 'Confirmed' },
      completed: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Completed' },
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

  const calculateProgress = (deposit: any) => {
    if (!deposit.product_price || deposit.product_price === 0) return 0;
    return Math.min(100, (deposit.total_deposited / deposit.product_price) * 100);
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
            Track Your <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Deposits</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Enter your email or phone number to view your deposit history and progress
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
              {loading ? 'Searching...' : 'Search Deposits'}
            </button>
          </form>
        </motion.div>

        {/* Results */}
        {deposits.length > 0 && (
          <>
            {/* Filter */}
            <div className="flex items-center gap-4 mb-6">
              <Filter size={20} className="text-slate-500" />
              <div className="flex gap-2 flex-wrap">
                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
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

            {/* Deposits List */}
            <div className="space-y-6">
              {filteredDeposits.map((deposit, index) => {
                const progress = calculateProgress(deposit);
                return (
                  <motion.div
                    key={deposit.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg border-2 border-slate-100 p-6 hover:shadow-xl transition-all"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Package size={32} className="text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-xl font-extrabold text-slate-900">{deposit.product_name}</h3>
                              {getStatusBadge(deposit.status)}
                            </div>
                            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-2">
                              {deposit.product_id ? 'Product ID: ' + deposit.product_id.substring(0, 8) + '...' : 'Product'}
                            </div>
                            <div className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                              {formatPrice(deposit.product_price)}
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm font-semibold mb-2">
                            <span className="text-slate-600">Payment Progress</span>
                            <span className="text-indigo-600 font-bold">
                              {formatPrice(deposit.total_deposited)} / {formatPrice(deposit.product_price)}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${progress}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full rounded-full"
                            />
                          </div>
                          <div className="flex justify-between text-xs text-slate-500 mt-2">
                            <span>{progress.toFixed(1)}% Complete</span>
                            {deposit.remaining_balance > 0 ? (
                              <span className="text-amber-600 font-semibold">
                                Remaining: {formatPrice(deposit.remaining_balance)}
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-semibold">Fully Paid!</span>
                            )}
                          </div>
                        </div>

                        {/* Deposit Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-slate-500 font-semibold mb-1">Last Deposit</div>
                            <div className="text-slate-900 font-bold">{formatPrice(deposit.deposit_amount)}</div>
                          </div>
                          <div>
                            <div className="text-slate-500 font-semibold mb-1">Payment Method</div>
                            <div className="text-slate-900 font-bold capitalize">
                              {deposit.payment_method?.replace('_', ' ')}
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-500 font-semibold mb-1">Deposit Date</div>
                            <div className="text-slate-900 font-bold flex items-center gap-1">
                              <Calendar size={14} />
                              {formatDate(deposit.deposit_date || deposit.created_at)}
                            </div>
                          </div>
                          {deposit.payment_reference && (
                            <div>
                              <div className="text-slate-500 font-semibold mb-1">Reference</div>
                              <div className="text-slate-900 font-bold font-mono text-xs">
                                {deposit.payment_reference}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Area */}
                      <div className="md:w-48 flex flex-col justify-between">
                        <div className="text-right mb-4">
                          <div className="text-xs text-slate-500 mb-1">Total Deposited</div>
                          <div className="text-2xl font-extrabold text-indigo-600">
                            {formatPrice(deposit.total_deposited)}
                          </div>
                        </div>
                        {deposit.remaining_balance > 0 && (
                          <button
                            onClick={() => {
                              // Scroll to shop or open deposit form
                              const shopSection = document.getElementById('shop');
                              if (shopSection) {
                                shopSection.scrollIntoView({ behavior: 'smooth' });
                              }
                            }}
                            className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 text-sm"
                          >
                            Make Another Deposit
                          </button>
                        )}
                      </div>
                    </div>

                    {deposit.notes && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="text-xs font-semibold text-slate-500 mb-1">Notes</div>
                        <div className="text-sm text-slate-700">{deposit.notes}</div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Summary Stats */}
            {filteredDeposits.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm opacity-90 mb-1">Total Deposits</div>
                    <div className="text-2xl font-extrabold">
                      {filteredDeposits.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90 mb-1">Total Amount</div>
                    <div className="text-2xl font-extrabold">
                      {formatPrice(filteredDeposits.reduce((sum, d) => sum + parseFloat(d.total_deposited || 0), 0))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90 mb-1">Completed</div>
                    <div className="text-2xl font-extrabold">
                      {filteredDeposits.filter(d => d.status === 'completed').length}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}

        {deposits.length === 0 && !loading && searching && (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-slate-200">
            <Package className="mx-auto text-slate-400 mb-4" size={48} />
            <p className="text-slate-600 text-lg font-semibold">No deposits found</p>
            <p className="text-slate-500 text-sm mt-2">Please check your email or phone number and try again.</p>
          </div>
        )}
      </div>
    </section>
  );
}

