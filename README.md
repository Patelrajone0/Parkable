# 🅿️ Parkable — Peer-to-Peer Hourly Parking Marketplace

**Parkable** is an Airbnb-style web application designed to solve the parking crisis in congested urban centers. Private property owners (hosts) can monetize idle driveways, garages, porticos, and basements by renting them out on an hourly basis to drivers in need of immediate or scheduled parking.

---

## 🌟 Key Features

### 1. 🚗 Driver Interface (Search, Discover & Book)
- **Interactive Map Search**: Centered with smooth panning, zoom controls, and geolocation ("Near Me").
- **Dynamic Price Markers**: Custom map badges showing per-hour rates (`₹90/hr`), vehicle capacity tags, and EV fast charging flags.
- **Search & Filters**:
  - Destination lookup with quick popular hotspot pills (Indiranagar, Koramangala, MG Road, Lavelle Road).
  - Vehicle size selector: 2-Wheeler (Bikes/EVs), Hatchback (Swift, i20), Compact SUV (Hyundai Creta, Seltos), Large SUV / Truck (Fortuner, Endeavour).
  - Amenities filter: EV Fast Charging (Level 2), 24/7 CCTV, Security Guard on-site, Covered/Roofed space.
- **Spot Details Modal**: High-resolution photo carousel, exact space dimensions (e.g., `5.4m x 2.8m`), vehicle compatibility check ("Fits your Creta!"), host verification badge, amenities checklist, and parking rules.
- **Transparent Checkout**:
  - Live calculation: `(Hourly Rate × Duration) + (Platform Commission Fee, 10%) = Total Price`.
  - Vehicle license plate and model capture.
  - Mockup Stripe payment gateway supporting Credit Card (with brand auto-detection), Apple Pay, and Google Pay.
  - Confetti animation upon booking confirmation.
- **Active Parking Screen**:
  - Real-time countdown clock (HH:MM:SS) with live session expiration tracking.
  - Turn-by-Turn GPS navigation link (opens Google Maps with exact spot coordinates).
  - Digital Access Pass with Gate Code (`4920`) and QR code pass.
  - "Extend Time" (+30m, +1h, +2h) with dynamic surcharge calculation.
  - Check-out / session completion flow.

### 2. 🅿️ Host Dashboard (Spot Management & Earnings)
- **"List a Spot" Multi-Step Wizard**:
  - **Step 1: Location & Coordinates**: Address, city, and interactive click-to-drop map pin placement.
  - **Step 2: Space Specifications**: Space type (Covered, Open, Underground, Gated), Vehicle capacity (2-Wheeler, Hatchback, Creta/Compact SUV, Large SUV), exact dimensions, and description.
  - **Step 3: Amenities & Security**: EV charging, CCTV, security guard, gate access passcode, and photo upload preview.
  - **Step 4: Pricing & Availability**: Custom per-hour pricing slider with live host earnings calculator (`Driver pays ₹100/hr → Platform takes ₹10 (10%) → Host receives ₹90/hr net`), and instant "Available Now" toggle.
- **Spot Management**: One-tap toggle to take spots "Available Now" or "Offline", inline hourly rate editor, and listing deletion.
- **Host Earnings & Booking Ledger**:
  - KPIs: Net Host Earnings, Gross Revenue, Active Bookings, Total Spaces.
  - Transaction ledger showing driver details, vehicle plates, booked duration, gross paid, 10% platform fee, and net host earnings.
  - Simulated instant IMPS bank payout withdrawal modal.

### 3. 🛡️ Admin Portal (Commission & Supply Control)
- **Marketplace Financials**: Total Gross Merchandise Value (GMV), Platform Commission Revenue collected (10%), Active Reservations, and Supply Count.
- **Take-Rate Controller**: Dynamically adjust the platform commission fee (e.g., 10%, 12%, 15%).
- **Spots Inspector**: Moderate and toggle all listings across the marketplace.
- **User Management**: View drivers, hosts, and admins.

### 4. 🔄 Instant Persona / Role Switching
- Seamless switching between **Driver Mode**, **Host Mode**, and **Admin Mode** directly from the top navigation bar or mobile bottom bar.
- Pre-configured demo quick-logins:
  - **Sarah Jenkins** (Driver with active Creta reservation)
  - **Marcus Vance** (Superhost with covered EV driveway & underground spots)
  - **Elena Rostova** (Admin overseeing platform metrics)
- Custom email/password sign up and login modal.

---

## 🗄️ Database Architecture (Supabase / PostgreSQL)

The complete SQL schema with Row Level Security (RLS) policies and spatial distance calculation is located in:
[`supabase/schema.sql`](file:///c:/Users/Raj%20Patel/OneDrive/Documents/ParkEase/supabase/schema.sql)

### Tables:
1. `profiles`: `id`, `name`, `email`, `role`, `avatar_url`, `phone`, `rating`, `created_at`.
2. `spots`: `id`, `host_id`, `title`, `description`, `address`, `city`, `lat`, `lng`, `hourly_rate`, `vehicle_size`, `space_type`, `amenities`, `rules`, `dimensions`, `photos`, `is_active`, `gate_code`, `created_at`.
3. `bookings`: `id`, `driver_id`, `spot_id`, `start_time`, `end_time`, `total_hours`, `hourly_rate`, `base_price`, `platform_fee` (10%), `total_amount`, `host_earnings` (90%), `status`, `vehicle_plate`, `access_code`, `payment_method`, `payment_id`, `created_at`.
4. `reviews`: `id`, `booking_id`, `spot_id`, `driver_id`, `rating`, `comment`, `created_at`.

### Spatial Function:
- `nearby_spots(user_lat, user_lng, max_radius_km)` uses spherical Haversine trigonometric distance formula to compute and rank parking spots closest to the user's GPS coordinates.

---

## 🚀 Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Optional: Connect Live Supabase Project
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, then run the SQL migration in `supabase/schema.sql` via your Supabase SQL editor.
*(Note: If no Supabase credentials are provided, Parkable operates out-of-the-box in local reactive storage mode, allowing instant testing of all features).*
