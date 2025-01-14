export type UserRole = 'customer' | 'trainer' | 'admin';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type ServiceCategory = 'grooming' | 'training' | 'daycare' | 'veterinary';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  weight?: number;
  medical_info?: string;
  special_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  capacity: number;
  service_category: ServiceCategory;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  pet_id: string;
  service_id: string;
  trainer_id?: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface TrainerAvailability {
  id: string;
  trainer_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
}

export interface BookingWithDetails {
  id: string;
  user_id: string;
  pet_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  service: {
    id: string;
    name: string;
    duration: number;
    price: number;
  };
  pet: {
    id: string;
    name: string;
    species: string;
    breed?: string;
  };
}

export interface UserDetails extends User {
  name: string;
} 