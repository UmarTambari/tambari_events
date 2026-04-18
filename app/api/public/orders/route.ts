import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createOrder } from "@/lib/queries/order.queries";
import { createOrderItem } from "@/lib/queries/orderItems.queries";
import { getEventById } from "@/lib/queries/events.queries";
import { getTicketTypeById } from "@/lib/queries/ticketTypes.queries";
import { getUserByAuthId } from "@/lib/queries/users.queries";
import { createOrderSchema } from "@/lib/types/order.type";

export async function POST(request: NextRequest) {
  try {
    // Create Supabase server client with cookies
    const supabase = await createClient();

    // Get authenticated user from Supabase
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !supabaseUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user from database (using Supabase auth user id)
    const user = await getUserByAuthId(supabaseUser.id);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { eventId, items } = createOrderSchema.parse(body);

    // Verify event exists and is published
    const event = await getEventById(eventId);
    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }
    if (!event.isPublished || event.isCancelled) {
      return NextResponse.json(
        { error: "Event is not available for booking" },
        { status: 400 }
      );
    }

    // Validate ticket availability and prices
    const validatedItems = await Promise.all(
      items.map(async (item) => {
        const ticket = await getTicketTypeById(item.ticketTypeId);
       
        if (!ticket) {
          throw new Error(`Ticket type ${item.ticketTypeId} is not found`);
        }
        if (!ticket.isActive) {
          throw new Error(`Ticket type ${ticket.name} is not available`);
        }
        // Check availability
        const available = ticket.quantity - ticket.quantitySold;
        if (available < item.quantity) {
          throw new Error(`Not enough tickets available for ${ticket.name}`);
        }
        // Verify quantity constraints
        if (item.quantity < ticket.minPurchase) {
          throw new Error(`Minimum ${ticket.minPurchase} tickets required for ${ticket.name}`);
        }
        if (item.quantity > ticket.maxPurchase) {
          throw new Error(`Maximum ${ticket.maxPurchase} tickets allowed for ${ticket.name}`);
        }
        // Verify price matches
        if (item.price !== ticket.price) {
          throw new Error(`Price mismatch for ${ticket.name}`);
        }
        // Check sale dates
        const now = new Date();
        if (ticket.saleStartDate && new Date(ticket.saleStartDate) > now) {
          throw new Error(`Sales for ${ticket.name} haven't started yet`);
        }
        if (ticket.saleEndDate && new Date(ticket.saleEndDate) < now) {
          throw new Error(`Sales for ${ticket.name} have ended`);
        }
        return {
          ticketTypeId: ticket.id,
          ticketTypeName: ticket.name,
          pricePerTicket: ticket.price,
          quantity: item.quantity,
          subtotal: ticket.price * item.quantity,
        };
      })
    );

    // Calculate totals
    const subtotal = validatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const serviceFee = Math.round(subtotal * 0.025); // 2.5% service fee
    const totalAmount = subtotal + serviceFee;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create order
    const order = await createOrder({
      orderNumber,
      userId: user.id,
      eventId,
      customerName: user.fullName,
      customerEmail: user.email,
      customerPhone: user.phoneNumber,
      subtotal,
      serviceFee,
      totalAmount,
      status: "pending",
    });

    // Create order items
    await Promise.all(
      validatedItems.map((item) =>
        createOrderItem({
          orderId: order.id,
          ...item,
        })
      )
    );

    return NextResponse.json(
      {
        success: true,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}