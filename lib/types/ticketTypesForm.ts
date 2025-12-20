import { z } from "zod";

// Schema for Add Ticket Dialog (form inputs are strings)
export const addTicketFormSchema = z.object({
  name: z.string().min(1, "Ticket name is required").max(100),
  description: z.string().max(500).optional(),
  price: z.string().min(1, "Price is required"),
  quantity: z.string().min(1, "Quantity is required"),
  minPurchase: z.string().default("1"),
  maxPurchase: z.string().default("10"),
  saleStartDate: z.string().optional(),
  saleEndDate: z.string().optional(),
});

export type AddTicketFormData = z.infer<typeof addTicketFormSchema>;

export const editTicketFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  price: z.string().min(1, "Price is required"),
  quantity: z.string().min(1, "Quantity is required"),
  minPurchase: z.string().min(1, "Minimum purchase is required"),
  maxPurchase: z.string().min(1, "Maximum purchase is required"),
  isActive: z.boolean(),
  saleStartDate: z.string().optional(),
  saleEndDate: z.string().optional(),
});

export type EditTicketFormData = z.infer<typeof editTicketFormSchema>;

/**
 * Transform form data to API payload
 * Converts strings to numbers and handles date conversions
 */
export function transformTicketFormToAPI(
  data: AddTicketFormData | EditTicketFormData
): {
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  minPurchase: number;
  maxPurchase: number;
  isActive?: boolean;
  saleStartDate: string | null;
  saleEndDate: string | null;
} {
  const priceInKobo = Math.round(parseFloat(data.price) * 100);
  const quantity = parseInt(data.quantity, 10);
  const minPurchase = parseInt(data.minPurchase, 10);
  const maxPurchase = parseInt(data.maxPurchase, 10);

  // Validate transformed values
  if (isNaN(priceInKobo) || priceInKobo < 0) {
    throw new Error("Invalid price value");
  }
  if (isNaN(quantity) || quantity < 1) {
    throw new Error("Invalid quantity value");
  }
  if (isNaN(minPurchase) || minPurchase < 1) {
    throw new Error("Invalid minimum purchase value");
  }
  if (isNaN(maxPurchase) || maxPurchase < 1) {
    throw new Error("Invalid maximum purchase value");
  }
  if (minPurchase > maxPurchase) {
    throw new Error("Minimum purchase cannot exceed maximum purchase");
  }

  const result: {
    name: string;
    description: string | null;
    price: number;
    quantity: number;
    minPurchase: number;
    maxPurchase: number;
    isActive?: boolean;
    saleStartDate: string | null;
    saleEndDate: string | null;
  } = {
    name: data.name.trim(),
    description: data.description?.trim() || null,
    price: priceInKobo,
    quantity,
    minPurchase,
    maxPurchase,
    saleStartDate: data.saleStartDate
      ? new Date(data.saleStartDate).toISOString()
      : null,
    saleEndDate: data.saleEndDate
      ? new Date(data.saleEndDate).toISOString()
      : null,
  };

  // Add isActive if it exists in the data (for edit form)
  if ("isActive" in data) {
    result.isActive = data.isActive;
  }

  return result;
}

/**
 * Transform API ticket data to form values
 */
export function transformTicketAPIToForm(ticket: {
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  minPurchase: number;
  maxPurchase: number;
  isActive: boolean;
  saleStartDate: Date | string | null;
  saleEndDate: Date | string | null;
}): EditTicketFormData {
  const formatDateForInput = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

  return {
    name: ticket.name,
    description: ticket.description || "",
    price: (ticket.price / 100).toString(),
    quantity: ticket.quantity.toString(),
    minPurchase: ticket.minPurchase.toString(),
    maxPurchase: ticket.maxPurchase.toString(),
    isActive: ticket.isActive,
    saleStartDate: formatDateForInput(ticket.saleStartDate),
    saleEndDate: formatDateForInput(ticket.saleEndDate),
  };
}
