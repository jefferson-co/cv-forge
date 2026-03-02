import { ArrowRight, Codepen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen surface-dark relative overflow-hidden">
      {/* Dot grid background */}
      <div className="absolute inset-0 dot-grid dot-grid-fade pointer-events-none" />
      
      {/* Subtle radial glow behind content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-lg text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-16 animate-fade-up opacity-0 stagger-1">
            <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-glow">
              <Codepen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-[hsl(var(--surface-dark-foreground))] font-display">
              Modiq
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-[hsl(var(--surface-dark-foreground))] tracking-tight leading-[1.08] mb-6 font-display animate-fade-up opacity-0 stagger-2">
            Build Job-Winning
            <br />
            <span className="text-primary">CVs</span> in Minutes
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-[hsl(var(--surface-dark-muted))] max-w-md mx-auto mb-12 animate-fade-up opacity-0 stagger-3">
            AI-powered CV builder that helps you land more interviews.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up opacity-0 stagger-4">
            <Link to="/signup">
              <Button size="lg" className="min-w-[160px] gap-2 shadow-glow text-base h-12">
                Sign Up
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="outline"
                size="lg"
                className="min-w-[160px] text-base h-12 border-[hsl(0_0%_25%)] text-[hsl(var(--surface-dark-foreground))] hover:bg-[hsl(0_0%_12%)] bg-transparent"
              >
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
