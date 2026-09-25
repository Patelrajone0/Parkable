'use client';

import React, { useState } from 'react';
import { ParkingSpot } from '@/types';
import { 
  X, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Zap, 
  Camera, 
  Car, 
  Ruler, 
  Lock, 
  CalendarCheck, 
  ChevronRight, 
  Navigation,
  CheckCircle,
  Eye
} from 'lucide-react';

interface SpotDetailModalProps {
  spot: ParkingSpot | null;
  onClose: () => void;
  onBookNow: (spot: ParkingSpot) => void;
}

export default function SpotDetailModal({
  spot,
  onClose,
  onBookNow,
}: SpotDetailModalProps) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (!spot) return null;

  const vehicleSizeLabels: Record<string, string> = {
    '2-wheeler': '2-Wheeler (Motorcycle / Scooter / EV Bike)',
    'hatchback': 'Hatchback (Swift, i20, Polo, Tiago)',
    'compact-suv': 'Compact SUV (Creta, Seltos, Brezza, Nexon)',
    'large-suv': 'Large SUV / Truck (Fortuner, Endeavour, Harrier, Thar)',
  };

  const amenityIcons: Record<string, { label: string; icon: string }> = {
    cctv: { label: '24/7 CCTV Monitored', icon: '📹' },
    ev_charging: { label: 'EV Fast Charging (Level 2)', icon: '⚡' },
    guard: { label: 'Security Guard On-Site', icon: '👮' },
    gated_access: { label: 'Gated & Secure Entry', icon: '🔒' },
    lighting: { label: 'Well Lit at Night', icon: '💡' },
    wide_clearance: { label: 'Wide Door Clearance', icon: '↔️' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#181512] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#383028] max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Photo Carousel */}
        <div className="relative w-full h-56 sm:h-72 bg-[#100e0d] shrink-0">
          <img
            src={spot.photos[activePhotoIdx] || spot.photos[0]}
            alt={spot.title}
            className="w-full h-full object-cover"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181512] via-transparent to-black/60" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#141210]/80 hover:bg-[#201c18] text-[#f6f2ec] border border-[#383028] flex items-center justify-center backdrop-blur-md transition shadow-md"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Photo indicator dots */}
          {spot.photos.length > 1 && (
            <div className="absolute bottom-3 right-4 flex items-center gap-1.5 z-10 bg-[#141210]/80 border border-[#383028] backdrop-blur-sm px-2.5 py-1 rounded-full text-white text-[11px] font-medium">
              <Camera className="w-3 h-3 text-[#dfba89]" />
              <span>{activePhotoIdx + 1} / {spot.photos.length}</span>
            </div>
          )}

          {/* Photo thumbnail strip if multiple */}
          {spot.photos.length > 1 && (
            <div className="absolute bottom-3 left-4 flex gap-1.5 z-10">
              {spot.photos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`w-9 h-9 rounded-lg overflow-hidden border-2 transition ${
                    activePhotoIdx === idx ? 'border-[#dfba89] scale-105' : 'border-[#383028] opacity-70'
                  }`}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Badges on top left */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
            <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#dfba89] to-[#b37d4e] text-[#12100e] text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Verified Space</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#141210]/90 backdrop-blur-md text-[#f6f2ec] border border-[#383028] text-xs font-semibold capitalize">
              {spot.space_type}
            </span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Title & Location */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl sm:text-2xl font-black text-[#f6f2ec] leading-tight">
                {spot.title}
              </h2>
              <div className="text-right shrink-0">
                <div className="flex items-baseline gap-1 text-[#dfba89]">
                  <span className="text-2xl font-black">₹{spot.hourly_rate}</span>
                  <span className="text-xs font-semibold text-[#a89682]">/hr</span>
                </div>
                <div className="text-[11px] text-[#a89682] font-medium">Instant Booking</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#a89682] mt-2 font-medium">
              <MapPin className="w-4 h-4 text-[#dfba89] shrink-0" />
              <span>{spot.address}, {spot.city}</span>
            </div>

            <div className="flex items-center gap-3 mt-2 text-xs text-[#a89682]">
              <div className="flex items-center gap-1 text-[#dfba89] font-bold">
                <Star className="w-4 h-4 fill-[#dfba89] text-[#dfba89]" />
                <span>{spot.rating || 4.9}</span>
                <span className="text-[#756758] font-normal">({spot.reviews_count || 24} reviews)</span>
              </div>
              <span className="text-[#383028]">•</span>
              <span className="text-[#dfba89] font-semibold">100% Safe Parking Guarantee</span>
            </div>
          </div>

          <hr className="border-[#2c251e]" />

          {/* Vehicle Compatibility Banner */}
          <div className="p-3.5 bg-[#201c18] rounded-2xl border border-[#383028] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#28211a] border border-[#dfba89]/30 text-[#dfba89] flex items-center justify-center shrink-0">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#dfba89] uppercase tracking-wider">
                Vehicle Size Capacity
              </p>
              <p className="text-xs text-[#f6f2ec] font-medium mt-0.5">
                {vehicleSizeLabels[spot.vehicle_size] || spot.vehicle_size}
              </p>
              {spot.dimensions && (
                <div className="flex items-center gap-1 text-[11px] text-[#a89682] mt-0.5">
                  <Ruler className="w-3 h-3" />
                  <span>Exact Dimensions: {spot.dimensions}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-[#a89682] uppercase tracking-wider mb-1.5">
              About this Space
            </h3>
            <p className="text-xs sm:text-sm text-[#d6c7b2] leading-relaxed">
              {spot.description}
            </p>
          </div>

          {/* Amenities & Security */}
          <div>
            <h3 className="text-xs font-bold text-[#a89682] uppercase tracking-wider mb-2.5">
              Features & Security
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {spot.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#201c18] border border-[#383028] text-xs font-medium text-[#f6f2ec]"
                >
                  <span className="text-base">{amenityIcons[amenity]?.icon || '✨'}</span>
                  <span>{amenityIcons[amenity]?.label || amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Host Card */}
          <div className="p-4 rounded-2xl bg-[#201c18] border border-[#383028] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={spot.host_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'}
                alt={spot.host_name}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#383028] shadow-xs"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#f6f2ec]">{spot.host_name}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#dfba89]" />
                </div>
                <p className="text-[11px] text-[#a89682]">Verified Property Host • Fast Responder</p>
                <div className="flex items-center gap-1 text-[11px] text-[#dfba89] font-semibold mt-0.5">
                  <Star className="w-3 h-3 fill-[#dfba89] text-[#dfba89]" />
                  <span>{spot.host_rating || 4.9} rating</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="px-2.5 py-1 rounded-full bg-[#282119] text-[#dfba89] border border-[#dfba89]/30 text-[10px] font-bold uppercase tracking-wider">
                Superhost
              </span>
            </div>
          </div>

          {/* Spot Rules & Instructions */}
          {spot.rules && spot.rules.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-[#a89682] uppercase tracking-wider mb-2">
                Host Parking Rules
              </h3>
              <ul className="space-y-1.5 text-xs text-[#d6c7b2]">
                {spot.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#dfba89] font-bold">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sticky Bottom Booking Bar */}
        <div className="p-4 bg-[#141210] border-t border-[#383028] flex items-center justify-between gap-4 shadow-lg shrink-0">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-[#dfba89]">₹{spot.hourly_rate}</span>
              <span className="text-xs text-[#a89682] font-semibold">/ hour</span>
            </div>
            <p className="text-[11px] text-[#dfba89] font-bold">10% Platform fee added at checkout</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;
                window.open(url, '_blank');
              }}
              title="Open Navigation"
              className="p-3 rounded-xl border border-[#383028] text-[#dfba89] hover:bg-[#201c18] transition"
            >
              <Navigation className="w-5 h-5 text-[#dfba89]" />
            </button>

            <button
              onClick={() => onBookNow(spot)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <span>Book Spot Now</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
