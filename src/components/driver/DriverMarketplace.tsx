'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ParkingSpot } from '@/types';
import ParkingMap from '@/components/map/ParkingMap';
import SearchBar from './SearchBar';
import { 
  MapPin, 
  Star, 
  Car, 
  Zap,
  ShieldCheck, 
  Clock, 
  ChevronRight, 
  Sparkles,
  Layers,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Map,
  EyeOff,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface DriverMarketplaceProps {
  onOpenBookingModal: (spot: ParkingSpot) => void;
  onOpenActiveBookingCard: () => void;
}

export default function DriverMarketplace({
  onOpenBookingModal,
  onOpenActiveBookingCard,
}: DriverMarketplaceProps) {
  const {
    filteredSpots,
    spots,
    selectedSpot,
    setSelectedSpot,
    mapCenter,
    mapZoom,
    activeDriverBooking,
    openCheckout,
    userLiveLocation,
    setSearchFilters,
    setIsListSpotOpen,
    seedDemoSpotsAroundLocation,
  } = useApp();

  const [isMapCollapsed, setIsMapCollapsed] = useState(false);
  const [isMapMaximized, setIsMapMaximized] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Top Search & Filter Bar Container */}
      <div className="z-20 px-3 sm:px-6 pt-2.5 sm:pt-4 max-w-7xl mx-auto w-full">
        <SearchBar />

        {/* Active Booking Banner Alert (if driver has a live session) */}
        {activeDriverBooking && (
          <div 
            onClick={onOpenActiveBookingCard}
            className="mt-2.5 p-3 rounded-2xl bg-gradient-to-r from-[#241d16] via-[#2c231a] to-[#1e1812] border border-[#dfba89]/30 text-[#f6f2ec] shadow-lg shadow-black/40 flex items-center justify-between cursor-pointer hover:border-[#dfba89]/60 transition"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full bg-[#dfba89] animate-ping shrink-0" />
              <div className="truncate">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#dfba89] block">
                  Active Parking Session
                </span>
                <p className="text-xs font-bold text-white truncate">
                  {activeDriverBooking.spot_title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono font-bold bg-[#141210] text-[#dfba89] border border-[#383028] px-2 py-0.5 rounded">
                Access: {activeDriverBooking.access_code}
              </span>
              <ChevronRight className="w-4 h-4 text-[#dfba89]" />
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area: Responsive Layout with Side-by-Side on Desktop and Tabbed/Pill on Mobile */}
      <div className="flex-1 flex flex-col lg:flex-row-reverse min-h-0 mt-3 sm:mt-4 max-w-7xl mx-auto w-full px-3 sm:px-6 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] md:pb-8 gap-5 items-start">
        
        {/* MAP CONTAINER: Full height on mobile map mode, sticky on desktop */}
        <div className={`${mobileView === 'map' ? 'block' : 'hidden'} lg:block w-full ${isMapMaximized ? 'lg:w-[500px] xl:w-[560px]' : 'lg:w-[380px] xl:w-[420px]'} shrink-0 lg:sticky lg:top-20 z-10 transition-all duration-300`}>
          {isMapCollapsed ? (
            <div className="w-full bg-[#181512] rounded-2xl p-3 border border-[#383028] shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#f6f2ec]">
                <Map className="w-4 h-4 text-[#dfba89]" />
                <span>Map Minimized</span>
                <span className="text-[10px] text-[#a89682]">({filteredSpots.length} pins)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMapCollapsed(false)}
                className="px-3 py-1 rounded-xl bg-[#241f1a] hover:bg-[#2e2620] text-[#dfba89] border border-[#dfba89]/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <span>Expand Map</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="w-full bg-[#141210] rounded-3xl overflow-hidden border border-[#383028] shadow-2xl flex flex-col transition-all duration-300">
              {/* Dedicated Map Card Header */}
              <div className="px-3.5 py-2 bg-[#181512] border-b border-[#2c251e] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#f6f2ec]">
                  <Map className="w-3.5 h-3.5 text-[#dfba89]" />
                  <span>Interactive Map</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-[#241f1a] text-[#dfba89] rounded-md font-semibold border border-[#383028]">
                    {filteredSpots.length} spots
                  </span>
                </div>

                {/* Window Actions */}
                <div className="flex items-center gap-1.5">
                  {/* Mobile Back to List Button */}
                  <button
                    type="button"
                    onClick={() => setMobileView('list')}
                    className="lg:hidden px-2.5 py-1 rounded-xl bg-[#241f1a] text-[#dfba89] border border-[#dfba89]/40 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Layers className="w-3 h-3 text-[#dfba89]" />
                    <span>View List</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsMapMaximized(!isMapMaximized)}
                    className="hidden sm:flex px-2.5 py-1 rounded-xl bg-[#241f1a] hover:bg-[#2e2620] text-[#c2b29d] hover:text-[#f6f2ec] border border-[#383028] text-[10px] font-bold transition items-center gap-1 cursor-pointer"
                    title={isMapMaximized ? 'Restore default map size' : 'Maximize map size'}
                  >
                    {isMapMaximized ? (
                      <>
                        <Minimize2 className="w-3 h-3 text-[#dfba89]" />
                        <span>Restore</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-3 h-3 text-[#dfba89]" />
                        <span>Maximize</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMapCollapsed(true)}
                    className="hidden lg:flex px-2.5 py-1 rounded-xl bg-[#241f1a] hover:bg-[#2e2620] text-[#c2b29d] hover:text-[#f6f2ec] border border-[#383028] text-[10px] font-bold transition items-center gap-1 cursor-pointer"
                    title="Minimize map to view parking spots list"
                  >
                    <EyeOff className="w-3 h-3 text-[#dfba89]" />
                    <span>Minimize</span>
                  </button>
                </div>
              </div>

              {/* Map Canvas: Full responsive height on mobile */}
              <div className={`w-full ${isMapMaximized ? 'h-[380px] sm:h-[460px] lg:h-[580px]' : 'h-[calc(100vh-250px)] sm:h-[300px] lg:h-[430px]'} lg:max-h-[calc(100vh-180px)] relative transition-all duration-300`}>
                <ParkingMap
                  spots={filteredSpots}
                  selectedSpot={selectedSpot}
                  onSelectSpot={(spot) => {
                    setSelectedSpot(spot);
                  }}
                  center={mapCenter}
                  zoom={mapZoom}
                  userLocation={userLiveLocation}
                />

              {/* Floating Selected Spot Preview Card on Map */}
              {selectedSpot && (
                <div className="absolute bottom-2 left-2 right-2 z-[410] bg-[#181512]/95 backdrop-blur-md rounded-2xl p-2.5 shadow-2xl border border-[#383028] animate-in slide-in-from-bottom duration-200">
                  <div className="flex items-start gap-2.5">
                    {selectedSpot.photos && selectedSpot.photos.length > 0 ? (
                      <img
                        src={selectedSpot.photos[0]}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#383028]"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl shrink-0 border border-[#383028] bg-[#100e0d] flex items-center justify-center text-[#dfba89]">
                        <Car className="w-5 h-5 opacity-80" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className="font-bold text-xs text-[#f6f2ec] truncate">
                          {selectedSpot.title}
                        </h5>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSpot(null);
                          }}
                          className="text-[#a89682] hover:text-white p-0.5"
                          title="Close preview"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-[#a89682] truncate mt-0.5">
                        {selectedSpot.address}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs font-black text-[#dfba89]">
                          ₹{selectedSpot.hourly_rate}/hr
                        </span>
                        {selectedSpot.distance_km !== undefined && (
                          <span className="text-[9px] font-bold text-[#dfba89] bg-[#241f1a] border border-[#dfba89]/30 px-1.5 py-0.5 rounded">
                            📍 {selectedSpot.distance_km} km
                          </span>
                        )}
                        {selectedSpot.amenities.includes('ev_charging') && (
                          <span className="text-[9px] font-bold text-[#dfba89]">
                            ⚡ EV
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-[#2c251e] flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenBookingModal(selectedSpot)}
                      className="text-[11px] font-bold text-[#a89682] hover:text-[#f6f2ec] transition"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => openCheckout(selectedSpot)}
                      className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-bold text-xs shadow-md shadow-[#dfba89]/20 transition"
                    >
                      Book ₹{selectedSpot.hourly_rate}/hr
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        </div>

        {/* REST OF THE AREA: EXPANSIVE PARKING SPACES LISTING GRID */}
        <div className={`${mobileView === 'list' ? 'block' : 'hidden'} lg:block flex-1 min-w-0 w-full space-y-4`}>
          {/* Header Banner */}
          <div className="p-3 bg-[#181512] rounded-2xl border border-[#383028] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-[#f6f2ec]">
                  Available Parking Spaces
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#241f1a] text-[#dfba89] border border-[#383028] text-xs font-bold">
                  {filteredSpots.length}
                </span>
              </div>
              <p className="text-[11px] text-[#a89682] mt-0.5">
                Displaying verified private parking spaces across the area
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile Switch to Map Button */}
              <button
                type="button"
                onClick={() => setMobileView('map')}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#241f1a] hover:bg-[#2f2720] text-[#dfba89] border border-[#dfba89]/30 text-xs font-bold transition shadow-xs cursor-pointer"
                title="Switch to Map view"
              >
                <Map className="w-3.5 h-3.5 text-[#dfba89]" />
                <span>Map View</span>
              </button>

              <button
                type="button"
                onClick={() => setIsMapCollapsed(!isMapCollapsed)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#241f1a] hover:bg-[#2f2720] text-[#c2b29d] hover:text-[#f6f2ec] border border-[#383028] text-xs font-bold transition shadow-xs cursor-pointer"
                title={isMapCollapsed ? 'Show map' : 'Hide map to view more parking spaces'}
              >
                <Map className="w-3.5 h-3.5 text-[#dfba89]" />
                <span>{isMapCollapsed ? 'Show Map' : 'Hide Map'}</span>
              </button>

              <button
                type="button"
                onClick={() => seedDemoSpotsAroundLocation()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#241f1a] hover:bg-[#2f2720] text-[#dfba89] border border-[#dfba89]/30 hover:border-[#dfba89]/60 text-xs font-bold transition shadow-xs cursor-pointer"
                title="Add or refresh demo parking spaces around your location"
              >
                <MapPin className="w-3.5 h-3.5 text-[#dfba89]" />
                <span className="hidden sm:inline">Demo Spots Around Me</span>
                <span className="sm:hidden">Demo Spots</span>
              </button>
            </div>
          </div>

          {/* Empty State */}
          {filteredSpots.length === 0 ? (
            <div className="p-12 text-center bg-[#181512] rounded-3xl border border-dashed border-[#383028]">
              <Car className="w-12 h-12 text-[#756758] mx-auto mb-3" />
              <h4 className="font-bold text-[#f6f2ec] text-base">
                {spots.length === 0 ? 'No parking spaces listed yet' : 'No parking spaces found'}
              </h4>
              <p className="text-xs text-[#a89682] max-w-sm mx-auto mt-1 mb-4">
                {spots.length === 0
                  ? 'There are currently no parking spaces listed on ParkEase. Spawn instant demo parking spots near your location to test all features!'
                  : 'Try widening your vehicle size filter or resetting your search filters to view all nearby locations.'}
              </p>
              {spots.length === 0 ? (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => seedDemoSpotsAroundLocation()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-bold text-xs shadow-md shadow-[#dfba89]/20 transition cursor-pointer flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4 text-[#12100e]" />
                    <span>Add Demo Spots Around Me</span>
                  </button>
                  <button
                    onClick={() => setIsListSpotOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-[#241f1a] hover:bg-[#2c2620] text-[#f6f2ec] border border-[#383028] font-bold text-xs transition cursor-pointer"
                  >
                    List a Parking Space
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
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
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#dfba89] to-[#b37d4e] text-[#12100e] font-bold text-xs shadow-md shadow-[#dfba89]/20 cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                  <button
                    onClick={() => seedDemoSpotsAroundLocation()}
                    className="px-4 py-2 rounded-xl bg-[#241f1a] hover:bg-[#2c2620] text-[#dfba89] border border-[#dfba89]/30 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#dfba89]" />
                    <span>Re-seed Spots Around Me</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Multi-column grid filling the rest of the page */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
              {filteredSpots.map((spot) => {
                const isSelected = selectedSpot?.id === spot.id;
                const isCharger = spot.amenities.includes('ev_charging');

                return (
                  <div
                    key={spot.id}
                    onClick={() => setSelectedSpot(spot)}
                    className={`bg-[#181512] rounded-3xl border transition-all duration-200 overflow-hidden cursor-pointer flex flex-col group shadow-lg shadow-black/40 ${
                      isSelected
                        ? 'border-[#dfba89] ring-2 ring-[#dfba89]/30'
                        : 'border-[#383028] hover:border-[#dfba89]/50'
                    }`}
                  >
                    {/* Spot Card Image or Placeholder */}
                    <div className="relative aspect-[16/10] w-full bg-[#100e0d] overflow-hidden flex items-center justify-center">
                      {spot.photos && spot.photos.length > 0 ? (
                        <img
                          src={spot.photos[0]}
                          alt={spot.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1c1815] to-[#100e0d] border-b border-[#2d2620]">
                          <div className="w-12 h-12 rounded-2xl bg-[#241f1a] border border-[#383028] flex items-center justify-center text-[#dfba89] shadow-inner mb-1.5">
                            <Car className="w-6 h-6" />
                          </div>
                          <span className="text-[11px] font-semibold text-[#a89682]">Verified Space</span>
                        </div>
                      )}
                      
                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-full bg-[#141210]/90 backdrop-blur-md text-[#f6f2ec] border border-[#383028] text-[10px] font-bold capitalize shadow-xs">
                          {spot.space_type}
                        </span>
                        {isCharger && (
                          <span className="px-2.5 py-1 rounded-full bg-[#282119] text-[#dfba89] border border-[#dfba89]/40 text-[10px] font-bold flex items-center gap-1 shadow-sm">
                            <Zap className="w-3 h-3 text-[#dfba89] fill-[#dfba89]" />
                            <span>EV Fast</span>
                          </span>
                        )}
                      </div>

                      {/* Hourly Price Tag */}
                      <div className="absolute bottom-3 right-3 bg-[#141210]/90 backdrop-blur-md text-white px-3 py-1 rounded-xl shadow-md border border-[#383028] flex items-baseline gap-1">
                        <span className="text-base font-black text-[#dfba89]">₹{spot.hourly_rate}</span>
                        <span className="text-[10px] text-[#a89682] font-semibold">/hr</span>
                      </div>
                    </div>

                    {/* Spot Card Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        {/* Title */}
                        <h4 className="font-bold text-sm text-[#f6f2ec] leading-snug line-clamp-1 group-hover:text-[#dfba89] transition">
                          {spot.title}
                        </h4>

                        {/* Location */}
                        <div className="flex items-center gap-1 text-[11px] text-[#a89682] mt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#dfba89] shrink-0" />
                          <span className="truncate">{spot.address}</span>
                        </div>

                        {/* Live Distance Pill */}
                        {spot.distance_km !== undefined && (
                          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#dfba89] bg-[#241f1a] border border-[#dfba89]/30 px-2 py-0.5 rounded-lg mt-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#dfba89] animate-ping" />
                            <span>{spot.distance_km} km from your live location</span>
                          </div>
                        )}

                        {/* Tags: Vehicle size & rating */}
                        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[#2c251e]">
                          <span className="px-2 py-0.5 rounded-md bg-[#241f1a] text-[#c2b29d] border border-[#383028] text-[10px] font-bold uppercase tracking-wider">
                            Fits {spot.vehicle_size.replace('-', ' ')}
                          </span>

                          <div className="flex items-center gap-1 text-xs text-[#dfba89] font-bold">
                            <Star className="w-3.5 h-3.5 fill-[#dfba89] text-[#dfba89]" />
                            <span>{spot.rating || 4.9}</span>
                            <span className="text-[10px] text-[#756758] font-normal">
                              ({spot.reviews_count || 24})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSpot(spot);
                            onOpenBookingModal(spot);
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-[#c2b29d] hover:text-[#f6f2ec] hover:bg-[#241f1a] transition"
                        >
                          Spot Details
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCheckout(spot);
                          }}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-bold text-xs shadow-md shadow-[#dfba89]/20 transition flex items-center gap-1"
                        >
                          <span>Reserve Spot</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#12100e]" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Map / List Toggle Button for Mobile Screens (Airbnb-style pill) */}
      <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-30 lg:hidden pointer-events-auto">
        <button
          type="button"
          onClick={() => setMobileView(mobileView === 'list' ? 'map' : 'list')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#181512]/95 backdrop-blur-md border border-[#dfba89]/50 text-[#dfba89] font-black text-xs shadow-2xl shadow-black/90 hover:bg-[#221d18] active:scale-95 transition-all cursor-pointer"
        >
          {mobileView === 'list' ? (
            <>
              <Map className="w-4 h-4 text-[#dfba89]" />
              <span>Map View ({filteredSpots.length})</span>
            </>
          ) : (
            <>
              <Layers className="w-4 h-4 text-[#dfba89]" />
              <span>List View ({filteredSpots.length})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
