import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import Image      from "next/image";
import Link       from "next/link";
import { format } from "date-fns";
import {
  CheckCircle,
  Calendar,
  MapPin,
  Clock,
  Ticket as TicketIcon,
  AlertCircle,
} from "lucide-react";

import {
  getOrderByNumber,
  getOrderWithDetails,
} from "@/lib/queries/order.queries";
import { getUserByAuthId }        from "@/lib/queries/users.queries";
import { DownloadTicketsButton }  from "@/components/public/download-tickets-button";
import { VerifyPaymentButton }    from "@/components/public/verify-payment-button";
import { PrintButton }            from "@/components/public/print-button";
import { AutoVerifyPayment }      from "@/components/public/auto-verify-payment";
import { TicketQRCode }           from "@/components/public/ticket-qr-code";


interface OrderPageProps {
  params: Promise<{
    orderNumber: string;
  }>;
}

export default async function OrderConfirmationPage({
  params,
}: OrderPageProps) {
  const { orderNumber } = await params;

  const supabase = await createClient();

  const {
    data: { user: supabaseUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !supabaseUser) {
    redirect(`/sign-in?redirect=/orders/${orderNumber}`);
  }

  const user = await getUserByAuthId(supabaseUser.id);
  if (!user) {
    redirect("/sign-in");
  }

  // Get order
  const orderBasic = await getOrderByNumber(orderNumber);
  if (!orderBasic) {
    notFound();
  }

  const order = await getOrderWithDetails(orderBasic.id);
  if (!order) {
    notFound();
  }

  // Verify order belongs to user
  if (order.userId !== user.id) {
    notFound();
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price / 100);
  };

  const isPaid = order.status === "paid";
  const isPending = order.status === "pending" || order.status === "processing";
  const isFailed = order.status === "failed";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {isPaid && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 flex items-start space-x-4">
            <CheckCircle className="h-8 w-8 text-green-600 shrink-0" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-green-900 mb-2">
                Payment Successful!
              </h1>
              <p className="text-green-700 mb-3">
                Your order has been confirmed and your tickets have been sent to{" "}
                <span className="font-semibold">{order.customerEmail}</span>
              </p>
              <p className="text-sm text-green-600">
                Order Number:{" "}
                <span className="font-mono font-semibold">
                  {order.orderNumber}
                </span>
              </p>
            </div>
          </div>
        )}
        {isPending && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8 flex items-start space-x-4">
            <AlertCircle className="h-8 w-8 text-yellow-600 shrink-0" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-yellow-900 mb-2">
                Payment Pending
              </h1>
              <p className="text-yellow-700 mb-3">
                We&apos;re waiting for payment confirmation. This usually takes
                a few seconds.
              </p>
              <p className="text-sm text-yellow-600">
                Order Number:{" "}
                <span className="font-mono font-semibold">
                  {order.orderNumber}
                </span>
              </p>
              <AutoVerifyPayment
                reference={order.transaction?.reference || ""}
                orderStatus={order.transaction?.status}
                intervalSeconds={5}
                maxRetries={24}
              />
            </div>
            <VerifyPaymentButton reference={order.transaction?.reference} />
          </div>
        )}
        {isFailed && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 flex items-start space-x-4">
            <AlertCircle className="h-8 w-8 text-red-600 shrink-0" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-red-900 mb-2">
                Payment Failed
              </h1>
              <p className="text-red-700 mb-3">
                Unfortunately, your payment could not be processed. Please try
                again.
              </p>
              <p className="text-sm text-red-600">
                Order Number:{" "}
                <span className="font-mono font-semibold">
                  {order.orderNumber}
                </span>
              </p>
            </div>
          </div>
        )}
        {/* Event Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex gap-4">
            {order.event?.thumbnailImageUrl && (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden shrink-0">
                <Image
                  src={order.event.thumbnailImageUrl}
                  alt={order.event.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {order.event?.title}
              </h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span>
                    {order.event?.eventDate &&
                      format(
                        new Date(order.event.eventDate),
                        "EEEE, MMMM dd, yyyy",
                      )}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  <span>
                    {order.event?.eventDate &&
                      format(new Date(order.event.eventDate), "h:mm a")}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  <span>
                    {order.event?.venue}, {order.event?.location}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Order Summary
          </h3>

          <div className="space-y-3 mb-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
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

          <div className="space-y-2 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">
                {formatPrice(order.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service Fee</span>
              <span className="font-semibold">
                {formatPrice(order.serviceFee)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span>Total Paid</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
        {/* Tickets */}
        {isPaid && order.attendees && order.attendees.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Your Tickets</h3>
              <div className="flex gap-2">
                <DownloadTicketsButton orderNumber={order.orderNumber} />
                <PrintButton />
              </div>
            </div>

            <div className="space-y-4">
              {order.attendees.map((attendee) => (
                <div
                  key={attendee.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <TicketIcon className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {attendee.firstName} {attendee.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {attendee.email}
                          </p>
                        </div>
                      </div>

                      {/* Ticket type */}
                      <p className="text-sm text-gray-500 mb-2">
                        {attendee.ticketTypeName}
                      </p>

                      {/* Ticket code */}
                      <div className="bg-gray-50 rounded px-3 py-2 inline-block">
                        <p className="text-xs text-gray-500 mb-1">
                          Ticket Code
                        </p>
                        <p className="font-mono font-bold text-gray-900">
                          {attendee.ticketCode}
                        </p>
                      </div>
                    </div>

                    {/* QR Code — rendered from the stored data string */}
                    {attendee.qrCodeUrl && (
                      <div className="ml-4 flex flex-col items-center gap-1">
                        <TicketQRCode value={attendee.qrCodeUrl} size={100} />
                        <p className="text-xs text-gray-400">
                          Scan at entrance
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Important:</strong> Present your QR code or ticket code
                at the event entrance for check-in. Download your tickets as a
                PDF to save them offline.
              </p>
            </div>
          </div>
        )}
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={`/events/${order.event?.slug}`}
            className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
          >
            View Event Details
          </Link>
          <Link
            href="/events"
            className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
          >
            Browse More Events
          </Link>
        </div>
      </div>
    </div>
  );
}