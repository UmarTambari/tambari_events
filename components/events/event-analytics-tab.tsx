"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface EventAnalyticsTabProps {
  eventId: string;
}

interface TicketTypeData {
  name: string;
  value: number;
  revenue: number;
}

interface SalesData {
  date: string;
  tickets: number;
  revenue: number;
}

const COLORS = [
  "var(--dash-accent)",
  "var(--dash-accent-strong)",
  "var(--dash-sidebar)",
  "var(--dash-highlight)",
];

export function EventAnalyticsTab({ eventId }: EventAnalyticsTabProps) {
  const [ticketTypeData, setTicketTypeData] = useState<TicketTypeData[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        // Fetch ticket types
        const ticketsResponse = await fetch(`/api/dashboard/events/${eventId}/tickets`);
        const ticketsResult = await ticketsResponse.json();

        if (ticketsResult.success) {
          const ticketTypes = ticketsResult.data.map((ticket: {
            name: string;
            quantitySold: number;
            price: number;
          }) => ({
            name: ticket.name,
            value: ticket.quantitySold,
            revenue: ticket.quantitySold * ticket.price,
          }));
          setTicketTypeData(ticketTypes);
        }

        // TODO: Fetch sales over time data from API
        // For now using placeholder - you can add a dedicated analytics endpoint
        const placeholderSales = [
          { date: "Week 1", tickets: 12, revenue: 120000 },
          { date: "Week 2", tickets: 28, revenue: 280000 },
          { date: "Week 3", tickets: 45, revenue: 450000 },
          { date: "Week 4", tickets: 67, revenue: 670000 },
        ];
        setSalesData(placeholderSales);
      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalyticsData();
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-dash-accent">Loading analytics...</div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Sales Over Time */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white border-dash-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-dash-ink">
              Ticket Sales Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--dash-accent)"
                    opacity={0.1}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="var(--dash-accent-strong)"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="var(--dash-accent-strong)" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--dash-highlight)",
                      border: "1px solid var(--dash-accent)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tickets"
                    stroke="var(--dash-accent-strong)"
                    strokeWidth={2}
                    dot={{ fill: "var(--dash-accent-strong)", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-dash-accent">
                No sales data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-dash-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-dash-ink">
              Revenue Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--dash-accent)"
                    opacity={0.1}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="var(--dash-accent-strong)"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    stroke="var(--dash-accent-strong)"
                    style={{ fontSize: "12px" }}
                    tickFormatter={(value) =>
                      `₦${(value / 100000).toFixed(0)}k`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--dash-highlight)",
                      border: "1px solid var(--dash-accent)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [
                      `₦${(value / 100).toLocaleString()}`,
                      "Revenue",
                    ]}
                  />
                  <Bar dataKey="revenue" fill="var(--dash-accent)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-dash-accent">
                No revenue data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ticket Type Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white border-dash-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-dash-ink">
              Ticket Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ticketTypeData.length > 0 &&
            ticketTypeData.some((t) => t.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ticketTypeData.filter((t) => t.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ticketTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--dash-highlight)",
                      border: "1px solid var(--dash-accent)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-dash-accent">
                No ticket sales yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-dash-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-dash-ink">
              Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-dash-accent">
              Traffic analytics coming soon
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card className="bg-white border-dash-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-dash-ink">
            Revenue by Ticket Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ticketTypeData.length > 0 &&
          ticketTypeData.some((t) => t.revenue > 0) ? (
            <div className="space-y-4">
              {ticketTypeData
                .filter((t) => t.revenue > 0)
                .map((ticket, index) => {
                  const totalRevenue = ticketTypeData.reduce(
                    (sum, t) => sum + t.revenue,
                    0
                  );
                  const percentage =
                    totalRevenue > 0
                      ? (ticket.revenue / totalRevenue) * 100
                      : 0;

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-dash-ink">
                          {ticket.name}
                        </span>
                        <span className="text-dash-muted">
                          ₦{(ticket.revenue / 100).toLocaleString()} (
                          {percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-dash-highlight rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                      </div>
                      <p className="text-xs text-dash-accent">
                        {ticket.value} tickets sold
                      </p>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8 text-dash-accent">
              No revenue data yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
