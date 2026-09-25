'use client';

import React, { useState, useEffect } from 'react';
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
  Filter
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
    addToast,
  } = useApp();

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchFilters.destination);

  // Sync search input if destination changes externally
  useEffect(() => {
    setSearchInput(searchFilters.destination);
  }, [searchFilters.destination]);

  // Handle location search
  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    // Check if matching popular locations
    const matched = POPULAR_LOCATIONS.find((loc) =>
      loc.name.toLowerCase().includes(searchInput.toLowerCase())
    );

    if (matched) {
      setMapCenter([matched.lat, matched.lng]);
      setMapZoom(15);
      setSearchFilters((prev) => ({ ...prev, destination: matched.name, lat: matched.lat, lng: matched.lng }));
      addToast('Location updated', `Centered map around ${matched.name}`, 'info');
    } else {
      setSearchFilters((prev) => ({ ...prev, destination: searchInput }));
      addToast('Searching destination', `Filtering spots near "${searchInput}"`, 'info');
    }
  };

  return (
    <div className="w-full bg-[#181512] rounded-2xl shadow-xl shadow-black/50 border border-[#383028] p-3 sm:p-4 backdrop-blur-md">
      {/* Top search input row */}
      <form onSubmit={handleLocationSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        {/* Search input with pin */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#dfba89]">
            <MapPin className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search destination, area, or landmark..."
            className="w-full pl-11 pr-10 py-3 bg-[#100e0d] hover:bg-[#14120f] focus:bg-[#100e0d] text-[#f6f2ec] text-sm font-medium rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60 focus:border-transparent placeholder-[#756758] transition"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setSearchFilters((prev) => ({ ...prev, destination: '' }));
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#756758] hover:text-[#f6f2ec]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Vehicle Size Quick Dropdown */}
        <div className="shrink-0">
          <select
            value={searchFilters.vehicle_size}
            onChange={(e) =>
              setSearchFilters((prev) => ({
                ...prev,
                vehicle_size: e.target.value as VehicleSize | 'all',
              }))
            }
            className="w-full sm:w-auto px-3.5 py-3 rounded-xl border border-[#383028] bg-[#100e0d] hover:bg-[#14120f] text-[#f6f2ec] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60 transition cursor-pointer"
          >
            <option value="all" className="bg-[#181512] text-[#f6f2ec]">🚗 Any Vehicle Size</option>
            <option value="2-wheeler" className="bg-[#181512] text-[#f6f2ec]">🏍️ 2-Wheeler (Bike / Scooter)</option>
            <option value="hatchback" className="bg-[#181512] text-[#f6f2ec]">🚙 Hatchback (Swift, i20)</option>
            <option value="compact-suv" className="bg-[#181512] text-[#f6f2ec]">🚘 Compact SUV (Creta, Seltos)</option>
            <option value="large-suv" className="bg-[#181512] text-[#f6f2ec]">🚐 Large SUV / Pickup (Fortuner, Truck)</option>
          </select>
        </div>

        {/* Filters Toggle Button */}
        <button
          type="button"
          onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
          className={`shrink-0 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-xs font-bold transition ${
            isFilterDrawerOpen || searchFilters.has_ev || searchFilters.is_covered || searchFilters.has_cctv || searchFilters.space_type !== 'all'
              ? 'bg-[#dfba89] text-[#12100e] border-[#dfba89] shadow-sm'
              : 'border-[#383028] bg-[#1c1814] text-[#d6c7b2] hover:bg-[#25201a]'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {(searchFilters.has_ev || searchFilters.is_covered || searchFilters.has_cctv || searchFilters.space_type !== 'all') && (
            <span className="w-2 h-2 rounded-full bg-[#12100e]"></span>
          )}
        </button>

        {/* Search Submit button */}
        <button
          type="submit"
          className="shrink-0 px-5 py-3 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] text-xs font-bold shadow-md shadow-[#dfba89]/25 hover:shadow-lg transition flex items-center justify-center gap-1.5"
        >
          <Search className="w-4 h-4 text-[#12100e]" />
          <span>Search</span>
        </button>
      </form>

      {/* Expanded Filter Panel */}
      {isFilterDrawerOpen && (
        <div className="mt-3 pt-3 border-t border-[#2a231b] grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-200">
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
              className="w-full px-3 py-2 rounded-lg border border-[#383028] bg-[#100e0d] text-xs text-[#f6f2ec] font-medium focus:ring-2 focus:ring-[#dfba89]/60"
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
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
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
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
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
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
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
                className="px-3 py-1.5 text-xs text-[#e08272] hover:text-[#f09a8b] hover:underline font-semibold ml-auto"
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
