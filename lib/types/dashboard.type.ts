import { z } from "zod";

export interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  totalOrders: number;
  totalRevenue: number;
  totalTicketsSold: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

export interface MonthlyRevenueData {
  month: string;
  year: number;
  revenue: number;
}

export interface DashboardStatsApiResponse {
  success: boolean;
  data: DashboardStats;
}

export interface MonthlyRevenueApiResponse {
  success: boolean;
  data: MonthlyRevenueData[];
}

export const dashboardStatsSchema = z.object({
  totalEvents: z.number().int().min(0),
  activeEvents: z.number().int().min(0),
  totalOrders: z.number().int().min(0),
  totalRevenue: z.number().int().min(0),
  totalTicketsSold: z.number().int().min(0),
  revenueGrowth: z.number(),
  ordersGrowth: z.number(),
});

export const monthlyRevenueSchema = z.object({
  month: z.string(),
  year: z.number().int(),
  revenue: z.number().int().min(0),
});