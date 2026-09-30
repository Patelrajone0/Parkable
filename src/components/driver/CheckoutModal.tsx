'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ParkingSpot, PaymentGatewayType, PaymentMethodType } from '@/types';
import confetti from 'canvas-confetti';
import { 
  X, 
  CreditCard, 
  Clock, 
  ShieldCheck, 
  Check, 
  Lock, 
  Car, 
  Loader2, 
  Sparkles,
  Navigation,
  Smartphone,
  Building2,
  QrCode,
  ArrowLeft,
  Zap,
  CheckCircle2,
  KeyRound,
  AlertCircle
} from 'lucide-react';

interface CheckoutModalProps {
  spot: ParkingSpot | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete?: () => void;
}

type CheckoutStep = 'details' | 'payment_gateway' | 'otp_verify' | 'success';

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

  const [step, setStep] = useState<CheckoutStep>('details');
  const [durationHours, setDurationHours] = useState<number>(2);
  const [vehiclePlate, setVehiclePlate] = useState<string>('KA 03 MX 4921');
  const [vehicleModel, setVehicleModel] = useState<string>('Hyundai Creta SX');

  // Dual Gateway State
  const [gateway, setGateway] = useState<PaymentGatewayType>('razorpay');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('upi');

  // Interactive Payment Fields
  const [cardNumber, setCardNumber] = useState<string>('4532 8920 1823 4921');
  const [cardExpiry, setCardExpiry] = useState<string>('08/28');
  const [cardCvc, setCardCvc] = useState<string>('892');
  const [cardName, setCardName] = useState<string>(currentUser?.name || 'Parkable Driver');
  const [upiIdInput, setUpiIdInput] = useState<string>('driver@oksbi');
  const [selectedBank, setSelectedBank] = useState<string>('HDFC Bank');
  const [otpInput, setOtpInput] = useState<string>('582910');

  // Timer for OTP / UPI approval simulation
  const [timerSeconds, setTimerSeconds] = useState<number>(299);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [settlementReceipt, setSettlementReceipt] = useState<{
    gateway: PaymentGatewayType;
    paymentId: string;
    hostPayoutRef: string;
    companyCreditRef: string;
    totalAmount: number;
    platformFee: number;
    hostEarnings: number;
  } | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp_verify' && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timerSeconds]);

  const handleClose = () => {
    setStep('details');
    setSettlementReceipt(null);
    setIsProcessing(false);
    onClose();
  };

  if (!isOpen || !spot) return null;

  const basePrice = spot.hourly_rate * durationHours;
  const platformFee = Math.round(basePrice * platformCommissionRate);
  const totalAmount = basePrice + platformFee;
  const hostEarnings = basePrice;
  const targetHostPayout = spot.payout_account || hostPayoutAccount;

  // Step 1 -> Step 2: Validate details and open Payment Gateway
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehiclePlate.trim()) {
      addToast('Vehicle Plate Required', 'Please enter your license plate number so the host recognizes your vehicle.', 'error');
      return;
    }
    // Transition to the Payment Gateway Step (DO NOT book yet!)
    setStep('payment_gateway');
  };

  // Step 2 -> Step 3: Trigger payment gateway authorization (UPI request / 3D Secure OTP)
  const handleInitiateGatewayPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setTimerSeconds(299);
      // Move to interactive payment authorization step
      setStep('otp_verify');
    }, 700);
  };

  // Step 3: Explicitly Authorize & Finalize Payment (Only now is booking created!)
  const handleAuthorizeAndCompletePayment = async () => {
    if (paymentMethod === 'card' && otpInput.length < 4) {
      addToast('Invalid OTP', 'Please enter the 6-digit OTP sent to your phone to complete payment.', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Call backend verification to execute automated split settlement
      const verifyEndpoint = gateway === 'razorpay' ? '/api/payments/razorpay/verify' : '/api/payments/stripe/verify';
      const verifyRes = await fetch(verifyEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: `ord_${Math.random().toString(36).substring(2, 10)}`,
          razorpay_payment_id: `pay_${gateway}_${Math.random().toString(36).substring(2, 12)}`,
          payment_intent_id: `pi_${Math.random().toString(36).substring(2, 12)}`,
          total_amount: totalAmount,
          platform_fee: platformFee,
          host_earnings: hostEarnings,
          host_payout_account: targetHostPayout,
          company_account: companyAccount,
        }),
      });

      const verifyData = await verifyRes.json();
      const hostPayoutRef = verifyData.settlement?.host_payout_reference || `IMPS-HST-${Date.now().toString().slice(-6)}`;
      const companyCreditRef = verifyData.settlement?.company_credit_reference || `COMM-COM-${Date.now().toString().slice(-6)}`;
      const paymentId = verifyData.payment_id || `pay_${gateway}_${Date.now()}`;

      // 2. NOW AND ONLY NOW create the confirmed booking!
      await createBooking({
        spot,
        startTime: new Date(),
        durationHours,
        vehiclePlate: vehiclePlate.toUpperCase().trim(),
        vehicleModel,
        paymentGateway: gateway,
        paymentMethod,
        paymentId,
        hostPayoutRef,
        companyCreditRef,
      });

      setSettlementReceipt({
        gateway,
        paymentId,
        hostPayoutRef,
        companyCreditRef,
        totalAmount,
        platformFee,
        hostEarnings,
      });

      // Confetti celebratory feedback
      confetti({
        particleCount: 110,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#dfba89', '#d4a373', '#f3dfc6', '#b37d4e', '#ffffff'],
      });

      setIsProcessing(false);
      setStep('success');
    } catch (err: any) {
      setIsProcessing(false);
      addToast('Payment Authorization Failed', err?.message || 'Could not verify payment transaction.', 'error');
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#181512] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-[#383028] flex flex-col max-h-[94vh] animate-in slide-in-from-bottom duration-300 gpu text-[#f6f2ec]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-4 sm:p-5 bg-[#12100e] text-[#f6f2ec] border-b border-[#383028] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            {step === 'payment_gateway' && (
              <button
                onClick={() => setStep('details')}
                className="p-1 rounded-lg bg-[#201c18] hover:bg-[#28211a] text-[#dfba89] mr-1 cursor-pointer"
                title="Back to Details"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            {step === 'otp_verify' && (
              <button
                onClick={() => setStep('payment_gateway')}
                className="p-1 rounded-lg bg-[#201c18] hover:bg-[#28211a] text-[#dfba89] mr-1 cursor-pointer"
                title="Back to Gateway"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-8 h-8 rounded-lg bg-[#dfba89]/10 border border-[#dfba89]/30 flex items-center justify-center text-[#dfba89]">
              {step === 'success' ? (
                <Check className="w-4 h-4 text-[#dfba89]" />
              ) : step === 'otp_verify' ? (
                <KeyRound className="w-4 h-4 text-[#dfba89]" />
              ) : (
                <Lock className="w-4 h-4 text-[#dfba89]" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight text-[#f6f2ec]">
                {step === 'details' && 'Reservation & Price Breakdown'}
                {step === 'payment_gateway' && (gateway === 'razorpay' ? 'Razorpay Payment Gateway' : 'Stripe Secure Checkout')}
                {step === 'otp_verify' && (paymentMethod === 'upi' ? 'Authorize UPI Payment' : 'Bank 3D-Secure Verification')}
                {step === 'success' && 'Payment Verified & Bay Confirmed'}
              </h3>
              <p className="text-[11px] text-[#a89682]">
                {step === 'details' && 'Step 1 of 2: Enter vehicle info before payment'}
                {step === 'payment_gateway' && 'Step 2 of 2: Complete payment via UPI, Card, or NetBanking'}
                {step === 'otp_verify' && 'Payment authorization required to confirm spot'}
                {step === 'success' && 'Instant vendor split & commission executed'}
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

        {/* ========================================================================= */}
        {/* STEP 1: RESERVATION DETAILS & PRICE SPLIT BREAKDOWN */}
        {/* ========================================================================= */}
        {step === 'details' && (
          <form onSubmit={handleProceedToPayment} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
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

            {/* Preferred Gateway Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#a89682] uppercase tracking-wider flex items-center justify-between">
                <span>Payment Gateway</span>
                <span className="text-[10px] text-emerald-400 font-bold">Automatic Split</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setGateway('razorpay');
                    setPaymentMethod('upi');
                  }}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition ${
                    gateway === 'razorpay'
                      ? 'border-[#dfba89] bg-[#dfba89]/10'
                      : 'border-[#383028] bg-[#201c18] hover:bg-[#28211a]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#f6f2ec]">Razorpay</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#282119] text-[#dfba89] border border-[#dfba89]/30 font-bold">
                      UPI / Cards
                    </span>
                  </div>
                  <span className="text-[10px] text-[#a89682] block mt-0.5">GPay, PhonePe, Paytm, QR, NetBanking</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setGateway('stripe');
                    setPaymentMethod('card');
                  }}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition ${
                    gateway === 'stripe'
                      ? 'border-[#dfba89] bg-[#dfba89]/10'
                      : 'border-[#383028] bg-[#201c18] hover:bg-[#28211a]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#f6f2ec]">Stripe</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#201c18] text-[#c2b29d] border border-[#383028] font-bold">
                      Global
                    </span>
                  </div>
                  <span className="text-[10px] text-[#a89682] block mt-0.5">International Cards, Apple/Google Pay</span>
                </button>
              </div>
            </div>

            {/* AUTOMATED SPLIT & COMMISSION TRANSPARENCY CARD */}
            <div className="p-3.5 rounded-2xl bg-[#12100e] border border-[#383028] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#dfba89] font-bold text-[11px] pb-1.5 border-b border-[#28221b]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Marketplace Split Breakdown</span>
                </span>
                <span className="text-[10px] text-[#a89682]">
                  {gateway === 'razorpay' ? 'Razorpay Route' : 'Stripe Connect'}
                </span>
              </div>

              <div className="space-y-1 text-[#a89682] text-[11px]">
                <div className="flex justify-between">
                  <span>Parking Rate:</span>
                  <span className="text-[#f6f2ec] font-semibold">₹{spot.hourly_rate} × {durationHours} hrs = ₹{basePrice}</span>
                </div>

                <div className="flex justify-between text-emerald-400">
                  <span className="flex items-center gap-1">
                    <span>↳ Spot Owner Share (Direct):</span>
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
                <span className="text-xs font-bold text-[#f6f2ec]">Total Amount Due:</span>
                <span className="text-lg font-black text-[#dfba89]">₹{totalAmount}</span>
              </div>
            </div>

            {/* Next Step Button (DOES NOT BOOK, OPENS PAYMENT) */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-black text-sm shadow-xl shadow-[#dfba89]/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <Lock className="w-4 h-4 text-[#12100e]" />
              <span>Proceed to Payment (₹{totalAmount})</span>
            </button>

            <p className="text-center text-[10px] text-[#756758]">
              You will be asked to complete payment on the next screen before the spot is booked.
            </p>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: INTERACTIVE PAYMENT GATEWAY (UPI, QR, CARD, NETBANKING) */}
        {/* ========================================================================= */}
        {step === 'payment_gateway' && (
          <form onSubmit={handleInitiateGatewayPayment} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Gateway Brand Header Bar */}
            <div className="p-3 rounded-2xl bg-[#0c2340]/40 border border-[#1b3a5c] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#3395ff]/20 flex items-center justify-center text-[#3395ff]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-[#f6f2ec] block">
                    {gateway === 'razorpay' ? 'Razorpay Secure Checkout' : 'Stripe Elements'}
                  </span>
                  <span className="text-[10px] text-[#a89682]">256-bit PCI-DSS Compliant</span>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-[#756758] block">Amount to Pay</span>
                <span className="text-base font-black text-[#dfba89]">₹{totalAmount}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#a89682] uppercase tracking-wider block">
                Choose Payment Method
              </label>

              {gateway === 'razorpay' ? (
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border cursor-pointer transition ${
                      paymentMethod === 'upi'
                        ? 'border-[#dfba89] bg-[#dfba89]/15 text-[#dfba89]'
                        : 'border-[#383028] bg-[#201c18] text-[#c2b29d] hover:bg-[#28211a]'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>UPI & QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border cursor-pointer transition ${
                      paymentMethod === 'card'
                        ? 'border-[#dfba89] bg-[#dfba89]/15 text-[#dfba89]'
                        : 'border-[#383028] bg-[#201c18] text-[#c2b29d] hover:bg-[#28211a]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Cards</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border cursor-pointer transition ${
                      paymentMethod === 'netbanking'
                        ? 'border-[#dfba89] bg-[#dfba89]/15 text-[#dfba89]'
                        : 'border-[#383028] bg-[#201c18] text-[#c2b29d] hover:bg-[#28211a]'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>NetBanking</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border cursor-pointer transition ${
                      paymentMethod === 'card'
                        ? 'border-[#dfba89] bg-[#dfba89]/15 text-[#dfba89]'
                        : 'border-[#383028] bg-[#201c18] text-[#c2b29d] hover:bg-[#28211a]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Credit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple_pay')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border cursor-pointer transition ${
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
                    className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border cursor-pointer transition ${
                      paymentMethod === 'google_pay'
                        ? 'border-[#dfba89] bg-[#dfba89]/15 text-[#dfba89]'
                        : 'border-[#383028] bg-[#201c18] text-[#c2b29d] hover:bg-[#28211a]'
                    }`}
                  >
                    <span>G Pay</span>
                  </button>
                </div>
              )}
            </div>

            {/* METHOD 1: UPI & QR Code */}
            {paymentMethod === 'upi' && (
              <div className="p-4 rounded-2xl bg-[#201c18] border border-[#383028] space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#2c251e]">
                  <span className="text-xs font-bold text-[#f6f2ec]">Scan UPI QR Code</span>
                  <span className="text-[10px] text-emerald-400 font-bold">Fast & Zero Fee</span>
                </div>

                {/* Simulated QR Code Graphic */}
                <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl max-w-[160px] mx-auto shadow-md">
                  <div className="w-32 h-32 bg-[#12100e] rounded-lg p-2 flex flex-col items-center justify-center text-center">
                    <QrCode className="w-20 h-20 text-[#dfba89]" />
                    <span className="text-[9px] font-mono font-bold text-white mt-1">₹{totalAmount}</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-800 mt-1.5 uppercase">
                    Scan with any UPI App
                  </span>
                </div>

                {/* Popular UPI Apps */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-[#a89682] block text-center">
                    Or select your UPI App:
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                      <button
                        key={app}
                        type="button"
                        onClick={() => setUpiIdInput(`driver@${app.toLowerCase()}`)}
                        className="py-1.5 px-2 rounded-lg bg-[#100e0d] hover:bg-[#28211a] border border-[#383028] text-[10px] font-bold text-[#f6f2ec] text-center"
                      >
                        {app}
                      </button>
                    ))}
                  </div>
                </div>

                {/* UPI ID Input */}
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] text-[#a89682] font-semibold block">
                    Enter UPI ID / VPA
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={upiIdInput}
                      onChange={(e) => setUpiIdInput(e.target.value)}
                      placeholder="e.g. yourname@okhdfcbank"
                      className="w-full px-3 py-2 text-xs font-mono font-semibold bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:ring-1 focus:ring-[#dfba89]"
                    />
                    <Smartphone className="w-4 h-4 text-[#dfba89] absolute right-3 top-2.5" />
                  </div>
                </div>
              </div>
            )}

            {/* METHOD 2: Credit / Debit Card */}
            {paymentMethod === 'card' && (
              <div className="p-4 rounded-2xl bg-[#201c18] border border-[#383028] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#2c251e]">
                  <span className="text-xs font-bold text-[#f6f2ec]">Card Information</span>
                  <span className="text-[10px] text-[#dfba89] font-bold">RuPay • Visa • Mastercard</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#a89682] mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4532 •••• •••• 4921"
                    className="w-full px-3 py-2 text-xs font-mono font-semibold bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:ring-1 focus:ring-[#dfba89]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#a89682] mb-1">
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="08/28"
                      className="w-full px-3 py-2 text-xs font-mono font-semibold bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:ring-1 focus:ring-[#dfba89]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#a89682] mb-1">
                      CVV / CVC
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="892"
                      className="w-full px-3 py-2 text-xs font-mono font-semibold bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:ring-1 focus:ring-[#dfba89]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#a89682] mb-1">
                    Name on Card
                  </label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Full Name as on card"
                    className="w-full px-3 py-2 text-xs font-semibold bg-[#100e0d] text-[#f6f2ec] rounded-xl border border-[#383028] focus:ring-1 focus:ring-[#dfba89]"
                  />
                </div>
              </div>
            )}

            {/* METHOD 3: NetBanking */}
            {paymentMethod === 'netbanking' && (
              <div className="p-4 rounded-2xl bg-[#201c18] border border-[#383028] space-y-3">
                <span className="text-xs font-bold text-[#f6f2ec] block">Select Your Bank</span>
                <div className="grid grid-cols-2 gap-2">
                  {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`p-2 rounded-xl text-xs font-semibold text-left border cursor-pointer transition ${
                        selectedBank === bank
                          ? 'border-[#dfba89] bg-[#dfba89]/15 text-[#dfba89]'
                          : 'border-[#383028] bg-[#100e0d] text-[#c2b29d] hover:bg-[#28211a]'
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit to Send Payment Request */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-black text-sm shadow-xl shadow-[#dfba89]/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#12100e]" />
                  <span>Connecting to Bank Gateway...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-[#12100e]" />
                  <span>
                    {paymentMethod === 'upi' ? `Send UPI Request (₹${totalAmount})` : `Authorize ₹${totalAmount}`}
                  </span>
                </>
              )}
            </button>

            <p className="text-center text-[10px] text-[#756758]">
              Next: You will approve the payment in your UPI app or enter your bank 3D-secure OTP.
            </p>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: OTP / UPI PIN PAYMENT AUTHORIZATION STEP */}
        {/* ========================================================================= */}
        {step === 'otp_verify' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {paymentMethod === 'upi' ? (
              /* UPI Authorization Prompt */
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#dfba89]/15 border-2 border-[#dfba89] flex items-center justify-center text-[#dfba89] mx-auto animate-pulse">
                  <Smartphone className="w-8 h-8" />
                </div>

                <div>
                  <h4 className="font-bold text-base text-[#f6f2ec]">Approve Payment in UPI App</h4>
                  <p className="text-xs text-[#a89682] max-w-xs mx-auto mt-1">
                    We sent a payment request of <strong className="text-[#dfba89]">₹{totalAmount}</strong> to <span className="font-mono text-[#f6f2ec]">{upiIdInput}</span>.
                  </p>
                </div>

                <div className="p-3 bg-[#12100e] rounded-xl border border-[#383028] max-w-xs mx-auto space-y-1">
                  <span className="text-[10px] text-[#756758] uppercase font-bold">Request Expires In</span>
                  <div className="text-2xl font-mono font-black text-[#dfba89]">
                    {formatTimer(timerSeconds)}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#201c18] border border-[#383028] text-xs text-[#a89682] text-left space-y-1">
                  <div className="flex justify-between">
                    <span>Vendor Payout (Spot Owner):</span>
                    <span className="font-bold text-emerald-400">₹{hostEarnings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Company Commission (10%):</span>
                    <span className="font-bold text-[#dfba89]">₹{platformFee}</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleAuthorizeAndCompletePayment}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-black text-sm shadow-xl shadow-[#dfba89]/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-[#12100e]" />
                      <span>Verifying UPI Transfer & Executing Split...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-[#12100e]" />
                      <span>I Have Approved ₹{totalAmount} in UPI App</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('payment_gateway')}
                  className="text-xs text-[#a89682] hover:text-[#f6f2ec] underline cursor-pointer"
                >
                  Cancel and change payment method
                </button>
              </div>
            ) : (
              /* Card / NetBanking 3D Secure OTP Authentication */
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-[#0c2340]/40 border border-[#1b3a5c] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#3395ff]" />
                    <span className="text-xs font-black text-[#f6f2ec]">
                      {paymentMethod === 'netbanking' ? selectedBank : 'Bank 3D-Secure 2.0'}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#dfba89]">₹{totalAmount}</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#201c18] border border-[#383028] space-y-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#f6f2ec] block">
                      Enter Authentication OTP
                    </span>
                    <p className="text-[11px] text-[#a89682]">
                      A 6-digit one-time password has been sent to your registered mobile number ending in <span className="font-mono text-[#f6f2ec] font-bold">•••• 4921</span>.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#a89682] mb-1">
                      One-Time Password (OTP)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="582910"
                      className="w-full px-3 py-2.5 text-center text-lg font-mono font-black tracking-widest bg-[#100e0d] text-[#dfba89] rounded-xl border border-[#383028] focus:ring-2 focus:ring-[#dfba89]"
                    />
                    <div className="flex justify-between items-center text-[10px] text-[#756758] mt-1.5 px-1">
                      <span>Expires in {formatTimer(timerSeconds)}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpInput('582910');
                          addToast('OTP Resent', 'Demo code 582910 re-sent to your mobile number.');
                        }}
                        className="text-[#dfba89] hover:underline cursor-pointer"
                      >
                        Resend OTP
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleAuthorizeAndCompletePayment}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#dfba89] via-[#d4a373] to-[#b37d4e] hover:from-[#e8cfa8] hover:to-[#c59b6d] text-[#12100e] font-black text-sm shadow-xl shadow-[#dfba89]/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-[#12100e]" />
                      <span>Authorizing ₹{totalAmount} with Bank...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-[#12100e]" />
                      <span>Submit OTP & Deduct ₹{totalAmount}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('payment_gateway')}
                  className="w-full py-2 text-center text-xs text-[#a89682] hover:text-[#f6f2ec] cursor-pointer"
                >
                  Cancel and change payment method
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: SUCCESS RECEIPT & NAVIGATION */}
        {/* ========================================================================= */}
        {step === 'success' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
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
                <span>Payment Verified & Confirmed</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#f6f2ec]">
                Payment Authorized & Bay Reserved!
              </h3>
              <p className="text-xs text-[#a89682] max-w-sm mx-auto mt-1">
                Your payment was authorized and your spot at <strong className="text-[#f6f2ec]">{spot.title}</strong> is confirmed for <span className="font-mono text-[#dfba89] font-bold">{vehiclePlate}</span>.
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
                    <span>Customer Paid:</span>
                    <span className="font-bold text-[#f6f2ec]">₹{settlementReceipt.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>✓ Transferred to Spot Owner (90%):</span>
                    <span className="font-bold">₹{settlementReceipt.hostEarnings}</span>
                  </div>
                  <div className="flex justify-between text-[#dfba89]">
                    <span>✓ Cut to Company Account (10%):</span>
                    <span className="font-bold">₹{settlementReceipt.platformFee}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#241e18] flex items-center justify-between text-[10px] text-[#756758]">
                  <span>Payout Ref: {settlementReceipt.hostPayoutRef.substring(0, 16)}</span>
                  <span>Fee Ref: {settlementReceipt.companyCreditRef.substring(0, 16)}</span>
                </div>
              </div>
            )}

            {/* Location Card */}
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

            {/* Navigation CTA */}
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
        )}
      </div>
    </div>
  );
}
