"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { TicketType } from "@/lib/types/ticketTypes.type"

interface DeleteTicketDialogProps {
  eventId: string;
  ticket: Pick<TicketType, "id" | "name" | "quantitySold">;
  onSuccess: () => void;
}

export function DeleteTicketDialog({
  eventId,
  ticket,
  onSuccess,
}: DeleteTicketDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/dashboard/events/${eventId}/tickets/${ticket.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete ticket");
      }

      toast.success("Ticket type deleted successfully!");
      onSuccess();
    } catch (error) {
      console.error("Error deleting ticket:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete ticket"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const isDisabled = ticket.quantitySold > 0;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
          disabled={isDisabled}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-dash-ink">
            Delete Ticket Type
          </AlertDialogTitle>
          <AlertDialogDescription className="text-dash-muted">
            Are you sure you want to delete <strong>{ticket.name}</strong>?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isDeleting}
            className="border-dash-accent text-dash-muted hover:bg-dash-highlight"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
