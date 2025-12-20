import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  slug: text("slug").notNull().unique(),
  
  organizerId: uuid("organizer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  venue: text("venue").notNull(),
  location: text("location").notNull(),
  eventDate: timestamp("event_date").notNull(),
  eventEndDate: timestamp("event_end_date"),
  bannerImageUrl: text("banner_image_url"),
  thumbnailImageUrl: text("thumbnail_image_url"),

  isPublished: boolean("is_published").default(false).notNull(),
  isCancelled: boolean("is_cancelled").default(false).notNull(),

  totalCapacity: integer("total_capacity"),

  category: text("category"),
  tags: text("tags").array(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
