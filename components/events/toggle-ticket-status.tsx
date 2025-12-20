"use client";

import { useState } from "react";
import { ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TicketType {
  id: string;
  name: string;
  isActive: boolean;
}

interface ToggleTicketStatusProps {
  eventId: string;
  ticket: TicketType;
  onSuccess: () => void;
}

export function ToggleTicketStatus({
  eventId,
  ticket,
  onSuccess,
}: ToggleTicketStatusProps) {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);

    try {
      const response = await fetch(
        `/api/dashboard/events/${eventId}/tickets/${ticket.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isActive: !ticket.isActive,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update ticket status");
      }

      toast.success(
        `Ticket ${ticket.isActive ? "deactivated" : "activated"} successfully!`
      );
      onSuccess();
    } catch (error) {
      console.error("Error toggling ticket status:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update ticket status"
      );
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isToggling}
      className="h-8 w-8 text-[#3E7B27] hover:bg-[#EFE3C2]"
      title={ticket.isActive ? "Deactivate ticket" : "Activate ticket"}
    >
      {ticket.isActive ? (
        <ToggleRight className="h-4 w-4" />
      ) : (
        <ToggleLeft className="h-4 w-4" />
      )}
    </Button>
  );
}