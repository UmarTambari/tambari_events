import { z } from "zod";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { webhookLogs } from "@/lib/db/schema";

export type WebhookLog = InferSelectModel<typeof webhookLogs>;
export type NewWebhookLog = InferInsertModel<typeof webhookLogs>;
export type WebhookStatus =
  | "received"
  | "processing"
  | "processed"
  | "failed"
  | "ignored";

export const webhookStatusSchema = z.enum([
  "received",
  "processing",
  "processed",
  "failed",
  "ignored",
]);

export const webhookLogSchema = z.object({
  id: z.uuid(),
  event: z.string().min(1),
  payload: z.any(),
  headers: z.any().optional().nullable(),
  reference: z.string().optional().nullable(),
  signature: z.string().optional().nullable(),
  isSignatureValid: z.boolean().default(false),
  status: webhookStatusSchema,
  processedAt: z.date().optional().nullable(),
  errorMessage: z.string().optional().nullable(),
  retryCount: z.number().int().default(0),
  isProcessed: z.boolean().default(false),
  createdAt: z.date(),
});
