import { Globe, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ConvertCV = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Globe className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">Modiq</span>
          </Link>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Globe className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Convert CV to Country Format</h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Adapt your CV to meet specific country standards and expectations
            </p>
            <p className="text-muted-foreground mt-8">Coming soon...</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConvertCV;
