import { Suspense }   from "react";
import { Calendar, Users, ShoppingBag, TrendingUp } from "lucide-react";
import { StatsCard }        from "@/components/dashboard/stats-card";
import { RecentOrders }     from "@/components/dashboard/recent-orders";
import { UpcomingEvents }   from "@/components/dashboard/upcoming-events";
import { RevenueChart }     from "@/components/dashboard/revenue-chart";
import {
  getDashboardStats,
  getRevenueGrowth,
  getOrdersGrowth,
}                           from "@/lib/queries/dashboard.queries";
import { getCurrentUserId } from "@/lib/auth";

async function getDashboardData() {
  const organizerId = await getCurrentUserId();

  const [stats, revenueGrowth, ordersGrowth] = await Promise.all([
    getDashboardStats(organizerId),
    getRevenueGrowth(organizerId),
    getOrdersGrowth(organizerId),
  ]);

  return {
    ...stats,
    revenueGrowth,
    ordersGrowth,
  };
}

export default async function DashboardPage() {
  const stats = await getDashboardData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#123524]">Dashboard</h1>
        <p className="text-[#3E7B27] mt-1">
          Welcome back! Here&apos;s what&apos;s happening with your events.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Events"
          value={stats.totalEvents.toString()}
          description={`${stats.activeEvents} active`}
          icon={Calendar}
          trend={null}
        />
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders.toString()}
          description={`${
            stats.ordersGrowth > 0 ? "+" : ""
          }${stats.ordersGrowth.toFixed(1)}% from last month`}
          icon={ShoppingBag}
          trend={stats.ordersGrowth}
        />
        <StatsCard
          title="Revenue"
          value={`₦${(stats.totalRevenue / 100).toLocaleString()}`}
          description={`${
            stats.revenueGrowth > 0 ? "+" : ""
          }${stats.revenueGrowth.toFixed(1)}% from last month`}
          icon={TrendingUp}
          trend={stats.revenueGrowth}
        />
        <StatsCard
          title="Total Attendees"
          value={stats.totalTicketsSold.toString()}
          description="Across all events"
          icon={Users}
          trend={null}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense
          fallback={
            <div className="h-[350px] bg-white rounded-lg animate-pulse" />
          }
        >
          <RevenueChart />
        </Suspense>

        <Suspense
          fallback={
            <div className="h-[350px] bg-white rounded-lg animate-pulse" />
          }
        >
          <UpcomingEvents />
        </Suspense>
      </div>

      <Suspense
        fallback={
          <div className="h-[400px] bg-white rounded-lg animate-pulse" />
        }
      >
        <RecentOrders />
      </Suspense>
    </div>
  );
}
