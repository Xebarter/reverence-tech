import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AdminAuth from './Auth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isCheckingAuth = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Prevent multiple simultaneous auth checks
      if (isCheckingAuth.current) return;
      isCheckingAuth.current = true;

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          isCheckingAuth.current = false;
          return;
        }
        
        if (session) {
          // Check if user is admin
          const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('is_active')
            .eq('id', session.user.id)
            .eq('is_active', true)
            .single();

          if (adminError) {
            console.error('Admin check error:', adminError);
          }

          if (adminData && !adminError) {
            setAuthenticated(true);
            setIsAdmin(true);
          } else {
            // User is authenticated but not an admin
            setAuthenticated(true);
            setIsAdmin(false);
            navigate('/unauthorized');
          }
        } else {
          // No session, user is not authenticated
          setAuthenticated(false);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        setLoading(false);
        isCheckingAuth.current = false;
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Prevent multiple simultaneous auth checks
      if (isCheckingAuth.current) return;
      isCheckingAuth.current = true;
      
      setLoading(true);
      try {
        if (session) {
          // Check if user is admin
          const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('is_active')
            .eq('id', session.user.id)
            .eq('is_active', true)
            .single();

          if (adminError) {
            console.error('Admin check error:', adminError);
          }

          if (adminData && !adminError) {
            setAuthenticated(true);
            setIsAdmin(true);
          } else {
            setAuthenticated(true);
            setIsAdmin(false);
            // Redirect non-admin users to unauthorized page
            navigate('/unauthorized');
          }
        } else {
          setAuthenticated(false);
          setIsAdmin(false);
          // Stay on auth page if already there, otherwise redirect
          if (location.pathname !== '/admin/auth') {
            navigate('/admin/auth');
          }
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        navigate('/admin/auth');
      } finally {
        setLoading(false);
        isCheckingAuth.current = false;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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

  if (!isAdmin) {
    // This should generally not be reached due to navigation in the effect, but added for safety
    navigate('/unauthorized');
    return null;
  }

  return <>{children}</>;
}