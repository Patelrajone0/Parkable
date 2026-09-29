'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Compass, 
  Clock, 
  PlusCircle, 
  Building2, 
  User, 
  Palette,
  Sparkles,
  Plus
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
    setIsAuthModalOpen,
    bottomNavStyle,
    navGlowEffect,
    navShowLabels,
    setIsNavCustomizerOpen
  } = useApp();

  // Glow utility based on navGlowEffect
  const getGlowClass = (type: 'halo' | 'button') => {
    if (navGlowEffect === 'none') return '';
    if (navGlowEffect === 'soft') return 'shadow-md shadow-[#dfba89]/30';
    return type === 'halo' 
      ? 'shadow-[0_0_25px_rgba(223,186,137,0.55)]' 
      : 'shadow-[0_4px_22px_rgba(223,186,137,0.45)]';
  };

  // Helper for label visibility
  const shouldShowLabel = (isActive: boolean) => {
    if (navShowLabels === 'icons-only') return false;
    if (navShowLabels === 'active-only') return isActive;
    return true;
  };

  // =========================================================================
  // OPTION 3: MINIMAL DYNAMIC PILL (Arc Search / Dynamic Island Capsule)
  // =========================================================================
  if (bottomNavStyle === 'dynamic-pill') {
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(0.6rem,calc(env(safe-area-inset-bottom,0px)+0.25rem))] pointer-events-none transition-all">
        <div className="flex items-center justify-between max-w-[350px] mx-auto bg-[#12100e]/95 backdrop-blur-2xl border border-[#383028] shadow-[0_12px_40px_rgba(0,0,0,0.85)] rounded-full px-2 py-1.5 pointer-events-auto ring-1 ring-white/5">
          {/* Explore */}
          <button
            onClick={() => setActiveRole('driver')}
            className={`flex items-center gap-1.5 rounded-full transition-all active:scale-90 ${
              activeRole === 'driver'
                ? 'bg-[#dfba89] text-[#12100e] px-3 py-1.5 font-black text-xs shadow-md'
                : 'p-2 text-[#756758] hover:text-[#dfba89]'
            }`}
            title="Explore Spots"
          >
            <Compass className="w-4 h-4 shrink-0" />
            {activeRole === 'driver' && <span className="text-[11px] font-bold">Explore</span>}
          </button>

          {/* Bookings */}
          <button
            onClick={onOpenBookings}
            className={`flex items-center gap-1.5 rounded-full relative transition-all active:scale-90 p-2 text-[#756758] hover:text-[#dfba89]`}
            title="My Bookings"
          >
            {activeDriverBooking && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#dfba89] animate-ping" />
            )}
            <Clock className="w-4 h-4 shrink-0" />
          </button>

          {/* Center Action (Jeweled Gold Pill) */}
          <button
            onClick={() => {
              setActiveRole('host');
              setIsListSpotOpen(true);
            }}
            className={`w-9 h-9 rounded-full bg-gradient-to-tr from-[#dfba89] via-[#d4a373] to-[#b37d4e] text-[#12100e] flex items-center justify-center transition active:scale-90 ${getGlowClass('button')}`}
            title="List a Parking Spot"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Host Mode */}
          <button
            onClick={() => setActiveRole('host')}
            className={`flex items-center gap-1.5 rounded-full transition-all active:scale-90 ${
              activeRole === 'host'
                ? 'bg-[#dfba89] text-[#12100e] px-3 py-1.5 font-black text-xs shadow-md'
                : 'p-2 text-[#756758] hover:text-[#dfba89]'
            }`}
            title="Host Hub"
          >
            <Building2 className="w-4 h-4 shrink-0" />
            {activeRole === 'host' && <span className="text-[11px] font-bold">Host</span>}
          </button>

          {/* Account */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="p-2 rounded-full text-[#756758] hover:text-[#dfba89] transition active:scale-90"
            title="Account"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Style Customizer Trigger */}
          <button
            onClick={() => setIsNavCustomizerOpen(true)}
            className="p-1.5 rounded-full bg-[#241f1a] text-[#dfba89] border border-[#dfba89]/30 hover:bg-[#2e2620] transition active:scale-90 ml-0.5"
            title="Customize Nav Layout (5 Themes)"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>
    );
  }

  // =========================================================================
  // OPTION 2: CURVED CENTER SCOOP (Fintech / Uber Concave Notch)
  // =========================================================================
  if (bottomNavStyle === 'curved-scoop') {
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#141210]/95 backdrop-blur-lg border-t border-[#2e261f] shadow-2xl px-2 pt-2 pb-[max(0.6rem,calc(env(safe-area-inset-bottom,0px)+0.25rem))] transition-all">
        {/* Curved Center Scoop Graphic / Cradle */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-8 overflow-hidden pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-[#0e0d0c] border border-[#2e261f] shadow-inner" />
        </div>

        <div className="flex items-center justify-around max-w-md mx-auto relative">
          {/* Explore */}
          <button
            onClick={() => setActiveRole('driver')}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition active:scale-95 ${
              activeRole === 'driver' ? 'text-[#dfba89] font-bold' : 'text-[#756758] hover:text-[#a89682]'
            }`}
          >
            <Compass className="w-5 h-5" />
            {shouldShowLabel(activeRole === 'driver') && (
              <span className="text-[10px] tracking-tight">Explore</span>
            )}
            {activeRole === 'driver' && <span className="w-1 h-1 rounded-full bg-[#dfba89]" />}
          </button>

          {/* Bookings */}
          <button
            onClick={onOpenBookings}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl relative transition active:scale-95 ${
              activeDriverBooking ? 'text-[#dfba89] font-bold' : 'text-[#756758] hover:text-[#a89682]'
            }`}
          >
            {activeDriverBooking && (
              <span className="absolute top-1 right-2.5 w-2 h-2 rounded-full bg-[#dfba89] animate-ping" />
            )}
            <Clock className="w-5 h-5" />
            {shouldShowLabel(false) && (
              <span className="text-[10px] tracking-tight">Bookings</span>
            )}
          </button>

          {/* Suspended Center Scoop Button */}
          <div className="flex flex-col items-center -mt-6 group">
            <button
              onClick={() => {
                setActiveRole('host');
                setIsListSpotOpen(true);
              }}
              className={`w-12 h-12 rounded-full bg-gradient-to-tr from-[#dfba89] via-[#d4a373] to-[#b37d4e] text-[#12100e] flex items-center justify-center ring-4 ring-[#141210] shadow-xl group-hover:scale-105 active:scale-95 transition-all ${getGlowClass('button')}`}
              aria-label="List a parking spot"
            >
              <PlusCircle className="w-6 h-6 text-[#12100e]" />
            </button>
            {shouldShowLabel(true) && (
              <span className="text-[9px] font-bold text-[#dfba89] mt-0.5 tracking-tight">List Spot</span>
            )}
          </div>

          {/* Host Mode */}
          <button
            onClick={() => setActiveRole('host')}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition active:scale-95 ${
              activeRole === 'host' ? 'text-[#dfba89] font-bold' : 'text-[#756758] hover:text-[#a89682]'
            }`}
          >
            <Building2 className="w-5 h-5" />
            {shouldShowLabel(activeRole === 'host') && (
              <span className="text-[10px] tracking-tight">Host Hub</span>
            )}
            {activeRole === 'host' && <span className="w-1 h-1 rounded-full bg-[#dfba89]" />}
          </button>

          {/* Account & Customizer */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl text-[#756758] hover:text-[#a89682] active:scale-95 transition"
            >
              <User className="w-5 h-5" />
              {shouldShowLabel(false) && (
                <span className="text-[10px] tracking-tight">Account</span>
              )}
            </button>

            <button
              onClick={() => setIsNavCustomizerOpen(true)}
              className="p-1 rounded-lg text-[#dfba89]/70 hover:text-[#dfba89] hover:bg-[#201c18] transition active:scale-90"
              title="Change Nav Layout (5 Themes)"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // =========================================================================
  // OPTION 4: TITANIUM SEGMENTED BAR (Edge-to-Edge Classic Luxury)
  // =========================================================================
  if (bottomNavStyle === 'titanium-bar') {
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-b from-[#191512] via-[#141210] to-[#0c0b0a] border-t border-[#dfba89]/30 shadow-2xl px-2 pt-1 pb-[max(0.6rem,calc(env(safe-area-inset-bottom,0px)+0.25rem))] transition-all">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Explore */}
          <button
            onClick={() => setActiveRole('driver')}
            className={`relative flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition active:scale-95 ${
              activeRole === 'driver' ? 'text-[#dfba89] font-black' : 'text-[#756758] hover:text-[#a89682]'
            }`}
          >
            {activeRole === 'driver' && (
              <span className="absolute top-0 w-8 h-0.5 rounded-full bg-[#dfba89] shadow-[0_0_8px_#dfba89]" />
            )}
            <Compass className="w-5 h-5" />
            {shouldShowLabel(activeRole === 'driver') && (
              <span className="text-[10px] tracking-wider uppercase font-bold">Explore</span>
            )}
          </button>

          {/* Bookings */}
          <button
            onClick={onOpenBookings}
            className={`relative flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition active:scale-95 ${
              activeDriverBooking ? 'text-[#dfba89] font-black' : 'text-[#756758] hover:text-[#a89682]'
            }`}
          >
            {activeDriverBooking && (
              <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-[#dfba89] animate-ping" />
            )}
            <Clock className="w-5 h-5" />
            {shouldShowLabel(false) && (
              <span className="text-[10px] tracking-wider uppercase">Bookings</span>
            )}
          </button>

          {/* Stepped Titanium Center Badge */}
          <button
            onClick={() => {
              setActiveRole('host');
              setIsListSpotOpen(true);
            }}
            className="flex flex-col items-center gap-1 py-0 px-2 group active:scale-95 transition"
          >
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br from-[#241f1a] to-[#12100e] border-2 border-[#dfba89] text-[#dfba89] flex items-center justify-center -mt-3 shadow-lg shadow-black/80 group-hover:border-[#f3dfc6] transition ${getGlowClass('button')}`}>
              <PlusCircle className="w-5 h-5" />
            </div>
            {shouldShowLabel(true) && (
              <span className="text-[10px] font-extrabold text-[#dfba89] tracking-wider uppercase">List Spot</span>
            )}
          </button>

          {/* Host Mode */}
          <button
            onClick={() => setActiveRole('host')}
            className={`relative flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition active:scale-95 ${
              activeRole === 'host' ? 'text-[#dfba89] font-black' : 'text-[#756758] hover:text-[#a89682]'
            }`}
          >
            {activeRole === 'host' && (
              <span className="absolute top-0 w-8 h-0.5 rounded-full bg-[#dfba89] shadow-[0_0_8px_#dfba89]" />
            )}
            <Building2 className="w-5 h-5" />
            {shouldShowLabel(activeRole === 'host') && (
              <span className="text-[10px] tracking-wider uppercase font-bold">Host</span>
            )}
          </button>

          {/* Account & Customizer */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-lg text-[#756758] hover:text-[#a89682] active:scale-95 transition"
            >
              <User className="w-5 h-5" />
              {shouldShowLabel(false) && (
                <span className="text-[10px] tracking-wider uppercase">Account</span>
              )}
            </button>

            <button
              onClick={() => setIsNavCustomizerOpen(true)}
              className="p-1.5 rounded-lg text-[#dfba89]/70 hover:text-[#dfba89] hover:bg-[#201c18] transition active:scale-90"
              title="Change Nav Layout (5 Themes)"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // =========================================================================
  // OPTION 5: ELEVATED ACTION FAB DOCK (Material 3 / Action Orbit)
  // =========================================================================
  if (bottomNavStyle === 'action-fab') {
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(0.6rem,calc(env(safe-area-inset-bottom,0px)+0.25rem))] pointer-events-none transition-all">
        <div className="max-w-md mx-auto pointer-events-auto relative">
          {/* High Elevation FAB */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-6 z-10 flex flex-col items-center">
            <button
              onClick={() => {
                setActiveRole('host');
                setIsListSpotOpen(true);
              }}
              className={`w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#dfba89] via-[#d4a373] to-[#b37d4e] text-[#12100e] flex items-center justify-center ring-4 ring-[#0e0d0c] shadow-[0_10px_25px_rgba(223,186,137,0.4)] hover:scale-105 active:scale-90 transition-all ${getGlowClass('button')}`}
              aria-label="List a parking spot"
            >
              <Plus className="w-7 h-7 stroke-[3] text-[#12100e]" />
            </button>
          </div>

          {/* Slim Modern Dock */}
          <div className="bg-[#161310]/95 backdrop-blur-xl border border-[#383028] shadow-2xl rounded-2xl px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Explore */}
              <button
                onClick={() => setActiveRole('driver')}
                className={`flex flex-col items-center gap-0.5 p-1 transition active:scale-95 ${
                  activeRole === 'driver' ? 'text-[#dfba89] font-bold' : 'text-[#756758]'
                }`}
              >
                <Compass className="w-5 h-5" />
                {shouldShowLabel(activeRole === 'driver') && (
                  <span className="text-[10px]">Explore</span>
                )}
              </button>

              {/* Bookings */}
              <button
                onClick={onOpenBookings}
                className={`flex flex-col items-center gap-0.5 p-1 relative transition active:scale-95 ${
                  activeDriverBooking ? 'text-[#dfba89] font-bold' : 'text-[#756758]'
                }`}
              >
                {activeDriverBooking && (
                  <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#dfba89] animate-ping" />
                )}
                <Clock className="w-5 h-5" />
                {shouldShowLabel(false) && (
                  <span className="text-[10px]">Bookings</span>
                )}
              </button>
            </div>

            {/* Spacer for FAB */}
            <div className="w-12 h-6" />

            <div className="flex items-center gap-4">
              {/* Host Hub */}
              <button
                onClick={() => setActiveRole('host')}
                className={`flex flex-col items-center gap-0.5 p-1 transition active:scale-95 ${
                  activeRole === 'host' ? 'text-[#dfba89] font-bold' : 'text-[#756758]'
                }`}
              >
                <Building2 className="w-5 h-5" />
                {shouldShowLabel(activeRole === 'host') && (
                  <span className="text-[10px]">Host</span>
                )}
              </button>

              {/* Account */}
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex flex-col items-center gap-0.5 p-1 text-[#756758] active:scale-95 transition"
              >
                <User className="w-5 h-5" />
                {shouldShowLabel(false) && (
                  <span className="text-[10px]">Account</span>
                )}
              </button>

              {/* Customizer */}
              <button
                onClick={() => setIsNavCustomizerOpen(true)}
                className="p-1 rounded-lg text-[#dfba89]/70 hover:text-[#dfba89] active:scale-90 transition"
                title="Change Nav Layout (5 Themes)"
              >
                <Palette className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // =========================================================================
  // OPTION 1: DEFAULT - FLOATING GLASS ISLAND (VisionOS / Modern Floating Dock)
  // =========================================================================
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(0.6rem,calc(env(safe-area-inset-bottom,0px)+0.25rem))] pointer-events-none transition-all">
      <div className="max-w-md mx-auto pointer-events-auto bg-[#161310]/85 backdrop-blur-2xl border border-[#dfba89]/30 shadow-[0_12px_45px_rgba(0,0,0,0.85)] rounded-3xl px-3 py-1.5 flex items-center justify-around ring-1 ring-white/5 relative">
        {/* Explore */}
        <button
          onClick={() => setActiveRole('driver')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-2xl transition active:scale-95 ${
            activeRole === 'driver' ? 'text-[#dfba89] font-bold bg-[#dfba89]/10' : 'text-[#756758] hover:text-[#a89682]'
          }`}
          aria-label="Explore parking spots"
        >
          <Compass className="w-5 h-5" />
          {shouldShowLabel(activeRole === 'driver') && (
            <span className="text-[10px] tracking-tight">Explore</span>
          )}
        </button>

        {/* My Bookings */}
        <button
          onClick={onOpenBookings}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-2xl relative transition active:scale-95 ${
            activeDriverBooking ? 'text-[#dfba89] font-bold bg-[#dfba89]/10' : 'text-[#756758] hover:text-[#a89682]'
          }`}
          aria-label="View bookings"
        >
          {activeDriverBooking && (
            <span className="absolute top-1 right-2.5 w-2 h-2 rounded-full bg-[#dfba89] animate-ping" />
          )}
          <Clock className="w-5 h-5" />
          {shouldShowLabel(false) && (
            <span className="text-[10px] tracking-tight">Bookings</span>
          )}
        </button>

        {/* Glowing Center Elevated Orb with Optional Neon Halo */}
        <button
          onClick={() => {
            setActiveRole('host');
            setIsListSpotOpen(true);
          }}
          className="flex flex-col items-center justify-center gap-0.5 py-0 px-2 text-[#f6f2ec] group active:scale-95 transition relative"
          aria-label="List a parking spot"
        >
          <div className={`w-12 h-12 rounded-full bg-gradient-to-tr from-[#b37d4e] via-[#dfba89] to-[#f3dfc6] text-[#12100e] flex items-center justify-center -mt-6 border-2 border-[#161310] group-hover:scale-105 transition-all ${getGlowClass('halo')}`}>
            <PlusCircle className="w-6 h-6 text-[#12100e]" />
          </div>
          {shouldShowLabel(true) && (
            <span className="text-[10px] font-black text-[#dfba89] tracking-tight mt-0.5">List Spot</span>
          )}
        </button>

        {/* Host Mode */}
        <button
          onClick={() => setActiveRole('host')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-2xl transition active:scale-95 ${
            activeRole === 'host' ? 'text-[#dfba89] font-bold bg-[#dfba89]/10' : 'text-[#756758] hover:text-[#a89682]'
          }`}
          aria-label="Host management hub"
        >
          <Building2 className="w-5 h-5" />
          {shouldShowLabel(activeRole === 'host') && (
            <span className="text-[10px] tracking-tight">Host Hub</span>
          )}
        </button>

        {/* Account & Customizer Studio */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-2xl text-[#756758] hover:text-[#a89682] active:scale-95 transition"
            aria-label="User account"
          >
            <User className="w-5 h-5" />
            {shouldShowLabel(false) && (
              <span className="text-[10px] tracking-tight">Account</span>
            )}
          </button>

          <button
            onClick={() => setIsNavCustomizerOpen(true)}
            className="p-1.5 rounded-xl bg-[#201c18] hover:bg-[#28211a] text-[#dfba89] border border-[#dfba89]/30 transition active:scale-90"
            title="Customize Nav Layout (5 Themes)"
            aria-label="Customize Navigation"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
