import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { webhookLogs } from "@/lib/db/schema";
import {
  getTransactionByReference,
  updateTransaction,
} from "@/lib/queries/transactions.queries";
import {
  getOrderById,
  updateOrderStatus,
} from "@/lib/queries/order.queries";
import {
  createAttendee,
  updateAttendeeQRCode,
} from "@/lib/queries/attendee.queries";
import { generateQRData } from "@/lib/utils/generateQRdata";
import { generateTicketCode } from "@/lib/utils/generateReference";

function verifySignature(payload: string, signature: string): boolean {
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(payload)
    .digest("hex");
  return hash === signature;
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-paystack-signature");
    const body = await request.text();

    // Log the incoming webhook immediately
    const webhookLog = await db
      .insert(webhookLogs)
      .values({
        event: "webhook_received",
        payload: JSON.parse(body),
        headers: Object.fromEntries(request.headers.entries()),
        signature: signature || "",
        isSignatureValid: false,
      })
      .returning();

    // Verify the Paystack signature
    if (!signature || !verifySignature(body, signature)) {
      console.error("Invalid webhook signature");
      await db
        .update(webhookLogs)
        .set({
          status: "failed",
          errorMessage: "Invalid signature",
        })
        .where(eq(webhookLogs.id, webhookLog[0].id));

      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    await db
      .update(webhookLogs)
      .set({ isSignatureValid: true })
      .where(eq(webhookLogs.id, webhookLog[0].id));

    const data = JSON.parse(body);
    const event = data.event;
    const webhookData = data.data;

    await db
      .update(webhookLogs)
      .set({
        event,
        reference: webhookData.reference,
        status: "processing",
      })
      .where(eq(webhookLogs.id, webhookLog[0].id));

    // Handle successful charge
    if (event === "charge.success") {
      const reference = webhookData.reference;

      const transaction = await getTransactionByReference(reference);

      if (!transaction) {
        await db
          .update(webhookLogs)
          .set({ status: "failed", errorMessage: "Transaction not found" })
          .where(eq(webhookLogs.id, webhookLog[0].id));

        return NextResponse.json(
          { error: "Transaction not found" },
          { status: 404 }
        );
      }

      // Idempotency check — don't process the same webhook twice
      if (transaction.status === "success" && transaction.isVerified) {
        await db
          .update(webhookLogs)
          .set({ status: "ignored", errorMessage: "Already processed" })
          .where(eq(webhookLogs.id, webhookLog[0].id));

        return NextResponse.json({ message: "Already processed" });
      }

      const order = await getOrderById(transaction.orderId);
      if (!order) {
        await db
          .update(webhookLogs)
          .set({ status: "failed", errorMessage: "Order not found" })
          .where(eq(webhookLogs.id, webhookLog[0].id));

        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      // Amount integrity check
      if (webhookData.amount !== order.totalAmount) {
        await db
          .update(webhookLogs)
          .set({ status: "failed", errorMessage: "Amount mismatch" })
          .where(eq(webhookLogs.id, webhookLog[0].id));

        console.error("Payment amount mismatch:", {
          expected: order.totalAmount,
          received: webhookData.amount,
        });

        return NextResponse.json(
          { error: "Amount mismatch" },
          { status: 400 }
        );
      }

      // Update transaction record
      await updateTransaction(transaction.id, {
        status: "success",
        channel: webhookData.channel,
        cardType: webhookData.authorization?.card_type,
        bank: webhookData.authorization?.bank,
        lastFourDigits: webhookData.authorization?.last4,
        paystackResponse: JSON.stringify(webhookData),
        gatewayResponse: webhookData.gateway_response,
        isVerified: true,
        verifiedAt: new Date(),
        webhookReceived: true,
        webhookReceivedAt: new Date(),
        paidAt: new Date(webhookData.paid_at),
      });

      // Mark order as paid
      await updateOrderStatus(order.id, "paid", {
        paidAt: new Date(webhookData.paid_at),
      });

      // Generate attendee records with QR data
      // This path is hit when payment goes through Paystack redirect flow
      // (as opposed to the inline flow handled in the initialize route).
      // Only create attendees if they don't already exist for this order.
      const { getAttendeesByOrder } = await import(
        "@/lib/queries/attendee.queries"
      );
      const existingAttendees = await getAttendeesByOrder(order.id);

      if (existingAttendees.length === 0) {
        // Attendees not yet created — this is the redirect/callback flow.
        // Fetch order items to know what tickets to create.
        const { getOrderWithDetails } = await import(
          "@/lib/queries/order.queries"
        );
        const orderWithDetails = await getOrderWithDetails(order.id);

        if (orderWithDetails) {
          for (const item of orderWithDetails.items) {
            for (let i = 0; i < item.quantity; i++) {
              const ticketCode = generateTicketCode();

              const newAttendee = await createAttendee({
                orderId: order.id,
                orderItemId: item.id,
                eventId: order.eventId,
                ticketTypeId: item.ticketTypeId,
                ticketCode,
                firstName: order.customerName.split(" ")[0] || "Guest",
                lastName:
                  order.customerName.split(" ").slice(1).join(" ") || "",
                email: order.customerEmail,
                phoneNumber: order.customerPhone,
              });

              // Generate and store QR data
              const qrData = generateQRData({
                ticketCode,
                attendeeId: newAttendee.id,
                eventId: order.eventId,
              });

              await updateAttendeeQRCode(newAttendee.id, qrData);
            }
          }
        }
      } else {
        // Attendees already exist (created at payment init time).
        // Check if any are missing QR data and backfill if needed.
        for (const attendee of existingAttendees) {
          if (!attendee.qrCodeUrl) {
            const qrData = generateQRData({
              ticketCode: attendee.ticketCode,
              attendeeId: attendee.id,
              eventId: order.eventId,
            });
            await updateAttendeeQRCode(attendee.id, qrData);
          }
        }
      }

      // Mark webhook as fully processed
      await db
        .update(webhookLogs)
        .set({
          status: "processed",
          processedAt: new Date(),
          isProcessed: true,
        })
        .where(eq(webhookLogs.id, webhookLog[0].id));

      // TODO: Send confirmation email with tickets

      return NextResponse.json({ message: "Webhook processed successfully" });
    }

    // Handle failed charge
    if (event === "charge.failed") {
      const reference = webhookData.reference;
      const transaction = await getTransactionByReference(reference);

      if (transaction) {
        await updateTransaction(transaction.id, {
          status: "failed",
          failureReason: webhookData.gateway_response || "Payment failed",
          webhookReceived: true,
          webhookReceivedAt: new Date(),
        });

        const order = await getOrderById(transaction.orderId);
        if (order) {
          await updateOrderStatus(order.id, "failed");
        }
      }

      await db
        .update(webhookLogs)
        .set({ status: "processed", processedAt: new Date(), isProcessed: true })
        .where(eq(webhookLogs.id, webhookLog[0].id));
    }

    // Ignore all other event types
    await db
      .update(webhookLogs)
      .set({ status: "ignored", processedAt: new Date() })
      .where(eq(webhookLogs.id, webhookLog[0].id));

    return NextResponse.json({ message: "Webhook received" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}