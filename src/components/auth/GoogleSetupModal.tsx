'use client';

import React, { useState } from 'react';
import { X, ExternalLink, Key, CheckCircle, ShieldCheck, Copy, Check } from 'lucide-react';
import { saveGoogleClientId } from '@/lib/googleAuth';

interface GoogleSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAndConnect: (clientId: string) => void;
  onUseFallbackDemo: () => void;
}

export default function GoogleSetupModal({
  isOpen,
  onClose,
  onSaveAndConnect,
  onUseFallbackDemo,
}: GoogleSetupModalProps) {
  const [clientIdInput, setClientIdInput] = useState('');
  const [copiedOrigin, setCopiedOrigin] = useState(false);
  const [copiedRedirect, setCopiedRedirect] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://patelrajone0.github.io';
  const currentRedirect = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : 'https://patelrajone0.github.io/Parkable/login/';

  const handleCopyOrigin = () => {
    navigator.clipboard.writeText(`${currentOrigin}\nhttp://localhost:3000`);
    setCopiedOrigin(true);
    setTimeout(() => setCopiedOrigin(false), 2000);
  };

  const handleCopyRedirect = () => {
    navigator.clipboard.writeText(`${currentRedirect}\nhttp://localhost:3000/login`);
    setCopiedRedirect(true);
    setTimeout(() => setCopiedRedirect(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
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
    onSaveAndConnect(cleanId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn text-[#f6f2ec]">
      <div className="relative w-full max-w-lg bg-[#181512] border border-[#383028] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-36 bg-[#dfba89]/20 blur-3xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#201c18] hover:bg-[#2b241e] text-[#a89682] hover:text-[#f6f2ec] flex items-center justify-center transition border border-[#383028] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#12100e] border border-[#dfba89]/40 flex items-center justify-center mx-auto shadow-md">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.28-2.1 3.66-5.2 3.66-9.12z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"/>
            </svg>
          </div>
          <h3 className="text-xl font-black text-[#f6f2ec] tracking-tight">
            Official Google Sign-In Setup
          </h3>
          <p className="text-xs text-[#a89682]">
            Connect your Google Cloud OAuth Client to trigger real Google account popups.
          </p>
        </div>

        {/* Quick Steps Box */}
        <div className="p-4 rounded-2xl bg-[#141210] border border-[#383028] space-y-3 mb-5 text-xs text-[#c2b29d]">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#f6f2ec]">Google Cloud Console Instructions:</span>
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noreferrer"
              className="text-[#dfba89] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Open Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-2 text-[11px] text-[#a89682]">
            <p>1. In Google Cloud Console, click <strong>Create Credentials $\rightarrow$ OAuth client ID</strong>.</p>
            <p>2. Select <strong>Web application</strong>.</p>
            
            <div className="p-2.5 rounded-xl bg-[#1d1915] border border-[#383028] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white font-mono text-[10px]">Authorized JavaScript Origins:</span>
                <button
                  type="button"
                  onClick={handleCopyOrigin}
                  className="text-[#dfba89] hover:text-[#f3dfc6] flex items-center gap-1 cursor-pointer"
                >
                  {copiedOrigin ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedOrigin ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="font-mono text-[10px] text-[#dfba89] truncate">
                {currentOrigin}, http://localhost:3000
              </p>
            </div>
          </div>
        </div>

        {/* Client ID Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#c2b29d] mb-1.5">
              Google Client ID
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-[#8a7a6b] absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                placeholder="e.g. 123456789-abcdef.apps.googleusercontent.com"
                className="w-full pl-10 pr-4 py-3 bg-[#141210] border border-[#383028] focus:border-[#dfba89] rounded-xl text-xs text-[#f6f2ec] placeholder:text-[#6e6052] outline-none font-mono"
              />
            </div>
            {errorMsg && (
              <p className="text-[11px] text-[#e08272] mt-1.5 font-medium">{errorMsg}</p>
            )}
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] text-xs font-black transition cursor-pointer shadow-lg shadow-[#dfba89]/25"
            >
              Save & Launch Official Google Sign-In
            </button>

            <button
              type="button"
              onClick={onUseFallbackDemo}
              className="w-full py-2.5 rounded-xl bg-[#141210] hover:bg-[#201b16] text-[#a89682] hover:text-[#f6f2ec] text-xs font-semibold transition border border-[#383028] cursor-pointer"
            >
              Continue with Account Chooser (No Client ID Needed)
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
