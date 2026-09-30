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
  // OPTION 2: FROSTED OBSIDIAN CAPSULE (Minimalist Liquid Smoked Glass)
  // =========================================================================
  if (bottomNavStyle === 'glass-obsidian') {
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(0.6rem,calc(env(safe-area-inset-bottom,0px)+0.25rem))] pointer-events-none transition-all gpu">
        <div className="flex items-center justify-between max-w-[360px] mx-auto bg-[#0d0b09]/92 backdrop-blur-3xl border border-[#302720]/80 shadow-[0_16px_50px_rgba(0,0,0,0.92)] rounded-full px-2 py-1.5 pointer-events-auto ring-1 ring-white/5">
          {/* Explore */}
          <button
            onClick={() => setActiveRole('driver')}
            className={`flex items-center gap-1.5 rounded-full transition-all active:scale-90 cursor-pointer ${
              activeRole === 'driver'
                ? 'bg-[#dfba89] text-[#12100e] px-3 py-1.5 font-bold text-xs shadow-md'
                : 'p-2 text-[#756758] hover:text-[#dfba89]'
            }`}
            title="Explore Spots"
            aria-label="Explore Spots"
          >
            <Compass className="w-4 h-4 shrink-0" />
            {activeRole === 'driver' && <span className="text-[11px] font-extrabold">Explore</span>}
          </button>

          {/* Bookings */}
          <button
            onClick={onOpenBookings}
            className="flex items-center gap-1.5 rounded-full relative transition-all active:scale-90 p-2 text-[#756758] hover:text-[#dfba89] cursor-pointer"
            title="My Bookings"
            aria-label="My Bookings"
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
            className={`w-9 h-9 rounded-full bg-gradient-to-tr from-[#dfba89] via-[#d4a373] to-[#b37d4e] text-[#12100e] flex items-center justify-center transition active:scale-90 cursor-pointer shadow-md ${getGlowClass('button')}`}
            title="List a Parking Spot"
            aria-label="List a Parking Spot"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Host Hub */}
          <button
            onClick={() => setActiveRole('host')}
            className={`flex items-center gap-1.5 rounded-full transition-all active:scale-90 cursor-pointer ${
              activeRole === 'host'
                ? 'bg-[#dfba89] text-[#12100e] px-3 py-1.5 font-bold text-xs shadow-md'
                : 'p-2 text-[#756758] hover:text-[#dfba89]'
            }`}
            title="Host Hub"
            aria-label="Host Hub"
          >
            <Building2 className="w-4 h-4 shrink-0" />
            {activeRole === 'host' && <span className="text-[11px] font-extrabold">Host</span>}
          </button>

          {/* Account */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="p-2 rounded-full text-[#756758] hover:text-[#dfba89] transition active:scale-90 cursor-pointer"
            title="Account"
            aria-label="Account"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Style Customizer Trigger */}
          <button
            onClick={() => setIsNavCustomizerOpen(true)}
            className="p-1.5 rounded-full bg-[#241f1a] text-[#dfba89] border border-[#dfba89]/30 hover:bg-[#2e2620] transition active:scale-90 ml-0.5 cursor-pointer"
            title="Customize Glass Island (5 Variations)"
            aria-label="Customize Glass Island"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>
    );
  }

  // =========================================================================
  // OPTION 3: CYBER EDGE GLASS ISLAND (Luminous Perimeter Neon Ring)
  // =========================================================================
  if (bottomNavStyle === 'glass-neon') {
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(0.6rem,calc(env(safe-area-inset-bottom,0px)+0.25rem))] pointer-events-none transition-all gpu">
        <div className="max-w-md mx-auto pointer-events-auto bg-[#14100c]/90 backdrop-blur-2xl border-2 border-[#dfba89]/75 shadow-[0_0_24px_rgba(223,186,137,0.3),0_14px_45px_rgba(0,0,0,0.9)] rounded-3xl px-3 py-1.5 flex items-center justify-around relative">
          {/* Explore */}
          <button
            onClick={() => setActiveRole('driver')}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-2xl transition active:scale-95 cursor-pointer ${
              activeRole === 'driver' ? 'text-[#dfba89] font-bold' : 'text-[#756758] hover:text-[#a89682]'
            }`}
            aria-label="Explore spots"
          >
            <Compass className="w-5 h-5" />
            {shouldShowLabel(activeRole === 'driver') && (
              <span className="text-[10px] tracking-tight">Explore</span>
            )}
            {activeRole === 'driver' && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#dfba89] shadow-[0_0_8px_#dfba89]" />
            )}
          </button>

          {/* Bookings */}
          <button
            onClick={onOpenBookings}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-2xl relative transition active:scale-95 cursor-pointer ${
              activeDriverBooking ? 'text-[#dfba89] font-bold' : 'text-[#756758] hover:text-[#a89682]'
            }`}
            aria-label="My Bookings"
          >
            {activeDriverBooking && (
              <span className="absolute top-1 right-2.5 w-2 h-2 rounded-full bg-[#dfba89] animate-ping" />
            )}
            <Clock className="w-5 h-5" />
            {shouldShowLabel(false) && (
              <span className="text-[10px] tracking-tight">Bookings</span>
            )}
          </button>

          {/* Center Orbital Neon Button */}
          <button
            onClick={() => {
              setActiveRole('host');
              setIsListSpotOpen(true);
            }}
            className="flex flex-col items-center justify-center gap-0.5 py-0 px-2 group active:scale-95 transition relative -mt-6 cursor-pointer"
            aria-label="List a parking spot"
          >
            <div className="relative">
              {/* Outer pulsing neon ring */}
              <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#dfba89] to-[#f3dfc6] opacity-60 blur-xs animate-pulse" />
              <div className={`relative w-12 h-12 rounded-full bg-gradient-to-tr from-[#dfba89] via-[#f3dfc6] to-[#dfba89] text-[#12100e] flex items-center justify-center ring-4 ring-[#14100c] border border-[#dfba89] shadow-[0_0_18px_rgba(223,186,137,0.55)] group-hover:scale-105 transition-all ${getGlowClass('halo')}`}>
                <Sparkles className="w-6 h-6 text-[#12100e] fill-[#12100e]" />
              </div>
            </div>
            {shouldShowLabel(true) && (
              <span className="text-[10px] font-black text-[#dfba89] tracking-wider uppercase mt-1">List Spot</span>
            )}
          </button>

          {/* Host Mode */}
          <button
            onClick={() => setActiveRole('host')}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-2xl transition active:scale-95 cursor-pointer ${
              activeRole === 'host' ? 'text-[#dfba89] font-bold' : 'text-[#756758] hover:text-[#a89682]'
            }`}
            aria-label="Host Hub"
          >
            <Building2 className="w-5 h-5" />
            {shouldShowLabel(activeRole === 'host') && (
              <span className="text-[10px] tracking-tight">Host Hub</span>
            )}
            {activeRole === 'host' && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#dfba89] shadow-[0_0_8px_#dfba89]" />
            )}
          </button>

          {/* Account & Customizer */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-2xl text-[#756758] hover:text-[#a89682] active:scale-95 transition cursor-pointer"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
              {shouldShowLabel(false) && (
                <span className="text-[10px] tracking-tight">Account</span>
              )}
            </button>

            <button
              onClick={() => setIsNavCustomizerOpen(true)}
              className="p-1.5 rounded-xl bg-[#201c18] hover:bg-[#28211a] text-[#dfba89] border border-[#dfba89]/40 shadow-[0_0_10px_rgba(223,186,137,0.2)] transition active:scale-90 cursor-pointer"
              title="Customize Glass Island (5 Variations)"
              aria-label="Customize Glass Island"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // =========================================================================
  // OPTION 4: SPLIT ISLAND DUO (Twin Floating Glass Pods)
  // =========================================================================
  if (bottomNavStyle === 'glass-split') {
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(0.6rem,calc(env(safe-area-inset-bottom,0px)+0.25rem))] pointer-events-none transition-all gpu">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2.5">
          {/* Pod 1: Main Glass Navigation Dock */}
          <div className="flex-1 pointer-events-auto bg-[#161310]/88 backdrop-blur-2xl border border-[#dfba89]/30 shadow-[0_12px_40px_rgba(0,0,0,0.85)] rounded-2xl px-2.5 py-1.5 flex items-center justify-around ring-1 ring-white/5">
            {/* Explore */}
            <button
              onClick={() => setActiveRole('driver')}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl transition active:scale-95 cursor-pointer ${
                activeRole === 'driver' ? 'text-[#dfba89] font-bold bg-[#dfba89]/10' : 'text-[#756758] hover:text-[#a89682]'
              }`}
              aria-label="Explore spots"
            >
              <Compass className="w-5 h-5" />
              {shouldShowLabel(activeRole === 'driver') && (
                <span className="text-[10px] tracking-tight">Explore</span>
              )}
            </button>

            {/* Bookings */}
            <button
              onClick={onOpenBookings}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl relative transition active:scale-95 cursor-pointer ${
                activeDriverBooking ? 'text-[#dfba89] font-bold bg-[#dfba89]/10' : 'text-[#756758] hover:text-[#a89682]'
              }`}
              aria-label="Bookings"
            >
              {activeDriverBooking && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#dfba89] animate-ping" />
              )}
              <Clock className="w-5 h-5" />
              {shouldShowLabel(false) && (
                <span className="text-[10px] tracking-tight">Bookings</span>
              )}
            </button>

            {/* Host Hub */}
            <button
              onClick={() => setActiveRole('host')}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl transition active:scale-95 cursor-pointer ${
                activeRole === 'host' ? 'text-[#dfba89] font-bold bg-[#dfba89]/10' : 'text-[#756758] hover:text-[#a89682]'
              }`}
              aria-label="Host Hub"
            >
              <Building2 className="w-5 h-5" />
              {shouldShowLabel(activeRole === 'host') && (
                <span className="text-[10px] tracking-tight">Host</span>
              )}
            </button>

            {/* Account */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl text-[#756758] hover:text-[#a89682] active:scale-95 transition cursor-pointer"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
              {shouldShowLabel(false) && (
                <span className="text-[10px] tracking-tight">Account</span>
              )}
            </button>
          </div>

          {/* Pod 2: Floating Satellite Action Orb + Customizer */}
          <div className="pointer-events-auto flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                setActiveRole('host');
                setIsListSpotOpen(true);
              }}
              className={`w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#dfba89] via-[#d4a373] to-[#b37d4e] text-[#12100e] flex items-center justify-center shadow-[0_8px_25px_rgba(223,186,137,0.45)] border border-[#dfba89]/60 active:scale-90 transition group cursor-pointer ${getGlowClass('button')}`}
              title="List a Parking Spot"
              aria-label="List a Parking Spot"
            >
              <Plus className="w-6 h-6 stroke-[3] group-hover:rotate-90 transition-transform duration-200" />
            </button>

            <button
              onClick={() => setIsNavCustomizerOpen(true)}
              className="w-8 h-12 rounded-xl bg-[#1c1814]/90 backdrop-blur-xl text-[#dfba89] border border-[#dfba89]/25 hover:bg-[#28211a] flex items-center justify-center transition active:scale-90 cursor-pointer shadow-md"
              title="Customize Glass Island (5 Variations)"
              aria-label="Customize Glass Island"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // =========================================================================
  // OPTION 5: CHAMPAGNE METALLIC GLASS (Luxury Beveled Rim Island)
  // =========================================================================
  if (bottomNavStyle === 'glass-champagne') {
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(0.6rem,calc(env(safe-area-inset-bottom,0px)+0.25rem))] pointer-events-none transition-all gpu">
        <div className="max-w-md mx-auto pointer-events-auto relative overflow-hidden bg-gradient-to-b from-[#1b1713]/95 via-[#14110e]/92 to-[#0d0c0a]/95 backdrop-blur-2xl border border-[#dfba89]/40 shadow-[0_16px_50px_rgba(0,0,0,0.92)] rounded-2xl px-3 py-2 flex items-center justify-around ring-1 ring-white/10">
          {/* Champagne Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#dfba89] to-transparent pointer-events-none opacity-80" />

          {/* Explore */}
          <button
            onClick={() => setActiveRole('driver')}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition active:scale-95 cursor-pointer ${
              activeRole === 'driver' ? 'text-[#f3dfc6] font-extrabold' : 'text-[#756758] hover:text-[#a89682]'
            }`}
            aria-label="Explore spots"
          >
            <Compass className="w-5 h-5" />
            {shouldShowLabel(activeRole === 'driver') && (
              <span className="text-[10px] tracking-wider uppercase font-bold text-[#dfba89]">Explore</span>
            )}
            {activeRole === 'driver' && (
              <span className="w-4 h-0.5 rounded-full bg-[#dfba89] shadow-[0_0_6px_#dfba89]" />
            )}
          </button>

          {/* Bookings */}
          <button
            onClick={onOpenBookings}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl relative transition active:scale-95 cursor-pointer ${
              activeDriverBooking ? 'text-[#f3dfc6] font-extrabold' : 'text-[#756758] hover:text-[#a89682]'
            }`}
            aria-label="Bookings"
          >
            {activeDriverBooking && (
              <span className="absolute top-1 right-2.5 w-2 h-2 rounded-full bg-[#dfba89] animate-ping" />
            )}
            <Clock className="w-5 h-5" />
            {shouldShowLabel(false) && (
              <span className="text-[10px] tracking-wider uppercase">Bookings</span>
            )}
          </button>

          {/* Center Embossed Squircle Medallion */}
          <button
            onClick={() => {
              setActiveRole('host');
              setIsListSpotOpen(true);
            }}
            className="flex flex-col items-center justify-center gap-0.5 py-0 px-2 group active:scale-95 transition relative -mt-4 cursor-pointer"
            aria-label="List a parking spot"
          >
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br from-[#f3dfc6] via-[#dfba89] to-[#a67c52] text-[#12100e] flex items-center justify-center border-2 border-[#1b1713] shadow-[0_6px_22px_rgba(223,186,137,0.45)] group-hover:scale-105 transition-all ${getGlowClass('button')}`}>
              <PlusCircle className="w-5 h-5 text-[#12100e]" />
            </div>
            {shouldShowLabel(true) && (
              <span className="text-[10px] font-extrabold text-[#f3dfc6] tracking-wider uppercase mt-0.5">List Spot</span>
            )}
          </button>

          {/* Host Mode */}
          <button
            onClick={() => setActiveRole('host')}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition active:scale-95 cursor-pointer ${
              activeRole === 'host' ? 'text-[#f3dfc6] font-extrabold' : 'text-[#756758] hover:text-[#a89682]'
            }`}
            aria-label="Host Hub"
          >
            <Building2 className="w-5 h-5" />
            {shouldShowLabel(activeRole === 'host') && (
              <span className="text-[10px] tracking-wider uppercase font-bold text-[#dfba89]">Host Hub</span>
            )}
            {activeRole === 'host' && (
              <span className="w-4 h-0.5 rounded-full bg-[#dfba89] shadow-[0_0_6px_#dfba89]" />
            )}
          </button>

          {/* Account & Customizer */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl text-[#756758] hover:text-[#a89682] active:scale-95 transition cursor-pointer"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
              {shouldShowLabel(false) && (
                <span className="text-[10px] tracking-wider uppercase">Account</span>
              )}
            </button>

            <button
              onClick={() => setIsNavCustomizerOpen(true)}
              className="p-1.5 rounded-xl bg-[#241f1a] hover:bg-[#2e2620] text-[#dfba89] border border-[#dfba89]/30 transition active:scale-90 cursor-pointer shadow-xs"
              title="Customize Glass Island (5 Variations)"
              aria-label="Customize Glass Island"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // =========================================================================
  // OPTION 1: DEFAULT - AURA GLASS ISLAND (VisionOS Signature Halo - Your Favorite)
  // =========================================================================
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(0.6rem,calc(env(safe-area-inset-bottom,0px)+0.25rem))] pointer-events-none transition-all gpu">
      <div className="max-w-md mx-auto pointer-events-auto bg-[#161310]/85 backdrop-blur-2xl border border-[#dfba89]/30 shadow-[0_12px_45px_rgba(0,0,0,0.85)] rounded-3xl px-3 py-1.5 flex items-center justify-around ring-1 ring-white/5 relative">
        {/* Explore */}
        <button
          onClick={() => setActiveRole('driver')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-2xl transition active:scale-95 cursor-pointer ${
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
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-2xl relative transition active:scale-95 cursor-pointer ${
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

        {/* Glowing Center Elevated Orb with VisionOS Halo Ring */}
        <button
          onClick={() => {
            setActiveRole('host');
            setIsListSpotOpen(true);
          }}
          className="flex flex-col items-center justify-center gap-0.5 py-0 px-2 text-[#f6f2ec] group active:scale-95 transition relative cursor-pointer"
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
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-2xl transition active:scale-95 cursor-pointer ${
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
            className="flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-2xl text-[#756758] hover:text-[#a89682] active:scale-95 transition cursor-pointer"
            aria-label="User account"
          >
            <User className="w-5 h-5" />
            {shouldShowLabel(false) && (
              <span className="text-[10px] tracking-tight">Account</span>
            )}
          </button>

          <button
            onClick={() => setIsNavCustomizerOpen(true)}
            className="p-1.5 rounded-xl bg-[#201c18] hover:bg-[#28211a] text-[#dfba89] border border-[#dfba89]/30 transition active:scale-90 cursor-pointer shadow-xs"
            title="Customize Glass Island (5 Variations)"
            aria-label="Customize Navigation"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
