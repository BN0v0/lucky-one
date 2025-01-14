'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Pet, Service, UserDetails } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface BookingFormProps {
  onSuccess?: () => void;
}

export default function BookingForm({ onSuccess }: BookingFormProps) {
  const { user } = useAuth() as { user: UserDetails | null };
  const [pets, setPets] = useState<Pet[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedPet, setSelectedPet] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch user's pets
        const { data: userPets, error: petsError } = await supabase
          .from('pets')
          .select('*')
          .eq('owner_id', user.id);

        if (petsError) throw petsError;
        setPets(userPets || []);

        // Fetch available services
        const { data: availableServices, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .order('name');

        if (servicesError) throw servicesError;
        setServices(availableServices || []);
      } catch (error) {
        console.error('Error fetching form data:', error);
        setError('Failed to load form data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setError(null);

    try {
      const startDateTime = new Date(`${selectedDate}T${selectedTime}`);
      const selectedServiceData = services.find(s => s.id === selectedService);
      
      if (!selectedServiceData) throw new Error('Invalid service selected');

      const endDateTime = new Date(startDateTime.getTime() + selectedServiceData.duration * 60000);

      // Check for availability
      const { data: conflictingBookings, error: conflictError } = await supabase
        .from('bookings')
        .select('*')
        .or(`start_time.lte.${endDateTime.toISOString()},end_time.gte.${startDateTime.toISOString()}`)
        .eq('status', 'confirmed');

      if (conflictError) throw conflictError;
      if (conflictingBookings && conflictingBookings.length > 0) {
        throw new Error('This time slot is already booked');
      }

      // Create booking
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            user_id: user.id,
            pet_id: selectedPet,
            service_id: selectedService,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            status: 'pending',
          },
        ]);

      if (bookingError) throw bookingError;

      // Reset form
      setSelectedPet('');
      setSelectedService('');
      setSelectedDate('');
      setSelectedTime('');
      
      onSuccess?.();
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(error instanceof Error ? error.message : 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="pet" className="block text-sm font-medium text-gray-700">
          Select Pet
        </label>
        <select
          id="pet"
          value={selectedPet}
          onChange={(e) => setSelectedPet(e.target.value)}
          required
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">Choose a pet</option>
          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>
              {pet.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="service" className="block text-sm font-medium text-gray-700">
          Select Service
        </label>
        <select
          id="service"
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          required
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">Choose a service</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} - ${service.price}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Select Date
        </label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          required
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        />
      </div>

      <div>
        <label htmlFor="time" className="block text-sm font-medium text-gray-700">
          Select Time
        </label>
        <input
          type="time"
          id="time"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          required
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {submitting ? 'Creating Booking...' : 'Book Appointment'}
      </button>
    </form>
  );
} 