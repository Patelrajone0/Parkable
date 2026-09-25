'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { 
  X, 
  Clock, 
  MapPin, 
  Car, 
  Key, 
  Navigation, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  ChevronRight
} from 'lucide-react';

interface DriverBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectActiveBooking?: () => void;
}

export default function DriverBookingsModal({
  isOpen,
  onClose,
  onSelectActiveBooking,
}: DriverBookingsModalProps) {
  const { bookings, currentUser, completeBooking } = useApp();

  if (!isOpen) return null;

  // Filter bookings for this driver
  const myBookings = bookings.filter((b) => b.driver_id === currentUser?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#181512] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[#383028]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#12100e] text-[#f6f2ec] border-b border-[#383028] flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-[#f6f2ec]">My Parking Reservations</h3>
            <p className="text-xs text-[#a89682]">
              Active sessions, digital access codes, and receipt history
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1c1814] hover:bg-[#28211a] text-[#f6f2ec] border border-[#383028] flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {myBookings.length === 0 ? (
            <div className="p-10 text-center text-[#a89682] text-xs">
              <Calendar className="w-10 h-10 text-[#756758] mx-auto mb-2" />
              <p className="font-semibold text-[#f6f2ec] text-sm">No reservations yet</p>
              <p className="text-[#a89682] mt-1">
                Explore the map and book an empty driveway or parking slot nearby.
              </p>
            </div>
          ) : (
            myBookings.map((b) => {
              const isActive = b.status === 'active';
              const isPast = new Date(b.end_time).getTime() < Date.now();

              return (
                <div
                  key={b.id}
                  className={`p-4 rounded-2xl border transition ${
                    isActive && !isPast
                      ? 'bg-[#241d16] border-[#dfba89]/40 shadow-lg shadow-black/40'
                      : 'bg-[#1c1814] border-[#383028] shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                          isActive && !isPast
                            ? 'bg-gradient-to-r from-[#dfba89] to-[#b37d4e] text-[#12100e]'
                            : 'bg-[#28211a] text-[#a89682] border border-[#383028]'
                        }`}
                      >
                        {isActive && !isPast ? 'Active Parking' : b.status}
                      </span>
                      <h4 className="font-bold text-sm text-[#f6f2ec] leading-snug">
                        {b.spot_title}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] text-[#a89682] mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#dfba89] shrink-0" />
                        <span className="truncate">{b.spot_address}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-black text-[#dfba89]">₹{b.total_amount}</div>
                      <div className="text-[10px] text-[#756758]">{b.total_hours} hr(s)</div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#2c251e] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#756758] block">Gate PIN</span>
                        <span className="font-mono font-bold text-[#dfba89]">{b.access_code}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#756758] block">Plate</span>
                        <span className="font-mono font-bold text-[#f6f2ec]">{b.vehicle_plate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${b.spot_lat},${b.spot_lng}`;
                          window.open(url, '_blank');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] text-[11px] font-bold flex items-center gap-1 shadow-xs transition"
                      >
                        <Navigation className="w-3 h-3 text-[#12100e]" />
                        <span>Navigate</span>
                      </button>

                      {isActive && (
                        <button
                          onClick={() => {
                            if (confirm('End parking session now?')) {
                              completeBooking(b.id);
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-[#383028] bg-[#28211a] text-[#f6f2ec] hover:bg-[#342b22] text-[11px] font-semibold transition"
                        >
                          Check Out
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
