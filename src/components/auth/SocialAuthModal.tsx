'use client';

import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  X, 
  ArrowLeft, 
  AlertCircle, 
  UserPlus, 
  ShieldCheck, 
  Lock, 
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { UserProfile, UserRole } from '@/types';

export interface SavedSocialAccount {
  provider: 'Google' | 'Github';
  name: string;
  email: string;
  avatar_url?: string;
  password: string; // Fixed stored password for this account on this device
  lastUsed: string;
}

interface SocialAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: 'Google' | 'Github';
  onSuccess: (user: UserProfile) => void;
  role?: UserRole;
}

const STORAGE_KEY_SOCIAL_ACCOUNTS = 'parkable_saved_social_accounts_v2';

export default function SocialAuthModal({
  isOpen,
  onClose,
  provider,
  onSuccess,
  role = 'driver',
}: SocialAuthModalProps) {
  const [accounts, setAccounts] = useState<SavedSocialAccount[]>([]);
  const [view, setView] = useState<'choose' | 'enter_password' | 'add_account'>('choose');
  const [selectedAccount, setSelectedAccount] = useState<SavedSocialAccount | null>(null);

  // Form states for password or adding new account
  const [inputName, setInputName] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved accounts from localStorage on modal open
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setInputPassword('');
      setShowPassword(false);
      try {
        const stored = localStorage.getItem(STORAGE_KEY_SOCIAL_ACCOUNTS);
        let list: SavedSocialAccount[] = stored ? JSON.parse(stored) : [];

        // If no accounts yet on this device, add the default device user as a convenient preset
        if (list.length === 0) {
          list = [
            {
              provider: 'Google',
              name: 'Raj Patel',
              email: 'patelrajone0@gmail.com',
              avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=patelrajone0@gmail.com',
              password: 'password123',
              lastUsed: new Date().toISOString(),
            },
            {
              provider: 'Github',
              name: 'Patelrajone0',
              email: 'patelrajone0@github.com',
              avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Patelrajone0',
              password: 'password123',
              lastUsed: new Date().toISOString(),
            },
          ];
          localStorage.setItem(STORAGE_KEY_SOCIAL_ACCOUNTS, JSON.stringify(list));
        }

        setAccounts(list);

        // Filter accounts matching current provider
        const matching = list.filter((a) => a.provider === provider);
        if (matching.length === 1) {
          // If only 1 account exists for this provider, go straight to password confirmation
          setSelectedAccount(matching[0]);
          setView('enter_password');
        } else if (matching.length > 1) {
          setView('choose');
        } else {
          // No account for this provider yet -> direct to add account
          setView('add_account');
          setInputEmail(provider === 'Google' ? 'user@gmail.com' : 'user@github.com');
          setInputName('');
        }
      } catch {
        setView('add_account');
      }
    }
  }, [isOpen, provider]);

  if (!isOpen) return null;

  const providerAccounts = accounts.filter((a) => a.provider === provider);

  // Select an existing account from the list
  const handleSelectAccount = (account: SavedSocialAccount) => {
    setSelectedAccount(account);
    setInputPassword('');
    setErrorMsg('');
    setView('enter_password');
  };

  // Switch to "Add another account"
  const handleStartAddAccount = () => {
    setSelectedAccount(null);
    setInputName('');
    setInputEmail('');
    setInputPassword('');
    setErrorMsg('');
    setView('add_account');
  };

  // Remove a saved account from device
  const handleRemoveAccount = (e: React.MouseEvent, emailToRemove: string) => {
    e.stopPropagation();
    const updated = accounts.filter((a) => a.email !== emailToRemove);
    setAccounts(updated);
    try {
      localStorage.setItem(STORAGE_KEY_SOCIAL_ACCOUNTS, JSON.stringify(updated));
    } catch {}
    if (selectedAccount?.email === emailToRemove) {
      setSelectedAccount(null);
      setView('choose');
    }
  };

  // Submit Password for existing account
  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    setErrorMsg('');
    setIsSubmitting(true);

    setTimeout(() => {
      // Check if password matches the stored password for this account
      if (inputPassword !== selectedAccount.password) {
        setErrorMsg('Wrong password. Please enter the correct password and retry.');
        setIsSubmitting(false);
        return;
      }

      // Password matches! Update lastUsed timestamp
      const updatedAccounts = accounts.map((acc) =>
        acc.email === selectedAccount.email
          ? { ...acc, lastUsed: new Date().toISOString() }
          : acc
      );
      try {
        localStorage.setItem(STORAGE_KEY_SOCIAL_ACCOUNTS, JSON.stringify(updatedAccounts));
      } catch {}

      const userProfile: UserProfile = {
        id: `user-${Date.now()}`,
        name: selectedAccount.name,
        email: selectedAccount.email,
        role: role,
        avatar_url: selectedAccount.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedAccount.email}`,
        rating: 5.0,
        reviews_count: 0,
        created_at: new Date().toISOString(),
      };

      setIsSubmitting(false);
      onSuccess(userProfile);
      onClose();
    }, 400);
  };

  // Submit and save a NEW account on device
  const handleSaveAndSignInNewAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedEmail = inputEmail.trim().toLowerCase();
    const trimmedName = inputName.trim() || trimmedEmail.split('@')[0];

    if (!trimmedEmail || !inputPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (inputPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    // Check if this account already exists in storage
    const existing = accounts.find((a) => a.email.toLowerCase() === trimmedEmail);
    if (existing) {
      // If it exists, check if password matches
      if (existing.password !== inputPassword) {
        setErrorMsg('This account is already registered on this device with a different password. Please enter the correct fixed password.');
        return;
      }
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newAccount: SavedSocialAccount = {
        provider,
        name: trimmedName,
        email: trimmedEmail,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${trimmedEmail}`,
        password: inputPassword, // Permanently fixed password on device for this account
        lastUsed: new Date().toISOString(),
      };

      const updatedList = existing
        ? accounts.map((a) => (a.email.toLowerCase() === trimmedEmail ? newAccount : a))
        : [newAccount, ...accounts];

      setAccounts(updatedList);
      try {
        localStorage.setItem(STORAGE_KEY_SOCIAL_ACCOUNTS, JSON.stringify(updatedList));
      } catch {}

      const userProfile: UserProfile = {
        id: `user-${Date.now()}`,
        name: newAccount.name,
        email: newAccount.email,
        role: role,
        avatar_url: newAccount.avatar_url,
        rating: 5.0,
        reviews_count: 0,
        created_at: new Date().toISOString(),
      };

      setIsSubmitting(false);
      onSuccess(userProfile);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#181512] border border-[#383028] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black text-[#f6f2ec] overflow-hidden">
        
        {/* Subtle provider ambient aura */}
        <div 
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 blur-3xl pointer-events-none rounded-full opacity-30 ${
            provider === 'Google' ? 'bg-[#dfba89]' : 'bg-[#dfba89]'
          }`} 
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#201c18] hover:bg-[#2b241e] text-[#a89682] hover:text-[#f6f2ec] flex items-center justify-center transition border border-[#383028] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#12100e] border border-[#dfba89]/30 flex items-center justify-center mx-auto shadow-md">
            {provider === 'Google' ? (
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.28-2.1 3.66-5.2 3.66-9.12z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"/>
              </svg>
            ) : (
              <svg className="w-6 h-6 fill-[#f6f2ec]" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            )}
          </div>
          <h3 className="text-xl font-black text-[#f6f2ec] tracking-tight">
            Sign in with {provider}
          </h3>
          <p className="text-xs text-[#a89682]">
            to continue to <span className="font-bold text-[#dfba89]">Parkable</span>
          </p>
        </div>

        {/* ERROR NOTICE */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[#351c1c] border border-[#e08272]/30 text-[#e08272] text-xs flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-tight">{errorMsg}</span>
          </div>
        )}

        {/* VIEW 1: CHOOSE AN ACCOUNT */}
        {view === 'choose' && (
          <div className="space-y-4">
            <div className="text-xs font-bold text-[#c2b29d] tracking-wide mb-1">
              Choose an account on this device:
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {providerAccounts.map((account) => (
                <div
                  key={account.email}
                  onClick={() => handleSelectAccount(account)}
                  className="group flex items-center justify-between p-3 rounded-2xl bg-[#141210] hover:bg-[#201b16] border border-[#383028] hover:border-[#dfba89]/40 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#241f1a] border border-[#dfba89]/30 shrink-0">
                      <img
                        src={account.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${account.email}`}
                        alt={account.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#f6f2ec] truncate group-hover:text-[#dfba89] transition">
                        {account.name}
                      </p>
                      <p className="text-[11px] text-[#a89682] truncate">
                        {account.email}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    title="Remove from device"
                    onClick={(e) => handleRemoveAccount(e, account.email)}
                    className="p-1.5 text-[#5e5347] hover:text-[#e08272] hover:bg-[#351c1c] rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Use Another Account Button */}
            <button
              type="button"
              onClick={handleStartAddAccount}
              className="w-full py-3 px-4 rounded-2xl bg-[#141210] hover:bg-[#201b16] border border-dashed border-[#383028] hover:border-[#dfba89]/50 text-xs font-semibold text-[#c2b29d] hover:text-[#f6f2ec] flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#dfba89]" />
              <span>Use another account / Add account</span>
            </button>
          </div>
        )}

        {/* VIEW 2: ENTER PASSWORD FOR SELECTED ACCOUNT */}
        {view === 'enter_password' && selectedAccount && (
          <form onSubmit={handleVerifyPassword} className="space-y-4">
            {/* Selected Account Chip with Switcher */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#141210] border border-[#383028]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-[#241f1a] border border-[#dfba89]/30 shrink-0">
                  <img
                    src={selectedAccount.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedAccount.email}`}
                    alt={selectedAccount.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#f6f2ec] truncate">{selectedAccount.name}</p>
                  <p className="text-[11px] text-[#a89682] truncate">{selectedAccount.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setView('choose')}
                className="text-[11px] font-bold text-[#dfba89] hover:underline px-2 py-1 cursor-pointer"
              >
                Switch
              </button>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#c2b29d]">
                Enter Password
              </label>
              <p className="text-[11px] text-[#8a7a6b]">
                Enter the verified password for this account.
              </p>
              <div className="relative pt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#141210] border border-[#383028] focus:border-[#dfba89] focus:ring-1 focus:ring-[#dfba89]/40 rounded-xl px-4 py-3 pr-11 text-sm text-[#f6f2ec] placeholder:text-[#6e6052] outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-4 text-[#8a7a6b] hover:text-[#dfba89] transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setView('choose')}
                className="w-1/3 py-3 rounded-xl bg-[#141210] hover:bg-[#201b16] text-[#a89682] hover:text-[#f6f2ec] text-xs font-bold transition border border-[#383028] cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !inputPassword}
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] text-xs font-black transition cursor-pointer shadow-lg shadow-[#dfba89]/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Verifying...' : 'Sign In'}
              </button>
            </div>
          </form>
        )}

        {/* VIEW 3: ADD / REGISTER NEW ACCOUNT ON THIS DEVICE */}
        {view === 'add_account' && (
          <form onSubmit={handleSaveAndSignInNewAccount} className="space-y-3.5">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-[#c2b29d]">Add New {provider} Account</span>
              {providerAccounts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setView('choose')}
                  className="text-xs text-[#dfba89] hover:underline cursor-pointer"
                >
                  View Saved
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#c2b29d] mb-1">
                Display Name (Optional)
              </label>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="e.g. Raj Patel"
                className="w-full bg-[#141210] border border-[#383028] focus:border-[#dfba89] rounded-xl px-4 py-2.5 text-xs text-[#f6f2ec] placeholder:text-[#6e6052] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#c2b29d] mb-1">
                {provider} Email Address
              </label>
              <input
                type="email"
                required
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                placeholder={provider === 'Google' ? 'you@gmail.com' : 'you@github.com'}
                className="w-full bg-[#141210] border border-[#383028] focus:border-[#dfba89] rounded-xl px-4 py-2.5 text-xs text-[#f6f2ec] placeholder:text-[#6e6052] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#c2b29d] mb-1">
                Account Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  placeholder="Create fixed password for this account"
                  className="w-full bg-[#141210] border border-[#383028] focus:border-[#dfba89] rounded-xl px-4 py-2.5 pr-10 text-xs text-[#f6f2ec] placeholder:text-[#6e6052] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#8a7a6b] hover:text-[#dfba89]"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-[#8a7a6b] mt-1 font-medium">
                🔒 This password is saved on this device. Future sign-ins will require this exact password.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              {providerAccounts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setView('choose')}
                  className="w-1/3 py-2.5 rounded-xl bg-[#141210] hover:bg-[#201b16] text-[#a89682] text-xs font-bold transition border border-[#383028] cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting || !inputEmail || !inputPassword}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] text-xs font-black transition cursor-pointer shadow-lg shadow-[#dfba89]/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save & Sign In'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
