import Link           from "next/link";
import { ArrowLeft }  from "lucide-react";
import { notFound }   from "next/navigation";

import { Button }         from "@/components/ui/button";
import { EditEventForm }  from "@/components/events/edit-event-form";
import { getEventForOrganizerBySlug } from "@/lib/queries/events.queries";
import { getCurrentUserId }           from "@/lib/auth";

interface EditEventPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { slug } = await params;
  const organizerId = await getCurrentUserId();
  const event = await getEventForOrganizerBySlug(slug, organizerId);

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" className="text-dash-muted w-fit" asChild>
          <Link href={`/dashboard/events/${event.slug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to event
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-dash-ink">Edit event</h1>
        <p className="text-dash-muted mt-1">
          Update details, schedule, and images. Manage ticket types from the
          event page.
        </p>
      </div>

      <EditEventForm event={event} />
    </div>
  );
}
