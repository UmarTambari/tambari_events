import { z } from "zod";

// Nigerian phone number validator
export const nigerianPhoneSchema = z
  .string()
  .regex(
    /^(\+?234|0)[7-9][0-1]\d{8}$/,
    "Invalid Nigerian phone number. Format: +234XXXXXXXXXX or 0XXXXXXXXXX"
  )
  .transform((val) => {
    // Normalize to international format
    const cleaned = val.replace(/\s/g, "");
    if (cleaned.startsWith("+234")) return cleaned;
    if (cleaned.startsWith("234")) return `+${cleaned}`;
    if (cleaned.startsWith("0")) return `+234${cleaned.slice(1)}`;
    return cleaned;
  });

export const optionalNigerianPhoneSchema = z
  .string()
  .regex(/^(\+?234|0)[7-9][0-1]\d{8}$/, "Invalid Nigerian phone number")
  .optional()
  .or(z.literal(""))
  .nullable();

// Price validator (in kobo)
export const priceInKoboSchema = z
  .number()
  .int("Price must be a whole number")
  .min(0, "Price cannot be negative")
  .max(100000000, "Price is too high"); // Max 1 million Naira in kobo

// Quantity validator
export const quantitySchema = z
  .number()
  .int("Quantity must be a whole number")
  .positive("Quantity must be at least 1")
  .max(10000, "Quantity is too high");

// Slug validator
export const slugSchema = z
  .string()
  .min(3, "Slug must be at least 3 characters")
  .max(200, "Slug is too long")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug can only contain lowercase letters, numbers, and hyphens"
  );

// Date range validator
export const dateRangeSchema = z
  .object({
    startDate: z.date(),
    endDate: z.date().optional().nullable(),
  })
  .refine(
    (data) => {
      if (!data.endDate) return true;
      return data.endDate >= data.startDate;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

// File upload validator
export const fileUploadSchema = z
  .instanceof(File)
  .refine(
    (file) => file.size <= 5 * 1024 * 1024,
    "File size must be less than 5MB"
  )
  .refine(
    (file) =>
      ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
        file.type
      ),
    "File must be a JPEG, PNG, or WebP image"
  );

// Optional file upload
export const optionalFileUploadSchema = fileUploadSchema.optional().nullable();

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateNigerianPhone(phone: string): boolean {
  const phoneRegex = /^(\+?234|0)[7-9][0-1]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

export function validateUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function validateSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

export function validateFutureDate(date: Date): boolean {
  return date > new Date();
}

export function validateDateRange(
  startDate: Date,
  endDate?: Date | null
): boolean {
  if (!endDate) return true;
  return endDate >= startDate;
}

export function validatePrice(price: number): {
  valid: boolean;
  error?: string;
} {
  if (!Number.isInteger(price)) {
    return { valid: false, error: "Price must be a whole number" };
  }
  if (price < 0) {
    return { valid: false, error: "Price cannot be negative" };
  }
  if (price > 100000000) {
    return { valid: false, error: "Price is too high (max: ₦1,000,000)" };
  }
  return { valid: true };
}

export function validateQuantity(
  quantity: number,
  max: number = 10000
): { valid: boolean; error?: string } {
  if (!Number.isInteger(quantity)) {
    return { valid: false, error: "Quantity must be a whole number" };
  }
  if (quantity < 1) {
    return { valid: false, error: "Quantity must be at least 1" };
  }
  if (quantity > max) {
    return { valid: false, error: `Quantity cannot exceed ${max}` };
  }
  return { valid: true };
}

export function validateTicketAvailability(
  ticketType: {
    quantity: number;
    quantitySold: number;
    isActive: boolean;
    saleStartDate: Date | null;
    saleEndDate: Date | null;
    minPurchase: number;
    maxPurchase: number;
  },
  requestedQuantity: number
): { valid: boolean; error?: string } {
  if (!ticketType.isActive) {
    return {
      valid: false,
      error: "This ticket type is not available for sale",
    };
  }

  const now = new Date();

  if (ticketType.saleStartDate && now < ticketType.saleStartDate) {
    return {
      valid: false,
      error: `Sale starts on ${ticketType.saleStartDate.toLocaleDateString()}`,
    };
  }

  if (ticketType.saleEndDate && now > ticketType.saleEndDate) {
    return {
      valid: false,
      error: `Sale ended on ${ticketType.saleEndDate.toLocaleDateString()}`,
    };
  }

  if (requestedQuantity < ticketType.minPurchase) {
    return {
      valid: false,
      error: `Minimum purchase is ${ticketType.minPurchase} ticket(s)`,
    };
  }

  if (requestedQuantity > ticketType.maxPurchase) {
    return {
      valid: false,
      error: `Maximum purchase is ${ticketType.maxPurchase} ticket(s)`,
    };
  }

  const remainingTickets = ticketType.quantity - ticketType.quantitySold;

  if (remainingTickets === 0) {
    return { valid: false, error: "This ticket type is sold out" };
  }

  if (remainingTickets < requestedQuantity) {
    return {
      valid: false,
      error: `Only ${remainingTickets} ticket(s) remaining`,
    };
  }

  return { valid: true };
}

export function validateEventCapacity(
  totalCapacity: number | null,
  currentTicketsSold: number,
  additionalTickets: number
): { valid: boolean; error?: string } {
  if (totalCapacity === null) {
    return { valid: true }; // Unlimited capacity
  }

  const remainingCapacity = totalCapacity - currentTicketsSold;

  if (remainingCapacity === 0) {
    return { valid: false, error: "Event is at full capacity" };
  }

  if (remainingCapacity < additionalTickets) {
    return {
      valid: false,
      error: `Only ${remainingCapacity} ticket(s) remaining for this event`,
    };
  }

  return { valid: true };
}

// Sanitize string input (remove dangerous characters)
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/[^\w\s@.,!?-]/g, ""); // Keep only safe characters
}

export function validateFileUpload(file: File): {
  valid: boolean;
  error?: string;
} {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (file.size > maxSize) {
    return { valid: false, error: "File size must be less than 5MB" };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "File must be a JPEG, PNG, or WebP image" };
  }

  return { valid: true };
}

export function parseInteger(
  value: string | number,
  fieldName: string = "Value"
): { valid: boolean; value?: number; error?: string } {
  const num = typeof value === "string" ? parseInt(value, 10) : value;

  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a valid number` };
  }

  if (!Number.isInteger(num)) {
    return { valid: false, error: `${fieldName} must be a whole number` };
  }

  return { valid: true, value: num };
}

// Validate and parse date
export function parseDate(
  value: string | Date,
  fieldName: string = "Date"
): { valid: boolean; value?: Date; error?: string } {
  if (value instanceof Date) {
    if (isNaN(value.getTime())) {
      return { valid: false, error: `${fieldName} is invalid` };
    }
    return { valid: true, value };
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return { valid: false, error: `${fieldName} is invalid` };
  }

  return { valid: true, value: date };
}

// ===========================
// ERROR FORMATTING
// ===========================

/**
 * Format Zod errors for display
 */
export function formatZodErrors(errors: z.ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {};

  errors.issues.forEach((issue) => {
    const path = issue.path.length ? issue.path.join(".") : "root";
    formattedErrors[path] = issue.message;
  });

  return formattedErrors;
}

/**
 * Get first error message from Zod error
 */
export function getFirstZodError(errors: z.ZodError): string {
  return errors.issues[0]?.message || "Validation error";
}
