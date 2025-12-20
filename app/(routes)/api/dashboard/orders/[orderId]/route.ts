import { NextRequest, NextResponse } from "next/server";
import { getOrderWithDetails } from "@/lib/queries/order.queries";
import { getEventById } from "@/lib/queries/events.queries";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = context.params;
    const organizerId = request.headers.get("x-user-id");

    if (!organizerId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const order = await getOrderWithDetails(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const event = await getEventById(order.eventId);
    if (!event || event.organizerId !== organizerId) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch order",
      },
      { status: 500 }
    );
  }
}
