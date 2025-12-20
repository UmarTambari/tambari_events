"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status:
    | "paid"
    | "pending"
    | "failed"
    | "cancelled"
    | "refunded"
    | "processing";
  createdAt: Date | string;
}

interface EventOrdersTabProps {
  eventId: string;
}

const statusConfig = {
  paid: {
    label: "Paid",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  failed: {
    label: "Failed",
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

export function EventOrdersTab({ eventId }: EventOrdersTabProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch(`/api/events/${eventId}/orders`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#85A947]"></div>
      </div>
    );
  }

  const totalOrders = orders.length;
  const paidOrders = orders.filter((o) => o.status === "paid").length;
  const totalRevenue = orders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white border-[#85A947]/20">
          <CardContent className="p-4">
            <p className="text-sm text-[#3E7B27]">Total Orders</p>
            <p className="text-2xl font-bold text-[#123524] mt-1">
              {totalOrders}
            </p>
            <p className="text-xs text-[#85A947] mt-1">
              {paidOrders} completed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#85A947]/20">
          <CardContent className="p-4">
            <p className="text-sm text-[#3E7B27]">Total Revenue</p>
            <p className="text-2xl font-bold text-[#123524] mt-1">
              ₦{(totalRevenue / 100).toLocaleString()}
            </p>
            <p className="text-xs text-[#85A947] mt-1">From paid orders</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#85A947]/20">
          <CardContent className="p-4">
            <p className="text-sm text-[#3E7B27]">Average Order Value</p>
            <p className="text-2xl font-bold text-[#123524] mt-1">
              ₦
              {paidOrders > 0
                ? (totalRevenue / paidOrders / 100).toFixed(0)
                : 0}
            </p>
            <p className="text-xs text-[#85A947] mt-1">Per completed order</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-[#85A947]/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-[#123524]">
            All Orders
          </CardTitle>
          <Button
            variant="outline"
            className="border-[#85A947] text-[#3E7B27] hover:bg-[#EFE3C2]"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Orders
          </Button>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#85A947]">No orders yet</p>
              <p className="text-sm text-[#3E7B27] mt-1">
                Orders will appear here once customers purchase tickets
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-[#85A947]/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#EFE3C2] hover:bg-[#EFE3C2]">
                    <TableHead className="text-[#123524] font-semibold">
                      Order #
                    </TableHead>
                    <TableHead className="text-[#123524] font-semibold">
                      Customer
                    </TableHead>
                    <TableHead className="text-[#123524] font-semibold">
                      Amount
                    </TableHead>
                    <TableHead className="text-[#123524] font-semibold">
                      Status
                    </TableHead>
                    <TableHead className="text-[#123524] font-semibold">
                      Date
                    </TableHead>
                    <TableHead className="text-[#123524] font-semibold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <span className="font-mono text-sm text-[#123524]">
                          {order.orderNumber}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-[#123524]">
                            {order.customerName}
                          </p>
                          <p className="text-sm text-[#85A947]">
                            {order.customerEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-[#123524]">
                          ₦{(order.totalAmount / 100).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "text-xs",
                            statusConfig[order.status].className
                          )}
                        >
                          {statusConfig[order.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-[#3E7B27]">
                          <p>
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </p>
                          <p className="text-[#85A947]">
                            {new Date(order.createdAt).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "numeric",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end">
                          <Link href={`/dashboard/orders/${order.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-[#3E7B27]"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
