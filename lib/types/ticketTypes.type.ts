import { z } from "zod";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { ticketTypes } from "@/lib/db/schema";

export type TicketType = InferSelectModel<typeof ticketTypes>;
export type NewTicketType = InferInsertModel<typeof ticketTypes>;

export const ticketTypeSchema = z.object({
  id: z.uuid(),
  eventId: z.uuid(),
  name: z.string().min(1, "Ticket name is required"),
  description: z.string().optional().nullable(),
  price: z.number().int().min(0, "Price must be at least 0"),
  quantity: z.number().int().positive("Quantity must be positive"),
  quantitySold: z.number().int().min(0).default(0),
  saleStartDate: z.date().optional().nullable(),
  saleEndDate: z.date().optional().nullable(),
  minPurchase: z.number().int().positive().default(1),
  maxPurchase: z.number().int().positive().default(10),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// TicketType Creation/Update Schemas
export const createTicketTypeSchema = z.object({
  name: z.string().min(1, "Ticket name is required").max(100),
  description: z.string().max(500).optional(),
  price: z
    .number()
    .int()
    .min(0, "Price cannot be negative")
    .max(100000000, "Price is too high"),
  quantity: z
    .number()
    .int()
    .positive("Quantity must be at least 1")
    .max(100000, "Quantity is too high"),
  saleStartDate: z.date().optional().nullable(),
  saleEndDate: z.date().optional().nullable(),
  minPurchase: z.number().int().positive().min(1).default(1),
  maxPurchase: z.number().int().positive().max(100).default(10),
  isActive: z.boolean().default(true),
});

export type CreateTicketType = z.infer<typeof createTicketTypeSchema>;

export const updateTicketTypeSchema = createTicketTypeSchema.partial();

export type UpdateTicketType = z.infer<typeof updateTicketTypeSchema>;

export type CreateTicketTypeFormValues = z.infer<typeof createTicketTypeSchema>;
export type UpdateTicketTypeFormValues = z.infer<typeof updateTicketTypeSchema>;

export interface TicketCartItem {
  ticketTypeId: string;
  ticketTypeName: string;
  pricePerTicket: number;
  quantity: number;
  subtotal: number;
  maxPurchase: number;
  remainingQuantity: number;
}

export interface TicketTypeWithSales extends TicketType {
  soldPercentage: number;
  remainingQuantity: number;
  isAlmostSoldOut: boolean;
  isSoldOut: boolean;
}
