import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
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
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
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
          <div className="lg:col-span-2">
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
    </div>
  );
}