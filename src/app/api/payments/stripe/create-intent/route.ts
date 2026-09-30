import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      amount,
      currency = 'inr',
      platformFee = 0,
      hostEarnings = 0,
      spotTitle = '',
      spotId = '',
      hostPayoutAccount,
      companyAccount,
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    const amountInSmallestUnit = Math.round(amount * 100);
    const platformFeeInSmallestUnit = Math.round(platformFee * 100);

    if (stripeSecretKey && !stripeSecretKey.includes('placeholder')) {
      try {
        const stripe = new Stripe(stripeSecretKey, {
          apiVersion: '2025-02-24.acacia' as any,
        });

        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInSmallestUnit,
          currency: currency.toLowerCase(),
          description: `ParkEase Parking: ${spotTitle}`,
          metadata: {
            spot_id: spotId,
            platform_commission_fee: platformFee.toString(),
            host_earnings: hostEarnings.toString(),
            host_payout_account: hostPayoutAccount?.account_holder_name || '',
            company_account: companyAccount?.company_name || 'ParkEase',
          },
          // Automatic payment methods (Card, Apple Pay, Google Pay)
          automatic_payment_methods: {
            enabled: true,
          },
        });

        return NextResponse.json({
          success: true,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          publishableKey,
          isSandbox: false,
          splitSummary: {
            totalAmount: amount,
            companyCommissionCut: platformFee,
            hostPayoutShare: hostEarnings,
          },
        });
      } catch (err: unknown) {
        console.warn('Stripe live PaymentIntent creation fallback:', err);
      }
    }

    // Sandbox / Test fallback
    const mockIntentId = `pi_stripe_${Math.random().toString(36).substring(2, 14)}`;
    return NextResponse.json({
      success: true,
      clientSecret: `${mockIntentId}_secret_${Math.random().toString(36).substring(2, 10)}`,
      paymentIntentId: mockIntentId,
      publishableKey: publishableKey || 'pk_test_parkease_sandbox',
      isSandbox: true,
      splitSummary: {
        totalAmount: amount,
        companyCommissionCut: platformFee,
        hostPayoutShare: hostEarnings,
        hostDestination: hostPayoutAccount?.upi_id || hostPayoutAccount?.account_number || 'Host Bank Account',
        companyDestination: companyAccount?.company_name || 'ParkEase Company Account',
      },
    });
  } catch (error: unknown) {
    console.error('Stripe create-intent error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create PaymentIntent' },
      { status: 500 }
    );
  }
}
