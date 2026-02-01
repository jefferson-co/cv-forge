import { useState } from "react";
import { Plus, Trash2, Sparkles, Loader2 } from "lucide-react";
import { useCVForm } from "@/contexts/CVFormContext";
import { Project } from "@/types/cv";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ProjectsSection = () => {
  const { formData, updateField } = useCVForm();
  const [improvingId, setImprovingId] = useState<string | null>(null);

  const isEncouraged = formData.experienceLevel !== 'experienced';

  const addProject = () => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      title: '',
      role: '',
      date: '',
      description: '',
      link: '',
    };
    updateField('projects', [...formData.projects, newProject]);
  };

  const updateProject = (id: string, field: keyof Project, value: string) => {
    const updated = formData.projects.map(proj => 
      proj.id === id ? { ...proj, [field]: value } : proj
    );
    updateField('projects', updated);
  };

  const removeProject = (id: string) => {
    updateField('projects', formData.projects.filter(proj => proj.id !== id));
  };

  const improveDescription = async (project: Project) => {
    if (!project.title || !project.description) {
      toast({
        title: "Missing information",
        description: "Please fill in the project title and description first.",
        variant: "destructive",
      });
      return;
    }

    setImprovingId(project.id);
    try {
      const prompt = `Improve this project description for a CV. Make it more impactful by highlighting technologies used, your role, and outcomes achieved.

Project: ${project.title}
${project.role ? `Role: ${project.role}` : ''}
Current Description:
${project.description}

Rewrite in 2-3 concise sentences. Highlight technical skills, problem-solving, and impact. Keep it professional and results-focused.`;

      const { data, error } = await supabase.functions.invoke('generate-cv-content', {
        body: { prompt, type: 'project' }
      });

      if (error) throw error;

      if (data?.content) {
        updateProject(project.id, 'description', data.content);
        toast({
          title: "Description improved!",
          description: "Review and edit as needed.",
        });
      }
    } catch (error) {
      console.error('Error improving description:', error);
      toast({
        title: "Improvement failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setImprovingId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-semibold text-foreground">Projects</h2>
        <p className="text-sm text-muted-foreground">
          {isEncouraged 
            ? "Showcase your work - projects are highly valued for your experience level!" 
            : "Optional: Highlight notable projects"}
        </p>
      </div>

      <div className="space-y-4">
        {formData.projects.map((project) => (
          <Card key={project.id} className="relative">
            <CardContent className="pt-6">
              <div className="absolute top-4 right-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeProject(project.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Project Title *</Label>
                  <Input
                    placeholder="e.g., E-commerce Platform"
                    value={project.title}
                    onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Your Role</Label>
                  <Input
                    placeholder="e.g., Lead Developer"
                    value={project.role}
                    onChange={(e) => updateProject(project.id, 'role', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    placeholder="e.g., Jan 2024 or 2023-2024"
                    value={project.date}
                    onChange={(e) => updateProject(project.id, 'date', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Link (GitHub/Demo)</Label>
                  <Input
                    type="url"
                    placeholder="https://github.com/..."
                    value={project.link}
                    onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Description *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => improveDescription(project)}
                      disabled={improvingId === project.id}
                      className="gap-2"
                    >
                      {improvingId === project.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      Improve description
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Describe the project, technologies used, and your contributions..."
                    value={project.description}
                    onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                    className="min-h-[100px]"
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
          onClick={addProject}
          className="w-full gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </Button>
      </div>
    </section>
  );
};

export default ProjectsSection;
