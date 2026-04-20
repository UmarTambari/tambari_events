import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getOrdersByOrganizer } from "@/lib/queries/order.queries";
import type { OrderStatus } from "@/lib/types/order.type";

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

interface RecentOrdersProps {
  organizerId: string;
}

export async function RecentOrders({ organizerId }: RecentOrdersProps) {
  const ordersData = await getOrdersByOrganizer(organizerId);

  const recentOrders = ordersData.slice(0, 5).map((item) => ({
    ...item.order,
    eventTitle: item.event.title,
    eventSlug: item.event.slug,
  }));

  if (recentOrders.length === 0) {
    return (
      <Card className="bg-white border-dash-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-dash-ink">
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-dash-accent">No orders yet</p>
            <p className="text-sm text-dash-muted mt-1">
              Orders will appear here once customers start purchasing tickets
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-dash-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-dash-ink">
          Recent Orders
        </CardTitle>
        <Link href="/dashboard/orders">
          <Button
            variant="ghost"
            size="sm"
            className="text-dash-muted hover:text-dash-ink"
          >
            View all
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 rounded-lg border border-dash-border hover:bg-dash-highlight/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-dash-ink truncate">
                    {order.orderNumber}
                  </p>
                  <Badge
                    className={cn(
                      "text-xs",
                      statusConfig[order.status].className
                    )}
                  >
                    {statusConfig[order.status].label}
                  </Badge>
                </div>
                <p className="text-sm text-dash-muted truncate">
                  {order.customerName}
                </p>
                <p className="text-xs text-dash-accent mt-0.5 truncate">
                  {order.eventTitle}
                </p>
              </div>
              <div className="flex items-center gap-4 ml-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-dash-ink">
                    ₦{(order.totalAmount / 100).toLocaleString()}
                  </p>
                  <p className="text-xs text-dash-accent">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Link href={`/dashboard/orders/${order.id}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ExternalLink className="h-4 w-4 text-dash-muted" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
