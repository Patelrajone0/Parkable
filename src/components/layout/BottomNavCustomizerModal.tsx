'use client';

import React from 'react';
import { useApp, BottomNavStyle, NavGlowEffect, NavShowLabels } from '@/context/AppContext';
import { 
  X, 
  Sparkles, 
  Check, 
  Layers, 
  Compass, 
  PlusCircle, 
  Sliders, 
  Palette, 
  Eye, 
  Shuffle,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface LayoutOption {
  id: BottomNavStyle;
  title: string;
  subtitle: string;
  tag: string;
  tagColor: string;
  description: string;
  previewType: 'island' | 'scoop' | 'pill' | 'titanium' | 'fab';
}

const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: 'floating-island',
    title: 'Floating Glass Island',
    subtitle: 'VisionOS & iOS 18 Style',
    tag: 'Trending ★',
    tagColor: 'bg-[#dfba89]/20 text-[#dfba89] border-[#dfba89]/40',
    description: 'Detached floating dock with frosted glassmorphism, rounded corners, and elevated glowing gold center button.',
    previewType: 'island',
  },
  {
    id: 'curved-scoop',
    title: 'Curved Center Scoop',
    subtitle: 'Fintech & Rideshare Cutout',
    tag: 'Popular',
    tagColor: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30',
    description: 'Edge-to-edge navbar with an architectural concave notch in the center where the gold button sits nestled in a scoop.',
    previewType: 'scoop',
  },
  {
    id: 'dynamic-pill',
    title: 'Minimal Dynamic Pill',
    subtitle: 'Arc Search & Dynamic Island',
    tag: 'Ultra Clean',
    tagColor: 'bg-sky-950/40 text-sky-400 border-sky-500/30',
    description: 'Compact rounded-full capsule that maximizes screen space. The active tab expands with a gold pill while inactive tabs stay minimal.',
    previewType: 'pill',
  },
  {
    id: 'titanium-bar',
    title: 'Titanium Segmented Bar',
    subtitle: 'Edge-to-Edge Classic Luxury',
    tag: 'Executive',
    tagColor: 'bg-amber-950/40 text-amber-300 border-amber-500/30',
    description: 'Classic edge-to-edge bar with brushed titanium dark gradient, top neon amber indicator line, and faceted gold center badge.',
    previewType: 'titanium',
  },
  {
    id: 'action-fab',
    title: 'Elevated Action FAB Dock',
    subtitle: 'Material You & Action Orbit',
    tag: 'Bold Action',
    tagColor: 'bg-purple-950/40 text-purple-300 border-purple-500/30',
    description: 'Streamlined dock with an oversized high-elevation Floating Action Button (FAB) floating above the bar with vibrant gold ring.',
    previewType: 'fab',
  },
];

