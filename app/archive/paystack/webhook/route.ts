import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { transactions, orders, webhookLogs, attendees } from "@/lib/db/schema";
import { verifyWebhookSignature, verifyPayment } from "@/lib/paystack";
import { generateTicketCode } from "@/lib/utils/generateReference";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      console.error("Missing webhook signature");
      return NextResponse.json(
        { success: false, message: "Missing signature" },
        { status: 400 }
      );
    }

    const isValid = verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      console.error("Invalid webhook signature");

      // Log suspicious webhook
      await db.insert(webhookLogs).values({
        event: "invalid_signature",
        payload: JSON.parse(rawBody),
        signature,
        isSignatureValid: false,
        status: "failed",
        errorMessage: "Invalid signature",
      });

      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 401 }
      );
    }

    const webhookData = JSON.parse(rawBody);
    const event = webhookData.event;
    const data = webhookData.data;

    console.log(`Received webhook: ${event}`);
    console.log(`Reference: ${data.reference}`);

    const [webhookLog] = await db
      .insert(webhookLogs)
      .values({
        event,
        payload: webhookData,
        headers: Object.fromEntries(request.headers),
        reference: data.reference,
        signature,
        isSignatureValid: true,
        status: "received",
      })
      .returning();

    // We only process charge.success for now
    if (event === "charge.success") {
      await handleChargeSuccess(data, webhookLog.id);
    } else {
      console.log(`Ignoring webhook event: ${event}`);

      await db
        .update(webhookLogs)
        .set({ status: "ignored" })
        .where(eq(webhookLogs.id, webhookLog.id));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);

    // Still return 200 to prevent retries
    // Log the error for manual review
    return NextResponse.json({ success: true });
  }
}

async function handleChargeSuccess(data: any, webhookLogId: string) {
  const reference = data.reference;

  try {
    const transaction = await db.query.transactions.findFirst({
      where: eq(transactions.reference, reference),
      with: {
        order: {
          with: {
            items: {
              with: {
                ticketType: true,
              },
            },
          },
        },
      },
    });

    if (!transaction) {
      console.error(`Transaction not found: ${reference}`);

      await db
        .update(webhookLogs)
        .set({
          status: "failed",
          errorMessage: "Transaction not found",
        })
        .where(eq(webhookLogs.id, webhookLogId));

      return;
    }

    if (transaction.webhookReceived && transaction.isVerified) {
      console.log(`Webhook already processed for: ${reference}`);

      await db
        .update(webhookLogs)
        .set({
          status: "ignored",
          errorMessage: "Already processed",
        })
        .where(eq(webhookLogs.id, webhookLogId));

      return;
    }

    const verification = await verifyPayment(reference);

    if (!verification.status || verification.data.status !== "success") {
      console.error(`Payment verification failed: ${reference}`);

      await db
        .update(webhookLogs)
        .set({
          status: "failed",
          errorMessage: "Payment verification failed",
        })
        .where(eq(webhookLogs.id, webhookLogId));

      return;
    }

    if (verification.data.amount !== transaction.amount) {
      console.error(
        `Amount mismatch! Expected: ${transaction.amount}, Got: ${verification.data.amount}`
      );

      await db
        .update(webhookLogs)
        .set({
          status: "failed",
          errorMessage: `Amount mismatch: expected ${transaction.amount}, got ${verification.data.amount}`,
        })
        .where(eq(webhookLogs.id, webhookLogId));

      return;
    }

    await db
      .update(transactions)
      .set({
        status: "success",
        isVerified: true,
        verifiedAt: new Date(),
        webhookReceived: true,
        webhookReceivedAt: new Date(),
        paidAt: new Date(verification.data.paid_at),
        paystackResponse: verification.data,
        channel: verification.data.channel,
        cardType: verification.data.authorization.card_type,
        bank: verification.data.authorization.bank,
        lastFourDigits: verification.data.authorization.last4,
        gatewayResponse: verification.data.gateway_response,
      })
      .where(eq(transactions.id, transaction.id));

    await db
      .update(orders)
      .set({
        status: "paid",
        paidAt: new Date(),
      })
      .where(eq(orders.id, transaction.orderId));

    const attendeesData = [];

    for (const item of transaction.order.items) {
      // Create one attendee record for each ticket quantity
      for (let i = 0; i < item.quantity; i++) {
        attendeesData.push({
          orderId: transaction.order.id,
          orderItemId: item.id,
          eventId: transaction.order.eventId,
          ticketTypeId: item.ticketTypeId,
          ticketCode: generateTicketCode(),
          firstName: transaction.order.customerName.split(" ")[0] || "Guest",
          lastName:
            transaction.order.customerName.split(" ").slice(1).join(" ") || "",
          email: transaction.order.customerEmail,
          phoneNumber: transaction.order.customerPhone,
        });
      }
    }

    if (attendeesData.length > 0) {
      await db.insert(attendees).values(attendeesData);
    }

    await db
      .update(webhookLogs)
      .set({
        status: "processed",
        processedAt: new Date(),
        isProcessed: true,
      })
      .where(eq(webhookLogs.id, webhookLogId));

    // ============================================
    // 9. SEND CONFIRMATION EMAIL (TODO)
    // ============================================
    // TODO: Implement email sending
    // await sendTicketConfirmationEmail({
    //   email: transaction.order.customerEmail,
    //   orderNumber: transaction.order.orderNumber,
    //   tickets: attendeesData,
    // });

    console.log(`✅ Payment processed successfully: ${reference}`);
  } catch (error: any) {
    console.error(`Error processing charge.success webhook:`, error);

    // Update webhook log with error
    await db
      .update(webhookLogs)
      .set({
        status: "failed",
        errorMessage: error.message,
      })
      .where(eq(webhookLogs.id, webhookLogId));

    throw error;
  }
}
