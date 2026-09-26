'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import DriverMarketplace from '@/components/driver/DriverMarketplace';
import HostDashboard from '@/components/host/HostDashboard';
import SpotDetailModal from '@/components/driver/SpotDetailModal';
import CheckoutModal from '@/components/driver/CheckoutModal';
import ListSpotModal from '@/components/host/ListSpotModal';
import DriverBookingsModal from '@/components/driver/DriverBookingsModal';
import ActiveBookingCard from '@/components/driver/ActiveBookingCard';
import AuthModal from '@/components/auth/AuthModal';
import ToastContainer from '@/components/ui/ToastContainer';
import { ParkingSpot } from '@/types';
import { Car, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { getAssetUrl } from '@/lib/assets';

function MainApp() {
  const router = useRouter();
  const {
    currentUser,
    isAuthenticated,
    isLoadingAuth,
    activeRole,
    selectedSpot,
    setSelectedSpot,
    checkoutSpot,
    isCheckoutOpen,
    setIsCheckoutOpen,
    isListSpotOpen,
    setIsListSpotOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
    openCheckout,
    activeDriverBooking,
  } = useApp();

  const [isSpotDetailOpen, setIsSpotDetailOpen] = useState<boolean>(false);
  const [isDriverBookingsOpen, setIsDriverBookingsOpen] = useState<boolean>(false);
  const [isActiveBookingModalOpen, setIsActiveBookingModalOpen] = useState<boolean>(false);

  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Authentication redirect
  useEffect(() => {
    if (mounted && !isLoadingAuth && (!isAuthenticated || !currentUser)) {
      router.replace('/login');
    }
  }, [mounted, isLoadingAuth, isAuthenticated, currentUser, router]);

  const handleOpenSpotDetail = (spot: ParkingSpot) => {
    setSelectedSpot(spot);
    setIsSpotDetailOpen(true);
  };

  // Auth Loading Splash
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#0e0d0c] flex flex-col items-center justify-center text-[#f6f2ec]">
        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#dfba89]/40 bg-[#12100e] shadow-xl shadow-[#dfba89]/20 flex items-center justify-center mb-3 animate-pulse">
          <img
            src={getAssetUrl('/logos/shield-icon.jpg?v=2')}
            alt="Parkable Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-sm font-semibold tracking-wide text-[#a89682]">Verifying session...</p>
      </div>
    );
  }

  // Compulsory Gate (fallback while redirecting)
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c0b0a] via-[#141210] to-[#1a1714] flex flex-col items-center justify-center p-4 text-[#f6f2ec]">
        <div className="max-w-md w-full bg-[#181512]/95 backdrop-blur-xl border border-[#383028] rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl shadow-black">
          <div className="w-16 h-16 rounded-2xl bg-[#d4a373]/10 border border-[#d4a373]/30 text-[#dfba89] flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#dfba89] bg-[#d4a373]/15 px-2.5 py-0.5 rounded-full border border-[#d4a373]/30">
              Authentication Required
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#f6f2ec] mt-2">
              Sign In to Access Parkable
            </h1>
            <p className="text-xs text-[#a89682] mt-1.5 max-w-xs mx-auto">
              Please sign in or create an account to view available spaces, manage bookings, and host spots.
            </p>
          </div>
          <Link
            href="/login"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-[#d4a373]/20"
          >
            <span>Proceed to Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0e0d0c] font-sans text-[#f6f2ec]">
      {/* Top Navbar */}
      <Navbar
        onOpenActiveBooking={() => setIsActiveBookingModalOpen(true)}
      />

      {/* Main Role Content */}
      <main className="flex-1 flex flex-col min-h-0">
        {activeRole === 'host' ? <HostDashboard /> : (
          <DriverMarketplace
            onOpenBookingModal={handleOpenSpotDetail}
            onOpenActiveBookingCard={() => setIsActiveBookingModalOpen(true)}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        onOpenBookings={() => setIsDriverBookingsOpen(true)}
      />

      {/* Spot Detail Modal */}
      <SpotDetailModal
        spot={selectedSpot}
        onClose={() => {
          setSelectedSpot(null);
          setIsSpotDetailOpen(false);
        }}
        onBookNow={(spot) => {
          setIsSpotDetailOpen(false);
          openCheckout(spot);
        }}
      />

      {/* Checkout Modal (Stripe payment simulation & commission fee) */}
      <CheckoutModal
        spot={checkoutSpot}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onBookingComplete={() => setIsActiveBookingModalOpen(true)}
      />

      {/* List a Spot Multi-step Wizard */}
      <ListSpotModal
        isOpen={isListSpotOpen}
        onClose={() => setIsListSpotOpen(false)}
      />

      {/* Driver Bookings Ledger */}
      <DriverBookingsModal
        isOpen={isDriverBookingsOpen}
        onClose={() => setIsDriverBookingsOpen(false)}
        onSelectActiveBooking={() => {
          setIsDriverBookingsOpen(false);
          setIsActiveBookingModalOpen(true);
        }}
      />

      {/* Active Booking Floating Card Modal */}
      {isActiveBookingModalOpen && activeDriverBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md animate-in zoom-in-95 duration-200">
            <ActiveBookingCard
              booking={activeDriverBooking}
              onClose={() => setIsActiveBookingModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Authentication & Persona Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Toast Feedback Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function Home() {
  return <MainApp />;
}
