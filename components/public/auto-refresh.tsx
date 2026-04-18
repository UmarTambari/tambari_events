"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

interface AutoRefreshProps {
  orderStatus: string;     // We'll pass transaction?.status or order.status
  intervalSeconds?: number; // Optional: default 5s
}

export function AutoRefresh({
  orderStatus,
  intervalSeconds = 5,
}: AutoRefreshProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(intervalSeconds);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const prevStatusRef = useRef(orderStatus);

  // Only run auto-refresh for pending/processing states
  const shouldRefresh = orderStatus === "pending" || orderStatus === "processing";

  useEffect(() => {
    if (!shouldRefresh) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Trigger refresh safely
          setIsRefreshing(true);
          router.refresh();        // This is safe here (inside useEffect)
          return intervalSeconds;  // Reset
        }
        return prev - 1;
      });
    }, 1000); // Run every 1 second to update countdown

    return () => clearInterval(interval);
  }, [shouldRefresh, router, intervalSeconds]);

  // Reset countdown when status changes
  useEffect(() => {
    if (prevStatusRef.current !== orderStatus) {
      prevStatusRef.current = orderStatus;
      setCountdown(intervalSeconds);
      setIsRefreshing(false);
    }
  }, [orderStatus, intervalSeconds]);

  if (!shouldRefresh) return null;

  return (
    <div className="flex items-center space-x-2 text-sm text-yellow-600 mt-3">
      <RefreshCw
        className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
      />
      <span>
        {isRefreshing
          ? "Checking payment status with Paystack..."
          : `Auto-refreshing in ${countdown}s... (using ngrok webhook)`
        }
      </span>
    </div>
  );
}