"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface AutoVerifyPaymentProps {
  reference: string;
  orderStatus: string;
  intervalSeconds?: number;
  maxRetries?: number;           // New: Maximum number of auto-checks
}

export function AutoVerifyPayment({
  reference,
  orderStatus,
  intervalSeconds = 5,
  maxRetries = 24,               // Default: 24 attempts × 5s = 2 minutes
}: AutoVerifyPaymentProps) {
  const [countdown, setCountdown] = useState(intervalSeconds);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const shouldAutoVerify = 
    orderStatus === "pending" || 
    orderStatus === "processing";

  // Stop auto-verifying if we've reached max retries
  const hasReachedMaxRetries = retryCount >= maxRetries;

  // Main verification function
  const verifyPayment = useCallback(async () => {
    if (!reference || !shouldAutoVerify || hasReachedMaxRetries) return;

    setIsVerifying(true);
    setError(null);

    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Verification failed");
        console.error("Auto verify failed:", data);
      } else {
        console.log("✅ Payment verified successfully via auto-check");
        // Status will update on next server render → component will hide itself
      }
    } catch (err) {
      console.error("Auto verify network error:", err);
      setError("Network error while checking payment");
    } finally {
      setIsVerifying(false);
      setRetryCount((prev) => prev + 1);   // Count every attempt
    }
  }, [reference, shouldAutoVerify, hasReachedMaxRetries]);

  // Auto-check interval
  useEffect(() => {
    if (!shouldAutoVerify || !reference || hasReachedMaxRetries) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          verifyPayment();
          return intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [shouldAutoVerify, reference, intervalSeconds, verifyPayment, hasReachedMaxRetries]);

  // Reset states when orderStatus changes (especially when payment succeeds)
  useEffect(() => {
    setCountdown(intervalSeconds);
    setIsVerifying(false);
    setError(null);
    setRetryCount(0);                    // Reset retry count when status changes
  }, [orderStatus, intervalSeconds]);

  // Completely hide component when payment is successful or max retries reached
  if (!shouldAutoVerify || hasReachedMaxRetries) return null;

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center space-x-2 text-sm text-yellow-600">
        <RefreshCw
          className={`h-4 w-4 ${isVerifying ? "animate-spin" : ""}`}
        />
        <span>
          {isVerifying
            ? "Verifying payment with Paystack..."
            : `Auto-checking in ${countdown}s... (${retryCount}/${maxRetries})`
          }
        </span>
      </div>

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {error}
        </p>
      )}

      <p className="text-xs text-gray-500">
        Automatically verifying every {intervalSeconds}s • Will stop after {maxRetries} attempts (~2 minutes)
      </p>
    </div>
  );
}