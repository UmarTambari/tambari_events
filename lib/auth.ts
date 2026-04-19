import { createClient }     from "@/lib/supabase/server";
import { getUserByAuthId, createUser } from "@/lib/queries/users.queries";
import { redirect }     from "next/navigation";

// ---------------------------------------------------------------------------
// Low-level: get the raw Supabase auth user (never redirects)
// ---------------------------------------------------------------------------
export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

// ---------------------------------------------------------------------------
// Internal helper: resolve (or auto-create) the DB user from a Supabase user.
// Keeping this in one place avoids duplicating the upsert logic everywhere.
// ---------------------------------------------------------------------------
async function resolveDbUser(supabaseUser: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) {
  let user = await getUserByAuthId(supabaseUser.id);

  if (!user) {
    user = await createUser({
      authId: supabaseUser.id,
      email: supabaseUser.email!,
      fullName:
        supabaseUser.user_metadata?.full_name ||
        supabaseUser.email!.split("@")[0],
      phoneNumber: supabaseUser.user_metadata?.phone || null,
    });
  }

  return user;
}

// ---------------------------------------------------------------------------
// For SERVER COMPONENTS & PAGES only.
// Redirects to /sign-in when the user is not authenticated.
// Do NOT call this from API route handlers — use getCurrentUserIdOrNull instead.
// ---------------------------------------------------------------------------
export async function getCurrentUserId(): Promise<string> {
  const supabaseUser = await getCurrentUser();

  if (!supabaseUser) {
    redirect("/sign-in");
  }

  const user = await resolveDbUser(supabaseUser);
  return user.id;
}

// ---------------------------------------------------------------------------
// For API ROUTE HANDLERS.
// Returns null instead of redirecting so the handler can return a proper 401.
// Never throws NEXT_REDIRECT, so it is safe inside try/catch blocks.
// ---------------------------------------------------------------------------
export async function getCurrentUserIdOrNull(): Promise<string | null> {
  const supabaseUser = await getCurrentUser();

  if (!supabaseUser) {
    return null;
  }

  const user = await resolveDbUser(supabaseUser);
  return user.id;
}

// ---------------------------------------------------------------------------
// Require authentication — for pages/layouts that need the raw Supabase user.
// Redirects to /sign-in when unauthenticated.
// ---------------------------------------------------------------------------
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

// ---------------------------------------------------------------------------
// Returns the full DB user record, or null if not authenticated.
// Safe to call anywhere (pages, API routes, components).
// ---------------------------------------------------------------------------
export async function getCurrentUserWithData() {
  const supabaseUser = await getCurrentUser();

  if (!supabaseUser) {
    return null;
  }

  return resolveDbUser(supabaseUser);
}