'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Booking } from '@/types/dashboard';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

interface BookingItemProps {
  booking: Booking;
  onStatusChange: () => void;
}

export default function BookingItem({ booking, onStatusChange }: BookingItemProps) {
  const [loading, setLoading] = useState(false);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', booking.id);

      if (error) throw error;
      onStatusChange();
    } catch (error) {
      console.error('Error cancelling booking:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">{booking.service_type}</h3>
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4 mr-1" />
            {formatDate(booking.appointment_date)}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <ClockIcon className="h-4 w-4 mr-1" />
            {formatTime(booking.appointment_date)}
          </div>
          {booking.location && (
            <div className="flex items-center text-sm text-gray-500">
              <MapPinIcon className="h-4 w-4 mr-1" />
              {booking.location}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            booking.status === 'confirmed' 
              ? 'bg-green-100 text-green-800'
              : booking.status === 'cancelled'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {booking.status}
          </span>
          {booking.status !== 'cancelled' && new Date(booking.appointment_date) > new Date() && (
            <button
              onClick={handleCancel}
              disabled={loading}
              className="text-sm text-red-600 hover:text-red-800"
            >
              {loading ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 