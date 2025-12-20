import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { orders } from "./orders.schema";
import { orderItems } from "./orderItems.schema";
import { events } from "./events.schema";
import { ticketTypes } from "./tickets.schema";

/**
 * Attendees table - Individual ticket holders
 * 
 * One order item with quantity=3 creates 3 attendee records
 * Each attendee gets a unique ticket code for check-in
 */
export const attendees = pgTable("attendees", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Relationships
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  
  orderItemId: uuid("order_item_id")
    .notNull()
    .references(() => orderItems.id, { onDelete: "cascade" }),
  
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  
  ticketTypeId: uuid("ticket_type_id")
    .notNull()
    .references(() => ticketTypes.id, { onDelete: "restrict" }),
  
  // Unique ticket code for check-in
  ticketCode: text("ticket_code").notNull().unique(), // e.g., "TKT-ABC123XYZ"
  
  // Attendee details (can be different from buyer)
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number"),
  
  // Check-in tracking
  isCheckedIn: boolean("is_checked_in").default(false).notNull(),
  checkedInAt: timestamp("checked_in_at"),
  checkedInBy: uuid("checked_in_by"), // Staff/organizer who checked them in
  
  // Ticket status
  isRevoked: boolean("is_revoked").default(false).notNull(), // For cancelled/refunded tickets
  revokedAt: timestamp("revoked_at"),
  revokedReason: text("revoked_reason"),
  
  // QR code URL (for easy check-in)
  qrCodeUrl: text("qr_code_url"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});