import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  pgEnum,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import { orders } from "./orders.schema";

export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending", // Payment initiated but not completed
  "success", // Payment successful
  "failed", // Payment failed
  "abandoned", // User closed payment modal
]);

export const paymentProviderEnum = pgEnum("payment_provider", ["paystack"]);

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),

  reference: text("reference").notNull().unique(),

  // Order relationship
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),

  // Payment Details
  provider: paymentProviderEnum("provider").default("paystack").notNull(),
  amount: integer("amount").notNull(), // Amount in kobo
  currency: text("currency").default("NGN").notNull(),

  email: text("email").notNull(),

  status: transactionStatusEnum("status").default("pending").notNull(),

  // Paystack-specific fields
  paystackReference: text("paystack_reference"), // Paystack's own reference
  accessCode: text("access_code"), // For Paystack Inline
  authorizationUrl: text("authorization_url"), // For redirect flow

  // Payment metadata from Paystack
  channel: text("channel"), // "card", "bank", "ussd", "qr"
  cardType: text("card_type"), // "visa", "mastercard", etc.
  bank: text("bank"), // Customer's bank
  lastFourDigits: text("last_four_digits"), // Last 4 digits of card

  // Response tracking
  paystackResponse: jsonb("paystack_response"), // Full response from Paystack
  gatewayResponse: text("gateway_response"), // "Successful", "Declined", etc.

  // Verification tracking
  isVerified: boolean("is_verified").default(false).notNull(),
  verifiedAt: timestamp("verified_at"),

  // Webhook tracking
  webhookReceived: boolean("webhook_received").default(false).notNull(),
  webhookReceivedAt: timestamp("webhook_received_at"),
  webhookAttempts: integer("webhook_attempts").default(0).notNull(),

  failureReason: text("failure_reason"),

  // IP tracking (optional, for fraud prevention)
  ipAddress: text("ip_address"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"), // When Paystack confirmed payment
});
