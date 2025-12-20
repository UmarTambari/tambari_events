// API REQUEST/RESPONSE TYPES
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  totalOrders: number;
  totalRevenue: number;
  totalTicketsSold: number;
  revenueGrowth?: number;
  ordersGrowth?: number;
}

// UTILITY TYPES
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export interface FileUpload {
  file: File;
  preview: string;
  type: "banner" | "thumbnail";
}
