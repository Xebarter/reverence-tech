import { useState, useEffect } from 'react';
import { Search, CheckCircle2, Clock, XCircle, Edit, DollarSign, Package, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface Deposit {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  product_id: string;
  product_name: string;
  product_price: number;
  deposit_amount: number;
  total_deposited: number;
  remaining_balance: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_method: string;
  payment_reference: string | null;
  notes: string | null;
  admin_notes: string | null;
  deposit_date: string;
  expected_completion_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function Deposits() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    status: 'pending' as Deposit['status'],
    admin_notes: '',
  });

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_deposits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeposits(data || []);
    } catch (error) {
      console.error('Error fetching deposits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (depositId: string, newStatus: Deposit['status']) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('customer_deposits')
        .update(updateData)
        .eq('id', depositId);

      if (error) throw error;
      fetchDeposits();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleEdit = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setEditFormData({
      status: deposit.status,
      admin_notes: deposit.admin_notes || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedDeposit) return;

    try {
      const updateData: any = {
        status: editFormData.status,
        admin_notes: editFormData.admin_notes || null,
        updated_at: new Date().toISOString(),
      };

      if (editFormData.status === 'completed' && selectedDeposit.status !== 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('customer_deposits')
        .update(updateData)
        .eq('id', selectedDeposit.id);

      if (error) throw error;
      setShowEditModal(false);
      setSelectedDeposit(null);
      fetchDeposits();
    } catch (error) {
      console.error('Error updating deposit:', error);
      alert('Failed to update deposit');
    }
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  const calculateProgress = (deposit: Deposit) => {
    if (!deposit.product_price || deposit.product_price === 0) return 0;
    return Math.min(100, (deposit.total_deposited / deposit.product_price) * 100);
  };

  const filteredDeposits = deposits.filter(deposit => {
    const matchesStatus = statusFilter === 'all' || deposit.status === statusFilter;
    const matchesSearch = 
      deposit.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deposit.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deposit.customer_phone.includes(searchQuery) ||
      deposit.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deposit.payment_reference && deposit.payment_reference.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: deposits.length,
    pending: deposits.filter(d => d.status === 'pending').length,
    confirmed: deposits.filter(d => d.status === 'confirmed').length,
    completed: deposits.filter(d => d.status === 'completed').length,
    totalAmount: deposits.reduce((sum, d) => sum + parseFloat(d.total_deposited.toString() || '0'), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading deposits...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customer Deposits</h1>
        <p className="text-gray-600 mt-2">Manage and track customer deposits for products</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600">Total Deposits</div>
            <Package className="text-indigo-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600">Pending</div>
            <Clock className="text-amber-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600">Confirmed</div>
            <CheckCircle2 className="text-blue-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600">Completed</div>
            <CheckCircle2 className="text-emerald-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600">Total Amount</div>
            <DollarSign className="text-purple-500" size={20} />
          </div>
          <div className="text-xl font-bold text-purple-600">{formatPrice(stats.totalAmount)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, phone, product, or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Deposits Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDeposits.map((deposit) => {
                const progress = calculateProgress(deposit);
                return (
                  <tr key={deposit.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{deposit.customer_name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Mail size={12} />
                          {deposit.customer_email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone size={12} />
                          {deposit.customer_phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{deposit.product_name}</div>
                      <div className="text-sm text-gray-500">{formatPrice(deposit.product_price)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-32">
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-gray-600">{progress.toFixed(0)}%</span>
                          <span className="text-indigo-600">{formatPrice(deposit.total_deposited)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        {deposit.remaining_balance > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            Remaining: {formatPrice(deposit.remaining_balance)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-indigo-600">{formatPrice(deposit.deposit_amount)}</div>
                      <div className="text-xs text-gray-500">Last deposit</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(deposit.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{formatDate(deposit.deposit_date || deposit.created_at)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(deposit)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <select
                          value={deposit.status}
                          onChange={(e) => handleStatusUpdate(deposit.id, e.target.value as Deposit['status'])}
                          className="px-3 py-1 text-xs font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredDeposits.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg">No deposits found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Edit Deposit</h2>
              <p className="text-gray-600 mt-1">Update deposit status and add admin notes</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as Deposit['status'] })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Admin Notes</label>
                <textarea
                  value={editFormData.admin_notes}
                  onChange={(e) => setEditFormData({ ...editFormData, admin_notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none resize-none"
                  placeholder="Internal notes (not visible to customer)..."
                />
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">Deposit Details</div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div><span className="font-semibold">Customer:</span> {selectedDeposit.customer_name}</div>
                  <div><span className="font-semibold">Product:</span> {selectedDeposit.product_name}</div>
                  <div><span className="font-semibold">Total Deposited:</span> {formatPrice(selectedDeposit.total_deposited)}</div>
                  <div><span className="font-semibold">Remaining:</span> {formatPrice(selectedDeposit.remaining_balance)}</div>
                  {selectedDeposit.payment_reference && (
                    <div><span className="font-semibold">Reference:</span> {selectedDeposit.payment_reference}</div>
                  )}
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedDeposit(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

