import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  getTransactionByReference, 
  updateTransaction 
} from '@/lib/queries/transactions.queries';
import { 
  getOrderById, 
  updateOrderStatus,
  getOrderWithDetails
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
      return NextResponse.json({ error: 'Transaction reference is required' }, { status: 400 });
    }

    // Get transaction
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

    // Already successfully paid → early return
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
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // Use secret key, not public
          'Content-Type': 'application/json',
        },
      }
    );

    if (!paystackResponse.ok) {
      const errorData = await paystackResponse.json().catch(() => ({}));
      console.error('Paystack verify failed:', errorData);
      return NextResponse.json({ error: 'Payment verification failed with Paystack' }, { status: 400 });
    }

    const paystackData = await paystackResponse.json();

    if (paystackData.data.status !== 'success') {
      return NextResponse.json(
        { error: `Payment not successful. Status: ${paystackData.data.status}` },
        { status: 400 }
      );
    }

    // Amount mismatch check
    if (paystackData.data.amount !== order.totalAmount) {
      console.error('Amount mismatch', { expected: order.totalAmount, received: paystackData.data.amount });
      return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 });
    }

    // === Update Transaction (safe null handling) ===
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
      paidAt: paystackData.data.paid_at ? new Date(paystackData.data.paid_at) : new Date(),
      webhookReceived: true,        // optional
      webhookReceivedAt: new Date(),
    });

    // === Update Order ===
    await updateOrderStatus(order.id, 'paid', {
      paidAt: paystackData.data.paid_at ? new Date(paystackData.data.paid_at) : new Date(),
    });

    // Optional: Refresh full order for response
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
      fullOrder: updatedOrder,   // useful for UI if needed
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to verify payment' },
      { status: 500 }
    );
  }
}