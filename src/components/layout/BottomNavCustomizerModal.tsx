'use client';

import React from 'react';
import { useApp, BottomNavStyle, NavGlowEffect, NavShowLabels } from '@/context/AppContext';
import { 
  X, 
  Sparkles, 
  Check, 
  Palette, 
  Eye, 
  Shuffle,
  Compass,
  Plus,
  Layers,
  CircleDot
} from 'lucide-react';

interface LayoutOption {
  id: BottomNavStyle;
  title: string;
  subtitle: string;
  tag: string;
  tagColor: string;
  description: string;
  previewType: 'aura' | 'obsidian' | 'neon' | 'split' | 'champagne';
}

const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: 'glass-aura',
    title: 'Aura Glass Island',
    subtitle: 'VisionOS Signature Halo (Your Favorite)',
    tag: 'Favorite ★',
    tagColor: 'bg-[#dfba89]/25 text-[#dfba89] border-[#dfba89]/40',
    description: 'The iconic floating glass dock with deep frosted blur, rounded pill corners, and an elevated gold titanium orb radiating a warm atmospheric halo ring.',
    previewType: 'aura',
  },
  {
    id: 'glass-obsidian',
    title: 'Frosted Obsidian Capsule',
    subtitle: 'Minimalist Liquid Smoked Glass',
    tag: 'Ultra Clean',
    tagColor: 'bg-zinc-800/60 text-zinc-200 border-zinc-600/40',
    description: 'Ultra-compact floating capsule with deep obsidian liquid glassmorphism, flush embedded gold jewel button, and dynamic expanding tab pills.',
    previewType: 'obsidian',
  },
  {
    id: 'glass-neon',
    title: 'Cyber Edge Glass Island',
    subtitle: 'Luminous Perimeter Neon Ring',
    tag: 'High Energy',
    tagColor: 'bg-amber-950/40 text-amber-300 border-amber-500/40',
    description: 'Floating glass dock framed with a continuous neon-gold perimeter light rim, pulsating dual-ring aura button, and neon micro-dot indicators.',
    previewType: 'neon',
  },
  {
    id: 'glass-split',
    title: 'Split Island Duo',
    subtitle: 'Twin Floating Glass Pods',
    tag: 'Futuristic',
    tagColor: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30',
    description: 'Two detached floating glass bodies: an ergonomic left navigation pod paired with an independent floating glass action satellite orb.',
    previewType: 'split',
  },
  {
    id: 'glass-champagne',
    title: 'Champagne Metallic Glass',
    subtitle: 'Luxury Beveled Rim Island',
    tag: 'Executive Luxury',
    tagColor: 'bg-[#dfba89]/15 text-[#f3dfc6] border-[#dfba89]/30',
    description: 'Smoked luxury glass island featuring a brushed champagne-gold metallic top accent rail, beveled dark titanium chassis, and an embossed squircle medallion.',
    previewType: 'champagne',
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
    addToast('Glass Island Updated! 🏝️', `Switched to "${title}". Enjoy the live view!`, 'success');
  };

  const handleCycleNext = () => {
    const currentIndex = LAYOUT_OPTIONS.findIndex((opt) => opt.id === bottomNavStyle);
    const nextIndex = (currentIndex + 1) % LAYOUT_OPTIONS.length;
    const nextStyle = LAYOUT_OPTIONS[nextIndex];
    setBottomNavStyle(nextStyle.id);
    addToast('Glass Demo Cycled', `Now previewing: ${nextStyle.title}`, 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-[#181512] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-[#383028] flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#12100e] text-[#f6f2ec] border-b border-[#2e261f] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#dfba89]/15 border border-[#dfba89]/30 flex items-center justify-center text-[#dfba89]">
              <Sparkles className="w-5 h-5 text-[#dfba89]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#dfba89] bg-[#dfba89]/15 px-2 py-0.5 rounded-full border border-[#dfba89]/30">
                  Floating Glass Collection
                </span>
                <span className="text-[11px] text-[#756758]">•</span>
                <span className="text-[11px] text-[#a89682]">5 Island Styles</span>
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#f6f2ec] mt-0.5">
                Floating Glass Island Variations
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCycleNext}
              className="px-2.5 py-1.5 rounded-xl bg-[#241f1a] hover:bg-[#2e2620] text-[#dfba89] border border-[#dfba89]/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              title="Cycle to next Floating Glass Island demo"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#dfba89]" />
              <span className="hidden sm:inline">Cycle Island</span>
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
          
          {/* Section 1: The 5 Floating Glass Island Options */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#dfba89]">
                  Floating Glass Island Variations (Live Demos)
                </h4>
                <p className="text-[11px] text-[#a89682] mt-0.5">
                  Tap any variation to immediately see the live glass dock transform at the bottom of your phone.
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#241f1a] border border-[#383028] text-[#c2b29d] font-mono">
                {LAYOUT_OPTIONS.findIndex(l => l.id === bottomNavStyle) + 1} / 5
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

                    {/* Miniature Layout Shape Visual Preview */}
                    <div className="mt-3 pt-2.5 border-t border-[#2e261f]/70">
                      {option.previewType === 'aura' && (
                        <div className="w-full h-8 rounded-2xl bg-[#161310]/90 backdrop-blur-md border border-[#dfba89]/40 px-3 flex items-center justify-between relative shadow-lg">
                          <div className="flex gap-2">
                            <div className="w-3.5 h-3.5 rounded-full bg-[#dfba89]/30" />
                            <div className="w-3.5 h-3.5 rounded-full bg-[#756758]/50" />
                          </div>
                          <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#dfba89] to-[#b37d4e] -mt-3.5 border-2 border-[#161310] shadow-[0_0_12px_#dfba89] flex items-center justify-center text-[10px] text-[#12100e] font-black">
                            +
                          </div>
                          <div className="flex gap-2">
                            <div className="w-3.5 h-3.5 rounded-full bg-[#756758]/50" />
                            <div className="w-3.5 h-3.5 rounded-full bg-[#756758]/50" />
                          </div>
                        </div>
                      )}

                      {option.previewType === 'obsidian' && (
                        <div className="w-full flex justify-center py-0.5">
                          <div className="w-56 h-7 rounded-full bg-[#0a0908]/90 backdrop-blur-xl border border-white/10 ring-1 ring-[#dfba89]/30 px-3 flex items-center justify-between shadow-xl">
                            <div className="px-2 py-0.5 rounded-full bg-[#dfba89] text-[8px] font-bold text-[#12100e]">Active</div>
                            <div className="w-2.5 h-2.5 rounded-full bg-[#756758]/50" />
                            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#dfba89] to-[#b37d4e] flex items-center justify-center text-[9px] text-[#12100e] font-bold shadow-md">
                              +
                            </div>
                            <div className="w-2.5 h-2.5 rounded-full bg-[#756758]/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#756758]/50" />
                          </div>
                        </div>
                      )}

                      {option.previewType === 'neon' && (
                        <div className="w-full h-8 rounded-2xl bg-[#12100e] border border-[#dfba89] shadow-[0_0_14px_rgba(223,186,137,0.35)] px-3 flex items-center justify-between relative">
                          <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#dfba89]" />
                            <div className="w-3 h-3 rounded-full bg-[#756758]/50" />
                          </div>
                          <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#ffe5b4] to-[#dfba89] -mt-3 ring-2 ring-[#dfba89] shadow-[0_0_15px_#dfba89] flex items-center justify-center text-[10px] text-[#12100e] font-black">
                            +
                          </div>
                          <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#756758]/50" />
                            <div className="w-3 h-3 rounded-full bg-[#756758]/50" />
                          </div>
                        </div>
                      )}

                      {option.previewType === 'split' && (
                        <div className="w-full flex items-center justify-center gap-2 py-0.5">
                          <div className="w-48 h-7 rounded-full bg-[#161310]/90 backdrop-blur-md border border-[#dfba89]/30 px-3 flex items-center justify-between shadow-lg">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#dfba89]" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#756758]/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#756758]/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#756758]/50" />
                          </div>
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#dfba89] to-[#b37d4e] border-2 border-white/20 shadow-[0_0_12px_#dfba89] flex items-center justify-center text-[10px] text-[#12100e] font-black shrink-0">
                            +
                          </div>
                        </div>
                      )}

                      {option.previewType === 'champagne' && (
                        <div className="w-full h-8 rounded-2xl bg-gradient-to-b from-[#1c1712] to-[#100e0c] border border-[#383028] px-3 flex items-center justify-between relative shadow-xl overflow-hidden">
                          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#dfba89]/80 to-transparent" />
                          <div className="flex gap-2">
                            <div className="w-3.5 h-3.5 rounded bg-[#dfba89]/30" />
                            <div className="w-3.5 h-3.5 rounded bg-[#756758]/40" />
                          </div>
                          <div className="w-6 h-6 rounded-xl bg-gradient-to-br from-[#dfba89] via-[#c59868] to-[#966436] -mt-2.5 border border-[#fff2df] shadow-md flex items-center justify-center text-[9px] text-[#12100e] font-black">
                            +
                          </div>
                          <div className="flex gap-2">
                            <div className="w-3.5 h-3.5 rounded bg-[#756758]/40" />
                            <div className="w-3.5 h-3.5 rounded bg-[#756758]/40" />
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
                  Atmospheric Glow & Halo Intensity
                </h4>
              </div>
              <p className="text-[11px] text-[#a89682] mt-0.5">
                Adjusts the radiant gold halo beam emanating from the floating orb.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'neon', label: 'Neon Halo', tag: 'Radiant', desc: 'Vibrant gold aura' },
                { id: 'soft', label: 'Subtle Warm', tag: 'Gentle', desc: 'Soft ambient light' },
                { id: 'none', label: 'Crisp Flat', tag: 'Zero Glow', desc: 'Clean contrast' },
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

          {/* Section 3: Label Display Preference */}
          <div className="p-4 rounded-2xl bg-[#141210] border border-[#383028] space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#dfba89]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#f6f2ec]">
                  Label Preference
                </h4>
              </div>
              <p className="text-[11px] text-[#a89682] mt-0.5">
                Control text visibility underneath icons on the floating glass dock.
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
            Apply & Enjoy Floating Island
          </button>
        </div>
      </div>
    </div>
  );
}
