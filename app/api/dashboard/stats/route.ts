import { NextResponse } from "next/server";
import {
  getDashboardStats,
  getRevenueGrowth,
  getOrdersGrowth,
} from "@/lib/queries/dashboard.queries";
import { getCurrentUserId } from "@/lib/auth";
import { apiErrorResponse } from "@/lib/error";

export async function GET() {
  try {
    const organizerId = await getCurrentUserId();

    if (!organizerId) {
      return apiErrorResponse("Unauthorized", 401);
    }

    const [stats, revenueGrowth, ordersGrowth] = await Promise.all([
      getDashboardStats(organizerId),
      getRevenueGrowth(organizerId),
      getOrdersGrowth(organizerId),
    ]);

    const dashboardData = {
      ...stats,
      revenueGrowth,
      ordersGrowth,
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error: unknown) {
    console.error("Error fetching dashboard stats:", error);

    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      return apiErrorResponse("Unauthorized", 401);
    }

    return apiErrorResponse(error, 500);
  }
}
