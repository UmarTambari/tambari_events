import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

export const webhookStatusEnum = pgEnum("webhook_status", [
  "received", // Webhook received
  "processing", // Currently processing
  "processed", // Successfully processed
  "failed", // Processing failed
  "ignored", // Duplicate or irrelevant
]);

/**
 * Webhook Logs table - CRITICAL FOR DEBUGGING
 *
 * Logs every webhook received from Paystack
 */
export const webhookLogs = pgTable("webhook_logs", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Webhook identification
  event: text("event").notNull(), // e.g., "charge.success", "charge.failed"

  // Request details
  payload: jsonb("payload").notNull(), // Full webhook payload from Paystack
  headers: jsonb("headers"), // Request headers (for debugging)

  // Reference from payload
  reference: text("reference"), // Transaction reference from webhook

  // Signature verification
  signature: text("signature"), // x-paystack-signature header
  isSignatureValid: boolean("is_signature_valid").default(false).notNull(),

  // Processing status
  status: webhookStatusEnum("status").default("received").notNull(),

  // Processing details
  processedAt: timestamp("processed_at"),
  errorMessage: text("error_message"), // If processing failed
  retryCount: integer("retry_count").default(0).notNull(),

  // Idempotency tracking (prevent duplicate processing)
  isProcessed: boolean("is_processed").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
