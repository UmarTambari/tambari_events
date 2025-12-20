import { z } from "zod";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { orderItems } from "@/lib/db/schema";

export type OrderItem = InferSelectModel<typeof orderItems>;
export type NewOrderItem = InferInsertModel<typeof orderItems>;

export const orderItemSchema = z.object({
  id: z.uuid(),
  orderId: z.uuid(),
  ticketTypeId: z.uuid(),
  ticketTypeName: z.string(),
  pricePerTicket: z.number().int().min(0),
  quantity: z.number().int().positive(),
  subtotal: z.number().int().min(0),
  createdAt: z.date(),
});
