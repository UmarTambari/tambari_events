"use client";

import { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MonthlyRevenueData } from "@/lib/types/dashboard.type";

export function RevenueChart() {
  const [data, setData] = useState<MonthlyRevenueData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRevenueData() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/dashboard/revenue`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch revenue data");
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error("API returned unsuccessful response");
        }

        setData(result.data);
      } catch (err) {
        console.error("Failed to fetch revenue data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRevenueData();
  }, []);

  if (isLoading) {
    return (
      <Card className="bg-white border-dash-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-dash-ink">
            Revenue Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] flex items-center justify-center">
            <div className="animate-pulse text-dash-accent">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white border-dash-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-dash-ink">
            Revenue Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] flex items-center justify-center">
            <div className="text-red-600 text-sm">
              Failed to load revenue data
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-dash-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-dash-ink">
          Revenue Overview
        </CardTitle>
        <p className="text-sm text-dash-muted">
          Monthly revenue for the past year
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--dash-accent)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--dash-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--dash-accent)"
              opacity={0.1}
            />
            <XAxis
              dataKey="month"
              stroke="var(--dash-accent-strong)"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              stroke="var(--dash-accent-strong)"
              style={{ fontSize: "12px" }}
              tickFormatter={(value: number) =>
                `₦${(value / 100 / 1000).toFixed(0)}k`
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--dash-highlight)",
                border: "1px solid var(--dash-accent)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number) => {
                return `₦${(value / 100).toLocaleString()}`;
              }}
              labelFormatter={(label) => `Month: ${label}`}
              labelStyle={{ color: "var(--dash-ink)", fontWeight: "bold" }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--dash-accent-strong)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
