// app/api/paystack/initialize/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, transactions, orderItems } from "@/lib/db/schema";
import { initializePayment } from "@/lib/paystack";
import {
  generateTransactionReference,
  generateOrderNumber,
} from "@/lib/utils/generateReference";
import { eq } from "drizzle-orm";

interface InitializePaymentRequest {
  userId: string;
  eventId: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  items: Array<{
    ticketTypeId: string;
    ticketTypeName: string;
    quantity: number;
    pricePerTicket: number; // In kobo
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: InitializePaymentRequest = await request.json();

    if (
      !body.userId ||
      !body.eventId ||
      !body.customerEmail ||
      !body.customerName ||
      !body.items?.length
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.customerEmail)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    const subtotal = body.items.reduce(
      (sum, item) => sum + item.pricePerTicket * item.quantity,
      0
    );

    const serviceFee = 0; // Math.round(subtotal * 0.05);
    const totalAmount = subtotal + serviceFee;

    if (totalAmount < 1000) {
      return NextResponse.json(
        { success: false, message: "Amount must be at least ₦10" },
        { status: 400 }
      );
    }

    const orderNumber = generateOrderNumber();
    const reference = generateTransactionReference();

    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        userId: body.userId,
        eventId: body.eventId,
        customerEmail: body.customerEmail,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        subtotal,
        serviceFee,
        totalAmount,
        status: "pending",
      })
      .returning();

    const orderItemsData = body.items.map((item) => ({
      orderId: order.id,
      ticketTypeId: item.ticketTypeId,
      ticketTypeName: item.ticketTypeName,
      pricePerTicket: item.pricePerTicket,
      quantity: item.quantity,
      subtotal: item.pricePerTicket * item.quantity,
    }));

    await db.insert(orderItems).values(orderItemsData);

    const [transaction] = await db
      .insert(transactions)
      .values({
        reference,
        orderId: order.id,
        amount: totalAmount,
        currency: "NGN",
        email: body.customerEmail,
        status: "pending",
        provider: "paystack",
      })
      .returning();

    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/paystack/callback?reference=${reference}`;

    const paystackResponse = await initializePayment({
      email: body.customerEmail,
      amount: totalAmount,
      reference,
      callback_url: callbackUrl,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: body.customerName,
        eventId: body.eventId,
        items: body.items.map((item) => ({
          ticketType: item.ticketTypeName,
          quantity: item.quantity,
        })),
      },
      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
    });

    await db
      .update(transactions)
      .set({
        accessCode: paystackResponse.data.access_code,
        authorizationUrl: paystackResponse.data.authorization_url,
      })
      .where(eq(transactions.id, transaction.id));

    return NextResponse.json({
      success: true,
      message: "Payment initialized successfully",
      data: {
        reference,
        orderNumber: order.orderNumber,
        orderId: order.id,
        amount: totalAmount,
        authorizationUrl: paystackResponse.data.authorization_url,
        accessCode: paystackResponse.data.access_code,
      },
    });
  } catch (error: any) {
    console.error("Initialize payment error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to initialize payment",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

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
        amount: transaction.amount,
        orderNumber: transaction.order.orderNumber,
      },
    });
  } catch (error: any) {
    console.error("Get transaction error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get transaction",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
