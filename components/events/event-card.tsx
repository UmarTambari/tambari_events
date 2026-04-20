import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  MoreVertical,
  Edit,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { DeleteEventMenuItem } from "@/components/events/delete-event-menu-item";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    slug: string;
    description: string;
    eventDate: Date;
    location: string;
    venue: string;
    thumbnailImageUrl: string | null;
    isPublished: boolean;
    isCancelled: boolean;
    totalTicketsSold: number;
    totalCapacity: number | null;
    totalRevenue: number;
    category?: string | null;
  };
  isPast?: boolean;
}

export function EventCard({ event, isPast = false }: EventCardProps) {
  const soldPercentage = event.totalCapacity
    ? (event.totalTicketsSold / event.totalCapacity) * 100
    : 0;

  const isUpcoming = event.eventDate > new Date();
  const daysUntil = Math.ceil(
    (event.eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="bg-white border-dash-border hover:shadow-lg transition-all overflow-hidden group">
      {/* Image/Thumbnail */}
      <div className="relative h-48 bg-linear-to-br from-dash-sidebar to-dash-accent-strong">
        {event.thumbnailImageUrl ? (
          <Image
            src={event.thumbnailImageUrl}
            alt={event.title}
            width={300}
            height={150}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="h-16 w-16 text-white/50" />
          </div>
        )}

        {/* Status badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {!event.isPublished && (
            <Badge className="bg-yellow-500 text-white border-0">Draft</Badge>
          )}
          {event.isCancelled && (
            <Badge className="bg-red-500 text-white border-0">Cancelled</Badge>
          )}
          {isUpcoming && event.isPublished && daysUntil <= 7 && (
            <Badge className="bg-dash-accent text-white border-0">
              {daysUntil} days left
            </Badge>
          )}
        </div>

        {/* Action menu */}
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-white/90 hover:bg-white"
              >
                <MoreVertical className="h-4 w-4 text-dash-ink" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/events/${event.slug}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/events/${event.slug}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Event
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DeleteEventMenuItem
                eventId={event.id}
                eventTitle={event.title}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        {/* Title and category */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <Link href={`/dashboard/events/${event.slug}`}>
              <h3 className="font-semibold text-dash-ink line-clamp-1 group-hover:text-dash-muted transition-colors">
                {event.title}
              </h3>
            </Link>
          </div>
          {event.category && (
            <Badge
              variant="outline"
              className="text-xs text-dash-muted border-dash-accent/30"
            >
              {event.category}
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-dash-muted line-clamp-2">
          {event.description}
        </p>

        {/* Event details */}
        <div className="space-y-2 text-sm text-dash-muted">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-dash-accent" />
            <span>
              {event.eventDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-dash-accent" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-dash-border">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-dash-accent">
              <Users className="h-3 w-3" />
              <span>Tickets Sold</span>
            </div>
            <p className="text-lg font-semibold text-dash-ink">
              {event.totalTicketsSold}
              {event.totalCapacity && (
                <span className="text-sm font-normal text-dash-accent">
                  /{event.totalCapacity}
                </span>
              )}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-dash-accent">
              <TrendingUp className="h-3 w-3" />
              <span>Revenue</span>
            </div>
            <p className="text-lg font-semibold text-dash-ink">
              ₦{(event.totalRevenue / 100).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        {event.totalCapacity && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-dash-muted">Capacity</span>
              <span className="font-medium text-dash-ink">
                {soldPercentage.toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-dash-highlight rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  soldPercentage >= 90
                    ? "bg-red-500"
                    : soldPercentage >= 70
                    ? "bg-yellow-500"
                    : "bg-dash-accent"
                )}
                style={{ width: `${Math.min(soldPercentage, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Action button */}
        <Link href={`/dashboard/events/${event.slug}`} className="block">
          <Button className="w-full bg-dash-accent-strong hover:bg-dash-sidebar text-white">
            {isPast ? "View Results" : "Manage Event"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
