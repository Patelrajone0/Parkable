'use client';

import React, { useState } from 'react';
import { X, ExternalLink, Key, Check, Copy, ChevronDown, ChevronUp, UserPlus, ArrowRight } from 'lucide-react';
import { saveGithubCredentials, launchOfficialGithubOAuth, getGithubRedirectUri } from '@/lib/githubAuth';

interface GithubSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (name: string, email: string) => void;
  onUseFallbackDemo?: () => void;
}

export default function GithubSetupModal({
  isOpen,
  onClose,
  onSelectAccount,
  onUseFallbackDemo,
}: GithubSetupModalProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customUsername, setCustomUsername] = useState('');
  const [showDevConfig, setShowDevConfig] = useState(false);
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

  const handleCustomAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUsername.trim()) return;
    const cleanUser = customUsername.trim();
    onSelectAccount(cleanUser, `${cleanUser.toLowerCase()}@github.com`);
  };

  const handleDevSubmit = (e: React.FormEvent) => {
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

        {/* GitHub Header */}
        <div className="text-center space-y-2 mb-6 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-[#12100e] border border-[#383028] flex items-center justify-center mx-auto shadow-md">
            <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-[#f6f2ec] tracking-tight">
            Sign in with GitHub
          </h3>
          <p className="text-xs text-[#a89682]">
            Choose an account to continue to <span className="text-[#dfba89] font-semibold">Parkable</span>
          </p>
        </div>

        {/* Account Chooser List */}
        <div className="space-y-2.5 mb-5">
          {/* Account 1: Patelrajone0 (1-Click Instant Sign-In) */}
          <button
            type="button"
            onClick={() => onSelectAccount('Patelrajone0', 'patelrajone0@github.com')}
            className="w-full p-3.5 rounded-2xl bg-[#141210] hover:bg-[#1f1a15] border border-[#383028] hover:border-[#dfba89]/60 transition flex items-center justify-between gap-3 text-left group cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-[#241f1a] border border-[#383028] shrink-0">
                <img
                  src="https://avatars.githubusercontent.com/u/218958232?v=4"
                  alt="Patelrajone0"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="truncate">
                <span className="text-sm font-bold text-[#f6f2ec] group-hover:text-[#dfba89] transition block truncate">
                  Patelrajone0
                </span>
                <span className="text-xs text-[#a89682] truncate block">
                  patelrajone0@github.com
                </span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-[#241f1a] text-[#dfba89] border border-[#dfba89]/30 text-[10px] font-bold shrink-0">
              Continue
            </span>
          </button>

          {/* Account 2: Use another GitHub username */}
          {!showCustomInput ? (
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              className="w-full p-3.5 rounded-2xl bg-[#141210]/60 hover:bg-[#1a1612] border border-[#2c251e] hover:border-[#383028] transition flex items-center gap-3 text-left text-xs font-semibold text-[#c2b29d] hover:text-[#f6f2ec] cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#201c18] border border-[#383028] flex items-center justify-center shrink-0 text-[#a89682]">
                <UserPlus className="w-4 h-4" />
              </div>
              <span>Use another GitHub username</span>
            </button>
          ) : (
            <form onSubmit={handleCustomAccountSubmit} className="p-4 rounded-2xl bg-[#141210] border border-[#383028] space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#dfba89]">Enter Your GitHub Username:</span>
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
                  required
                  value={customUsername}
                  onChange={(e) => setCustomUsername(e.target.value)}
                  placeholder="e.g. Octocat"
                  className="w-full px-3.5 py-2.5 bg-[#100e0d] border border-[#383028] focus:border-[#dfba89] rounded-xl text-xs text-[#f6f2ec] placeholder:text-[#6a5e52] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] text-xs font-black transition cursor-pointer shadow-md"
              >
                Sign In with this GitHub Account
              </button>
            </form>
          )}
        </div>

        {/* Collapsible Developer Configuration Section */}
        <div className="pt-3 border-t border-[#26201a]">
          <button
            type="button"
            onClick={() => setShowDevConfig(!showDevConfig)}
            className="w-full flex items-center justify-between text-[11px] text-[#6d6051] hover:text-[#a89682] transition cursor-pointer py-1"
          >
            <span>⚙️ Developer: Connect GitHub OAuth App</span>
            {showDevConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showDevConfig && (
            <div className="mt-3 p-3.5 rounded-2xl bg-[#12100e] border border-[#383028] space-y-3 text-xs animate-fadeIn">
              <div className="space-y-1.5 text-[11px] text-[#a89682]">
                <p>1. In GitHub Developer settings, create an <strong>OAuth App</strong>.</p>
                <div className="p-2 rounded-lg bg-[#1c1814] flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-[#dfba89] truncate">{currentHomepage}</span>
                  <button
                    type="button"
                    onClick={handleCopyHomepage}
                    className="text-[#dfba89] text-[10px] flex items-center gap-1 shrink-0"
                  >
                    {copiedHomepage ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHomepage ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleDevSubmit} className="space-y-2">
                <input
                  type="text"
                  value={clientIdInput}
                  onChange={(e) => setClientIdInput(e.target.value)}
                  placeholder="Paste GitHub Client ID"
                  className="w-full px-3 py-2 bg-[#181512] border border-[#383028] rounded-xl text-xs text-[#f6f2ec] outline-none font-mono"
                />
                <input
                  type="password"
                  value={clientSecretInput}
                  onChange={(e) => setClientSecretInput(e.target.value)}
                  placeholder="Paste Client Secret (optional)"
                  className="w-full px-3 py-2 bg-[#181512] border border-[#383028] rounded-xl text-xs text-[#f6f2ec] outline-none font-mono"
                />
                {errorMsg && <p className="text-[10px] text-rose-400">{errorMsg}</p>}
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-[#26201a] hover:bg-[#322a22] text-[#dfba89] text-xs font-bold border border-[#dfba89]/30 transition"
                >
                  Save & Authorize Official OAuth
                </button>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
