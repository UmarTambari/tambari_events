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
  getOrderWithDetails,
  updateOrderStatus,
} from "@/lib/queries/order.queries";
import {
  createAttendee,
  getAttendeesByOrder,
  updateAttendeeQRCode,
} from "@/lib/queries/attendee.queries";
import { incrementTicketSold } from "@/lib/queries/ticketTypes.queries";
import { generateQRData } from "@/lib/utils/generateQRdata";
import { generateTicketCode } from "@/lib/utils/generateReference";

/**
 * Verify Paystack webhook signature.
 *
 * Paystack signs the raw request body using HMAC SHA512.
 * timingSafeEqual prevents timing-based comparison attacks.
 */
function verifySignature(payload: string, signature: string): boolean {
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(payload)
    .digest("hex");

  const hashBuffer = Buffer.from(hash, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");

  if (hashBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(hashBuffer, signatureBuffer);
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-paystack-signature");
    const body = await request.text();

    // Parse the body once.
    let data: any;

    try {
      data = JSON.parse(body);
    } catch {
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    /**
     * Log the incoming webhook immediately.
     */
    const webhookLog = await db
      .insert(webhookLogs)
      .values({
        event: "webhook_received",
        payload: data,
        headers: Object.fromEntries(request.headers.entries()),
        signature: signature || "",
        isSignatureValid: false,
      })
      .returning();

    /**
     * Verify the Paystack signature before processing the webhook.
     */
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

    /**
     * Signature is valid.
     */
    await db
      .update(webhookLogs)
      .set({
        isSignatureValid: true,
      })
      .where(eq(webhookLogs.id, webhookLog[0].id));

    const event = data.event;
    const webhookData = data.data;

    await db
      .update(webhookLogs)
      .set({
        event,
        reference: webhookData?.reference,
        status: "processing",
      })
      .where(eq(webhookLogs.id, webhookLog[0].id));

    /**
     * Handle successful payment.
     */
    if (event === "charge.success") {
      const reference = webhookData.reference;

      const transaction = await getTransactionByReference(reference);

      if (!transaction) {
        await db
          .update(webhookLogs)
          .set({
            status: "failed",
            errorMessage: "Transaction not found",
          })
          .where(eq(webhookLogs.id, webhookLog[0].id));

        return NextResponse.json(
          { error: "Transaction not found" },
          { status: 404 }
        );
      }

      /**
       * Idempotency check.
       *
       * If this transaction has already been successfully processed,
       * don't create attendees or increment ticket inventory again.
       */
      if (transaction.status === "success" && transaction.isVerified) {
        await db
          .update(webhookLogs)
          .set({
            status: "ignored",
            errorMessage: "Already processed",
            processedAt: new Date(),
          })
          .where(eq(webhookLogs.id, webhookLog[0].id));

        return NextResponse.json({
          message: "Already processed",
        });
      }

      const order = await getOrderById(transaction.orderId);

      if (!order) {
        await db
          .update(webhookLogs)
          .set({
            status: "failed",
            errorMessage: "Order not found",
          })
          .where(eq(webhookLogs.id, webhookLog[0].id));

        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      /**
       * Verify that the amount sent by Paystack matches
       * the amount stored on our order.
       */
      if (webhookData.amount !== order.totalAmount) {
        await db
          .update(webhookLogs)
          .set({
            status: "failed",
            errorMessage: "Amount mismatch",
          })
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

      const paidAt = webhookData.paid_at
        ? new Date(webhookData.paid_at)
        : new Date();

      /**
       * Update transaction.
       */
      await updateTransaction(transaction.id, {
        status: "success",
        channel: webhookData.channel || null,
        cardType: webhookData.authorization?.card_type || null,
        bank: webhookData.authorization?.bank || null,
        lastFourDigits: webhookData.authorization?.last4 || null,
        paystackResponse: JSON.stringify(webhookData),
        gatewayResponse: webhookData.gateway_response || null,
        isVerified: true,
        verifiedAt: new Date(),
        webhookReceived: true,
        webhookReceivedAt: new Date(),
        paidAt,
      });

      /**
       * Mark order as paid.
       */
      await updateOrderStatus(order.id, "paid", {
        paidAt,
      });

      /**
       * Get all attendees already created during payment initialization.
       */
      const existingAttendees = await getAttendeesByOrder(order.id);

      /**
       * Get the order with its ticket items.
       */
      const orderWithDetails = await getOrderWithDetails(order.id);

      if (orderWithDetails) {
        /**
         * Normally attendees already exist because they are created
         * during payment initialization.
         *
         * This fallback handles cases where the webhook receives
         * a successful payment before attendee records exist.
         */
        if (existingAttendees.length === 0) {
          for (const item of orderWithDetails.items) {
            for (let i = 0; i < item.quantity; i++) {
              const ticketCode = generateTicketCode();

              const newAttendee = await createAttendee({
                orderId: order.id,
                orderItemId: item.id,
                eventId: order.eventId,
                ticketTypeId: item.ticketTypeId,
                ticketCode,
                firstName:
                  order.customerName.split(" ")[0] || "Guest",
                lastName:
                  order.customerName
                    .split(" ")
                    .slice(1)
                    .join(" ") || "",
                email: order.customerEmail,
                phoneNumber: order.customerPhone,
              });

              /**
               * Generate QR data only after successful payment.
               */
              const qrData = generateQRData({
                ticketCode,
                attendeeId: newAttendee.id,
                eventId: order.eventId,
              });

              await updateAttendeeQRCode(
                newAttendee.id,
                qrData
              );
            }
          }
        } else {
          /**
           * Attendees were created during payment initialization.
           * Generate their QR data now that payment is confirmed.
           */
          for (const attendee of existingAttendees) {
            if (!attendee.qrCodeData) {
              const qrData = generateQRData({
                ticketCode: attendee.ticketCode,
                attendeeId: attendee.id,
                eventId: order.eventId,
              });

              await updateAttendeeQRCode(
                attendee.id,
                qrData
              );
            }
          }
        }

        /**
         * IMPORTANT:
         * Ticket inventory is only reduced after successful payment.
         */
        for (const item of orderWithDetails.items) {
          await incrementTicketSold(
            item.ticketTypeId,
            item.quantity
          );
        }
      }

      /**
       * Mark webhook as fully processed.
       */
      await db
        .update(webhookLogs)
        .set({
          status: "processed",
          processedAt: new Date(),
          isProcessed: true,
        })
        .where(eq(webhookLogs.id, webhookLog[0].id));

      // TODO: Send confirmation email with tickets

      return NextResponse.json({
        message: "Webhook processed successfully",
      });
    }

    /**
     * Handle failed payment.
     */
    if (event === "charge.failed") {
      const reference = webhookData.reference;

      const transaction = await getTransactionByReference(reference);

      if (transaction) {
        await updateTransaction(transaction.id, {
          status: "failed",
          failureReason:
            webhookData.gateway_response || "Payment failed",
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
        .set({
          status: "processed",
          processedAt: new Date(),
          isProcessed: true,
        })
        .where(eq(webhookLogs.id, webhookLog[0].id));

      return NextResponse.json({
        message: "Payment failure processed",
      });
    }

    /**
     * Ignore all other event types.
     */
    await db
      .update(webhookLogs)
      .set({
        status: "ignored",
        processedAt: new Date(),
      })
      .where(eq(webhookLogs.id, webhookLog[0].id));

    return NextResponse.json({
      message: "Webhook received",
    });
  } catch (error) {
    console.error("Webhook error:", error);

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}