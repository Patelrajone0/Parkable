'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  ShieldCheck, 
  Car, 
  PlusCircle, 
  Clock, 
  User, 
  ChevronDown, 
  SlidersHorizontal,
  Compass,
  Building2,
  LogOut,
  MapPin,
  Lock
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAssetUrl } from '@/lib/assets';

interface NavbarProps {
  onOpenActiveBooking?: () => void;
}

export default function Navbar({ onOpenActiveBooking }: NavbarProps) {
  const router = useRouter();
  const {
    currentUser,
    isAuthenticated,
    logout,
    activeRole,
    setActiveRole,
    activeDriverBooking,
    setIsListSpotOpen,
    setIsAuthModalOpen,
    requestSignOut,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    requestSignOut();
  };

  const handleBrandClick = () => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/') {
        window.location.reload();
      } else {
        window.location.href = '/';
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#141210]/95 backdrop-blur-md border-b border-[#2d2620] shadow-md shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div 
            onClick={handleBrandClick}
            title="Refresh website"
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#dfba89]/40 bg-[#12100e] shadow-md shadow-[#dfba89]/20 group-hover:scale-105 transition-transform duration-200 shrink-0 flex items-center justify-center p-0.5">
                <img
                  src={getAssetUrl('/logos/shield-icon.jpg')}
                  alt="Parkable Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            <div>
              <span className="font-black text-xl tracking-tight text-[#f6f2ec] group-hover:text-[#dfba89] transition block">
                Parkable
              </span>
              <p className="text-[11px] text-[#a89682] font-medium hidden sm:block">
                Airbnb for Private Parking
              </p>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Booking Live Indicator (for Drivers) */}
          {activeDriverBooking && (
            <button
              onClick={onOpenActiveBooking}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#d4a373]/15 border border-[#d4a373]/40 text-[#dfba89] hover:bg-[#d4a373]/25 text-xs font-bold transition shadow-xs animate-pulse"
              title="Click to view active parking countdown and directions"
            >
              <div className="w-2 h-2 rounded-full bg-[#dfba89] animate-ping" />
              <Clock className="w-3.5 h-3.5 text-[#dfba89]" />
              <span className="hidden sm:inline">Active Parking</span>
              <span className="text-[10px] font-mono bg-[#d4a373]/30 text-[#f3dfc6] px-1.5 py-0.5 rounded">
                Live
              </span>
            </button>
          )}

          {/* Quick Mode Toggle */}
          <button
            onClick={() => setActiveRole(activeRole === 'driver' ? 'host' : 'driver')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#383028] bg-[#181512] hover:bg-[#25201b] hover:border-[#dfba89]/40 text-[#c9b7a4] hover:text-[#f6f2ec] text-xs font-semibold transition cursor-pointer"
            title={`Switch to ${activeRole === 'driver' ? 'Host' : 'Driver'} mode`}
          >
            {activeRole === 'driver' ? (
              <>
                <Building2 className="w-3.5 h-3.5 text-[#dfba89]" />
                <span className="hidden sm:inline">Host Hub</span>
              </>
            ) : (
              <>
                <Compass className="w-3.5 h-3.5 text-[#dfba89]" />
                <span className="hidden sm:inline">Driver Map</span>
              </>
            )}
          </button>

          {/* List a Spot CTA */}
          <button
            onClick={() => setIsListSpotOpen(true)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] text-xs font-bold shadow-md shadow-[#d4a373]/20 hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#12100e]" />
            <span>List a Spot</span>
          </button>

          {/* User Profile Pill & Dropdown / Sign In Button */}
          {!currentUser || !isAuthenticated ? (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-bold text-xs transition shadow-sm"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-[#383028] hover:border-[#d4a373]/50 bg-[#181512] shadow-xs hover:shadow transition"
                aria-label="User menu"
              >
                <div className="relative w-7 h-7 rounded-full overflow-hidden bg-[#241f1a]">
                  {currentUser.avatar_url ? (
                    <img
                      src={currentUser.avatar_url}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-[#a89682] m-1.5" />
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-[#f6f2ec] leading-none">
                    {currentUser.name?.split(' ')[0] || 'User'}
                  </p>
                  <p className="text-[10px] text-[#a89682] capitalize">
                    {activeRole}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#a89682]" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-[#181512] rounded-2xl shadow-2xl shadow-black/80 border border-[#383028] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-[#2d2620]">
                      <p className="text-xs font-semibold text-[#f6f2ec]">{currentUser.name}</p>
                      <p className="text-xs text-[#a89682] truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#d4a373]/15 text-[#dfba89] border border-[#d4a373]/30">
                        {activeRole} mode
                      </span>
                    </div>

                  {/* Mode Switching within dropdown */}
                  <div className="px-2 py-1.5 border-b border-[#2d2620]">
                    <p className="px-2 text-[10px] font-bold text-[#8a7a6c] uppercase tracking-wider mb-1">
                      Switch Role
                    </p>
                    <button
                      onClick={() => {
                        setActiveRole('driver');
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        activeRole === 'driver' ? 'bg-[#28221b] text-[#dfba89] font-semibold' : 'text-[#c9b7a4] hover:bg-[#221d18]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Compass className="w-3.5 h-3.5 text-[#dfba89]" />
                        <span>Driver Mode</span>
                      </div>
                      {activeRole === 'driver' && <span className="w-1.5 h-1.5 rounded-full bg-[#dfba89]" />}
                    </button>

                    <button
                      onClick={() => {
                        setActiveRole('host');
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        activeRole === 'host' ? 'bg-[#28221b] text-[#dfba89] font-semibold' : 'text-[#c9b7a4] hover:bg-[#221d18]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-[#dfba89]" />
                        <span>Host Mode</span>
                      </div>
                      {activeRole === 'host' && <span className="w-1.5 h-1.5 rounded-full bg-[#dfba89]" />}
                    </button>

                    <Link
                      href="/admin"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-[#c9b7a4] hover:bg-[#25201a] hover:text-[#dfba89] transition group"
                    >
                      <div className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-[#8a7a6c] group-hover:text-[#dfba89]" />
                        <span>Admin Console</span>
                      </div>
                      <span className="text-[10px] bg-[#221d19] group-hover:bg-[#2e261f] text-[#a89682] group-hover:text-[#dfba89] px-1.5 py-0.5 rounded font-mono border border-[#383028]">
                        Protected
                      </span>
                    </Link>
                  </div>

                    {/* Account Profile & Sign Out */}
                    <div className="p-1 space-y-0.5 border-t border-[#2d2620]">
                      <button
                        onClick={() => {
                          setIsAuthModalOpen(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#c9b7a4] hover:bg-[#221d18] rounded-lg transition"
                      >
                        <User className="w-4 h-4 text-[#8a7a6c]" />
                        <span>Account Profile</span>
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 rounded-lg transition"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
