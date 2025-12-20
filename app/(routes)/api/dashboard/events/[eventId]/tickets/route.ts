import { NextRequest, NextResponse } from "next/server";
import {
  getTicketTypesByEvent,
  createTicketType,
} from "@/lib/queries/ticketTypes.queries";
import { getEventById } from "@/lib/queries/events.queries";
import { createTicketTypeSchema } from "@/lib/types/ticketTypes.types";
import { getCurrentUserId } from "@/lib/auth";
import { validatePrice, validateQuantity } from "@/lib/validations";

interface RouteContext {
  params: Promise<{ eventId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { eventId } = await params;

    const user = await getCurrentUserId();
    const event = await getEventById(eventId);

    if (event.organizerId !== user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    const tickets = await getTicketTypesByEvent(eventId);

    return NextResponse.json(
      {
        success: true,
        count: tickets.length,
        data: tickets.map((t) => ({
          ...t,
          remaining: t.quantity - t.quantitySold,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /tickets] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const {eventId} = await params;
    const user = await getCurrentUserId();
    if (!user)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );

    const body = await request.json();

    const validation = createTicketTypeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Validate price
    const priceCheck = validatePrice(data.price);
    if (!priceCheck.valid) {
      return NextResponse.json(
        { success: false, error: priceCheck.error },
        { status: 400 }
      );
    }

    const qtyCheck = validateQuantity(data.quantity, 50000); // allow up to 50k
    if (!qtyCheck.valid) {
      return NextResponse.json(
        { success: false, error: qtyCheck.error },
        { status: 400 }
      );
    }

    const event = await getEventById(eventId);
    if (!event)
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    if (event.organizerId !== user)
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );

    if (event.totalCapacity) {
      const currentTickets = await getTicketTypesByEvent(eventId);
      const totalAllocated =
        currentTickets.reduce((sum, t) => sum + t.quantity, 0) + data.quantity;

      if (totalAllocated > event.totalCapacity) {
        return NextResponse.json(
          {
            success: false,
            error: `Total tickets exceed event capacity (${event.totalCapacity})`,
          },
          { status: 400 }
        );
      }
    }

    const ticket = await createTicketType({
      ...data,
      eventId: event.id,
      quantitySold: 0,
      saleStartDate: data.saleStartDate ?? undefined,
      saleEndDate: data.saleEndDate ?? undefined,
    });

    return NextResponse.json(
      { success: true, message: "Ticket type created", data: ticket },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /tickets] Error:", error);
    if (error?.code === "23505") {
      return NextResponse.json(
        { success: false, error: "Ticket name already exists for this event" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
