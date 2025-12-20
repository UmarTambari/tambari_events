"use client";

import Link from "next/link";
import { ExternalLink, MoreVertical, Mail, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types/order.type";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  eventTitle: string;
  eventSlug: string;
  totalAmount: number;
  status: OrderStatus;
  ticketCount: number;
  createdAt: Date;
  paidAt: Date | null;
}

interface OrdersTableProps {
  orders: Order[];
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> =
  {
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

export function OrdersTable({ orders }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <Card className="bg-white border-[#85A947]/20">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-[#3E7B27] mb-2">No orders found</p>
          <p className="text-sm text-[#85A947]">
            Orders will appear here once customers start purchasing tickets
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-[#85A947]/20">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#EFE3C2] hover:bg-[#EFE3C2]">
                <TableHead className="text-[#123524] font-semibold">
                  Order Details
                </TableHead>
                <TableHead className="text-[#123524] font-semibold">
                  Customer
                </TableHead>
                <TableHead className="text-[#123524] font-semibold">
                  Event
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
                    <div>
                      <p className="font-mono text-sm font-medium text-[#123524]">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-[#85A947] mt-0.5">
                        {order.ticketCount} ticket
                        {order.ticketCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium text-[#123524]">
                        {order.customerName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-3 w-3 text-[#85A947]" />
                        <p className="text-xs text-[#3E7B27] truncate max-w-[200px]">
                          {order.customerEmail}
                        </p>
                      </div>
                      {order.customerPhone && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <Phone className="h-3 w-3 text-[#85A947]" />
                          <p className="text-xs text-[#3E7B27]">
                            {order.customerPhone}
                          </p>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Link
                      href={`/dashboard/events/${order.eventSlug}`}
                      className="text-sm text-[#3E7B27] hover:text-[#123524] hover:underline line-clamp-2"
                    >
                      {order.eventTitle}
                    </Link>
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
                    <div className="text-sm">
                      <p className="text-[#123524]">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-[#85A947]">
                        {new Date(order.createdAt).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dashboard/orders/${order.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#3E7B27]"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[#3E7B27]"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/orders/${order.id}`}>
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Send Receipt</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {order.status === "paid" && (
                            <DropdownMenuItem className="text-red-600">
                              Issue Refund
                            </DropdownMenuItem>
                          )}
                          {order.status === "pending" && (
                            <DropdownMenuItem className="text-red-600">
                              Cancel Order
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
