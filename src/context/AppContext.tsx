'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ParkingSpot, Booking, UserProfile, UserRole, SearchFilterState } from '@/types';
import { INITIAL_SPOTS, INITIAL_BOOKINGS } from '@/data/initialData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  login: (user: UserProfile) => void;
  logout: () => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  switchDemoUser: (userId: string) => void;
  allUsers: UserProfile[];
  
  // Spots
  spots: ParkingSpot[];
  addSpot: (spot: Omit<ParkingSpot, 'id' | 'host_id' | 'host_name' | 'host_avatar' | 'created_at' | 'rating' | 'reviews_count'>) => Promise<ParkingSpot>;
  updateSpot: (id: string, updates: Partial<ParkingSpot>) => void;
  toggleSpotStatus: (id: string) => void;
  deleteSpot: (id: string) => void;
  selectedSpot: ParkingSpot | null;
  setSelectedSpot: (spot: ParkingSpot | null) => void;

  // Bookings
  bookings: Booking[];
  createBooking: (bookingData: {
    spot: ParkingSpot;
    startTime: Date;
    durationHours: number;
    vehiclePlate: string;
    vehicleModel?: string;
    paymentMethod: 'card' | 'apple_pay' | 'google_pay';
  }) => Promise<Booking>;
  extendBooking: (bookingId: string, additionalHours: number) => Promise<void>;
  cancelBooking: (bookingId: string) => void;
  completeBooking: (bookingId: string) => void;
  activeDriverBooking: Booking | null;

  // Filters & Map
  searchFilters: SearchFilterState;
  setSearchFilters: React.Dispatch<React.SetStateAction<SearchFilterState>>;
  filteredSpots: ParkingSpot[];
  mapCenter: [number, number];
  setMapCenter: (coords: [number, number]) => void;
  mapZoom: number;
  setMapZoom: (zoom: number) => void;

  // Modals & Navigation
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isListSpotOpen: boolean;
  setIsListSpotOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isSignOutModalOpen: boolean;
  setIsSignOutModalOpen: (open: boolean) => void;
  requestSignOut: () => void;
  checkoutSpot: ParkingSpot | null;
  openCheckout: (spot: ParkingSpot) => void;

  // Feedback
  toasts: ToastMessage[];
  addToast: (title: string, description?: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  
  // Platform stats
  platformCommissionRate: number; // 0.10 (10%)
  setPlatformCommissionRate: (rate: number) => void;

  // Live Location & Nearest Chargers Optimization
  userLiveLocation: { lat: number; lng: number };
  requestLiveLocation: () => void;
  isLocating: boolean;
  onlyNearestChargers: boolean;
  setOnlyNearestChargers: (val: boolean) => void;
  maxChargersLimit: number;
  setMaxChargersLimit: (limit: number) => void;
}

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_SPOTS = 'parkable_spots_v1';
const STORAGE_KEY_BOOKINGS = 'parkable_bookings_v1';
const STORAGE_KEY_AUTH = 'parkable_is_authenticated_v1';
const STORAGE_KEY_USER = 'parkable_active_user_v1';
const STORAGE_KEY_USERS = 'parkable_users_v1';
const STORAGE_KEY_COMMISSION = 'parkable_commission_rate_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [activeRole, setActiveRole] = useState<UserRole>('driver');
  const [spots, setSpots] = useState<ParkingSpot[]>(INITIAL_SPOTS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [checkoutSpot, setCheckoutSpot] = useState<ParkingSpot | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isListSpotOpen, setIsListSpotOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [platformCommissionRate, setPlatformCommissionRate] = useState<number>(0.10);

  // Live User Location & Nearest Chargers Optimization
  const [userLiveLocation, setUserLiveLocation] = useState<{ lat: number; lng: number }>({
    lat: 12.9716,
    lng: 77.5946,
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [onlyNearestChargers, setOnlyNearestChargers] = useState<boolean>(false);
  const [maxChargersLimit, setMaxChargersLimit] = useState<number>(4);

  // Map state (Bengaluru center default)
  const [mapCenter, setMapCenter] = useState<[number, number]>([12.9716, 77.5946]);
  const [mapZoom, setMapZoom] = useState<number>(13);

  // Request real live location on device
  const requestLiveLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLiveLocation(coords);
          setMapCenter([coords.lat, coords.lng]);
          setMapZoom(14);
          setIsLocating(false);
        },
        (err) => {
          setIsLocating(false);
          console.warn('Geolocation note:', err.message);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  };

  useEffect(() => {
    requestLiveLocation();
  }, []);

  // Filter state
  const [searchFilters, setSearchFilters] = useState<SearchFilterState>({
    destination: '',
    vehicle_size: 'all',
    space_type: 'all',
    duration_hours: 2,
    has_ev: false,
    has_cctv: false,
    has_guard: false,
    is_covered: false,
  });

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const savedSpots = localStorage.getItem(STORAGE_KEY_SPOTS);
      if (savedSpots) {
        try {
          const parsed = JSON.parse(savedSpots);
          const demoIds = ['spot-1', 'spot-2', 'spot-3', 'spot-4', 'spot-5', 'spot-6'];
          const cleanSpots = Array.isArray(parsed)
            ? parsed.filter(
                (s: ParkingSpot) =>
                  !demoIds.includes(s.id) &&
                  s.host_id !== 'user-host-1' &&
                  s.host_id !== 'user-host-4' &&
                  s.host_name !== 'Marcus Vance' &&
                  s.host_name !== 'Vikram Mehta'
              )
            : [];
          setSpots(cleanSpots);
          localStorage.setItem(STORAGE_KEY_SPOTS, JSON.stringify(cleanSpots));
        } catch {
          setSpots([]);
        }
      } else {
        setSpots([]);
      }

      // Filter out any legacy demo bookings
      const savedBookings = localStorage.getItem(STORAGE_KEY_BOOKINGS);
      if (savedBookings) {
        try {
          const parsed = JSON.parse(savedBookings);
          const cleanBookings = parsed.filter(
            (b: Booking) =>
              b.driver_id !== 'user-driver-1' &&
              b.id !== 'bk-101' &&
              b.id !== 'bk-102'
          );
          setBookings(cleanBookings);
          localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(cleanBookings));
        } catch {
          setBookings([]);
        }
      } else {
        setBookings([]);
      }

      // Filter out legacy demo profiles from stored user directory
      const savedUsers = localStorage.getItem(STORAGE_KEY_USERS);
      if (savedUsers) {
        try {
          const parsed = JSON.parse(savedUsers);
          const cleanUsers = parsed.filter(
            (u: UserProfile) =>
              u.id !== 'user-driver-1' &&
              u.id !== 'user-host-1' &&
              u.id !== 'user-admin-1' &&
              !u.email?.includes('sarah.driver') &&
              !u.email?.includes('marcus.host')
          );
          setAllUsers(cleanUsers);
          localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(cleanUsers));
        } catch {
          setAllUsers([]);
        }
      }

      const savedAuth = localStorage.getItem(STORAGE_KEY_AUTH);
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (savedAuth === 'true' && savedUser) {
        try {
          const u = JSON.parse(savedUser);
          if (
            u &&
            (u.id === 'user-driver-1' ||
              u.id === 'user-host-1' ||
              u.id === 'user-admin-1' ||
              u.email?.includes('sarah.driver') ||
              u.email?.includes('marcus.host'))
          ) {
            localStorage.removeItem(STORAGE_KEY_USER);
            localStorage.removeItem(STORAGE_KEY_AUTH);
            setCurrentUser(null);
            setIsAuthenticated(false);
          } else if (u && u.id) {
            setCurrentUser(u);
            setActiveRole(u.role);
            setIsAuthenticated(true);
          }
        } catch {
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
      setIsLoadingAuth(false);

      const savedComm = localStorage.getItem(STORAGE_KEY_COMMISSION);
      if (savedComm) {
        setPlatformCommissionRate(parseFloat(savedComm));
      }
    } catch (e) {
      console.warn('Could not read from local storage:', e);
      setIsLoadingAuth(false);
    }
  }, []);

  // Save to LocalStorage on updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SPOTS, JSON.stringify(spots));
    } catch {}
  }, [spots]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
    } catch {}
  }, [bookings]);

  useEffect(() => {
    try {
      if (currentUser && isAuthenticated) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
        localStorage.setItem(STORAGE_KEY_AUTH, 'true');
      } else if (!isAuthenticated) {
        localStorage.removeItem(STORAGE_KEY_USER);
        localStorage.removeItem(STORAGE_KEY_AUTH);
      }
    } catch {}
  }, [currentUser, isAuthenticated]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COMMISSION, platformCommissionRate.toString());
    } catch {}
  }, [platformCommissionRate]);

  // Toast notification helper
  const addToast = (title: string, description?: string, type: ToastMessage['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Login / Logout / Persona actions
  const login = (user: UserProfile) => {
    setCurrentUser(user);
    setActiveRole(user.role);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEY_AUTH, 'true');
    } catch {}

    setAllUsers((prev) => {
      const exists = prev.some((u) => u.id === user.id || u.email === user.email);
      const updated = exists
        ? prev.map((u) => (u.id === user.id || u.email === user.email ? user : u))
        : [user, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    addToast('Logged In Successfully', `Welcome back, ${user.name}!`);
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsSignOutModalOpen(false);
    try {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_AUTH);
      sessionStorage.removeItem('parkable_admin_auth');
    } catch {}
    addToast('Signed Out', 'You have been logged out of your session.', 'info');
  };

  const requestSignOut = () => {
    setIsSignOutModalOpen(true);
  };

  const switchDemoUser = (userId: string) => {
    const found = allUsers.find((u) => u.id === userId);
    if (found) {
      login(found);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    setCurrentUser((prev) => (prev ? { ...prev, role } : null));
    addToast('Mode Changed', `Switched to ${role.charAt(0).toUpperCase() + role.slice(1)} Mode`, 'info');
  };

  // Filtered spots calculation (computes distance from live location & reduces map load)
  const filteredSpots = useMemo(() => {
    // Attach live distance in km to all spots
    const spotsWithDistance = spots.map((spot) => ({
      ...spot,
      distance_km: calculateDistanceKm(
        userLiveLocation.lat,
        userLiveLocation.lng,
        spot.lat,
        spot.lng
      ),
    }));

    // In Host or Admin mode, return spots as is
    if (activeRole === 'host' || activeRole === 'admin') {
      return spotsWithDistance;
    }

    // High-performance optimization: show only the nearest chargers to reduce site load
    if (onlyNearestChargers) {
      return spotsWithDistance
        .filter((spot) => spot.is_active && spot.amenities.includes('ev_charging'))
        .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0))
        .slice(0, maxChargersLimit);
    }

    // Standard filter mode
    return spotsWithDistance
      .filter((spot) => {
        if (!spot.is_active) return false;
        if (searchFilters.vehicle_size !== 'all') {
          const order = ['2-wheeler', 'hatchback', 'compact-suv', 'large-suv'];
          const requiredIndex = order.indexOf(searchFilters.vehicle_size);
          const spotIndex = order.indexOf(spot.vehicle_size);
          if (spotIndex < requiredIndex) return false;
        }
        if (searchFilters.space_type !== 'all' && spot.space_type !== searchFilters.space_type) {
          return false;
        }
        if (searchFilters.has_ev && !spot.amenities.includes('ev_charging')) {
          return false;
        }
        if (searchFilters.has_cctv && !spot.amenities.includes('cctv')) {
          return false;
        }
        if (searchFilters.has_guard && !spot.amenities.includes('guard')) {
          return false;
        }
        if (searchFilters.is_covered && spot.space_type !== 'covered' && spot.space_type !== 'underground') {
          return false;
        }
        if (searchFilters.max_price && spot.hourly_rate > searchFilters.max_price) {
          return false;
        }
        return true;
      })
      .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
  }, [spots, searchFilters, activeRole, onlyNearestChargers, userLiveLocation, maxChargersLimit]);

  // Active driver booking (most recent active)
  const activeDriverBooking = useMemo(() => {
    if (!currentUser) return null;
    const now = new Date().getTime();
    return (
      bookings.find(
        (b) =>
          b.driver_id === currentUser.id &&
          b.status === 'active' &&
          new Date(b.end_time).getTime() > now
      ) || null
    );
  }, [bookings, currentUser]);

  // Spot actions
  const addSpot = async (
    spotData: Omit<ParkingSpot, 'id' | 'host_id' | 'host_name' | 'host_avatar' | 'created_at' | 'rating' | 'reviews_count'>
  ): Promise<ParkingSpot> => {
    const hostUser = currentUser || {
      id: `host-${Date.now()}`,
      name: 'Host User',
      email: 'host@parkease.io',
      role: 'host' as const,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviews_count: 1,
      created_at: new Date().toISOString(),
    };
    const newSpot: ParkingSpot = {
      ...spotData,
      id: `spot-${Date.now()}`,
      host_id: hostUser.id,
      host_name: hostUser.name,
      host_avatar: hostUser.avatar_url,
      host_rating: hostUser.rating || 5.0,
      rating: 5.0,
      reviews_count: 0,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('spots').insert({
          host_id: newSpot.host_id,
          title: newSpot.title,
          description: newSpot.description,
          address: newSpot.address,
          city: newSpot.city,
          lat: newSpot.lat,
          lng: newSpot.lng,
          hourly_rate: newSpot.hourly_rate,
          vehicle_size: newSpot.vehicle_size,
          space_type: newSpot.space_type,
          amenities: newSpot.amenities,
          rules: newSpot.rules,
          dimensions: newSpot.dimensions,
          photos: newSpot.photos,
          is_active: newSpot.is_active,
          instant_book: newSpot.instant_book,
          gate_code: newSpot.gate_code,
          access_instructions: newSpot.access_instructions,
        });
      } catch (err) {
        console.warn('Supabase insert spot error (local fallback used):', err);
      }
    }

    setSpots((prev) => [newSpot, ...prev]);
    addToast('Spot Listed Successfully!', `"${newSpot.title}" is now active and ready for bookings.`);
    return newSpot;
  };

  const updateSpot = (id: string, updates: Partial<ParkingSpot>) => {
    setSpots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    addToast('Listing Updated', 'Your changes have been saved.');
  };

  const toggleSpotStatus = (id: string) => {
    setSpots((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updatedStatus = !s.is_active;
          addToast(
            updatedStatus ? 'Spot is Online' : 'Spot is Offline',
            updatedStatus ? 'Drivers can now discover and book this space.' : 'The spot is hidden from search results.'
          );
          return { ...s, is_active: updatedStatus };
        }
        return s;
      })
    );
  };

  const deleteSpot = (id: string) => {
    setSpots((prev) => prev.filter((s) => s.id !== id));
    addToast('Listing Removed', 'The parking spot has been deleted.', 'info');
  };

  // Checkout trigger
  const openCheckout = (spot: ParkingSpot) => {
    setSelectedSpot(spot);
    setCheckoutSpot(spot);
    setIsCheckoutOpen(true);
  };

  // Booking actions
  const createBooking = async (data: {
    spot: ParkingSpot;
    startTime: Date;
    durationHours: number;
    vehiclePlate: string;
    vehicleModel?: string;
    paymentMethod: 'card' | 'apple_pay' | 'google_pay';
  }): Promise<Booking> => {
    const basePrice = data.spot.hourly_rate * data.durationHours;
    const platformFee = Math.round(basePrice * platformCommissionRate);
    const totalAmount = basePrice + platformFee;
    const hostEarnings = basePrice - 0; // Host gets full base price, platform takes fee from driver or %
    const endTime = new Date(data.startTime.getTime() + data.durationHours * 3600000);
    const accessCode = data.spot.gate_code || Math.floor(1000 + Math.random() * 9000).toString();

    const driverUser = currentUser || {
      id: `driver-${Date.now()}`,
      name: 'Driver Member',
      email: 'driver@parkease.io',
      role: 'driver' as const,
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviews_count: 1,
      created_at: new Date().toISOString(),
    };
    const newBooking: Booking = {
      id: `bk-${Date.now().toString().slice(-6)}`,
      driver_id: driverUser.id,
      driver_name: driverUser.name,
      driver_phone: driverUser.phone,
      spot_id: data.spot.id,
      spot_title: data.spot.title,
      spot_address: data.spot.address,
      spot_image: data.spot.photos && data.spot.photos.length > 0 ? data.spot.photos[0] : undefined,
      spot_lat: data.spot.lat,
      spot_lng: data.spot.lng,
      start_time: data.startTime.toISOString(),
      end_time: endTime.toISOString(),
      total_hours: data.durationHours,
      hourly_rate: data.spot.hourly_rate,
      base_price: basePrice,
      platform_fee: platformFee,
      total_amount: totalAmount,
      host_earnings: hostEarnings,
      status: 'active',
      vehicle_plate: data.vehiclePlate,
      vehicle_model: data.vehicleModel || 'Standard Vehicle',
      access_code: accessCode,
      payment_method: data.paymentMethod,
      payment_status: 'paid',
      payment_id: `pi_stripe_${Math.random().toString(36).substring(2, 10)}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('bookings').insert({
          driver_id: newBooking.driver_id,
          spot_id: newBooking.spot_id,
          start_time: newBooking.start_time,
          end_time: newBooking.end_time,
          total_hours: newBooking.total_hours,
          hourly_rate: newBooking.hourly_rate,
          base_price: newBooking.base_price,
          platform_fee: newBooking.platform_fee,
          total_amount: newBooking.total_amount,
          host_earnings: newBooking.host_earnings,
          status: 'active',
          vehicle_plate: newBooking.vehicle_plate,
          access_code: newBooking.access_code,
          payment_method: newBooking.payment_method,
          payment_status: 'paid',
          payment_id: newBooking.payment_id,
        });
      } catch (err) {
        console.warn('Supabase booking insert (local fallback used):', err);
      }
    }

    setBookings((prev) => [newBooking, ...prev]);
    setIsCheckoutOpen(false);
    addToast('Booking Confirmed!', `Reserved at ${data.spot.address}. Safe travels!`);
    return newBooking;
  };

  const extendBooking = async (bookingId: string, additionalHours: number) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const currentEnd = new Date(booking.end_time);
    const newEnd = new Date(currentEnd.getTime() + additionalHours * 3600000);
    const extraBase = booking.hourly_rate * additionalHours;
    const extraFee = Math.round(extraBase * platformCommissionRate);
    const extraTotal = extraBase + extraFee;

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            end_time: newEnd.toISOString(),
            total_hours: b.total_hours + additionalHours,
            base_price: b.base_price + extraBase,
            platform_fee: b.platform_fee + extraFee,
            total_amount: b.total_amount + extraTotal,
            host_earnings: b.host_earnings + extraBase,
          };
        }
        return b;
      })
    );

    addToast(
      'Parking Time Extended!',
      `Added +${additionalHours} hr(s). New expiry: ${newEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    );
  };

  const cancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    );
    addToast('Booking Cancelled', 'Your spot reservation has been cancelled.', 'info');
  };

  const completeBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'completed' } : b))
    );
    addToast('Parking Session Completed', 'Thank you for parking with Parkable!');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isLoadingAuth,
        login,
        logout,
        activeRole,
        setActiveRole: handleRoleChange,
        setCurrentUser,
        switchDemoUser,
        allUsers,

        spots,
        addSpot,
        updateSpot,
        toggleSpotStatus,
        deleteSpot,
        selectedSpot,
        setSelectedSpot,

        bookings,
        createBooking,
        extendBooking,
        cancelBooking,
        completeBooking,
        activeDriverBooking,

        searchFilters,
        setSearchFilters,
        filteredSpots,
        mapCenter,
        setMapCenter,
        mapZoom,
        setMapZoom,

        isCheckoutOpen,
        setIsCheckoutOpen,
        isListSpotOpen,
        setIsListSpotOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isSignOutModalOpen,
        setIsSignOutModalOpen,
        requestSignOut,
        checkoutSpot,
        openCheckout,

        toasts,
        addToast,
        removeToast,

        platformCommissionRate,
        setPlatformCommissionRate,

        userLiveLocation,
        requestLiveLocation,
        isLocating,
        onlyNearestChargers,
        setOnlyNearestChargers,
        maxChargersLimit,
        setMaxChargersLimit,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
