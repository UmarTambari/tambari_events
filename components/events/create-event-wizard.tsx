"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import {
  createEventFormSchema,
  type CreateEventFormValues,
} from "@/lib/types/event.type";

import { BasicInfoStep } from "./basic-info-step";
import { LocationTimeStep } from "./location-time-step";
import { TicketsStep } from "./tickets-step";
import { ImagesStep } from "./images-step";
import { ReviewStep } from "./review-step";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/error";

interface CreateEventWizardProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
}

export function CreateEventWizard({
  currentStep,
  setCurrentStep,
  totalSteps,
}: CreateEventWizardProps) {
  const router = useRouter();

  const methods = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      tags: [],
      venue: "",
      location: "",
      eventDate: "",
      eventEndDate: "",
      totalCapacity: "",
      ticketTypes: [
        {
          id: crypto.randomUUID(),
          name: "",
          price: "",
          quantity: "",
          minPurchase: "1",
          maxPurchase: "10",
          description: "",
          saleStartDate: null,
          saleEndDate: null,
        },
      ],
      bannerImageUrl: "",
      thumbnailImageUrl: "",
      isPublished: false,
    },
    mode: "onTouched",
  });

  const { handleSubmit, trigger, formState } = methods;
  const { isSubmitting } = formState;

  const getFieldsForStep = (step: number): (keyof CreateEventFormValues)[] => {
    switch (step) {
      case 1:
        return ["title", "description", "category", "tags"];
      case 2:
        return ["venue", "location", "eventDate"];
      case 3:
        return ["ticketTypes"];
      case 4:
        return ["bannerImageUrl", "thumbnailImageUrl"];
      default:
        return [];
    }
  };

  const handleNext = async () => {
    const fields = getFieldsForStep(currentStep);
    const valid = await trigger(fields);
    if (valid && currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const onSubmit = async (data: CreateEventFormValues, publish: boolean) => {
    const eventData = {
      title: data.title,
      description: data.description,
      venue: data.venue,
      location: data.location,
      category: data.category || null,
      tags: data.tags,
      eventDate: new Date(data.eventDate).toISOString(),
      eventEndDate: data.eventEndDate
        ? new Date(data.eventEndDate).toISOString()
        : null,
      totalCapacity: data.totalCapacity ? parseInt(data.totalCapacity) : null,
      bannerImageUrl: data.bannerImageUrl || null,
      thumbnailImageUrl: data.thumbnailImageUrl || null,
      isPublished: publish,
      // CRITICAL FIX: Include ticketTypes
      ticketTypes: data.ticketTypes.map((ticket) => ({
        name: ticket.name,
        description: ticket.description || null,
        price: ticket.price,
        quantity: ticket.quantity,
        minPurchase: ticket.minPurchase || "1",
        maxPurchase: ticket.maxPurchase || "10",
        saleStartDate: ticket.saleStartDate
          ? new Date(ticket.saleStartDate).toISOString()
          : null,
        saleEndDate: ticket.saleEndDate
          ? new Date(ticket.saleEndDate).toISOString()
          : null,
      })),
    };

    try {
      const res = await fetch("/api/dashboard/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create event");
      }

      const result = await res.json();
      console.log("Event created successfully:", result);

      router.push("/dashboard/events?created=true");
    } catch (err) {
      console.error("Error creating event:", err);
      throw err; // Re-throw for toast.promise to catch
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((data) => onSubmit(data, true))}>
        <div className="space-y-6">
          <Card className="bg-white border-[#85A947]/20">
            <CardContent className="p-6">
              {currentStep === 1 && <BasicInfoStep />}
              {currentStep === 2 && <LocationTimeStep />}
              {currentStep === 3 && <TicketsStep />}
              {currentStep === 4 && <ImagesStep />}
              {currentStep === 5 && <ReviewStep />}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1 || isSubmitting}
              className="border-[#85A947] text-[#3E7B27] hover:bg-[#EFE3C2]"
            >
              Previous
            </Button>

            <div className="flex gap-3">
              {currentStep === totalSteps ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      return toast.promise(
                        handleSubmit(async (d) => {
                          try {
                            await onSubmit(d, false);
                          } catch (err) {
                            toast.error(
                              getErrorMessage(err, "Failed to save draft")
                            );
                            throw err;
                          }
                        })(),
                        {
                          loading: "Saving draft...",
                          success: "Draft saved successfully!",
                          error: "Failed to save draft",
                        }
                      );
                    }}
                    disabled={isSubmitting}
                    className="border-[#85A947] text-[#3E7B27] hover:bg-[#EFE3C2]"
                  >
                    {isSubmitting ? "Saving..." : "Save as Draft"}
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={() =>
                      toast.promise(
                        handleSubmit(async (d) => {
                          try {
                            await onSubmit(d, true);
                          } catch (err) {
                            toast.error(
                              getErrorMessage(err, "Failed to publish event")
                            );
                            throw err;
                          }
                        })(),
                        {
                          loading: "Publishing event...",
                          success: "Event published successfully!",
                          error: "Failed to publish event",
                        }
                      )
                    }
                    className="bg-[#85A947] hover:bg-[#3E7B27] text-white"
                  >
                    {isSubmitting ? "Publishing..." : "Publish Event"}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-[#85A947] hover:bg-[#3E7B27] text-white"
                >
                  Next Step
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
