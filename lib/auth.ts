import { createClient } from "@/lib/supabase/server";
import { getUserByAuthId, createUser } from "@/lib/queries/users.queries";
import { redirect } from "next/navigation";

// Get the current authenticated user from Supabase
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

//Get the current user's database ID
//This is the ID from your users table, not the Supabase auth ID
export async function getCurrentUserId(): Promise<string> {
  const supabaseUser = await getCurrentUser();

  if (!supabaseUser) {
    redirect("/sign-in");
  }

  // Get or create user in your database
  let user = await getUserByAuthId(supabaseUser.id);

  // If user doesn't exist in your database, create them
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

  return user.id;
}

//Require authentication - throws if not authenticated
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}


//Get user with database record

export async function getCurrentUserWithData() {
  const supabaseUser = await getCurrentUser();

  if (!supabaseUser) {
    return null;
  }

  const user = await getUserByAuthId(supabaseUser.id);

  if (!user) {
    // Create user if doesn't exist
    const newUser = await createUser({
      authId: supabaseUser.id,
      email: supabaseUser.email!,
      fullName:
        supabaseUser.user_metadata?.full_name ||
        supabaseUser.email!.split("@")[0],
      phoneNumber: supabaseUser.user_metadata?.phone || null,
    });
    return newUser;
  }

  return user;
}
