import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");
    const trxref = searchParams.get("trxref"); // Alternative param name

    // Get reference from either parameter
    const txReference = reference || trxref;

    if (!txReference) {
      // No reference, redirect to home or error page
      return NextResponse.redirect(
        new URL("/payment/error?reason=missing_reference", request.url)
      );
    }

    const thankYouUrl = new URL(`/payment/${txReference}`, request.url);

    return NextResponse.redirect(thankYouUrl);
  } catch (error: any) {
    console.error("Callback handler error:", error);

    // Redirect to error page
    return NextResponse.redirect(
      new URL(`/payment/error?reason=callback_error`, request.url)
    );
  }
}
