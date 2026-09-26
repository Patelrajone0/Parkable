'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { VehicleSize, SpaceType } from '@/types';
import ParkingMap from '@/components/map/ParkingMap';
import { 
  X, 
  MapPin, 
  Sparkles, 
  Camera, 
  UploadCloud, 
  Trash2, 
  Navigation, 
  ChevronDown, 
  ChevronUp, 
  Sliders, 
  Loader2 
} from 'lucide-react';

interface ListSpotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuickPreset {
  id: string;
  name: string;
  tag: string;
  icon: string;
  spaceType: SpaceType;
  vehicleSize: VehicleSize;
  hourlyRate: number;
  amenities: string[];
  dimensions: string;
  photoUrl: string;
  description: string;
}

const QUICK_PRESETS: QuickPreset[] = [
  {
    id: 'driveway',
    name: 'Home Driveway',
    tag: 'Most Popular',
    icon: '🏡',
    spaceType: 'open',
    vehicleSize: 'compact-suv',
    hourlyRate: 60,
    amenities: [],
    dimensions: '5.2m x 2.6m x 2.4m',
    photoUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&auto=format&fit=crop&q=80',
    description: 'Paved, spacious private residential driveway with direct street access and night lighting.',
  },
  {
    id: 'ev_bay',
    name: 'EV Charging Bay',
    tag: 'High Demand',
    icon: '⚡',
    spaceType: 'covered',
    vehicleSize: 'compact-suv',
    hourlyRate: 120,
    amenities: [],
    dimensions: '5.4m x 2.8m x 2.4m',
    photoUrl: 'https://images.unsplash.com/photo-1617886903355-9354752c0fd1?w=800&auto=format&fit=crop&q=80',
    description: 'Covered parking bay equipped with Level 2 EV charger, 24/7 CCTV surveillance and secure access.',
  },
  {
    id: 'garage',
    name: 'Covered Garage',
    tag: 'Weatherproof',
    icon: '🏢',
    spaceType: 'covered',
    vehicleSize: 'compact-suv',
    hourlyRate: 80,
    amenities: [],
    dimensions: '5.4m x 2.8m x 2.4m',
    photoUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80',
    description: 'Secure covered garage space protected from sun and rain with security guard on duty.',
  },
  {
    id: 'twowheeler',
    name: '2-Wheeler Slot',
    tag: 'Fast Booking',
    icon: '🏍️',
    spaceType: 'gated',
    vehicleSize: '2-wheeler',
    hourlyRate: 30,
    amenities: [],
    dimensions: '2.4m x 1.2m x 2.0m',
    photoUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
    description: 'Safe gated parking space reserved specifically for motorcycles and electric scooters.',
  },
  {
    id: 'society',
    name: 'Apartment Visitor Bay',
    tag: 'Guarded',
    icon: '🛡️',
    spaceType: 'underground',
    vehicleSize: 'large-suv',
    hourlyRate: 100,
    amenities: [],
    dimensions: '5.6m x 3.0m x 2.6m',
    photoUrl: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800&auto=format&fit=crop&q=80',
    description: 'Designated visitor parking slot in premium gated apartment complex with 24/7 security.',
  },
];

