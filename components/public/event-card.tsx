import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import type { Event } from "@/lib/types/event.type";

interface EventCardProps {
  event: Event & {
    totalTicketsSold?: number;
    totalCapacity?: number | null;
    lowestPrice?: number;
  };
}

export function EventCard({ event }: EventCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price / 100); // Convert from kobo to naira
  };

  const isSoldOut =
    event.totalCapacity &&
    event.totalTicketsSold &&
    event.totalTicketsSold >= event.totalCapacity;

  const isAlmostSoldOut =
    event.totalCapacity &&
    event.totalTicketsSold &&
    event.totalTicketsSold >= event.totalCapacity * 0.9;

  return (
    <Link href={`/events/${event.slug}`}>
      <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
        {/* Image */}
        <div className="relative h-48 w-full overflow-hidden bg-gray-200">
          {event.thumbnailImageUrl || event.bannerImageUrl ? (
            <Image
              src={event.thumbnailImageUrl || event.bannerImageUrl || ""}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-linear-to-br from-blue-500 to-purple-600">
              <span className="text-white text-2xl font-bold">
                {event.title.charAt(0)}
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {isSoldOut && (
              <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                Sold Out
              </span>
            )}
            {!isSoldOut && isAlmostSoldOut && (
              <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                Low Tickets
              </span>
            )}
            {event.category && (
              <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium rounded-full">
                {event.category}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {event.title}
          </h3>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              <span>{format(new Date(event.eventDate), "MMM dd, yyyy • h:mm a")}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              <span className="line-clamp-1">
                {event.venue}, {event.location}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {event.lowestPrice !== undefined && event.lowestPrice > 0 ? (
              <div>
                <p className="text-xs text-gray-500">Starting from</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatPrice(event.lowestPrice)}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-bold text-green-600">FREE</p>
              </div>
            )}

            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              {isSoldOut ? "View Details" : "Get Tickets"}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}