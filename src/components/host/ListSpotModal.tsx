'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { VehicleSize, SpaceType } from '@/types';
import ParkingMap from '@/components/map/ParkingMap';
import { 
  X, 
  MapPin, 
  Car, 
  Check, 
  Zap, 
  ShieldCheck, 
  DollarSign, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Camera,
  Layers,
  Key,
  Info,
  UploadCloud,
  ImageIcon,
  Trash2,
  Plus
} from 'lucide-react';

interface ListSpotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ListSpotModal({ isOpen, onClose }: ListSpotModalProps) {
  const { addSpot, mapCenter, platformCommissionRate, addToast } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('88, 100 Feet Road, Indiranagar');
  const [city, setCity] = useState('Bengaluru');
  const [pinCoords, setPinCoords] = useState<{ lat: number; lng: number }>({
    lat: 12.9719,
    lng: 77.6412,
  });

  const [spaceType, setSpaceType] = useState<SpaceType>('covered');
  const [vehicleSize, setVehicleSize] = useState<VehicleSize>('compact-suv');
  const [dimensions, setDimensions] = useState('5.4m x 2.8m x 2.4m');
  const [amenities, setAmenities] = useState<string[]>(['cctv', 'lighting', 'gated_access']);
  const [rules, setRules] = useState<string>('');
  const [gateCode, setGateCode] = useState('');
  const [accessInstructions, setAccessInstructions] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number>(100);
  const [isActive, setIsActive] = useState<boolean>(true);
  
