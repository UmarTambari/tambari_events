import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { transactions, orders } from "@/lib/db/schema";
import { verifyPayment } from "@/lib/paystack";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { success: false, message: "Reference is required" },
        { status: 400 }
      );
    }

    const transaction = await db.query.transactions.findFirst({
      where: eq(transactions.reference, reference),
      with: {
        order: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, message: "Transaction not found" },
        { status: 404 }
      );
    }

    if (transaction.isVerified) {
      return NextResponse.json({
        success: true,
        message: "Payment already verified",
        data: {
          reference: transaction.reference,
          status: transaction.status,
          amount: transaction.amount,
          paidAt: transaction.paidAt,
          orderNumber: transaction.order.orderNumber,
          orderId: transaction.order.id,
        },
      });
    }

    const verification = await verifyPayment(reference);

    const paymentStatus = verification.data.status;

    if (paymentStatus === "success") {
      await db
        .update(transactions)
        .set({
          status: "success",
          isVerified: true,
          verifiedAt: new Date(),
          paidAt: new Date(verification.data.paid_at),
          paystackResponse: verification.data,
          paystackReference: verification.data.reference,
          channel: verification.data.channel,
          cardType: verification.data.authorization?.card_type,
          bank: verification.data.authorization?.bank,
          lastFourDigits: verification.data.authorization?.last4,
          gatewayResponse: verification.data.gateway_response,
        })
        .where(eq(transactions.id, transaction.id));

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        data: {
          reference: transaction.reference,
          status: "success",
          amount: transaction.amount,
          paidAt: verification.data.paid_at,
          orderNumber: transaction.order.orderNumber,
          orderId: transaction.order.id,
        },
      });
    } else if (paymentStatus === "failed") {
      await db
        .update(transactions)
        .set({
          status: "failed",
          isVerified: true,
          verifiedAt: new Date(),
          failureReason: verification.data.gateway_response,
          gatewayResponse: verification.data.gateway_response,
        })
        .where(eq(transactions.id, transaction.id));

      await db
        .update(orders)
        .set({ status: "failed" })
        .where(eq(orders.id, transaction.orderId));

      return NextResponse.json({
        success: false,
        message: "Payment failed",
        data: {
          reference: transaction.reference,
          status: "failed",
          reason: verification.data.gateway_response,
          orderNumber: transaction.order.orderNumber,
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "Payment not completed",
        data: {
          reference: transaction.reference,
          status: paymentStatus,
          orderNumber: transaction.order.orderNumber,
        },
      });
    }
  } catch (error: any) {
    console.error("Verify payment error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify payment",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint - Check payment status without verifying
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { success: false, message: "Reference is required" },
        { status: 400 }
      );
    }

    const transaction = await db.query.transactions.findFirst({
      where: eq(transactions.reference, reference),
      with: {
        order: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, message: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        reference: transaction.reference,
        status: transaction.status,
        isVerified: transaction.isVerified,
        webhookReceived: transaction.webhookReceived,
        amount: transaction.amount,
        paidAt: transaction.paidAt,
        orderNumber: transaction.order.orderNumber,
        orderStatus: transaction.order.status,
      },
    });
  } catch (error: any) {
    console.error("Get payment status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get payment status",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
