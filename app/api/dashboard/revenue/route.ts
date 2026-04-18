import { NextRequest, NextResponse } from "next/server";
import { getMonthlyRevenue } from "@/lib/queries/dashboard.queries";
import { getCurrentUserId } from "@/lib/auth";
import { apiErrorResponse } from "@/lib/error";

export async function GET(request: NextRequest) {
  try {
    const organizerId = await getCurrentUserId();

    if (!organizerId) {
      return apiErrorResponse("Unauthorized", 401);
    }

    // Get number of months from query params (default: 12)
    const { searchParams } = new URL(request.url);
    const monthsParam = searchParams.get("months");
    const months = monthsParam ? parseInt(monthsParam, 10) : 12;

    // Validate months parameter
    if (isNaN(months) || months < 1 || months > 24) {
      return apiErrorResponse("Invalid months parameter. Must be between 1 and 24.", 400);
    }

    const revenueData = await getMonthlyRevenue(organizerId, months);

    return NextResponse.json({
      success: true,
      data: revenueData,
    });
  } catch (error: unknown) {
    console.error("Error fetching revenue data:", error);
    
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      return apiErrorResponse("Unauthorized", 401);
    }
    
    return apiErrorResponse(error, 500);
  }
}