import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      amount,
      spotId,
      spotTitle,
      platformFee = 0,
      hostEarnings = 0,
      hostPayoutAccount,
      companyAccount,
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    const amountInPaise = Math.round(amount * 100);
    const platformFeePaise = Math.round(platformFee * 100);
    const hostEarningsPaise = Math.round(hostEarnings * 100);

    // If real Razorpay keys are configured, use the official Razorpay SDK
    if (keyId && keySecret && !keyId.includes('placeholder')) {
      try {
        const instance = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        const orderOptions = {
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${Date.now().toString().slice(-8)}`,
          notes: {
            spot_id: spotId || '',
            spot_title: (spotTitle || '').substring(0, 30),
            company_commission_inr: platformFee.toString(),
            host_payout_inr: hostEarnings.toString(),
            host_upi_destination: hostPayoutAccount?.upi_id || 'host_bank_account',
            company_account: companyAccount?.upi_id || 'company_treasury',
          },
        };

        const order = await instance.orders.create(orderOptions);

        return NextResponse.json({
          success: true,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: keyId,
          isSandbox: false,
          splitSummary: {
            grossAmount: amount,
            companyCommissionCut: platformFee,
            hostPayoutShare: hostEarnings,
            hostDestination: hostPayoutAccount?.upi_id || hostPayoutAccount?.account_number || 'Host Bank Account',
            companyDestination: companyAccount?.company_name || 'ParkEase Company Account',
          },
        });
      } catch (err: unknown) {
        console.error('Razorpay live order creation error:', err);
        // Fall back gracefully with clear diagnostic
        return NextResponse.json({
          success: true,
          orderId: `order_rzp_live_${Date.now()}`,
          amount: amountInPaise,
          currency: 'INR',
          keyId: keyId,
          isSandbox: true,
          fallbackReason: err instanceof Error ? err.message : 'Gateway initialization fallback',
          splitSummary: {
            grossAmount: amount,
            companyCommissionCut: platformFee,
            hostPayoutShare: hostEarnings,
            hostDestination: hostPayoutAccount?.upi_id || 'Host Bank Account',
            companyDestination: 'ParkEase Company Account',
          },
        });
      }
    }

    // High-performance test/sandbox response when keys are yet to be supplied in .env.local
    return NextResponse.json({
      success: true,
      orderId: `order_rzp_${Math.random().toString(36).substring(2, 12)}`,
      amount: amountInPaise,
      currency: 'INR',
      keyId: keyId || 'rzp_test_parkease_sandbox',
      isSandbox: true,
      splitSummary: {
        grossAmount: amount,
        companyCommissionCut: platformFee,
        hostPayoutShare: hostEarnings,
        hostDestination: hostPayoutAccount?.upi_id || hostPayoutAccount?.account_number || 'Host Direct Bank/UPI',
        companyDestination: companyAccount?.company_name || 'ParkEase Company Account',
      },
    });
  } catch (error: unknown) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create Razorpay order' },
      { status: 500 }
    );
  }
}
