'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Search, 
  MapPin, 
  Car, 
  SlidersHorizontal, 
  Zap, 
  ShieldCheck, 
  Clock, 
  X, 
  Filter, 
  Compass,
  Sparkles
} from 'lucide-react';
import { VehicleSize, SpaceType } from '@/types';

const POPULAR_LOCATIONS = [
  { name: 'Indiranagar 100ft Rd', lat: 12.9719, lng: 77.6412 },
  { name: 'Koramangala 4th Block', lat: 12.9344, lng: 77.6256 },
  { name: 'MG Road Metro', lat: 12.9752, lng: 77.6053 },
  { name: 'Lavelle Road / UB City', lat: 12.9698, lng: 77.5991 },
  { name: 'Victoria Layout', lat: 12.9645, lng: 77.6148 },
];

export default function SearchBar() {
  const {
    searchFilters,
    setSearchFilters,
    setMapCenter,
    setMapZoom,
    requestLiveLocation,
    isLocating,
    addToast,
  } = useApp();

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchFilters.destination);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Sync search input if destination changes externally
  useEffect(() => {
    setSearchInput(searchFilters.destination);
  }, [searchFilters.destination]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelectLocation = (loc: { name: string; lat: number; lng: number }) => {
    setSearchInput(loc.name);
    setMapCenter([loc.lat, loc.lng]);
    setMapZoom(15);
    setSearchFilters((prev) => ({ ...prev, destination: loc.name, lat: loc.lat, lng: loc.lng }));
    setShowSuggestions(false);
    addToast('Location updated', `Centered map around ${loc.name}`, 'info');
  };

  // Handle location search
  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (!searchInput.trim()) return;

    // Check if matching popular locations
    const matched = POPULAR_LOCATIONS.find((loc) =>
      loc.name.toLowerCase().includes(searchInput.toLowerCase())
    );

    if (matched) {
      handleSelectLocation(matched);
    } else {
      setSearchFilters((prev) => ({ ...prev, destination: searchInput }));
      addToast('Searching destination', `Filtering spots near "${searchInput}"`, 'info');
    }
  };

  const filteredSuggestions = POPULAR_LOCATIONS.filter((loc) =>
    searchInput ? loc.name.toLowerCase().includes(searchInput.toLowerCase()) : true
  );

  return (
    <div className="w-full bg-[#181512]/95 rounded-2xl sm:rounded-3xl shadow-xl shadow-black/50 border border-[#383028] p-2.5 sm:p-4 backdrop-blur-md transition-all duration-200">
      {/* Top search input row */}
      <form onSubmit={handleLocationSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        {/* Search input with pin and action buttons */}
        <div className="flex items-center gap-1.5 flex-1">
          <div ref={searchContainerRef} className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#dfba89]">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            </div>
            <input
              type="text"
              value={searchInput}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="Search area, landmark..."
              className="w-full pl-9 sm:pl-11 pr-16 sm:pr-20 py-2.5 sm:py-3 bg-[#100e0d] hover:bg-[#14120f] focus:bg-[#100e0d] text-[#f6f2ec] text-xs sm:text-sm font-medium rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60 focus:border-transparent placeholder-[#756758] transition-all duration-200"
            />
            <div className="absolute inset-y-0 right-0 pr-1.5 flex items-center gap-0.5">
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setSearchFilters((prev) => ({ ...prev, destination: '' }));
                  }}
                  className="p-1 text-[#756758] hover:text-[#f6f2ec] pressable transition cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  requestLiveLocation();
                  addToast('Locating...', 'Fetching your live GPS location', 'info');
                }}
                className="p-1 sm:p-1.5 rounded-lg text-[#dfba89] hover:bg-[#221c17] pressable transition cursor-pointer"
                title="Use current live location"
              >
                <Compass className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLocating ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Quick Autocomplete Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#161310] border border-[#383028] rounded-2xl shadow-2xl p-1.5 animate-in fade-in slide-in-from-top duration-200 max-h-56 overflow-y-auto">
                <div className="px-2.5 py-1 text-[10px] font-bold text-[#a89682] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#dfba89]" />
                  <span>Popular Locations</span>
                </div>
                {filteredSuggestions.map((loc) => (
                  <button
                    key={loc.name}
                    type="button"
                    onClick={() => handleSelectLocation(loc)}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left hover:bg-[#241f1a] pressable transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-[#dfba89] shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-[#f6f2ec] font-semibold truncate group-hover:text-[#dfba89] transition-colors">
                        {loc.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#a89682] font-mono shrink-0 ml-2">
                      Jump to area ➔
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Filters Toggle on Mobile */}
          <button
            type="button"
            onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
            className={`sm:hidden p-2.5 rounded-xl border text-xs font-bold pressable transition-all flex items-center justify-center shrink-0 ${
              isFilterDrawerOpen || searchFilters.has_ev || searchFilters.is_covered || searchFilters.has_cctv || searchFilters.space_type !== 'all' || searchFilters.vehicle_size !== 'all'
                ? 'bg-[#dfba89] text-[#12100e] border-[#dfba89] shadow-sm'
                : 'border-[#383028] bg-[#1c1814] text-[#d6c7b2]'
            }`}
            title="Toggle filters"
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Search Submit button on Mobile */}
          <button
            type="submit"
            className="sm:hidden px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] text-[#12100e] font-bold text-xs shadow-md pressable transition flex items-center justify-center shrink-0"
            aria-label="Search"
          >
            <Search className="w-4 h-4 text-[#12100e]" />
          </button>
        </div>

        {/* Vehicle Size Dropdown (Visible on Desktop / Tablets) */}
        <div className="hidden sm:block shrink-0">
          <select
            value={searchFilters.vehicle_size}
            onChange={(e) =>
              setSearchFilters((prev) => ({
                ...prev,
                vehicle_size: e.target.value as VehicleSize | 'all',
              }))
            }
            className="w-auto px-3.5 py-3 rounded-xl border border-[#383028] bg-[#100e0d] hover:bg-[#14120f] text-[#f6f2ec] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60 transition cursor-pointer"
          >
            <option value="all" className="bg-[#181512] text-[#f6f2ec]">🚗 Any Vehicle Size</option>
            <option value="2-wheeler" className="bg-[#181512] text-[#f6f2ec]">🏍️ 2-Wheeler (Bike / Scooter)</option>
            <option value="hatchback" className="bg-[#181512] text-[#f6f2ec]">🚙 Hatchback (Swift, i20)</option>
            <option value="compact-suv" className="bg-[#181512] text-[#f6f2ec]">🚘 Compact SUV (Creta, Seltos)</option>
            <option value="large-suv" className="bg-[#181512] text-[#f6f2ec]">🚐 Large SUV (Fortuner, Truck)</option>
          </select>
        </div>

        {/* Filters Toggle Button (Desktop) */}
        <button
          type="button"
          onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
          className={`hidden sm:flex shrink-0 items-center justify-center gap-2 px-4 py-3 rounded-xl border text-xs font-bold pressable transition-all ${
            isFilterDrawerOpen || searchFilters.has_ev || searchFilters.is_covered || searchFilters.has_cctv || searchFilters.space_type !== 'all' || searchFilters.vehicle_size !== 'all'
              ? 'bg-[#dfba89] text-[#12100e] border-[#dfba89] shadow-sm'
              : 'border-[#383028] bg-[#1c1814] text-[#d6c7b2] hover:bg-[#25201a]'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {(searchFilters.has_ev || searchFilters.is_covered || searchFilters.has_cctv || searchFilters.space_type !== 'all' || searchFilters.vehicle_size !== 'all') && (
            <span className="w-2 h-2 rounded-full bg-[#12100e]"></span>
          )}
        </button>

        {/* Search Submit button (Desktop) */}
        <button
          type="submit"
          className="hidden sm:flex shrink-0 px-5 py-3 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] text-xs font-bold shadow-md shadow-[#dfba89]/25 hover:shadow-lg pressable transition-all items-center justify-center gap-1.5"
        >
          <Search className="w-4 h-4 text-[#12100e]" />
          <span>Search</span>
        </button>
      </form>

      {/* Mobile Horizontal Quick-Filter Chips: Fast 1-Tap Filtering for Phones */}
      <div className="flex sm:hidden items-center gap-1.5 mt-2 pt-2 border-t border-[#2a231b] overflow-x-auto no-scrollbar pb-0.5">
        <button
          type="button"
          onClick={() =>
            setSearchFilters((prev) => ({
              ...prev,
              vehicle_size: 'all',
              space_type: 'all',
              has_ev: false,
              is_covered: false,
            }))
          }
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 pressable transition-all ${
            searchFilters.vehicle_size === 'all' && !searchFilters.has_ev && !searchFilters.is_covered
              ? 'bg-[#dfba89] text-[#12100e] shadow-xs'
              : 'bg-[#100e0d] text-[#a89682] border border-[#383028]'
          }`}
        >
          All Spots
        </button>

        <button
          type="button"
          onClick={() =>
            setSearchFilters((prev) => ({
              ...prev,
              vehicle_size: prev.vehicle_size === '2-wheeler' ? 'all' : '2-wheeler',
            }))
          }
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 pressable transition-all flex items-center gap-1 ${
            searchFilters.vehicle_size === '2-wheeler'
              ? 'bg-[#dfba89] text-[#12100e] shadow-xs'
              : 'bg-[#100e0d] text-[#a89682] border border-[#383028]'
          }`}
        >
          <span>🏍️</span>
          <span>2-Wheeler</span>
        </button>

        <button
          type="button"
          onClick={() =>
            setSearchFilters((prev) => ({
              ...prev,
              vehicle_size: prev.vehicle_size === 'compact-suv' ? 'all' : 'compact-suv',
            }))
          }
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 pressable transition-all flex items-center gap-1 ${
            searchFilters.vehicle_size === 'compact-suv'
              ? 'bg-[#dfba89] text-[#12100e] shadow-xs'
              : 'bg-[#100e0d] text-[#a89682] border border-[#383028]'
          }`}
        >
          <span>🚙</span>
          <span>SUV</span>
        </button>

        <button
          type="button"
          onClick={() =>
            setSearchFilters((prev) => ({ ...prev, has_ev: !prev.has_ev }))
          }
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 pressable transition-all flex items-center gap-1 ${
            searchFilters.has_ev
              ? 'bg-[#dfba89] text-[#12100e] shadow-xs'
              : 'bg-[#100e0d] text-[#a89682] border border-[#383028]'
          }`}
        >
          <Zap className="w-3 h-3" />
          <span>EV Fast</span>
        </button>

        <button
          type="button"
          onClick={() =>
            setSearchFilters((prev) => ({ ...prev, is_covered: !prev.is_covered }))
          }
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 pressable transition-all flex items-center gap-1 ${
            searchFilters.is_covered
              ? 'bg-[#dfba89] text-[#12100e] shadow-xs'
              : 'bg-[#100e0d] text-[#a89682] border border-[#383028]'
          }`}
        >
          <span>☔</span>
          <span>Covered</span>
        </button>
      </div>

      {/* Expanded Filter Panel */}
      {isFilterDrawerOpen && (
        <div className="mt-3 pt-3 border-t border-[#2a231b] grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top duration-250">
          {/* Space Type */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#a89682] mb-1.5">
              Space Type
            </label>
            <select
              value={searchFilters.space_type}
              onChange={(e) =>
                setSearchFilters((prev) => ({
                  ...prev,
                  space_type: e.target.value as SpaceType | 'all',
                }))
              }
              className="w-full px-3 py-2 rounded-lg border border-[#383028] bg-[#100e0d] text-xs text-[#f6f2ec] font-medium focus:ring-2 focus:ring-[#dfba89]/60 transition"
            >
              <option value="all" className="bg-[#181512] text-[#f6f2ec]">All Space Types</option>
              <option value="covered" className="bg-[#181512] text-[#f6f2ec]">Covered / Roofed</option>
              <option value="underground" className="bg-[#181512] text-[#f6f2ec]">Underground / Basement</option>
              <option value="gated" className="bg-[#181512] text-[#f6f2ec]">Gated Residential</option>
              <option value="open" className="bg-[#181512] text-[#f6f2ec]">Open Driveway / Lot</option>
            </select>
          </div>

          {/* Amenities checklist */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#a89682] mb-1.5">
              Features & Amenities
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setSearchFilters((prev) => ({ ...prev, has_ev: !prev.has_ev }))
                }
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 pressable transition-all ${
                  searchFilters.has_ev
                    ? 'bg-[#dfba89]/15 border-[#dfba89] text-[#dfba89]'
                    : 'bg-[#100e0d] border-[#383028] text-[#a89682] hover:bg-[#1c1814] hover:text-[#f6f2ec]'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-[#dfba89]" />
                <span>EV Charging</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setSearchFilters((prev) => ({ ...prev, is_covered: !prev.is_covered }))
                }
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 pressable transition-all ${
                  searchFilters.is_covered
                    ? 'bg-[#dfba89]/15 border-[#dfba89] text-[#dfba89]'
                    : 'bg-[#100e0d] border-[#383028] text-[#a89682] hover:bg-[#1c1814] hover:text-[#f6f2ec]'
                }`}
              >
                <span>☔ Covered Roof</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setSearchFilters((prev) => ({ ...prev, has_cctv: !prev.has_cctv }))
                }
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 pressable transition-all ${
                  searchFilters.has_cctv
                    ? 'bg-[#dfba89]/15 border-[#dfba89] text-[#dfba89]'
                    : 'bg-[#100e0d] border-[#383028] text-[#a89682] hover:bg-[#1c1814] hover:text-[#f6f2ec]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#dfba89]" />
                <span>24/7 CCTV</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setSearchFilters({
                    destination: '',
                    vehicle_size: 'all',
                    space_type: 'all',
                    duration_hours: 2,
                    has_ev: false,
                    has_cctv: false,
                    has_guard: false,
                    is_covered: false,
                  })
                }
                className="px-3 py-1.5 text-xs text-[#e08272] hover:text-[#f09a8b] hover:underline font-semibold ml-auto pressable transition"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
