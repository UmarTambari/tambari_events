"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Ticket as TicketIcon } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { TicketType } from "@/lib/types/ticketTypes.type";

interface TicketSelectorProps {
  eventId: string;
  tickets: TicketType[];
}

interface SelectedTicket {
  ticketTypeId: string;
  quantity: number;
  name: string;
  price: number;
}

export function TicketSelector({ eventId, tickets }: TicketSelectorProps) {
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<Map<string, SelectedTicket>>(
    new Map()
  );

  // Check auth status with Supabase
  useEffect(() => {
    const supabase = createClient();

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsSignedIn(!!session?.user);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price / 100);
  };

  const getAvailableTickets = (ticket: TicketType) => {
    return ticket.quantity - ticket.quantitySold;
  };

  const isTicketAvailable = (ticket: TicketType) => {
    if (!ticket.isActive) return false;
    if (getAvailableTickets(ticket) <= 0) return false;

    // Check sale dates
    const now = new Date();
    if (ticket.saleStartDate && new Date(ticket.saleStartDate) > now) return false;
    if (ticket.saleEndDate && new Date(ticket.saleEndDate) < now) return false;

    return true;
  };

  const updateQuantity = (ticket: TicketType, change: number) => {
    const newMap = new Map(selectedTickets);
    const current = newMap.get(ticket.id);
    const currentQty = current?.quantity || 0;
    const newQty = currentQty + change;

    // Validation
    if (newQty < 0) return;
    if (newQty > ticket.maxPurchase) {
      toast.error(`Maximum ${ticket.maxPurchase} tickets per purchase`);
      return;
    }
    if (newQty > getAvailableTickets(ticket)) {
      toast.error("Not enough tickets available");
      return;
    }
    if (newQty === 0) {
      newMap.delete(ticket.id);
    } else if (newQty >= ticket.minPurchase || newQty === 0) {
      newMap.set(ticket.id, {
        ticketTypeId: ticket.id,
        quantity: newQty,
        name: ticket.name,
        price: ticket.price,
      });
    } else if (newQty < ticket.minPurchase && newQty > 0) {
      toast.error(`Minimum ${ticket.minPurchase} tickets required`);
      return;
    }

    setSelectedTickets(newMap);
  };

  const calculateSubtotal = () => {
    let total = 0;
    selectedTickets.forEach((ticket) => {
      total += ticket.price * ticket.quantity;
    });
    return total;
  };

  const calculateServiceFee = (subtotal: number) => {
    // 2.5% service fee, subject to change
    return Math.round(subtotal * 0.025);
  };

  const handleCheckout = async () => {
    if (selectedTickets.size === 0) {
      toast.error("Please select at least one ticket");
      return;
    }

    if (!isSignedIn) {
      toast.error("Please sign in to continue");
      router.push(`/login?redirect=/events/${eventId}`);
      return;
    }

    setIsProcessing(true);

    try {
      // Create order via API
      const orderData = {
        eventId,
        items: Array.from(selectedTickets.values()),
      };

      const response = await fetch("/api/public/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${await createClient().auth.getSession().then(({ data: { session } }) => session?.access_token)}` },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create order");
      }

      const { order } = await response.json();

      // Redirect to checkout
      router.push(`/checkout/${order.id}`);
      toast.success("Order created! Proceeding to checkout...");
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create order");
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotal = calculateSubtotal();
  const serviceFee = calculateServiceFee(subtotal);
  const total = subtotal + serviceFee;
  const totalTickets = Array.from(selectedTickets.values()).reduce(
    (sum, ticket) => sum + ticket.quantity,
    0
  );

  const activeTickets = tickets.filter((t) => t.isActive);

  if (activeTickets.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
        <TicketIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Tickets Available
        </h3>
        <p className="text-gray-600 text-sm">
          Tickets are not currently on sale for this event
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden lg:sticky lg:top-24">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Select Tickets</h2>
      </div>

      <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
        {activeTickets.map((ticket) => {
          const available = getAvailableTickets(ticket);
          const isAvailable = isTicketAvailable(ticket);
          const selected = selectedTickets.get(ticket.id);

          return (
            <div
              key={ticket.id}
              className={`border rounded-lg p-4 transition-all ${
                selected ? "border-blue-500 bg-blue-50" : "border-gray-200"
              } ${!isAvailable ? "opacity-60" : ""}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{ticket.name}</h3>
                  {ticket.description && (
                    <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {available} tickets available
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xl font-bold text-gray-900">
                    {formatPrice(ticket.price)}
                  </p>
                </div>
              </div>

              {isAvailable ? (
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-600">
                    Min: {ticket.minPurchase} | Max: {ticket.maxPurchase}
                  </span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(ticket, -1)}
                      disabled={!selected}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">
                      {selected?.quantity || 0}
                    </span>
                    <button
                      onClick={() => updateQuantity(ticket, 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                    Sold Out
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedTickets.size > 0 && (
        <div className="p-6 border-t border-gray-200 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal ({totalTickets} tickets)</span>
            <span className="font-semibold">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Service Fee (2.5%)</span>
            <span className="font-semibold">{formatPrice(serviceFee)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isProcessing}
            className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : "Proceed to Checkout"}
          </button>
        </div>
      )}
    </div>
  );
}