import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getTransactionByReference,
  updateTransaction,
} from '@/lib/queries/transactions.queries';
import {
  getOrderById,
  updateOrderStatus,
  getOrderWithDetails,
} from '@/lib/queries/order.queries';
import { getUserByAuthId } from '@/lib/queries/users.queries';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByAuthId(authUser.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { error: 'Transaction reference is required' },
        { status: 400 }
      );
    }

    const transaction = await getTransactionByReference(reference);
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const order = await getOrderById(transaction.orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Already successfully paid — nothing to verify, short-circuit.
    if (transaction.status === 'success' && order.status === 'paid') {
      return NextResponse.json({
        success: true,
        message: 'Payment already verified',
        order: { id: order.id, orderNumber: order.orderNumber, status: 'paid' },
      });
    }

    // Call Paystack Verify
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!paystackResponse.ok) {
      const errorData = await paystackResponse.json().catch(() => ({}));
      console.error('Paystack verify failed:', errorData);
      // This is a genuine failure to reach/parse Paystack — a real error,
      // not a "payment still pending" state.
      return NextResponse.json(
        { success: false, error: 'Payment verification failed with Paystack' },
        { status: 502 }
      );
    }

    const paystackData = await paystackResponse.json();
    const paymentStatus: string | undefined = paystackData?.data?.status;

    // Anything other than "success" (abandoned, pending, failed, queued...)
    // is a NORMAL state while the user is mid-checkout — not an application
    // error. Return 200 with `pending: true` so the frontend can distinguish
    // "still waiting" from "something actually broke."
    if (paymentStatus !== 'success') {
      return NextResponse.json({
        success: false,
        pending: true,
        status: paymentStatus ?? 'unknown',
        message: `Payment status: ${paymentStatus ?? 'unknown'}`,
      });
    }

    // Amount mismatch is a genuine error — not a pending state.
    if (paystackData.data.amount !== order.totalAmount) {
      console.error('Amount mismatch', {
        expected: order.totalAmount,
        received: paystackData.data.amount,
      });
      return NextResponse.json(
        { success: false, error: 'Payment amount mismatch' },
        { status: 400 }
      );
    }

    // === Update Transaction (verification only) ===
    // NOTE: webhookReceived / webhookReceivedAt are intentionally NOT set
    // here — those belong exclusively to /api/payments/webhook. QR
    // generation and quantitySold increments also stay out of this route;
    // the webhook remains the single fulfillment authority so the two
    // paths can never double-process the same order.
    await updateTransaction(transaction.id, {
      status: 'success',
      channel: paystackData.data.channel || null,
      cardType: paystackData.data.authorization?.card_type || null,
      bank: paystackData.data.authorization?.bank || null,
      lastFourDigits: paystackData.data.authorization?.last4 || null,
      paystackResponse: paystackData,
      gatewayResponse: paystackData.data.gateway_response || null,
      isVerified: true,
      verifiedAt: new Date(),
      paidAt: paystackData.data.paid_at
        ? new Date(paystackData.data.paid_at)
        : new Date(),
    });

    await updateOrderStatus(order.id, 'paid', {
      paidAt: paystackData.data.paid_at
        ? new Date(paystackData.data.paid_at)
        : new Date(),
    });

    const updatedOrder = await getOrderWithDetails(order.id);

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: 'paid',
        paidAt: paystackData.data.paid_at,
      },
      fullOrder: updatedOrder,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify payment',
      },
      { status: 500 }
    );
  }
}