"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle, Circle, ChevronRight } from "lucide-react";

interface Step {
  title: string;
  content: JSX.Element;
}

interface StepperProps {
  steps: Step[];
}

export default function Stepper({ steps }: StepperProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6">
      {/* Stepper Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-2",
              index <= currentStep ? "text-primary" : "text-muted-foreground"
            )}
          >
            {index < currentStep ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <Circle className="w-6 h-6" />
            )}
            <span className="text-sm font-medium">{step.title}</span>
            {index < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
          </div>
        ))}
      </div>

      {/* Stepper Content */}
      <div className="p-4 bg-muted rounded-lg shadow">
        {steps[currentStep].content}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between">
        <Button
          onClick={prevStep}
          disabled={currentStep === 0}
          variant="outline"
        >
          Previous
        </Button>
        <Button onClick={nextStep} disabled={currentStep === steps.length - 1}>
          Next
        </Button>
      </div>
    </div>
  );
}
