import { NextRequest, NextResponse } from "next/server";
import {
  getAttendeeByTicketCode,
  checkInAttendee,
} from "@/lib/queries/attendee.queries";
import { getCurrentUserIdOrNull } from "@/lib/auth";
import { getEventById }           from "@/lib/queries/events.queries";

// POST /api/checkin - Check in an attendee
export async function POST(request: NextRequest) {
  try {
    const organizerId = await getCurrentUserIdOrNull();

    if (!organizerId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ticketCode } = body;

    if (!ticketCode) {
      return NextResponse.json(
        { success: false, error: "Ticket code is required" },
        { status: 400 }
      );
    }

    const attendee = await getAttendeeByTicketCode(ticketCode);

    if (!attendee) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ticket code",
        },
        { status: 404 }
      );
    }

    if (attendee.isRevoked) {
      return NextResponse.json(
        {
          success: false,
          error: "This ticket has been revoked",
          details: attendee.revokedReason,
        },
        { status: 400 }
      );
    }

    if (attendee.isCheckedIn) {
      return NextResponse.json(
        {
          success: false,
          error: "This ticket has already been checked in",
          data: {
            checkedInAt: attendee.checkedInAt,
          },
        },
        { status: 400 }
      );
    }

    // Verify organizer owns this event
    const event = await getEventById(attendee.eventId);
    if (!event || event.organizerId !== organizerId) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Check in attendee
    const checkedInAttendee = await checkInAttendee(attendee.id, organizerId);

    return NextResponse.json({
      success: true,
      data: checkedInAttendee,
      message: "Check-in successful",
    });
  } catch (error) {
    console.error("Error checking in attendee:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check in attendee",
      },
      { status: 500 }
    );
  }
}
