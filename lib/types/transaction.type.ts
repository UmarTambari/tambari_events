import { z } from "zod";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { transactions } from "@/lib/db/schema";

export type Transaction = InferSelectModel<typeof transactions>;
export type NewTransaction = InferInsertModel<typeof transactions>;
export type TransactionStatus = "pending" | "success" | "failed" | "abandoned";
export type PaymentProvider = "paystack";

export const transactionStatusSchema = z.enum([
  "pending",
  "success",
  "failed",
  "abandoned",
]);

export const transactionSchema = z.object({
  id: z.uuid(),
  reference: z.string().min(1),
  orderId: z.uuid(),
  provider: z.enum(["paystack"]),
  amount: z.number().int().min(0),
  currency: z.string().default("NGN"),
  email: z.email(),
  status: transactionStatusSchema,
  paystackReference: z.string().optional().nullable(),
  accessCode: z.string().optional().nullable(),
  authorizationUrl: z.url().optional().nullable(),
  channel: z.string().optional().nullable(),
  cardType: z.string().optional().nullable(),
  bank: z.string().optional().nullable(),
  lastFourDigits: z.string().optional().nullable(),
  paystackResponse: z.any().optional().nullable(),
  gatewayResponse: z.string().optional().nullable(),
  isVerified: z.boolean().default(false),
  verifiedAt: z.date().optional().nullable(),
  webhookReceived: z.boolean().default(false),
  webhookReceivedAt: z.date().optional().nullable(),
  webhookAttempts: z.number().int().default(0),
  failureReason: z.string().optional().nullable(),
  ipAddress: z.string().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  paidAt: z.date().optional().nullable(),
});

export interface PaymentInitResponse {
  success: boolean;
  authorizationUrl?: string;
  accessCode?: string;
  reference?: string;
  error?: string;
}
