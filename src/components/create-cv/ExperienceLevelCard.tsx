import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExperienceLevelCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  isSelected?: boolean;
  onClick: () => void;
}

const ExperienceLevelCard = ({ 
  icon: Icon, 
  title, 
  description, 
  isSelected,
  onClick 
}: ExperienceLevelCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center p-8 rounded-xl border-2 transition-all duration-200",
        "bg-card hover:shadow-lg",
        isSelected 
          ? "border-primary shadow-glow" 
          : "border-border hover:border-primary/50"
      )}
    >
      <div className={cn(
        "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors",
        isSelected ? "bg-primary" : "bg-secondary group-hover:bg-primary/10"
      )}>
        <Icon className={cn(
          "w-8 h-8 transition-colors",
          isSelected ? "text-primary-foreground" : "text-primary"
        )} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground text-center">{description}</p>
    </button>
  );
};

export default ExperienceLevelCard;
