import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { supabase } from "@/integrations/supabase/client";
import { CVFormData } from "@/types/cv";

const FormPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { formData, setFormData, saveDraft, isSaving, lastSaved } = useCVForm();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const editId = searchParams.get('edit');

  // Load existing CV data when editing
  useEffect(() => {
    const loadCV = async () => {
      if (editId) {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('cvs')
            .select('content')
            .eq('id', editId)
            .single();

          if (data?.content && !error) {
            setFormData(data.content as unknown as CVFormData);
          }
        } catch (error) {
          console.error('Error loading CV:', error);
          toast({
            title: "Error loading CV",
            description: "Could not load the CV data.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadCV();
  }, [editId, setFormData]);

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

  if (isLoading) {
    return (
      <CreateCVLayout showBackButton={false}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Loading your CV...
          </h2>
        </div>
      </CreateCVLayout>
    );
  }

  return (
    <CreateCVLayout backTo={editId ? "/dashboard" : "/create-cv"}>
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
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border py-3 px-4 sm:py-4 sm:px-6 z-40">
        <div className="container mx-auto max-w-4xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Button 
              variant="outline" 
              size="sm"
              className="w-full sm:w-auto sm:size-default"
              onClick={handleSaveDraft}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Saving...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                'Save Draft'
              )}
            </Button>
            {lastSaved && (
              <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 hidden sm:flex">
                <Check className="w-4 h-4 text-green-500" />
                Draft saved
              </span>
            )}
          </div>
          <Button size="sm" className="w-full sm:w-auto sm:size-default" onClick={handleContinue}>
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
