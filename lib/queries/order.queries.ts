import { db } from "@/lib/db";
import { eq, desc, sql } from "drizzle-orm";
import {
  events,
  orders,
  orderItems,
  attendees,
  transactions,
  ticketTypes,
} from "@/lib/db/schema";
import { getEventById } from "./events.queries";

export async function getOrdersByUser(userId: string) {
  return await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrdersByEvent(eventId: string) {
  return await db
    .select()
    .from(orders)
    .where(eq(orders.eventId, eventId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrderById(orderId: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  return order;
}

export async function getOrderByNumber(orderNumber: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber));
  return order;
}

// Get order with all related data - Supports BOTH dashboard and public pages
export async function getOrderWithDetails(orderId: string) {
  const order = await getOrderById(orderId);
  if (!order) return null;

  const items = await db
    .select({
      id: orderItems.id,
      ticketTypeId: orderItems.ticketTypeId,        // needed for attendee creation
      ticketTypeName: ticketTypes.name,
      pricePerTicket: orderItems.pricePerTicket,
      quantity: orderItems.quantity,
      subtotal: orderItems.subtotal,
    })
    .from(orderItems)
    .innerJoin(ticketTypes, eq(orderItems.ticketTypeId, ticketTypes.id))
    .where(eq(orderItems.orderId, orderId));

  const attendeesList = await db
    .select({
      id: attendees.id,
      firstName: attendees.firstName,
      lastName: attendees.lastName,
      email: attendees.email,
      ticketCode: attendees.ticketCode,
      isCheckedIn: attendees.isCheckedIn,
      checkedInAt: attendees.checkedInAt,
      ticketTypeName: ticketTypes.name,
      qrCodeUrl: attendees.qrCodeUrl,               // ← Added for public page
    })
    .from(attendees)
    .innerJoin(ticketTypes, eq(attendees.ticketTypeId, ticketTypes.id))
    .where(eq(attendees.orderId, orderId));

  const [transaction] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.orderId, orderId));

  const event = await getEventById(order.eventId);

  return {
    ...order,
    items,
    attendees: attendeesList,
    transaction,
    
    // === Flattened fields (for Dashboard OrderDetailClient) ===
    eventTitle: event?.title ?? "",
    eventSlug: event?.slug ?? "",
    eventDate: event?.eventDate ?? new Date(),
    eventVenue: event?.venue ?? "",
    eventLocation: event?.location ?? "",
    customerPhone: order.customerPhone ?? "",
    notes: order.notes ?? null,
    paidAt: order.paidAt ?? null,

    // === Nested event object (for Public Order Confirmation Page) ===
    event: event
      ? {
          title: event.title,
          slug: event.slug,
          eventDate: event.eventDate,
          venue: event.venue,
          location: event.location,
          thumbnailImageUrl: event.thumbnailImageUrl,
          // add any other fields the public page might need later
        }
      : null,
  };
}

export async function createOrder(data: {
  orderNumber: string;
  userId: string;
  eventId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subtotal: number;
  serviceFee: number;
  totalAmount: number;
  status?:
    | "pending"
    | "processing"
    | "paid"
    | "failed"
    | "cancelled"
    | "refunded";
  notes?: string;
}) {
  const [order] = await db.insert(orders).values(data).returning();
  return order;
}

export async function updateOrderStatus(
  orderId: string,
  status:
    | "pending"
    | "processing"
    | "paid"
    | "failed"
    | "cancelled"
    | "refunded",
  additionalData?: {
    paidAt?: Date;
    cancelledAt?: Date;
  }
) {
  const [order] = await db
    .update(orders)
    .set({
      status,
      ...additionalData,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId))
    .returning();
  return order;
}

// Get orders by organizer (all orders for organizer's events)
export async function getOrdersByOrganizer(organizerId: string) {
  return await db
    .select({
      order: orders,
      event: events,
      ticketCount: sql<number>`(
        SELECT COALESCE(SUM(${orderItems.quantity}), 0)::int
        FROM ${orderItems}
        WHERE ${orderItems.orderId} = ${orders.id}
      )`.mapWith(Number),
    })
    .from(orders)
    .innerJoin(events, eq(orders.eventId, events.id))
    .where(eq(events.organizerId, organizerId))
    .orderBy(desc(orders.createdAt));
}
