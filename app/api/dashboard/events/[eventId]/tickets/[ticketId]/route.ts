import { NextRequest, NextResponse } from "next/server";
import {
  getTicketTypeById,
  updateTicketType,
  deleteTicketType,
} from "@/lib/queries/ticketTypes.queries";
import { getEventById } from "@/lib/queries/events.queries";
import { updateTicketTypeSchema } from "@/lib/types/ticketTypes.type";
import { getCurrentUserId } from "@/lib/auth";
import { validatePrice, validateQuantity } from "@/lib/validations";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; ticketId: string }> }
) {
  try {
    const { eventId, ticketId } = await params;
    const user = await getCurrentUserId();
    if (!user)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );

    const body = await request.json();

    //processed body with dates with dates support in string and objects
    const processedBody = {
      ...body,
      saleStartDate: body.saleStartDate ? new Date(body.saleStartDate) : null,
      saleEndDate: body.saleEndDate ? new Date(body.saleEndDate) : null,
    };

    const validation = updateTicketTypeSchema.safeParse(processedBody);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    

    // Fetch ticket + event
    const ticket = await getTicketTypeById(ticketId);
    if (!ticket)
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );

    const event = await getEventById(eventId);
    if (!event || event.id !== ticket.eventId)
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );

    if (event.organizerId !== user)
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );

    // BLOCK edits if tickets already sold
    if (ticket.quantitySold > 0) {
      const allowedFields = [
        "description",
        "isActive",
        "saleStartDate",
        "saleEndDate",
      ];
      const attemptedChanges = Object.keys(data);
      const hasDangerousChange = attemptedChanges.some(
        (key) => !allowedFields.includes(key)
      );

      if (hasDangerousChange) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Cannot modify price, quantity, or limits after sales have started",
          },
          { status: 400 }
        );
      }
    }

    // Validate price if being updated
    if (data.price !== undefined) {
      const priceCheck = validatePrice(data.price);
      if (!priceCheck.valid) {
        return NextResponse.json(
          { success: false, error: priceCheck.error },
          { status: 400 }
        );
      }
    }

    // Validate quantity if being updated
    if (data.quantity !== undefined) {
      const qtyCheck = validateQuantity(data.quantity);
      if (!qtyCheck.valid) {
        return NextResponse.json(
          { success: false, error: qtyCheck.error },
          { status: 400 }
        );
      }

      // Prevent reducing below sold
      if (data.quantity < ticket.quantitySold) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot reduce quantity below ${ticket.quantitySold} sold`,
          },
          { status: 400 }
        );
      }
    }

    const updated = await updateTicketType(ticketId, data);

    return NextResponse.json(
      { success: true, message: "Ticket updated", data: updated },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[PATCH /tickets] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update ticket" },
      { status: 500 }
    );
  }
}

// DELETE - Delete ticket type
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; ticketId: string }> }
) {
  try {
    const { eventId, ticketId } = await params;
    const user = await getCurrentUserId();
    if (!user)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );

    const ticket = await getTicketTypeById(ticketId);
    if (!ticket)
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );

    const event = await getEventById(eventId);
    if (!event || event.id !== ticket.eventId)
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );

    if (event.organizerId !== user)
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );

    // CRITICAL: Block deletion if any sold
    if (ticket.quantitySold > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete ticket type with existing sales",
        },
        { status: 400 }
      );
    }

    await deleteTicketType(ticketId);

    return NextResponse.json(
      { success: true, message: "Ticket type deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[DELETE /tickets] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete ticket" },
      { status: 500 }
    );
  }
}
