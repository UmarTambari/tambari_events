"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface AutoVerifyPaymentProps {
  /** Paystack transaction reference; when missing, only soft-refresh runs (webhook catch-up). */
  reference?: string | null;
  /** Order row `status` — must be pending/processing for this UI to stay active. */
  orderStatus: string;
  intervalSeconds?: number;
  maxRetries?: number;
}

/**
 * Pending-payment poller: calls Paystack verify when `reference` exists, and
 * always uses `router.refresh()` so the server page can move to paid after
 * verify or webhook. Without a reference, falls back to timed refresh-only
 * polling (bounded), replacing a separate refresh-only component.
 */
export function AutoVerifyPayment({
  reference,
  orderStatus,
  intervalSeconds = 5,
  maxRetries = 24,
}: AutoVerifyPaymentProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(intervalSeconds);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const busyRef = useRef(false);
  const attemptsRef = useRef(0);

  const shouldPoll =
    orderStatus === "pending" || orderStatus === "processing";

  const atLimit = attempts >= maxRetries;

  const bumpAttempts = useCallback(() => {
    attemptsRef.current += 1;
    setAttempts(attemptsRef.current);
  }, []);

  const verifyWithPaystack = useCallback(async () => {
    if (
      !reference ||
      !shouldPoll ||
      busyRef.current ||
      attemptsRef.current >= maxRetries
    ) {
      return;
    }

    busyRef.current = true;
    setIsWorking(true);
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
      }
    } catch (err) {
      console.error("Auto verify network error:", err);
      setError("Network error while checking payment");
    } finally {
      busyRef.current = false;
      setIsWorking(false);
      bumpAttempts();
      router.refresh();
    }
  }, [reference, shouldPoll, maxRetries, router, bumpAttempts]);

  const runSoftRefresh = useCallback(() => {
    if (busyRef.current || attemptsRef.current >= maxRetries) return;
    busyRef.current = true;
    setIsWorking(true);
    try {
      router.refresh();
    } finally {
      busyRef.current = false;
      setIsWorking(false);
      bumpAttempts();
    }
  }, [router, bumpAttempts, maxRetries]);

  const runCycle = useCallback(() => {
    if (!shouldPoll || busyRef.current || attemptsRef.current >= maxRetries) {
      return;
    }
    if (reference) {
      void verifyWithPaystack();
    } else {
      runSoftRefresh();
    }
  }, [reference, shouldPoll, maxRetries, verifyWithPaystack, runSoftRefresh]);

  const runCycleRef = useRef(runCycle);
  runCycleRef.current = runCycle;

  // Per-second countdown → one action when it hits zero.
  useEffect(() => {
    if (!shouldPoll || atLimit) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          runCycleRef.current();
          return intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [shouldPoll, intervalSeconds, atLimit]);

  // One early cycle after mount / when becoming pending (stable deps — no attempts).
  useEffect(() => {
    if (!shouldPoll || atLimit) return;
    const t = window.setTimeout(() => {
      runCycleRef.current();
    }, 600);
    return () => window.clearTimeout(t);
  }, [shouldPoll, reference, atLimit]);

  // When leaving pending or interval / reference identity changes, reset counters.
  useEffect(() => {
    setCountdown(intervalSeconds);
    setIsWorking(false);
    setError(null);
    attemptsRef.current = 0;
    setAttempts(0);
    busyRef.current = false;
  }, [orderStatus, intervalSeconds, reference]);

  if (!shouldPoll || atLimit) {
    return null;
  }

  const approxMinutes = Math.round((maxRetries * intervalSeconds) / 60) || 1;

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center space-x-2 text-sm text-yellow-600">
        <RefreshCw
          className={`h-4 w-4 shrink-0 ${isWorking ? "animate-spin" : ""}`}
        />
        <span>
          {isWorking
            ? reference
              ? "Verifying payment with Paystack…"
              : "Checking for payment update…"
            : reference
              ? `Next check in ${countdown}s (${attempts}/${maxRetries})`
              : `Refreshing in ${countdown}s (${attempts}/${maxRetries}) — waiting on payment update`}
        </span>
      </div>

      {!reference && (
        <p className="text-xs text-yellow-800 bg-yellow-100/60 rounded px-2 py-1.5">
          No transaction reference on file yet. This page will reload
          periodically; if nothing changes, use &quot;Verify Payment Now&quot;
          after paying.
        </p>
      )}

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}

      <p className="text-xs text-gray-500">
        {reference
          ? `Confirms with Paystack every ${intervalSeconds}s (up to ~${approxMinutes} min), then refreshes this page.`
          : `Reloads this page every ${intervalSeconds}s (up to ~${approxMinutes} min) so a completed payment can appear when the server is notified.`}
      </p>
    </div>
  );
}
