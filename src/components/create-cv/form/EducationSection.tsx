import { Plus, Trash2 } from "lucide-react";
import { useCVForm } from "@/contexts/CVFormContext";
import { Education } from "@/types/cv";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

const EducationSection = () => {
  const { formData, updateField } = useCVForm();

  const addEducation = () => {
    const newEducation: Education = {
      id: crypto.randomUUID(),
      degree: '',
      institution: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrentlyStudying: false,
      gpa: '',
      coursework: '',
    };
    updateField('education', [...formData.education, newEducation]);
  };

  const updateEducation = (id: string, field: keyof Education, value: string | boolean) => {
    const updated = formData.education.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    updateField('education', updated);
  };

  const removeEducation = (id: string) => {
    updateField('education', formData.education.filter(edu => edu.id !== id));
  };

  return (
    <section className="space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-semibold text-foreground">Education</h2>
        <p className="text-sm text-muted-foreground">Your academic background and qualifications</p>
      </div>

      <div className="space-y-4">
        {formData.education.map((edu, index) => (
          <Card key={edu.id} className="relative">
            <CardContent className="pt-6">
              <div className="absolute top-4 right-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEducation(edu.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Degree / Qualification *</Label>
                  <Input
                    placeholder="e.g., Bachelor of Science in Computer Science"
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Institution *</Label>
                  <Input
                    placeholder="e.g., University of Lagos"
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="City, Country"
                    value={edu.location}
                    onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>GPA / Grade</Label>
                  <Input
                    placeholder="e.g., 3.8/4.0 or First Class"
                    value={edu.gpa}
                    onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="month"
                    value={edu.startDate}
                    onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="month"
                    value={edu.endDate}
                    onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                    disabled={edu.isCurrentlyStudying}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <Checkbox
                      id={`current-${edu.id}`}
                      checked={edu.isCurrentlyStudying}
                      onCheckedChange={(checked) => updateEducation(edu.id, 'isCurrentlyStudying', !!checked)}
                    />
                    <Label htmlFor={`current-${edu.id}`} className="text-sm font-normal cursor-pointer">
                      Currently studying here
                    </Label>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label>Relevant Coursework / Achievements</Label>
                  <Textarea
                    placeholder="Key courses, honors, awards, or achievements..."
                    value={edu.coursework}
                    onChange={(e) => updateEducation(edu.id, 'coursework', e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addEducation}
          className="w-full gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Education
        </Button>
      </div>
    </section>
  );
};

export default EducationSection;
