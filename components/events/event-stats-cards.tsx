import { Users, TrendingUp, Ticket, Eye } from "lucide-react";

interface EventStatsCardsProps {
  event: {
    totalTicketsSold: number;
    totalRevenue: number;
    totalOrders: number;
    totalCapacity: number | null;
  };
}

export function EventStatsCards({ event }: EventStatsCardsProps) {
  const soldPercentage = event.totalCapacity
    ? (event.totalTicketsSold / event.totalCapacity) * 100
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <div className="bg-white rounded-lg border border-[#85A947]/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#3E7B27]">Tickets Sold</p>
            <p className="text-2xl font-bold text-[#123524] mt-1">
              {event.totalTicketsSold}
            </p>
            <p className="text-xs text-[#85A947] mt-1">
              of {event.totalCapacity} ({soldPercentage.toFixed(0)}%)
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-[#EFE3C2] flex items-center justify-center">
            <Ticket className="h-6 w-6 text-[#3E7B27]" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#85A947]/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#3E7B27]">Total Revenue</p>
            <p className="text-2xl font-bold text-[#123524] mt-1">
              ₦{(event.totalRevenue / 100).toLocaleString()}
            </p>
            <p className="text-xs text-[#85A947] mt-1">
              Avg: ₦
              {event.totalTicketsSold > 0
                ? (event.totalRevenue / event.totalTicketsSold / 100).toFixed(0)
                : 0}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-[#EFE3C2] flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-[#3E7B27]" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#85A947]/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#3E7B27]">Total Orders</p>
            <p className="text-2xl font-bold text-[#123524] mt-1">
              {event.totalOrders}
            </p>
            <p className="text-xs text-[#85A947] mt-1">
              Avg:{" "}
              {event.totalOrders > 0
                ? (event.totalTicketsSold / event.totalOrders).toFixed(1)
                : 0}{" "}
              tickets/order
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-[#EFE3C2] flex items-center justify-center">
            <Users className="h-6 w-6 text-[#3E7B27]" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#85A947]/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#3E7B27]">Page Views</p>
            <p className="text-2xl font-bold text-[#123524] mt-1">1,247</p>
            <p className="text-xs text-[#85A947] mt-1">
              {event.totalTicketsSold > 0
                ? ((event.totalTicketsSold / 1247) * 100).toFixed(1)
                : 0}
              % conversion
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-[#EFE3C2] flex items-center justify-center">
            <Eye className="h-6 w-6 text-[#3E7B27]" />
          </div>
        </div>
      </div>
    </div>
  );
}
