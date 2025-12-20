import { z } from "zod";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { events } from "@/lib/db/schema";

export type Event = InferSelectModel<typeof events>;
export type NewEvent = InferInsertModel<typeof events>;

export interface EventWithStats extends Event {
  totalTicketsSold: number;
  totalRevenue: number;
  totalOrders: number;
}

export const eventSchema = z.object({
  id: z.uuid(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  organizerId: z.uuid(),
  venue: z.string().min(2, "Venue is required"),
  location: z.string().min(2, "Location is required"),
  eventDate: z.date(),
  eventEndDate: z.date().optional().nullable(),
  bannerImageUrl: z.url().optional().nullable(),
  thumbnailImageUrl: z.url().optional().nullable(),
  isPublished: z.boolean().default(false),
  isCancelled: z.boolean().default(false),
  totalCapacity: z.number().int().positive().optional().nullable(),
  category: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createEventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000),
  category: z.string().nonempty("Please select a category"),
  tags: z.array(z.string()).default([]).optional(),

  venue: z.string().min(2, "Venue is required"),
  location: z.string().min(2, "Location is required"),
  eventDate: z.string().nonempty("Start date is required"),
  eventEndDate: z.string().optional(),
  totalCapacity: z.string().optional(),

 ticketTypes: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Ticket name is required"),
        description: z.string().optional(),
        price: z.string().min(1, "Price is required"),
        quantity: z.string().min(1, "Quantity is required"),
        minPurchase: z.string().min(1),
        maxPurchase: z.string().min(1),
        saleStartDate: z.string().nullable().optional(),
        saleEndDate: z.string().nullable().optional(),
      })
    )
    .min(1, "You must have at least one ticket type"),

  bannerImageUrl: z.url("Please enter a valid image URL").optional().or(z.literal("")),
  thumbnailImageUrl: z.url("Please enter a valid image URL").optional().or(z.literal("")),

  isPublished: z.boolean(),
});

export type CreateEventFormValues = z.infer<typeof createEventFormSchema>;

export const updateEventFormSchema = createEventFormSchema.partial();

export type UpdateEventForm = z.infer<typeof updateEventFormSchema>;

// Event Filter Types
export interface EventFilters {
  category?: string;
  search?: string;
  status?: "published" | "draft" | "cancelled";
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}
