import { useState, useEffect } from 'react';
import { MessageSquare, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Inquiry {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company?: string;
  service_interest: string;
  message: string;
  status: string;
  created_at: string;
}

export default function Messages() {
  const [messages, setMessages] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Inquiry | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setMessages(messages.map(msg => 
        msg.id === id ? { ...msg, status } : msg
      ));
      
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage({ ...selectedMessage, status });
      }
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  };

  const deleteMessage = async () => {
    if (!selectedMessage) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('inquiries')
        .delete()
        .eq('id', selectedMessage.id);

      if (error) throw error;

      setMessages(messages.filter(msg => msg.id !== selectedMessage.id));
      setSelectedMessage(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting message:', error);
    } finally {
      setDeleting(false);
    }
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-2">Manage customer inquiries and messages</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Inquiries ({messages.length})</h2>
              </div>
              <div className="overflow-y-auto max-h-[calc(100dvh-200px)] lg:max-h-[calc(100vh-200px)]">
                {messages.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No messages found</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {messages.map((message) => (
                      <li 
                        key={message.id} 
                        className={`p-4 cursor-pointer hover:bg-gray-50 ${
                          selectedMessage?.id === message.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                        onClick={() => setSelectedMessage(message)}
                      >
                        <div className="flex justify-between">
                          <h3 className="font-medium text-gray-900">{message.full_name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            message.status === 'new' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : message.status === 'contacted' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                          }`}>
                            {message.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-1">{message.email}</p>
                        <p className="text-sm text-gray-500 mt-2 truncate">{message.message}</p>
                        <p className="text-xs text-gray-400 mt-2">{formatDate(message.created_at)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Message Detail */}
          <div className="hidden lg:block lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedMessage.full_name}</h2>
                      <p className="text-gray-600">{selectedMessage.email}</p>
                      <p className="text-gray-600">{selectedMessage.phone}</p>
                      {selectedMessage.company && (
                        <p className="text-gray-600">{selectedMessage.company}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      selectedMessage.status === 'new' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : selectedMessage.status === 'contacted' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedMessage.status}
                    </span>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900">Service Interest</h3>
                    <p className="mt-2 text-gray-600">{selectedMessage.service_interest}</p>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900">Message</h3>
                    <p className="mt-2 text-gray-600 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <button
                      onClick={() => updateMessageStatus(selectedMessage.id, 'contacted')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Mark as Contacted
                    </button>
                    <button
                      onClick={() => updateMessageStatus(selectedMessage.id, 'closed')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Mark as Closed
                    </button>
                    <button
                      onClick={() => updateMessageStatus(selectedMessage.id, 'new')}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Mark as New
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 ml-auto"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <MessageSquare className="mx-auto text-gray-400" size={48} />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No message selected</h3>
                  <p className="mt-1 text-gray-500">Select a message from the list to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile message detail modal */}
      {selectedMessage && (
        <div className="lg:hidden fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedMessage(null)}
          />
          <div className="relative w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85dvh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Message</div>
                <div className="text-xl font-bold text-gray-900 truncate">{selectedMessage.full_name}</div>
                <div className="text-sm text-gray-600 truncate">{selectedMessage.email}</div>
                <div className="text-sm text-gray-600 truncate">{selectedMessage.phone}</div>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <div className="text-sm font-semibold text-gray-900">Service Interest</div>
                <div className="mt-1 text-sm text-gray-600">{selectedMessage.service_interest}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Message</div>
                <div className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{selectedMessage.message}</div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => updateMessageStatus(selectedMessage.id, 'contacted')}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Mark as Contacted
                </button>
                <button
                  onClick={() => updateMessageStatus(selectedMessage.id, 'closed')}
                  className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Mark as Closed
                </button>
                <button
                  onClick={() => updateMessageStatus(selectedMessage.id, 'new')}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Mark as New
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 sm:ml-auto"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Message</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the message from <span className="font-semibold text-gray-900">{selectedMessage?.full_name}</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={deleteMessage}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-60"
              >
                <Trash2 size={16} />
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}