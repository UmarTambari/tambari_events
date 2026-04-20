"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Edit,
  Share2,
  MoreVertical,
  ExternalLink,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EventHeaderProps {
  event: {
    id: string;
    title: string;
    slug: string;
    description: string;
    eventDate: Date | string;
    eventEndDate?: Date | string | null;
    location: string;
    venue: string;
    bannerImageUrl: string | null;
    isPublished: boolean;
    isCancelled: boolean;
    category?: string | null;
    tags?: string[] | null;
  };
}

export function EventHeader({ event }: EventHeaderProps) {
  const publicUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com"
  }/events/${event.slug}`;
  const eventDate = new Date(event.eventDate);

  return (
    <div className="bg-white rounded-lg border border-dash-border overflow-hidden">
      {/* Banner Image */}
      <div className="relative h-64 bg-linear-to-br from-dash-sidebar to-dash-accent-strong">
        {event.bannerImageUrl ? (
          <Image
            src={event.bannerImageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
            width={1200}
            height={600}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="h-24 w-24 text-white/40" />
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-4 left-4 flex gap-2">
          {!event.isPublished && (
            <Badge className="bg-yellow-500 text-white border-0">Draft</Badge>
          )}
          {event.isCancelled && (
            <Badge className="bg-red-500 text-white border-0">Cancelled</Badge>
          )}
          {event.isPublished && !event.isCancelled && (
            <Badge className="bg-green-500 text-white border-0">
              Published
            </Badge>
          )}
        </div>
      </div>

      {/* Event Info */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-dash-ink mb-2">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-dash-muted mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-dash-accent" />
                <span>
                  {eventDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-dash-accent" />
                <span>
                  {event.venue}, {event.location}
                </span>
              </div>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {event.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs bg-dash-highlight border-dash-accent/30 text-dash-ink"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <p className="text-dash-muted leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-48">
            <Link
              href={`/dashboard/events/${event.slug}/edit`}
              className="w-full"
            >
              <Button className="w-full bg-dash-accent hover:bg-dash-accent-strong text-white">
                <Edit className="mr-2 h-4 w-4" />
                Edit Event
              </Button>
            </Link>

            <Link
              href={`/dashboard/events/${event.slug}/checkin`}
              className="w-full"
            >
              <Button
                variant="outline"
                className="w-full border-dash-accent text-dash-muted hover:bg-dash-highlight"
              >
                <QrCode className="mr-2 h-4 w-4" />
                Check-in
              </Button>
            </Link>

            <Button
              variant="outline"
              className="w-full border-dash-accent text-dash-muted hover:bg-dash-highlight"
              onClick={() => {
                navigator.clipboard.writeText(publicUrl);
                // You can add a toast notification here
              }}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-dash-accent text-dash-muted hover:bg-dash-highlight"
                >
                  <MoreVertical className="mr-2 h-4 w-4" />
                  More
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Public Page
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  Cancel Event
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  Delete Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
