import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { webhookLogs } from "@/lib/db/schema";
import { 
  getTransactionByReference, 
  updateTransaction 
} from "@/lib/queries/transactions.queries";
import { 
  getOrderById, 
  updateOrderStatus 
} from "@/lib/queries/order.queries";

// Verify Paystack signature
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
    
    // Log webhook
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

    // Verify signature
    if (!signature || !verifySignature(body, signature)) {
      console.error("Invalid webhook signature");
      await db
        .update(webhookLogs)
        .set({ 
          status: "failed",
          errorMessage: "Invalid signature" 
        })
        .where(eq(webhookLogs.id, webhookLog[0].id));
      
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Update webhook log
    await db
      .update(webhookLogs)
      .set({ isSignatureValid: true })
      .where(eq(webhookLogs.id, webhookLog[0].id));

    const data = JSON.parse(body);
    const event = data.event;
    const webhookData = data.data;

    // Update webhook log with event type
    await db
      .update(webhookLogs)
      .set({ 
        event,
        reference: webhookData.reference,
        status: "processing" 
      })
      .where(eq(webhookLogs.id, webhookLog[0].id));

    // Handle charge.success event
    if (event === "charge.success") {
      const reference = webhookData.reference;
      
      // Get transaction
      const transaction = await getTransactionByReference(reference);
      
      if (!transaction) {
        await db
          .update(webhookLogs)
          .set({ 
            status: "failed",
            errorMessage: "Transaction not found" 
          })
          .where(eq(webhookLogs.id, webhookLog[0].id));
        
        return NextResponse.json(
          { error: "Transaction not found" },
          { status: 404 }
        );
      }

      // Check if already processed
      if (transaction.status === "success" && transaction.isVerified) {
        await db
          .update(webhookLogs)
          .set({ 
            status: "ignored",
            errorMessage: "Already processed" 
          })
          .where(eq(webhookLogs.id, webhookLog[0].id));
        
        return NextResponse.json({ message: "Already processed" });
      }

      // Get order
      const order = await getOrderById(transaction.orderId);
      if (!order) {
        await db
          .update(webhookLogs)
          .set({ 
            status: "failed",
            errorMessage: "Order not found" 
          })
          .where(eq(webhookLogs.id, webhookLog[0].id));
        
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      // Verify amount matches
      if (webhookData.amount !== order.totalAmount) {
        await db
          .update(webhookLogs)
          .set({ 
            status: "failed",
            errorMessage: "Amount mismatch" 
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

      // Update transaction
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

      // Update order status
      await updateOrderStatus(order.id, "paid", {
        paidAt: new Date(webhookData.paid_at),
      });

      // Mark webhook as processed
      await db
        .update(webhookLogs)
        .set({ 
          status: "processed",
          processedAt: new Date(),
          isProcessed: true 
        })
        .where(eq(webhookLogs.id, webhookLog[0].id));

      // TODO: Generate QR codes for attendees
      // TODO: Send confirmation email with tickets

      return NextResponse.json({ 
        message: "Webhook processed successfully" 
      });
    }

    // Handle charge.failed event
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
        .set({ 
          status: "processed",
          processedAt: new Date(),
          isProcessed: true 
        })
        .where(eq(webhookLogs.id, webhookLog[0].id));
    }

    // Ignore other events
    await db
      .update(webhookLogs)
      .set({ 
        status: "ignored",
        processedAt: new Date() 
      })
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