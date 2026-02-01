import { useState } from "react";
import { X, Sparkles, Loader2 } from "lucide-react";
import { useCVForm } from "@/contexts/CVFormContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SkillsSection = () => {
  const { formData, updateField } = useCVForm();
  const [inputValue, setInputValue] = useState('');
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !formData.skills.includes(trimmedSkill)) {
      updateField('skills', [...formData.skills, trimmedSkill]);
    }
    setInputValue('');
  };

  const removeSkill = (skillToRemove: string) => {
    updateField('skills', formData.skills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(inputValue);
    }
  };

  const suggestSkills = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Based on this person's profile, suggest 10 relevant skills for their CV:

Desired Role: ${formData.professionalTitle || 'Not specified'}
Experience Level: ${formData.experienceLevel}
${formData.education.length > 0 ? `Education: ${formData.education.map(e => e.degree).join(', ')}` : ''}
${formData.workExperience.length > 0 ? `Experience: ${formData.workExperience.map(e => e.jobTitle).join(', ')}` : ''}
${formData.skills.length > 0 ? `Already listed skills: ${formData.skills.join(', ')}` : ''}

Return ONLY a comma-separated list of skill names. No explanations, no numbering. Include both technical and soft skills relevant to their profile. Do not repeat skills they already have.`;

      const { data, error } = await supabase.functions.invoke('generate-cv-content', {
        body: { prompt, type: 'skills' }
      });

      if (error) throw error;

      if (data?.content) {
        const skills = data.content.split(',').map((s: string) => s.trim()).filter((s: string) => 
          s && !formData.skills.includes(s)
        );
        setSuggestedSkills(skills.slice(0, 10));
        toast({
          title: "Skills suggested!",
          description: "Click on a skill to add it to your list.",
        });
      }
    } catch (error) {
      console.error('Error suggesting skills:', error);
      toast({
        title: "Suggestion failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const addSuggestedSkill = (skill: string) => {
    addSkill(skill);
    setSuggestedSkills(suggestedSkills.filter(s => s !== skill));
  };

  return (
    <section className="space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-semibold text-foreground">Skills</h2>
        <p className="text-sm text-muted-foreground">Highlight your technical and soft skills</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="skills">Add Skills</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={suggestSkills}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Suggest skills
          </Button>
        </div>

        <Input
          id="skills"
          placeholder="Type a skill and press Enter (e.g., Python, Project Management)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {formData.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="px-3 py-1.5 gap-2 text-sm border-primary/50"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {suggestedSkills.length > 0 && (
          <div className="space-y-2">
            <Label className="text-muted-foreground">Suggested skills (click to add)</Label>
            <div className="flex flex-wrap gap-2">
              {suggestedSkills.map((skill) => (
                <Button
                  key={skill}
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addSuggestedSkill(skill)}
                  className="text-sm"
                >
                  + {skill}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SkillsSection;
