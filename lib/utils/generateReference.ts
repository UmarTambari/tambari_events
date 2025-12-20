export function generateTransactionReference(): string {
  const date = new Date();
  const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 15);
  return `TXN_${dateStr}_${random}`;
}

export function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 15);
  return `ORD_${dateStr}_${random}`;
}

export function generateTicketCode(): string {
  const random = Math.random().toString(36).substring(2, 15).toUpperCase();
  return `TKT_${random}`;
}