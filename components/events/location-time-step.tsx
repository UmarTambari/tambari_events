// app/dashboard/events/create/location-time-step.tsx
"use client";

import { useFormContext } from "react-hook-form";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import type { CreateEventFormValues } from "@/lib/types/event.type";

// Safe helpers
const formatDateDisplay = (iso?: string | null) => {
  if (!iso) return "Pick a date";
  try {
    return format(parseISO(iso), "PPP");
  } catch {
    return "Invalid date";
  }
};

const formatTimeInput = (iso?: string | null) => {
  if (!iso) return "";
  try {
    return format(parseISO(iso), "HH:mm");
  } catch {
    return "";
  }
};

const parseDateSafe = (iso?: string | null): Date | undefined => {
  if (!iso) return undefined;
  try {
    const date = parseISO(iso);
    return isNaN(date.getTime()) ? undefined : date;
  } catch {
    return undefined;
  }
};

export function LocationTimeStep() {
  const { control, watch, setValue } = useFormContext<CreateEventFormValues>();

  const eventDate = watch("eventDate");
  const eventEndDate = watch("eventEndDate");

  const updateDateTime = (
    field: "eventDate" | "eventEndDate",
    datePart: string | null,
    timePart: string
  ) => {
    if (!datePart || !timePart) {
      setValue(field, "", { shouldValidate: true });
      return;
    }

    const fullDate = `${datePart}T${timePart}:00`;
    setValue(field, fullDate, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-dash-ink mb-2">
          Location & Time
        </h2>
        <p className="text-sm text-dash-muted">
          Where and when will your event take place?
        </p>
      </div>

      <div className="space-y-6">
        {/* Venue */}
        <FormField
          control={control}
          name="venue"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-dash-ink">
                Venue Name <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Eko Convention Center"
                  className="border-dash-border focus:border-dash-accent-strong"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location */}
        <FormField
          control={control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-dash-ink">
                City, State <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Lagos, Nigeria"
                  className="border-dash-border focus:border-dash-accent-strong"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date & Time Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Start Date & Time */}
          <div className="space-y-3">
            <FormLabel className="text-dash-ink">
              Start Date & Time <span className="text-red-500">*</span>
            </FormLabel>

            <FormField
              control={control}
              name="eventDate"
              render={({ field }) => (
                <FormItem>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal border-dash-border",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formatDateDisplay(field.value)}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={parseDateSafe(field.value)}
                        onSelect={(date) => {
                          const dateStr = date
                            ? format(date, "yyyy-MM-dd")
                            : null;
                          const currentTime = field.value
                            ? formatTimeInput(field.value)
                            : "10:00";
                          updateDateTime("eventDate", dateStr, currentTime);
                        }}
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Input
                    type="time"
                    value={formatTimeInput(field.value)}
                    onChange={(e) => {
                      const datePart = field.value?.split("T")[0] || null;
                      updateDateTime("eventDate", datePart, e.target.value);
                    }}
                    className="border-dash-border focus:border-dash-accent-strong"
                  />

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* End Date & Time */}
          <div className="space-y-3">
            <FormLabel className="text-dash-ink">
              End Date & Time (Optional)
            </FormLabel>

            <FormField
              control={control}
              name="eventEndDate"
              render={({ field }) => (
                <FormItem>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal border-dash-border",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formatDateDisplay(field.value)}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={parseDateSafe(field.value)}
                        onSelect={(date) => {
                          const dateStr = date
                            ? format(date, "yyyy-MM-dd")
                            : null;
                          const currentTime = field.value
                            ? formatTimeInput(field.value)
                            : "17:00";
                          updateDateTime("eventEndDate", dateStr, currentTime);
                        }}
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Input
                    type="time"
                    value={formatTimeInput(field.value)}
                    onChange={(e) => {
                      const datePart = field.value?.split("T")[0] || null;
                      updateDateTime("eventEndDate", datePart, e.target.value);
                    }}
                    disabled={!field.value}
                    className="border-dash-border focus:border-dash-accent-strong"
                  />

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Total Capacity */}
        <FormField
          control={control}
          name="totalCapacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-dash-ink">Total Capacity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Leave empty for unlimited"
                  className="border-dash-border focus:border-dash-accent-strong"
                  min="1"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              </FormControl>
              <p className="text-xs text-dash-accent">
                Maximum number of attendees for this event
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
