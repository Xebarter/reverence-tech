import { useState, useEffect } from 'react';
import { Search, Package, CheckCircle2, Clock, XCircle, Truck, Edit, DollarSign, Mail, Phone, Boxes } from 'lucide-react';
import { motion } from 'framer-motion';
import { adminSupabase } from '../../lib/supabase';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  country: string;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_reference: string | null;
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_fee: number;
  items: any[];
  notes: string | null;
  admin_notes: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    order_status: 'pending' as Order['order_status'],
    payment_status: 'pending' as Order['payment_status'],
    tracking_number: '',
    admin_notes: '',
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await adminSupabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setEditFormData({
      order_status: order.order_status,
      payment_status: order.payment_status,
      tracking_number: order.tracking_number || '',
      admin_notes: order.admin_notes || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedOrder) return;

    try {
      const updateData: any = {
        order_status: editFormData.order_status,
        payment_status: editFormData.payment_status,
        tracking_number: editFormData.tracking_number || null,
        admin_notes: editFormData.admin_notes || null,
        updated_at: new Date().toISOString(),
      };

      if (editFormData.order_status === 'shipped' && selectedOrder.order_status !== 'shipped') {
        updateData.shipped_at = new Date().toISOString();
      }

      if (editFormData.order_status === 'delivered' && selectedOrder.order_status !== 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await adminSupabase
        .from('orders')
        .update(updateData)
        .eq('id', selectedOrder.id);

      if (error) throw error;
      setShowEditModal(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order');
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

  const getStatusBadge = (status: string, type: 'order' | 'payment') => {
    const statusConfig = {
      order: {
        pending: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock, label: 'Pending' },
        confirmed: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2, label: 'Confirmed' },
        processing: { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Package, label: 'Processing' },
        shipped: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Truck, label: 'Shipped' },
        delivered: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Delivered' },
        cancelled: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Cancelled' },
      },
      payment: {
        pending: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock, label: 'Pending' },
        paid: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Paid' },
        failed: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Failed' },
        refunded: { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: XCircle, label: 'Refunded' },
      },
    };

    const config = statusConfig[type][status as keyof typeof statusConfig[typeof type]] || statusConfig[type].pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.color}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter;
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery) ||
      (order.tracking_number && order.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesPayment && matchesSearch;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.order_status === 'pending').length,
    processing: orders.filter(o => o.order_status === 'processing').length,
    shipped: orders.filter(o => o.order_status === 'shipped').length,
    delivered: orders.filter(o => o.order_status === 'delivered').length,
    totalRevenue: orders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + parseFloat(o.total_amount.toString() || '0'), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-gray-600 mt-2">Manage and track customer orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600">Total Orders</div>
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
            <div className="text-sm font-medium text-gray-600">Processing</div>
            <Package className="text-indigo-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-indigo-600">{stats.processing}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600">Shipped</div>
            <Truck className="text-purple-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.shipped}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600">Delivered</div>
            <CheckCircle2 className="text-emerald-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{stats.delivered}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600">Revenue</div>
            <DollarSign className="text-green-500" size={20} />
          </div>
          <div className="text-xl font-bold text-green-600">{formatPrice(stats.totalRevenue)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by order number, customer name, email, phone, or tracking..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-bold text-gray-900 truncate">{order.order_number}</div>
                <div className="text-xs text-gray-500 mt-1">{formatDate(order.created_at)}</div>
              </div>
              <button
                onClick={() => handleEdit(order)}
                className="shrink-0 p-2 text-indigo-600 bg-indigo-50 rounded-lg"
                title="Edit Order"
              >
                <Edit size={18} />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {getStatusBadge(order.order_status, 'order')}
              {getStatusBadge(order.payment_status, 'payment')}
            </div>

            <div className="mt-3 text-sm text-gray-700">
              <div className="font-semibold text-gray-900">{order.customer_name}</div>
              <div className="text-xs text-gray-500 truncate">{order.customer_email}</div>
              <div className="text-xs text-gray-500 truncate">{order.customer_phone}</div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                <div className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Amount</div>
                <div className="mt-1 font-bold text-indigo-700">{formatPrice(order.total_amount)}</div>
              </div>
              <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                <div className="text-[11px] font-bold uppercase tracking-wide text-gray-500 flex items-center gap-1">
                  <Boxes size={14} />
                  Items
                </div>
                <div className="mt-1 text-sm text-gray-900">
                  {Array.isArray(order.items) ? order.items.length : 0} item(s)
                </div>
                {Array.isArray(order.items) && order.items.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1 truncate">{order.items[0].product_name}</div>
                )}
              </div>
            </div>

            {order.tracking_number && (
              <div className="mt-3 text-xs text-gray-600">
                <Truck size={12} className="inline mr-1" />
                {order.tracking_number}
              </div>
            )}
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg">No orders found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Order</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{order.order_number}</div>
                    {order.tracking_number && (
                      <div className="text-xs text-gray-500 mt-1">
                        <Truck size={12} className="inline mr-1" />
                        {order.tracking_number}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{order.customer_name}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Mail size={12} />
                      {order.customer_email}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone size={12} />
                      {order.customer_phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {Array.isArray(order.items) ? order.items.length : 0} item(s)
                    </div>
                    {Array.isArray(order.items) && order.items.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {order.items[0].product_name}
                        {order.items.length > 1 && ` +${order.items.length - 1} more`}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-indigo-600">{formatPrice(order.total_amount)}</div>
                    {order.shipping_fee > 0 && (
                      <div className="text-xs text-gray-500">Shipping: {formatPrice(order.shipping_fee)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(order.order_status, 'order')}</td>
                  <td className="px-6 py-4">{getStatusBadge(order.payment_status, 'payment')}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{formatDate(order.created_at)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(order)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit Order"
                    >
                      <Edit size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg">No orders found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Edit Order: {selectedOrder.order_number}</h2>
              <p className="text-gray-600 mt-1">Update order status and add admin notes</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Order Status</label>
                  <select
                    value={editFormData.order_status}
                    onChange={(e) => setEditFormData({ ...editFormData, order_status: e.target.value as Order['order_status'] })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Payment Status</label>
                  <select
                    value={editFormData.payment_status}
                    onChange={(e) => setEditFormData({ ...editFormData, payment_status: e.target.value as Order['payment_status'] })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tracking Number</label>
                  <input
                    type="text"
                    value={editFormData.tracking_number}
                    onChange={(e) => setEditFormData({ ...editFormData, tracking_number: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none"
                    placeholder="Enter tracking number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Admin Notes</label>
                  <textarea
                    value={editFormData.admin_notes}
                    onChange={(e) => setEditFormData({ ...editFormData, admin_notes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none resize-none"
                    placeholder="Internal notes (not visible to customer)..."
                  />
                </div>
              </div>
              
              {/* Order Details */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm font-semibold text-gray-700 mb-3">Order Details</div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div><span className="font-semibold">Customer:</span> {selectedOrder.customer_name}</div>
                  <div><span className="font-semibold">Email:</span> {selectedOrder.customer_email}</div>
                  <div><span className="font-semibold">Phone:</span> {selectedOrder.customer_phone}</div>
                  <div><span className="font-semibold">Total:</span> {formatPrice(selectedOrder.total_amount)}</div>
                  <div className="col-span-2">
                    <span className="font-semibold">Shipping:</span> {selectedOrder.shipping_address}, {selectedOrder.city}, {selectedOrder.country}
                  </div>
                  {selectedOrder.payment_reference && (
                    <div className="col-span-2">
                      <span className="font-semibold">Payment Ref:</span> {selectedOrder.payment_reference}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedOrder(null);
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

