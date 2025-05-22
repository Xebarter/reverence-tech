'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export default function AdminMessages() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchMessages();
    }
  }, [status, router]);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      if (!res.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await res.json();
      setMessages(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff6ea]">
        <p className="text-[#00d66b] text-lg">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff6ea]">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <section className="min-h-screen py-16 bg-[#fff6ea]">
      <div className="container mx-auto px-4">
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl font-extrabold text-[#00d66b]">
            Admin Dashboard - Messages
          </h2>
          <Button
            onClick={handleSignOut}
            className="bg-[#ad00ff] hover:bg-[#9900e6] text-white h-10 rounded-lg flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </motion.div>
        <motion.div
          className="bg-white rounded-xl shadow-2xl border border-[#ffd60a]/40 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {messages.length === 0 ? (
            <p className="text-gray-700 text-center">No messages found.</p>
          ) : (
            <div className="space-y-6">
              {messages.map((msg, index) => (
                <motion.div
                  key={msg._id}
                  className="p-6 bg-[#fff6ea] rounded-lg border border-[#ffd60a]/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <h3 className="text-lg font-semibold text-[#ff5831]">{msg.subject}</h3>
                  <p className="text-gray-700 text-sm mt-1">
                    <strong>Name:</strong> {msg.name}
                  </p>
                  <p className="text-gray-700 text-sm">
                    <strong>Email:</strong> {msg.email}
                  </p>
                  <p className="text-gray-700 text-sm mt-2">{msg.message}</p>
                  <p className="text-gray-500 text-xs mt-2">
                    <strong>Received:</strong> {new Date(msg.createdAt).toLocaleString()}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
