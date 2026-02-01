import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

const ProgressIndicator = ({ currentStep, totalSteps, stepLabels }: ProgressIndicatorProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">
          Step {currentStep} of {totalSteps}: {stepLabels[currentStep - 1]}
        </span>
        <span className="text-sm text-muted-foreground">
          {Math.round((currentStep / totalSteps) * 100)}% complete
        </span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        {stepLabels.map((label, index) => (
          <div 
            key={label}
            className={cn(
              "text-xs hidden sm:block",
              index + 1 <= currentStep ? "text-primary" : "text-muted-foreground"
            )}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;
