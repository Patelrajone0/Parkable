'use client';

import React, { useState } from 'react';
import { X, ExternalLink, Key, Check, Copy, ShieldCheck, ArrowRight } from 'lucide-react';
import { saveGithubCredentials, launchOfficialGithubOAuth, getGithubRedirectUri } from '@/lib/githubAuth';

interface GithubSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseFallbackDemo: () => void;
}

export default function GithubSetupModal({
  isOpen,
  onClose,
  onUseFallbackDemo,
}: GithubSetupModalProps) {
  const [clientIdInput, setClientIdInput] = useState('');
  const [clientSecretInput, setClientSecretInput] = useState('');
  const [copiedHomepage, setCopiedHomepage] = useState(false);
  const [copiedCallback, setCopiedCallback] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentHomepage = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const currentCallback = typeof window !== 'undefined' ? getGithubRedirectUri() : 'http://localhost:3000/api/auth/callback/github';

  const handleCopyHomepage = () => {
    navigator.clipboard.writeText(currentHomepage);
    setCopiedHomepage(true);
    setTimeout(() => setCopiedHomepage(false), 2000);
  };

  const handleCopyCallback = () => {
    navigator.clipboard.writeText(currentCallback);
    setCopiedCallback(true);
    setTimeout(() => setCopiedCallback(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = clientIdInput.trim();
    if (!cleanId) {
      setErrorMsg('Please enter your GitHub Client ID.');
      return;
    }

    saveGithubCredentials(cleanId, clientSecretInput.trim());
    onClose();
    launchOfficialGithubOAuth(cleanId, currentCallback);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn text-[#f6f2ec]">
      <div className="relative w-full max-w-lg bg-[#181512] border border-[#383028] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-36 bg-[#dfba89]/15 blur-3xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#201c18] hover:bg-[#2b241e] text-[#a89682] hover:text-[#f6f2ec] flex items-center justify-center transition border border-[#383028] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#12100e] border border-[#383028] flex items-center justify-center mx-auto shadow-md">
            <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-[#f6f2ec] tracking-tight">
            Official GitHub Sign-In Setup
          </h3>
          <p className="text-xs text-[#a89682]">
            Authenticate directly through GitHub.com via official OAuth 2.0.
          </p>
        </div>

        {/* Quick Instructions Card */}
        <div className="p-4 rounded-2xl bg-[#141210] border border-[#383028] space-y-3 mb-5 text-xs text-[#c2b29d]">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#f6f2ec]">GitHub Developer Settings:</span>
            <a
              href="https://github.com/settings/developers"
              target="_blank"
              rel="noreferrer"
              className="text-[#dfba89] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Open GitHub Developer Apps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-2 text-[11px] text-[#a89682]">
            <p>1. Go to <strong>OAuth Apps $\rightarrow$ New OAuth App</strong>.</p>
            <p>2. Application Name: <strong className="text-[#f6f2ec]">ParkEase</strong></p>
            
            <div className="p-2.5 rounded-xl bg-[#1d1915] border border-[#383028] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#c9b7a4]">Homepage URL:</span>
                <button
                  type="button"
                  onClick={handleCopyHomepage}
                  className="px-2 py-0.5 rounded bg-[#2c241d] hover:bg-[#382f25] text-[#dfba89] text-[10px] font-mono flex items-center gap-1 transition"
                >
                  {copiedHomepage ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHomepage ? 'Copied' : currentHomepage}</span>
                </button>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[#c9b7a4]">Authorization callback URL:</span>
                <button
                  type="button"
                  onClick={handleCopyCallback}
                  className="px-2 py-0.5 rounded bg-[#2c241d] hover:bg-[#382f25] text-[#dfba89] text-[10px] font-mono flex items-center gap-1 transition truncate max-w-[210px]"
                >
                  {copiedCallback ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span className="truncate">{copiedCallback ? 'Copied URL' : currentCallback}</span>
                </button>
              </div>
            </div>

            <p>3. Click <strong>Register application</strong> and copy your <strong>Client ID</strong> below.</p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#a89682] mb-1.5">
              GitHub Client ID
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-[#8a7a6c] absolute left-3 top-3" />
              <input
                type="text"
                value={clientIdInput}
                onChange={(e) => {
                  setClientIdInput(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="e.g. Ov23li... or Iv1.xxxxxxxx"
                className="w-full pl-9 pr-3 py-2.5 bg-[#100e0d] border border-[#383028] rounded-xl text-xs text-[#f6f2ec] focus:outline-none focus:border-[#dfba89] placeholder:text-[#6a5e52]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#a89682] mb-1.5">
              GitHub Client Secret <span className="text-[#756758] normal-case">(optional, for direct code exchange)</span>
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-[#8a7a6c] absolute left-3 top-3" />
              <input
                type="password"
                value={clientSecretInput}
                onChange={(e) => setClientSecretInput(e.target.value)}
                placeholder="Paste client secret (or define in .env.local)"
                className="w-full pl-9 pr-3 py-2.5 bg-[#100e0d] border border-[#383028] rounded-xl text-xs text-[#f6f2ec] focus:outline-none focus:border-[#dfba89] placeholder:text-[#6a5e52]"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
          )}

          <div className="space-y-2 pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-bold text-xs shadow-lg shadow-[#dfba89]/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Authorize with GitHub</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onUseFallbackDemo();
              }}
              className="w-full py-2.5 rounded-xl bg-[#201c18] hover:bg-[#28221c] border border-[#383028] text-[#c9b7a4] text-xs font-semibold transition cursor-pointer"
            >
              Instant 1-Click Demo Login (as Patelrajone0)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
