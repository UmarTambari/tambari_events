import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

import {
  getOrderWithDetails,
  updateOrderStatus,
} from "@/lib/queries/order.queries";
import { getUserByAuthId } from "@/lib/queries/users.queries";
import { createTransaction } from "@/lib/queries/transactions.queries";
import { createAttendee, updateAttendeeQRCode } from "@/lib/queries/attendee.queries";
import { incrementTicketSold } from "@/lib/queries/ticketTypes.queries";
import { generateQRData } from "@/lib/utils/generateQRdata";

const attendeeSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.email(),
  phoneNumber: z.string().optional(),
});

const initializePaymentSchema = z.object({
  orderId: z.uuid(),
  attendees: z.array(attendeeSchema),
});

function generateTicketCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "TKT-";
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user: supabaseUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByAuthId(supabaseUser.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { orderId, attendees } = initializePaymentSchema.parse(body);

    const order = await getOrderWithDetails(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (order.status === "paid") {
      return NextResponse.json(
        { error: "Order already paid" },
        { status: 400 }
      );
    }

    const totalTickets = order.items.reduce(
      (sum: number, item: any) => sum + item.quantity,
      0
    );

    if (attendees.length !== totalTickets) {
      return NextResponse.json(
        { error: "Attendee count mismatch" },
        { status: 400 }
      );
    }

    await updateOrderStatus(orderId, "processing");

    const reference = `TXN-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()}`;

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          amount: order.totalAmount,
          reference,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.orderNumber}`,
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            userId: user.id,
            customerName: user.fullName,
          },
        }),
      }
    );

    if (!paystackResponse.ok) {
      const error = await paystackResponse.json();
      console.error("Paystack error:", error);
      throw new Error(error.message || "Payment initialization failed");
    }

    const paystackData = await paystackResponse.json();

    await createTransaction({
      reference,
      orderId: order.id,
      provider: "paystack",
      amount: order.totalAmount,
      currency: "NGN",
      email: user.email,
      paystackReference: paystackData.data.reference,
      accessCode: paystackData.data.access_code,
      authorizationUrl: paystackData.data.authorization_url,
    });

    // Create attendee records and generate QR data for each
    let attendeeIndex = 0;
    for (const item of order.items) {
      for (let i = 0; i < item.quantity; i++) {
        const attendeeInput = attendees[attendeeIndex];
        const ticketCode = generateTicketCode();

        // Step 1: Create the attendee to get the generated UUID
        const newAttendee = await createAttendee({
          orderId: order.id,
          orderItemId: item.id,
          eventId: order.eventId,
          ticketTypeId: item.ticketTypeId,
          ticketCode,
          firstName: attendeeInput.firstName,
          lastName: attendeeInput.lastName,
          email: attendeeInput.email,
          phoneNumber: attendeeInput.phoneNumber,
        });

        // Step 2: Generate QR data now that we have the attendee ID
        // This data string is what gets encoded into the QR code image on the frontend
        const qrData = generateQRData({
          ticketCode,
          attendeeId: newAttendee.id,
          eventId: order.eventId,
        });

        // Step 3: Store the QR data string back on the attendee record
        await updateAttendeeQRCode(newAttendee.id, qrData);

        attendeeIndex++;
      }

      await incrementTicketSold(item.ticketTypeId, item.quantity);
    }

    return NextResponse.json({
      success: true,
      reference,
      authorizationUrl: paystackData.data.authorization_url,
      accessCode: paystackData.data.access_code,
    });
  } catch (error) {
    console.error("Initialize payment error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}