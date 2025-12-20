import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { events } from "./events.schema";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "paid",
  "failed",
  "cancelled",
  "refunded",
]);

/**
 * Orders table - Main order records
 * One order can contain multiple ticket types
 */
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),

  orderNumber: text("order_number").notNull().unique(), // e.g., "ORD-20240101-ABCD"

  // Relationships
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),

  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),

  subtotal: integer("subtotal").notNull(), // Before fees
  serviceFee: integer("service_fee").default(0).notNull(),
  totalAmount: integer("total_amount").notNull(), // What customer pays

  status: orderStatusEnum("status").default("pending").notNull(),

  notes: text("notes"), // Special requests, etc.

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
  cancelledAt: timestamp("cancelled_at"),
});
