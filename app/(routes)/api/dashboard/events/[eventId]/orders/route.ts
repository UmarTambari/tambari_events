import { NextRequest, NextResponse } from "next/server";
import { getOrdersByEvent } from "@/lib/queries/order.queries";
import { getCurrentUserId } from "@/lib/auth";
import { getEventById } from "@/lib/queries/events.queries";

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const userId = await getCurrentUserId();

    const event = await getEventById(params.eventId);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.organizerId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const orders = await getOrdersByEvent(params.eventId);

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
