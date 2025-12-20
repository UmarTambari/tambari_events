"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { z } from "zod";

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
import { toast } from "sonner";
import {
  addTicketFormSchema,
  AddTicketFormData,
  transformTicketFormToAPI,
  transformTicketAPIToForm,
} from "@/lib/types/ticketTypesForm";
import { TicketType } from "@/lib/types/ticketTypes.types";

type AddTicketFormValues = z.infer<typeof addTicketFormSchema>;

interface AddTicketDialogProps {
  eventId: string;
  ticket: TicketType;
  onSuccess: () => void;
}

export function AddTicketDialog({
  eventId,
  ticket,
  onSuccess,
}: AddTicketDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddTicketFormValues>({
    resolver: zodResolver(addTicketFormSchema),
    defaultValues: transformTicketAPIToForm(ticket),
  });

  const onSubmit = async (data: AddTicketFormData) => {
    setIsSubmitting(true);

    try {
      const apiPayload = {
        ...transformTicketFormToAPI(data),
        isActive: true, // New tickets are active by default
      };

      const response = await fetch(`/api/dashboard/events/${eventId}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create ticket");
      }

      toast.success("Ticket type created successfully!");
      form.reset();
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create ticket"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#85A947] hover:bg-[#3E7B27] text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add Ticket Type
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#123524]">
            Create New Ticket Type
          </DialogTitle>
          <DialogDescription className="text-[#3E7B27]">
            Add a new ticket type for your event with pricing and availability
            details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#123524]">
                    Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Early Bird, VIP, Regular"
                      className="border-[#85A947]/20 focus:border-[#3E7B27]"
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
                  <FormLabel className="text-[#123524]">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of this ticket type"
                      rows={3}
                      className="resize-none border-[#85A947]/20 focus:border-[#3E7B27]"
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
                    <FormLabel className="text-[#123524]">
                      Price (₦) <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1000"
                        min="100"
                        step="0.01"
                        className="border-[#85A947]/20 focus:border-[#3E7B27]"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-[#85A947]">Price in Naira</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#123524]">
                      Quantity <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100"
                        min="1"
                        className="border-[#85A947]/20 focus:border-[#3E7B27]"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-[#85A947]">Available tickets</p>
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
                    <FormLabel className="text-[#123524]">
                      Min Purchase
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        className="border-[#85A947]/20 focus:border-[#3E7B27]"
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
                    <FormLabel className="text-[#123524]">
                      Max Purchase
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        className="border-[#85A947]/20 focus:border-[#3E7B27]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="saleStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#123524]">
                      Sale Start Date
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        className="border-[#85A947]/20 focus:border-[#3E7B27]"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <p className="text-xs text-[#85A947]">When sales begin</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="saleEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#123524]">
                      Sale End Date
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        className="border-[#85A947]/20 focus:border-[#3E7B27]"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <p className="text-xs text-[#85A947]">When sales end</p>
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
                className="border-[#85A947] text-[#3E7B27] hover:bg-[#EFE3C2]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#85A947] hover:bg-[#3E7B27] text-white"
              >
                {isSubmitting ? "Creating..." : "Create Ticket Type"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
