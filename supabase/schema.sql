-- ============================================================
-- PARKEASE / PARKABLE SUPABASE POSTGRESQL SCHEMA & RLS POLICIES
-- ============================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table (Mirrors auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'driver' CHECK (role IN ('driver', 'host', 'admin')),
    phone TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    reviews_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Parking Spots Table
CREATE TABLE IF NOT EXISTS public.spots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    hourly_rate NUMERIC(10, 2) NOT NULL CHECK (hourly_rate > 0),
    vehicle_size TEXT NOT NULL CHECK (vehicle_size IN ('2-wheeler', 'hatchback', 'compact-suv', 'large-suv')),
    space_type TEXT NOT NULL CHECK (space_type IN ('covered', 'open', 'underground', 'gated')),
    amenities TEXT[] DEFAULT '{}',
    rules TEXT[] DEFAULT '{}',
    dimensions TEXT,
    photos TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    instant_book BOOLEAN DEFAULT TRUE,
    access_instructions TEXT,
    gate_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for spatial & coordinate queries
CREATE INDEX IF NOT EXISTS idx_spots_coordinates ON public.spots(lat, lng);
CREATE INDEX IF NOT EXISTS idx_spots_host ON public.spots(host_id);
CREATE INDEX IF NOT EXISTS idx_spots_active ON public.spots(is_active);

-- 4. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    spot_id UUID NOT NULL REFERENCES public.spots(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    total_hours NUMERIC(6, 2) NOT NULL CHECK (total_hours > 0),
    hourly_rate NUMERIC(10, 2) NOT NULL,
    base_price NUMERIC(10, 2) NOT NULL,
    platform_fee NUMERIC(10, 2) NOT NULL, -- 10% Platform Commission
    total_amount NUMERIC(10, 2) NOT NULL,
    host_earnings NUMERIC(10, 2) NOT NULL, -- 90% Host Payout
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    vehicle_plate TEXT NOT NULL,
    vehicle_model TEXT,
    access_code TEXT NOT NULL,
    payment_method TEXT DEFAULT 'card',
    payment_status TEXT DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'refunded')),
    payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_driver ON public.bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_spot ON public.bookings(spot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- 5. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    spot_id UUID NOT NULL REFERENCES public.spots(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view host profiles; user can update their own profile
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Spots: Anyone can view active spots; hosts can manage own spots; admins have full access
CREATE POLICY "Anyone can view active spots" 
ON public.spots FOR SELECT USING (is_active = true OR auth.uid() = host_id);

CREATE POLICY "Hosts can insert their own spots" 
ON public.spots FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their own spots" 
ON public.spots FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their own spots" 
ON public.spots FOR DELETE USING (auth.uid() = host_id);

-- Bookings: Drivers can view and insert their own bookings; Hosts can view bookings on their spots
CREATE POLICY "Drivers can view their own bookings" 
ON public.bookings FOR SELECT USING (
    auth.uid() = driver_id OR 
    EXISTS (SELECT 1 FROM public.spots WHERE public.spots.id = spot_id AND public.spots.host_id = auth.uid())
);

CREATE POLICY "Drivers can create bookings" 
ON public.bookings FOR INSERT WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers and Hosts can update booking status" 
ON public.bookings FOR UPDATE USING (
    auth.uid() = driver_id OR 
    EXISTS (SELECT 1 FROM public.spots WHERE public.spots.id = spot_id AND public.spots.host_id = auth.uid())
);

-- Reviews: Viewable by anyone; created by the driver of the booking
CREATE POLICY "Reviews viewable by everyone" 
ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Drivers can write reviews" 
ON public.reviews FOR INSERT WITH CHECK (auth.uid() = driver_id);

-- ============================================================
-- HELPER FUNCTION: Calculate distance in Kilometers (Haversine)
-- ============================================================
CREATE OR REPLACE FUNCTION public.nearby_spots(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    max_radius_km DOUBLE PRECISION DEFAULT 25.0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    address TEXT,
    city TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    hourly_rate NUMERIC,
    vehicle_size TEXT,
    space_type TEXT,
    distance_km DOUBLE PRECISION
)
LANGUAGE sql
STABLE
AS $$
    SELECT 
        s.id,
        s.title,
        s.address,
        s.city,
        s.lat,
        s.lng,
        s.hourly_rate,
        s.vehicle_size,
        s.space_type,
        (
            6371 * acos(
                cos(radians(user_lat)) * cos(radians(s.lat)) *
                cos(radians(s.lng) - radians(user_lng)) +
                sin(radians(user_lat)) * sin(radians(s.lat))
            )
        ) AS distance_km
    FROM public.spots s
    WHERE s.is_active = TRUE
      AND (
            6371 * acos(
                cos(radians(user_lat)) * cos(radians(s.lat)) *
                cos(radians(s.lng) - radians(user_lng)) +
                sin(radians(user_lat)) * sin(radians(s.lat))
            )
      ) <= max_radius_km
    ORDER BY distance_km ASC;
$$;
