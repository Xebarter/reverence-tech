import { useState, useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function AdminAuth() {
  const [loading, setLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const navigate = useNavigate();

  // Listen to auth state changes
  useEffect(() => {
    let subscription: any = null;

    const handleAuthChange = async (event: string, session: any) => {
      // Log full session object to assist debugging
      console.log('Auth event:', event, 'userId:', session?.user?.id, 'session:', session);

      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session) {
          try {
            const { data: adminData, error } = await supabase
              .from('admin_users')
              .select('is_active')
              .eq('id', session.user.id)
              .single();

            if (error) {
              // Print structured details from the Supabase/PostgREST error object if present
              console.error('Error checking admin status:', error);
              try {
                console.error('Error details:', {
                  message: (error as any).message,
                  code: (error as any).code,
                  details: (error as any).details,
                  hint: (error as any).hint,
                  status: (error as any).status,
                });
              } catch (e) {
                // ignore structured logging failures
              }
            }

            if (adminData && adminData.is_active) {
              navigate('/admin', { replace: true });
            } else {
              // Not an admin, sign out
              await supabase.auth.signOut();
              // Optionally show a message: "Access denied. Please contact support."
            }
          } catch (err) {
            // Catch unexpected runtime errors and log them fully
            console.error('Unexpected error while checking admin status:', err);
          }
        }
      }
    };

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      handleAuthChange(event, session);
    });

    subscription = data.subscription;

    // Initial session check
    supabase.auth.getSession();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [navigate]);

  // Handle URL hash for recovery
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      const params = new URLSearchParams(hash);
      if (params.get('type') === 'recovery') {
        setShowResetForm(false);
        setResetMessage(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResetMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/admin/auth`
      });

      if (error) throw error;

      console.log('Password reset request successful for', resetEmail);

      setResetMessage({
        type: 'success',
        text: 'Password reset instructions sent to your email. Please check your inbox.'
      });
      setResetEmail('');
    } catch (error: any) {
      console.error('Reset password error object:', error);
      setResetMessage({
        type: 'error',
        text: error.message || 'Failed to send reset instructions. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Panel Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access the admin dashboard
          </p>
        </div>

        {!showResetForm ? (
          <>
            <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  style: {
                    button: {
                      background: '#1C3D5A',
                      borderColor: '#1C3D5A',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontWeight: '600',
                    },
                    anchor: {
                      color: '#F2B134',
                      cursor: 'pointer',
                    }
                  }
                }}
                theme="default"
                providers={[]}
                redirectTo={`${window.location.origin}/admin`}
                magicLink={false}
              />

              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowResetForm(true)}
                  className="text-sm font-medium text-[#F2B134] hover:text-[#d89e2d]"
                >
                  Forgot your password?
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Reset Password</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                {resetMessage && (
                  <div className={`rounded-md p-4 mb-4 ${resetMessage.type === 'success' ? 'bg-blue-50 border border-blue-200' : 'bg-red-50 border border-red-200'}`}>
                    <p className={`text-sm ${resetMessage.type === 'success' ? 'text-blue-700' : 'text-red-700'}`}>
                      {resetMessage.text}
                    </p>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#1C3D5A] focus:border-[#1C3D5A]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1C3D5A] hover:bg-[#143040] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1C3D5A] disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Instructions'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowResetForm(false);
                    setResetMessage(null);
                  }}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1C3D5A]"
                >
                  Back to Login
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}