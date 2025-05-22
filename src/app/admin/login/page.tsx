'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid username or password');
      setLoading(false);
    } else {
      router.push('/admin/messages');
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-[#fff6ea] py-16">
      <motion.div
        className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl border border-[#ffd60a]/40"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-extrabold text-[#00d66b] mb-6 text-center">
          Admin Login
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-700 text-sm">
              Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="bg-[#fff6ea] border border-[#ffd60a]/50 text-gray-800 placeholder:text-gray-500 focus:ring-2 focus:ring-[#ffd60a] focus:border-[#ffd60a] h-10 rounded-lg"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 text-sm">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="bg-[#fff6ea] border border-[#ffd60a]/50 text-gray-800 placeholder:text-gray-500 focus:ring-2 focus:ring-[#ffd60a] focus:border-[#ffd60a] h-10 rounded-lg"
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              type="submit"
              className="w-full h-12 text-base bg-[#00d66b] text-white shadow-lg hover:bg-[#00ba5e] transition-all duration-300 rounded-lg"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </section>
  );
}