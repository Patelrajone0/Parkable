'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Compass, 
  Clock, 
  PlusCircle, 
  Building2, 
  ShieldCheck, 
  User 
} from 'lucide-react';

interface BottomNavProps {
  onOpenBookings: () => void;
}

export default function BottomNav({ onOpenBookings }: BottomNavProps) {
  const { 
    activeRole, 
    setActiveRole, 
    activeDriverBooking, 
    setIsListSpotOpen,
    setIsAuthModalOpen 
  } = useApp();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#141210]/95 backdrop-blur-lg border-t border-[#2e261f] shadow-2xl px-2 pt-1.5 pb-[max(0.6rem,calc(env(safe-area-inset-bottom,0px)+0.25rem))] transition-all">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Explore Map (Driver) */}
        <button
          onClick={() => setActiveRole('driver')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition active:scale-95 ${
            activeRole === 'driver' ? 'text-[#dfba89] font-bold' : 'text-[#756758] hover:text-[#a89682]'
          }`}
          aria-label="Explore parking spots"
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Explore</span>
        </button>

        {/* My Bookings / Active Session */}
        <button
          onClick={onOpenBookings}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl relative transition active:scale-95 ${
            activeDriverBooking ? 'text-[#dfba89] font-bold' : 'text-[#756758] hover:text-[#a89682]'
          }`}
          aria-label="View bookings"
        >
          {activeDriverBooking && (
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-[#dfba89] animate-ping" />
          )}
          <Clock className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Bookings</span>
        </button>

        {/* List a Spot (Host) Center Action */}
        <button
          onClick={() => {
            setActiveRole('host');
            setIsListSpotOpen(true);
          }}
          className="flex flex-col items-center justify-center gap-1 py-0 px-2 text-[#f6f2ec] group active:scale-95 transition"
          aria-label="List a parking spot"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] text-[#12100e] flex items-center justify-center -mt-5 shadow-lg shadow-[#dfba89]/30 group-hover:scale-105 transition">
            <PlusCircle className="w-5 h-5 text-[#12100e]" />
          </div>
          <span className="text-[10px] font-bold text-[#dfba89] tracking-tight">List Spot</span>
        </button>

        {/* Host Mode */}
        <button
          onClick={() => setActiveRole('host')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition active:scale-95 ${
            activeRole === 'host' ? 'text-[#dfba89] font-bold' : 'text-[#756758] hover:text-[#a89682]'
          }`}
          aria-label="Host management hub"
        >
          <Building2 className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Host Hub</span>
        </button>

        {/* Profile / Auth */}
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl text-[#756758] hover:text-[#a89682] active:scale-95 transition"
          aria-label="User account"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Account</span>
        </button>
      </div>
    </nav>
  );
}
