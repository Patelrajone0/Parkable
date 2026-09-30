'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ParkingSpot, PaymentGatewayType, PaymentMethodType } from '@/types';
import { executeRazorpayPayment, executeStripePayment } from '@/lib/paymentGateway';
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
  Apple,
  Navigation,
  Smartphone,
  Building2,
  QrCode,
  ArrowRight,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface CheckoutModalProps {
  spot: ParkingSpot | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete?: () => void;
}

export default function CheckoutModal({
  spot,
  isOpen,
  onClose,
  onBookingComplete,
}: CheckoutModalProps) {
  const { 
    createBooking, 
    platformCommissionRate, 
    currentUser, 
    companyAccount, 
    hostPayoutAccount, 
    addToast 
  } = useApp();

  const [durationHours, setDurationHours] = useState<number>(2);
  const [vehiclePlate, setVehiclePlate] = useState<string>('KA 03 MX 4921');
  const [vehicleModel, setVehicleModel] = useState<string>('Hyundai Creta SX');

  // Dual Gateway State
  const [gateway, setGateway] = useState<PaymentGatewayType>('razorpay');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('upi');

  // Card Inputs
  const [cardNumber, setCardNumber] = useState<string>('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState<string>('08/28');
  const [cardCvc, setCardCvc] = useState<string>('892');
  const [cardName, setCardName] = useState<string>(currentUser?.name || 'Parkable Driver');
  const [upiIdInput, setUpiIdInput] = useState<string>('driver@oksbi');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [settlementReceipt, setSettlementReceipt] = useState<{
    gateway: PaymentGatewayType;
    paymentId: string;
    hostPayoutRef: string;
    companyCreditRef: string;
    totalAmount: number;
    platformFee: number;
    hostEarnings: number;
  } | null>(null);

  const handleClose = () => {
    setIsSuccess(false);
    setSettlementReceipt(null);
    onClose();
  };

  if (!isOpen || !spot) return null;

  const basePrice = spot.hourly_rate * durationHours;
  const platformFee = Math.round(basePrice * platformCommissionRate);
  const totalAmount = basePrice + platformFee;
  const hostEarnings = basePrice;

  const targetHostPayout = spot.payout_account || hostPayoutAccount;

  const handlePayAndConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehiclePlate.trim()) {
      addToast('Vehicle Plate Required', 'Please enter your license plate number so the host recognizes your vehicle.', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      let result;

      if (gateway === 'razorpay') {
        result = await executeRazorpayPayment({
          gateway: 'razorpay',
          paymentMethod,
          spot: {
            id: spot.id,
            title: spot.title,
            address: spot.address,
            hourly_rate: spot.hourly_rate,
            payout_account: targetHostPayout,
          },
          totalAmount,
          platformFee,
          hostEarnings,
          durationHours,
          customerUser: {
            name: currentUser?.name || cardName,
            email: currentUser?.email || 'driver@parkease.io',
            phone: currentUser?.phone || '+91 98765 43210',
          },
          companyAccount,
        });
      } else {
        result = await executeStripePayment({
          gateway: 'stripe',
          paymentMethod,
          spot: {
            id: spot.id,
            title: spot.title,
            address: spot.address,
            hourly_rate: spot.hourly_rate,
            payout_account: targetHostPayout,
          },
          totalAmount,
          platformFee,
          hostEarnings,
          durationHours,
          customerUser: {
            name: currentUser?.name || cardName,
            email: currentUser?.email || 'driver@parkease.io',
          },
          companyAccount,
        });
      }

      await createBooking({
        spot,
        startTime: new Date(),
        durationHours,
        vehiclePlate: vehiclePlate.toUpperCase().trim(),
        vehicleModel,
        paymentGateway: gateway,
        paymentMethod,
        paymentId: result.paymentId,
        orderId: result.orderId,
        hostPayoutRef: result.hostPayoutRef,
        companyCreditRef: result.companyCreditRef,
      });

      setSettlementReceipt({
        gateway,
        paymentId: result.paymentId,
        hostPayoutRef: result.hostPayoutRef,
        companyCreditRef: result.companyCreditRef,
        totalAmount,
        platformFee,
        hostEarnings,
      });

      // Trigger celebratory confetti in Desert Titanium gold
      confetti({
        particleCount: 110,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#dfba89', '#d4a373', '#f3dfc6', '#b37d4e', '#ffffff'],
      });

      setIsProcessing(false);
      setIsSuccess(true);
    } catch (err: any) {
      setIsProcessing(false);
      if (err?.message !== 'Checkout cancelled by user') {
        addToast('Payment Failed', err?.message || 'Could not process transaction with payment gateway.', 'error');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#181512] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-[#383028] flex flex-col max-h-[94vh] animate-in slide-in-from-bottom duration-300 gpu"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#12100e] text-[#f6f2ec] border-b border-[#383028] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#dfba89]/10 border border-[#dfba89]/30 flex items-center justify-center text-[#dfba89]">
              {isSuccess ? <Check className="w-4 h-4 text-[#dfba89]" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight text-[#f6f2ec]">
                {isSuccess ? 'Booking & Split Confirmed' : 'Verified Parking Checkout'}
              </h3>
              <p className="text-[11px] text-[#a89682]">
                {isSuccess ? 'Instant vendor split & commission executed' : 'Direct host payout with automated platform fee cut'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="w-8 h-8 rounded-full bg-[#1c1814] hover:bg-[#28211a] text-[#f6f2ec] border border-[#383028] flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          /* ======================================================== */
          /* BOOKING SUCCESS SCREEN WITH AUTOMATED SPLIT RECEIPT */
          /* ======================================================== */
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
            {/* Success Icon */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#dfba89]/30 to-[#b37d4e]/10 border-2 border-[#dfba89] flex items-center justify-center text-[#dfba89] shadow-xl shadow-[#dfba89]/20">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-[#34d399] text-[#12100e] text-[9px] font-black uppercase tracking-wider shadow-xs">
                Settled
              </span>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dfba89]/15 border border-[#dfba89]/30 text-[#dfba89] text-xs font-bold mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Split Payout Confirmed</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#f6f2ec]">
                Payment & Spot Reserved!
              </h3>
              <p className="text-xs text-[#a89682] max-w-sm mx-auto mt-1">
                Your space at <strong className="text-[#f6f2ec]">{spot.title}</strong> is reserved for vehicle <span className="font-mono text-[#dfba89] font-bold">{vehiclePlate}</span>.
              </p>
            </div>

            {/* Split Settlement Receipt */}
            {settlementReceipt && (
              <div className="w-full bg-[#12100e] border border-[#383028] rounded-2xl p-4 text-left space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#28221b]">
                  <span className="text-[10px] font-bold text-[#a89682] uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Automated Split Settlement</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#241f1a] text-[#dfba89] border border-[#383028] font-mono text-[10px] font-bold uppercase">
                    {settlementReceipt.gateway}
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between text-[#c2b29d]">
                    <span>Total Paid by Driver:</span>
                    <span className="font-bold text-[#f6f2ec]">₹{settlementReceipt.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span className="flex items-center gap-1">
                      <span>✓ Transferred to Spot Owner (90%):</span>
                    </span>
                    <span className="font-bold">₹{settlementReceipt.hostEarnings}</span>
                  </div>
                  <div className="flex justify-between text-[#dfba89]">
                    <span className="flex items-center gap-1">
                      <span>✓ Cut to Company Account (10%):</span>
                    </span>
                    <span className="font-bold">₹{settlementReceipt.platformFee}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#241e18] flex items-center justify-between text-[10px] text-[#756758]">
                  <span>Payout Ref: {settlementReceipt.hostPayoutRef.substring(0, 16)}</span>
                  <span>Fee Ref: {settlementReceipt.companyCreditRef.substring(0, 16)}</span>
                </div>
              </div>
            )}

            {/* Destination & Access Summary Card */}
            <div className="w-full bg-[#201c18] border border-[#383028] rounded-2xl p-3.5 text-left space-y-2 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-[#a89682] uppercase tracking-wider block">
                    Spot Location
                  </span>
                  <span className="text-xs font-bold text-[#f6f2ec] block mt-0.5">
                    {spot.address}, {spot.city}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-[#dfba89] bg-[#12100e] px-2.5 py-1 rounded-lg border border-[#383028]">
                  {durationHours} {durationHours === 1 ? 'Hour' : 'Hours'}
                </span>
              </div>

              {spot.gate_code && (
                <div className="p-2 rounded-xl bg-[#12100e] border border-[#383028] flex items-center justify-between">
                  <span className="text-xs text-[#a89682]">Gate Access Code / PIN:</span>
                  <span className="font-mono font-black text-[#dfba89] text-sm tracking-widest">
                    {spot.gate_code}
                  </span>
                </div>
              )}
            </div>

            {/* PROMINENT NAVIGATION CTA */}
            <div className="w-full space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;
                  window.open(url, '_blank');
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#dfba89] via-[#e5c499] to-[#c59b6d] hover:from-[#ebd3af] hover:to-[#d4a87b] text-[#12100e] font-black text-sm flex items-center justify-center gap-2 shadow-2xl shadow-[#dfba89]/30 transition-all cursor-pointer active:scale-[0.98]"
              >
                <Navigation className="w-4 h-4 text-[#12100e] fill-[#12100e]" />
                <span>Open Navigation (GPS)</span>
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="w-full pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  if (onBookingComplete) onBookingComplete();
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#1c1814] hover:bg-[#28211a] text-[#f6f2ec] border border-[#383028] font-bold text-xs transition cursor-pointer"
              >
                View Active Booking Pass
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="py-2.5 px-4 rounded-xl border border-[#383028] hover:bg-[#201c18] text-[#a89682] hover:text-[#f6f2ec] text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* CHECKOUT FORM WITH DUAL PAYMENT GATEWAY & COMMISSIONS */
          /* ======================================================== */
          <form onSubmit={handlePayAndConfirm} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Spot Snapshot */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#201c18] border border-[#383028]">
              {spot.photos && spot.photos.length > 0 ? (
                <img
                  src={spot.photos[0]}
                  alt={spot.title}
                  className="w-14 h-14 rounded-xl object-cover border border-[#383028] shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-[#100e0d] border border-[#383028] flex items-center justify-center text-[#dfba89] shrink-0">
                  <Car className="w-7 h-7" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-[#f6f2ec] truncate">{spot.title}</h4>
                <p className="text-[11px] text-[#a89682] truncate mt-0.5">{spot.address}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-black text-[#dfba89]">₹{spot.hourly_rate}/hr</span>
                  <span className="text-[10px] text-[#756758]">•</span>
                  <span className="text-[10px] text-[#a89682] capitalize">{spot.space_type}</span>
                </div>
              </div>
            </div>

            {/* Duration Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#a89682] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#dfba89]" />
                <span>Parking Duration</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 4, 8].map((hours) => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => setDurationHours(hours)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center border cursor-pointer ${
                      durationHours === hours
                        ? 'border-[#dfba89] bg-[#dfba89]/15 text-[#dfba89]'
                        : 'border-[#383028] bg-[#201c18] text-[#c2b29d] hover:bg-[#28211a]'
                    }`}
                  >
                    <span>{hours} hr{hours > 1 ? 's' : ''}</span>
                    <span className="text-[10px] font-normal opacity-80">₹{spot.hourly_rate * hours}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-[#a89682] uppercase tracking-wider flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-[#dfba89]" />
                <span>Vehicle Identification</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    required
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    placeholder="KA 03 MX 4921"
                    className="w-full px-3 py-2 text-xs font-bold uppercase tracking-wider bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                  />
                  <span className="text-[9px] text-[#756758] mt-0.5 block">License Plate</span>
                </div>
                <div>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="e.g. Creta / Swift"
                    className="w-full px-3 py-2 text-xs font-medium bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:outline-none focus:ring-2 focus:ring-[#dfba89]/60"
                  />
                  <span className="text-[9px] text-[#756758] mt-0.5 block">Vehicle Model</span>
                </div>
              </div>
            </div>

            {/* DUAL PAYMENT GATEWAY SELECTOR */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#a89682] uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#dfba89]" />
                  <span>Select Payment Gateway</span>
                </label>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Instant Split</span>
                </div>
              </div>

              {/* Gateway Tabs */}
              <div className="grid grid-cols-2 gap-2">
                {/* Razorpay Option */}
                <button
                  type="button"
                  onClick={() => {
                    setGateway('razorpay');
                    setPaymentMethod('upi');
                  }}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    gateway === 'razorpay'
                      ? 'border-[#dfba89] bg-[#dfba89]/10 shadow-xs'
                      : 'border-[#383028] bg-[#201c18] hover:bg-[#28211a]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#f6f2ec]">Razorpay</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#282119] text-[#dfba89] border border-[#dfba89]/30">
                      India / UPI
                    </span>
                  </div>
                  <p className="text-[10px] text-[#a89682] mt-1">
                    GPay, PhonePe, Paytm, QR, Indian Cards & NetBanking
                  </p>
                </button>

                {/* Stripe Option */}
                <button
                  type="button"
                  onClick={() => {
                    setGateway('stripe');
                    setPaymentMethod('card');
                  }}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    gateway === 'stripe'
                      ? 'border-[#dfba89] bg-[#dfba89]/10 shadow-xs'
                      : 'border-[#383028] bg-[#201c18] hover:bg-[#28211a]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#f6f2ec]">Stripe</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#201c18] text-[#c2b29d] border border-[#383028]">
                      Global
                    </span>
                  </div>
                  <p className="text-[10px] text-[#a89682] mt-1">
                    International Cards, Apple Pay & Google Pay
                  </p>
                </button>
              </div>

              {/* Sub-Methods for chosen gateway */}
              {gateway === 'razorpay' ? (
                <div className="p-3 rounded-2xl bg-[#201c18] border border-[#383028] space-y-2">
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                        paymentMethod === 'upi'
                          ? 'bg-[#dfba89] text-[#12100e] font-bold'
                          : 'bg-[#100e0d] text-[#c2b29d] border border-[#383028]'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>UPI & QR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                        paymentMethod === 'card'
                          ? 'bg-[#dfba89] text-[#12100e] font-bold'
                          : 'bg-[#100e0d] text-[#c2b29d] border border-[#383028]'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Cards</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('netbanking')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                        paymentMethod === 'netbanking'
                          ? 'bg-[#dfba89] text-[#12100e] font-bold'
                          : 'bg-[#100e0d] text-[#c2b29d] border border-[#383028]'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>NetBanking</span>
                    </button>
                  </div>

                  {paymentMethod === 'upi' && (
                    <div className="pt-1">
                      <div className="flex items-center gap-2 text-[11px] text-[#a89682]">
                        <QrCode className="w-4 h-4 text-[#dfba89]" />
                        <span>Supports PhonePe, Google Pay, Paytm, BHIM and UPI QR scan</span>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="pt-1 space-y-2">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="RuPay / Visa / Mastercard"
                        className="w-full px-3 py-1.5 text-xs font-mono bg-[#100e0d] text-[#f6f2ec] rounded-lg border border-[#383028]"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-[#201c18] border border-[#383028] space-y-2">
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                        paymentMethod === 'card'
                          ? 'bg-[#dfba89] text-[#12100e] font-bold'
                          : 'bg-[#100e0d] text-[#c2b29d] border border-[#383028]'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('apple_pay')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                        paymentMethod === 'apple_pay'
                          ? 'bg-[#dfba89] text-[#12100e] font-bold'
                          : 'bg-[#100e0d] text-[#c2b29d] border border-[#383028]'
                      }`}
                    >
                      <span> Pay</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('google_pay')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                        paymentMethod === 'google_pay'
                          ? 'bg-[#dfba89] text-[#12100e] font-bold'
                          : 'bg-[#100e0d] text-[#c2b29d] border border-[#383028]'
                      }`}
                    >
                      <span>G Pay</span>
                    </button>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="space-y-1.5 pt-1">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-mono bg-[#100e0d] text-[#f6f2ec] rounded-lg border border-[#383028]"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-3 py-1.5 text-xs font-mono bg-[#100e0d] text-[#f6f2ec] rounded-lg border border-[#383028]"
                        />
                        <input
                          type="password"
                          value={cardCvc}
                          maxLength={4}
                          onChange={(e) => setCardCvc(e.target.value)}
                          placeholder="CVC"
                          className="w-full px-3 py-1.5 text-xs font-mono bg-[#100e0d] text-[#f6f2ec] rounded-lg border border-[#383028]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* AUTOMATED SPLIT & COMMISSION TRANSPARENCY CARD */}
            <div className="p-3.5 rounded-2xl bg-[#12100e] border border-[#383028] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#dfba89] font-bold text-[11px] pb-1.5 border-b border-[#28221b]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Automated Split Payment Engine</span>
                </span>
                <span className="text-[10px] text-[#a89682]">
                  {gateway === 'razorpay' ? 'Razorpay Route' : 'Stripe Connect'}
                </span>
              </div>

              {/* Price rows */}
              <div className="space-y-1 text-[#a89682] text-[11px]">
                <div className="flex justify-between">
                  <span>Parking Rate:</span>
                  <span className="text-[#f6f2ec] font-semibold">₹{spot.hourly_rate} × {durationHours} hrs = ₹{basePrice}</span>
                </div>

                <div className="flex justify-between text-emerald-400">
                  <span className="flex items-center gap-1">
                    <span>↳ Spot Owner Payout (Direct):</span>
                  </span>
                  <span className="font-bold">₹{hostEarnings}</span>
                </div>

                <div className="flex justify-between text-[#dfba89]">
                  <span className="flex items-center gap-1">
                    <span>↳ Platform Commission Cut (10% to Company):</span>
                  </span>
                  <span className="font-bold">₹{platformFee}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#241e18] flex justify-between items-baseline">
                <span className="text-xs font-bold text-[#f6f2ec]">Total Customer Amount:</span>
                <span className="text-lg font-black text-[#dfba89]">₹{totalAmount}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing || isSuccess}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] disabled:opacity-50 text-[#12100e] font-black text-sm shadow-xl shadow-[#dfba89]/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#12100e]" />
                  <span>Processing {gateway === 'razorpay' ? 'Razorpay' : 'Stripe'} Gateway...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-[#12100e]" />
                  <span>Pay ₹{totalAmount} & Execute Split</span>
                </>
              )}
            </button>

            <p className="text-center text-[10px] text-[#756758]">
              Owner receives ₹{hostEarnings} directly • ₹{platformFee} commission auto-credited to company account
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
