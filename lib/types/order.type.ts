import { z } from "zod";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { orders } from "@/lib/db/schema";
import type { OrderItem } from "./orderItem.type";
import type { Attendee } from "./attendee.type";
import type { Transaction } from "./transaction.type";
import type { Event } from "./event.type";

export type Order = InferSelectModel<typeof orders>;
export type NewOrder = InferInsertModel<typeof orders>;
export type OrderStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

export const orderStatusSchema = z.enum([
  "pending",
  "processing",
  "paid",
  "failed",
  "cancelled",
  "refunded",
]);

export const orderSchema = z.object({
  id: z.uuid(),
  orderNumber: z.string().min(1),
  userId: z.uuid(),
  eventId: z.uuid(),
  customerName: z.string().min(2, "Customer name is required"),
  customerEmail: z.email("Invalid email address"),
  customerPhone: z.string(),
  subtotal: z.number().int().min(0),
  serviceFee: z.number().int().min(0),
  totalAmount: z.number().int().min(0),
  status: orderStatusSchema,
  notes: z.string().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  paidAt: z.date().optional().nullable(),
  cancelledAt: z.date().optional().nullable(),
});

export const createOrderSchema = z.object({
  eventId: z.uuid(),
  notes: z.string().max(1000).optional(),
  items: z
    .array(
      z.object({
        ticketTypeId: z.uuid(),
        quantity: z.number().int().positive().min(1).max(100),
        price: z.number().int().nonnegative(),
      })
    )
    .min(1, "At least one ticket type is required"),
});

export interface OrderWithDetails extends Order {
  items: OrderItem[];
  attendees: Attendee[];
  transaction?: Transaction | null;
  event?: Event | null;
}

export interface OrderFilters {
  status?: OrderStatus;
  eventId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  limit?: number;
  offset?: number;
}

export type CreateOrderFormData = z.infer<typeof createOrderSchema>;
