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
  Sparkles,
  ChevronDown,
  Check
} from 'lucide-react';
import { VehicleSize, SpaceType } from '@/types';

const POPULAR_LOCATIONS = [
  { name: 'Indiranagar 100ft Rd', lat: 12.9719, lng: 77.6412 },
  { name: 'Koramangala 4th Block', lat: 12.9344, lng: 77.6256 },
  { name: 'MG Road Metro', lat: 12.9752, lng: 77.6053 },
  { name: 'Lavelle Road / UB City', lat: 12.9698, lng: 77.5991 },
  { name: 'Victoria Layout', lat: 12.9645, lng: 77.6148 },
];

const VEHICLE_OPTIONS: { value: VehicleSize | 'all'; label: string; icon: string; detail: string }[] = [
  { value: 'all', label: 'Any Vehicle Size', icon: '🚗', detail: 'All spot dimensions' },
  { value: '2-wheeler', label: '2-Wheeler', icon: '🏍️', detail: 'Bike / Scooter' },
  { value: 'hatchback', label: 'Hatchback', icon: '🚙', detail: 'Swift, i20, Polo' },
  { value: 'compact-suv', label: 'Compact SUV', icon: '🚘', detail: 'Creta, Seltos, Nexon' },
  { value: 'large-suv', label: 'Large SUV', icon: '🚐', detail: 'Fortuner, Truck' },
];

const SPACE_TYPE_OPTIONS: { value: SpaceType | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'All Space Types', icon: '🅿️' },
  { value: 'covered', label: 'Covered / Roofed', icon: '☔' },
  { value: 'underground', label: 'Underground / Basement', icon: '🏢' },
  { value: 'gated', label: 'Gated Residential', icon: '🔒' },
  { value: 'open', label: 'Open Driveway / Lot', icon: '☀️' },
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
  const [isVehicleDropdownOpen, setIsVehicleDropdownOpen] = useState(false);
  const [isSpaceTypeDropdownOpen, setIsSpaceTypeDropdownOpen] = useState(false);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const vehicleDropdownRef = useRef<HTMLDivElement>(null);
  const spaceTypeDropdownRef = useRef<HTMLDivElement>(null);

  const selectedVehicleOption = VEHICLE_OPTIONS.find((opt) => opt.value === searchFilters.vehicle_size) || VEHICLE_OPTIONS[0];
  const selectedSpaceOption = SPACE_TYPE_OPTIONS.find((opt) => opt.value === searchFilters.space_type) || SPACE_TYPE_OPTIONS[0];

  // Sync search input if destination changes externally
  useEffect(() => {
    setSearchInput(searchFilters.destination);
  }, [searchFilters.destination]);

  // Close suggestions and dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (vehicleDropdownRef.current && !vehicleDropdownRef.current.contains(e.target as Node)) {
        setIsVehicleDropdownOpen(false);
      }
      if (spaceTypeDropdownRef.current && !spaceTypeDropdownRef.current.contains(e.target as Node)) {
        setIsSpaceTypeDropdownOpen(false);
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

        {/* Vehicle Size Custom Dropdown (Visible on Desktop / Tablets) */}
        <div ref={vehicleDropdownRef} className="hidden sm:block relative shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsVehicleDropdownOpen(!isVehicleDropdownOpen);
              setShowSuggestions(false);
            }}
            className={`flex items-center gap-2 px-3.5 py-3 rounded-xl border text-xs font-semibold pressable transition-all cursor-pointer select-none ${
              isVehicleDropdownOpen || searchFilters.vehicle_size !== 'all'
                ? 'border-[#dfba89]/70 bg-[#221c17] text-[#dfba89] shadow-sm'
                : 'border-[#383028] bg-[#100e0d] hover:bg-[#161310] hover:border-[#dfba89]/40 text-[#f6f2ec]'
            }`}
            aria-expanded={isVehicleDropdownOpen}
            aria-haspopup="listbox"
          >
            <span className="text-sm">{selectedVehicleOption.icon}</span>
            <span>{selectedVehicleOption.label}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#a89682] transition-transform duration-200 ${isVehicleDropdownOpen ? 'rotate-180 text-[#dfba89]' : ''}`} />
          </button>

          {isVehicleDropdownOpen && (
            <div 
              role="listbox" 
              className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-64 bg-[#161310] border border-[#383028] rounded-2xl shadow-2xl shadow-black/90 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right gpu"
            >
              <div className="px-3 py-1.5 text-[10px] font-bold text-[#8a7a6c] uppercase tracking-wider">
                Select Vehicle Size
              </div>
              {VEHICLE_OPTIONS.map((opt) => {
                const isSelected = searchFilters.vehicle_size === opt.value;
                return (
                  <button
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    type="button"
                    onClick={() => {
                      setSearchFilters((prev) => ({ ...prev, vehicle_size: opt.value }));
                      setIsVehicleDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left pressable transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#282119] text-[#dfba89] font-bold border border-[#dfba89]/30'
                        : 'text-[#c2b29d] hover:bg-[#221c17] hover:text-[#f6f2ec]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">{opt.icon}</span>
                      <div className="truncate">
                        <div className="text-xs font-semibold leading-tight">{opt.label}</div>
                        <div className="text-[10px] text-[#756758] mt-0.5 truncate">{opt.detail}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#dfba89] shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
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
          {/* Space Type Custom Dropdown */}
          <div ref={spaceTypeDropdownRef} className="relative">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#a89682] mb-1.5">
              Space Type
            </label>
            <button
              type="button"
              onClick={() => setIsSpaceTypeDropdownOpen(!isSpaceTypeDropdownOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium pressable transition cursor-pointer ${
                isSpaceTypeDropdownOpen || searchFilters.space_type !== 'all'
                  ? 'border-[#dfba89]/70 bg-[#221c17] text-[#dfba89]'
                  : 'border-[#383028] bg-[#100e0d] hover:bg-[#161310] text-[#f6f2ec]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{selectedSpaceOption.icon}</span>
                <span>{selectedSpaceOption.label}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-[#a89682] transition-transform duration-200 ${isSpaceTypeDropdownOpen ? 'rotate-180 text-[#dfba89]' : ''}`} />
            </button>

            {isSpaceTypeDropdownOpen && (
              <div className="absolute left-0 right-0 mt-1.5 bg-[#161310] border border-[#383028] rounded-xl shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top gpu">
                {SPACE_TYPE_OPTIONS.map((opt) => {
                  const isSelected = searchFilters.space_type === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSearchFilters((prev) => ({ ...prev, space_type: opt.value }));
                        setIsSpaceTypeDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#282119] text-[#dfba89] font-bold'
                          : 'text-[#c2b29d] hover:bg-[#201c18] hover:text-[#f6f2ec]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{opt.icon}</span>
                        <span>{opt.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#dfba89]" />}
                    </button>
                  );
                })}
              </div>
            )}
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
