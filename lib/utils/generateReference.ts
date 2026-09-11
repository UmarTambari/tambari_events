import { nanoid } from "nanoid";

export function generateTransactionReference(): string {
  const date = new Date();
  const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
  return `TXN_${dateStr}_${nanoid(12)}`;
}

export function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
  return `ORD_${dateStr}_${nanoid(12)}`;
}

export function generateTicketCode(): string {
  return `TKT_${nanoid(12).toUpperCase()}`;
}