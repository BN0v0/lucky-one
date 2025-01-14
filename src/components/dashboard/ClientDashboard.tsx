'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  HeartIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  BellIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { BookingWithDetails } from '@/types';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { createPortal } from 'react-dom';
import { Popover } from '@headlessui/react';

interface UserProfile {
  name: string;
  email: string;
}

interface Pet {
  id: string;
  name: string;
  breed: string;
  weight: number;
  species: string;
  image_url?: string;
}

interface Appointment {
  id: string;
  title: string;
  appointment_date: string;
  status: string;
  service_type: string;
}

interface DashboardStats {
  petCount: number;
  upcomingAppointments: number;
  unreadMessages: number;
  notifications: number;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  hasAppointment: boolean;
  appointments: BookingWithDetails[];
}

// Add new component for pet card
const PetProfileCard = ({ pet }: { pet: Pet }) => (
  <div className="w-full bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
    <div className="flex flex-col items-center p-6">
      <div className="w-24 h-24 mb-3 rounded-lg bg-indigo-100 flex items-center justify-center">
        {pet.image_url ? (
          <img 
            src={pet.image_url} 
            alt={pet.name}
            className="w-24 h-24 rounded-lg object-cover"
          />
        ) : (
          <HeartIcon className="h-12 w-12 text-indigo-600" />
        )}
      </div>
      <h5 className="mb-1 text-xl font-medium text-gray-900">{pet.name}</h5>
      <span className="text-sm text-gray-500">{pet.species} • {pet.breed}</span>
      <div className="mt-2 text-sm text-gray-500">{pet.weight}kg</div>
      <Link
        href={`/dashboard/pets/${pet.id}`}
        className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
      >
        View Profile
      </Link>
    </div>
  </div>
);

// Add new interface for appointment popup
interface AppointmentPopup {
  booking: BookingWithDetails;
  position: { x: number; y: number };
}

