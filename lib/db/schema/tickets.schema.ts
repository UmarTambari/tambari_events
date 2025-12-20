import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { events } from "./events.schema";

export const ticketTypes = pgTable("ticket_types", {
  id: uuid("id").primaryKey().defaultRandom(),

  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),

  name: text("name").notNull(), // e.g., "VIP", "Regular"
  description: text("description"),

  price: integer("price").notNull(), // Price in kobo

  quantity: integer("quantity").notNull(),
  quantitySold: integer("quantity_sold").default(0).notNull(),

  saleStartDate: timestamp("sale_start_date"),
  saleEndDate: timestamp("sale_end_date"),

  minPurchase: integer("min_purchase").default(1).notNull(),
  maxPurchase: integer("max_purchase").default(10).notNull(),

  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
