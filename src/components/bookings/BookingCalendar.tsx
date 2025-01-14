'use client';

import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';

interface BookingCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  availableDates?: Date[];
  minDate?: Date;
}

export default function BookingCalendar({
  selectedDate,
  onDateSelect,
  availableDates = [],
  minDate = new Date(),
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const weeks = eachDayOfInterval({
    start: startOfWeek(currentMonth),
    end: endOfWeek(endOfWeek(currentMonth)),
  });

  const isDateAvailable = (date: Date) => {
    return availableDates.some(availableDate =>
      isSameDay(new Date(availableDate), date)
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            className="bg-gray-50 py-2 text-center text-xs font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
        {weeks.map((date, dayIdx) => {
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isDisabled = date < minDate || !isDateAvailable(date);
          const isCurrentMonth = isSameMonth(date, currentMonth);

          return (
            <button
              key={date.toISOString()}
              onClick={() => !isDisabled && onDateSelect(date)}
              disabled={isDisabled}
              className={`
                relative bg-white p-3 focus:z-10 
                ${!isCurrentMonth && 'text-gray-400'}
                ${isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'}
                ${isSelected && 'bg-indigo-50 text-indigo-600 font-semibold'}
                ${isToday(date) && !isSelected && 'text-indigo-600 font-semibold'}
              `}
            >
              <time dateTime={format(date, 'yyyy-MM-dd')}>
                {format(date, 'd')}
              </time>
              {isDateAvailable(date) && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="h-1 w-1 rounded-full bg-indigo-600"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
} 