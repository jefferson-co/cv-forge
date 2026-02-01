import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useCVForm } from "@/contexts/CVFormContext";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SummarySection = () => {
  const { formData, updateField } = useCVForm();
  const [isGenerating, setIsGenerating] = useState(false);

  const getSectionTitle = () => {
    switch (formData.experienceLevel) {
      case 'no-experience':
        return 'About You';
      default:
        return 'Professional Summary';
    }
  };

  const getPlaceholder = () => {
    switch (formData.experienceLevel) {
      case 'no-experience':
        return 'Describe your interests, goals, and what makes you a great candidate. What are you passionate about? What skills are you developing?';
      case 'recent-graduate':
        return 'Summarize your education, relevant projects, and career aspirations. Highlight internships, coursework, or achievements that set you apart.';
      case 'experienced':
        return 'Provide a compelling overview of your career, key achievements, and what you bring to the table. Focus on measurable results and leadership.';
      default:
        return 'Write a brief summary about yourself...';
    }
  };

  const generateSummary = async () => {
    if (!formData.fullName || !formData.professionalTitle) {
      toast({
        title: "Missing information",
        description: "Please fill in your name and desired role first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Generate a professional CV summary for:
Name: ${formData.fullName}
Desired Role: ${formData.professionalTitle}
Experience Level: ${formData.experienceLevel === 'no-experience' ? 'Entry level / No experience' : formData.experienceLevel === 'recent-graduate' ? 'Recent graduate' : 'Experienced professional'}
Location: ${formData.location || 'Not specified'}
${formData.skills.length > 0 ? `Skills: ${formData.skills.join(', ')}` : ''}
${formData.education.length > 0 ? `Education: ${formData.education.map(e => `${e.degree} from ${e.institution}`).join(', ')}` : ''}

Write a concise, compelling 2-3 sentence professional summary that highlights their potential and aspirations. Keep it under 500 characters. Do not use first person (I, me, my). Write in third person or neutral tone.`;

      const { data, error } = await supabase.functions.invoke('generate-cv-content', {
        body: { prompt, type: 'summary' }
      });

      if (error) throw error;

      if (data?.content) {
        updateField('summary', data.content);
        toast({
          title: "Summary generated!",
          description: "Feel free to edit it to match your voice.",
        });
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Generation failed",
        description: "Please try again or write your summary manually.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-semibold text-foreground">{getSectionTitle()}</h2>
        <p className="text-sm text-muted-foreground">A brief overview that captures who you are</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="summary">Your Summary</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateSummary}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Generate with AI
          </Button>
        </div>
        
        <Textarea
          id="summary"
          placeholder={getPlaceholder()}
          value={formData.summary}
          onChange={(e) => updateField('summary', e.target.value)}
          maxLength={500}
          className="min-h-[150px] resize-none"
        />
        
        <div className="text-right text-sm text-muted-foreground">
          {formData.summary.length}/500 characters
        </div>
      </div>
    </section>
  );
};

export default SummarySection;