  // File upload & Camera references
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&auto=format&fit=crop&q=80'
  ]);

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
          setUploadedPhotos((prev) => {
            // If the only photo is the default initial placeholder, replace it with the uploaded one
            if (prev.length === 1 && prev[0].includes('unsplash.com')) {
              return [resultStr];
            }
            return [...prev, resultStr];
          });
          addToast('Photo Uploaded', `Added "${file.name}" to parking photos`, 'success');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length === 0) {
        return ['https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&auto=format&fit=crop&q=80'];
      }
      return updated;
    });
  };

  if (!isOpen) return null;

  const toggleAmenity = (id: string) => {
    setAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!title.trim() || !address.trim()) {
        addToast('Missing Details', 'Please provide a title and address for your spot.', 'error');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(4, prev + 1));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addSpot({
        title: title || `${spaceType.toUpperCase()} Parking on ${address}`,
        description: description || 'Spacious, secure private parking space with easy road access.',
        address,
        city,
        lat: pinCoords.lat,
        lng: pinCoords.lng,
        hourly_rate: hourlyRate,
        vehicle_size: vehicleSize,
        space_type: spaceType,
        amenities,
        rules: rules ? rules.split(',').map((r: string) => r.trim()).filter(Boolean) : [],
        dimensions,
        photos: uploadedPhotos.length > 0 ? uploadedPhotos : ['https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&auto=format&fit=crop&q=80'],
        is_active: isActive,
        instant_book: true,
        gate_code: gateCode,
        access_instructions: accessInstructions,
      });

      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      addToast('Error', 'Failed to publish spot listing.', 'error');
    }
  };

  // Commission calculations
  const platformFee = Math.round(hourlyRate * platformCommissionRate);
  const hostNetHourly = hourlyRate - platformFee;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#181512] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-[#383028]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#12100e] text-[#f6f2ec] border-b border-[#383028] flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#dfba89] uppercase tracking-widest">
                Host Portal
              </span>
              <span className="text-[#756758]">•</span>
              <span className="text-xs text-[#a89682]">Step {currentStep} of 4</span>
            </div>
            <h3 className="font-bold text-lg text-[#f6f2ec]">List Your Parking Spot</h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1c1814] hover:bg-[#28211a] text-[#f6f2ec] border border-[#383028] flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#241f1a] h-1.5 shrink-0">
          <div
            className="bg-gradient-to-r from-[#dfba89] to-[#b37d4e] h-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-[#f6f2ec]">
          {/* STEP 1: Location & Map Pin */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h4 className="font-bold text-base text-[#f6f2ec]">Spot Location & Address</h4>
                <p className="text-xs text-[#a89682] mt-0.5">
                  Pinpoint the exact location on the map so drivers can navigate seamlessly.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#a89682] mb-1">
                  Spot Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Shaded Driveway with EV Charger near Indiranagar Metro"
                  className="w-full px-3.5 py-2.5 text-xs font-medium bg-[#100e0d] text-[#f6f2ec] placeholder-[#756758] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#a89682] mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 42, 12th Main Rd, HAL 2nd Stage"
                    className="w-full px-3.5 py-2.5 text-xs font-medium bg-[#100e0d] text-[#f6f2ec] placeholder-[#756758] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#a89682] mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className="w-full px-3.5 py-2.5 text-xs font-medium bg-[#100e0d] text-[#f6f2ec] placeholder-[#756758] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                  />
                </div>
              </div>

              {/* Interactive Pin Placement Map */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#a89682]">
                    Click Map to Place Pin:
                  </label>
                  <span className="text-[11px] font-mono text-[#dfba89] font-semibold">
                    {pinCoords.lat.toFixed(4)}, {pinCoords.lng.toFixed(4)}
                  </span>
                </div>
                <div className="h-56 w-full rounded-2xl overflow-hidden border border-[#383028] relative shadow-inner">
                  <ParkingMap
                    spots={[]}
                    selectedSpot={null}
                    onSelectSpot={() => {}}
                    center={[pinCoords.lat, pinCoords.lng]}
                    zoom={15}
                    interactivePinPlacement={true}
                    onPinPlaced={(coords) => setPinCoords(coords)}
                    pinCoords={pinCoords}
                  />
                  <div className="absolute bottom-2 left-2 right-2 bg-[#141210]/90 border border-[#383028] backdrop-blur-md text-[#f6f2ec] text-[11px] p-2 rounded-xl text-center pointer-events-none z-20">
                    📍 Click anywhere on the map or drag the gold pin to set the spot entry gate
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Space Type & Vehicle Capacity */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h4 className="font-bold text-base text-[#f6f2ec]">Space Details & Vehicle Compatibility</h4>
                <p className="text-xs text-[#a89682] mt-0.5">
                  Specify space configuration so drivers know if their car fits.
                </p>
              </div>

              {/* Space Type Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#a89682] mb-2">
                  Space Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'covered', label: 'Covered Roof', icon: '☔' },
                    { id: 'open', label: 'Open Driveway', icon: '☀️' },
                    { id: 'underground', label: 'Underground', icon: '🏢' },
                    { id: 'gated', label: 'Gated Villa', icon: '🏡' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSpaceType(item.id as SpaceType)}
                      className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                        spaceType === item.id
                          ? 'border-[#dfba89] bg-[#dfba89]/15 text-[#dfba89] font-bold shadow-xs'
                          : 'border-[#383028] bg-[#201c18] text-[#c2b29d] hover:bg-[#28211a]'
                      }`}
                    >
                      <div className="text-xl mb-1">{item.icon}</div>
                      <div className="text-xs">{item.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle Size Capacity */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#a89682] mb-2">
                  Maximum Vehicle Size
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: '2-wheeler', label: '2-Wheeler (Bike / Scooter)', desc: 'Fits motorcycles, scooters & EV 2W' },
                    { id: 'hatchback', label: 'Hatchback (Compact)', desc: 'Fits Swift, i20, Polo, Tiago' },
                    { id: 'compact-suv', label: 'Compact SUV (Creta / Seltos)', desc: 'Fits Hyundai Creta, Brezza, Nexon, Kia' },
                    { id: 'large-suv', label: 'Large SUV / Truck (Fortuner)', desc: 'Fits Fortuner, Endeavour, Thar, Safari' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setVehicleSize(item.id as VehicleSize)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        vehicleSize === item.id
                          ? 'border-[#dfba89] bg-[#dfba89]/15 text-[#dfba89] font-bold shadow-xs'
                          : 'border-[#383028] bg-[#201c18] text-[#c2b29d] hover:bg-[#28211a]'
                      }`}
                    >
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[11px] text-[#a89682] mt-0.5 font-normal">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimensions */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#a89682] mb-1">
                  Dimensions (L x W x H)
                </label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="e.g. 5.4m x 2.8m x 2.4m"
                  className="w-full px-3.5 py-2.5 text-xs font-medium bg-[#100e0d] text-[#f6f2ec] placeholder-[#756758] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#a89682] mb-1">
                  Description & Features
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your parking space, ease of turning, proximity to landmarks..."
                  className="w-full px-3.5 py-2.5 text-xs font-medium bg-[#100e0d] text-[#f6f2ec] placeholder-[#756758] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Amenities, Access & Photos */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h4 className="font-bold text-base text-[#f6f2ec]">Amenities, Access Code & Photos</h4>
                <p className="text-xs text-[#a89682] mt-0.5">
                  High-value amenities like EV charging and CCTV help spots earn up to 40% more.
                </p>
              </div>

              {/* Amenities Grid */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#a89682] mb-2">
                  Available Amenities
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                      className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs transition cursor-pointer ${
                        amenities.includes(amenity.id)
                          ? 'border-[#dfba89] bg-[#dfba89]/15 text-[#dfba89] font-bold'
                          : 'border-[#383028] bg-[#201c18] text-[#c2b29d] hover:bg-[#28211a]'
                      }`}
                    >
                      <span className="text-base">{amenity.icon}</span>
                      <span>{amenity.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gate Passcode & Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#a89682] mb-1">
                    Gate Code / Keypad PIN
                  </label>
                  <input
                    type="text"
                    value={gateCode}
                    onChange={(e) => setGateCode(e.target.value)}
                    placeholder="e.g. 4209 or 'Ask Guard'"
                    className="w-full px-3.5 py-2.5 text-xs font-mono font-bold bg-[#100e0d] text-[#f6f2ec] placeholder-[#756758] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#a89682] mb-1">
                    Access Instructions
                  </label>
                  <input
                    type="text"
                    value={accessInstructions}
                    onChange={(e) => setAccessInstructions(e.target.value)}
                    placeholder="e.g. Key in 4209, slot is on the left"
                    className="w-full px-3.5 py-2.5 text-xs font-medium bg-[#100e0d] text-[#f6f2ec] placeholder-[#756758] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                  />
                </div>
              </div>

              {/* Spot Photos: Device Upload & Camera Capture */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#a89682]">
                    Parking Photos ({uploadedPhotos.length})
                  </label>
                  <span className="text-[11px] text-[#dfba89] font-semibold">
                    First photo is your cover
                  </span>
                </div>

                {/* Hidden File & Camera Inputs */}
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

                {/* Drag & Drop Upload Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFiles(e.dataTransfer.files);
                  }}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
                    isDragging
                      ? 'border-[#dfba89] bg-[#dfba89]/10 scale-[1.01]'
                      : 'border-[#383028] hover:border-[#dfba89] bg-[#201c18]/60 hover:bg-[#28211a]/80'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#12100e] border border-[#383028] shadow-xs flex items-center justify-center mx-auto mb-2 text-[#dfba89]">
                    <Camera className="w-6 h-6" />
                  </div>

                  <h5 className="font-bold text-xs sm:text-sm text-[#f6f2ec]">
                    Click to Take Photo or Upload from Device
                  </h5>
                  <p className="text-[11px] text-[#a89682] max-w-xs mx-auto mt-1 mb-3">
                    Drag and drop image files here, take a picture with your phone camera, or choose from your gallery
                  </p>

                  {/* Dual Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#12100e]" />
                      <span>Take Photo (Camera)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-[#12100e] hover:bg-[#1a1612] text-[#f6f2ec] border border-[#383028] font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-[#dfba89]" />
                      <span>Upload from Device</span>
                    </button>
                  </div>
                </div>

                {/* Uploaded Photos Gallery Preview */}
                {uploadedPhotos.length > 0 && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {uploadedPhotos.map((photo, idx) => (
                        <div
                          key={idx}
                          className="relative h-28 rounded-xl overflow-hidden border-2 border-[#383028] bg-[#100e0d] group shadow-xs"
                        >
                          <img
                            src={photo}
                            alt={`Spot photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-gradient-to-r from-[#dfba89] to-[#b37d4e] text-[#12100e] text-[9px] font-black uppercase tracking-wider shadow-sm">
                              Cover Photo
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#100e0d]/80 hover:bg-rose-700 text-white flex items-center justify-center transition shadow-sm opacity-90 group-hover:opacity-100 cursor-pointer"
                            title="Remove photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {/* Add more button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-28 rounded-xl border-2 border-dashed border-[#383028] hover:border-[#dfba89] bg-[#201c18] hover:bg-[#28211a] flex flex-col items-center justify-center gap-1 text-[#a89682] hover:text-[#dfba89] transition cursor-pointer"
                      >
                        <Plus className="w-5 h-5 text-[#dfba89]" />
                        <span className="text-[11px] font-bold">+ Add More</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Presets for quick selection */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-[#756758] uppercase tracking-wider">
                      Or pick from sample parking photos:
                    </span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {[
                      {
                        label: 'Covered Driveway',
                        url: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&auto=format&fit=crop&q=80',
                      },
                      {
                        label: 'Underground Bay',
                        url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80',
                      },
                      {
                        label: 'Paved Courtyard',
                        url: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800&auto=format&fit=crop&q=80',
                      },
                      {
                        label: 'EV Charging Slot',
                        url: 'https://images.unsplash.com/photo-1617886903355-9354752c0fd1?w=800&auto=format&fit=crop&q=80',
                      },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setUploadedPhotos((prev) => [preset.url, ...prev.filter((p) => p !== preset.url)]);
                          addToast('Preset Selected', `Selected ${preset.label} sample photo`);
                        }}
                        className="shrink-0 px-2.5 py-1.5 rounded-lg border border-[#383028] bg-[#201c18] hover:bg-[#28211a] hover:border-[#dfba89] text-[11px] font-medium text-[#c2b29d] hover:text-[#dfba89] transition cursor-pointer"
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Pricing & Availability */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h4 className="font-bold text-base text-[#f6f2ec]">Set Hourly Pricing & Availability</h4>
                <p className="text-xs text-[#a89682] mt-0.5">
                  You set the rate drivers pay per hour. Platform takes a 10% fee.
                </p>
              </div>

              {/* Hourly Price Selector */}
              <div className="p-4 rounded-2xl bg-[#201c18] border border-[#383028] text-center space-y-3">
                <span className="text-xs font-bold text-[#a89682] uppercase tracking-wider">
                  Hourly Rate (INR)
                </span>
                <div className="flex items-center justify-center gap-1 text-[#f6f2ec]">
                  <span className="text-2xl font-bold text-[#dfba89]">₹</span>
                  <input
                    type="number"
                    min="20"
                    max="1000"
                    step="5"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(parseInt(e.target.value) || 0)}
                    className="w-28 text-center text-4xl font-black bg-[#100e0d] text-[#dfba89] rounded-xl border border-[#383028] py-1 focus:ring-2 focus:ring-[#dfba89]/60"
                  />
                  <span className="text-sm font-semibold text-[#a89682]">/ hr</span>
                </div>

                {/* Price presets */}
                <div className="flex justify-center gap-2 pt-1">
                  {[50, 80, 100, 150, 200].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setHourlyRate(rate)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        hourlyRate === rate
                          ? 'bg-gradient-to-r from-[#dfba89] to-[#b37d4e] text-[#12100e] font-bold'
                          : 'bg-[#100e0d] border border-[#383028] text-[#c2b29d] hover:bg-[#1a1612]'
                      }`}
                    >
                      ₹{rate}
                    </button>
                  ))}
                </div>
              </div>

              {/* Revenue & Commission breakdown */}
              <div className="p-4 rounded-2xl bg-[#201c18] border border-[#383028] space-y-2 text-xs text-[#a89682]">
                <div className="flex justify-between">
                  <span>Driver Hourly Rate</span>
                  <span className="font-bold text-[#f6f2ec]">₹{hourlyRate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Commission (10%)</span>
                  <span className="font-bold text-[#e08272]">-₹{platformFee}</span>
                </div>
                <hr className="border-[#2c251e] my-1.5" />
                <div className="flex justify-between items-baseline text-sm font-black text-[#f6f2ec]">
                  <span>Your Net Earnings per Hour:</span>
                  <span className="text-xl text-[#dfba89]">₹{hostNetHourly} / hr</span>
                </div>
                <p className="text-[11px] text-[#a89682] pt-1">
                  💡 A spot booked 4 hours/day earns approx <strong className="text-[#dfba89]">₹{hostNetHourly * 4 * 30}/month</strong> in passive revenue!
                </p>
              </div>

              {/* Availability Toggle */}
              <div className="p-4 rounded-2xl bg-[#201c18] border border-[#383028] flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-[#f6f2ec]">Available Immediately</h5>
                  <p className="text-[11px] text-[#a89682]">
                    When active, drivers can immediately discover and book this space.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    isActive ? 'bg-[#dfba89]' : 'bg-[#383028]'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-[#12100e] transition-transform ${
                      isActive ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 bg-[#141210] border-t border-[#383028] flex items-center justify-between shrink-0">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-4 py-2.5 rounded-xl border border-[#383028] hover:bg-[#201c18] text-[#c2b29d] hover:text-[#f6f2ec] font-bold text-xs flex items-center gap-1.5 cursor-pointer transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#dfba89]/20 transition cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#dfba89]/25 transition cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-[#12100e]" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish Listing Now'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
