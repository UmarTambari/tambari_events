import Link from "next/link";
import { ArrowRight, Calendar, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button }               from "@/components/ui/button";
import { Badge }                from "@/components/ui/badge";
import { db }                   from "@/lib/db";
import { eq, sql }              from "drizzle-orm";
import { getCurrentUserId }     from "@/lib/auth";
import { ticketTypes }          from "@/lib/db/schema";
import { getEventsByOrganizer } from "@/lib/queries/events.queries";
import type { EventWithStats }  from "@/lib/types/event.type";

async function getUpcomingEventsWithStats(): Promise<EventWithStats[]> {
  const organizerId = await getCurrentUserId();
  const events = await getEventsByOrganizer(organizerId);

  // Filter for upcoming events only
  const now = new Date();
  const upcomingEvents = events
    .filter((event) => new Date(event.eventDate) >= now)
    .sort(
      (a, b) =>
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    )
    .slice(0, 3); // Get next 3 events

  const eventsWithStats = await Promise.all(
    upcomingEvents.map(async (event) => {
      const [ticketStats] = await db
        .select({
          totalTicketsSold: sql<number>`COALESCE(SUM(${ticketTypes.quantitySold}), 0)`,
        })
        .from(ticketTypes)
        .where(eq(ticketTypes.eventId, event.id));

      return {
        ...event,
        totalTicketsSold: Number(ticketStats?.totalTicketsSold || 0),
        totalRevenue: 0, // Add default values for EventWithStats
        totalOrders: 0,
      };
    })
  );

  return eventsWithStats;
}

export async function UpcomingEvents() {
  const upcomingEvents = await getUpcomingEventsWithStats();

  if (upcomingEvents.length === 0) {
    return (
      <Card className="bg-white border-[#85A947]/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#123524]">
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-[#85A947]">No upcoming events</p>
            <p className="text-sm text-[#3E7B27] mt-1">
              Create your first event to get started
            </p>
            <Link href="/dashboard/events/create" className="mt-4 inline-block">
              <Button className="bg-[#85A947] hover:bg-[#3E7B27] text-white">
                Create Event
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-[#85A947]/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-[#123524]">
          Upcoming Events
        </CardTitle>
        <Link href="/dashboard/events">
          <Button
            variant="ghost"
            size="sm"
            className="text-[#3E7B27] hover:text-[#123524]"
          >
            View all
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingEvents.map((event) => {
            const soldPercentage = event.totalCapacity
              ? (event.totalTicketsSold / event.totalCapacity) * 100
              : 0;

            return (
              <Link
                key={event.id}
                href={`/dashboard/events/${event.slug}`}
                className="block p-4 rounded-lg border border-[#85A947]/20 hover:bg-[#EFE3C2]/30 hover:border-[#85A947]/40 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-[#123524] truncate">
                        {event.title}
                      </h3>
                      {!event.isPublished && (
                        <Badge variant="outline" className="text-xs">
                          Draft
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#3E7B27] mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(event.eventDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-[#3E7B27]">
                      <Users className="h-3 w-3" />
                      {event.totalTicketsSold} / {event.totalCapacity ?? "∞"}{" "}
                      tickets sold
                    </span>
                    <span className="font-medium text-[#123524]">
                      {soldPercentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-[#EFE3C2] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#85A947] rounded-full transition-all"
                      style={{
                        width: `${Math.min(soldPercentage, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
