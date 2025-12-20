import { Suspense } from "react";
import { Search, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrdersTable } from "@/components/orders/orders-table";
import { OrdersStats } from "@/components/orders/orders-stats";
import { getOrdersByOrganizer } from "@/lib/queries/order.queries";
import { getCurrentUserId } from "@/lib/auth";
import type { Order } from "@/lib/types/order.type";

interface OrderDisplay extends Order {
  eventTitle: string;
  eventSlug: string;
  ticketCount: number;
}

async function getOrganizerOrders(): Promise<OrderDisplay[]> {
  const organizerId = await getCurrentUserId();
  const ordersData = await getOrdersByOrganizer(organizerId);

  // Transform to include event details and ticket count
  const orders: OrderDisplay[] = ordersData.map((item) => ({
    ...item.order,
    eventTitle: item.event.title,
    eventSlug: item.event.slug,
    ticketCount: item.items?.length || 0, // Assuming items array exists in your query
  }));

  return orders;
}

export default async function OrdersPage() {
  const allOrders = await getOrganizerOrders();

  const paidOrders = allOrders.filter((o) => o.status === "paid");
  const pendingOrders = allOrders.filter((o) => o.status === "pending");
  const failedOrders = allOrders.filter((o) => o.status === "failed");
  const refundedOrders = allOrders.filter((o) => o.status === "refunded");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#123524]">Orders</h1>
          <p className="text-[#3E7B27] mt-1">
            Manage and track all customer orders
          </p>
        </div>
        <Button
          variant="outline"
          className="border-[#85A947] text-[#3E7B27] hover:bg-[#EFE3C2]"
        >
          <Download className="mr-2 h-4 w-4" />
          Export Orders
        </Button>
      </div>

      {/* Stats */}
      <Suspense
        fallback={<div className="h-32 animate-pulse bg-white rounded-lg" />}
      >
        <OrdersStats orders={allOrders} />
      </Suspense>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#85A947]" />
          <Input
            placeholder="Search by order number, customer name, or email..."
            className="pl-10 bg-white border-[#85A947]/20 focus:border-[#3E7B27]"
          />
        </div>
        <Button
          variant="outline"
          className="border-[#85A947] text-[#3E7B27] hover:bg-[#EFE3C2]"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Orders Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-white border border-[#85A947]/20">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-[#85A947] data-[state=active]:text-white"
          >
            All Orders ({allOrders.length})
          </TabsTrigger>
          <TabsTrigger
            value="paid"
            className="data-[state=active]:bg-[#85A947] data-[state=active]:text-white"
          >
            Paid ({paidOrders.length})
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-[#85A947] data-[state=active]:text-white"
          >
            Pending ({pendingOrders.length})
          </TabsTrigger>
          <TabsTrigger
            value="failed"
            className="data-[state=active]:bg-[#85A947] data-[state=active]:text-white"
          >
            Failed ({failedOrders.length})
          </TabsTrigger>
          <TabsTrigger
            value="refunded"
            className="data-[state=active]:bg-[#85A947] data-[state=active]:text-white"
          >
            Refunded ({refundedOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <OrdersTable orders={allOrders} />
        </TabsContent>

        <TabsContent value="paid">
          <OrdersTable orders={paidOrders} />
        </TabsContent>

        <TabsContent value="pending">
          <OrdersTable orders={pendingOrders} />
        </TabsContent>

        <TabsContent value="failed">
          <OrdersTable orders={failedOrders} />
        </TabsContent>

        <TabsContent value="refunded">
          <OrdersTable orders={refundedOrders} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
