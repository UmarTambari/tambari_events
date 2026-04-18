import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  countPaidOrdersForEvent,
  deleteEvent,
  getEventById,
  updateEvent,
} from "@/lib/queries/events.queries";
import { sumQuantitySoldForEvent } from "@/lib/queries/ticketTypes.queries";
import { getCurrentUserId } from "@/lib/auth";
import { apiErrorResponse } from "@/lib/error";
import { generateUniqueSlugForEvent } from "@/lib/utils/generateUniqueSlug";

interface RouteContext {
  params: Promise<{ eventId: string }>;
}

const patchEventBodySchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  venue: z.string().min(2),
  location: z.string().min(2),
  category: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  eventDate: z.coerce.date(),
  eventEndDate: z.union([z.coerce.date(), z.null()]).optional(),
  totalCapacity: z.number().int().positive().nullable().optional(),
  bannerImageUrl: z.union([z.url(), z.null()]).optional(),
  thumbnailImageUrl: z.union([z.url(), z.null()]).optional(),
  isPublished: z.boolean(),
});

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { eventId } = await params;
    const organizerId = await getCurrentUserId();
    const existing = await getEventById(eventId);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    if (existing.organizerId !== organizerId) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const json = await request.json();
    const parsed = patchEventBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const body = parsed.data;

    if (
      body.totalCapacity != null &&
      body.totalCapacity <
        (await sumQuantitySoldForEvent(eventId))
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Total capacity cannot be less than tickets already sold for this event.",
        },
        { status: 400 }
      );
    }

    let slug = existing.slug;
    if (body.title.trim() !== existing.title.trim()) {
      slug = await generateUniqueSlugForEvent(body.title, eventId);
    }

    const tags =
      body.tags && body.tags.length > 0 ? body.tags : null;

    const updated = await updateEvent(eventId, {
      title: body.title.trim(),
      description: body.description.trim(),
      slug,
      venue: body.venue.trim(),
      location: body.location.trim(),
      eventDate: body.eventDate,
      eventEndDate: body.eventEndDate ?? null,
      totalCapacity: body.totalCapacity ?? null,
      category: body.category?.trim() || null,
      tags,
      bannerImageUrl: body.bannerImageUrl ?? null,
      thumbnailImageUrl: body.thumbnailImageUrl ?? null,
      isPublished: body.isPublished,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Failed to update event" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Event updated",
      data: updated,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "23505"
    ) {
      return NextResponse.json(
        { success: false, error: "Could not save: slug conflict." },
        { status: 409 }
      );
    }
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { eventId } = await params;

    const userId = await getCurrentUserId();
    const event = await getEventById(eventId);

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

    const paidOrders = await countPaidOrdersForEvent(eventId);
    if (paidOrders > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot delete an event that has completed sales. Cancel the event or contact support.",
        },
        { status: 409 }
      );
    }

    await deleteEvent(eventId);

    return NextResponse.json(
      { success: true, message: "Event deleted" },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    return apiErrorResponse(error);
  }
}
