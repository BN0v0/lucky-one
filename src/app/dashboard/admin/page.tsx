'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { UserDetails, Service } from '@/types';

interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activeServices: number;
}

export default function AdminDashboard() {
  const { user } = useAuth() as { user: UserDetails | null };
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeServices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        // Fetch total users
        const { count: userCount } = await supabase
          .from('users')
          .select('*', { count: 'exact' });

        // Fetch total bookings
        const { count: bookingCount } = await supabase
          .from('bookings')
          .select('*', { count: 'exact' });

        // Fetch total revenue
        const { data: payments } = await supabase
          .from('payments')
          .select('amount')
          .eq('status', 'completed');

        const totalRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

        // Fetch active services
        const { count: serviceCount } = await supabase
          .from('services')
          .select('*', { count: 'exact' });

        setStats({
          totalUsers: userCount || 0,
          totalBookings: bookingCount || 0,
          totalRevenue,
          activeServices: serviceCount || 0,
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900">Total Bookings</h3>
            <p className="text-3xl font-bold text-green-600">{stats.totalBookings}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-900">Total Revenue</h3>
            <p className="text-3xl font-bold text-yellow-600">
              ${stats.totalRevenue.toFixed(2)}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900">Active Services</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.activeServices}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 