'use client';

import { Dialog } from '@headlessui/react';
import { XMarkIcon, ClockIcon, MapPinIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { BookingWithDetails } from '@/types';
import { format } from 'date-fns';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface BookingDetailsProps {
  booking: BookingWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: () => void;
}

export default function BookingDetails({ booking, isOpen, onClose, onStatusChange }: BookingDetailsProps) {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    try {
      setCancelling(true);
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', booking.id);

      if (error) throw error;
      onStatusChange();
      onClose();
    } catch (error) {
      console.error('Error cancelling booking:', error);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-xl shadow-lg">
          <div className="flex items-center justify-between p-6 border-b">
            <Dialog.Title className="text-lg font-semibold">
              Booking Details
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Service Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {booking.service.name}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-sm text-gray-500">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  {format(new Date(booking.start_time), 'PPP')}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  {format(new Date(booking.start_time), 'p')} - 
                  {format(new Date(booking.end_time), 'p')}
                </div>
              </div>
            </div>

            {/* Pet Information */}
            <div className="border-t pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Pet Information</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{booking.pet.name}</p>
                  <p className="text-gray-500">{booking.pet.breed}</p>
                </div>
              </div>
            </div>

            {/* Price and Duration */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                    Price
                  </div>
                  <p className="text-lg font-medium text-gray-900">
                    ${booking.service.price}
                  </p>
                </div>
                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    Duration
                  </div>
                  <p className="text-lg font-medium text-gray-900">
                    {booking.service.duration} minutes
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Status</h4>
                  <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
                {booking.status === 'pending' && (
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50"
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Booking'}
                  </button>
                )}
              </div>
            </div>

            {/* Notes */}
            {booking.notes && (
              <div className="border-t pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-sm text-gray-500">{booking.notes}</p>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 