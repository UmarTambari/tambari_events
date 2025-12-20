// components/orders/order-detail-client.tsx
"use client";

import Link from "next/link";
import { ArrowLeft, Download, Mail, Printer, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderSummaryCard } from "./order-summary-card";
import { OrderItemsCard } from "./order-items-card";
import { CustomerInfoCard } from "./customer-info-card";
import { AttendeesCard } from "./attendees-card";
import { TransactionCard } from "./transaction-card";
import { cn } from "@/lib/utils";

interface OrderDetailClientProps {
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    eventId: string;
    eventTitle: string;
    eventSlug: string;
    eventDate: Date;
    eventVenue: string;
    eventLocation: string;
    subtotal: number;
    serviceFee: number;
    totalAmount: number;
    status: "paid" | "pending" | "failed" | "cancelled" | "refunded" | "processing";
    notes: string | null;
    createdAt: Date;
    paidAt: Date | null;
    items: Array<{
      id: string;
      ticketTypeName: string;
      pricePerTicket: number;
      quantity: number;
      subtotal: number;
    }>;
    attendees: Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      ticketTypeName: string;
      ticketCode: string;
      isCheckedIn: boolean;
      checkedInAt: Date | null;
    }>;
    transaction?: {
      id: string;
      reference: string;
      provider: string;
      amount: number;
      status: string;
      channel?: string;
      cardType?: string;
      lastFourDigits?: string;
      bank?: string;
      paidAt: Date | null;
    };
  };
}

const statusConfig = {
  paid: {
    label: "Paid",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  pending: {
    label: "Pending Payment",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  failed: {
    label: "Payment Failed",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  refunded: {
    label: "Refunded",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  processing: {
    label: "Processing",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
};

export function OrderDetailClient({ order }: OrderDetailClientProps) {
  const handlePrintReceipt = () => {
    window.print();
  };

  const handleSendReceipt = () => {
    // TODO: Implement send receipt functionality
    console.log("Sending receipt to:", order.customerEmail);
  };

  const handleIssueRefund = () => {
    // TODO: Implement refund functionality
    console.log("Issuing refund for order:", order.orderNumber);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/orders">
          <Button variant="ghost" size="sm" className="text-[#3E7B27] mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-[#123524]">
                {order.orderNumber}
              </h1>
              <Badge className={cn("text-sm", statusConfig[order.status].className)}>
                {statusConfig[order.status].label}
              </Badge>
            </div>
            <p className="text-[#3E7B27]">
              Placed on{" "}
              {order.createdAt.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintReceipt}
              className="border-[#85A947] text-[#3E7B27] hover:bg-[#EFE3C2]"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendReceipt}
              className="border-[#85A947] text-[#3E7B27] hover:bg-[#EFE3C2]"
            >
              <Mail className="mr-2 h-4 w-4" />
              Send Receipt
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-[#85A947] text-[#3E7B27] hover:bg-[#EFE3C2]"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            {order.status === "paid" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleIssueRefund}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Issue Refund
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <OrderItemsCard items={order.items} />
          <AttendeesCard attendees={order.attendees} />
          {order.transaction && <TransactionCard transaction={order.transaction} />}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <OrderSummaryCard
            subtotal={order.subtotal}
            serviceFee={order.serviceFee}
            totalAmount={order.totalAmount}
            paidAt={order.paidAt}
          />
          <CustomerInfoCard
            customerName={order.customerName}
            customerEmail={order.customerEmail}
            customerPhone={order.customerPhone}
            eventTitle={order.eventTitle}
            eventSlug={order.eventSlug}
            eventDate={order.eventDate}
            eventVenue={order.eventVenue}
            eventLocation={order.eventLocation}
            notes={order.notes}
          />
        </div>
      </div>
    </div>
  );
}