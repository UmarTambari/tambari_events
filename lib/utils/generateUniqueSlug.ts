import { db }     from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq }     from "drizzle-orm";
import { generateSlug } from "./generateSlug";

export async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = generateSlug(title);
  if (!baseSlug) throw new Error("Title is required");

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const exists = await db
      .select()
      .from(events)
      .where(eq(events.slug, slug))
      .limit(1);

    if (exists.length === 0) return slug;

    slug = `${baseSlug}-${++counter}`;
  }
}

/** Slug for an existing event: allows keeping the current slug when the title still maps to it. */
export async function generateUniqueSlugForEvent(
  title: string,
  currentEventId: string
): Promise<string> {
  const baseSlug = generateSlug(title);
  if (!baseSlug) throw new Error("Title is required");

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const rows = await db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.slug, slug))
      .limit(1);

    if (rows.length === 0) return slug;
    if (rows[0].id === currentEventId) return slug;

    slug = `${baseSlug}-${++counter}`;
  }
}
