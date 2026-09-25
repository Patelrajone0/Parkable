export type UserRole = 'driver' | 'host' | 'admin';

export type VehicleSize = '2-wheeler' | 'hatchback' | 'compact-suv' | 'large-suv';

export type SpaceType = 'covered' | 'open' | 'underground' | 'gated';

export type BookingStatus = 'active' | 'completed' | 'cancelled';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  phone?: string;
  rating?: number;
  reviews_count?: number;
  created_at: string;
}

export interface Amenity {
  id: string;
  label: string;
  iconName: string;
}

export interface ParkingSpot {
  id: string;
  host_id: string;
  host_name: string;
  host_avatar?: string;
  host_rating?: number;
  title: string;
  description: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  hourly_rate: number;
  vehicle_size: VehicleSize;
  space_type: SpaceType;
  amenities: string[]; // e.g. ['cctv', 'ev_charging', 'guard', 'gated_access', 'lighting', 'wide_clearance']
  rules: string[];
  dimensions?: string; // e.g. "5.4m x 2.6m"
  photos: string[];
  is_active: boolean;
  instant_book: boolean;
  access_instructions?: string;
  gate_code?: string;
  created_at: string;
  rating?: number;
  reviews_count?: number;
  distance_km?: number;
}

export interface Booking {
  id: string;
  driver_id: string;
  driver_name: string;
  driver_phone?: string;
  spot_id: string;
  spot_title: string;
  spot_address: string;
  spot_image?: string;
  spot_lat: number;
  spot_lng: number;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  total_hours: number;
  hourly_rate: number;
  base_price: number;
  platform_fee: number; // 10%
  total_amount: number;
  host_earnings: number; // 90%
  status: BookingStatus;
  vehicle_plate: string;
  vehicle_model?: string;
  access_code: string;
  payment_method: 'card' | 'apple_pay' | 'google_pay';
  payment_status: 'paid' | 'pending';
  payment_id: string;
  created_at: string;
}

export interface SpotReview {
  id: string;
  spot_id: string;
  driver_id: string;
  driver_name: string;
  driver_avatar?: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface SearchFilterState {
  destination: string;
  lat?: number;
  lng?: number;
  vehicle_size: VehicleSize | 'all';
  space_type: SpaceType | 'all';
  max_price?: number;
  has_ev?: boolean;
  has_cctv?: boolean;
  has_guard?: boolean;
  is_covered?: boolean;
  duration_hours: number;
}
