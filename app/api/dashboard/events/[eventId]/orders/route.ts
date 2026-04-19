import { NextRequest, NextResponse } from "next/server";
import { getOrdersByEvent }          from "@/lib/queries/order.queries";
import { getEventById }              from "@/lib/queries/events.queries";
import { getCurrentUserIdOrNull }    from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const userId = await getCurrentUserIdOrNull();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const event = await getEventById(params.eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    if (event.organizerId !== userId) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const orders = await getOrdersByEvent(params.eventId);

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}