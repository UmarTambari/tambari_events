import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

import { getUserByAuthId, updateUser } from "@/lib/queries/users.queries";

const updateProfileSchema = z.object({
  fullName: z.string().min(2),
  phoneNumber: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    // Create Supabase server client (reads cookies automatically)
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user: supabaseUser }, error: authError } = 
      await supabase.auth.getUser();

    if (authError || !supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByAuthId(supabaseUser.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse request
    const body = await request.json();
    const { fullName, phoneNumber } = updateProfileSchema.parse(body);

    // Update user
    const updatedUser = await updateUser(user.id, {
      fullName,
      phoneNumber: phoneNumber || undefined,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        phoneNumber: updatedUser.phoneNumber,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}