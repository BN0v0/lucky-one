'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { BookingWithDetails, UserDetails } from '@/types';

export default function TrainerSchedule() {
  const { user } = useAuth() as { user: UserDetails | null };
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSchedule = async () => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*, service:services(*), pet:pets(*), customer:users!user_id(*)')
          .eq('trainer_id', user.id)
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true });

        if (error) throw error;
        setBookings(data as BookingWithDetails[]);
      } catch (error) {
        console.error('Error fetching schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Schedule</h2>
        {bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {booking.service.name} - {booking.pet.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.start_time).toLocaleDateString()} at{' '}
                      {new Date(booking.start_time).toLocaleTimeString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No upcoming appointments</p>
        )}
      </div>
    </div>
  );
} 