import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { webhookLogs } from "@/lib/db/schema";

export async function createWebhookLog(data: {
  event: string;
  payload: unknown;
  headers?: unknown;
  reference?: string;
  signature?: string;
  isSignatureValid?: boolean;
}) {
  const [log] = await db.insert(webhookLogs).values(data).returning();
  return log;
}

export async function updateWebhookLog(
  logId: string,
  data: {
    status: "received" | "processing" | "processed" | "failed" | "ignored";
    processedAt?: Date;
    errorMessage?: string;
    isProcessed?: boolean;
  }
) {
  const [log] = await db
    .update(webhookLogs)
    .set(data)
    .where(eq(webhookLogs.id, logId))
    .returning();
  return log;
}
