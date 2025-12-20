import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { orderItems } from "@/lib/db/schema";

export async function createOrderItem(data: {
  orderId: string;
  ticketTypeId: string;
  ticketTypeName: string;
  pricePerTicket: number;
  quantity: number;
  subtotal: number;
}) {
  const [item] = await db.insert(orderItems).values(data).returning();
  return item;
}

export async function getOrderItemsByOrder(orderId: string) {
  return await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));
}
