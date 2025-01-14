'use client';

import { useState } from 'react';
import BookingsList from '@/components/bookings/BookingsList';
import CreateBookingModal from '@/components/bookings/CreateBookingModal';
import { PlusIcon } from '@heroicons/react/24/outline';
import Toast from '@/components/ui/Toast';

export default function BookingsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });

  const handleBookingSuccess = () => {
    setToast({
      show: true,
      message: 'Booking(s) created successfully!',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Bookings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your appointments and schedule new ones
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          New Booking
        </button>
      </div>

      <BookingsList />

      <CreateBookingModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleBookingSuccess}
      />

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
} 