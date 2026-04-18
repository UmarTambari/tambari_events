"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatAmount } from "@/lib/paystack";

type PaymentStatus = "loading" | "success" | "failed" | "pending" | "error";

interface PaymentData {
  reference: string;
  status: string;
  amount: number;
  orderNumber: string;
  orderId: string;
  paidAt?: string;
  reason?: string;
}

export default function PaymentStatusPage() {
  const params = useParams();
  const router = useRouter();
  const reference = params.reference as string;

  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [error, setError] = useState<string>("");
  const [pollingCount, setPollingCount] = useState(0);

  useEffect(() => {
    if (!reference) {
      setStatus("error");
      setError("Invalid payment reference");
      return;
    }

    // Start verification process
    verifyPayment();
  }, [reference]);

  const verifyPayment = async () => {
    try {
      // First, verify the payment
      const verifyResponse = await fetch("/api/paystack/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });

      const verifyResult = await verifyResponse.json();

      if (verifyResult.success && verifyResult.data.status === "success") {
        // Payment verified successfully
        setPaymentData(verifyResult.data);

        // Start polling to check if webhook has processed
        pollForWebhookCompletion();
      } else if (verifyResult.data?.status === "failed") {
        // Payment failed
        setStatus("failed");
        setPaymentData(verifyResult.data);
      } else {
        // Payment pending or not found
        setStatus("pending");
        setPaymentData(verifyResult.data);
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      setStatus("error");
      setError("Failed to verify payment. Please contact support.");
    }
  };

  /**
   * Poll for webhook completion
   * We wait for the webhook to process and generate tickets
   */
  const pollForWebhookCompletion = async () => {
    const maxPolls = 10; // Poll for max 20 seconds (2s * 10)
    let polls = 0;

    const poll = async () => {
      try {
        const response = await fetch(
          `/api/paystack/verify?reference=${reference}`
        );
        const result = await response.json();

        polls++;
        setPollingCount(polls);

        if (
          result.data?.webhookReceived &&
          result.data?.orderStatus === "paid"
        ) {
          // Webhook has processed, order is fulfilled
          setStatus("success");
          setPaymentData(result.data);
          return;
        }

        if (polls < maxPolls) {
          // Continue polling
          setTimeout(poll, 2000); // Poll every 2 seconds
        } else {
          // Max polls reached, but payment was successful
          // Show success anyway (webhook might be delayed)
          setStatus("success");
          setPaymentData(result.data);
        }
      } catch (error) {
        console.error("Polling error:", error);
        // Still show success since payment was verified
        setStatus("success");
      }
    };

    poll();
  };

  /**
   * Render different states
   */
  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold mb-2">Verifying Payment...</h2>
            <p className="text-gray-600">
              Please wait while we confirm your payment
            </p>
            {pollingCount > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Processing order... ({pollingCount}/10)
              </p>
            )}
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your tickets have been confirmed
            </p>

            {paymentData && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-semibold">
                      {paymentData.orderNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-mono text-sm">
                      {paymentData.reference}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-bold text-green-600">
                      {formatAmount(paymentData.amount)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                📧 Confirmation email with your tickets has been sent to your
                email address.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push(`/orders/${paymentData?.orderId}`)}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                View Tickets
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Back to Events
              </button>
            </div>
          </div>
        );

      case "failed":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-6">
              {paymentData?.reason || "Your payment could not be processed"}
            </p>

            {paymentData && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-mono text-sm">
                      {paymentData.reference}
                    </span>
                  </div>
                  {paymentData.reason && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reason:</span>
                      <span className="text-sm">{paymentData.reason}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => router.back()}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Back to Events
              </button>
            </div>
          </div>
        );

      case "pending":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-yellow-600 mb-2">
              Payment Pending
            </h2>
            <p className="text-gray-600 mb-6">
              Your payment is still being processed
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                This may take a few minutes. You can check your order status in
                your account.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Refresh Status
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Back to Events
              </button>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">
              {error || "Something went wrong"}
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                If you were charged, please contact support with your reference
                number.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push("/")}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Back to Events
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        {renderContent()}
      </div>
    </div>
  );
}
