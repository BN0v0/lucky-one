'use client';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { BookingWithDetails } from '@/types';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  hasAppointment: boolean;
  appointments: BookingWithDetails[];
}

interface CalendarProps {
  currentDate: Date;
  viewMode: 'month' | 'week';
  days: CalendarDay[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onViewModeChange: (mode: 'month' | 'week') => void;
  onAppointmentClick: (booking: BookingWithDetails, event: React.MouseEvent) => void;
}

export default function Calendar({
  currentDate,
  viewMode,
  days,
  onPrevMonth,
  onNextMonth,
  onViewModeChange,
  onAppointmentClick,
}: CalendarProps) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6">
        {/* Calendar header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-medium text-gray-900">Calendar</h3>
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => onViewModeChange('month')}
                className={`px-3 py-1 text-sm rounded-l-md ${
                  viewMode === 'month'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => onViewModeChange('week')}
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
              onClick={onPrevMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button
              onClick={onNextMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {/* Week days header */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              className="bg-gray-50 py-2 text-center text-xs font-medium text-gray-500"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((day, dayIdx) => (
            <div
              key={dayIdx}
              className={`min-h-[120px] bg-white p-2 ${
                !day.isCurrentMonth ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex justify-between">
                <span className={`text-sm ${
                  !day.isCurrentMonth ? 'text-gray-400' : 'text-gray-700'
                }`}>
                  {format(day.date, 'd')}
                </span>
                {day.hasAppointment && (
                  <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                )}
              </div>
              {day.hasAppointment && (
                <div className="mt-2 space-y-1">
                  {day.appointments.map(booking => (
                    <button
                      key={booking.id}
                      onClick={(e) => onAppointmentClick(booking, e)}
                      className="w-full text-left px-2 py-1 text-xs rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    >
                      {format(new Date(booking.start_time), 'HH:mm')} - {booking.service.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 