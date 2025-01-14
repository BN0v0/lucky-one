export interface Pet {
  id: string;
  name: string;
  breed: string;
  weight: number;
  species: string;
  image_url?: string;
}

export interface Appointment {
  id: string;
  title: string;
  appointment_date: string;
  status: string;
  service_type: string;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  hasAppointment: boolean;
  appointments: Appointment[];
}

export interface UserProfile {
  name: string;
  email: string;
}

export interface DashboardStats {
  petCount: number;
  upcomingAppointments: number;
  unreadMessages: number;
  notifications: number;
} 