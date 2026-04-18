import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
  Ticket as TicketIcon,
  Calendar,
  MapPin,
  ChevronRight,
  Package
} from "lucide-react";

import { getUserByAuthId } from "@/lib/queries/users.queries";
import { getOrdersByUser } from "@/lib/queries/order.queries";
import { getEventById } from "@/lib/queries/events.queries";

export default async function MyTicketsPage() {

  const supabase = await createClient();

  // Get authenticated user
  const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !supabaseUser) {
    redirect("/sign-in?redirect=/my-tickets");
  }

  const user = await getUserByAuthId(supabaseUser.id);
  if (!user) {
    redirect("/sign-in");
  }

  // Get user's orders
  const orders = await getOrdersByUser(user.id);

  // Enhance orders with event details
  const ordersWithEvents = await Promise.all(
    orders.map(async (order) => {
      const event = await getEventById(order.eventId);
      return {
        ...order,
        event,
      };
    })
  );

  // Separate orders by status
  const upcomingOrders = ordersWithEvents
    .filter((order) => {
      return (
        order.status === "paid" &&
        order.event &&
        new Date(order.event.eventDate) > new Date()
      );
    })
    .sort((a, b) => {
      if (!a.event || !b.event) return 0;
      return (
        new Date(a.event.eventDate).getTime() -
        new Date(b.event.eventDate).getTime()
      );
    });

  const pastOrders = ordersWithEvents
    .filter((order) => {
      return (
        order.status === "paid" &&
        order.event &&
        new Date(order.event.eventDate) <= new Date()
      );
    })
    .sort((a, b) => {
      if (!a.event || !b.event) return 0;
      return (
        new Date(b.event.eventDate).getTime() -
        new Date(a.event.eventDate).getTime()
      );
    });

  const pendingOrders = ordersWithEvents.filter(
    (order) => order.status === "pending" || order.status === "processing"
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price / 100);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      paid: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      processing: "bg-blue-100 text-blue-700",
      failed: "bg-red-100 text-red-700",
      cancelled: "bg-gray-100 text-gray-700",
      refunded: "bg-purple-100 text-purple-700",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          styles[status as keyof typeof styles] || styles.pending
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const OrderCard = ({ order, isPast = false }: { order: any; isPast?: boolean }) => (
    <Link
      href={`/orders/${order.orderNumber}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 overflow-hidden group"
    >
      <div className="flex">
        {order.event?.thumbnailImageUrl && (
          <div className="relative w-32 h-32 shrink-0">
            <Image
              src={order.event.thumbnailImageUrl}
              alt={order.event.title}
              fill
              className="object-cover"
            />
            {isPast && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white text-xs font-semibold">PAST</span>
              </div>
            )}
          </div>
        )}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                {order.event?.title}
              </h3>
              {getStatusBadge(order.status)}
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors shrink-0 ml-2" />
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              <span>
                {order.event?.eventDate &&
                  format(
                    new Date(order.event.eventDate),
                    "MMM dd, yyyy • h:mm a"
                  )}
              </span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              <span>
                {order.event?.venue}, {order.event?.location}
              </span>
            </div>
            <div className="flex items-center">
              <TicketIcon className="h-4 w-4 mr-2 text-gray-400" />
              <span>Order #{order.orderNumber}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-900">
              Total: {formatPrice(order.totalAmount)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tickets</h1>
          <p className="text-gray-600">View and manage your event tickets</p>
        </div>

        {ordersWithEvents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Tickets Yet
            </h3>
            <p className="text-gray-600 mb-6">
              You haven&apos;t purchased any tickets yet. Start exploring events!
            </p>
            <Link
              href="/events"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pending Orders */}
            {pendingOrders.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Pending Payment
                </h2>
                <div className="space-y-4">
                  {pendingOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Events */}
            {upcomingOrders.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Upcoming Events ({upcomingOrders.length})
                </h2>
                <div className="space-y-4">
                  {upcomingOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              </div>
            )}

            {/* Past Events */}
            {pastOrders.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Past Events ({pastOrders.length})
                </h2>
                <div className="space-y-4">
                  {pastOrders.map((order) => (
                    <OrderCard key={order.id} order={order} isPast />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}