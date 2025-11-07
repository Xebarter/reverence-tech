import { useState, useEffect } from 'react';
import { BarChart3, Users, Mail, Package, Image, MessageCircle, Briefcase, BookOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    messages: 0,
    services: 0,
    heroImages: 0,
    testimonials: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch message count
      const { count: messageCount } = await supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true });

      // Fetch services count
      const { count: servicesCount } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true });

      // For now, we'll set hero images and testimonials to 0 since we don't have those tables yet
      setStats({
        messages: messageCount || 0,
        services: servicesCount || 0,
        heroImages: 0,
        testimonials: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Messages',
      value: stats.messages,
      icon: Mail,
      color: 'bg-blue-500',
    },
    {
      name: 'Services',
      value: stats.services,
      icon: Package,
      color: 'bg-green-500',
    },
    {
      name: 'Hero Images',
      value: stats.heroImages,
      icon: Image,
      color: 'bg-purple-500',
    },
    {
      name: 'Testimonials',
      value: stats.testimonials,
      icon: MessageCircle,
      color: 'bg-yellow-500',
    },
  ];

  const quickActions = [
    { name: 'View Messages', href: '/admin/messages', icon: Mail },
    { name: 'Manage Services', href: '/admin/services', icon: Package },
    { name: 'Update Hero Images', href: '/admin/hero-images', icon: Image },
    { name: 'Manage Testimonials', href: '/admin/testimonials', icon: MessageCircle },
    { name: 'View Job Postings', href: '/admin/careers', icon: Briefcase },
    { name: 'Manage Blog Posts', href: '/admin/blog', icon: BookOpen },
    { name: 'User Management', href: '/admin/users', icon: Users }, // Added User Management
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-600">{card.name}</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {loading ? (
                      <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      card.value
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <a
              key={action.name}
              href={action.href}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-center"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-gray-100">
                  <Icon className="text-gray-600" size={24} />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-600">{action.name}</div>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-12">
          <BarChart3 className="mx-auto text-gray-400" size={48} />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No recent activity</h3>
          <div className="mt-1 text-gray-500">Check back later for updates.</div>
        </div>
      </div>
    </div>
  );
}