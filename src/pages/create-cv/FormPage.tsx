import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { useCVForm } from "@/contexts/CVFormContext";
import CreateCVLayout from "@/components/create-cv/CreateCVLayout";
import ProgressIndicator from "@/components/create-cv/ProgressIndicator";
import PersonalInfoSection from "@/components/create-cv/form/PersonalInfoSection";
import SummarySection from "@/components/create-cv/form/SummarySection";
import EducationSection from "@/components/create-cv/form/EducationSection";
import WorkExperienceSection from "@/components/create-cv/form/WorkExperienceSection";
import SkillsSection from "@/components/create-cv/form/SkillsSection";
import ProjectsSection from "@/components/create-cv/form/ProjectsSection";
import CustomSectionsSection from "@/components/create-cv/form/CustomSectionsSection";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const FormPage = () => {
  const navigate = useNavigate();
  const { formData, saveDraft, isSaving, lastSaved } = useCVForm();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (formData.fullName || formData.email) {
        saveDraft();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [formData, saveDraft]);

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.fullName.trim()) errors.push('Full Name is required');
    if (!formData.professionalTitle.trim()) errors.push('Professional Title is required');
    if (!formData.email.trim()) errors.push('Email is required');
    if (!formData.phone.trim()) errors.push('Phone is required');
    if (!formData.location.trim()) errors.push('Location is required');

    setValidationErrors(errors);

    if (errors.length > 0) {
      toast({
        title: "Please complete required fields",
        description: errors[0],
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleContinue = () => {
    if (validateForm()) {
      navigate('/create-cv/preview');
    }
  };

  const handleSaveDraft = async () => {
    await saveDraft();
    navigate('/dashboard');
  };

  return (
    <CreateCVLayout backTo="/create-cv">
      <ProgressIndicator 
        currentStep={1} 
        totalSteps={3} 
        stepLabels={['Your Information', 'Preview', 'Download']} 
      />

      <form className="space-y-12" onSubmit={(e) => e.preventDefault()}>
        <PersonalInfoSection />
        <SummarySection />
        <EducationSection />
        <WorkExperienceSection />
        <SkillsSection />
        <ProjectsSection />
        <CustomSectionsSection />
      </form>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border py-4 px-6 z-40">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleSaveDraft}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Draft'
              )}
            </Button>
            {lastSaved && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" />
                Draft saved
              </span>
            )}
          </div>
          <Button onClick={handleContinue}>
            Continue
          </Button>
        </div>
      </div>

      {/* Spacer for sticky bar */}
      <div className="h-24" />
    </CreateCVLayout>
  );
};

export default FormPage;
