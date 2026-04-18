import { NextResponse } from "next/server";
import { initializePayment, nairaToKobo } from "@/lib/paystack";
import { generateTransactionReference } from "@/lib/utils/generateReference";

export async function GET() {
  try {
w    const reference = generateTransactionReference();
    const result = await initializePayment({
      email: "test@example.com",
      amount: nairaToKobo(1000), // ₦1,000
      reference,
    });

    return NextResponse.json({
      success: true,
      message: "Paystack connection successful!",
      data: {
        reference: result.data.reference,
        authorization_url: result.data.authorization_url,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Paystack connection failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}