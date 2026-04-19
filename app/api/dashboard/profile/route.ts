import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUser }   from "@/lib/queries/users.queries";
import { updateUserSchema } from "@/lib/types/user.type";
import { getCurrentUserId } from "@/lib/auth";
import { apiErrorResponse } from "@/lib/error";
import { formatZodErrors }  from "@/lib/validations";

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      return apiErrorResponse("Unauthorized", 401);
    }
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    const body = await request.json();

    const validation = updateUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: formatZodErrors(validation.error),
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    const updatedUser = await updateUser(userId, data);

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      return apiErrorResponse("Unauthorized", 401);
    }
    return apiErrorResponse(error);
  }
}