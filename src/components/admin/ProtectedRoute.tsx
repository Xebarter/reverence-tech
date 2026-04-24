 'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminAuth from './Auth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if admin is authenticated
    const isAdminAuthenticated = localStorage.getItem('admin_authenticated') === 'true';
    
    if (isAdminAuthenticated) {
      setAuthenticated(true);
    } else {
      // Redirect to auth page if not authenticated and not already there
      if (pathname !== '/admin/auth') {
        router.push('/admin/auth');
      }
    }
    
    setLoading(false);
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <span className="ml-3">Loading...</span>
      </div>
    );
  }

  if (!authenticated) {
    return <AdminAuth />;
  }

  return <>{children}</>;
}