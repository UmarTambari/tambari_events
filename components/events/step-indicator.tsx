import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  name: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={cn(
              "relative flex flex-col items-center",
              index < steps.length - 1 && "flex-1"
            )}
          >
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "absolute left-1/2 top-5 h-0.5 w-full",
                  step.id < currentStep ? "bg-[#85A947]" : "bg-[#85A947]/20"
                )}
                style={{ transform: "translateX(50%)" }}
              />
            )}

            {/* Step circle */}
            <div className="relative flex items-center justify-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  step.id < currentStep &&
                    "border-[#85A947] bg-[#85A947] text-white",
                  step.id === currentStep &&
                    "border-[#3E7B27] bg-white text-[#3E7B27]",
                  step.id > currentStep &&
                    "border-[#85A947]/20 bg-white text-[#85A947]"
                )}
              >
                {step.id < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="font-semibold">{step.id}</span>
                )}
              </div>
            </div>

            {/* Step label */}
            <div className="mt-2 text-center">
              <p
                className={cn(
                  "text-sm font-medium",
                  step.id === currentStep
                    ? "text-[#123524]"
                    : "text-[#85A947]"
                )}
              >
                {step.name}
              </p>
              <p className="text-xs text-[#85A947] hidden sm:block">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}