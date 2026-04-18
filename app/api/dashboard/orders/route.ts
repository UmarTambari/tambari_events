import { NextRequest, NextResponse } from "next/server";
import { getOrdersByOrganizer } from "@/lib/queries/order.queries";

export async function GET(request: NextRequest) {
  try {
    const organizerId = request.headers.get("x-user-id");

    if (!organizerId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const eventId = searchParams.get("eventId");

    const ordersData = await getOrdersByOrganizer(organizerId);

    // Extract orders from the joined data
    let orders = ordersData.map((item) => ({
      ...item.order,
      event: item.event,
    }));

    // Apply filters
    if (status) {
      orders = orders.filter((order) => order.status === status);
    }

    if (eventId) {
      orders = orders.filter((order) => order.eventId === eventId);
    }

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}
