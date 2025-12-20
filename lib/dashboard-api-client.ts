import type { ApiResponse, PaginatedResponse } from "@/lib/types";
import type {
  TicketType,
  CreateTicketType,
  UpdateTicketType,
} from "@/lib/types/ticketTypes.types";
import { CreateEvent, Event, UpdateEvent } from "./types/event.type";
import { Order } from "./types/order.type";
import { Attendee } from "./types/attendee.type";
import { DashboardStats } from "./types";
import { User as UserProfile } from "./types/user.type";

class DashboardApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "/api/dashboard") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "An error occurred",
        };
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        error: "Network error occurred",
      };
    }
  }

  async getEvents(): Promise<ApiResponse<Event[]>> {
    return this.request<Event[]>("/events");
  }

  async getEventBySlug(slug: string): Promise<ApiResponse<Event>> {
    return this.request<Event>(`/events/${slug}`);
  }

  async createEvent(data: CreateEvent): Promise<ApiResponse<Event>> {
    return this.request<Event>("/events", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateEvent(
    slug: string,
    data: UpdateEvent
  ): Promise<ApiResponse<Event>> {
    return this.request<Event>(`/events/${slug}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteEvent(slug: string): Promise<ApiResponse<null>> {
    return this.request<null>(`/events/${slug}`, {
      method: "DELETE",
    });
  }

  // Tickets
  async getEventTickets(slug: string): Promise<ApiResponse<TicketType[]>> {
    return this.request<TicketType[]>(`/events/${slug}/tickets`);
  }

  async createTicketType(
    slug: string,
    data: CreateTicketType
  ): Promise<ApiResponse<TicketType>> {
    return this.request<TicketType>(`/events/${slug}/tickets`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTicketType(ticketId: string, data: UpdateTicketType) {
    return this.request<TicketType>(`/tickets/${ticketId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteTicketType(ticketId: string): Promise<ApiResponse<null>> {
    return this.request(`/tickets/${ticketId}`, {
      method: "DELETE",
    });
  }

  // Orders
  async getOrders(params?: { status?: string; eventId?: string }) {
    const searchParams = new URLSearchParams(params as Record<string, string>);
    const queryString = searchParams.toString();
    return this.request<PaginatedResponse<Order>>(
      `/orders${queryString ? `?${queryString}` : ""}`
    );
  }

  async getOrderById(orderId: string): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/orders/${orderId}`);
  }

  // Attendees
  async getEventAttendees(slug: string): Promise<ApiResponse<Attendee[]>> {
    return this.request<Attendee[]>(`/events/${slug}/attendees`);
  }

  async checkInAttendee(ticketCode: string): Promise<ApiResponse<Attendee>> {
    return this.request<Attendee>("/checkin", {
      method: "POST",
      body: JSON.stringify({ ticketCode }),
    });
  }

  // Dashboard
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>("/stats");
  }

  // User
  async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>("/user/profile");
  }

  async updateUserProfile(
    data: Partial<UserProfile>
  ): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>("/user/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
}

export const dashboardApiClient = new DashboardApiClient();
