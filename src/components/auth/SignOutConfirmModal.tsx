'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { LogOut, X, AlertTriangle, User, ShieldCheck } from 'lucide-react';

interface SignOutConfirmModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
}

export default function SignOutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: SignOutConfirmModalProps = {}) {
  const router = useRouter();
  const {
    isSignOutModalOpen,
    setIsSignOutModalOpen,
    currentUser,
    activeRole,
    activeDriverBooking,
    logout,
  } = useApp();

  const isModalOpen = isOpen !== undefined ? isOpen : isSignOutModalOpen;
  const handleClose = onClose || (() => setIsSignOutModalOpen(false));

  const handleConfirmAction = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      logout();
      setIsSignOutModalOpen(false);
      router.push('/login');
    }
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleClose();
      }
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, handleClose]);

  if (!isModalOpen) return null;

  const roleLabel =
    activeRole === 'host'
      ? 'Host'
      : activeRole === 'admin'
      ? 'Admin'
      : 'Driver';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="signout-modal-title"
    >
      <div
        className="relative w-full max-w-md bg-gradient-to-b from-[#1c1815] to-[#12100e] rounded-3xl border border-[#383028] shadow-2xl shadow-black/90 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Soft Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-36 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[#241f1a]/90 hover:bg-[#342d25] text-[#a89682] hover:text-[#f6f2ec] border border-[#383028] flex items-center justify-center transition cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-7 text-center relative z-0">
          {/* Badge Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-rose-500/20 to-rose-950/40 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-950/60 group">
            <LogOut className="w-7 h-7 text-rose-400 group-hover:scale-110 transition-transform duration-200" />
          </div>

          {/* Heading & Subtitle */}
          <h3
            id="signout-modal-title"
            className="text-xl sm:text-2xl font-black text-[#f6f2ec] tracking-tight"
          >
            Sign Out of ParkEase?
          </h3>
          <p className="text-xs sm:text-sm text-[#a89682] mt-1.5 max-w-xs mx-auto leading-relaxed">
            Are you sure you want to end your current session? You will need to log back in to manage bookings or parking spaces.
          </p>

          {/* Current Profile Card */}
          {currentUser && (
            <div className="mt-5 p-3.5 rounded-2xl bg-[#161310] border border-[#342b23] text-left flex items-center gap-3 shadow-inner">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#241f1a] border border-[#44382d] shrink-0 flex items-center justify-center">
                {currentUser.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-[#dfba89]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-[#f6f2ec] truncate">
                    {currentUser.name}
                  </h4>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-md bg-[#251f19] border border-[#44382d] text-[#dfba89] uppercase tracking-wider shrink-0">
                    {roleLabel} Mode
                  </span>
                </div>
                <p className="text-[11px] text-[#8a7a6c] truncate mt-0.5">
                  {currentUser.email}
                </p>
              </div>
            </div>
          )}

          {/* Active Booking Reminder Alert */}
          {activeDriverBooking && (
            <div className="mt-3 p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-left flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-200/90 leading-tight">
                <span className="font-semibold text-amber-300">Active parking session:</span> Your reservation at {activeDriverBooking.spot_address || 'reserved space'} will remain saved.
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col-reverse sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-1/2 py-3 px-4 rounded-xl border border-[#383028] bg-[#1a1613] hover:bg-[#25201b] hover:border-[#4d4034] text-[#c9b7a4] hover:text-[#f6f2ec] text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              Stay Signed In
            </button>
            <button
              type="button"
              onClick={handleConfirmAction}
              className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-950/60 hover:shadow-rose-900/70 transition cursor-pointer flex items-center justify-center gap-2 group"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Yes, Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
