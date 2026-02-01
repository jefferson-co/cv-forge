import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { useCVForm } from "@/contexts/CVFormContext";
import { TEMPLATES } from "@/types/cv";
import CreateCVLayout from "@/components/create-cv/CreateCVLayout";
import ProgressIndicator from "@/components/create-cv/ProgressIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Import template preview images
import modernTemplate from "@/assets/templates/modern-template.png";
import classicTemplate from "@/assets/templates/classic-template.png";
import minimalTemplate from "@/assets/templates/minimal-template.png";
import executiveTemplate from "@/assets/templates/executive-template.png";
import creativeTemplate from "@/assets/templates/creative-template.png";
import technicalTemplate from "@/assets/templates/technical-template.png";

const templateImages: Record<string, string> = {
  modern: modernTemplate,
  classic: classicTemplate,
  minimal: minimalTemplate,
  executive: executiveTemplate,
  creative: creativeTemplate,
  technical: technicalTemplate,
};

const TemplatePage = () => {
  const navigate = useNavigate();
  const { selectedTemplate, setSelectedTemplate } = useCVForm();

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
            <div className="aspect-[3/4] bg-white relative border-b overflow-hidden">
              <img 
                src={templateImages[template.id]} 
                alt={`${template.name} template preview`}
                className="w-full h-full object-cover object-top"
              />
              {selectedTemplate === template.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
            <CardContent className="p-4 bg-card">
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
