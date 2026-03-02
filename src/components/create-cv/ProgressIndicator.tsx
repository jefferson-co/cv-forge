import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

const ProgressIndicator = ({ currentStep, totalSteps, stepLabels }: ProgressIndicatorProps) => {
  return (
    <motion.div 
      className="mb-8"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex items-center justify-center">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          const isActive = isCompleted || isCurrent;

          return (
            <div key={step} className="flex items-center">
              {/* Step circle */}
              <motion.div
                className={cn(
                  "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300 border-2",
                  isActive
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background border-muted-foreground/30 text-muted-foreground"
                )}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.1, ease: "easeOut" }}
              >
                {isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} /> : step}
              </motion.div>
              {/* Connector line */}
              {step < totalSteps && (
                <motion.div
                  className={cn(
                    "h-0.5 w-10 sm:w-16 origin-left",
                    step < currentStep ? "bg-primary" : "bg-muted-foreground/20"
                  )}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.1 + 0.15, ease: "easeOut" }}
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
    </motion.div>
  );
};

export default ProgressIndicator;
