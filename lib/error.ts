import { NextResponse } from "next/server";

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong"
) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (error as any).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return fallback;
}

export function apiErrorResponse(error: unknown, status = 500) {
  const message = getErrorMessage(error);
  // Safe structured logging
  console.error("API ERROR:", {
    message,
    stack: error instanceof Error ? error.stack : undefined,
  });
  return NextResponse.json({ success: false, error: message }, { status });
}
