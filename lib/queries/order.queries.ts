import { db } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import {
  events,
  orders,
  orderItems,
  attendees,
  transactions,
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

// Get order with all related data
export async function getOrderWithDetails(orderId: string) {
  const order = await getOrderById(orderId);
  if (!order) return null;

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  const attendeesList = await db
    .select()
    .from(attendees)
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
    event,
  };
}

export async function createOrder(data: {
  orderNumber: string;
  userId: string;
  eventId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
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
    })
    .from(orders)
    .innerJoin(events, eq(orders.eventId, events.id))
    .where(eq(events.organizerId, organizerId))
    .orderBy(desc(orders.createdAt));
}
