'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Booking } from '@/types';
import { 
  Clock, 
  Navigation, 
  PlusCircle, 
  CheckCircle, 
  QrCode, 
  Key, 
  AlertTriangle, 
  ShieldCheck, 
  X,
  ChevronRight,
  Phone,
  Car
} from 'lucide-react';

interface ActiveBookingCardProps {
  booking: Booking | null;
  onClose?: () => void;
}

export default function ActiveBookingCard({
  booking,
  onClose,
}: ActiveBookingCardProps) {
  const { extendBooking, completeBooking, addToast } = useApp();

  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
    isExpired: boolean;
  }>({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isExpired: false });

  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Live countdown timer updating every second
  useEffect(() => {
    if (!booking) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(booking.end_time).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isExpired: true });
      } else {
        const totalSeconds = Math.floor(diff / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        setTimeLeft({ hours, minutes, seconds, totalSeconds, isExpired: false });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [booking?.end_time]);

  if (!booking) return null;

  const handleQuickExtend = async (hours: number) => {
    await extendBooking(booking.id, hours);
    setIsExtendModalOpen(false);
  };

  const handleOpenNavigation = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${booking.spot_lat},${booking.spot_lng}`;
    window.open(url, '_blank');
  };

  // Format countdown string
  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <>
      <div className="w-full bg-[#181512] rounded-3xl shadow-2xl border border-[#383028] overflow-hidden">
        {/* Top Active Bar */}
        <div className={`p-4 text-white flex items-center justify-between ${
          timeLeft.isExpired 
            ? 'bg-gradient-to-r from-rose-900 to-red-800' 
            : 'bg-gradient-to-r from-[#241d16] via-[#2c231a] to-[#1e1812] border-b border-[#dfba89]/30'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-[#dfba89] animate-ping" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#dfba89]">
                {timeLeft.isExpired ? 'Session Expired' : 'Active Parking Session'}
              </span>
              <p className="text-sm font-black text-[#f6f2ec] leading-tight">
                {booking.spot_title}
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-full text-[#a89682] hover:text-[#f6f2ec] hover:bg-[#241d16] transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Real-time Countdown Timer Display */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#12100e] text-white border border-[#383028] shadow-inner">
            <div className="text-center sm:text-left">
              <span className="text-[11px] font-bold text-[#a89682] uppercase tracking-widest block mb-1">
                Time Remaining
              </span>
              <div className="flex items-baseline gap-2 font-mono">
                <span className="text-3xl sm:text-4xl font-black text-[#dfba89] tracking-tight">
                  {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
                </span>
                <span className="text-xs text-[#a89682] font-sans font-medium">
                  (Ends at {new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                </span>
              </div>
            </div>

            {/* Quick Extend Button */}
            <button
              onClick={() => setIsExtendModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#dfba89]/20 transition"
            >
              <PlusCircle className="w-4 h-4 text-[#12100e]" />
              <span>Extend Time</span>
            </button>
          </div>

          {/* Access Code & Vehicle Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#201c18] border border-[#383028]">
              <div className="flex items-center gap-1.5 text-xs text-[#a89682] font-semibold mb-1">
                <Key className="w-3.5 h-3.5 text-[#dfba89]" />
                <span>Gate Passcode</span>
              </div>
              <div className="text-lg font-mono font-black text-[#dfba89]">
                {booking.access_code}
              </div>
              <button
                onClick={() => setShowQrModal(true)}
                className="mt-1 text-[11px] text-[#dfba89] font-bold hover:underline flex items-center gap-1"
              >
                <QrCode className="w-3 h-3" />
                <span>Show QR Pass</span>
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#201c18] border border-[#383028]">
              <div className="flex items-center gap-1.5 text-xs text-[#a89682] font-semibold mb-1">
                <Car className="w-3.5 h-3.5 text-[#dfba89]" />
                <span>Registered Plate</span>
              </div>
              <div className="text-base font-mono font-black text-[#f6f2ec] truncate">
                {booking.vehicle_plate}
              </div>
              <span className="text-[11px] text-[#a89682] truncate block mt-1">
                {booking.vehicle_model || 'Standard vehicle'}
              </span>
            </div>
          </div>

          {/* Location & Navigation Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#201c18] border border-[#dfba89]/40 shadow-md shadow-[#dfba89]/5">
            <div className="text-xs">
              <span className="font-bold text-[#dfba89] block flex items-center gap-1.5">
                <span>Spot Address</span>
                <span className="px-1.5 py-0.5 rounded bg-[#dfba89]/20 text-[#dfba89] text-[9px] font-black uppercase">GPS Ready</span>
              </span>
              <span className="text-[#f6f2ec] mt-0.5 block">{booking.spot_address}</span>
            </div>

            <button
              onClick={handleOpenNavigation}
              className="shrink-0 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#e5c499] to-[#c59b6d] hover:from-[#ebd3af] hover:to-[#d4a87b] text-[#12100e] font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#dfba89]/30 ring-2 ring-[#dfba89] hover:ring-4 transition-all duration-200 cursor-pointer animate-pulse"
            >
              <Navigation className="w-4 h-4 text-[#12100e] fill-[#12100e]" />
              <span>Open Navigation</span>
            </button>
          </div>

          {/* Bottom Complete / Check-out button */}
          <div className="pt-1 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                if (confirm('Are you ready to end this parking session?')) {
                  completeBooking(booking.id);
                }
              }}
              className="w-full py-2.5 rounded-xl border border-[#383028] hover:bg-[#201c18] text-[#c2b29d] hover:text-[#f6f2ec] font-bold text-xs transition"
            >
              Complete & Exit Parking
            </button>
          </div>
        </div>
      </div>

      {/* Extend Time Modal */}
      {isExtendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#181512] rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl border border-[#383028] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-[#f6f2ec]">Extend Parking Time</h4>
              <button
                onClick={() => setIsExtendModalOpen(false)}
                className="p-1 text-[#a89682] hover:text-[#f6f2ec] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#a89682]">
              Select how much extra time you need. Your card on file will be charged automatically at the spot rate (₹{booking.hourly_rate}/hr).
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickExtend(0.5)}
                className="p-3 rounded-xl border border-[#383028] bg-[#201c18] hover:border-[#dfba89] hover:bg-[#28211a] text-center transition"
              >
                <div className="text-xs font-bold text-[#f6f2ec]">+30 Mins</div>
                <div className="text-[10px] text-[#dfba89] mt-0.5">₹{Math.round(booking.hourly_rate * 0.55)}</div>
              </button>

              <button
                onClick={() => handleQuickExtend(1)}
                className="p-3 rounded-xl border border-[#383028] bg-[#201c18] hover:border-[#dfba89] hover:bg-[#28211a] text-center transition"
              >
                <div className="text-xs font-bold text-[#f6f2ec]">+1 Hour</div>
                <div className="text-[10px] text-[#dfba89] mt-0.5">₹{Math.round(booking.hourly_rate * 1.1)}</div>
              </button>

              <button
                onClick={() => handleQuickExtend(2)}
                className="p-3 rounded-xl border border-[#383028] bg-[#201c18] hover:border-[#dfba89] hover:bg-[#28211a] text-center transition"
              >
                <div className="text-xs font-bold text-[#f6f2ec]">+2 Hours</div>
                <div className="text-[10px] text-[#dfba89] mt-0.5">₹{Math.round(booking.hourly_rate * 2.2)}</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Pass Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#181512] rounded-3xl p-6 max-w-xs w-full shadow-2xl border border-[#383028] text-center space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1 text-[#a89682] hover:text-[#f6f2ec] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-[#12100e] rounded-2xl border border-[#383028] inline-block">
              {/* SVG QR Code Simulation */}
              <svg className="w-44 h-44 mx-auto text-[#dfba89]" viewBox="0 0 100 100" fill="currentColor">
                <rect x="5" y="5" width="30" height="30" fill="currentColor" rx="4" />
                <rect x="10" y="10" width="20" height="20" fill="#12100e" rx="2" />
                <rect x="15" y="15" width="10" height="10" fill="currentColor" />

                <rect x="65" y="5" width="30" height="30" fill="currentColor" rx="4" />
                <rect x="70" y="10" width="20" height="20" fill="#12100e" rx="2" />
                <rect x="75" y="15" width="10" height="10" fill="currentColor" />

                <rect x="5" y="65" width="30" height="30" fill="currentColor" rx="4" />
                <rect x="10" y="70" width="20" height="20" fill="#12100e" rx="2" />
                <rect x="15" y="75" width="10" height="10" fill="currentColor" />

                {/* Random QR pixels */}
                <rect x="45" y="10" width="8" height="8" />
                <rect x="45" y="25" width="8" height="8" />
                <rect x="45" y="45" width="8" height="8" />
                <rect x="10" y="45" width="8" height="8" />
                <rect x="25" y="45" width="8" height="8" />
                <rect x="65" y="45" width="8" height="8" />
                <rect x="80" y="45" width="8" height="8" />
                <rect x="45" y="65" width="8" height="8" />
                <rect x="45" y="80" width="8" height="8" />
                <rect x="65" y="65" width="12" height="12" />
                <rect x="80" y="80" width="12" height="12" />
              </svg>
            </div>

            <div>
              <div className="font-mono text-xl font-black text-[#dfba89]">
                PASS: {booking.access_code}
              </div>
              <p className="text-xs text-[#a89682] mt-1">
                Scan at gate scanner or present to security
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
