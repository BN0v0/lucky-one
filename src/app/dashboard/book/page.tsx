'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import BookingForm from '@/components/booking/BookingForm';

export default function BookService() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleBookingSuccess = () => {
    router.push('/dashboard/bookings');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Book a Service</h2>
        <BookingForm onSuccess={handleBookingSuccess} />
      </div>
    </div>
  );
} 