export default function ClientDashboard() {
  const { user } = useAuth();
  
  // Group all useState hooks together at the top
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    petCount: 0,
    upcomingAppointments: 0,
    unreadMessages: 0,
    notifications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState<Pet[]>([]);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentPopup | null>(null);

  // Group all useEffect hooks together
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (!user?.id) return;

        // Fetch user profile
        const { data: profileData } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }

        // Fetch pets
        const { data: petsData } = await supabase
          .from('pets')
          .select('*')
          .eq('owner_id', user.id)
          .limit(4)
          .order('created_at', { ascending: false });

        if (petsData) {
          setPets(petsData);
        }

        // Fetch bookings with service and pet details
        const startDate = startOfMonth(currentDate);
        const endDate = endOfMonth(currentDate);

        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            service:services(*),
            pet:pets(*)
          `)
          .eq('user_id', user.id)
          .gte('start_time', startDate.toISOString())
          .lte('end_time', endDate.toISOString())
          .order('start_time', { ascending: true });

        if (bookingsError) throw bookingsError;
        
        if (bookingsData) {
          setBookings(bookingsData);
          
          // Update stats with actual booking counts
          const upcomingBookings = bookingsData.filter(
            booking => new Date(booking.start_time) > new Date() && booking.status !== 'cancelled'
          );

          setStats({
            petCount: petsData?.length || 0,
            upcomingAppointments: upcomingBookings.length,
            unreadMessages: 0,
            notifications: 0,
          });
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, currentDate]);

  // Add click outside handler useEffect
  useEffect(() => {
    const handleClickOutside = () => setSelectedAppointment(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Rest of the component logic (after all hooks)
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const firstName = profile?.name?.split(' ')[0] || 'there';

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const endDate = new Date(lastDayOfMonth);
    if (endDate.getDay() !== 6) {
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    }

    const days: CalendarDay[] = [];
    const currentDateIter = new Date(startDate);

    while (currentDateIter <= endDate) {
      const dayBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.start_time);
        return bookingDate.toDateString() === currentDateIter.toDateString();
      });

      days.push({
        date: new Date(currentDateIter),
        isCurrentMonth: currentDateIter.getMonth() === month,
        hasAppointment: dayBookings.length > 0,
        appointments: dayBookings
      });
      currentDateIter.setDate(currentDateIter.getDate() + 1);
    }

    return days;
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const getWeekDays = (): CalendarDay[] => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const days: CalendarDay[] = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(currentDay.getDate() + i);

      const dayBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.start_time);
        return bookingDate.toDateString() === currentDay.toDateString();
      });

      days.push({
        date: currentDay,
        isCurrentMonth: currentDay.getMonth() === currentDate.getMonth(),
        hasAppointment: dayBookings.length > 0,
        appointments: dayBookings
      });
    }
    return days;
  };

  const handleAppointmentClick = (booking: BookingWithDetails, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Get the button element's position
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    
    // Calculate position relative to viewport
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;
    
    setSelectedAppointment({
      booking,
      position: {
        x: Math.min(rect.left + scrollX, window.innerWidth - 320), // 320px is popup width
        y: rect.bottom + scrollY,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your pets today
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Updated Pets Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">My Pets</h3>
              <Link 
                href="/dashboard/pets" 
                className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center"
              >
                View all
                <ChevronRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {pets.length === 0 ? (
                <p className="text-gray-500 text-sm col-span-2">No pets added yet</p>
              ) : (
                pets.map((pet) => (
                  <PetProfileCard key={pet.id} pet={pet} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Calendar Section with View Toggle */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-medium text-gray-900">Calendar</h3>
                <div className="flex rounded-md shadow-sm">
                  <button
                    onClick={() => setViewMode('month')}
                    className={`px-3 py-1 text-sm rounded-l-md ${
                      viewMode === 'month'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-3 py-1 text-sm rounded-r-md ${
                      viewMode === 'week'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Week
                  </button>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <span className="text-sm font-medium">
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px mt-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
              
              {(viewMode === 'month' ? getCalendarDays() : getWeekDays()).map((day, idx) => (
                <div
                  key={idx}
                  className={`
                    ${viewMode === 'week' ? 'min-h-[200px]' : 'min-h-[80px]'}
                    p-2 border border-gray-100 relative
                    ${!day.isCurrentMonth ? 'bg-gray-50' : 'bg-white'}
                  `}
                >
                  <span className={`
                    text-sm ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                    ${day.date.toDateString() === new Date().toDateString() ? 'font-bold text-indigo-600' : ''}
                  `}>
                    {day.date.getDate()}
                  </span>
                  
                  {day.hasAppointment && (
                    <div className="mt-1 space-y-1">
                      {day.appointments.map((booking) => (
                        <Popover key={booking.id} className="relative">
                          <Popover.Button className="w-full text-left text-xs bg-indigo-50 text-indigo-700 rounded px-1 py-0.5 hover:bg-indigo-100">
                            {format(new Date(booking.start_time), 'h:mm a')} - {booking.service.name}
                          </Popover.Button>

                          <Popover.Panel className="absolute z-10 w-72 bg-white rounded-lg shadow-lg p-3 mt-1">
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {booking.service.name}
                                  </h4>
                                  <p className="text-xs text-gray-500">
                                    Pet: {booking.pet.name}
                                  </p>
                                </div>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                  booking.status === 'confirmed' 
                                    ? 'bg-green-100 text-green-800'
                                    : booking.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {booking.status}
                                </span>
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center text-xs text-gray-600">
                                  <CalendarIcon className="h-3 w-3 mr-1" />
                                  {format(new Date(booking.start_time), 'MMMM d, yyyy')}
                                </div>
                                <div className="flex items-center text-xs text-gray-600">
                                  <ClockIcon className="h-3 w-3 mr-1" />
                                  {format(new Date(booking.start_time), 'h:mm a')} - 
                                  {format(new Date(booking.end_time), 'h:mm a')}
                                </div>
                              </div>

                              {booking.notes && (
                                <p className="text-xs text-gray-500 border-t pt-1">
                                  {booking.notes}
                                </p>
                              )}
                            </div>
                          </Popover.Panel>
                        </Popover>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Popup */}
      {selectedAppointment && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/50"
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            className="fixed bg-white rounded-lg shadow-xl p-4 w-80"
            style={{
              top: `${selectedAppointment.position.y + 10}px`, // Add small offset
              left: `${selectedAppointment.position.x}px`,
              transform: 'translate(-50%, 0)', // Center horizontally
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {selectedAppointment.booking.service.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Pet: {selectedAppointment.booking.pet.name}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  selectedAppointment.booking.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800'
                    : selectedAppointment.booking.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedAppointment.booking.status}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(new Date(selectedAppointment.booking.start_time), 'MMMM d, yyyy')}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  {format(new Date(selectedAppointment.booking.start_time), 'h:mm a')} - 
                  {format(new Date(selectedAppointment.booking.end_time), 'h:mm a')}
                </div>
              </div>

              {selectedAppointment.booking.notes && (
                <div className="border-t pt-2">
                  <p className="text-sm text-gray-500">
                    {selectedAppointment.booking.notes}
                  </p>
                </div>
              )}

              <div className="border-t pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages and Notifications */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <ChatBubbleLeftIcon className="h-6 w-6 text-green-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Messages</h3>
            </div>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {stats.unreadMessages} unread
            </span>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <BellIcon className="h-6 w-6 text-amber-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            </div>
            <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {stats.notifications} new
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 