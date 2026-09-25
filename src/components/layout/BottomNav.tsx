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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#141210]/95 backdrop-blur-md border-t border-[#383028] shadow-2xl px-2 py-2">
      <div className="flex items-center justify-around">
        {/* Explore Map (Driver) */}
        <button
          onClick={() => setActiveRole('driver')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeRole === 'driver' ? 'text-[#dfba89] font-bold' : 'text-[#756758] hover:text-[#a89682]'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px]">Explore</span>
        </button>

        {/* My Bookings / Active Session */}
        <button
          onClick={onOpenBookings}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl relative transition ${
            activeDriverBooking ? 'text-[#dfba89] font-bold' : 'text-[#756758] hover:text-[#a89682]'
          }`}
        >
          {activeDriverBooking && (
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-[#dfba89] animate-ping" />
          )}
          <Clock className="w-5 h-5" />
          <span className="text-[10px]">Bookings</span>
        </button>

        {/* List a Spot (Host) */}
        <button
          onClick={() => {
            setActiveRole('host');
            setIsListSpotOpen(true);
          }}
          className="flex flex-col items-center gap-1 py-1 px-3 text-[#f6f2ec] group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] text-[#12100e] flex items-center justify-center -mt-4 shadow-lg shadow-[#dfba89]/25 group-hover:scale-105 transition">
            <PlusCircle className="w-5 h-5 text-[#12100e]" />
          </div>
          <span className="text-[10px] font-bold text-[#dfba89]">List Spot</span>
        </button>

        {/* Host Mode */}
        <button
          onClick={() => setActiveRole('host')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeRole === 'host' ? 'text-[#dfba89] font-bold' : 'text-[#756758] hover:text-[#a89682]'
          }`}
        >
          <Building2 className="w-5 h-5" />
          <span className="text-[10px]">Host Hub</span>
        </button>

        {/* Profile / Auth */}
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[#756758] hover:text-[#a89682]"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Account</span>
        </button>
      </div>
    </nav>
  );
}
