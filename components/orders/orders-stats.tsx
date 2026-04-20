import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { OrderStatus } from "@/lib/types/order.type";

interface OrdersStatsProps {
  orders: Array<{
    id: string;
    status: OrderStatus;
    totalAmount: number;
    createdAt: Date;
  }>;
}

export function OrdersStats({ orders }: OrdersStatsProps) {
  const totalOrders = orders.length;
  const paidOrders = orders.filter((o) => o.status === "paid");
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const failedOrders = orders.filter((o) => o.status === "failed");

  const totalRevenue = paidOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );
  const averageOrderValue =
    paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

  // Calculate completion rate
  const completionRate =
    totalOrders > 0 ? (paidOrders.length / totalOrders) * 100 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card className="bg-white border-dash-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-dash-muted">Total Orders</p>
              <p className="text-2xl font-bold text-dash-ink mt-1">
                {totalOrders}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-dash-highlight flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-dash-muted" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-dash-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-dash-muted">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {paidOrders.length}
              </p>
              <p className="text-xs text-dash-accent mt-1">
                {completionRate.toFixed(1)}% success rate
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-dash-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-dash-muted">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {pendingOrders.length}
              </p>
              <p className="text-xs text-dash-accent mt-1">Awaiting payment</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-yellow-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-dash-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-dash-muted">Failed</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {failedOrders.length}
              </p>
              <p className="text-xs text-dash-accent mt-1">Payment declined</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-dash-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-dash-muted">Avg. Order Value</p>
              <p className="text-2xl font-bold text-dash-ink mt-1">
                ₦{(averageOrderValue / 100).toFixed(0)}
              </p>
              <p className="text-xs text-dash-accent mt-1">Per completed order</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-dash-highlight flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-dash-muted" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
