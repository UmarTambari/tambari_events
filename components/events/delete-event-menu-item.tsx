"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "@/components/ui/alert-dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface DeleteEventMenuItemProps {
  eventId: string;
  eventTitle: string;
}

export function DeleteEventMenuItem({
  eventId,
  eventTitle,
}: DeleteEventMenuItemProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/dashboard/events/${eventId}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete event");
      }

      toast.success("Event deleted");
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Delete event:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete event"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenuItem
        className="text-red-600 focus:text-red-600"
        onSelect={(e) => {
          e.preventDefault();
          setTimeout(() => setOpen(true), 0);
        }}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Event
      </DropdownMenuItem>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#123524]">
              Delete this event?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#3E7B27]">
              <span className="font-medium text-[#123524]">{eventTitle}</span>{" "}
              will be removed permanently, including draft ticket types and
              unpaid orders. Events with completed sales cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="border-[#85A947] text-[#3E7B27] hover:bg-[#EFE3C2]"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting…" : "Delete event"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
