import { FileText, Plus, Target, Globe, Shield, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const EmptyState = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl surface-dark min-h-[70vh] flex items-center justify-center">
      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid dot-grid-fade pointer-events-none" />

      {/* Radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/6 blur-3xl pointer-events-none" />

      {/* Floating decorative elements */}
      <div className="absolute top-16 left-[15%] w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center animate-float opacity-40">
        <FileText className="w-5 h-5 text-primary" />
      </div>
      <div className="absolute top-24 right-[18%] w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center animate-float opacity-30" style={{ animationDelay: "1.5s" }}>
        <Target className="w-4 h-4 text-primary" />
      </div>
      <div className="absolute bottom-24 left-[22%] w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center animate-float opacity-25" style={{ animationDelay: "3s" }}>
        <Shield className="w-4 h-4 text-primary" />
      </div>
      <div className="absolute bottom-32 right-[15%] w-7 h-7 rounded-md bg-primary/6 flex items-center justify-center animate-float opacity-20" style={{ animationDelay: "4.5s" }}>
        <Globe className="w-3.5 h-3.5 text-primary" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-lg">
        {/* Icon cluster */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 rounded-2xl bg-primary/15 animate-pulse-slow" />
          <div className="relative w-full h-full rounded-2xl bg-primary/10 flex items-center justify-center shadow-glow">
            <Sparkles className="w-9 h-9 text-primary" />
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-[hsl(var(--surface-dark-foreground))] mb-3 font-display animate-fade-up opacity-0 stagger-1">
          Your CV journey starts here
        </h2>
        <p className="text-[hsl(var(--surface-dark-muted))] mb-10 text-base leading-relaxed animate-fade-up opacity-0 stagger-2">
          Create your first professional CV in minutes with AI-powered tools that help you stand out.
        </p>

        {/* Action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 animate-fade-up opacity-0 stagger-3">
          <ActionCard
            to="/create-cv"
            icon={<Plus className="w-4 h-4" />}
            title="Create from Scratch"
            description="Guided AI builder"
          />
          <ActionCard
            to="/tailor"
            icon={<Target className="w-4 h-4" />}
            title="Tailor to Job"
            description="Match a job description"
          />
          <ActionCard
            to="/convert"
            icon={<Globe className="w-4 h-4" />}
            title="Convert Format"
            description="Country standards"
          />
          <ActionCard
            to="/ats-check"
            icon={<Shield className="w-4 h-4" />}
            title="ATS Check"
            description="Score compatibility"
          />
        </div>

        <Link to="/create-cv" className="animate-fade-up opacity-0 stagger-4 inline-block">
          <Button size="lg" className="gap-2 shadow-glow">
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

const ActionCard = ({
  to,
  icon,
  title,
  description,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <Link
    to={to}
    className="group flex items-center gap-3 rounded-xl border border-[hsl(0_0%_18%)] bg-[hsl(0_0%_8%)] p-4 text-left hover:border-primary/30 hover:bg-[hsl(0_0%_10%)] transition-all duration-200"
  >
    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary group-hover:bg-primary/20 transition-colors">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-sm font-medium text-[hsl(var(--surface-dark-foreground))]">{title}</p>
      <p className="text-xs text-[hsl(var(--surface-dark-muted))]">{description}</p>
    </div>
  </Link>
);
