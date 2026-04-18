import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  User,
  Tag,
  AlertCircle 
} from "lucide-react";
import { getEventBySlug, getPublishedEvents } from "@/lib/queries/events.queries";
import { getTicketTypesByEvent } from "@/lib/queries/ticketTypes.queries";
import { getUserById } from "@/lib/queries/users.queries";
import { TicketSelector } from "@/components/public/ticket-selector";
import { EventCard } from "@/components/public/event-card";
import { ShareButton } from "@/components/public/share-button";
import { Event } from "@/lib/types/event.type";

interface EventPageProps {
  params: Promise<{
    slug: string;
  }>;
}
export async function generateStaticParams() {
  const events: Event[] = await getPublishedEvents({});
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return {
      title: "Event Not Found",
    };
  }

  return {
    title: `${event.title} | EventHub`,
    description: event.description.substring(0, 160),
    openGraph: {
      title: event.title,
      description: event.description,
      images: event.bannerImageUrl ? [event.bannerImageUrl] : [],
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  
  const event = await getEventBySlug(slug);

  if (!event || !event.isPublished || event.isCancelled) {
    notFound();
  }

  const [tickets, organizer, relatedEvents] = await Promise.all([
    getTicketTypesByEvent(event.id),
    getUserById(event.organizerId),
    getPublishedEvents({ category: event.category || undefined, limit: 3 }),
  ]);

  // Filter out current event from related events
  const filteredRelatedEvents = relatedEvents.filter((e: Event) => e.id !== event.id);

  // Enhance related events with prices
  const relatedEventsWithPrices = await Promise.all(
    filteredRelatedEvents.map(async (relEvent: Event) => {
      const relTickets = await getTicketTypesByEvent(relEvent.id);
      const lowestPrice = relTickets.length > 0
        ? Math.min(...relTickets.filter(t => t.isActive).map(t => t.price))
        : 0;
      return { ...relEvent, lowestPrice };
    })
  );

  const formatDate = (date: Date) => {
    return format(new Date(date), "EEEE, MMMM dd, yyyy");
  };

  const formatTime = (date: Date) => {
    return format(new Date(date), "h:mm a");
  };

  const isEventPast = new Date(event.eventDate) < new Date();
  const activeTickets = tickets.filter((t) => t.isActive);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-64 md:h-96 w-full bg-gray-200">
        {event.bannerImageUrl ? (
          <Image
            src={event.bannerImageUrl}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-linear-to-br from-blue-600 to-purple-600">
            <h1 className="text-4xl md:text-6xl font-bold text-white text-center px-4">
              {event.title}
            </h1>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Header Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              {event.category && (
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-4">
                  {event.category}
                </span>
              )}
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {event.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                  <span>{formatDate(event.eventDate)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-400" />
                  <span>
                    {formatTime(event.eventDate)}
                    {event.eventEndDate && ` - ${formatTime(event.eventEndDate)}`}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                  <span>{event.venue}, {event.location}</span>
                </div>
              </div>

              {organizer && (
                <div className="flex items-center space-x-3 pb-6 border-b border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Organized by</p>
                    <p className="font-semibold text-gray-900">{organizer.fullName}</p>
                  </div>
                </div>
              )}

              {isEventPast && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-900">Past Event</p>
                    <p className="text-sm text-yellow-700">
                      This event has already taken place
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <ShareButton event={event} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About This Event
              </h2>
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </p>
              </div>

              {event.tags && event.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center flex-wrap gap-2">
                    <Tag className="h-5 w-5 text-gray-400" />
                    {event.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Location Map */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Event Location
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">{event.venue}</p>
                    <p className="text-gray-600">{event.location}</p>
                  </div>
                </div>

                {/* Google Maps Embed */}
                <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''}&q=${encodeURIComponent(
                      `${event.venue}, ${event.location}`
                    )}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Ticket Selector */}
          <div className="lg:col-span-1">
            {!isEventPast && (
              <TicketSelector eventId={event.id} tickets={activeTickets} />
            )}
          </div>
        </div>

        {/* Related Events */}
        {relatedEventsWithPrices.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Related Events
              </h2>
              {event.category && (
                <Link
                  href={`/events?category=${event.category}`}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                >
                  View More
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedEventsWithPrices.map((relEvent) => (
                <EventCard key={relEvent.id} event={relEvent} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}