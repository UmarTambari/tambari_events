import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventHeader } from "@/components/events/event-header";
import { EventStatsCards } from "@/components/events/event-stats-cards";
import { EventTabsWrapper } from "@/components/events/event-tabs-wrapper";
import {
  getEventBySlug,
  getEventWithStats,
} from "@/lib/queries/events.queries";
import { getCurrentUserId } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";

interface EventDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {

  const { slug } = await params;
  const userId = await getCurrentUserId();
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  if (event.userId !== userId) {
    redirect("/dashboard/events");
  }

  const eventWithStats = await getEventWithStats(event.id);

  if (!eventWithStats) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard/events">
        <Button variant="ghost" size="sm" className="text-[#3E7B27]">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </Link>

      <EventHeader event={eventWithStats} />

      <EventStatsCards event={eventWithStats} />

      <EventTabsWrapper event={eventWithStats} />
    </div>
  );
}
