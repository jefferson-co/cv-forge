import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { useCVForm } from "@/contexts/CVFormContext";
import { TEMPLATES } from "@/types/cv";
import CreateCVLayout from "@/components/create-cv/CreateCVLayout";
import ProgressIndicator from "@/components/create-cv/ProgressIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TemplatePage = () => {
  const navigate = useNavigate();
  const { selectedCountry, selectedTemplate, setSelectedTemplate, formData } = useCVForm();

  const getTemplatePreview = (templateId: string) => {
    // Generate a simple visual representation based on template type
    switch (templateId) {
      case 'modern':
        return (
          <div className="space-y-2 p-4">
            <div className="flex gap-4">
              <div className="w-1/3 space-y-2">
                <div className="h-3 bg-primary/20 rounded" />
                <div className="h-2 bg-muted rounded w-3/4" />
                <div className="h-2 bg-muted rounded w-1/2" />
                <div className="mt-4 space-y-1">
                  <div className="h-2 bg-primary/30 rounded w-full" />
                  <div className="h-2 bg-primary/30 rounded w-full" />
                </div>
              </div>
              <div className="w-2/3 space-y-2">
                <div className="h-4 bg-primary rounded w-2/3" />
                <div className="h-2 bg-muted rounded w-full" />
                <div className="h-2 bg-muted rounded w-full" />
                <div className="h-2 bg-muted rounded w-3/4" />
              </div>
            </div>
          </div>
        );
      case 'classic':
        return (
          <div className="space-y-2 p-4">
            <div className="text-center space-y-1">
              <div className="h-4 bg-foreground/80 rounded w-1/2 mx-auto" />
              <div className="h-2 bg-muted rounded w-1/3 mx-auto" />
            </div>
            <div className="border-t border-border my-2" />
            <div className="space-y-1">
              <div className="h-2 bg-muted rounded" />
              <div className="h-2 bg-muted rounded" />
              <div className="h-2 bg-muted rounded w-3/4" />
            </div>
          </div>
        );
      case 'minimal':
        return (
          <div className="space-y-3 p-6">
            <div className="h-3 bg-foreground/80 rounded w-1/3" />
            <div className="h-2 bg-muted rounded w-2/3" />
            <div className="h-2 bg-muted rounded w-full" />
            <div className="h-2 bg-muted rounded w-1/2" />
          </div>
        );
      case 'executive':
        return (
          <div className="space-y-2 p-4">
            <div className="border-2 border-foreground/20 p-3 rounded">
              <div className="h-4 bg-foreground/80 rounded w-1/2" />
              <div className="h-2 bg-muted rounded w-1/3 mt-1" />
            </div>
            <div className="space-y-1 mt-2">
              <div className="h-2 bg-muted rounded" />
              <div className="h-2 bg-muted rounded w-5/6" />
            </div>
          </div>
        );
      case 'creative':
        return (
          <div className="p-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/30" />
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-primary rounded w-1/2" />
                <div className="h-2 bg-muted rounded w-1/3" />
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <div className="h-2 bg-muted rounded" />
              <div className="h-2 bg-muted rounded w-4/5" />
            </div>
          </div>
        );
      case 'technical':
        return (
          <div className="space-y-2 p-4 font-mono">
            <div className="flex gap-2 text-xs">
              <div className="h-3 bg-primary/20 rounded px-2 w-12" />
              <div className="h-3 bg-primary/20 rounded px-2 w-16" />
              <div className="h-3 bg-primary/20 rounded px-2 w-10" />
            </div>
            <div className="h-3 bg-foreground/80 rounded w-2/3" />
            <div className="space-y-1">
              <div className="h-2 bg-muted rounded" />
              <div className="h-2 bg-muted rounded w-5/6" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <CreateCVLayout backTo="/create-cv/preview">
      <ProgressIndicator 
        currentStep={3} 
        totalSteps={3} 
        stepLabels={['Your Information', 'Preview', 'Download']} 
      />

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Almost there! Choose a template
        </h1>
        <p className="text-muted-foreground">
          Pick a design that matches your style
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {TEMPLATES.map((template) => (
          <Card 
            key={template.id}
            className={cn(
              "cursor-pointer transition-all duration-200 overflow-hidden",
              selectedTemplate === template.id 
                ? "ring-2 ring-primary shadow-glow" 
                : "hover:border-primary/50"
            )}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <div className="aspect-[3/4] bg-secondary/30 relative">
              {getTemplatePreview(template.id)}
              {selectedTemplate === template.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground">{template.name}</h3>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border py-4 px-6 z-40">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/create-cv/preview')}>
            Back
          </Button>
          <Button onClick={() => navigate('/create-cv/download')}>
            Continue with {TEMPLATES.find(t => t.id === selectedTemplate)?.name}
          </Button>
        </div>
      </div>

      <div className="h-24" />
    </CreateCVLayout>
  );
};

export default TemplatePage;
