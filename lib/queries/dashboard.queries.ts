import { db } from "@/lib/db";
import { eq, and, sql, count, inArray } from "drizzle-orm";
import { ticketTypes, orders } from "@/lib/db/schema";
import { getEventsByOrganizer } from "./events.queries";

export async function getDashboardStats(organizerId: string) {
  const organizerEvents = await getEventsByOrganizer(organizerId);
  const eventIds = organizerEvents.map((e) => e.id);

  if (eventIds.length === 0) {
    return {
      totalEvents: 0,
      activeEvents: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalTicketsSold: 0,
    };
  }

  const [orderStats] = await db
    .select({
      totalOrders: count(),
      totalRevenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
    })
    .from(orders)
    .where(and(inArray(orders.eventId, eventIds), eq(orders.status, "paid")));

  const [ticketStats] = await db
    .select({
      totalTicketsSold: sql<number>`COALESCE(SUM(${ticketTypes.quantitySold}), 0)`,
    })
    .from(ticketTypes)
    .where(inArray(ticketTypes.eventId, eventIds));

  const activeEvents = organizerEvents.filter(
    (e) => e.isPublished && !e.isCancelled
  ).length;

  return {
    totalEvents: organizerEvents.length,
    activeEvents,
    totalOrders: orderStats?.totalOrders || 0,
    totalRevenue: Number(orderStats?.totalRevenue || 0),
    totalTicketsSold: Number(ticketStats?.totalTicketsSold || 0),
  };
}

export async function getMonthlyRevenue(
  organizerId: string,
  months: number = 12
) {
  const organizerEvents = await getEventsByOrganizer(organizerId);
  const eventIds = organizerEvents.map((e) => e.id);

  if (eventIds.length === 0) {
    // Return empty data for the last N months
    const data = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      data.push({
        month: date.toLocaleDateString("en-US", { month: "short" }),
        year: date.getFullYear(),
        revenue: 0,
      });
    }
    return data;
  }

  // Calculate date range - Convert to ISO strings for SQL
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  // Get orders grouped by month - FIXED: Use inArray and proper date handling
  const ordersData = await db
    .select({
      month: sql<number>`EXTRACT(MONTH FROM ${orders.paidAt})`,
      year: sql<number>`EXTRACT(YEAR FROM ${orders.paidAt})`,
      revenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
    })
    .from(orders)
    .where(
      and(
        inArray(orders.eventId, eventIds),
        eq(orders.status, "paid"),
        sql`${orders.paidAt} >= ${startDate.toISOString()}`,
        sql`${orders.paidAt} <= ${endDate.toISOString()}`
      )
    )
    .groupBy(
      sql`EXTRACT(MONTH FROM ${orders.paidAt})`,
      sql`EXTRACT(YEAR FROM ${orders.paidAt})`
    )
    .orderBy(
      sql`EXTRACT(YEAR FROM ${orders.paidAt})`,
      sql`EXTRACT(MONTH FROM ${orders.paidAt})`
    );

  // Create a map of the data
  const revenueMap = new Map(
    ordersData.map((item) => [
      `${item.year}-${item.month}`,
      Number(item.revenue),
    ])
  );

  // Fill in missing months with zero revenue
  const result = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const revenue = revenueMap.get(monthKey) || 0;

    result.push({
      month: date.toLocaleDateString("en-US", { month: "short" }),
      year: date.getFullYear(),
      revenue,
    });
  }

  return result;
}

// Get revenue growth percentage (comparing current month to previous month)
export async function getRevenueGrowth(organizerId: string) {
  const organizerEvents = await getEventsByOrganizer(organizerId);
  const eventIds = organizerEvents.map((e) => e.id);

  if (eventIds.length === 0) {
    return 0;
  }

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  // Get current month revenue - FIXED: Use inArray and ISO strings
  const [currentMonth] = await db
    .select({
      revenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
    })
    .from(orders)
    .where(
      and(
        inArray(orders.eventId, eventIds),
        eq(orders.status, "paid"),
        sql`${orders.paidAt} >= ${currentMonthStart.toISOString()}`
      )
    );

  // Get last month revenue - FIXED: Use inArray and ISO strings
  const [lastMonth] = await db
    .select({
      revenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
    })
    .from(orders)
    .where(
      and(
        inArray(orders.eventId, eventIds),
        eq(orders.status, "paid"),
        sql`${orders.paidAt} >= ${lastMonthStart.toISOString()}`,
        sql`${orders.paidAt} <= ${lastMonthEnd.toISOString()}`
      )
    );

  const currentRevenue = Number(currentMonth?.revenue || 0);
  const lastRevenue = Number(lastMonth?.revenue || 0);

  if (lastRevenue === 0) {
    return currentRevenue > 0 ? 100 : 0;
  }

  const growth = ((currentRevenue - lastRevenue) / lastRevenue) * 100;
  return Math.round(growth * 10) / 10; // Round to 1 decimal place
}

// Get orders growth percentage
export async function getOrdersGrowth(organizerId: string) {
  const organizerEvents = await getEventsByOrganizer(organizerId);
  const eventIds = organizerEvents.map((e) => e.id);

  if (eventIds.length === 0) {
    return 0;
  }

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  // Get current month orders - FIXED: Use inArray and ISO strings
  const [currentMonth] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(orders)
    .where(
      and(
        inArray(orders.eventId, eventIds),
        eq(orders.status, "paid"),
        sql`${orders.createdAt} >= ${currentMonthStart.toISOString()}`
      )
    );

  // Get last month orders - FIXED: Use inArray and ISO strings
  const [lastMonth] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(orders)
    .where(
      and(
        inArray(orders.eventId, eventIds),
        eq(orders.status, "paid"),
        sql`${orders.createdAt} >= ${lastMonthStart.toISOString()}`,
        sql`${orders.createdAt} <= ${lastMonthEnd.toISOString()}`
      )
    );

  const currentCount = Number(currentMonth?.count || 0);
  const lastCount = Number(lastMonth?.count || 0);

  if (lastCount === 0) {
    return currentCount > 0 ? 100 : 0;
  }

  const growth = ((currentCount - lastCount) / lastCount) * 100;
  return Math.round(growth * 10) / 10; // Round to 1 decimal place
}
