'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ParkingSpot } from '@/types';
import confetti from 'canvas-confetti';
import { 
  X, 
  CreditCard, 
  Clock, 
  ShieldCheck, 
  Check, 
  Lock, 
  Car, 
  Calendar, 
  Loader2, 
  Sparkles,
  Info,
  Apple
} from 'lucide-react';

interface CheckoutModalProps {
  spot: ParkingSpot | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({
  spot,
  isOpen,
  onClose,
}: CheckoutModalProps) {
  const { createBooking, platformCommissionRate, currentUser, addToast } = useApp();

  const [durationHours, setDurationHours] = useState<number>(2);
  const [vehiclePlate, setVehiclePlate] = useState<string>('KA 03 MX 4921');
  const [vehicleModel, setVehicleModel] = useState<string>('Hyundai Creta SX');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'google_pay'>('card');
  const [cardNumber, setCardNumber] = useState<string>('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState<string>('08/28');
  const [cardCvc, setCardCvc] = useState<string>('892');
  const [cardName, setCardName] = useState<string>(currentUser?.name || 'Parkable Driver');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen || !spot) return null;

  const basePrice = spot.hourly_rate * durationHours;
  const platformFee = Math.round(basePrice * platformCommissionRate);
  const totalAmount = basePrice + platformFee;

  const handlePayAndConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehiclePlate.trim()) {
      addToast('Vehicle Plate Required', 'Please enter your license plate number so the host recognizes your vehicle.', 'error');
      return;
    }

    setIsProcessing(true);

