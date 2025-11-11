import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Mail, Package, Image, MessageCircle, User, Briefcase, BookOpen, LogOut, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Messages', href: '/admin/messages', icon: Mail },
    { name: 'Services', href: '/admin/services', icon: Package },
    { name: 'Hero Images', href: '/admin/hero-images', icon: Image },
    { name: 'Testimonials', href: '/admin/testimonials', icon: MessageCircle },
    { name: 'Careers', href: '/admin/careers', icon: Briefcase },
    { name: 'Blog', href: '/admin/blog', icon: BookOpen },
    { name: 'Users', href: '/admin/users', icon: Users },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-700"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out z-20 w-64 bg-white shadow-lg`}>
        <div className="flex flex-col h-full pt-16 md:pt-0">
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-green-100 text-green-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-3 text-base font-medium text-red-700 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </button>
            <Link
              to="/"
              className="flex items-center px-4 py-3 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <User className="w-5 h-5 mr-3" />
              Back to Site
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-10 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="md:ml-64 pt-16 md:pt-0">
        <main>
          <div key={location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}