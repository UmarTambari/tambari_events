// components/profile/profile-stats-card.tsx
import { Calendar, ShoppingBag, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileStatsCardProps {
  totalEvents: number;
  totalOrders: number;
  totalRevenue: number;
}

export function ProfileStatsCard({
  totalEvents,
  totalOrders,
  totalRevenue,
}: ProfileStatsCardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-white border-dash-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-dash-muted">Total Events</p>
              <p className="text-2xl font-bold text-dash-ink mt-1">
                {totalEvents}
              </p>
              <p className="text-xs text-dash-accent mt-1">Events created</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-dash-highlight flex items-center justify-center">
              <Calendar className="h-5 w-5 text-dash-muted" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-dash-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-dash-muted">Total Orders</p>
              <p className="text-2xl font-bold text-dash-ink mt-1">
                {totalOrders}
              </p>
              <p className="text-xs text-dash-accent mt-1">Tickets sold</p>
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
              <p className="text-sm text-dash-muted">Total Revenue</p>
              <p className="text-2xl font-bold text-dash-ink mt-1">
                ₦{(totalRevenue / 100).toLocaleString()}
              </p>
              <p className="text-xs text-dash-accent mt-1">All time earnings</p>
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