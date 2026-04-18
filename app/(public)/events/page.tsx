import { Suspense } from "react";
import { EventCard } from "@/components/public/event-card";
import { EventsFilters } from "@/components/public/events-filters";
import { getPublishedEvents } from "@/lib/queries/events.queries";
import { getTicketTypesByEvent } from "@/lib/queries/ticketTypes.queries";
import { Calendar } from "lucide-react";
import { Event } from "@/lib/types/event.type";
import { TicketType } from "@/lib/types/ticketTypes.type";

interface EventsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    price?: string;
    sort?: string;
  }>;
}

async function EventsList({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  
  // Fetch all published events
  let events = await getPublishedEvents();

  // Apply search filter
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    events = events.filter(
      (event: Event) =>
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.location.toLowerCase().includes(searchLower) ||
        event.venue.toLowerCase().includes(searchLower)
    );
  }

  // Apply category filter
  if (params.category) {
    events = events.filter((event: Event) => event.category === params.category);
  }

  // Enhance events with ticket information
  const eventsWithTickets = await Promise.all(
    events.map(async (event: Event) => {
      const tickets: TicketType[] = await getTicketTypesByEvent(event.id);
      const activeTickets = tickets.filter((t) => t.isActive);
      
      const lowestPrice = activeTickets.length > 0 
        ? Math.min(...activeTickets.map((t) => t.price))
        : 0;

      const totalCapacity = tickets.reduce((sum, t) => sum + t.quantity, 0);
      const totalTicketsSold = tickets.reduce((sum, t) => sum + t.quantitySold, 0);

      return {
        ...event,
        lowestPrice,
        totalCapacity,
        totalTicketsSold,
      };
    })
  );

  // Apply price filter
  let filteredEvents = eventsWithTickets;
  if (params.price === "free") {
    filteredEvents = eventsWithTickets.filter((event) => event.lowestPrice === 0);
  } else if (params.price === "paid") {
    filteredEvents = eventsWithTickets.filter((event) => event.lowestPrice > 0);
  }

  // Apply sorting
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (params.sort) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "popular":
        return (b.totalTicketsSold || 0) - (a.totalTicketsSold || 0);
      case "date":
      default:
        return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
    }
  });

  if (sortedEvents.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Events Found
        </h3>
        <p className="text-gray-600 mb-6">
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedEvents.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

function EventsListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
          <div className="h-48 bg-gray-200" />
          <div className="p-5 space-y-3">
            <div className="h-6 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="pt-4 border-t border-gray-100">
              <div className="h-8 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EventsPage({ searchParams }: EventsPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Discover Events
          </h1>
          <p className="text-lg text-gray-600">
            Find the perfect event for you from our curated selection
          </p>
        </div>
      </div>

      <EventsFilters />

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<EventsListSkeleton />}>
          <EventsList searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}