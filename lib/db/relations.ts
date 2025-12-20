import { relations } from "drizzle-orm";
import {
  users,
  events,
  ticketTypes,
  orders,
  orderItems,
  transactions,
  attendees,
} from "./schema";

// 1. Users → Events (one-to-many)
export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
}));

// 2. Events → Organizer (many-to-one)
export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, {
    fields: [events.organizerId],
    references: [users.id],
  }),
  ticketTypes: many(ticketTypes),
  orders: many(orders),
  attendees: many(attendees),
}));

// 3. Ticket Types → Event (many-to-one)
export const ticketTypesRelations = relations(ticketTypes, ({ one, many }) => ({
  event: one(events, {
    fields: [ticketTypes.eventId],
    references: [events.id],
  }),
  orderItems: many(orderItems),
  attendees: many(attendees),
}));

// 4. Orders → User, Event, Transaction, Items, Attendees
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [orders.eventId],
    references: [events.id],
  }),
  transaction: one(transactions, {
    fields: [orders.id],
    references: [transactions.orderId],
  }),
  items: many(orderItems),
  attendees: many(attendees),
}));

// 5. Order Items → Order, TicketType
export const orderItemsRelations = relations(orderItems, ({ one, many }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  ticketType: one(ticketTypes, {
    fields: [orderItems.ticketTypeId],
    references: [ticketTypes.id],
  }),
  attendees: many(attendees),
}));

// 6. Transactions → Order (many-to-one)
export const transactionsRelations = relations(transactions, ({ one }) => ({
  order: one(orders, {
    fields: [transactions.orderId],
    references: [orders.id],
  }),
}));

// 7. Attendees → Order, OrderItem, Event, TicketType
export const attendeesRelations = relations(attendees, ({ one }) => ({
  order: one(orders, {
    fields: [attendees.orderId],
    references: [orders.id],
  }),
  orderItem: one(orderItems, {
    fields: [attendees.orderItemId],
    references: [orderItems.id],
  }),
  event: one(events, {
    fields: [attendees.eventId],
    references: [events.id],
  }),
  ticketType: one(ticketTypes, {
    fields: [attendees.ticketTypeId],
    references: [ticketTypes.id],
  }),
}));
