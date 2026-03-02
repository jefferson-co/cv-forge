import { useNavigate } from "react-router-dom";
import { Check, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useTailorCV } from "@/contexts/TailorCVContext";
import { TEMPLATES, COUNTRIES } from "@/types/cv";
import CreateCVLayout from "@/components/create-cv/CreateCVLayout";
import ProgressIndicator from "@/components/create-cv/ProgressIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Import template images
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

const TailorTemplatePage = () => {
  const navigate = useNavigate();
  const { data, setSelectedTemplate } = useTailorCV();

  const countryData = COUNTRIES.find(c => c.code === data.selectedCountry);

  return (
    <CreateCVLayout backTo="/tailor-cv/country">
      <ProgressIndicator 
        currentStep={2} 
        totalSteps={3} 
        stepLabels={['Country', 'Template', 'Download']} 
      />

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Choose a Template for Your {countryData?.name} CV
        </h1>
        <p className="text-muted-foreground">
          Pick a professional design that matches your style
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {TEMPLATES.map((template, i) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07, ease: "easeOut" }}
          >
            <Card 
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 overflow-hidden",
                data.selectedTemplate === template.id 
                  ? "ring-2 ring-primary shadow-lg" 
                  : "hover:border-primary/50"
              )}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <CardContent className="p-0">
                <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                  <img 
                    src={templateImages[template.id]} 
                    alt={`${template.name} template preview`}
                    className="w-full h-full object-cover object-top"
                  />
                  {data.selectedTemplate === template.id && (
                    <div className="absolute top-3 right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border py-3 px-4 sm:py-4 sm:px-6 z-40">
        <div className="container mx-auto max-w-4xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <Button variant="outline" onClick={() => navigate('/tailor-cv/country')} className="w-full sm:w-auto gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button onClick={() => navigate('/tailor-cv/download')} className="w-full sm:w-auto">
            Continue with {TEMPLATES.find(t => t.id === data.selectedTemplate)?.name}
          </Button>
        </div>
      </div>

      <div className="h-24" />
    </CreateCVLayout>
  );
};

export default TailorTemplatePage;
