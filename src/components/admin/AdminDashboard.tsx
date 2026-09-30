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
  Car,
  Landmark,
  Smartphone,
  Save,
  CheckCircle2,
  Zap,
  ArrowUpRight,
  Wallet,
  CreditCard
} from 'lucide-react';

export default function AdminDashboard() {
  const {
    spots,
    bookings,
    allUsers,
    platformCommissionRate,
    setPlatformCommissionRate,
    companyAccount,
    updateCompanyAccount,
    toggleSpotStatus,
    deleteSpot,
    addToast,
  } = useApp();

  const [commissionInput, setCommissionInput] = useState((platformCommissionRate * 100).toString());
  const [userSearch, setUserSearch] = useState('');
  const [isEditingCompany, setIsEditingCompany] = useState(false);

  const [companyForm, setCompanyForm] = useState({
    company_name: companyAccount?.company_name || 'ParkEase Technologies (Company Account)',
    upi_id: companyAccount?.upi_id || 'parkease.commission@hdfcbank',
    account_number: companyAccount?.account_number || '50200928190281',
    ifsc_code: companyAccount?.ifsc_code || 'HDFC0001092',
    bank_name: companyAccount?.bank_name || 'HDFC Bank Ltd',
  });

  // Calculate Marketplace KPIs
  const totalGMV = bookings.reduce((sum, b) => sum + b.total_amount, 0);
  const totalCommissionEarned = bookings.reduce((sum, b) => sum + (b.company_commission || b.platform_fee || 0), 0);
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

  const handleSaveCompanyAccount = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyAccount(companyForm);
    setIsEditingCompany(false);
    addToast('Company Account Updated', 'Platform commissions will be deposited directly to your company account.');
  };

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 text-[#f6f2ec]">
      {/* Top Banner */}
      <div className="bg-[#181512] text-[#f6f2ec] p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-[#383028]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#dfba89]/15 text-[#dfba89] text-xs font-bold uppercase tracking-wider border border-[#dfba89]/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#dfba89]" />
              <span>Platform Administration & Company Treasury</span>
            </span>
            <span className="flex items-center gap-1 text-[11px] bg-[#241f1a] text-[#dfba89] px-2.5 py-0.5 rounded-full border border-[#383028]">
              <Database className="w-3 h-3 text-[#dfba89]" />
              <span>{isSupabaseConfigured() ? 'Supabase Connected' : 'Local Storage Mode'}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight text-[#f6f2ec]">
            ParkEase Marketplace & Company Account Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#a89682] mt-1 max-w-xl">
            Customer booking payments are split automatically: your company platform cut deposits directly to your company bank account, while spot owners receive their payouts.
          </p>
        </div>

        {/* Commission Rate Quick Adjuster */}
        <form onSubmit={handleUpdateCommission} className="p-3 bg-[#201c18] rounded-2xl border border-[#383028] flex items-center gap-2">
          <div className="flex items-center gap-1.5 pl-2">
            <Percent className="w-4 h-4 text-[#dfba89]" />
            <span className="text-xs font-bold text-[#a89682]">Company Cut:</span>
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
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-bold text-xs shadow transition cursor-pointer"
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
            <span>Company Account Cut</span>
            <div className="p-2 rounded-xl bg-[#241f1a] text-[#dfba89] border border-[#383028]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#dfba89]">
            ₹{totalCommissionEarned.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#756758]">
            Directly credited to your company account
          </p>
        </div>

        {/* Spot Owner Total Payouts */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#181512] border border-[#383028] shadow-lg space-y-1">
          <div className="flex items-center justify-between text-[#a89682] text-xs font-semibold">
            <span>Total Owner Payouts</span>
            <div className="p-2 rounded-xl bg-[#241f1a] text-emerald-400 border border-[#383028]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            ₹{totalHostPayouts.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#756758]">
            Routed automatically to parking spot owners
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
            Total customer payments processed
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
      </div>

      {/* COMPANY ACCOUNT (MY ACCOUNT) & GATEWAYS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Account Card */}
        <div className="lg:col-span-2 bg-[#181512] rounded-3xl border border-[#383028] p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#28221b]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#dfba89]/15 border border-[#dfba89]/30 flex items-center justify-center text-[#dfba89]">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#f6f2ec]">
                  Company Account (My Account)
                </h3>
                <p className="text-xs text-[#a89682]">
                  Your destination bank account for automatic platform commission cuts
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditingCompany(!isEditingCompany)}
              className="px-3 py-1.5 rounded-xl border border-[#383028] bg-[#201c18] hover:bg-[#28211a] text-xs font-bold text-[#dfba89] transition cursor-pointer"
            >
              {isEditingCompany ? 'Cancel' : 'Edit Company Account'}
            </button>
          </div>

          {isEditingCompany ? (
            <form onSubmit={handleSaveCompanyAccount} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#a89682] mb-1">
                    Company Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={companyForm.company_name}
                    onChange={(e) => setCompanyForm({ ...companyForm, company_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:ring-1 focus:ring-[#dfba89]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#a89682] mb-1">
                    Company UPI ID (VPA)
                  </label>
                  <input
                    type="text"
                    required
                    value={companyForm.upi_id}
                    onChange={(e) => setCompanyForm({ ...companyForm, upi_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono font-semibold bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:ring-1 focus:ring-[#dfba89]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#a89682] mb-1">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    required
                    value={companyForm.account_number}
                    onChange={(e) => setCompanyForm({ ...companyForm, account_number: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono font-semibold bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:ring-1 focus:ring-[#dfba89]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#a89682] mb-1">
                    Bank IFSC Code
                  </label>
                  <input
                    type="text"
                    required
                    value={companyForm.ifsc_code}
                    onChange={(e) => setCompanyForm({ ...companyForm, ifsc_code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs font-mono font-bold uppercase bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:ring-1 focus:ring-[#dfba89]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#a89682] mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    required
                    value={companyForm.bank_name}
                    onChange={(e) => setCompanyForm({ ...companyForm, bank_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:ring-1 focus:ring-[#dfba89]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] text-[#12100e] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Company Bank Details</span>
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#201c18] border border-[#383028] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#756758] block">
                  Company Treasury
                </span>
                <span className="text-xs font-bold text-[#f6f2ec] block truncate">
                  {companyAccount?.company_name}
                </span>
                <span className="text-[11px] font-mono text-[#dfba89] block">
                  UPI: {companyAccount?.upi_id}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#201c18] border border-[#383028] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#756758] block">
                  Bank Settlement Account
                </span>
                <span className="text-xs font-mono font-bold text-[#f6f2ec] block">
                  {companyAccount?.bank_name} •••• {companyAccount?.account_number?.slice(-4)}
                </span>
                <span className="text-[11px] font-mono text-[#a89682] block">
                  IFSC: {companyAccount?.ifsc_code}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#201c18] border border-[#383028] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#756758] block">
                  Commission Payout Status
                </span>
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Auto-Deposit Active</span>
                </div>
                <span className="text-[10px] text-[#756758] block">
                  {(platformCommissionRate * 100).toFixed(0)}% per booking cut
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Dual Gateways Status Card */}
        <div className="bg-[#181512] rounded-3xl border border-[#383028] p-5 shadow-xl space-y-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-[#28221b]">
              <Zap className="w-4 h-4 text-[#dfba89]" />
              <h4 className="font-bold text-sm text-[#f6f2ec]">Payment Gateways Status</h4>
            </div>

            <div className="space-y-2.5 mt-3">
              <div className="p-3 rounded-2xl bg-[#201c18] border border-[#383028] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#f6f2ec] block">Razorpay Gateway</span>
                  <span className="text-[10px] text-[#a89682]">UPI, PhonePe, GPay, Cards & Route Split</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  Ready
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#201c18] border border-[#383028] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#f6f2ec] block">Stripe Gateway</span>
                  <span className="text-[10px] text-[#a89682]">Global Cards, Apple Pay, Connect Split</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  Ready
                </span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-[#756758] pt-2 border-t border-[#28221b]">
            Keys configured in <code className="text-[#dfba89]">.env.local</code>. Running in dual-gateway split mode.
          </p>
        </div>
      </div>

      {/* REAL-TIME MARKETPLACE SPLIT & COMMISSION LEDGER */}
      <div className="bg-[#181512] rounded-3xl border border-[#383028] p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#28221b]">
          <div>
            <h3 className="font-bold text-base text-[#f6f2ec]">
              Marketplace Split Settlements (Company vs Owner)
            </h3>
            <p className="text-xs text-[#a89682]">
              Audit trail showing customer paid amounts, company commission cuts, and owner payouts.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#dfba89] bg-[#201c18] px-3 py-1 rounded-xl border border-[#383028]">
            {bookings.length} Total Settlements
          </span>
        </div>

        {bookings.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#756758]">
            No transactions processed yet. When drivers book a spot, settlements will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#12100e] border-b border-[#2c251e] text-[#a89682] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Driver & Vehicle</th>
                  <th className="py-3 px-4">Parking Spot</th>
                  <th className="py-3 px-4">Customer Paid</th>
                  <th className="py-3 px-4">Company Cut (My Account)</th>
                  <th className="py-3 px-4">Owner Payout</th>
                  <th className="py-3 px-4">Gateway & Settlement Ref</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#241f1a]">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#201c18]/60 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#dfba89]">
                      {b.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#f6f2ec]">{b.driver_name}</div>
                      <div className="font-mono text-[11px] text-[#756758]">{b.vehicle_plate}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate font-medium text-[#f6f2ec]">
                      {b.spot_title}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#f6f2ec]">
                      ₹{b.total_amount}
                    </td>
                    <td className="py-3 px-4 font-black text-[#dfba89] font-mono">
                      +₹{b.company_commission || b.platform_fee}
                    </td>
                    <td className="py-3 px-4 font-black text-emerald-400 font-mono">
                      ₹{b.host_earnings}
                    </td>
                    <td className="py-3 px-4 text-[10px] font-mono text-[#a89682]">
                      <span className="text-[#dfba89] font-bold uppercase">{b.payment_gateway || 'Razorpay'}</span>
                      <div className="text-[9px] text-[#756758] truncate max-w-[120px]">
                        {b.company_credit_ref || 'COMM-DIRECT'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Instant Settled
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
                    className="p-1.5 text-[#756758] hover:text-rose-400 transition cursor-pointer"
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
