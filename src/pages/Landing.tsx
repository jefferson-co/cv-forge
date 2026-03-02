import { Codepen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Codepen className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">Modiq</span>
        </div>

        {/* Header & Subtext */}
        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
          Build Job-Winning CVs
        </h1>
        <p className="text-muted-foreground text-lg mb-10">
          AI-powered CV builder that helps you land more interviews.
        </p>

        {/* Auth Buttons */}
        <div className="flex flex-col gap-3">
          <Link to="/signup">
            <Button size="lg" className="w-full">Sign Up</Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg" className="w-full">Log In</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;
