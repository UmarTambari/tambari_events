import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Calendar, MapPin, FileText } from "lucide-react";

interface CustomerInfoCardProps {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventTitle: string;
  eventSlug: string;
  eventDate: Date;
  eventVenue: string;
  eventLocation: string;
  notes: string | null;
}

export function CustomerInfoCard({
  customerName,
  customerEmail,
  customerPhone,
  eventTitle,
  eventSlug,
  eventDate,
  eventVenue,
  eventLocation,
  notes,
}: CustomerInfoCardProps) {
  return (
    <Card className="bg-white border-dash-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-dash-ink">
          Customer & Event Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <p className="text-xs font-semibold text-dash-accent uppercase tracking-wide">
            Customer
          </p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-dash-accent mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-dash-ink">
                  {customerName}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-dash-accent mt-0.5 shrink-0" />
              <a
                href={`mailto:${customerEmail}`}
                className="text-sm text-dash-muted hover:underline"
              >
                {customerEmail}
              </a>
            </div>
            {customerPhone && (
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-dash-accent mt-0.5 shrink-0" />
                <a
                  href={`tel:${customerPhone}`}
                  className="text-sm text-dash-muted hover:underline"
                >
                  {customerPhone}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-dash-accent/20" />

        <div className="space-y-3">
          <p className="text-xs font-semibold text-dash-accent uppercase tracking-wide">
            Event Details
          </p>
          <div className="space-y-2">
            <Link
              href={`/dashboard/events/${eventSlug}`}
              className="text-sm font-medium text-dash-muted hover:text-dash-ink hover:underline block"
            >
              {eventTitle}
            </Link>
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-dash-accent mt-0.5 shrink-0" />
              <p className="text-sm text-dash-muted">
                {eventDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-dash-accent mt-0.5 shrink-0" />
              <div className="text-sm text-dash-muted">
                <p>{eventVenue}</p>
                <p className="text-dash-accent">{eventLocation}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <>
            <div className="h-px bg-dash-accent/20" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-dash-accent" />
                <p className="text-xs font-semibold text-dash-accent uppercase tracking-wide">
                  Notes
                </p>
              </div>
              <p className="text-sm text-dash-muted pl-6">{notes}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}