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
  MapPin,
  Compass,
  Landmark,
  Smartphone,
  Save,
  CheckCircle2,
  Lock
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
    setActiveRole,
    platformCommissionRate,
    hostPayoutAccount,
    updateHostPayoutAccount,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'spots' | 'earnings' | 'payouts'>('spots');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState<boolean>(false);

  // Payout Account Edit State
  const [payoutForm, setPayoutForm] = useState({
    account_holder_name: hostPayoutAccount?.account_holder_name || currentUser?.name || 'Spot Owner',
    upi_id: hostPayoutAccount?.upi_id || 'owner@okhdfcbank',
    account_number: hostPayoutAccount?.account_number || '501004928192',
    ifsc_code: hostPayoutAccount?.ifsc_code || 'HDFC0000123',
    bank_name: hostPayoutAccount?.bank_name || 'HDFC Bank',
    auto_payout_enabled: hostPayoutAccount?.auto_payout_enabled ?? true,
  });
  const [isSavedPayout, setIsSavedPayout] = useState<boolean>(false);

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

  const handleSavePayoutSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateHostPayoutAccount({
      ...payoutForm,
      status: 'active',
    });
    setIsSavedPayout(true);
    addToast('Payout Account Saved', 'Your Bank Account & UPI ID will receive automatic splits from customer bookings.');
    setTimeout(() => setIsSavedPayout(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-5 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] md:pb-8 text-[#f6f2ec]">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#181512] via-[#201c18] to-[#2c231a] border border-[#383028] p-4 sm:p-8 rounded-2xl sm:rounded-3xl text-white shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#dfba89]/10 text-[#dfba89] text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-[#dfba89]/30">
              Host Management Hub
            </span>
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              <Zap className="w-3 h-3" />
              <span>Automated Payouts Active</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black mt-2 tracking-tight text-[#f6f2ec]">
            Welcome back, {currentUser?.name || 'Host'}!
          </h1>
          <p className="text-xs sm:text-sm text-[#a89682] mt-1 max-w-xl">
            Customer bookings automatically split in real-time: your 90% share routes to your bank/UPI, while platform commission automatically cuts to company treasury.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <button
            onClick={() => setActiveRole('driver')}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-3 rounded-2xl bg-[#1e1914] hover:bg-[#2c231a] text-[#dfba89] border border-[#383028] hover:border-[#dfba89]/40 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Compass className="w-4 h-4 text-[#dfba89]" />
            <span>View Driver Map</span>
          </button>
          <button
            onClick={() => setIsListSpotOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#dfba89]/20 transition-all duration-200 cursor-pointer"
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
            <span>Net Owner Payouts</span>
            <div className="p-2 rounded-xl bg-[#201c18] border border-[#383028] text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            ₹{netEarnings.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#756758]">
            Direct to your Bank / UPI account
          </p>
        </div>

        {/* Gross Revenue */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#181512] border border-[#383028] shadow-lg shadow-black/40 space-y-1">
          <div className="flex items-center justify-between text-[#a89682] text-xs font-semibold">
            <span>Gross Driver Paid</span>
            <div className="p-2 rounded-xl bg-[#201c18] border border-[#383028] text-[#dfba89]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#f6f2ec]">
            ₹{grossRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#756758]">
            Total customer checkout volume
          </p>
        </div>

        {/* Platform Fees Deducted */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#181512] border border-[#383028] shadow-lg shadow-black/40 space-y-1">
          <div className="flex items-center justify-between text-[#a89682] text-xs font-semibold">
            <span>Company Fee Cut (10%)</span>
            <div className="p-2 rounded-xl bg-[#201c18] border border-[#383028] text-[#dfba89]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#dfba89]">
            ₹{totalCommission.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#756758]">
            Auto-credited to company account
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
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-[#2c251e] overflow-x-auto">
        <button
          onClick={() => setActiveTab('spots')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'spots'
              ? 'border-[#dfba89] text-[#dfba89]'
              : 'border-transparent text-[#a89682] hover:text-[#f6f2ec]'
          }`}
        >
          My Listed Spaces ({hostSpots.length})
        </button>

        <button
          onClick={() => setActiveTab('earnings')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'earnings'
              ? 'border-[#dfba89] text-[#dfba89]'
              : 'border-transparent text-[#a89682] hover:text-[#f6f2ec]'
          }`}
        >
          Earnings & Split Ledger ({hostBookings.length})
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'payouts'
              ? 'border-[#dfba89] text-[#dfba89]'
              : 'border-transparent text-[#a89682] hover:text-[#f6f2ec]'
          }`}
        >
          Payout Destination (Bank & UPI)
        </button>

        <button
          onClick={() => setIsWithdrawOpen(true)}
          className="ml-auto mb-2 px-3 py-1.5 rounded-xl border border-[#383028] bg-[#181512] hover:bg-[#201c18] text-xs font-bold text-[#dfba89] flex items-center gap-1.5 shadow-xs transition cursor-pointer whitespace-nowrap"
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-[#dfba89]" />
          <span>Instant Transfer</span>
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
                  <div className="relative h-44 w-full bg-[#100e0d] flex items-center justify-center">
                    {spot.photos && spot.photos.length > 0 ? (
                      <img
                        src={spot.photos[0]}
                        alt={spot.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1c1815] to-[#100e0d]">
                        <div className="w-12 h-12 rounded-2xl bg-[#241f1a] border border-[#383028] flex items-center justify-center text-[#dfba89] shadow-inner mb-1.5">
                          <Car className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-semibold text-[#a89682]">No Photo Uploaded</span>
                      </div>
                    )}
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

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#f6f2ec] truncate">{spot.title}</h4>
                      <p className="text-xs text-[#a89682] truncate mt-0.5">{spot.address}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#28221b]">
                      <div>
                        <span className="text-[10px] text-[#756758] block">Hourly Rate</span>
                        {editingPriceId === spot.id ? (
                          <div className="flex items-center gap-1 mt-1">
                            <input
                              type="number"
                              value={newPrice}
                              onChange={(e) => setNewPrice(Number(e.target.value))}
                              className="w-16 px-2 py-1 text-xs bg-[#100e0d] border border-[#383028] rounded text-[#dfba89]"
                            />
                            <button
                              onClick={() => handleSavePrice(spot.id)}
                              className="px-2 py-1 rounded bg-[#dfba89] text-[#12100e] text-xs font-bold"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-sm font-black text-[#dfba89]">₹{spot.hourly_rate}</span>
                            <button
                              onClick={() => {
                                setEditingPriceId(spot.id);
                                setNewPrice(spot.hourly_rate);
                              }}
                              className="text-[#756758] hover:text-[#dfba89]"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => toggleSpotStatus(spot.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                          spot.is_active
                            ? 'bg-[#201c18] text-[#c2b29d] border-[#383028] hover:text-white'
                            : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {spot.is_active ? 'Set Offline' : 'Set Online'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Earnings & Booking Split Ledger */}
      {activeTab === 'earnings' && (
        <div className="bg-[#181512] rounded-3xl border border-[#383028] p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#28221b]">
            <div>
              <h3 className="font-bold text-base text-[#f6f2ec]">
                Real-Time Booking & Commission Split Ledger
              </h3>
              <p className="text-xs text-[#a89682]">
                Customer payments automatically route 90% payout to spot owner and cut 10% platform commission to company treasury.
              </p>
            </div>
            <div className="text-xs font-semibold text-[#a89682] bg-[#201c18] px-3 py-1.5 rounded-xl border border-[#383028]">
              Platform Fee Cut: <span className="font-bold text-[#dfba89]">{(platformCommissionRate * 100).toFixed(0)}%</span>
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
                    <th className="py-3 px-4">Driver Paid</th>
                    <th className="py-3 px-4">Company Fee Cut</th>
                    <th className="py-3 px-4">Owner Net Payout</th>
                    <th className="py-3 px-4">Gateway & Split Ref</th>
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
                      <td className="py-3 px-4 text-[#dfba89] font-medium font-mono">
                        -₹{b.platform_fee}
                      </td>
                      <td className="py-3 px-4 font-black text-emerald-400 font-mono">
                        +₹{b.host_earnings}
                      </td>
                      <td className="py-3 px-4 text-[10px] font-mono text-[#a89682]">
                        <span className="text-[#dfba89] uppercase font-bold">{b.payment_gateway || 'Razorpay'}</span>
                        <div className="text-[9px] text-[#756758] truncate max-w-[120px]">
                          {b.host_payout_ref || 'IMPS-DIRECT'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Settled
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

      {/* TAB 3: Payout Destination (Bank & UPI Account Settings) */}
      {activeTab === 'payouts' && (
        <div className="bg-[#181512] rounded-3xl border border-[#383028] p-5 sm:p-7 shadow-xl space-y-6 max-w-3xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#28221b]">
            <div>
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-[#dfba89]" />
                <h3 className="font-bold text-base text-[#f6f2ec]">
                  Parking Spot Owner Payout Destination
                </h3>
              </div>
              <p className="text-xs text-[#a89682] mt-1">
                Configure your verified Bank Account or UPI VPA where your 90% parking earnings will be routed automatically.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Direct Route Ready</span>
            </span>
          </div>

          <form onSubmit={handleSavePayoutSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#a89682] uppercase tracking-wider mb-1.5">
                  Account Holder Full Name
                </label>
                <input
                  type="text"
                  required
                  value={payoutForm.account_holder_name}
                  onChange={(e) => setPayoutForm({ ...payoutForm, account_holder_name: e.target.value })}
                  placeholder="e.g. Raj Patel"
                  className="w-full px-3.5 py-2.5 text-xs font-semibold bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#a89682] uppercase tracking-wider mb-1.5">
                  UPI ID (VPA) for Instant Payout
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={payoutForm.upi_id}
                    onChange={(e) => setPayoutForm({ ...payoutForm, upi_id: e.target.value })}
                    placeholder="e.g. owner@okhdfcbank"
                    className="w-full px-3.5 py-2.5 text-xs font-mono font-semibold bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                  />
                  <Smartphone className="w-4 h-4 text-[#dfba89] absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#a89682] uppercase tracking-wider mb-1.5">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  required
                  value={payoutForm.account_number}
                  onChange={(e) => setPayoutForm({ ...payoutForm, account_number: e.target.value })}
                  placeholder="e.g. 501004928192"
                  className="w-full px-3.5 py-2.5 text-xs font-mono font-semibold bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#a89682] uppercase tracking-wider mb-1.5">
                  Bank IFSC Code
                </label>
                <input
                  type="text"
                  required
                  value={payoutForm.ifsc_code}
                  onChange={(e) => setPayoutForm({ ...payoutForm, ifsc_code: e.target.value.toUpperCase() })}
                  placeholder="e.g. HDFC0000123"
                  className="w-full px-3.5 py-2.5 text-xs font-mono font-bold uppercase bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#a89682] uppercase tracking-wider mb-1.5">
                  Bank Name
                </label>
                <input
                  type="text"
                  required
                  value={payoutForm.bank_name}
                  onChange={(e) => setPayoutForm({ ...payoutForm, bank_name: e.target.value })}
                  placeholder="e.g. HDFC Bank Ltd"
                  className="w-full px-3.5 py-2.5 text-xs font-semibold bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                />
              </div>
            </div>

            {/* Auto Payout Checkbox */}
            <div className="p-3.5 rounded-2xl bg-[#201c18] border border-[#383028] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#f6f2ec] block">Instant Automatic Payout</span>
                <span className="text-[11px] text-[#a89682]">
                  Automatically deposit 90% payout on every driver reservation without manual intervention
                </span>
              </div>
              <input
                type="checkbox"
                checked={payoutForm.auto_payout_enabled}
                onChange={(e) => setPayoutForm({ ...payoutForm, auto_payout_enabled: e.target.checked })}
                className="w-4 h-4 accent-[#dfba89] cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-black text-xs shadow-lg shadow-[#dfba89]/20 flex items-center gap-2 cursor-pointer"
              >
                {isSavedPayout ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{isSavedPayout ? 'Saved & Verified!' : 'Save Payout Destination'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Withdraw Modal */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#181512] rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#383028] space-y-4">
            <h4 className="font-bold text-base text-[#f6f2ec]">Withdraw Host Earnings</h4>
            <p className="text-xs text-[#a89682]">
              Available payout balance: <strong className="text-emerald-400 font-black">₹{netEarnings}</strong>.
            </p>
            <div className="p-3 bg-[#201c18] rounded-xl border border-[#383028] text-xs space-y-1">
              <span className="text-[#756758] font-bold uppercase text-[10px]">Verified Destination</span>
              <p className="font-mono font-bold text-[#f6f2ec]">{hostPayoutAccount?.bank_name} •••• {hostPayoutAccount?.account_number?.slice(-4)}</p>
              <p className="text-[11px] text-[#a89682]">UPI: {hostPayoutAccount?.upi_id}</p>
            </div>
            <button
              onClick={() => {
                addToast('Payout Dispatched', `₹${netEarnings} transferred to ${hostPayoutAccount?.bank_name} (${hostPayoutAccount?.upi_id}).`);
                setIsWithdrawOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-black text-xs shadow-md shadow-[#dfba89]/20 transition cursor-pointer"
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
