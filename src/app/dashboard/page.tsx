'use client';

import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import TrainerDashboard from '@/components/dashboard/TrainerDashboard';
import ClientDashboard from '@/components/dashboard/ClientDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.user_metadata?.role || 'client';

  switch (role) {
    case 'admin':
      return <AdminDashboard />;
    case 'trainer':
      return <TrainerDashboard />;
    default:
      return <ClientDashboard />;
  }
}