    // Simulate Stripe payment gateway latency & authorization
    setTimeout(async () => {
      try {
        await createBooking({
          spot,
          startTime: new Date(),
          durationHours,
          vehiclePlate: vehiclePlate.toUpperCase().trim(),
          vehicleModel,
          paymentMethod,
        });

        // Trigger celebratory confetti in Desert Titanium gold
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#dfba89', '#d4a373', '#f3dfc6', '#b37d4e', '#ffffff']
        });

        setIsProcessing(false);
        setIsSuccess(true);

        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 1200);
      } catch (err) {
        setIsProcessing(false);
        addToast('Payment Failed', 'Could not authorize mockup transaction.', 'error');
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#181512] rounded-3xl shadow-2xl overflow-hidden border border-[#383028] flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#12100e] text-[#f6f2ec] border-b border-[#383028] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#dfba89]/10 border border-[#dfba89]/30 flex items-center justify-center text-[#dfba89]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight text-[#f6f2ec]">Secure Parking Checkout</h3>
              <p className="text-[11px] text-[#a89682]">Instant reservation & guaranteed spot</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-8 h-8 rounded-full bg-[#1c1814] hover:bg-[#28211a] text-[#f6f2ec] border border-[#383028] flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handlePayAndConfirm} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Spot Summary Mini Card */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#201c18] border border-[#383028]">
            <img
              src={spot.photos[0]}
              alt={spot.title}
              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#383028]"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-xs sm:text-sm text-[#f6f2ec] truncate">
                {spot.title}
              </h4>
              <p className="text-[11px] text-[#a89682] truncate mt-0.5">{spot.address}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-black text-[#dfba89]">₹{spot.hourly_rate}/hr</span>
                <span className="text-[10px] bg-[#28211a] text-[#c2b29d] border border-[#383028] px-1.5 py-0.5 rounded capitalize font-medium">
                  {spot.vehicle_size.replace('-', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-bold text-[#a89682] uppercase tracking-wider mb-2">
              Select Parking Duration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 4, 8].map((hours) => (
                <button
                  type="button"
                  key={hours}
                  onClick={() => setDurationHours(hours)}
                  className={`py-2.5 px-2 rounded-xl text-center border text-xs font-bold transition ${
                    durationHours === hours
                      ? 'bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] text-[#12100e] border-[#dfba89] shadow-sm'
                      : 'bg-[#201c18] text-[#c2b29d] border-[#383028] hover:bg-[#28211a]'
                  }`}
                >
                  <div>{hours} {hours === 1 ? 'Hour' : 'Hours'}</div>
                  <div className={`text-[10px] ${durationHours === hours ? 'text-[#12100e] font-semibold' : 'text-[#756758]'}`}>
                    ₹{spot.hourly_rate * hours}
                  </div>
                </button>
              ))}
            </div>

            {/* Custom hours slider */}
            <div className="mt-3 flex items-center gap-3 bg-[#201c18] p-2.5 rounded-xl border border-[#383028]">
              <Clock className="w-4 h-4 text-[#dfba89] shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between text-xs font-medium text-[#a89682] mb-1">
                  <span>Custom Duration:</span>
                  <span className="font-bold text-[#dfba89]">{durationHours} Hours</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="24"
                  step="1"
                  value={durationHours}
                  onChange={(e) => setDurationHours(parseInt(e.target.value))}
                  className="w-full accent-[#dfba89] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-[#a89682] uppercase tracking-wider">
              Your Vehicle Details
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] text-[#a89682] font-medium mb-1">
                  License Plate Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-mono text-xs">
                    🚘
                  </div>
                  <input
                    type="text"
                    required
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    placeholder="e.g. KA 03 MX 4921"
                    className="w-full pl-8 pr-3 py-2 text-xs font-bold uppercase tracking-wider bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#a89682] font-medium mb-1">
                  Vehicle Model
                </label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="e.g. Hyundai Creta, Honda City"
                  className="w-full px-3 py-2 text-xs font-medium bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                />
              </div>
            </div>
          </div>

          {/* Stripe Payment Gateway Mockup */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#a89682] uppercase tracking-wider">
                Payment Method (Stripe Gateway)
              </label>
              <div className="flex items-center gap-1.5 text-[10px] text-[#a89682]">
                <Lock className="w-3 h-3 text-[#dfba89]" />
                <span>256-bit Encrypted</span>
              </div>
            </div>

            {/* Payment method selector tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold transition ${
                  paymentMethod === 'card'
                    ? 'border-[#dfba89] bg-[#dfba89]/15 text-[#dfba89]'
                    : 'border-[#383028] bg-[#201c18] text-[#c2b29d] hover:bg-[#28211a]'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-[#dfba89]" />
                <span>Credit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('apple_pay')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold transition ${
                  paymentMethod === 'apple_pay'
                    ? 'border-[#dfba89] bg-[#dfba89]/15 text-[#dfba89]'
                    : 'border-[#383028] bg-[#201c18] text-[#c2b29d] hover:bg-[#28211a]'
                }`}
              >
                <span> Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('google_pay')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold transition ${
                  paymentMethod === 'google_pay'
                    ? 'border-[#dfba89] bg-[#dfba89]/15 text-[#dfba89]'
                    : 'border-[#383028] bg-[#201c18] text-[#c2b29d] hover:bg-[#28211a]'
                }`}
              >
                <span>G Pay</span>
              </button>
            </div>

            {/* Card Fields Mockup */}
            {paymentMethod === 'card' && (
              <div className="p-3.5 rounded-2xl bg-[#201c18] border border-[#383028] space-y-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#a89682] mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-[#100e0d] text-[#f6f2ec] rounded-lg border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                    />
                    <div className="absolute right-2.5 top-2.5 flex items-center gap-1 text-[10px] font-bold text-[#dfba89] bg-[#28211a] border border-[#dfba89]/30 px-1.5 py-0.5 rounded">
                      VISA
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#a89682] mb-1">
                      Expires (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-[#100e0d] text-[#f6f2ec] rounded-lg border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#a89682] mb-1">
                      CVC / CVV
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-[#100e0d] text-[#f6f2ec] rounded-lg border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pricing Breakdown Card */}
          <div className="p-4 rounded-2xl bg-[#201c18] border border-[#383028] space-y-2 text-xs text-[#a89682]">
            <div className="flex justify-between">
              <span>Parking Subtotal (₹{spot.hourly_rate} × {durationHours} hrs)</span>
              <span className="font-semibold text-[#f6f2ec]">₹{basePrice}</span>
            </div>

            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <span>Platform Commission Fee (10%)</span>
                <Info className="w-3 h-3 text-[#756758]" />
              </span>
              <span className="font-semibold text-[#f6f2ec]">₹{platformFee}</span>
            </div>

            <div className="flex justify-between text-[#dfba89]">
              <span>Parkable Guarantee & Host Insurance</span>
              <span className="font-bold">FREE</span>
            </div>

            <hr className="border-[#2c251e] my-2" />

            <div className="flex justify-between items-baseline text-sm font-black text-[#f6f2ec]">
              <span>Total Price Due:</span>
              <span className="text-xl text-[#dfba89]">₹{totalAmount}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing || isSuccess}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] disabled:opacity-50 text-[#12100e] font-bold text-sm shadow-lg shadow-[#dfba89]/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#12100e]" />
                <span>Processing via Stripe...</span>
              </>
            ) : isSuccess ? (
              <>
                <Check className="w-5 h-5 text-[#12100e]" />
                <span>Booking Confirmed!</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-[#12100e]" />
                <span>Pay ₹{totalAmount} & Reserve Spot</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
