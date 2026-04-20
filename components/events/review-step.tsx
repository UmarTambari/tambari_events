"use client";

import { format, parseISO } from "date-fns";
import {
  Calendar,
  MapPin,
  Tag,
  Ticket,
  Image as ImageIcon,
} from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import type { CreateEventFormValues } from "@/lib/types/event.type";

export function ReviewStep() {
  const { watch } = useFormContext<CreateEventFormValues>();
  const values = watch();

  // Safely parse ISO strings to Date
  const formatDateTime = (iso?: string | null) => {
    if (!iso) return "Not set";
    try {
      const date = parseISO(iso);
      return format(date, "EEEE, MMMM d, yyyy 'at' h:mm a");
    } catch {
      return "Invalid date";
    }
  };

  const totalTickets = values.ticketTypes.reduce(
    (sum, t) => sum + (parseInt(t.quantity || "0") || 0),
    0
  );

  const estimatedRevenue = values.ticketTypes.reduce(
    (sum, t) =>
      sum +
      (parseInt(t.price || "0") || 0) * (parseInt(t.quantity || "0") || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-dash-ink mb-2">
          Review Your Event
        </h2>
        <p className="text-sm text-dash-muted">
          Please review all details before publishing
        </p>
      </div>

      <Card className="bg-white border-dash-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-dash-ink flex items-center gap-2">
            <Tag className="h-5 w-5 text-dash-accent" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-dash-accent">Title</p>
            <p className="text-dash-ink font-medium">
              {values.title || "Not set"}
            </p>
          </div>
          <div>
            <p className="text-sm text-dash-accent">Description</p>
            <p className="text-dash-ink whitespace-pre-wrap">
              {values.description || "Not set"}
            </p>
          </div>
          <div>
            <p className="text-sm text-dash-accent">Category</p>
            <Badge className="bg-dash-highlight text-dash-ink border-dash-accent/30">
              {values.category || "Not set"}
            </Badge>
          </div>
          {(values.tags ?? []).length > 0 && (
            <div>
              <p className="text-sm text-dash-accent">Tags</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {(values.tags ?? []).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="bg-dash-highlight border-dash-accent/30 text-dash-ink"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white border-dash-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-dash-ink flex items-center gap-2">
            <Calendar className="h-5 w-5 text-dash-accent" />
            Location & Time
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-dash-accent">Venue</p>
            <p className="text-dash-ink font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {values.venue || "Not set"}
            </p>
          </div>
          <div>
            <p className="text-sm text-dash-accent">Location</p>
            <p className="text-dash-ink">{values.location || "Not set"}</p>
          </div>
          <div>
            <p className="text-sm text-dash-accent">Start Date & Time</p>
            <p className="text-dash-ink">{formatDateTime(values.eventDate)}</p>
          </div>
          {values.eventEndDate && (
            <div>
              <p className="text-sm text-dash-accent">End Date & Time</p>
              <p className="text-dash-ink">
                {formatDateTime(values.eventEndDate)}
              </p>
            </div>
          )}
          <div>
            <p className="text-sm text-dash-accent">Capacity</p>
            <p className="text-dash-ink">
              {values.totalCapacity || "Unlimited"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-dash-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-dash-ink flex items-center gap-2">
            <Ticket className="h-5 w-5 text-dash-accent" />
            Ticket Types ({values.ticketTypes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {values.ticketTypes.length > 0 ? (
            <div className="space-y-4">
              {values.ticketTypes.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 rounded-lg border border-dash-border bg-dash-highlight/20"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-dash-ink">
                        {ticket.name}
                      </p>
                      {ticket.description && (
                        <p className="text-sm text-dash-accent">
                          {ticket.description}
                        </p>
                      )}
                    </div>
                    <Badge className="bg-dash-accent text-white border-0">
                      ₦{(parseInt(ticket.price || "0") || 0).toLocaleString()}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-dash-accent">Quantity:</span>{" "}
                      <span className="text-dash-ink font-medium">
                        {ticket.quantity || "0"}
                      </span>
                    </div>
                    <div>
                      <span className="text-dash-accent">Max per order:</span>{" "}
                      <span className="text-dash-ink font-medium">
                        {ticket.maxPurchase}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dash-border">
                <div>
                  <p className="text-sm text-dash-accent">Total Tickets</p>
                  <p className="text-2xl font-bold text-dash-ink">
                    {totalTickets}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-dash-accent">Potential Revenue</p>
                  <p className="text-2xl font-bold text-dash-ink">
                    ₦{estimatedRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-dash-accent text-center py-4">
              No ticket types added
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white border-dash-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-dash-ink flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-dash-accent" />
            Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-dash-accent">Banner Image</p>
            <p className="text-dash-ink">
              {values.bannerImageUrl ? "Yes Added" : "No banner added"}
            </p>
          </div>
          <div>
            <p className="text-sm text-dash-accent">Thumbnail Image</p>
            <p className="text-dash-ink">
              {values.thumbnailImageUrl ? "Yes Added" : "No thumbnail added"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <p className="text-sm text-green-800">
            <strong>Ready to publish?</strong> Click &quot;Publish Event&quot;
            to go live, or &quot;Save as Draft&quot; to edit later.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
