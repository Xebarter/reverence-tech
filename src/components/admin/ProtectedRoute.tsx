import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminAuth from './Auth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if admin is authenticated
    const isAdminAuthenticated = localStorage.getItem('admin_authenticated') === 'true';
    
    if (isAdminAuthenticated) {
      setAuthenticated(true);
    } else {
      // Redirect to auth page if not authenticated and not already there
      if (location.pathname !== '/admin/auth') {
        navigate('/admin/auth');
      }
    }
    
    setLoading(false);
  }, [navigate, location]);

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