import Link             from "next/link";
import { Plus, Search } from "lucide-react";
import { Button }       from "@/components/ui/button";
import { Input }        from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventCard }            from "@/components/events/event-card";
import { EventsEmptyState }     from "@/components/events/event-empty-state";
import { getEventsByOrganizer } from "@/lib/queries/events.queries";
import { getCurrentUserId }     from "@/lib/auth";
import { db }                   from "@/lib/db";
import { ticketTypes }          from "@/lib/db/schema/tickets.schema";
import { eq, sql }              from "drizzle-orm";

async function getEventsWithStats(organizerId: string) {
  const events = await getEventsByOrganizer(organizerId);

  // Get ticket stats for each event
  const eventsWithStats = await Promise.all(
    events.map(async (event) => {
      const [ticketStats] = await db
        .select({
          totalTicketsSold: sql<number>`COALESCE(SUM(${ticketTypes.quantitySold}), 0)`,
        })
        .from(ticketTypes)
        .where(eq(ticketTypes.eventId, event.id));

      // Calculate revenue (sum of quantitySold * price for each ticket type)
      const [revenueStats] = await db
        .select({
          totalRevenue: sql<number>`COALESCE(SUM(${ticketTypes.quantitySold} * ${ticketTypes.price}), 0)`,
        })
        .from(ticketTypes)
        .where(eq(ticketTypes.eventId, event.id));

      return {
        ...event,
        totalTicketsSold: Number(ticketStats?.totalTicketsSold || 0),
        totalRevenue: Number(revenueStats?.totalRevenue || 0),
      };
    })
  );

  return eventsWithStats;
}

export default async function EventsPage() {
  const userId = await getCurrentUserId();
  const events = await getEventsWithStats(userId);

  const activeEvents = events.filter(
    (e) => e.isPublished && !e.isCancelled && new Date(e.eventDate) >= new Date()
  );
  const draftEvents = events.filter((e) => !e.isPublished);
  const pastEvents = events.filter(
    (e) => e.isPublished && new Date(e.eventDate) < new Date()
  );
  const cancelledEvents = events.filter((e) => e.isCancelled);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dash-ink">Events</h1>
          <p className="text-dash-muted mt-1">
            Manage and monitor all your events
          </p>
        </div>
        <Link href="/dashboard/events/create">
          <Button className="bg-dash-accent hover:bg-dash-accent-strong text-white font-semibold">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dash-accent" />
          <Input
            placeholder="Search events..."
            className="pl-10 bg-white border-dash-border focus:border-dash-accent-strong"
          />
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="bg-white border border-dash-border">
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-dash-accent data-[state=active]:text-white"
          >
            Active ({activeEvents.length})
          </TabsTrigger>
          <TabsTrigger
            value="draft"
            className="data-[state=active]:bg-dash-accent data-[state=active]:text-white"
          >
            Drafts ({draftEvents.length})
          </TabsTrigger>
          <TabsTrigger
            value="past"
            className="data-[state=active]:bg-dash-accent data-[state=active]:text-white"
          >
            Past ({pastEvents.length})
          </TabsTrigger>
          <TabsTrigger
            value="cancelled"
            className="data-[state=active]:bg-dash-accent data-[state=active]:text-white"
          >
            Cancelled ({cancelledEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeEvents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EventsEmptyState
              title="No active events"
              description="Create your first event to get started"
              showCreateButton
            />
          )}
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          {draftEvents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {draftEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EventsEmptyState
              title="No draft events"
              description="All your events are published"
            />
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastEvents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} isPast />
              ))}
            </div>
          ) : (
            <EventsEmptyState
              title="No past events"
              description="Your past events will appear here"
            />
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledEvents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cancelledEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EventsEmptyState
              title="No cancelled events"
              description="Cancelled events will appear here"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}