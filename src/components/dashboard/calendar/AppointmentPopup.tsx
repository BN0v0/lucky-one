'use client';

interface Appointment {
  id: string;
  title: string;
  appointment_date: string;
  status: string;
  service_type: string;
}

interface AppointmentPopupProps {
  appointment: Appointment;
  position: { x: number; y: number };
  formatDate: (date: string) => string;
}

export default function AppointmentPopup({ appointment, position, formatDate }: AppointmentPopupProps) {
  return (
    <div
      className="fixed bg-white rounded-lg shadow-xl p-4 z-50"
      style={{
        top: position.y + 10,
        left: position.x,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h4 className="font-medium text-gray-900">{appointment.title}</h4>
      <p className="text-sm text-gray-500 mt-1">
        {formatDate(appointment.appointment_date)}
      </p>
      <p className="text-sm text-gray-500 mt-1">
        Service: {appointment.service_type}
      </p>
      <div className="mt-2">
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
          appointment.status === 'confirmed' 
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {appointment.status}
        </span>
      </div>
    </div>
  );
} 