'use client';

import React, { useState } from 'react';
import { usePwa } from '@/context/PwaContext';
import { 
  X, 
  Download, 
  Monitor, 
  Smartphone, 
  Apple, 
  CheckCircle2, 
  ExternalLink,
  Laptop,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { getAssetUrl } from '@/lib/assets';

export default function InstallAppModal() {
  const { isInstallModalOpen, setIsInstallModalOpen, isInstalled, isInstallable, promptInstall } = usePwa();
  const [activeTab, setActiveTab] = useState<'desktop' | 'android' | 'ios'>('desktop');

  if (!isInstallModalOpen) return null;

  const handleInstallClick = async () => {
    const success = await promptInstall();
    if (success) {
      setIsInstallModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#181512] rounded-3xl shadow-2xl border border-[#383028] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#2d2620] relative flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-[#dfba89]/40 bg-[#12100e] shadow-md shadow-[#dfba89]/20 shrink-0 flex items-center justify-center">
            <img
              src={getAssetUrl('/logos/shield-icon.jpg?v=2')}
              alt="Parkable App Icon"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 pr-8">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-[#f6f2ec]">Download Parkable</h3>
              <span className="px-2 py-0.5 rounded-full bg-[#dfba89]/15 text-[#dfba89] border border-[#dfba89]/30 text-[10px] font-bold">
                PWA App
              </span>
            </div>
            <p className="text-xs text-[#a89682] mt-0.5">
              Install Parkable on your phone or computer for instant access, offline maps, and fast booking.
            </p>
          </div>

          <button
            onClick={() => setIsInstallModalOpen(false)}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#201c18] hover:bg-[#2b241e] text-[#a89682] hover:text-[#f6f2ec] flex items-center justify-center border border-[#383028] transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Omnibox / Search Bar Visual Simulation (matching user's screenshot) */}
        <div className="p-4 sm:p-5 bg-[#12100e] border-b border-[#2d2620]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#a89682] mb-2">
            In Google Chrome / Browser Address Bar:
          </p>
          <div className="bg-[#1c1815] rounded-xl p-2.5 border border-[#383028] flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2 truncate text-xs text-[#a89682] font-mono">
              <span className="text-[#685c4f]">https://</span>
              <span className="text-[#f6f2ec] font-semibold">parkable.app</span>
            </div>

            {/* Simulated Address Bar Action Pill */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#25201a] border border-[#dfba89]/50 text-[#dfba89] shadow-sm animate-pulse">
                <div className="w-3.5 h-3.5 rounded overflow-hidden">
                  <img src={getAssetUrl('/icons/icon-192.png')} alt="" className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] font-bold">
                  {isInstalled ? 'Open in app' : 'Install app'}
                </span>
                <ArrowUpRight className="w-3 h-3 text-[#dfba89]" />
              </div>
            </div>
          </div>
          <p className="text-[10px] text-[#dfba89] font-medium mt-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#dfba89]" />
            <span>Look for this icon in your Google Chrome search bar to install or launch immediately!</span>
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-[#2d2620] px-4 pt-3 bg-[#181512]">
          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'desktop'
                ? 'border-[#dfba89] text-[#dfba89]'
                : 'border-transparent text-[#a89682] hover:text-[#f6f2ec]'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Chrome / Edge</span>
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'android'
                ? 'border-[#dfba89] text-[#dfba89]'
                : 'border-transparent text-[#a89682] hover:text-[#f6f2ec]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android</span>
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'ios'
                ? 'border-[#dfba89] text-[#dfba89]'
                : 'border-transparent text-[#a89682] hover:text-[#f6f2ec]'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>iPhone (iOS)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3 flex-1 text-xs text-[#c2b29d]">
          {activeTab === 'desktop' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#201c18] rounded-xl border border-[#383028] flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#dfba89]/20 text-[#dfba89] font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                <div>
                  <strong className="text-[#f6f2ec] block">Look at the Google Chrome Search Bar</strong>
                  <span>Click the <strong>Install</strong> or <strong>Open in app</strong> pill in the right side of the address bar.</span>
                </div>
              </div>

              <div className="p-3 bg-[#201c18] rounded-xl border border-[#383028] flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#dfba89]/20 text-[#dfba89] font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                <div>
                  <strong className="text-[#f6f2ec] block">Or use the Chrome Menu (⋮)</strong>
                  <span>Click the 3 dots in the top-right &gt; <strong>Save and share</strong> &gt; <strong>Install Parkable</strong>.</span>
                </div>
              </div>

              <div className="p-3 bg-[#201c18] rounded-xl border border-[#383028] flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#dfba89]/20 text-[#dfba89] font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                <div>
                  <strong className="text-[#f6f2ec] block">Standalone Desktop Window</strong>
                  <span>Parkable will open in its own clean window with a desktop icon and taskbar pin!</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'android' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#201c18] rounded-xl border border-[#383028] flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#dfba89]/20 text-[#dfba89] font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                <div>
                  <strong className="text-[#f6f2ec] block">Tap Browser Menu (⋮)</strong>
                  <span>In Google Chrome on your Android device, tap the three dots in the top right.</span>
                </div>
              </div>

              <div className="p-3 bg-[#201c18] rounded-xl border border-[#383028] flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#dfba89]/20 text-[#dfba89] font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                <div>
                  <strong className="text-[#f6f2ec] block">Select "Install App" or "Add to Home screen"</strong>
                  <span>Confirm the prompt to download Parkable to your app drawer and home screen.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#201c18] rounded-xl border border-[#383028] flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#dfba89]/20 text-[#dfba89] font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                <div>
                  <strong className="text-[#f6f2ec] block">Open in Safari and tap Share</strong>
                  <span>Tap the <strong>Share</strong> button (the square with an arrow pointing up ⎋) in the bottom toolbar.</span>
                </div>
              </div>

              <div className="p-3 bg-[#201c18] rounded-xl border border-[#383028] flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#dfba89]/20 text-[#dfba89] font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                <div>
                  <strong className="text-[#f6f2ec] block">Tap "Add to Home Screen"</strong>
                  <span>Scroll down the share options and tap <strong>Add to Home Screen</strong>, then tap <strong>Add</strong> in the top right.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#141210] border-t border-[#2d2620] flex items-center justify-between gap-3">
          {isInstalled ? (
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>App is installed on your device</span>
            </div>
          ) : (
            <span className="text-xs text-[#a89682]">
              100% free • Fast native PWA experience
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsInstallModalOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#a89682] hover:text-[#f6f2ec] hover:bg-[#201c18] transition cursor-pointer"
            >
              Close
            </button>

            {!isInstalled && (
              <button
                onClick={handleInstallClick}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] text-xs font-black shadow-md shadow-[#dfba89]/25 hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#12100e]" />
                <span>{isInstallable ? 'Install Now' : 'Download Guide'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
