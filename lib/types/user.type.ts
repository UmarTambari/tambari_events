import { z } from "zod";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { users } from "@/lib/db/schema";

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

// User Schemas
export const userSchema = z.object({
  id: z.uuid(),
  authId: z.string().min(1, "Auth ID is required"),
  email: z.email("Invalid email address"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phoneNumber: z.string().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createUserSchema = z.object({
  authId: z.string().min(1, "Auth ID is required"),
  email: z.email("Invalid email address"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phoneNumber: z
    .string()
    .regex(/^(\+?234|0)[7-9][0-1]\d{8}$/, "Invalid Nigerian phone number")
    .optional()
    .or(z.literal("")),
});

export const updateUserSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .optional(),
  phoneNumber: z
    .string()
    .regex(/^(\+?234|0)[7-9][0-1]\d{8}$/, "Invalid Nigerian phone number")
    .optional()
    .or(z.literal("")),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
