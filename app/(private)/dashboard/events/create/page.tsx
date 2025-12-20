"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateEventWizard } from "@/components/events/create-event-wizard";
import { StepIndicator } from "@/components/events/step-indicator";

const steps = [
  { id: 1, name: "Basic Info", description: "Event details" },
  { id: 2, name: "Location & Time", description: "When and where" },
  { id: 3, name: "Tickets", description: "Ticket types" },
  { id: 4, name: "Images", description: "Banners & thumbnails" },
  { id: 5, name: "Review", description: "Review and publish" },
];

export default function CreateEventPage() {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/events">
          <Button variant="ghost" size="sm" className="text-[#3E7B27] mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-[#123524]">Create New Event</h1>
        <p className="text-[#3E7B27] mt-1">
          Fill in the details below to create your event
        </p>
      </div>

      <StepIndicator steps={steps} currentStep={currentStep} />

      <CreateEventWizard
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        totalSteps={steps.length}
      />
    </div>
  );
}