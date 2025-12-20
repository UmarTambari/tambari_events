import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { transactions } from "@/lib/db/schema";

export async function createTransaction(data: {
  reference: string;
  orderId: string;
  provider?: "paystack";
  amount: number;
  currency?: string;
  email: string;
  paystackReference?: string;
  accessCode?: string;
  authorizationUrl?: string;
}) {
  const [transaction] = await db.insert(transactions).values(data).returning();
  return transaction;
}

export async function getTransactionByReference(reference: string) {
  const [transaction] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.reference, reference));
  return transaction;
}

export async function updateTransaction(
  transactionId: string,
  data: Partial<{
    status: "pending" | "success" | "failed" | "abandoned";
    channel: string;
    cardType: string;
    bank: string;
    lastFourDigits: string;
    paystackResponse: string;
    gatewayResponse: string;
    isVerified: boolean;
    verifiedAt: Date;
    webhookReceived: boolean;
    webhookReceivedAt: Date;
    failureReason: string;
    paidAt: Date;
  }>
) {
  const [transaction] = await db
    .update(transactions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(transactions.id, transactionId))
    .returning();
  return transaction;
}
