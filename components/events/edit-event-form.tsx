"use client";

import { useForm, FormProvider }  from "react-hook-form";
import type { UseFormReturn }     from "react-hook-form";
import { zodResolver }            from "@hookform/resolvers/zod";
import Link          from "next/link";
import { useRouter } from "next/navigation";
import { toast }     from "sonner";

import {
  editEventFormSchema,
  type EditEventFormValues,
  type CreateEventFormValues,
  type Event,
} from "@/lib/types/event.type";
import { dateToEventFormValue } from "@/lib/helpers/event-form-dates";
import { getErrorMessage } from "@/lib/error";
import { BasicInfoStep } from "@/components/events/basic-info-step";
import { LocationTimeStep } from "@/components/events/location-time-step";
import { ImagesStep } from "@/components/events/images-step";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

function eventToFormDefaults(event: Event): EditEventFormValues {
  return {
    title: event.title,
    description: event.description,
    category: event.category ?? "",
    tags: event.tags ?? [],
    venue: event.venue,
    location: event.location,
    eventDate: dateToEventFormValue(new Date(event.eventDate)),
    eventEndDate: event.eventEndDate
      ? dateToEventFormValue(new Date(event.eventEndDate))
      : "",
    totalCapacity:
      event.totalCapacity != null ? String(event.totalCapacity) : "",
    bannerImageUrl: event.bannerImageUrl ?? "",
    thumbnailImageUrl: event.thumbnailImageUrl ?? "",
    isPublished: event.isPublished,
  };
}

interface EditEventFormProps {
  event: Event;
}

export function EditEventForm({ event }: EditEventFormProps) {
  const router = useRouter();

  const methods = useForm<EditEventFormValues>({
    resolver: zodResolver(editEventFormSchema),
    defaultValues: eventToFormDefaults(event),
    mode: "onTouched",
  });

  const { handleSubmit, formState } = methods;
  const { isSubmitting } = formState;

  const onSubmit = async (data: EditEventFormValues) => {
    const payload = {
      title: data.title.trim(),
      description: data.description.trim(),
      venue: data.venue.trim(),
      location: data.location.trim(),
      category: data.category.trim() || null,
      tags: data.tags?.length ? data.tags : [],
      eventDate: new Date(data.eventDate).toISOString(),
      eventEndDate:
        data.eventEndDate?.trim() !== ""
          ? new Date(data.eventEndDate).toISOString()
          : null,
      totalCapacity:
        data.totalCapacity !== undefined &&
        String(data.totalCapacity).trim() !== ""
          ? parseInt(String(data.totalCapacity), 10)
          : null,
      bannerImageUrl: data.bannerImageUrl?.trim()
        ? data.bannerImageUrl.trim()
        : null,
      thumbnailImageUrl: data.thumbnailImageUrl?.trim()
        ? data.thumbnailImageUrl.trim()
        : null,
      isPublished: data.isPublished,
    };

    const res = await fetch(`/api/dashboard/events/${event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(result.error || "Failed to update event");
    }

    const nextSlug = result.data?.slug as string | undefined;
    toast.success("Event saved");
    router.push(`/dashboard/events/${nextSlug ?? event.slug}`);
    router.refresh();
  };

  return (
    <FormProvider
      {...(methods as unknown as UseFormReturn<CreateEventFormValues>)}
    >
      <form
        onSubmit={handleSubmit(
          async (data) => {
            try {
              await onSubmit(data);
            } catch (err) {
              toast.error(getErrorMessage(err, "Failed to update event"));
            }
          },
          () => {
            toast.error("Please fix the errors highlighted below.");
          }
        )}
        className="space-y-8"
      >
        <Card className="bg-white border-[#85A947]/20">
          <CardContent className="p-6 space-y-6">
            <BasicInfoStep />
          </CardContent>
        </Card>

        <Card className="bg-white border-[#85A947]/20">
          <CardContent className="p-6 space-y-6">
            <LocationTimeStep />
          </CardContent>
        </Card>

        <Card className="bg-white border-[#85A947]/20">
          <CardContent className="p-6 space-y-6">
            <ImagesStep />
          </CardContent>
        </Card>

        <Card className="bg-white border-[#85A947]/20">
          <CardContent className="p-6 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-[#123524] mb-1">
                Visibility
              </h2>
              <p className="text-sm text-[#3E7B27]">
                Published events appear on the public events page.
              </p>
            </div>
            <FormField
              control={methods.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-[#85A947]/20 p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-[#123524]">
                      Published
                    </FormLabel>
                    <p className="text-sm text-[#3E7B27]">
                      {field.value
                        ? "This event is visible to the public."
                        : "Draft — only you can see this event."}
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            asChild
            className="border-[#85A947] text-[#3E7B27] hover:bg-[#EFE3C2]"
          >
            <Link href={`/dashboard/events/${event.slug}`}>Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#85A947] hover:bg-[#3E7B27] text-white"
          >
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
