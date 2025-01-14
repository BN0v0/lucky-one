'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, InformationCircleIcon, CheckIcon } from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import { addMinutes, format, setHours, setMinutes, addWeeks } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Service, Pet } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import BookingSteps from './BookingSteps';

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Business hours
const START_HOUR = 9; // 9 AM
const END_HOUR = 17;  // 5 PM

interface RecurringOption {
  weeks: number;
  label: string;
}

const RECURRING_OPTIONS: RecurringOption[] = [
  { weeks: 0, label: 'One-time booking' },
  { weeks: 4, label: '4 weeks' },
  { weeks: 8, label: '8 weeks' },
  { weeks: 12, label: '12 weeks' },
];

const ServiceCategoryIcons = {
  grooming: "🛁",
  training: "🦮",
  daycare: "🏠",
  veterinary: "⚕️"
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes 
    ? `${hours}h ${remainingMinutes}min`
    : `${hours}h`;
};

// Update steps to include service category selection
type Step = 'category' | 'service' | 'details';

const STEPS = {
  category: 1,
  service: 2,
  details: 3,
};

// Add these animations
const slideAnimation = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
};

export default function CreateBookingModal({ isOpen, onClose, onSuccess }: CreateBookingModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [selectedPet, setSelectedPet] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<Date[]>([]);
  const [recurringWeeks, setRecurringWeeks] = useState<number>(0);
  const [showRecurringDates, setShowRecurringDates] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('category');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);

  const categories: { category: ServiceCategory; icon: string; description: string }[] = [
    { 
      category: 'grooming', 
      icon: "🛁", 
      description: "Professional grooming services for your pet" 
    },
    { 
      category: 'training', 
      icon: "🦮", 
      description: "Expert training sessions for better behavior" 
    },
    { 
      category: 'daycare', 
      icon: "🏠", 
      description: "Safe and fun daycare for your pet" 
    },
    { 
      category: 'veterinary', 
      icon: "⚕️", 
      description: "Health check-ups and medical care" 
    },
  ];

  const filteredServices = services.filter(
    service => service.service_category === selectedCategory
  );

  // Load services and pets
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        setServicesLoading(true);
        setError(null);
        
        // Load services with better logging
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .order('service_category')
          .order('name');
        
        console.log('Services response:', { data: servicesData, error: servicesError });
        
        if (servicesError) {
          throw servicesError;
        }

        if (servicesData) {
          console.log('Services loaded:', servicesData.length);
          setServices(servicesData);
        } else {
          console.log('No services data returned');
        }

        // Load pets
        const { data: petsData, error: petsError } = await supabase
          .from('pets')
          .select('*')
          .eq('owner_id', user.id);
        
        if (petsError) throw petsError;
        if (petsData) setPets(petsData);

      } catch (error) {
        console.error('Error loading data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load services');
      } finally {
        setServicesLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Generate available time slots when date changes
  useEffect(() => {
    if (!selectedDate || !selectedService) return;

    const generateTimeSlots = async () => {
      const slots: Date[] = [];
      const date = new Date(selectedDate);
      
      // Get existing bookings for the selected date
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      const { data: existingBookings } = await supabase
        .from('bookings')
        .select('start_time, end_time')
        .gte('start_time', startOfDay.toISOString())
        .lte('end_time', endOfDay.toISOString());

      // Generate slots
      for (let hour = START_HOUR; hour < END_HOUR; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slot = setMinutes(setHours(date, hour), minute);
          const endTime = addMinutes(slot, selectedService.duration);

          // Check if slot is available
          const isAvailable = !existingBookings?.some(booking => {
            const bookingStart = new Date(booking.start_time);
            const bookingEnd = new Date(booking.end_time);
            return (
              (slot >= bookingStart && slot < bookingEnd) ||
              (endTime > bookingStart && endTime <= bookingEnd)
            );
          });

          if (isAvailable && endTime.getHours() <= END_HOUR) {
            slots.push(slot);
          }
        }
      }

      setAvailableTimeSlots(slots);
    };

    generateTimeSlots();
  }, [selectedDate, selectedService]);

  const getRecurringDates = () => {
    if (!selectedDate || !selectedTime || recurringWeeks === 0) return [];
    
    const dates: Date[] = [];
    const baseDate = new Date(selectedDate);
    baseDate.setHours(selectedTime.getHours());
    baseDate.setMinutes(selectedTime.getMinutes());

    for (let i = 1; i < recurringWeeks; i++) {
      dates.push(addWeeks(baseDate, i));
    }
    return dates;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime || !selectedPet || !user) return;

    try {
      setLoading(true);
      const startTime = new Date(selectedDate);
      startTime.setHours(selectedTime.getHours());
      startTime.setMinutes(selectedTime.getMinutes());
      
      const endTime = addMinutes(startTime, selectedService.duration);
      const recurringDates = getRecurringDates();

      // Create base booking
      const bookings = [{
        user_id: user.id,
        pet_id: selectedPet,
        service_id: selectedService.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'pending',
        notes: notes.trim(),
      }];

      // Add recurring bookings
      recurringDates.forEach(date => {
        bookings.push({
          user_id: user.id,
          pet_id: selectedPet,
          service_id: selectedService.id,
          start_time: date.toISOString(),
          end_time: addMinutes(date, selectedService.duration).toISOString(),
          status: 'pending',
          notes: notes.trim(),
        });
      });

      const { error } = await supabase
        .from('bookings')
        .insert(bookings);

      if (error) {
        console.error('Booking error:', error);
        throw error;
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating booking:', error);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'category':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Select Service Category</h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose the type of service you're looking for
              </p>
            </div>

            {servicesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading services...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">
                <p>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Try again
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {categories.map(({ category, icon, description }) => (
                  <motion.button
                    key={category}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentStep('service');
                    }}
                    className="p-6 border rounded-lg text-left hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl">{icon}</span>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 capitalize">
                          {category}
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                          {description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        );

      case 'service':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep('category');
                  setSelectedCategory(null);
                }}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                ← Back to categories
              </button>
              <span className="text-gray-300">|</span>
              <h3 className="text-lg font-medium text-gray-900 capitalize">
                {selectedCategory} Services
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto px-2">
              {filteredServices.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => {
                    setSelectedService(service);
                    setCurrentStep('details');
                  }}
                  className={`
                    relative p-6 border rounded-lg text-left transition-all
                    ${
                      selectedService?.id === service.id
                        ? 'border-indigo-600 ring-2 ring-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-500 hover:shadow-md'
                    }
                  `}
                >
                  {selectedService?.id === service.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 h-6 w-6 bg-indigo-600 rounded-full flex items-center justify-center"
                    >
                      <CheckIcon className="h-4 w-4 text-white" />
                    </motion.div>
                  )}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {service.name}
                      </h3>
                      {service.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {service.description}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-gray-500">
                        Duration: {formatDuration(service.duration)}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(service.price)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Select Date & Time</h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose your preferred appointment time
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <DatePicker
                      selected={selectedDate}
                      onChange={setSelectedDate}
                      minDate={new Date()}
                      className="w-full p-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      dateFormat="MMMM d, yyyy"
                      customInput={
                        <button className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-left focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                          {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select date'}
                        </button>
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <select
                      value={selectedTime?.toISOString() || ''}
                      onChange={(e) => setSelectedTime(new Date(e.target.value))}
                      className="w-full p-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      disabled={!selectedDate}
                    >
                      <option value="">Select a time</option>
                      {availableTimeSlots.map((slot) => (
                        <option key={slot.toISOString()} value={slot.toISOString()}>
                          {format(slot, 'h:mm a')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Select Pet</label>
                    <select
                      value={selectedPet}
                      onChange={(e) => setSelectedPet(e.target.value)}
                      className="w-full p-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Select a pet</option>
                      {pets.map((pet) => (
                        <option key={pet.id} value={pet.id}>
                          {pet.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      className="w-full p-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Any special requirements or information..."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Recurring Booking
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {RECURRING_OPTIONS.map((option) => (
                      <button
                        key={option.weeks}
                        type="button"
                        onClick={() => {
                          setRecurringWeeks(option.weeks);
                          setShowRecurringDates(option.weeks > 0);
                        }}
                        className={`p-4 border rounded-lg text-left ${
                          recurringWeeks === option.weeks
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{option.label}</div>
                        {option.weeks > 0 && (
                          <div className="text-sm text-gray-500">
                            {option.weeks / 4} month{option.weeks / 4 > 1 ? 's' : ''}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {showRecurringDates && selectedDate && selectedTime && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Recurring Dates</h4>
                    <ul className="space-y-2">
                      {getRecurringDates().map((date, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {format(date, 'EEEE, MMMM d, yyyy')} at {format(date, 'h:mm a')}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedService && selectedDate && selectedTime && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900">Booking Summary</h4>
                    <dl className="mt-2 divide-y divide-gray-200">
                      <div className="flex justify-between py-2">
                        <dt className="text-sm text-gray-500">Service</dt>
                        <dd className="text-sm font-medium text-gray-900">{selectedService.name}</dd>
                      </div>
                      <div className="flex justify-between py-2">
                        <dt className="text-sm text-gray-500">Duration</dt>
                        <dd className="text-sm font-medium text-gray-900">{selectedService.duration} minutes</dd>
                      </div>
                      <div className="flex justify-between py-2">
                        <dt className="text-sm text-gray-500">Price</dt>
                        <dd className="text-sm font-medium text-gray-900">${selectedService.price}</dd>
                      </div>
                    </dl>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="max-h-[90vh] flex flex-col">
            <div className="flex-shrink-0 flex items-center justify-between p-6 border-b">
              <Dialog.Title className="text-xl font-semibold">
                Book an Appointment
              </Dialog.Title>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Progress steps */}
            <div className="flex-shrink-0 px-6 py-4 border-b">
              <BookingSteps currentStep={currentStep} />
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={slideAnimation}
                  transition={{ duration: 0.2 }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 flex items-center justify-between p-6 border-t bg-gray-50">
              {currentStep !== 'category' && (
                <button
                  type="button"
                  onClick={() => {
                    if (currentStep === 'service') setCurrentStep('category');
                    if (currentStep === 'details') setCurrentStep('service');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Back
                </button>
              )}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                {currentStep === 'details' && (
                  <button
                    type="submit"
                    disabled={loading || !selectedService || !selectedDate || !selectedTime || !selectedPet}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Booking'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 