'use client';

import React, { useState } from 'react';
import { X, ExternalLink, Key, Check, Copy, ChevronDown, ChevronUp, User, UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';
import { saveGoogleClientId } from '@/lib/googleAuth';

interface GoogleSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (name: string, email: string) => void;
  onSaveAndConnect?: (clientId: string) => void;
}

export default function GoogleSetupModal({
  isOpen,
  onClose,
  onSelectAccount,
  onSaveAndConnect,
}: GoogleSetupModalProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [showDevConfig, setShowDevConfig] = useState(false);
  const [clientIdInput, setClientIdInput] = useState('');
  const [copiedOrigin, setCopiedOrigin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://patelrajone0.github.io';

  const handleCopyOrigin = () => {
    navigator.clipboard.writeText(`${currentOrigin}\nhttp://localhost:3000`);
    setCopiedOrigin(true);
    setTimeout(() => setCopiedOrigin(false), 2000);
  };

  const handleCustomAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    const finalName = customName.trim() || customEmail.split('@')[0].replace(/^\w/, (c) => c.toUpperCase());
    onSelectAccount(finalName, customEmail.trim());
  };

  const handleDevSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = clientIdInput.trim();
    if (!cleanId) {
      setErrorMsg('Please paste your Google Client ID.');
      return;
    }
    if (!cleanId.includes('.apps.googleusercontent.com')) {
      setErrorMsg('A valid Google Client ID ends with .apps.googleusercontent.com');
      return;
    }

    saveGoogleClientId(cleanId);
    if (onSaveAndConnect) {
      onSaveAndConnect(cleanId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn text-[#f6f2ec]">
      <div 
        className="relative w-full max-w-md bg-[#181512] border border-[#383028] rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black overflow-hidden max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-36 bg-[#dfba89]/15 blur-3xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#201c18] hover:bg-[#2b241e] text-[#a89682] hover:text-[#f6f2ec] flex items-center justify-center transition border border-[#383028] cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Google Header */}
        <div className="text-center space-y-2 mb-6 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-[#12100e] border border-[#383028] flex items-center justify-center mx-auto shadow-md">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.28-2.1 3.66-5.2 3.66-9.12z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"/>
            </svg>
          </div>
          <h3 className="text-xl font-black text-[#f6f2ec] tracking-tight">
            Sign in with Google
          </h3>
          <p className="text-xs text-[#a89682]">
            Choose an account to continue to <span className="text-[#dfba89] font-semibold">Parkable</span>
          </p>
        </div>

        {/* Account Chooser List */}
        <div className="space-y-2.5 mb-5">
          {/* Account 1: Raj Patel (1-Click Instant Sign-In) */}
          <button
            type="button"
            onClick={() => onSelectAccount('Raj Patel', 'patelrajone0@gmail.com')}
            className="w-full p-3.5 rounded-2xl bg-[#141210] hover:bg-[#1f1a15] border border-[#383028] hover:border-[#dfba89]/60 transition flex items-center justify-between gap-3 text-left group cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#dfba89] to-[#b37d4e] text-[#12100e] font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                R
              </div>
              <div className="truncate">
                <span className="text-sm font-bold text-[#f6f2ec] group-hover:text-[#dfba89] transition block truncate">
                  Raj Patel
                </span>
                <span className="text-xs text-[#a89682] truncate block">
                  patelrajone0@gmail.com
                </span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-[#241f1a] text-[#dfba89] border border-[#dfba89]/30 text-[10px] font-bold shrink-0">
              Continue
            </span>
          </button>

          {/* Account 2: Use another Google account */}
          {!showCustomInput ? (
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              className="w-full p-3.5 rounded-2xl bg-[#141210]/60 hover:bg-[#1a1612] border border-[#2c251e] hover:border-[#383028] transition flex items-center gap-3 text-left text-xs font-semibold text-[#c2b29d] hover:text-[#f6f2ec] cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#201c18] border border-[#383028] flex items-center justify-center shrink-0 text-[#a89682]">
                <UserPlus className="w-4 h-4" />
              </div>
              <span>Use another Google account</span>
            </button>
          ) : (
            <form onSubmit={handleCustomAccountSubmit} className="p-4 rounded-2xl bg-[#141210] border border-[#383028] space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#dfba89]">Enter Your Google Details:</span>
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="text-[11px] text-[#a89682] hover:text-[#f6f2ec]"
                >
                  Cancel
                </button>
              </div>

              <div>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Your Full Name (e.g. Alex Smith)"
                  className="w-full px-3.5 py-2.5 bg-[#100e0d] border border-[#383028] focus:border-[#dfba89] rounded-xl text-xs text-[#f6f2ec] placeholder:text-[#6a5e52] outline-none"
                />
              </div>

              <div>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-[#100e0d] border border-[#383028] focus:border-[#dfba89] rounded-xl text-xs text-[#f6f2ec] placeholder:text-[#6a5e52] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] text-xs font-black transition cursor-pointer shadow-md"
              >
                Sign In with this Google Account
              </button>
            </form>
          )}
        </div>

        {/* Google Privacy Disclaimer */}
        <p className="text-[11px] text-[#786c5e] text-center leading-relaxed mb-4 px-2">
          To continue, Google will share your name, email address, and profile picture with Parkable.
        </p>

        {/* Collapsible Developer Configuration Section (Hidden by default) */}
        <div className="pt-3 border-t border-[#26201a]">
          <button
            type="button"
            onClick={() => setShowDevConfig(!showDevConfig)}
            className="w-full flex items-center justify-between text-[11px] text-[#6d6051] hover:text-[#a89682] transition cursor-pointer py-1"
          >
            <span>⚙️ Developer: Connect Google Cloud OAuth Client</span>
            {showDevConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showDevConfig && (
            <div className="mt-3 p-3.5 rounded-2xl bg-[#12100e] border border-[#383028] space-y-3 text-xs animate-fadeIn">
              <div className="space-y-1.5 text-[11px] text-[#a89682]">
                <p>1. In Google Cloud Console, click <strong>Create Credentials → OAuth client ID</strong>.</p>
                <p>2. Select <strong>Web application</strong>.</p>
                <div className="p-2 rounded-lg bg-[#1c1814] flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-[#dfba89] truncate">{currentOrigin}</span>
                  <button
                    type="button"
                    onClick={handleCopyOrigin}
                    className="text-[#dfba89] text-[10px] flex items-center gap-1 shrink-0"
                  >
                    {copiedOrigin ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedOrigin ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleDevSubmit} className="space-y-2">
                <input
                  type="text"
                  value={clientIdInput}
                  onChange={(e) => setClientIdInput(e.target.value)}
                  placeholder="Paste Client ID ending in .apps.googleusercontent.com"
                  className="w-full px-3 py-2 bg-[#181512] border border-[#383028] rounded-xl text-xs text-[#f6f2ec] outline-none font-mono"
                />
                {errorMsg && <p className="text-[10px] text-rose-400">{errorMsg}</p>}
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-[#26201a] hover:bg-[#322a22] text-[#dfba89] text-xs font-bold border border-[#dfba89]/30 transition"
                >
                  Save & Launch Official Google Popup
                </button>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
