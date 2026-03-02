import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

const ProgressIndicator = ({ currentStep, totalSteps, stepLabels }: ProgressIndicatorProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          const isActive = isCompleted || isCurrent;

          return (
            <div key={step} className="flex items-center">
              {/* Step circle */}
              <div
                className={cn(
                  "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 border-2",
                  isActive
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {step}
              </div>
              {/* Connector line */}
              {step < totalSteps && (
                <div
                  className={cn(
                    "h-0.5 w-10 sm:w-16 transition-all duration-300",
                    step < currentStep ? "bg-primary" : "bg-muted-foreground/20"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      {/* Step label below */}
      <p className="text-center text-sm text-muted-foreground mt-3">
        Step {currentStep}: {stepLabels[currentStep - 1]}
      </p>
    </div>
  );
};

export default ProgressIndicator;
