"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { User } from "@/lib/types/user.type";
import { Order } from "@/lib/types/order.type";
import { OrderItem } from "@/lib/types/orderItem.type";

const attendeeSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.email("Invalid email address"),
  phoneNumber: z.string().optional(),
});

const checkoutSchema = z.object({
  attendees: z.array(attendeeSchema),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  order: Order;
  user: User;
}

export function CheckoutForm({ order, user }: CheckoutFormProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate total number of attendees
  const totalAttendees = order.items.reduce(
    (sum: number, item: OrderItem) => sum + item.quantity,
    0
  );

  // Initialize form with default values (buyer info for first attendee)
  const defaultAttendees = Array.from({ length: totalAttendees }, (_, index) => ({
    firstName: index === 0 ? user.fullName.split(" ")[0] : "",
    lastName: index === 0 ? user.fullName.split(" ").slice(1).join(" ") : "",
    email: index === 0 ? user.email : "",
    phoneNumber: index === 0 ? user.phoneNumber || "" : "",
  }));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      attendees: defaultAttendees,
    },
  });

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);

    try {
      // Initialize payment
      await toast.promise(
        (async () => {
          const response = await fetch("/api/payments/initialize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: order.id,
              attendees: data.attendees,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Payment initialization failed");
          }

          const { authorizationUrl, reference } = await response.json();

          // Redirect to Paystack
          window.location.href = authorizationUrl;
        })(),
        {
          loading: "Initializing payment...",
          success: "Redirecting to payment...",
          error: "Failed to initialize payment",
        }
      );
    } catch (error) {
      // Handle any additional errors if needed
      console.error("Payment error:", error);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Attendee Information */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Attendee Information
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Please provide details for each attendee. The first attendee is
          assumed to be you (the buyer).
        </p>

        <div className="space-y-6">
          {Array.from({ length: totalAttendees }).map((_, index) => (
            <div
              key={index}
              className="pb-6 border-b border-gray-200 last:border-0 last:pb-0"
            >
              <h3 className="font-semibold text-gray-900 mb-4">
                Attendee {index + 1} {index === 0 && "(You)"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    {...register(`attendees.${index}.firstName`)}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.attendees?.[index]?.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.attendees[index]?.firstName?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    {...register(`attendees.${index}.lastName`)}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.attendees?.[index]?.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.attendees[index]?.lastName?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    {...register(`attendees.${index}.email`)}
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.attendees?.[index]?.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.attendees[index]?.email?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    {...register(`attendees.${index}.phoneNumber`)}
                    type="tel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isProcessing}
        className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <span>Proceed to Payment</span>
        )}
      </button>
    </form>
  );
}