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
  payout_account?: HostPayoutAccount;
}

export type PaymentGatewayType = 'razorpay' | 'stripe';
export type PaymentMethodType = 'upi' | 'card' | 'netbanking' | 'apple_pay' | 'google_pay';

export interface HostPayoutAccount {
  account_holder_name: string;
  upi_id?: string;
  account_number?: string;
  ifsc_code?: string;
  bank_name?: string;
  auto_payout_enabled: boolean;
  status: 'active' | 'pending';
  last_updated?: string;
}

export interface CompanyAccount {
  company_name: string;
  upi_id: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  commission_rate: number; // e.g. 0.10 for 10%
  total_commission_collected: number;
  available_company_balance: number;
  last_settled_at?: string;
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
  platform_fee: number; // Platform Commission (e.g. 10%)
  total_amount: number;
  host_earnings: number; // Spot Owner share (e.g. 90%)
  company_commission: number; // Direct company cut credited to your account
  status: BookingStatus;
  vehicle_plate: string;
  vehicle_model?: string;
  access_code: string;
  payment_gateway?: PaymentGatewayType;
  payment_method: PaymentMethodType;
  payment_status: 'paid' | 'pending' | 'refunded';
  payment_id: string;
  order_id?: string;
  host_payout_ref?: string;      // Automated IMPS/UPI payout reference to spot owner
  company_credit_ref?: string;   // Automated fee cut reference to company account
  settlement_status?: 'instant_settled' | 'pending' | 'escrow';
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
