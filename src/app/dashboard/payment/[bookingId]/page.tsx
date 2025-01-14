'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { BookingWithDetails } from '@/types';
import PaymentForm from '@/components/payment/PaymentForm';

export default function PaymentPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*, service:services(*), pet:pets(*)')
          .eq('id', bookingId)
          .single();

        if (error) throw error;
        setBooking(data as BookingWithDetails);
      } catch (error) {
        console.error('Error fetching booking:', error);
        setError('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!booking) return <div>Booking not found</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>
        <div className="mb-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-gray-900">
              {booking.service.name} - {booking.pet.name}
            </h3>
            <p className="text-gray-500">
              {new Date(booking.start_time).toLocaleDateString()} at{' '}
              {new Date(booking.start_time).toLocaleTimeString()}
            </p>
            <p className="text-lg font-bold text-gray-900 mt-2">
              Total: ${booking.service.price}
            </p>
          </div>
        </div>
        <PaymentForm bookingId={bookingId} />
      </div>
    </div>
  );
} 