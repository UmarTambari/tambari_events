import { redirect, notFound } from "next/navigation";
import { createClient }       from "@/lib/supabase/server";

import { getOrderWithDetails } from "@/lib/queries/order.queries";
import { getUserByAuthId }     from "@/lib/queries/users.queries";
import { CheckoutForm }        from "@/components/public/checkout-form";
import { ShieldCheck, CreditCard } from "lucide-react";
import Image      from "next/image";
import { format } from "date-fns";

interface CheckoutPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { orderId } = await params;

  // Create Supabase server client (with cookies)
  const supabase = await createClient();

  // Get authenticated user
  const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !supabaseUser) {
    redirect(`/sign-in?redirect=/checkout/${orderId}`);
  }

  // Get user from your database
  const user = await getUserByAuthId(supabaseUser.id);
  if (!user) {
    redirect("/sign-in");
  }

  // Get order with details
  const orderData = await getOrderWithDetails(orderId);

  if (!orderData) {
    notFound();
  }

  // Verify order belongs to user
  if (orderData.userId !== user.id) {
    notFound();
  }

  // If order is already paid, redirect to order confirmation
  if (orderData.status === "paid") {
    redirect(`/orders/${orderData.orderNumber}`);
  }

  // If order is cancelled or failed, show error
  if (orderData.status === "cancelled" || orderData.status === "failed") {
    redirect("/events");
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price / 100);
  };

  const totalTickets = orderData.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your ticket purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Event Details
              </h2>
              <div className="flex gap-4">
                {orderData.event?.thumbnailImageUrl && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={orderData.event.thumbnailImageUrl}
                      alt={orderData.event.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {orderData.event?.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    {orderData.event?.eventDate &&
                      format(
                        new Date(orderData.event.eventDate),
                        "EEEE, MMMM dd, yyyy 'at' h:mm a"
                      )}
                  </p>
                  <p className="text-sm text-gray-600">
                    {orderData.event?.venue}, {orderData.event?.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Tickets */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Your Tickets
              </h2>
              <div className="space-y-3">
                {orderData.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.ticketTypeName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatPrice(item.pricePerTicket)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkout Form */}
            <CheckoutForm order={orderData} user={user} />

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
              <ShieldCheck className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 mb-1">
                  Secure Payment
                </p>
                <p className="text-sm text-blue-700">
                  Your payment is processed securely by Paystack. We never store
                  your card details.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Tickets ({totalTickets})
                  </span>
                  <span className="font-semibold">
                    {formatPrice(orderData.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-semibold">
                    {formatPrice(orderData.serviceFee)}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(orderData.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CreditCard className="h-4 w-4" />
                  <span>Powered by Paystack</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}