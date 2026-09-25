'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UserRole } from '@/types';
import { 
  X, 
  Mail, 
  Lock, 
  Check, 
  ArrowRight
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { 
    currentUser, 
    login,
    setCurrentUser, 
    activeRole, 
    setActiveRole, 
    addToast 
  } = useApp();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('driver');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const derivedName = email.split('@')[0];
    const displayName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);

    if (isSupabaseConfigured() && supabase) {
      try {
        if (isRegister) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name: displayName, role: selectedRole },
            },
          });
          if (error) throw error;
          addToast('Account Created!', `Welcome to Parkable, ${displayName}!`);
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          addToast('Welcome back!', `Logged in successfully as ${email}`);
        }
      } catch (err: any) {
        addToast('Authentication Notice', err.message || 'Connecting in offline mode', 'info');
      }
    }

    // Update active profile in AppContext
    const newUser = {
      id: `user-${Date.now()}`,
      name: displayName,
      email: email,
      role: selectedRole,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      rating: 5.0,
      reviews_count: 0,
      created_at: new Date().toISOString(),
    };

    login(newUser);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#181512] rounded-3xl shadow-2xl overflow-hidden border border-[#383028] flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-[#12100e] border-b border-[#2c251e] text-[#f6f2ec] flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-lg text-[#f6f2ec]">
              {isRegister ? 'Join ParkEase' : 'Account & Authentication'}
            </h3>
            <p className="text-xs text-[#a89682] mt-0.5">
              Access your driver bookings or host parking spaces
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#241f1a] hover:bg-[#342d25] text-[#dfba89] flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#a89682] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#756758] absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/40 focus:border-[#dfba89] placeholder:text-[#756758]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#a89682] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#756758] absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/40 focus:border-[#dfba89] placeholder:text-[#756758]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-bold text-xs shadow-lg shadow-[#dfba89]/15 transition flex items-center justify-center gap-2 mt-4"
            >
              <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4 text-[#12100e]" />
            </button>
          </form>

          {/* Toggle register vs login */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs font-semibold text-[#dfba89] hover:underline"
            >
              {isRegister
                ? 'Already have an account? Sign In'
                : "Don't have an account? Create an Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
