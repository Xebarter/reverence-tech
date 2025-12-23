import { useState, useEffect } from 'react';
import {
  Phone, Calendar, Clock, Mail, MapPin, Search, Trash2,
  RefreshCw, CheckCircle, XCircle, AlertCircle, Plus,
} from 'lucide-react';
import { adminSupabase, ScheduledCall } from '../../lib/supabase';

export default function ScheduledCalls() {
  const [calls, setCalls] = useState<ScheduledCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<ScheduledCall | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    setLoading(true);
    try {
      const { data, error } = await adminSupabase
        .from('scheduled_calls')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCalls(data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<ScheduledCall>) => {
    setIsSaving(true);
    try {
      const { error } = await adminSupabase
        .from('scheduled_calls')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setCalls(prev =>
        prev.map(c => (c.id === id ? { ...c, ...updates } : c))
      );
      if (selectedCall?.id === id) {
        setSelectedCall(prev => (prev ? { ...prev, ...updates } : null));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCall = async (id: string) => {
    if (!window.confirm('Delete this call permanently?')) return;
    await adminSupabase.from('scheduled_calls').delete().eq('id', id);
    setCalls(calls.filter(c => c.id !== id));
    if (selectedCall?.id === id) setSelectedCall(null);
  };

  const filteredCalls = calls.filter(call => {
    const matchesSearch =
      call.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' || call.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      new: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    };
    return map[status] || 'bg-gray-50 text-gray-600 border-gray-200';
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 h-screen flex flex-col">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Scheduled Calls
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Manage your pipeline of incoming client call requests.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all shadow-md active:scale-95">
          <Plus size={20} /> New Entry
        </button>
      </header>

      {/* Toolbar Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-4 flex flex-wrap gap-4 items-center flex-shrink-0">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            className="w-full h-12 pl-12 pr-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-700"
            placeholder="Search leads by name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="h-12 px-5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-gray-600"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <button
          onClick={fetchCalls}
          className="h-12 w-12 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Main Layout Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0 pb-10">
        {/* Left: Call List Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-gray-50/50">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Incoming Requests</span>
          </div>
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {filteredCalls.length === 0 ? (
              <div className="p-12 text-center text-gray-400">No records found.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredCalls.map(call => (
                  <button
                    key={call.id}
                    onClick={() => setSelectedCall(call)}
                    className={`w-full text-left p-6 transition-all relative hover:bg-gray-50 group ${selectedCall?.id === call.id ? 'bg-indigo-50/50' : ''
                      }`}
                  >
                    {selectedCall?.id === call.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />
                    )}
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900 truncate pr-2">
                        {call.full_name}
                      </h3>
                      <span className={`text-[10px] whitespace-nowrap uppercase font-bold px-2 py-0.5 rounded-md border ${statusBadge(call.status)}`}>
                        {call.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate mb-4">{call.email}</p>
                    <div className="flex items-center gap-4 text-[11px] font-semibold text-gray-400">
                      <span className="flex items-center gap-1.5"><Calendar size={14} /> {call.preferred_date || 'TBD'}</span>
                      <span className="flex items-center gap-1.5"><Clock size={14} /> {call.preferred_time || 'TBD'}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Detailed View Content */}
        <div className="lg:col-span-8 h-full">
          {selectedCall ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
              {/* Detail Header */}
              <div className="p-8 border-b bg-white flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                    {selectedCall.full_name}
                  </h2>
                  <div className="flex flex-wrap gap-5 mt-4">
                    <a href={`mailto:${selectedCall.email}`} className="text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-2 text-sm bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                      <Mail size={16} /> {selectedCall.email}
                    </a>
                    {selectedCall.phone && (
                      <span className="flex items-center gap-2 text-sm font-medium text-gray-600 px-3 py-1.5">
                        <Phone size={16} className="text-gray-400" /> {selectedCall.phone}
                      </span>
                    )}
                    {selectedCall.company && (
                      <span className="flex items-center gap-2 text-sm font-medium text-gray-600 px-3 py-1.5">
                        <MapPin size={16} className="text-gray-400" /> {selectedCall.company}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteCall(selectedCall.id)}
                  className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              {/* Detail Body */}
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10 flex-1 overflow-y-auto">
                <div className="space-y-8">
                  <section>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Request Overview</h4>
                    <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
                      <div>
                        <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-tighter">Inquiry Context</p>
                        <p className="text-sm text-gray-800 leading-relaxed font-medium">
                          {selectedCall.call_reason || 'Client did not provide a specific reason.'}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Preferred Date</p>
                          <p className="text-sm font-bold text-gray-900 mt-1">{selectedCall.preferred_date || 'Flexible'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Preferred Time</p>
                          <p className="text-sm font-bold text-gray-900 mt-1">{selectedCall.preferred_time || 'Flexible'}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Scheduling Confirmation</h4>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">Set Meeting Time</label>
                      <input
                        type="datetime-local"
                        className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 shadow-sm"
                        value={selectedCall.scheduled_at ? new Date(selectedCall.scheduled_at).toISOString().slice(0, 16) : ''}
                        onChange={e => handleUpdate(selectedCall.id, { scheduled_at: e.target.value, status: 'scheduled' })}
                      />
                    </div>
                  </section>
                </div>

                {/* Internal Notes Section */}
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Internal CRM Notes</h4>
                    {isSaving && <span className="text-[10px] font-bold text-indigo-500 animate-pulse bg-indigo-50 px-2 py-0.5 rounded">SYNCING...</span>}
                  </div>
                  <textarea
                    className="flex-1 w-full p-6 bg-yellow-50/30 border border-yellow-100 rounded-2xl text-sm focus:ring-2 focus:ring-yellow-200 outline-none resize-none leading-relaxed text-gray-700 shadow-inner placeholder:italic"
                    placeholder="Document call outcomes, meeting links, or follow-up tasks here..."
                    value={selectedCall.notes || ''}
                    onChange={e => setSelectedCall({ ...selectedCall, notes: e.target.value })}
                    onBlur={() => handleUpdate(selectedCall.id, { notes: selectedCall.notes })}
                  />
                </div>
              </div>

              {/* Status Actions Footer */}
              <div className="p-8 border-t bg-gray-50/50 flex flex-wrap gap-4">
                <button
                  onClick={() => handleUpdate(selectedCall.id, { status: 'new' })}
                  className="flex-1 min-w-[140px] px-4 py-3 rounded-xl text-sm font-bold border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-all flex items-center justify-center gap-2"
                >
                  <AlertCircle size={18} className="text-yellow-500" /> Reset to New
                </button>

                <button
                  onClick={() => handleUpdate(selectedCall.id, { status: 'completed' })}
                  className="flex-1 min-w-[140px] px-4 py-3 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} /> Mark Complete
                </button>

                <button
                  onClick={() => handleUpdate(selectedCall.id, { status: 'cancelled' })}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-rose-600 border border-rose-100 hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                >
                  <XCircle size={18} /> Cancel Call
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/30 flex flex-col items-center justify-center text-gray-400 text-center px-10">
              <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                <Phone size={48} className="text-indigo-200" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Workspace Idle</h3>
              <p className="max-w-[280px] leading-relaxed font-medium">
                Select a client call request from the left panel to begin managing the schedule.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}