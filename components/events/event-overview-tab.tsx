import { Calendar, MapPin, Users, Clock, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EventOverviewTabProps {
  event: {
    id: string;
    title: string;
    description: string;
    eventDate: Date | string;
    eventEndDate?: Date | string | null;
    location: string;
    venue: string;
    totalCapacity: number | null;
    category?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
  };
}

export function EventOverviewTab({ event }: EventOverviewTabProps) {
  const eventDate = new Date(event.eventDate);
  const eventEndDate = event.eventEndDate ? new Date(event.eventEndDate) : null;
  const createdAt = new Date(event.createdAt);
  const updatedAt = new Date(event.updatedAt);

  const formatDateTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getEventDuration = () => {
    if (!eventEndDate) return "Single day event";

    const duration = eventEndDate.getTime() - eventDate.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));

    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? "s" : ""}`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days} day${days !== 1 ? "s" : ""}`;
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Event Details Card */}
      <Card className="bg-white border-dash-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-dash-ink">
            Event Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-dash-highlight flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5 text-dash-muted" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dash-ink">Date & Time</p>
              <p className="text-sm text-dash-muted mt-1">
                {formatDateTime(eventDate)}
              </p>
              {eventEndDate && (
                <p className="text-sm text-dash-muted">
                  to {formatDateTime(eventEndDate)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-dash-highlight flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-dash-muted" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dash-ink">Duration</p>
              <p className="text-sm text-dash-muted mt-1">
                {getEventDuration()}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-dash-highlight flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-dash-muted" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dash-ink">Location</p>
              <p className="text-sm text-dash-muted mt-1">{event.venue}</p>
              <p className="text-sm text-dash-accent">{event.location}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-dash-highlight flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 text-dash-muted" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dash-ink">Capacity</p>
              <p className="text-sm text-dash-muted mt-1">
                {event.totalCapacity
                  ? `${event.totalCapacity} attendees`
                  : "Unlimited"}
              </p>
            </div>
          </div>

          {event.category && (
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-dash-highlight flex items-center justify-center shrink-0">
                <Tag className="h-5 w-5 text-dash-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dash-ink">Category</p>
                <p className="text-sm text-dash-muted mt-1">{event.category}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Description Card */}
      <Card className="bg-white border-dash-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-dash-ink">
            Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-dash-muted leading-relaxed whitespace-pre-wrap">
            {event.description}
          </p>
        </CardContent>
      </Card>

      {/* Metadata Card */}
      <Card className="bg-white border-dash-border lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-dash-ink">
            Event Metadata
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-dash-ink">Created</p>
              <p className="text-sm text-dash-muted mt-1">
                {createdAt.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-dash-ink">Last Updated</p>
              <p className="text-sm text-dash-muted mt-1">
                {updatedAt.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
