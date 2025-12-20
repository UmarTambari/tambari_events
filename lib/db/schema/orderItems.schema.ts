import { pgTable, timestamp, uuid, integer, text } from "drizzle-orm/pg-core";
import { orders } from "./orders.schema";
import { ticketTypes } from "./tickets.schema";

/**
 * Order Items table - Line items for each order
 * Links orders to specific ticket types and quantities
 */
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),

  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),

  ticketTypeId: uuid("ticket_type_id")
    .notNull()
    .references(() => ticketTypes.id, { onDelete: "restrict" }), // Don't delete if orders exist

  // Snapshot of ticket info at time of purchase
  ticketTypeName: text("ticket_type_name").notNull(),
  pricePerTicket: integer("price_per_ticket").notNull(),

  // Quantity
  quantity: integer("quantity").notNull(),
  subtotal: integer("subtotal").notNull(), // quantity * pricePerTicket

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
