'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  HomeIcon,
  CalendarIcon,
  UserCircleIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClockIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const role = user?.user_metadata?.role || 'client';

  // Define menu items for each role
  const menuItems = {
    admin: [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
      { name: 'Users', href: '/dashboard/users', icon: UserGroupIcon },
      { name: 'Services', href: '/dashboard/services', icon: CogIcon },
      { name: 'Bookings', href: '/dashboard/bookings', icon: CalendarIcon },
      { name: 'Reports', href: '/dashboard/reports', icon: ChartBarIcon },
      { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
    ],
    trainer: [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
      { name: 'My Schedule', href: '/dashboard/schedule', icon: CalendarIcon },
      { name: 'Clients', href: '/dashboard/clients', icon: UserGroupIcon },
      { name: 'Bookings', href: '/dashboard/bookings', icon: CalendarIcon },
      { name: 'Profile', href: '/dashboard/profile', icon: UserCircleIcon },
    ],
    client: [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
      { name: 'My Pets', href: '/dashboard/pets', icon: HeartIcon },
      { name: 'Bookings', href: '/dashboard/bookings', icon: CalendarIcon },
      { name: 'Profile', href: '/dashboard/profile', icon: UserCircleIcon },
      { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
    ],
  };

  const currentMenuItems = menuItems[role as keyof typeof menuItems];

  const handleLogout = async () => {
    try {
      // First clear auth context
      await signOut();
      
      // Then sign out from Supabase
      await supabase.auth.signOut();

      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();

      // Remove any cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Force a complete reload and redirect
      window.location.replace('/login');
      
      // As a fallback, also try router push after a small delay
      setTimeout(() => {
        router.push('/login');
        router.refresh();
      }, 100);

    } catch (error) {
      console.error('Error logging out:', error);
      // Even if there's an error, try to redirect
      window.location.replace('/login');
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-gray-900">Pet Care</h1>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {currentMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon
                  className={`mr-3 flex-shrink-0 h-6 w-6 ${
                    isActive(item.href)
                      ? 'text-indigo-600'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
        >
          <ArrowLeftOnRectangleIcon className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400" />
          Logout
        </button>
      </div>
    </div>
  );
} 