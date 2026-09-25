'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import AdminDashboard from '@/components/admin/AdminDashboard';
import ToastContainer from '@/components/ui/ToastContainer';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  LogOut, 
  Eye, 
  EyeOff,
  ExternalLink
} from 'lucide-react';

const ADMIN_PASSCODE = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'admin2026';

export default function AdminPage() {
  const { currentUser, setCurrentUser, setActiveRole, allUsers, addToast } = useApp();

  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Check if previously authorized in session
  useEffect(() => {
    try {
      const auth = sessionStorage.getItem('parkable_admin_auth');
      if (auth === 'true' || currentUser?.role === 'admin') {
        setIsAuthenticated(true);
      }
    } catch {}
    setLoading(false);
  }, [currentUser]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (passcode.trim() === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem('parkable_admin_auth', 'true');
      } catch {}

      // Switch active user to Admin persona
      const adminUser = (currentUser?.role === 'admin' ? currentUser : null) ||
        allUsers.find((u) => u.role === 'admin') || {
          id: 'user-admin-main',
          name: 'Administrator',
          email: 'admin@parkease.io',
          role: 'admin',
          avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          rating: 5.0,
          reviews_count: 0,
          created_at: new Date().toISOString(),
        };
      setCurrentUser(adminUser);
      setActiveRole('admin');
      addToast('Admin Authorized', 'Welcome to the Parkable Owner & Admin Portal', 'success');
    } else {
      setErrorMsg('Invalid Master Passcode. Access restricted.');
      addToast('Access Denied', 'Incorrect security key entered.', 'error');
    }
  };

  const handleLockSession = () => {
    try {
      sessionStorage.removeItem('parkable_admin_auth');
    } catch {}
    setIsAuthenticated(false);
    setPasscode('');
    setCurrentUser(null);
    setActiveRole('driver');
    addToast('Admin Session Locked', 'You have securely exited the admin console.', 'info');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0d0c] flex items-center justify-center text-[#a89682] text-sm">
        Verifying security permissions...
      </div>
    );
  }

  // ACCESS LOCKED SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0e0d0c] flex flex-col justify-center items-center p-4 selection:bg-[#dfba89] selection:text-[#12100e]">
        <div className="w-full max-w-md bg-[#181512] border border-[#383028] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Lock Emblem */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#dfba89]/10 border border-[#dfba89]/30 text-[#dfba89] flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#dfba89] bg-[#dfba89]/15 px-2.5 py-0.5 rounded-full border border-[#dfba89]/30">
                Restricted Access
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-[#f6f2ec] mt-2">
                ParkEase Admin Portal
              </h1>
              <p className="text-xs text-[#a89682] mt-1 max-w-xs mx-auto">
                This page is protected and accessible only to authorized platform owners.
              </p>
            </div>
          </div>

          {/* Error notice */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Passcode Form */}
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#a89682] mb-1.5">
                Master Admin Passcode
              </label>
              <div className="relative">
                <input
                  type={showPasscode ? 'text' : 'password'}
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter security key..."
                  className="w-full pl-4 pr-10 py-3 bg-[#100e0d] rounded-xl border border-[#383028] text-[#f6f2ec] text-sm focus:outline-none focus:ring-2 focus:ring-[#dfba89]/30 focus:border-[#dfba89] font-mono placeholder:text-[#756758]"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 top-3 text-[#a89682] hover:text-[#f6f2ec]"
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#dfba89]/15 transition flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Unlock Admin Console</span>
            </button>
          </form>
          <div className="pt-2 border-t border-[#2c251e] text-center">
            <Link
              href="/"
              className="text-xs text-[#756758] hover:text-[#dfba89] font-medium inline-flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Marketplace</span>
            </Link>
          </div>
        </div>

        <ToastContainer />
      </div>
    );
  }

  // AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-[#0e0d0c] text-[#f6f2ec] flex flex-col font-sans">
      {/* Top Admin Secure Navigation Bar */}
      <header className="sticky top-0 z-30 w-full bg-[#141210]/90 backdrop-blur-md border-b border-[#2c251e] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#dfba89] to-[#b37d4e] text-[#12100e] flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-[#f6f2ec] tracking-tight">
                  ParkEase Admin
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-[#dfba89]/15 text-[#dfba89] px-2 py-0.5 rounded border border-[#dfba89]/30">
                  Protected
                </span>
              </div>
              <p className="text-[11px] text-[#a89682]">
                Owner Session: {currentUser?.name || 'Administrator'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#383028] bg-[#201c18] text-[#f6f2ec] hover:border-[#dfba89] text-xs font-semibold transition"
            >
              <span>View Public App</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#dfba89]" />
            </Link>

            <button
              onClick={handleLockSession}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock & Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Dashboard */}
      <main className="flex-1 py-6">
        <AdminDashboard />
      </main>

      <ToastContainer />
    </div>
  );
}
