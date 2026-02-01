import { useState } from "react";
import { Plus, Trash2, Sparkles, Loader2 } from "lucide-react";
import { useCVForm } from "@/contexts/CVFormContext";
import { WorkExperience } from "@/types/cv";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const WorkExperienceSection = () => {
  const { formData, updateField } = useCVForm();
  const [enhancingId, setEnhancingId] = useState<string | null>(null);

  // Hide section for users with no experience
  if (formData.experienceLevel === 'no-experience') {
    return (
      <section className="space-y-6">
        <div className="border-b border-border pb-4">
          <h2 className="text-xl font-semibold text-foreground">Work Experience</h2>
        </div>
        <div className="bg-secondary/50 rounded-lg p-6 text-center">
          <p className="text-muted-foreground">
            No worries! Work experience isn't required at this stage. Focus on your education, 
            projects, and skills instead. Many employers value potential and enthusiasm.
          </p>
        </div>
      </section>
    );
  }

  const addWorkExperience = () => {
    const newExperience: WorkExperience = {
      id: crypto.randomUUID(),
      jobTitle: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrentlyWorking: false,
      responsibilities: '',
    };
    updateField('workExperience', [...formData.workExperience, newExperience]);
  };

  const updateWorkExperience = (id: string, field: keyof WorkExperience, value: string | boolean) => {
    const updated = formData.workExperience.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    updateField('workExperience', updated);
  };

  const removeWorkExperience = (id: string) => {
    updateField('workExperience', formData.workExperience.filter(exp => exp.id !== id));
  };

  const enhanceWithAI = async (exp: WorkExperience) => {
    if (!exp.jobTitle || !exp.responsibilities) {
      toast({
        title: "Missing information",
        description: "Please fill in the job title and some responsibilities first.",
        variant: "destructive",
      });
      return;
    }

    setEnhancingId(exp.id);
    try {
      const prompt = `Improve these job responsibilities for a CV. Make them more impactful with action verbs and quantifiable achievements where possible. Keep the same general content but make it more professional and compelling.

Job Title: ${exp.jobTitle}
Company: ${exp.company}
Current Description:
${exp.responsibilities}

Rewrite as bullet points (use • for bullets). Be concise but impactful. Focus on achievements and results.`;

      const { data, error } = await supabase.functions.invoke('generate-cv-content', {
        body: { prompt, type: 'experience' }
      });

      if (error) throw error;

      if (data?.content) {
        updateWorkExperience(exp.id, 'responsibilities', data.content);
        toast({
          title: "Experience enhanced!",
          description: "Review the improvements and edit as needed.",
        });
      }
    } catch (error) {
      console.error('Error enhancing experience:', error);
      toast({
        title: "Enhancement failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setEnhancingId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-semibold text-foreground">Work Experience</h2>
        <p className="text-sm text-muted-foreground">Your professional journey and achievements</p>
      </div>

      <div className="space-y-4">
        {formData.workExperience.map((exp) => (
          <Card key={exp.id} className="relative">
            <CardContent className="pt-6">
              <div className="absolute top-4 right-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeWorkExperience(exp.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Job Title *</Label>
                  <Input
                    placeholder="e.g., Software Engineer"
                    value={exp.jobTitle}
                    onChange={(e) => updateWorkExperience(exp.id, 'jobTitle', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Company *</Label>
                  <Input
                    placeholder="e.g., Tech Corp"
                    value={exp.company}
                    onChange={(e) => updateWorkExperience(exp.id, 'company', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="City, Country"
                    value={exp.location}
                    onChange={(e) => updateWorkExperience(exp.id, 'location', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="month"
                    value={exp.startDate}
                    onChange={(e) => updateWorkExperience(exp.id, 'startDate', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="month"
                    value={exp.endDate}
                    onChange={(e) => updateWorkExperience(exp.id, 'endDate', e.target.value)}
                    disabled={exp.isCurrentlyWorking}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <Checkbox
                      id={`working-${exp.id}`}
                      checked={exp.isCurrentlyWorking}
                      onCheckedChange={(checked) => updateWorkExperience(exp.id, 'isCurrentlyWorking', !!checked)}
                    />
                    <Label htmlFor={`working-${exp.id}`} className="text-sm font-normal cursor-pointer">
                      I currently work here
                    </Label>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Responsibilities & Achievements *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => enhanceWithAI(exp)}
                      disabled={enhancingId === exp.id}
                      className="gap-2"
                    >
                      {enhancingId === exp.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      Enhance with AI
                    </Button>
                  </div>
                  <Textarea
                    placeholder="• Developed new features that increased user engagement by 30%&#10;• Led a team of 3 engineers on the mobile app redesign&#10;• Implemented automated testing, reducing bugs by 50%"
                    value={exp.responsibilities}
                    onChange={(e) => updateWorkExperience(exp.id, 'responsibilities', e.target.value)}
                    className="min-h-[150px]"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addWorkExperience}
          className="w-full gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Work Experience
        </Button>
      </div>
    </section>
  );
};

export default WorkExperienceSection;
