'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UserRole, UserProfile } from '@/types';
import ToastContainer from '@/components/ui/ToastContainer';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  ShieldCheck, 
  AlertCircle,
  ArrowRight,
  LogOut,
  Car
} from 'lucide-react';
import { getAssetUrl } from '@/lib/assets';
import SocialAuthModal from '@/components/auth/SocialAuthModal';
import GoogleSetupModal from '@/components/auth/GoogleSetupModal';
import { getGoogleClientId, triggerOfficialGoogleSignIn } from '@/lib/googleAuth';

export default function LoginPage() {
  const router = useRouter();
  const { 
    currentUser, 
    isAuthenticated, 
    isLoadingAuth, 
    login, 
    logout, 
    addToast 
  } = useApp();

  const [tab, setTab] = useState<'signin' | 'signup'>('signup');
  const [role, setRole] = useState<UserRole>('driver');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Social authentication modal states
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [socialProvider, setSocialProvider] = useState<'Google' | 'Github'>('Google');
  const [googleSetupOpen, setGoogleSetupOpen] = useState(false);

  const handleGoToApp = () => {
    router.push('/');
  };

  const handleOpenSocialModal = (provider: 'Google' | 'Github') => {
    setSocialProvider(provider);
    if (provider === 'Google') {
      const activeClientId = getGoogleClientId();
      if (activeClientId) {
        // Trigger official Google One-Tap / Sign-In popup
        triggerOfficialGoogleSignIn(
          activeClientId,
          (googleUser) => {
            const userProfile: UserProfile = {
              id: `user-${googleUser.sub || Date.now()}`,
              name: googleUser.name,
              email: googleUser.email,
              role: role,
              avatar_url: googleUser.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${googleUser.email}`,
              rating: 5.0,
              reviews_count: 0,
              created_at: new Date().toISOString(),
            };
            login(userProfile);
            addToast('Official Google Sign-In', `Welcome back, ${googleUser.name}!`, 'success');
            router.push('/');
          },
          (err) => {
            console.warn('Google Identity Services notice:', err);
            // Fallback to verified account chooser if popup was blocked/dismissed
            setSocialModalOpen(true);
          }
        );
      } else {
        // Client ID not yet configured: open setup modal with instructions & demo fallback
        setGoogleSetupOpen(true);
      }
    } else {
      setSocialModalOpen(true);
    }
  };

  const handleSocialSuccess = (userProfile: UserProfile) => {
    login(userProfile);
    addToast('Authenticated', `Signed in as ${userProfile.name} (${socialProvider})`, 'success');
    router.push('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const computedName = tab === 'signup' && firstName.trim() 
        ? `${firstName.trim()} ${lastName.trim()}`.trim()
        : email.split('@')[0].replace(/^\w/, (c) => c.toUpperCase());

      // Device credential validation for fixed passwords
      const STORAGE_KEY_PASSWORDS = 'parkable_account_passwords_v1';
      let storedPasswords: Record<string, string> = {};
      try {
        const raw = localStorage.getItem(STORAGE_KEY_PASSWORDS);
        if (raw) storedPasswords = JSON.parse(raw);
      } catch {}

      const normalizedEmail = email.trim().toLowerCase();

      if (tab === 'signin') {
        if (storedPasswords[normalizedEmail] && storedPasswords[normalizedEmail] !== password) {
          throw new Error('Incorrect password for this account. Please retry.');
        } else if (!storedPasswords[normalizedEmail]) {
          storedPasswords[normalizedEmail] = password;
          try {
            localStorage.setItem(STORAGE_KEY_PASSWORDS, JSON.stringify(storedPasswords));
          } catch {}
        }
      } else {
        if (storedPasswords[normalizedEmail] && storedPasswords[normalizedEmail] !== password) {
          throw new Error('An account with this email already exists with a different password. Please enter the correct password.');
        } else {
          storedPasswords[normalizedEmail] = password;
          try {
            localStorage.setItem(STORAGE_KEY_PASSWORDS, JSON.stringify(storedPasswords));
          } catch {}
        }
      }

      if (isSupabaseConfigured() && supabase) {
        if (tab === 'signup') {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name: computedName, role },
            },
          });
          if (error) throw error;
        } else {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
        }
      }

      // Populate local user profile in AppContext
      const userProfile = {
        id: `user-${Date.now()}`,
        name: computedName,
        email: email,
        role: role,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        rating: 5.0,
        reviews_count: 0,
        created_at: new Date().toISOString(),
      };

      login(userProfile);
      addToast(
        tab === 'signup' ? 'Welcome to Parkable!' : 'Logged In',
        `Authenticated as ${userProfile.name} (${role.toUpperCase()})`,
        'success'
      );
      router.push('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
      addToast('Auth Error', err.message || 'Failed to authenticate', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#0e0d0c] flex flex-col items-center justify-center text-[#f6f2ec]">
        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#dfba89]/40 bg-[#12100e] shadow-xl shadow-[#dfba89]/20 flex items-center justify-center p-1 mb-4 animate-pulse">
          <img
            src={getAssetUrl('/logos/shield-icon.jpg')}
            alt="Parkable Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <p className="text-sm font-semibold tracking-wide text-[#a89682]">Verifying session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0d0c] text-[#f6f2ec] flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden font-sans selection:bg-[#dfba89] selection:text-[#12100e]">
      {/* Warm Desert Titanium Ambient Background Vignette & Glows */}
      <div className="absolute top-1/4 -left-32 w-[550px] h-[550px] bg-[#dfba89]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 -right-32 w-[550px] h-[550px] bg-[#b37d4e]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* LEFT COLUMN: Desert Titanium Aurora Showcase & Step Flow */}
        <div className="lg:col-span-6 relative overflow-hidden rounded-[32px] border border-[#dfba89]/25 bg-[#14110e]/95 p-8 sm:p-12 flex flex-col justify-between min-h-[570px] shadow-2xl shadow-black/80 backdrop-blur-xl">
          
          {/* Radiant Desert Titanium Champagne/Gold Aurora Bloom */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[360px] bg-gradient-to-b from-[#dfba89]/40 via-[#b37d4e]/20 to-transparent blur-3xl pointer-events-none rounded-full" />
          <div className="absolute top-0 inset-x-0 h-56 bg-gradient-to-b from-[#dfba89]/20 via-[#b37d4e]/5 to-transparent pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10 pt-1">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-xl overflow-hidden border border-[#dfba89]/50 bg-[#12100e] shrink-0 shadow-md shadow-[#dfba89]/20 flex items-center justify-center p-0.5">
                <img 
                  src={getAssetUrl('/logos/shield-icon.jpg')} 
                  alt="Parkable" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-black text-lg text-[#f6f2ec] tracking-tight">Parkable</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#f6f2ec] tracking-tight leading-[1.15]">
              Get Started with Us
            </h1>
            <p className="text-sm sm:text-base text-[#a89682] mt-3 max-w-md leading-relaxed font-normal">
              Complete these easy steps to register your account.
            </p>
          </div>

          {/* Step Indicators */}
          <div className="relative z-10 space-y-3.5 pt-10">
            {/* Step 1: Active (Desert Titanium Gold Gradient) */}
            <div className="bg-gradient-to-r from-[#f3dfc6] via-[#dfba89] to-[#d4a373] text-[#12100e] rounded-2xl px-5 py-4 flex items-center gap-3.5 shadow-xl shadow-[#dfba89]/20 transition-transform duration-200">
              <div className="w-6 h-6 rounded-full bg-[#12100e] text-[#dfba89] text-xs font-black flex items-center justify-center shrink-0 shadow-xs">
                1
              </div>
              <span className="text-sm font-bold tracking-tight text-[#12100e]">
                {tab === 'signup' ? 'Sign up your account' : 'Sign in to your account'}
              </span>
            </div>

            {/* Step 2 */}
            <div className="bg-[#1a1612]/90 border border-[#dfba89]/15 text-[#a89682] rounded-2xl px-5 py-4 flex items-center gap-3.5">
              <div className="w-6 h-6 rounded-full bg-[#27211b] text-[#a89682] text-xs font-bold flex items-center justify-center shrink-0 border border-[#383028]">
                2
              </div>
              <span className="text-sm font-medium">Set up your workspace</span>
            </div>

            {/* Step 3 */}
            <div className="bg-[#1a1612]/90 border border-[#dfba89]/15 text-[#a89682] rounded-2xl px-5 py-4 flex items-center gap-3.5">
              <div className="w-6 h-6 rounded-full bg-[#27211b] text-[#a89682] text-xs font-bold flex items-center justify-center shrink-0 border border-[#383028]">
                3
              </div>
              <span className="text-sm font-medium">Set up your profile</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sign Up / Sign In Form */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          
          {/* Active Session Notification if already logged in */}
          {isAuthenticated && currentUser ? (
            <div className="bg-[#181512]/95 border border-[#383028] rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl shadow-black/80 backdrop-blur-xl">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-[#100e0d] mx-auto border-2 border-[#dfba89] shadow-lg shadow-[#dfba89]/20">
                  <img
                    src={currentUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-[#f6f2ec]">{currentUser.name}</h3>
                <p className="text-xs text-[#a89682]">{currentUser.email}</p>
                <span className="inline-block text-[11px] font-mono uppercase font-bold tracking-wider text-[#dfba89] bg-[#dfba89]/10 px-3 py-1 rounded-full border border-[#dfba89]/25">
                  {currentUser.role} Account Active
                </span>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleGoToApp}
                  className="w-full bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-bold py-3.5 rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#dfba89]/25"
                >
                  <span>Continue to Parking Map</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={logout}
                  className="w-full bg-[#141210] hover:bg-[#201b16] text-[#c2b29d] font-semibold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 border border-[#383028] cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Switch Account / Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Form Heading */}
              <div className="space-y-1.5">
                <h2 className="text-2xl sm:text-3xl font-black text-[#f6f2ec] tracking-tight">
                  {tab === 'signup' ? 'Sign Up Account' : 'Welcome Back'}
                </h2>
                <p className="text-xs sm:text-sm text-[#a89682]">
                  {tab === 'signup' 
                    ? 'Enter your personal data to create your account.' 
                    : 'Enter your credentials to access your parking dashboard.'}
                </p>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenSocialModal('Google')}
                  className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-[#161310] border border-[#383028] hover:bg-[#201b16] hover:border-[#dfba89]/40 text-[#f6f2ec] text-xs font-semibold transition cursor-pointer group shadow-sm"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.28-2.1 3.66-5.2 3.66-9.12z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"/>
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenSocialModal('Github')}
                  className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-[#161310] border border-[#383028] hover:bg-[#201b16] hover:border-[#dfba89]/40 text-[#f6f2ec] text-xs font-semibold transition cursor-pointer group shadow-sm"
                >
                  <svg className="w-4 h-4 fill-[#f6f2ec] shrink-0" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                  <span>Github</span>
                </button>
              </div>

              {/* Or Divider */}
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-[#2e2620]" />
                <span className="absolute bg-[#0e0d0c] px-3 text-xs text-[#a89682] font-medium">Or</span>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-[#351c1c] border border-[#e08272]/30 text-[#e08272] text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#e08272]" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Names (In Sign Up Mode) */}
                {tab === 'signup' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#c2b29d] mb-2">First Name</label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="eg. John"
                        className="w-full bg-[#161310] border border-[#383028] focus:border-[#dfba89] focus:ring-1 focus:ring-[#dfba89]/40 rounded-xl px-4 py-3 text-sm text-[#f6f2ec] placeholder:text-[#6e6052] outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#c2b29d] mb-2">Last Name</label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="eg. Francisco"
                        className="w-full bg-[#161310] border border-[#383028] focus:border-[#dfba89] focus:ring-1 focus:ring-[#dfba89]/40 rounded-xl px-4 py-3 text-sm text-[#f6f2ec] placeholder:text-[#6e6052] outline-none transition"
                      />
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-xs font-bold text-[#c2b29d] mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="eg. johnfrans@gmail.com"
                    className="w-full bg-[#161310] border border-[#383028] focus:border-[#dfba89] focus:ring-1 focus:ring-[#dfba89]/40 rounded-xl px-4 py-3 text-sm text-[#f6f2ec] placeholder:text-[#6e6052] outline-none transition"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-bold text-[#c2b29d] mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-[#161310] border border-[#383028] focus:border-[#dfba89] focus:ring-1 focus:ring-[#dfba89]/40 rounded-xl px-4 py-3 pr-11 text-sm text-[#f6f2ec] placeholder:text-[#6e6052] outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-[#8a7a6b] hover:text-[#dfba89] transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#8a7a6b] mt-1.5 font-medium">
                    Must be at least 8 characters.
                  </p>
                </div>


                {/* Submit Button (Brushed Titanium Gold) */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-black py-3.5 rounded-xl text-sm transition cursor-pointer shadow-lg shadow-[#dfba89]/25 disabled:opacity-50 mt-2"
                >
                  {loading ? 'Please wait...' : tab === 'signup' ? 'Sign Up' : 'Log In'}
                </button>
              </form>

              {/* Toggle Sign Up / Log In */}
              <div className="text-center text-xs text-[#a89682] pt-1">
                {tab === 'signup' ? (
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setTab('signin');
                        setErrorMsg('');
                      }}
                      className="text-[#dfba89] font-bold hover:underline hover:text-[#f3dfc6] cursor-pointer ml-1"
                    >
                      Log in
                    </button>
                  </p>
                ) : (
                  <p>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setTab('signup');
                        setErrorMsg('');
                      }}
                      className="text-[#dfba89] font-bold hover:underline hover:text-[#f3dfc6] cursor-pointer ml-1"
                    >
                      Sign Up
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      <SocialAuthModal
        isOpen={socialModalOpen}
        onClose={() => setSocialModalOpen(false)}
        provider={socialProvider}
        onSuccess={handleSocialSuccess}
        role={role}
      />

      <GoogleSetupModal
        isOpen={googleSetupOpen}
        onClose={() => setGoogleSetupOpen(false)}
        onSaveAndConnect={(clientId) => {
          setGoogleSetupOpen(false);
          handleOpenSocialModal('Google');
        }}
        onUseFallbackDemo={() => {
          setGoogleSetupOpen(false);
          setSocialModalOpen(true);
        }}
      />

      <ToastContainer />
    </div>
  );
}
