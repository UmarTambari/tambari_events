import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import {
  users,
} from "@/lib/db/schema";

export async function getUserById(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return user;
}

export async function getUserByAuthId(authId: string) {
  const [user] = await db.select().from(users).where(eq(users.authId, authId));
  return user;
}

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

export async function createUser(data: {
  authId: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
}) {
  const [user] = await db.insert(users).values(data).returning();
  return user;
}

export async function updateUser(
  userId: string,
  data: { fullName?: string; phoneNumber?: string }
) {
  const [user] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();
  return user;
}
