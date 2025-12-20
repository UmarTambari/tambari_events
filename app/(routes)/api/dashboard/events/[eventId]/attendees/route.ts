import { NextRequest, NextResponse } from "next/server";
import { getEventBySlug } from "@/lib/queries/events.queries";
import { getAttendeesByEvent } from "@/lib/queries/attendee.queries";

interface RouteContext {
  params: {
    slug: string;
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = context.params;
    const organizerId = request.headers.get("x-user-id");

    if (!organizerId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const event = await getEventBySlug(slug);

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    if (event.organizerId !== organizerId) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const attendees = await getAttendeesByEvent(event.id);

    // Calculate check-in stats
    const totalAttendees = attendees.length;
    const checkedIn = attendees.filter((a) => a.isCheckedIn).length;
    const notCheckedIn = totalAttendees - checkedIn;

    return NextResponse.json({
      success: true,
      data: attendees,
      stats: {
        total: totalAttendees,
        checkedIn,
        notCheckedIn,
      },
    });
  } catch (error) {
    console.error("Error fetching attendees:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch attendees",
      },
      { status: 500 }
    );
  }
}