export default function BottomNavCustomizerModal() {
  const {
    isNavCustomizerOpen,
    setIsNavCustomizerOpen,
    bottomNavStyle,
    setBottomNavStyle,
    navGlowEffect,
    setNavGlowEffect,
    navShowLabels,
    setNavShowLabels,
    addToast
  } = useApp();

  if (!isNavCustomizerOpen) return null;

  const handleSelectStyle = (style: BottomNavStyle, title: string) => {
    setBottomNavStyle(style);
    addToast('Nav Layout Updated! 🎨', `Switched to "${title}". Enjoy the live view!`, 'success');
  };

  const handleCycleNext = () => {
    const currentIndex = LAYOUT_OPTIONS.findIndex((opt) => opt.id === bottomNavStyle);
    const nextIndex = (currentIndex + 1) % LAYOUT_OPTIONS.length;
    const nextStyle = LAYOUT_OPTIONS[nextIndex];
    setBottomNavStyle(nextStyle.id);
    addToast('Demo Layout Cycled', `Now previewing: ${nextStyle.title}`, 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-[#181512] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-[#383028] flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#12100e] text-[#f6f2ec] border-b border-[#2e261f] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#dfba89]/15 border border-[#dfba89]/30 flex items-center justify-center text-[#dfba89]">
              <Palette className="w-5 h-5 text-[#dfba89]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#dfba89] bg-[#dfba89]/15 px-2 py-0.5 rounded-full border border-[#dfba89]/30">
                  Customization Studio
                </span>
                <span className="text-[11px] text-[#756758]">•</span>
                <span className="text-[11px] text-[#a89682]">5 Live Layouts</span>
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#f6f2ec] mt-0.5">
                Customize Bottom Navigation Bar
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCycleNext}
              className="px-2.5 py-1.5 rounded-xl bg-[#241f1a] hover:bg-[#2e2620] text-[#dfba89] border border-[#dfba89]/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              title="Cycle to next layout demo"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#dfba89]" />
              <span className="hidden sm:inline">Cycle Demo</span>
            </button>
            <button
              onClick={() => setIsNavCustomizerOpen(false)}
              className="w-8 h-8 rounded-full bg-[#1c1814] hover:bg-[#28211a] text-[#f6f2ec] border border-[#383028] flex items-center justify-center transition cursor-pointer"
              aria-label="Close customizer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-[max(1.5rem,calc(env(safe-area-inset-bottom,0px)+1rem))]">
          
          {/* Section 1: The 5 Layout Options */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#dfba89]">
                  Select Layout Style (Live Demo)
                </h4>
                <p className="text-[11px] text-[#a89682] mt-0.5">
                  Tap any option to instantly update the bottom navigation bar on your device.
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#241f1a] border border-[#383028] text-[#c2b29d] font-mono">
                {LAYOUT_OPTIONS.findIndex(l => l.id === bottomNavStyle) + 1} / 5 Active
              </span>
            </div>

            <div className="space-y-3">
              {LAYOUT_OPTIONS.map((option, idx) => {
                const isSelected = bottomNavStyle === option.id;

                return (
                  <div
                    key={option.id}
                    onClick={() => handleSelectStyle(option.id, option.title)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#282119] via-[#221c16] to-[#181512] border-[#dfba89] shadow-xl shadow-[#dfba89]/10 ring-2 ring-[#dfba89]/30'
                        : 'bg-[#141210] hover:bg-[#1a1714] border-[#383028] hover:border-[#dfba89]/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Number Indicator / Check */}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition ${
                          isSelected
                            ? 'bg-[#dfba89] text-[#12100e] shadow-md shadow-[#dfba89]/30 scale-105'
                            : 'bg-[#201c18] border border-[#383028] text-[#a89682]'
                        }`}>
                          {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-extrabold text-sm text-[#f6f2ec] group-hover:text-[#dfba89] transition">
                              {option.title}
                            </h5>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${option.tagColor}`}>
                              {option.tag}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#a89682] font-medium mt-0.5">
                            {option.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Active Tag */}
                      {isSelected && (
                        <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-wider text-[#dfba89] bg-[#dfba89]/20 px-2.5 py-1 rounded-full border border-[#dfba89]/40">
                          Active Now
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#c2b29d] mt-2.5 leading-relaxed">
                      {option.description}
                    </p>

                    {/* Miniature Layout Shape Wireframe / Visual Preview */}
                    <div className="mt-3 pt-2.5 border-t border-[#2e261f]/70 flex items-center justify-between">
                      {option.previewType === 'island' && (
                        <div className="w-full h-8 rounded-xl bg-[#0e0d0c] border border-[#dfba89]/30 px-3 flex items-center justify-between relative shadow-inner">
                          <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#756758]/50" />
                            <div className="w-3 h-3 rounded-full bg-[#756758]/50" />
                          </div>
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#dfba89] to-[#b37d4e] -mt-3 border-2 border-[#161310] shadow-md flex items-center justify-center text-[9px] text-[#12100e] font-bold">
                            +
                          </div>
                          <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#756758]/50" />
                            <div className="w-3 h-3 rounded-full bg-[#dfba89]" />
                          </div>
                        </div>
                      )}

                      {option.previewType === 'scoop' && (
                        <div className="w-full h-8 rounded-b-xl bg-[#0e0d0c] border-t-2 border-[#dfba89]/40 px-3 flex items-center justify-between relative">
                          <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#756758]/50" />
                            <div className="w-3 h-3 rounded-full bg-[#756758]/50" />
                          </div>
                          {/* Scoop cutout */}
                          <div className="relative -mt-4">
                            <div className="w-7 h-7 rounded-full bg-[#dfba89] border-2 border-[#0e0d0c] shadow-lg flex items-center justify-center text-[10px] text-[#12100e] font-black">
                              +
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#756758]/50" />
                            <div className="w-3 h-3 rounded-full bg-[#dfba89]" />
                          </div>
                        </div>
                      )}

                      {option.previewType === 'pill' && (
                        <div className="w-full flex justify-center py-1">
                          <div className="w-48 h-7 rounded-full bg-[#0e0d0c] border border-[#383028] px-3 flex items-center justify-between shadow-inner">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#756758]/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#756758]/50" />
                            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#dfba89] to-[#b37d4e] flex items-center justify-center text-[9px] text-[#12100e] font-bold">
                              +
                            </div>
                            <div className="w-2.5 h-2.5 rounded-full bg-[#756758]/50" />
                            <div className="px-2 py-0.5 rounded-full bg-[#dfba89] text-[8px] font-bold text-[#12100e]">Active</div>
                          </div>
                        </div>
                      )}

                      {option.previewType === 'titanium' && (
                        <div className="w-full h-8 bg-gradient-to-r from-[#181512] via-[#241f1a] to-[#181512] border-t-2 border-[#dfba89] px-3 flex items-center justify-between">
                          <div className="flex gap-3">
                            <div className="w-4 h-1 rounded bg-[#dfba89]" />
                            <div className="w-3 h-3 rounded bg-[#756758]/40" />
                          </div>
                          <div className="w-6 h-6 rounded-lg bg-[#141210] border border-[#dfba89] -mt-2 flex items-center justify-center text-[9px] text-[#dfba89] font-bold">
                            +
                          </div>
                          <div className="flex gap-3">
                            <div className="w-3 h-3 rounded bg-[#756758]/40" />
                            <div className="w-3 h-3 rounded bg-[#756758]/40" />
                          </div>
                        </div>
                      )}

                      {option.previewType === 'fab' && (
                        <div className="w-full h-8 rounded-xl bg-[#0e0d0c] border border-[#383028] px-3 flex items-center justify-between relative">
                          <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#756758]/50" />
                            <div className="w-3 h-3 rounded-full bg-[#756758]/50" />
                          </div>
                          <div className="w-7 h-7 rounded-2xl bg-gradient-to-tr from-[#dfba89] to-[#b37d4e] -mt-5 shadow-lg border-2 border-[#0e0d0c] flex items-center justify-center text-[11px] text-[#12100e] font-bold">
                            +
                          </div>
                          <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#756758]/50" />
                            <div className="w-3 h-3 rounded-full bg-[#dfba89]" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Atmosphere & Glow Customization */}
          <div className="p-4 rounded-2xl bg-[#141210] border border-[#383028] space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#dfba89]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#f6f2ec]">
                  Atmospheric Backlight & Glow Effect
                </h4>
              </div>
              <p className="text-[11px] text-[#a89682] mt-0.5">
                Controls the luminous titanium ambient halo radiating around the center action button.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'neon', label: 'Neon Halo', tag: 'Radiant', desc: 'Vibrant gold aura' },
                { id: 'soft', label: 'Subtle Warm', tag: 'Gentle', desc: 'Soft ambient light' },
                { id: 'none', label: 'Crisp Flat', tag: 'Zero Glow', desc: 'Clean high-contrast' },
              ].map((glow) => (
                <button
                  key={glow.id}
                  type="button"
                  onClick={() => setNavGlowEffect(glow.id as NavGlowEffect)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    navGlowEffect === glow.id
                      ? 'border-[#dfba89] bg-[#dfba89]/15 text-[#dfba89]'
                      : 'border-[#383028] bg-[#1c1814] text-[#a89682] hover:bg-[#221c17]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#f6f2ec]">{glow.label}</span>
                    {navGlowEffect === glow.id && <Check className="w-3 h-3 text-[#dfba89]" />}
                  </div>
                  <span className="text-[10px] text-[#756758] block mt-0.5">{glow.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Label Visibility */}
          <div className="p-4 rounded-2xl bg-[#141210] border border-[#383028] space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#dfba89]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#f6f2ec]">
                  Label Display Preference
                </h4>
              </div>
              <p className="text-[11px] text-[#a89682] mt-0.5">
                Choose whether navigation titles are always visible, visible only on active tabs, or hidden for icons-only.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'always', label: 'Always Show', desc: 'Icons + text labels' },
                { id: 'active-only', label: 'Active Only', desc: 'Text on selected tab' },
                { id: 'icons-only', label: 'Icons Only', desc: 'Ultra-minimal dock' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setNavShowLabels(item.id as NavShowLabels)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    navShowLabels === item.id
                      ? 'border-[#dfba89] bg-[#dfba89]/15 text-[#dfba89]'
                      : 'border-[#383028] bg-[#1c1814] text-[#a89682] hover:bg-[#221c17]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#f6f2ec]">{item.label}</span>
                    {navShowLabels === item.id && <Check className="w-3 h-3 text-[#dfba89]" />}
                  </div>
                  <span className="text-[10px] text-[#756758] block mt-0.5">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Apply & Close CTA */}
          <button
            type="button"
            onClick={() => setIsNavCustomizerOpen(false)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-black text-xs uppercase tracking-wider shadow-lg shadow-[#dfba89]/25 transition cursor-pointer active:scale-95"
          >
            Apply & Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
}