export default function ListSpotModal({ isOpen, onClose }: ListSpotModalProps) {
  const { 
    addSpot, 
    mapCenter, 
    platformCommissionRate, 
    addToast,
    userLiveLocation,
    setActiveRole 
  } = useApp();

  const defaultPreset = QUICK_PRESETS[0];
  const [selectedPresetId, setSelectedPresetId] = useState<string>('driveway');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(defaultPreset.description);
  const [address, setAddress] = useState('88, 100 Feet Road, Indiranagar');
  const [city, setCity] = useState('Bengaluru');
  const [pinCoords, setPinCoords] = useState<{ lat: number; lng: number }>({
    lat: 12.9719,
    lng: 77.6412,
  });

  const [spaceType, setSpaceType] = useState<SpaceType>(defaultPreset.spaceType);
  const [vehicleSize, setVehicleSize] = useState<VehicleSize>(defaultPreset.vehicleSize);
  const [dimensions, setDimensions] = useState(defaultPreset.dimensions);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [rules, setRules] = useState<string>('No blocking driveway, Park within marked bay');
  const [accessInstructions, setAccessInstructions] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number>(defaultPreset.hourlyRate);
  const [isActive, setIsActive] = useState<boolean>(true);
  
  // File upload & Camera references
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  // Sync initial GPS location if available
  useEffect(() => {
    if (userLiveLocation && userLiveLocation.lat && isOpen) {
      setPinCoords(userLiveLocation);
    }
  }, [userLiveLocation, isOpen]);

  if (!isOpen) return null;

  // Apply a 1-click preset
  const handleApplyPreset = (preset: QuickPreset) => {
    setSelectedPresetId(preset.id);
    setSpaceType(preset.spaceType);
    setVehicleSize(preset.vehicleSize);
    setHourlyRate(preset.hourlyRate);
    setAmenities(preset.amenities);
    setDimensions(preset.dimensions);
    setDescription(preset.description);

    // Update title smartly
    const roadSummary = address ? address.split(',')[0] : 'Indiranagar';
    setTitle(`${preset.name} near ${roadSummary}`);
    addToast('Template Applied', `Configured as ${preset.name} (₹${preset.hourlyRate}/hr)`, 'info');
  };

  // 1-Click Auto-Detect Location with OpenStreetMap Nominatim reverse geocode
  const handleDetectLocation = () => {
    setIsDetectingLocation(true);

    const applyCoords = async (lat: number, lng: number) => {
      setPinCoords({ lat, lng });
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
          { headers: { Accept: 'application/json' } }
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.address) {
            const road = data.address.road || data.address.pedestrian || data.address.suburb || '';
            const area = data.address.suburb || data.address.neighbourhood || data.address.city_district || '';
            const houseNo = data.address.house_number ? `${data.address.house_number}, ` : '';
            const streetLine = `${houseNo}${road}${area && area !== road ? `, ${area}` : ''}`.trim() || data.display_name?.split(',').slice(0, 2).join(',') || 'Current Location';
            const cityFound = data.address.city || data.address.town || data.address.village || data.address.county || 'Bengaluru';
            
            setAddress(streetLine);
            setCity(cityFound);

            const activePreset = QUICK_PRESETS.find(p => p.id === selectedPresetId) || defaultPreset;
            setTitle(`${activePreset.name} on ${streetLine}`);

            addToast('Location Detected! 📍', `${streetLine}, ${cityFound}`, 'success');
          }
        }
      } catch (err) {
        console.warn('Reverse geocoding note:', err);
        addToast('Coordinates Updated', `Set to ${lat.toFixed(4)}, ${lng.toFixed(4)}`, 'info');
      } finally {
        setIsDetectingLocation(false);
      }
    };

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          applyCoords(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          if (userLiveLocation && userLiveLocation.lat) {
            applyCoords(userLiveLocation.lat, userLiveLocation.lng);
          } else {
            applyCoords(mapCenter[0], mapCenter[1]);
          }
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else if (userLiveLocation && userLiveLocation.lat) {
      applyCoords(userLiveLocation.lat, userLiveLocation.lng);
    } else {
      applyCoords(mapCenter[0], mapCenter[1]);
    }
  };

  // Map pin placement handler
  const handlePinPlaced = async (coords: { lat: number; lng: number }) => {
    setPinCoords(coords);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          const road = data.address.road || data.address.pedestrian || data.address.suburb || '';
          const area = data.address.suburb || data.address.neighbourhood || '';
          const fullStreet = [road, area].filter(Boolean).join(', ');
          if (fullStreet) {
            setAddress(fullStreet);
            const cityFound = data.address.city || data.address.town || 'Bengaluru';
            setCity(cityFound);
          }
        }
      }
    } catch {
      // quiet fallback
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        addToast('Invalid File', 'Please select an image file (PNG, JPG, WEBP).', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const resultStr = e.target.result as string;
          setUploadedPhotos((prev) => [...prev, resultStr]);
          addToast('Photo Uploaded', `Added "${file.name}" to parking photos`, 'success');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (id: string) => {
    setAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const activePreset = QUICK_PRESETS.find(p => p.id === selectedPresetId) || defaultPreset;
    const finalTitle = title.trim() || `${activePreset.name} on ${address.split(',')[0] || city}`;

    try {
      await addSpot({
        title: finalTitle,
        description: description.trim() || activePreset.description,
        address: address.trim() || 'Indiranagar 100ft Road',
        city: city.trim() || 'Bengaluru',
        lat: pinCoords.lat,
        lng: pinCoords.lng,
        hourly_rate: hourlyRate,
        vehicle_size: vehicleSize,
        space_type: spaceType,
        amenities,
        rules: rules ? rules.split(',').map((r: string) => r.trim()).filter(Boolean) : ['No blocking exit'],
        dimensions,
        photos: uploadedPhotos,
        is_active: isActive,
        instant_book: true,
        access_instructions: accessInstructions,
      });

      setIsSubmitting(false);
      onClose();
      setActiveRole('host');
      addToast('Listing Published! 🚀', `"${finalTitle}" is now live for drivers to book.`, 'success');
    } catch (err) {
      setIsSubmitting(false);
      addToast('Error', 'Failed to publish spot listing.', 'error');
    }
  };

  // Commission calculations
  const platformFee = Math.round(hourlyRate * platformCommissionRate);
  const hostNetHourly = hourlyRate - platformFee;
  const estimatedMonthly = hostNetHourly * 4 * 30; // 4 hrs/day x 30 days

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#181512] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] border border-[#383028]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#12100e] text-[#f6f2ec] border-b border-[#383028] flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#dfba89]/20 text-[#dfba89] border border-[#dfba89]/40 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Express Listing
              </span>
              <span className="text-[#756758]">•</span>
              <span className="text-xs text-[#a89682]">Host Portal</span>
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-[#f6f2ec] mt-0.5">
              List Your Parking Spot
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1c1814] hover:bg-[#28211a] text-[#f6f2ec] border border-[#383028] flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body: Express Method Only */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-[#f6f2ec] space-y-5">
          
          {/* Section 1: 1-Click Smart Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#dfba89] flex items-center gap-1.5">
                <span>1. Select Spot Template</span>
                <span className="text-[10px] font-normal text-[#a89682]">(Auto-fills 90% of details)</span>
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {QUICK_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                      isSelected
                        ? 'border-[#dfba89] bg-[#dfba89]/15 shadow-md shadow-[#dfba89]/10 ring-1 ring-[#dfba89]/50'
                        : 'border-[#383028] bg-[#201c18]/80 hover:bg-[#28211a] hover:border-[#dfba89]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-2xl">{preset.icon}</span>
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                        isSelected 
                          ? 'bg-[#dfba89] text-[#12100e]' 
                          : 'bg-[#12100e] text-[#a89682] border border-[#383028]'
                      }`}>
                        {preset.tag}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-[#f6f2ec] leading-tight">
                      {preset.name}
                    </div>
                    <div className="text-[11px] font-semibold text-[#dfba89] mt-1">
                      ₹{preset.hourlyRate}<span className="text-[#a89682] font-normal">/hr</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Location & Address with 1-Click GPS */}
          <div className="p-4 rounded-2xl bg-[#1c1814] border border-[#383028] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-[#dfba89] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#dfba89]" />
                <span>2. Spot Location</span>
              </label>

              <button
                type="button"
                disabled={isDetectingLocation}
                onClick={handleDetectLocation}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                {isDetectingLocation ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Navigation className="w-3.5 h-3.5 text-[#12100e]" />
                )}
                <span>{isDetectingLocation ? 'Locating...' : '📍 Auto-Detect GPS'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 42, 100 Feet Rd, Indiranagar"
                  className="w-full px-3.5 py-2.5 text-xs font-medium bg-[#100e0d] text-[#f6f2ec] placeholder-[#756758] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City (e.g. Bengaluru)"
                  className="w-full px-3.5 py-2.5 text-xs font-medium bg-[#100e0d] text-[#f6f2ec] placeholder-[#756758] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                />
              </div>
            </div>

            {/* Compact Interactive Map Preview */}
            <div className="h-44 w-full rounded-xl overflow-hidden border border-[#383028] relative shadow-inner">
              <ParkingMap
                spots={[]}
                selectedSpot={null}
                onSelectSpot={() => {}}
                center={[pinCoords.lat, pinCoords.lng]}
                zoom={15}
                interactivePinPlacement={true}
                onPinPlaced={handlePinPlaced}
                pinCoords={pinCoords}
              />
              <div className="absolute bottom-2 left-2 right-2 bg-[#141210]/90 border border-[#383028] backdrop-blur-md text-[#f6f2ec] text-[10px] py-1 px-2.5 rounded-lg text-center pointer-events-none z-20 flex items-center justify-center gap-1.5 shadow-sm">
                <span className="text-[#dfba89]">📍</span>
                <span>Click or drag pin to adjust entrance gate</span>
                <span className="text-[#756758]">|</span>
                <span className="font-mono text-[#dfba89]">{pinCoords.lat.toFixed(4)}, {pinCoords.lng.toFixed(4)}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Hourly Pricing & Net Income */}
          <div className="p-4 rounded-2xl bg-[#1c1814] border border-[#383028] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-[#dfba89]">
                3. Hourly Rate & Earnings
              </label>
              <span className="text-[11px] font-bold text-[#34d399] bg-[#34d399]/15 px-2 py-0.5 rounded-md border border-[#34d399]/30">
                Est. ₹{estimatedMonthly.toLocaleString()}/mo passive
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-[#dfba89]">₹</span>
                <input
                  type="number"
                  min="20"
                  max="1000"
                  step="5"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseInt(e.target.value) || 0)}
                  className="w-full pl-8 pr-12 py-2 text-xl font-black bg-[#100e0d] text-[#dfba89] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#a89682]">/ hr</span>
              </div>

              {/* Fast price chips */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                {[30, 60, 80, 100, 120, 150].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setHourlyRate(rate)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      hourlyRate === rate
                        ? 'bg-[#dfba89] text-[#12100e]'
                        : 'bg-[#201c18] border border-[#383028] text-[#c2b29d] hover:bg-[#28211a]'
                    }`}
                  >
                    ₹{rate}
                  </button>
                ))}
              </div>
            </div>

            {/* Earnings breakdown banner */}
            <div className="flex items-center justify-between text-[11px] text-[#a89682] pt-1 border-t border-[#2c251e]">
              <span>Driver pays: <strong className="text-[#f6f2ec]">₹{hourlyRate}/hr</strong></span>
              <span>Platform fee: <span className="text-[#e08272]">10% (₹{platformFee})</span></span>
              <span>You take home: <strong className="text-[#34d399] font-bold">₹{hostNetHourly}/hr</strong></span>
            </div>
          </div>

          {/* Instant Publish Button (Primary) */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#dfba89]/25 transition cursor-pointer active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#12100e]" />
                <span>Publishing Listing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#12100e]" />
                <span>⚡ Publish Spot Now (Instant Live)</span>
              </>
            )}
          </button>

          {/* Expandable Advanced Options Section */}
          <div className="border border-[#383028] rounded-2xl bg-[#141210] overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-[#c2b29d] hover:text-[#dfba89] transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-[#dfba89]" />
                <span>Customize Details (Photos, Access, Amenities, Rules)</span>
              </div>
              {showAdvancedOptions ? (
                <ChevronUp className="w-4 h-4 text-[#a89682]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#a89682]" />
              )}
            </button>

            {showAdvancedOptions && (
              <div className="p-4 border-t border-[#383028] space-y-4 bg-[#100e0d]/50 animate-in fade-in duration-200">
                
                {/* Custom Title & Description */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#a89682]">
                    Spot Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Shaded Driveway with EV Charger near Indiranagar"
                    className="w-full px-3.5 py-2 text-xs font-medium bg-[#100e0d] text-[#f6f2ec] placeholder-[#756758] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                  />
                </div>

                {/* Space Type & Vehicle Size */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#a89682] mb-1.5">
                      Space Type
                    </label>
                    <select
                      value={spaceType}
                      onChange={(e) => setSpaceType(e.target.value as SpaceType)}
                      className="w-full px-3 py-2 text-xs bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                    >
                      <option value="open">☀️ Open Driveway</option>
                      <option value="covered">☔ Covered Roof</option>
                      <option value="underground">🏢 Underground Bay</option>
                      <option value="gated">🏡 Gated Villa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#a89682] mb-1.5">
                      Max Vehicle Size
                    </label>
                    <select
                      value={vehicleSize}
                      onChange={(e) => setVehicleSize(e.target.value as VehicleSize)}
                      className="w-full px-3 py-2 text-xs bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                    >
                      <option value="2-wheeler">🏍️ 2-Wheeler (Bike / Scooter)</option>
                      <option value="hatchback">🚗 Hatchback (Compact)</option>
                      <option value="compact-suv">🚙 Compact SUV (Creta / Nexon)</option>
                      <option value="large-suv">🚐 Large SUV (Fortuner / Thar)</option>
                    </select>
                  </div>
                </div>

                {/* Access Instructions */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#a89682] mb-1">
                    Access Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={accessInstructions}
                    onChange={(e) => setAccessInstructions(e.target.value)}
                    placeholder="e.g. Bay #4 on the left inside gate or Ask Guard"
                    className="w-full px-3.5 py-2 text-xs font-medium bg-[#100e0d] text-[#f6f2ec] placeholder-[#756758] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                  />
                </div>

                {/* Amenities Checklist */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#a89682] mb-1.5">
                    Amenities & Security
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {[
                      { id: 'cctv', label: '24/7 CCTV', icon: '📹' },
                      { id: 'ev_charging', label: 'EV Charger', icon: '⚡' },
                      { id: 'guard', label: 'Security Guard', icon: '👮' },
                      { id: 'gated_access', label: 'Gated Access', icon: '🔒' },
                      { id: 'lighting', label: 'Well Lit at Night', icon: '💡' },
                      { id: 'wide_clearance', label: 'Wide Clearance', icon: '↔️' },
                    ].map((amenity) => (
                      <button
                        key={amenity.id}
                        type="button"
                        onClick={() => toggleAmenity(amenity.id)}
                        className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs transition cursor-pointer ${
                          amenities.includes(amenity.id)
                            ? 'border-[#dfba89] bg-[#dfba89]/15 text-[#dfba89] font-bold'
                            : 'border-[#383028] bg-[#201c18] text-[#c2b29d] hover:bg-[#28211a]'
                        }`}
                      >
                        <span>{amenity.icon}</span>
                        <span className="text-[11px]">{amenity.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Photo Management */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#a89682]">
                      Parking Photos ({uploadedPhotos.length})
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="text-[10px] font-bold text-[#dfba89] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Camera className="w-3 h-3" />
                        Take Photo
                      </button>
                      <span className="text-[#383028]">|</span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[10px] font-bold text-[#dfba89] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <UploadCloud className="w-3 h-3" />
                        Upload
                      </button>
                    </div>
                  </div>

                  {/* Hidden inputs */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                  />

                  {/* Preview Thumbnails or Empty State */}
                  {uploadedPhotos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {uploadedPhotos.map((photo, idx) => (
                        <div
                          key={idx}
                          className="relative h-20 rounded-xl overflow-hidden border border-[#383028] bg-[#100e0d] group"
                        >
                          <img
                            src={photo}
                            alt={`Spot photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-[#dfba89] text-[#12100e] text-[8px] font-black uppercase">
                              Cover
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#100e0d]/80 hover:bg-rose-700 text-white flex items-center justify-center transition shadow-sm cursor-pointer"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3.5 text-center rounded-xl border border-dashed border-[#383028] bg-[#100e0d] text-[#a89682] text-xs">
                      <span>No photos uploaded (Optional). You can take a photo with your camera or upload from your device.</span>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
