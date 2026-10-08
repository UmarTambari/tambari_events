"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";

interface VerifyPaymentButtonProps {
  reference?: string | null;
}

export function VerifyPaymentButton({ reference }: VerifyPaymentButtonProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();

  if (!reference) {
    return null;
  }

  const handleVerify = async () => {
    setIsVerifying(true);

    try {
      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Genuine HTTP-level failure from our own API.
        throw new Error(data.error || "Verification failed");
      }

      if (data.pending) {
        // Not an error — payment just hasn't completed on Paystack's side yet.
        toast.info(data.message || "Payment has not been completed yet.");
        router.refresh();
        return;
      }

      if (!data.success) {
        // A real failure Paystack or our checks reported (e.g. amount mismatch).
        throw new Error(data.error || "Verification failed");
      }

      toast.success(data.message || "Payment verified successfully!");
      router.refresh();
    } catch (error) {
      console.error("Verification error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to verify payment",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <button
      onClick={handleVerify}
      disabled={isVerifying}
      className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
    >
      {isVerifying ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Verifying...</span>
        </>
      ) : (
        <>
          <CheckCircle className="h-5 w-5" />
          <span>Verify Payment Now</span>
        </>
      )}
    </button>
  );
}
