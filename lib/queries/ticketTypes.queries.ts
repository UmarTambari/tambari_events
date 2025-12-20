import { db } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { ticketTypes } from "@/lib/db/schema";

export async function getTicketTypesByEvent(eventId: string) {
  return await db
    .select()
    .from(ticketTypes)
    .where(eq(ticketTypes.eventId, eventId))
    .orderBy(ticketTypes.price);
}

export async function getTicketTypeById(ticketTypeId: string) {
  const [ticket] = await db
    .select()
    .from(ticketTypes)
    .where(eq(ticketTypes.id, ticketTypeId));
  return ticket;
}

export async function createTicketType(data: {
  eventId: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  quantitySold?: number;
  saleStartDate?: Date;
  saleEndDate?: Date;
  minPurchase?: number;
  maxPurchase?: number;
  isActive?: boolean;
}) {
  const [ticket] = await db.insert(ticketTypes).values(data).returning();
  return ticket;
}

export async function updateTicketType(
  ticketTypeId: string,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    quantity: number;
    saleStartDate: Date;
    saleEndDate: Date;
    minPurchase: number;
    maxPurchase: number;
    isActive: boolean;
  }>
) {
  const [ticket] = await db
    .update(ticketTypes)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(ticketTypes.id, ticketTypeId))
    .returning();
  return ticket;
}

export async function incrementTicketSold(
  ticketTypeId: string,
  quantity: number
) {
  const [ticket] = await db
    .update(ticketTypes)
    .set({
      quantitySold: sql`${ticketTypes.quantitySold} + ${quantity}`,
      updatedAt: new Date(),
    })
    .where(eq(ticketTypes.id, ticketTypeId))
    .returning();
  return ticket;
}

export async function deleteTicketType(ticketTypeId: string) {
  await db.delete(ticketTypes).where(eq(ticketTypes.id, ticketTypeId));
}
