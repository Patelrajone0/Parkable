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
  Loader2,
  Landmark,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Lock,
  AlertCircle
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
    description: 'Clean, paved residential driveway with easy road access. Ideal for daily or hourly commuters.',
  },
  {
    id: 'covered-porch',
    name: 'Covered Portico',
    tag: 'Weather Safe',
    icon: '☔',
    spaceType: 'covered',
    vehicleSize: 'compact-suv',
    hourlyRate: 80,
    amenities: ['covered'],
    dimensions: '5.4m x 2.8m x 2.6m',
    photoUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80',
    description: 'Full roof cover shielding vehicle from rain and harsh afternoon sun. Gated residential property.',
  },
  {
    id: 'ev-spot',
    name: 'EV Charging Bay',
    tag: 'High Demand',
    icon: '⚡',
    spaceType: 'covered',
    vehicleSize: 'compact-suv',
    hourlyRate: 120,
    amenities: ['ev_charging', 'cctv'],
    dimensions: '5.5m x 2.8m x 2.5m',
    photoUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80',
    description: 'Dedicated parking slot equipped with Type-2 AC EV charging plug and continuous CCTV monitoring.',
  },
  {
    id: 'two-wheeler',
    name: 'Bike / Scooter Slot',
    tag: 'Quick Park',
    icon: '🛵',
    spaceType: 'covered',
    vehicleSize: '2-wheeler',
    hourlyRate: 25,
    amenities: ['cctv'],
    dimensions: '2.4m x 1.2m x 2.0m',
    photoUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
    description: 'Secure shaded parking spot specifically designated for 2-wheelers and electric scooters.',
  },
  {
    id: 'suv-bay',
    name: 'Extra Large SUV Bay',
    tag: 'Wide Bay',
    icon: '🚙',
    spaceType: 'open',
    vehicleSize: 'large-suv',
    hourlyRate: 90,
    amenities: ['guard', 'cctv'],
    dimensions: '6.0m x 3.2m x 3.0m',
    photoUrl: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=800&auto=format&fit=crop&q=80',
    description: 'Generous parking width for Fortuner, Scorpio, Thar, or large pickups with no tight turns.',
  },
  {
    id: 'apartment-slot',
    name: 'Gated Society Bay',
    tag: '24/7 Security',
    icon: '🏢',
    spaceType: 'underground',
    vehicleSize: 'compact-suv',
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
    spots,
    currentUser,
    hostPayoutAccount,
    updateHostPayoutAccount,
    mapCenter, 
    platformCommissionRate, 
    addToast,
    userLiveLocation,
    setActiveRole 
  } = useApp();

  // Check if host is listing their first spot or has pending payout setup
  const hostSpots = currentUser ? spots.filter((s) => s.host_id === currentUser.id) : [];
  const isFirstEverSpot = hostSpots.length === 0;

  const isPayoutConfigured = Boolean(
    hostPayoutAccount &&
    hostPayoutAccount.status === 'active' &&
    hostPayoutAccount.account_holder_name?.trim() &&
    hostPayoutAccount.account_number?.trim() &&
    hostPayoutAccount.ifsc_code?.trim() &&
    hostPayoutAccount.upi_id?.trim()
  );

  const [step, setStep] = useState<'payout_setup' | 'spot_details'>('spot_details');

  // Payout Form State (Compulsory for first-time hosts)
  const [payoutForm, setPayoutForm] = useState({
    account_holder_name: hostPayoutAccount?.account_holder_name || currentUser?.name || '',
    upi_id: hostPayoutAccount?.upi_id || '',
    account_number: hostPayoutAccount?.account_number || '',
    confirm_account_number: hostPayoutAccount?.account_number || '',
    ifsc_code: hostPayoutAccount?.ifsc_code || '',
    bank_name: hostPayoutAccount?.bank_name || '',
  });

  // Spot Form State
  const defaultPreset = QUICK_PRESETS[0];
  const [selectedPresetId, setSelectedPresetId] = useState<string>('driveway');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

  // When modal opens, enforce compulsory payout check for first-time hosts
  useEffect(() => {
    if (isOpen) {
      if (isFirstEverSpot || !isPayoutConfigured) {
        setStep('payout_setup');
      } else {
        setStep('spot_details');
      }
    }
  }, [isOpen, isFirstEverSpot, isPayoutConfigured]);

  // Sync initial GPS location if available
  useEffect(() => {
    if (userLiveLocation && userLiveLocation.lat && isOpen) {
      setPinCoords(userLiveLocation);
    }
  }, [userLiveLocation, isOpen]);

  if (!isOpen) return null;

  // Compulsory Payout Account Submission Handler
  const handleSavePayoutFirst = (e: React.FormEvent) => {
    e.preventDefault();

    if (!payoutForm.account_holder_name.trim()) {
      addToast('Name Required', 'Please enter your bank account holder name.', 'error');
      return;
    }
    if (!payoutForm.upi_id.includes('@')) {
      addToast('Valid UPI ID Required', 'Please enter a valid UPI VPA (e.g. name@okhdfcbank).', 'error');
      return;
    }
    if (payoutForm.account_number.trim().length < 6) {
      addToast('Invalid Account Number', 'Bank account number must be at least 6 digits.', 'error');
      return;
    }
    if (payoutForm.account_number.trim() !== payoutForm.confirm_account_number.trim()) {
      addToast('Account Mismatch', 'Account number and confirmation do not match.', 'error');
      return;
    }
    if (payoutForm.ifsc_code.trim().length < 4) {
      addToast('IFSC Code Required', 'Please enter a valid bank IFSC code.', 'error');
      return;
    }
    if (!payoutForm.bank_name.trim()) {
      addToast('Bank Name Required', 'Please specify your bank name.', 'error');
      return;
    }

    updateHostPayoutAccount({
      account_holder_name: payoutForm.account_holder_name.trim(),
      upi_id: payoutForm.upi_id.trim(),
      account_number: payoutForm.account_number.trim(),
      ifsc_code: payoutForm.ifsc_code.trim().toUpperCase(),
      bank_name: payoutForm.bank_name.trim(),
      auto_payout_enabled: true,
      status: 'active',
    });

    addToast('Payout Account Verified! 🎉', 'Your bank details are saved. Now configure your spot listing.', 'success');
    setStep('spot_details');
  };

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
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.address) {
            const road = data.address.road || data.address.pedestrian || data.address.suburb || '';
            const area = data.address.suburb || data.address.neighbourhood || '';
            const fullStreet = [road, area].filter(Boolean).join(', ');
            if (fullStreet) setAddress(fullStreet);
            const cityFound = data.address.city || data.address.town || 'Bengaluru';
            setCity(cityFound);
            addToast('GPS Located 📍', fullStreet || cityFound, 'success');
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

  // Final Publish Spot Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enforce compulsory payout check before publishing
    if (!isPayoutConfigured && (!hostPayoutAccount?.account_number || !hostPayoutAccount?.upi_id)) {
      addToast('Payout Setup Required', 'You must link your bank payout details before listing your spot.', 'error');
      setStep('payout_setup');
      return;
    }

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
        payout_account: hostPayoutAccount,
      });

      setIsSubmitting(false);
      onClose();
      setActiveRole('host');
      addToast('Listing Published! 🚀', `"${finalTitle}" is now live with automatic payout routing enabled.`, 'success');
    } catch (err) {
      setIsSubmitting(false);
      addToast('Error', 'Failed to publish spot listing.', 'error');
    }
  };

  // Commission calculations
  const platformFee = Math.round(hourlyRate * platformCommissionRate);
  const hostNetHourly = hourlyRate - platformFee;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#181512] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] border border-[#383028] animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#12100e] text-[#f6f2ec] border-b border-[#383028] flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#dfba89]/20 text-[#dfba89] border border-[#dfba89]/40 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                {step === 'payout_setup' ? 'Compulsory Setup (Step 1/2)' : 'Spot Details (Step 2/2)'}
              </span>
              <span className="text-[#756758]">•</span>
              <span className="text-xs text-[#a89682]">Host Portal</span>
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-[#f6f2ec] mt-0.5">
              {step === 'payout_setup' ? 'Link Payout Account (Required Before Listing)' : 'List Your Parking Spot'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1c1814] hover:bg-[#28211a] text-[#f6f2ec] border border-[#383028] flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* COMPULSORY STEP 1: HOST PAYOUT & BANK ACCOUNT SETUP */}
        {/* ========================================================================= */}
        {step === 'payout_setup' && (
          <form onSubmit={handleSavePayoutFirst} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-[#f6f2ec]">
            {/* Compulsory Requirement Banner */}
            <div className="p-4 rounded-2xl bg-[#201c18] border border-[#dfba89]/40 space-y-2">
              <div className="flex items-center gap-2 text-[#dfba89]">
                <Landmark className="w-5 h-5 text-[#dfba89]" />
                <h4 className="font-black text-sm">
                  {isFirstEverSpot ? 'First-Time Host: Link Payout Account' : 'Update Payout Destination'}
                </h4>
              </div>
              <p className="text-xs text-[#c2b29d] leading-relaxed">
                Before you can list your parking space, you must provide your verified Bank Account & UPI ID. When drivers book your space, the payment gateway automatically transfers your 90% rental earnings directly to this account in real time.
              </p>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#a89682] uppercase tracking-wider mb-1">
                  Account Holder Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={payoutForm.account_holder_name}
                  onChange={(e) => setPayoutForm({ ...payoutForm, account_holder_name: e.target.value })}
                  placeholder="e.g. Raj Patel"
                  className="w-full px-3.5 py-2.5 text-xs font-semibold bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#a89682] uppercase tracking-wider mb-1">
                  UPI ID (VPA) for Instant Credit *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={payoutForm.upi_id}
                    onChange={(e) => setPayoutForm({ ...payoutForm, upi_id: e.target.value })}
                    placeholder="e.g. rajpatel@okhdfcbank"
                    className="w-full px-3.5 py-2.5 text-xs font-mono font-semibold bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                  />
                  <Smartphone className="w-4 h-4 text-[#dfba89] absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#a89682] uppercase tracking-wider mb-1">
                  Bank Account Number *
                </label>
                <input
                  type="text"
                  required
                  value={payoutForm.account_number}
                  onChange={(e) => setPayoutForm({ ...payoutForm, account_number: e.target.value })}
                  placeholder="e.g. 501004928192"
                  className="w-full px-3.5 py-2.5 text-xs font-mono font-semibold bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#a89682] uppercase tracking-wider mb-1">
                  Confirm Account Number *
                </label>
                <input
                  type="password"
                  required
                  value={payoutForm.confirm_account_number}
                  onChange={(e) => setPayoutForm({ ...payoutForm, confirm_account_number: e.target.value })}
                  placeholder="Re-enter Account Number"
                  className="w-full px-3.5 py-2.5 text-xs font-mono font-semibold bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#a89682] uppercase tracking-wider mb-1">
                  Bank IFSC Code *
                </label>
                <input
                  type="text"
                  required
                  value={payoutForm.ifsc_code}
                  onChange={(e) => setPayoutForm({ ...payoutForm, ifsc_code: e.target.value.toUpperCase() })}
                  placeholder="e.g. HDFC0001092"
                  className="w-full px-3.5 py-2.5 text-xs font-mono font-bold uppercase bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#a89682] uppercase tracking-wider mb-1">
                  Bank Name *
                </label>
                <input
                  type="text"
                  required
                  value={payoutForm.bank_name}
                  onChange={(e) => setPayoutForm({ ...payoutForm, bank_name: e.target.value })}
                  placeholder="e.g. HDFC Bank Ltd"
                  className="w-full px-3.5 py-2.5 text-xs font-semibold bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                />
              </div>
            </div>

            {/* Split & Security Notice */}
            <div className="p-3.5 rounded-2xl bg-[#12100e] border border-[#2c251e] space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <ShieldCheck className="w-4 h-4" />
                <span>Instant Split Protection</span>
              </div>
              <p className="text-[11px] text-[#a89682]">
                Your earnings (90%) are transferred directly into this account upon booking confirmation. ParkEase automatically retains a 10% platform service fee.
              </p>
            </div>

            {/* Submit Payout Details and proceed */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-black text-sm shadow-xl shadow-[#dfba89]/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>Save Payout Destination & Continue to Spot Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SPOT DETAILS & PUBLISH WIZARD */}
        {/* ========================================================================= */}
        {step === 'spot_details' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-[max(1.5rem,calc(env(safe-area-inset-bottom,0px)+1rem))] text-[#f6f2ec] space-y-5">
            
            {/* Linked Payout Account Verification Banner */}
            <div className="p-3 rounded-2xl bg-[#1c1814] border border-[#383028] flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-[#f6f2ec] block">
                    Payout Destination Verified: {hostPayoutAccount?.bank_name} •••• {hostPayoutAccount?.account_number?.slice(-4)}
                  </span>
                  <span className="text-[11px] font-mono text-[#a89682]">
                    UPI: {hostPayoutAccount?.upi_id} (Receives 90% of bookings)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep('payout_setup')}
                className="text-xs font-bold text-[#dfba89] hover:underline shrink-0 cursor-pointer"
              >
                Edit
              </button>
            </div>

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
                  pinCoords={pinCoords}
                  onPinPlaced={handlePinPlaced}
                />
                <div className="absolute bottom-2 left-2 z-[400] bg-[#12100e]/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#383028] text-[10px] text-[#dfba89] font-medium shadow">
                  Drag pin or click map to set exact bay location
                </div>
              </div>
            </div>

            {/* Section 3: Hourly Pricing */}
            <div className="p-4 rounded-2xl bg-[#1c1814] border border-[#383028] space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-[#dfba89] block">
                3. Hourly Pricing
              </label>

              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-[#dfba89]">₹</span>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    step="5"
                    required
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Math.max(10, parseInt(e.target.value) || 10))}
                    className="w-full pl-8 pr-3.5 py-2.5 text-sm font-black bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                  />
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {[40, 60, 80, 120].map((rate) => (
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
                <span>Platform fee: <span className="text-[#dfba89]">10% (₹{platformFee})</span></span>
                <span>You receive: <strong className="text-emerald-400 font-bold">₹{hostNetHourly}/hr</strong></span>
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
                        <option value="2-wheeler">🛵 2-Wheeler (Bike/Scooter)</option>
                        <option value="hatchback">🚗 Hatchback (i20, Swift, WagonR)</option>
                        <option value="compact-suv">🚙 Compact SUV (Creta, Seltos, Nexon)</option>
                        <option value="large-suv">🚐 Large SUV (Fortuner, Innova, Thar)</option>
                      </select>
                    </div>
                  </div>

                  {/* Spot Photos */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#a89682]">
                        Spot Photos ({uploadedPhotos.length})
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

                    {/* Preview Thumbnails */}
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
        )}
      </div>
    </div>
  );
}
