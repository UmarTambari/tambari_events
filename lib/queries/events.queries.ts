import { db } from "@/lib/db";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { events, ticketTypes, orders } from "@/lib/db/schema";

export async function getEventsByOrganizer(organizerId: string) {
  return await db
    .select()
    .from(events)
    .where(eq(events.organizerId, organizerId))
    .orderBy(desc(events.createdAt));
}

export async function getEventBySlug(slug: string) {
  const [event] = await db.select().from(events).where(eq(events.slug, slug));
  return event;
}

export async function getEventById(eventId: string) {
  const [event] = await db.select().from(events).where(eq(events.id, eventId));
  return event;
}

export async function createEvent(data: {
  title: string;
  description: string;
  slug: string;
  organizerId: string;
  venue: string;
  location: string;
  eventDate: Date;
  eventEndDate?: Date | null;
  bannerImageUrl?: string | null;
  thumbnailImageUrl?: string | null;
  totalCapacity?: number | null;
  category?: string | null;
  tags?: string[] | null;
  isPublished?: boolean;
}) {
  const [event] = await db
    .insert(events)
    .values({
      ...data,
      isPublished: data.isPublished ?? false,
    })
    .returning();

  return event!;
}
export async function updateEvent(
  eventId: string,
  data: Partial<{
    title: string;
    description: string;
    slug: string;
    venue: string;
    location: string;
    eventDate: Date;
    eventEndDate: Date | null;
    bannerImageUrl: string | null;
    thumbnailImageUrl: string | null;
    totalCapacity: number | null;
    category: string;
    tags: string[];
    isPublished: boolean;
    isCancelled: boolean;
  }>
) {
  const [event] = await db
    .update(events)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(events.id, eventId))
    .returning();
  return event;
}

export async function deleteEvent(eventId: string) {
  await db.delete(events).where(eq(events.id, eventId));
}

// Get event with statistics
export async function getEventWithStats(eventId: string) {
  const event = await getEventById(eventId);
  if (!event) return null;

  // Get ticket sales stats
  const [ticketStats] = await db
    .select({
      totalTicketsSold: sql<number>`COALESCE(SUM(${ticketTypes.quantitySold}), 0)`,
      totalRevenue: sql<number>`COALESCE(SUM(${ticketTypes.quantitySold} * ${ticketTypes.price}), 0)`,
    })
    .from(ticketTypes)
    .where(eq(ticketTypes.eventId, eventId));

  // Get order count
  const [orderStats] = await db
    .select({ totalOrders: count() })
    .from(orders)
    .where(and(eq(orders.eventId, eventId), eq(orders.status, "paid")));

  return {
    ...event,
    totalTicketsSold: Number(ticketStats?.totalTicketsSold || 0),
    totalRevenue: Number(ticketStats?.totalRevenue || 0),
    totalOrders: orderStats?.totalOrders || 0,
  };
}

// Get published events (for public listing)
export async function getPublishedEvents(filters?: {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const conditions = [
    eq(events.isPublished, true),
    eq(events.isCancelled, false),
  ];

  if (filters?.category) {
    conditions.push(eq(events.category, filters.category));
  }

  let query: any = db
    .select()
    .from(events)
    .where(and(...conditions));

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.offset(filters.offset);
  }

  query = query.orderBy(desc(events.eventDate));

  return await query;
}
