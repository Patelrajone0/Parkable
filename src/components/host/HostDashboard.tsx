'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Building2, 
  PlusCircle, 
  DollarSign, 
  Car, 
  Clock, 
  Power, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  MapPin
} from 'lucide-react';

export default function HostDashboard() {
  const {
    currentUser,
    spots,
    bookings,
    toggleSpotStatus,
    deleteSpot,
    updateSpot,
    setIsListSpotOpen,
    platformCommissionRate,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'spots' | 'earnings'>('spots');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState<boolean>(false);

  // Filter spots belonging to this host
  const hostId = currentUser?.id;
  const hostSpots = hostId ? spots.filter((s) => s.host_id === hostId) : [];

  // Filter bookings associated with host's spots
  const hostSpotIds = new Set(hostSpots.map((s) => s.id));
  const hostBookings = bookings.filter((b) => hostSpotIds.has(b.spot_id));

  // Compute Financials
  const grossRevenue = hostBookings.reduce((sum, b) => sum + b.total_amount, 0);
  const totalCommission = hostBookings.reduce((sum, b) => sum + b.platform_fee, 0);
  const netEarnings = hostBookings.reduce((sum, b) => sum + b.host_earnings, 0);
  const activeBookingsCount = hostBookings.filter((b) => b.status === 'active').length;

  const handleSavePrice = (spotId: string) => {
    if (newPrice > 0) {
      updateSpot(spotId, { hourly_rate: newPrice });
      setEditingPriceId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 text-[#f6f2ec]">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#181512] via-[#201c18] to-[#2c231a] border border-[#383028] p-6 sm:p-8 rounded-3xl text-white shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#dfba89]/10 text-[#dfba89] text-xs font-bold uppercase tracking-wider border border-[#dfba89]/30">
              Host Management Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight text-[#f6f2ec]">
            Welcome back, {currentUser?.name || 'Host'}!
          </h1>
          <p className="text-xs sm:text-sm text-[#a89682] mt-1 max-w-xl">
            Manage your parking spaces, track driver bookings, and collect hourly passive income with seamless automatic payouts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsListSpotOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#dfba89]/20 transition-all duration-200 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#12100e]" />
            <span>List a New Spot</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Net Host Earnings */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#181512] border border-[#383028] shadow-lg shadow-black/40 space-y-1">
          <div className="flex items-center justify-between text-[#a89682] text-xs font-semibold">
            <span>Net Host Payout</span>
            <div className="p-2 rounded-xl bg-[#201c18] border border-[#383028] text-[#dfba89]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#dfba89]">
            ₹{netEarnings.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#756758]">
            After 10% platform fee deduction
          </p>
        </div>

        {/* Gross Revenue */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#181512] border border-[#383028] shadow-lg shadow-black/40 space-y-1">
          <div className="flex items-center justify-between text-[#a89682] text-xs font-semibold">
            <span>Gross Revenue</span>
            <div className="p-2 rounded-xl bg-[#201c18] border border-[#383028] text-[#dfba89]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#f6f2ec]">
            ₹{grossRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#756758]">
            Total driver booking payments
          </p>
        </div>

        {/* Active Bookings */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#181512] border border-[#383028] shadow-lg shadow-black/40 space-y-1">
          <div className="flex items-center justify-between text-[#a89682] text-xs font-semibold">
            <span>Active Sessions</span>
            <div className="p-2 rounded-xl bg-[#201c18] border border-[#383028] text-[#dfba89]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#f6f2ec]">
            {activeBookingsCount}
          </div>
          <p className="text-[11px] text-[#dfba89] font-semibold">
            Vehicles currently parked
          </p>
        </div>

        {/* Spaces Listed */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#181512] border border-[#383028] shadow-lg shadow-black/40 space-y-1">
          <div className="flex items-center justify-between text-[#a89682] text-xs font-semibold">
            <span>Total Spaces</span>
            <div className="p-2 rounded-xl bg-[#201c18] border border-[#383028] text-[#dfba89]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#f6f2ec]">
            {hostSpots.length}
          </div>
          <p className="text-[11px] text-[#756758]">
            {hostSpots.filter((s) => s.is_active).length} online and discoverable
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-[#2c251e]">
        <button
          onClick={() => setActiveTab('spots')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'spots'
              ? 'border-[#dfba89] text-[#dfba89]'
              : 'border-transparent text-[#a89682] hover:text-[#f6f2ec]'
          }`}
        >
          My Listed Spaces ({hostSpots.length})
        </button>

        <button
          onClick={() => setActiveTab('earnings')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'earnings'
              ? 'border-[#dfba89] text-[#dfba89]'
              : 'border-transparent text-[#a89682] hover:text-[#f6f2ec]'
          }`}
        >
          Earnings & Booking Ledger ({hostBookings.length})
        </button>

        <button
          onClick={() => setIsWithdrawOpen(true)}
          className="ml-auto mb-2 px-3 py-1.5 rounded-xl border border-[#383028] bg-[#181512] hover:bg-[#201c18] text-xs font-bold text-[#dfba89] flex items-center gap-1.5 shadow-xs transition cursor-pointer"
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-[#dfba89]" />
          <span>Withdraw Payouts</span>
        </button>
      </div>

      {/* TAB 1: Spots Management */}
      {activeTab === 'spots' && (
        <div className="space-y-4">
          {hostSpots.length === 0 ? (
            <div className="p-12 text-center bg-[#181512] rounded-3xl border border-dashed border-[#383028]">
              <Building2 className="w-12 h-12 text-[#756758] mx-auto mb-3" />
              <h3 className="font-bold text-[#f6f2ec] text-base">No parking spots listed yet</h3>
              <p className="text-xs text-[#a89682] max-w-sm mx-auto mt-1 mb-4">
                List your empty driveway, porch, or commercial slot and turn idle space into recurring income.
              </p>
              <button
                onClick={() => setIsListSpotOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#dfba89] to-[#b37d4e] text-[#12100e] font-bold text-xs"
              >
                List Your First Spot
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hostSpots.map((spot) => (
                <div
                  key={spot.id}
                  className="bg-[#181512] rounded-2xl border border-[#383028] shadow-lg shadow-black/40 hover:border-[#dfba89]/50 transition overflow-hidden flex flex-col"
                >
                  {/* Photo & Availability badge */}
                  <div className="relative h-44 w-full bg-[#100e0d]">
                    <img
                      src={spot.photos[0]}
                      alt={spot.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                          spot.is_active
                            ? 'bg-[#282119] text-[#dfba89] border border-[#dfba89]/30 shadow-xs'
                            : 'bg-[#141210]/90 text-[#756758] border border-[#383028] backdrop-blur-xs'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            spot.is_active ? 'bg-[#dfba89] animate-pulse' : 'bg-[#756758]'
                          }`}
                        />
                        <span>{spot.is_active ? 'Available Now' : 'Offline'}</span>
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 rounded bg-[#141210]/80 border border-[#383028] backdrop-blur-xs text-[#f6f2ec] text-[10px] font-semibold capitalize">
                        {spot.space_type}
                      </span>
                    </div>
                  </div>

                  {/* Spot details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-bold text-sm text-[#f6f2ec] leading-snug line-clamp-1">
                        {spot.title}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] text-[#a89682] mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#dfba89] shrink-0" />
                        <span className="truncate">{spot.address}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded bg-[#201c18] text-[#c2b29d] border border-[#383028] text-[10px] font-bold uppercase tracking-wider">
                          {spot.vehicle_size.replace('-', ' ')}
                        </span>
                        {spot.amenities.includes('ev_charging') && (
                          <span className="px-2 py-0.5 rounded bg-[#282119] text-[#dfba89] border border-[#dfba89]/30 text-[10px] font-bold flex items-center gap-1">
                            <Zap className="w-3 h-3 text-[#dfba89]" /> EV Fast
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pricing Edit & Status Toggle */}
                    <div className="pt-3 border-t border-[#2c251e] flex items-center justify-between">
                      {/* Price display / edit */}
                      {editingPriceId === spot.id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-[#dfba89]">₹</span>
                          <input
                            type="number"
                            value={newPrice}
                            onChange={(e) => setNewPrice(parseInt(e.target.value) || 0)}
                            className="w-16 px-1.5 py-0.5 text-xs font-bold border border-[#dfba89] bg-[#100e0d] text-[#f6f2ec] rounded"
                          />
                          <button
                            onClick={() => handleSavePrice(spot.id)}
                            className="p-1 text-[#dfba89] font-bold text-xs"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div>
                            <span className="text-base font-black text-[#dfba89]">
                              ₹{spot.hourly_rate}
                            </span>
                            <span className="text-[10px] text-[#756758] font-medium">/hr</span>
                          </div>
                          <button
                            onClick={() => {
                              setEditingPriceId(spot.id);
                              setNewPrice(spot.hourly_rate);
                            }}
                            className="p-1 text-[#a89682] hover:text-[#f6f2ec]"
                            title="Edit hourly rate"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Online / Offline switch */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSpotStatus(spot.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                            spot.is_active
                              ? 'bg-[#dfba89]/15 text-[#dfba89] border border-[#dfba89]/40 hover:bg-[#dfba89]/25'
                              : 'bg-[#201c18] text-[#a89682] border border-[#383028] hover:bg-[#28211a]'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{spot.is_active ? 'Go Offline' : 'Go Online'}</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this listing?')) {
                              deleteSpot(spot.id);
                            }
                          }}
                          className="p-1.5 text-[#756758] hover:text-[#e08272] rounded-lg hover:bg-[#281c1c] transition"
                          title="Delete listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Earnings & Bookings Ledger */}
      {activeTab === 'earnings' && (
        <div className="bg-[#181512] rounded-3xl border border-[#383028] shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-[#2c251e] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-base text-[#f6f2ec]">Driver Booking Ledger</h3>
              <p className="text-xs text-[#a89682]">
                Detailed transaction log with 10% platform fee calculation & host net payouts
              </p>
            </div>
            <div className="text-xs font-semibold text-[#a89682] bg-[#201c18] px-3 py-1.5 rounded-xl border border-[#383028]">
              Platform Commission: <span className="font-bold text-[#dfba89]">{(platformCommissionRate * 100).toFixed(0)}%</span>
            </div>
          </div>

          {hostBookings.length === 0 ? (
            <div className="p-12 text-center text-[#756758] text-xs">
              No bookings recorded yet on your spots.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#12100e] border-b border-[#2c251e] text-[#a89682] font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Driver & Vehicle</th>
                    <th className="py-3 px-4">Parking Spot</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Gross Paid</th>
                    <th className="py-3 px-4">Platform Fee (10%)</th>
                    <th className="py-3 px-4">Host Net Payout</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#241f1a]">
                  {hostBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#201c18]/60 transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#dfba89]">
                        {b.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#f6f2ec]">{b.driver_name}</div>
                        <div className="font-mono text-[11px] text-[#756758]">{b.vehicle_plate}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="truncate font-medium text-[#f6f2ec]">{b.spot_title}</div>
                      </td>
                      <td className="py-3 px-4 text-[#a89682]">
                        {b.total_hours} hr(s)
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#f6f2ec]">
                        ₹{b.total_amount}
                      </td>
                      <td className="py-3 px-4 text-[#e08272] font-medium">
                        -₹{b.platform_fee}
                      </td>
                      <td className="py-3 px-4 font-black text-[#dfba89]">
                        ₹{b.host_earnings}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            b.status === 'active'
                              ? 'bg-[#282119] text-[#dfba89] border border-[#dfba89]/30'
                              : b.status === 'completed'
                              ? 'bg-[#201c18] text-[#a89682] border border-[#383028]'
                              : 'bg-[#351c1c] text-[#e08272] border border-[#e08272]/30'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Withdraw Modal */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#181512] rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#383028] space-y-4">
            <h4 className="font-bold text-base text-[#f6f2ec]">Withdraw Host Earnings</h4>
            <p className="text-xs text-[#a89682]">
              Available payout balance: <strong className="text-[#dfba89] font-black">₹{netEarnings}</strong>.
            </p>
            <div className="p-3 bg-[#201c18] rounded-xl border border-[#383028] text-xs space-y-1">
              <span className="text-[#756758] font-bold uppercase text-[10px]">Bank Account on File</span>
              <p className="font-mono font-bold text-[#f6f2ec]">HDFC Bank •••• 9102</p>
              <p className="text-[11px] text-[#a89682]">IFSC: HDFC0001092</p>
            </div>
            <button
              onClick={() => {
                addToast('Payout Initiated', `₹${netEarnings} scheduled for instant IMPS transfer to HDFC Bank.`);
                setIsWithdrawOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-bold text-xs shadow-md shadow-[#dfba89]/20 transition cursor-pointer"
            >
              Transfer ₹{netEarnings} to Bank Now
            </button>
            <button
              onClick={() => setIsWithdrawOpen(false)}
              className="w-full py-2 text-xs font-semibold text-[#a89682] hover:text-[#f6f2ec] cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
