"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  editTicketFormSchema,
  EditTicketFormData,
  transformTicketFormToAPI,
  transformTicketAPIToForm,
} from "@/lib/types/ticketTypesForm";
import { TicketType } from "@/lib/types/ticketTypes.type";

interface EditTicketDialogProps {
  eventId: string;
  ticket: TicketType;
  onSuccess: () => void;
}

export function EditTicketDialog({
  eventId,
  ticket,
  onSuccess,
}: EditTicketDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasSales = ticket.quantitySold > 0;

  const form = useForm<EditTicketFormData>({
    resolver: zodResolver(editTicketFormSchema),
    defaultValues: transformTicketAPIToForm(ticket),
  });

  useEffect(() => {
    if (open) {
      form.reset(transformTicketAPIToForm(ticket));
    }
  }, [open, ticket, form]);

  const onSubmit = async (data: EditTicketFormData) => {
    setIsSubmitting(true);

    try {
      const apiPayload = hasSales
        ? {
            description: data.description?.trim() || null,
            isActive: data.isActive,
            saleStartDate: data.saleStartDate
              ? new Date(data.saleStartDate).toISOString()
              : null,
            saleEndDate: data.saleEndDate
              ? new Date(data.saleEndDate).toISOString()
              : null,
          }
        : transformTicketFormToAPI(data);

      const response = await fetch(
        `/api/dashboard/events/${eventId}/tickets/${ticket.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiPayload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update ticket");
      }

      toast.success("Ticket type updated successfully!");
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update ticket"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-dash-muted hover:bg-dash-highlight"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-dash-ink">Edit Ticket Type</DialogTitle>
          <DialogDescription className="text-dash-muted">
            Update ticket type details.
            {hasSales && (
              <span className="block mt-2 text-amber-600 font-medium">
                ⚠️ This ticket has {ticket.quantitySold} sale(s). Only
                description, status, and sale dates can be modified.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-dash-ink">
                    Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Early Bird, VIP, Regular"
                      className="border-dash-border focus:border-dash-accent-strong"
                      disabled={hasSales}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-dash-ink">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of this ticket type"
                      rows={3}
                      className="resize-none border-dash-border focus:border-dash-accent-strong"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-dash-ink">
                      Price (₦) <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1000"
                        min="100"
                        step="0.01"
                        className="border-dash-border focus:border-dash-accent-strong"
                        disabled={hasSales}
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-dash-accent">Price in Naira</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-dash-ink">
                      Quantity <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100"
                        min={ticket.quantitySold}
                        className="border-dash-border focus:border-dash-accent-strong"
                        disabled={hasSales}
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-dash-accent">
                      {hasSales
                        ? `Min: ${ticket.quantitySold} (already sold)`
                        : "Available tickets"}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="minPurchase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-dash-ink">
                      Min Purchase
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        className="border-dash-border focus:border-dash-accent-strong"
                        disabled={hasSales}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxPurchase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-dash-ink">
                      Max Purchase
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        className="border-dash-border focus:border-dash-accent-strong"
                        disabled={hasSales}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-dash-border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base text-dash-ink">
                      Active Status
                    </FormLabel>
                    <p className="text-sm text-dash-accent">
                      {field.value
                        ? "Ticket is available for purchase"
                        : "Ticket sales are paused"}
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="saleStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-dash-ink">
                      Sale Start Date
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        className="border-dash-border focus:border-dash-accent-strong"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <p className="text-xs text-dash-accent">
                      When sales begin
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="saleEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-dash-ink">
                      Sale End Date
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        className="border-dash-border focus:border-dash-accent-strong"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <p className="text-xs text-dash-accent">When sales end</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
                className="border-dash-accent text-dash-muted hover:bg-dash-highlight"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-dash-accent hover:bg-dash-accent-strong text-white"
              >
                {isSubmitting ? "Updating..." : "Update Ticket Type"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}