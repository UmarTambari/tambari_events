/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import {
  getEventsByOrganizer,
  createEvent,
} from "@/lib/queries/events.queries";
import { createTicketType }       from "@/lib/queries/ticketTypes.queries";
import { generateUniqueSlug }     from "@/lib/utils/generateUniqueSlug";
import { getCurrentUserIdOrNull } from "@/lib/auth";
import { apiErrorResponse }       from "@/lib/error";

export async function GET() {
  try {
    const organizerId = await getCurrentUserIdOrNull();

    if (!organizerId) {
      return apiErrorResponse("Unauthorized", 401);
    }

    const events = await getEventsByOrganizer(organizerId);

    return NextResponse.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error: unknown) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const organizerId = await getCurrentUserIdOrNull();

    if (!organizerId) {
      return apiErrorResponse("Unauthorized", 401);
    }

    const body = await request.json();

    const {
      title,
      description,
      venue,
      location,
      category,
      tags = [],
      eventDate,
      eventEndDate,
      totalCapacity,
      bannerImageUrl,
      thumbnailImageUrl,
      isPublished = false,
      ticketTypes = [],
    } = body;

    const slug = await generateUniqueSlug(title);

    const eventData = {
      title,
      description,
      slug,
      organizerId,
      venue,
      location,
      eventDate: new Date(eventDate),
      eventEndDate: eventEndDate ? new Date(eventEndDate) : null,
      totalCapacity: totalCapacity ? Number(totalCapacity) : null,
      category: category || null,
      tags: tags.length > 0 ? tags : null,
      bannerImageUrl: bannerImageUrl || null,
      thumbnailImageUrl: thumbnailImageUrl || null,
      isPublished,
    };

    const newEvent = await createEvent(eventData);

    if (Array.isArray(ticketTypes) && ticketTypes.length > 0) {
      for (const ticket of ticketTypes) {
        const priceInKobo = Math.round(parseFloat(ticket.price) * 100);
        const quantity = parseInt(ticket.quantity, 10);
        const minPurchase = parseInt(ticket.minPurchase, 10) || 1;
        const maxPurchase = parseInt(ticket.maxPurchase, 10) || 10;

        if (!ticket.name || !ticket.price || !ticket.quantity) {
          console.warn("Skipping invalid ticket type:", ticket);
          continue;
        }

        await createTicketType({
          eventId: newEvent.id,
          name: ticket.name.trim(),
          description: ticket.description?.trim() || null,
          price: priceInKobo,
          quantity,
          quantitySold: 0,
          minPurchase,
          maxPurchase,
          saleStartDate: ticket.saleStartDate
            ? new Date(ticket.saleStartDate)
            : undefined,
          saleEndDate: ticket.saleEndDate
            ? new Date(ticket.saleEndDate)
            : undefined,
          isActive: true,
        });
      }
    }

    console.log("EVENT + TICKETS CREATED SUCCESSFULLY");
    console.log("Title:", newEvent.title);
    console.log("Published:", newEvent.isPublished);
    console.log("Tickets Types Created:", ticketTypes.length);
    console.log("Full Event Object:", newEvent);

    return NextResponse.json(
      {
        success: true,
        message: isPublished ? "Event published!" : "Event saved as draft",
        data: newEvent,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("FAILED TO CREATE EVENT WITH TICKETS:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as any).code === "23505" &&
      "constraint" in error &&
      String((error as any).constraint).includes("slug")
    ) {
      return apiErrorResponse("An event with this title already exists.", 409);
    }

    return apiErrorResponse(error, 500);
  }
}