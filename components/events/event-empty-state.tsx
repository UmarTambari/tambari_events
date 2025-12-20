import Link from "next/link";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventsEmptyStateProps {
  title: string;
  description: string;
  showCreateButton?: boolean;
}

export function EventsEmptyState({
  title,
  description,
  showCreateButton = false,
}: EventsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-lg border-2 border-dashed border-[#85A947]/30">
      <div className="h-20 w-20 rounded-full bg-[#EFE3C2] flex items-center justify-center mb-4">
        <Calendar className="h-10 w-10 text-[#3E7B27]" />
      </div>
      <h3 className="text-lg font-semibold text-[#123524] mb-2">{title}</h3>
      <p className="text-sm text-[#3E7B27] mb-6 text-center max-w-md">
        {description}
      </p>
      {showCreateButton && (
        <Link href="/dashboard/events/create">
          <Button className="bg-[#85A947] hover:bg-[#3E7B27] text-white">
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Event
          </Button>
        </Link>
      )}
    </div>
  );
}
