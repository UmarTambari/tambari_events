import { z } from "zod";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { attendees } from "@/lib/db/schema";

export type Attendee = InferSelectModel<typeof attendees>;
export type NewAttendee = InferInsertModel<typeof attendees>;

export interface AttendeeWithTicketInfo extends Attendee {
  ticketTypeName: string;
  eventTitle: string;
  eventDate: Date;
}

export const attendeeSchema = z.object({
  id: z.uuid(),
  orderId: z.uuid(),
  orderItemId: z.uuid(),
  eventId: z.uuid(),
  ticketTypeId: z.uuid(),
  ticketCode: z.string().min(1),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email address"),
  phoneNumber: z.string().optional().nullable(),
  isCheckedIn: z.boolean().default(false),
  checkedInAt: z.date().optional().nullable(),
  checkedInBy: z.uuid().optional().nullable(),
  isRevoked: z.boolean().default(false),
  revokedAt: z.date().optional().nullable(),
  revokedReason: z.string().optional().nullable(),
  qrCodeUrl: z.url().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createAttendeeSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.email("Invalid email address"),
  phoneNumber: z
    .string()
    .regex(/^(\+?234|0)[7-9][0-1]\d{8}$/, "Invalid phone number")
    .optional(),
});

export type CreateAttendeeFormData = z.infer<typeof createAttendeeSchema>;

export interface CheckInResult {
  success: boolean;
  attendee?: Attendee;
  message: string;
}
