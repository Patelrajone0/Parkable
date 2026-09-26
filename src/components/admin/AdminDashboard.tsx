'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { 
  ShieldCheck, 
  DollarSign, 
  Users, 
  Building2, 
  Percent, 
  TrendingUp, 
  CheckCircle, 
  Database, 
  Power,
  Trash2,
  Lock,
  Search,
  Car
} from 'lucide-react';

export default function AdminDashboard() {
  const {
    spots,
    bookings,
    allUsers,
    platformCommissionRate,
    setPlatformCommissionRate,
    toggleSpotStatus,
    deleteSpot,
    addToast,
  } = useApp();

  const [commissionInput, setCommissionInput] = useState((platformCommissionRate * 100).toString());
  const [userSearch, setUserSearch] = useState('');

  // Calculate Marketplace KPIs
  const totalGMV = bookings.reduce((sum, b) => sum + b.total_amount, 0);
  const totalCommissionEarned = bookings.reduce((sum, b) => sum + b.platform_fee, 0);
  const totalHostPayouts = bookings.reduce((sum, b) => sum + b.host_earnings, 0);
  const activeSpotsCount = spots.filter((s) => s.is_active).length;
  const activeBookingsCount = bookings.filter((b) => b.status === 'active').length;

  const handleUpdateCommission = (e: React.FormEvent) => {
    e.preventDefault();
    const rateVal = parseFloat(commissionInput);
    if (!isNaN(rateVal) && rateVal >= 0 && rateVal <= 50) {
      setPlatformCommissionRate(rateVal / 100);
      addToast('Commission Updated', `Platform service fee set to ${rateVal}% for all future bookings.`);
    } else {
      addToast('Invalid Rate', 'Commission must be between 0% and 50%.', 'error');
    }
  };

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#181512] text-[#f6f2ec] p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-[#383028]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#dfba89]/15 text-[#dfba89] text-xs font-bold uppercase tracking-wider border border-[#dfba89]/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#dfba89]" />
              <span>Platform Administration</span>
            </span>
            <span className="flex items-center gap-1 text-[11px] bg-[#241f1a] text-[#dfba89] px-2.5 py-0.5 rounded-full border border-[#383028]">
              <Database className="w-3 h-3 text-[#dfba89]" />
              <span>{isSupabaseConfigured() ? 'Supabase Connected' : 'Local Storage Mode'}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight text-[#f6f2ec]">
            ParkEase Marketplace Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#a89682] mt-1 max-w-xl">
            Monitor transaction volumes, platform commission take-rates, parking supply, and user accounts.
          </p>
        </div>

        {/* Commission Rate Quick Adjuster */}
        <form onSubmit={handleUpdateCommission} className="p-3 bg-[#201c18] rounded-2xl border border-[#383028] flex items-center gap-2">
          <div className="flex items-center gap-1.5 pl-2">
            <Percent className="w-4 h-4 text-[#dfba89]" />
            <span className="text-xs font-bold text-[#a89682]">Take Rate:</span>
          </div>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="50"
              step="1"
              value={commissionInput}
              onChange={(e) => setCommissionInput(e.target.value)}
              className="w-16 px-2 py-1 text-center font-bold text-xs bg-[#100e0d] border border-[#383028] rounded-lg text-[#dfba89] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/30"
            />
            <span className="absolute right-2 top-1 text-xs text-[#756758]">%</span>
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-bold text-xs shadow transition"
          >
            Update
          </button>
        </form>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Platform Revenue (Commissions) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#181512] border border-[#383028] shadow-lg space-y-1">
          <div className="flex items-center justify-between text-[#a89682] text-xs font-semibold">
            <span>Platform Commission</span>
            <div className="p-2 rounded-xl bg-[#241f1a] text-[#dfba89] border border-[#383028]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#dfba89]">
            ₹{totalCommissionEarned.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#756758]">
            Based on {(platformCommissionRate * 100).toFixed(0)}% platform take rate
          </p>
        </div>

        {/* Gross Merchandise Value (GMV) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#181512] border border-[#383028] shadow-lg space-y-1">
          <div className="flex items-center justify-between text-[#a89682] text-xs font-semibold">
            <span>Marketplace GMV</span>
            <div className="p-2 rounded-xl bg-[#241f1a] text-[#dfba89] border border-[#383028]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#f6f2ec]">
            ₹{totalGMV.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#756758]">
            Total transactions processed
          </p>
        </div>

        {/* Total Listed Spots */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#181512] border border-[#383028] shadow-lg space-y-1">
          <div className="flex items-center justify-between text-[#a89682] text-xs font-semibold">
            <span>Total Spaces Supply</span>
            <div className="p-2 rounded-xl bg-[#241f1a] text-[#dfba89] border border-[#383028]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#f6f2ec]">
            {spots.length}
          </div>
          <p className="text-[11px] text-[#dfba89] font-semibold">
            {activeSpotsCount} active spots
          </p>
        </div>

        {/* Active Driver Bookings */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#181512] border border-[#383028] shadow-lg space-y-1">
          <div className="flex items-center justify-between text-[#a89682] text-xs font-semibold">
            <span>Active Reservations</span>
            <div className="p-2 rounded-xl bg-[#241f1a] text-[#dfba89] border border-[#383028]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#f6f2ec]">
            {activeBookingsCount}
          </div>
          <p className="text-[11px] text-[#756758]">
            {bookings.length} total lifetime bookings
          </p>
        </div>
      </div>

      {/* Grid: Spots Management & User Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* All Spots Inspector */}
        <div className="bg-[#181512] rounded-3xl border border-[#383028] shadow-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#f6f2ec]">
              All Parking Spaces ({spots.length})
            </h3>
            <span className="text-xs text-[#a89682]">Moderate Listings</span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {spots.map((spot) => (
              <div
                key={spot.id}
                className="p-3 rounded-2xl bg-[#201c18] border border-[#2c251e] flex items-center justify-between gap-3 text-xs"
              >
                {spot.photos && spot.photos.length > 0 ? (
                  <img
                    src={spot.photos[0]}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#383028]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl shrink-0 border border-[#383028] bg-[#100e0d] flex items-center justify-center text-[#dfba89]">
                    <Car className="w-5 h-5 opacity-80" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#f6f2ec] truncate">{spot.title}</div>
                  <div className="text-[11px] text-[#a89682] truncate">{spot.address}</div>
                  <div className="text-[10px] text-[#dfba89] font-semibold mt-0.5">
                    ₹{spot.hourly_rate}/hr • {spot.vehicle_size} • Host: {spot.host_name}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleSpotStatus(spot.id)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition border ${
                      spot.is_active
                        ? 'bg-[#dfba89]/15 text-[#dfba89] border-[#dfba89]/30'
                        : 'bg-[#2a241f] text-[#756758] border-[#383028]'
                    }`}
                  >
                    {spot.is_active ? 'Online' : 'Offline'}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete spot permanently?')) {
                        deleteSpot(spot.id);
                      }
                    }}
                    className="p-1.5 text-[#756758] hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Accounts Management */}
        <div className="bg-[#181512] rounded-3xl border border-[#383028] shadow-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#f6f2ec]">Platform Users & Roles</h3>
            <div className="relative">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user..."
                className="pl-7 pr-3 py-1.5 bg-[#100e0d] text-[#f6f2ec] rounded-xl text-xs border border-[#383028] focus:outline-none focus:ring-1 focus:ring-[#dfba89]/40 placeholder:text-[#756758]"
              />
              <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-[#756758]" />
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className="p-3 rounded-2xl bg-[#201c18] border border-[#2c251e] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatar_url}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#383028]"
                  />
                  <div>
                    <div className="font-bold text-[#f6f2ec]">{u.name}</div>
                    <div className="text-[11px] text-[#a89682]">{u.email}</div>
                  </div>
                </div>

                <div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      u.role === 'admin'
                        ? 'bg-[#dfba89]/15 text-[#dfba89] border-[#dfba89]/30'
                        : u.role === 'host'
                        ? 'bg-[#d4a373]/15 text-[#d4a373] border-[#d4a373]/30'
                        : 'bg-[#241f1a] text-[#a89682] border-[#383028]'
                    }`}
                  >
                    {u.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
