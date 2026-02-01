import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useCVForm } from "@/contexts/CVFormContext";
import { CustomSection } from "@/types/cv";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CustomSectionsSection = () => {
  const { formData, updateField } = useCVForm();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionContent, setNewSectionContent] = useState('');

  const addCustomSection = () => {
    if (!newSectionName.trim()) return;

    const newSection: CustomSection = {
      id: crypto.randomUUID(),
      name: newSectionName.trim(),
      content: newSectionContent.trim(),
    };
    
    updateField('customSections', [...formData.customSections, newSection]);
    setNewSectionName('');
    setNewSectionContent('');
    setIsDialogOpen(false);
  };

  const updateCustomSection = (id: string, field: keyof CustomSection, value: string) => {
    const updated = formData.customSections.map(section => 
      section.id === id ? { ...section, [field]: value } : section
    );
    updateField('customSections', updated);
  };

  const removeCustomSection = (id: string) => {
    updateField('customSections', formData.customSections.filter(section => section.id !== id));
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const index = formData.customSections.findIndex(s => s.id === id);
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === formData.customSections.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newSections = [...formData.customSections];
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    updateField('customSections', newSections);
  };

  return (
    <section className="space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-semibold text-foreground">Custom Sections</h2>
        <p className="text-sm text-muted-foreground">
          Add additional sections like Certifications, Volunteer Work, Publications, etc.
        </p>
      </div>

      <div className="space-y-4">
        {formData.customSections.map((section, index) => (
          <Card key={section.id} className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => moveSection(section.id, 'up')}
                    disabled={index === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>
                </div>
                <Input
                  value={section.name}
                  onChange={(e) => updateCustomSection(section.id, 'name', e.target.value)}
                  className="text-lg font-semibold border-0 p-0 h-auto focus-visible:ring-0"
                  placeholder="Section Name"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeCustomSection(section.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter content for this section..."
                value={section.content}
                onChange={(e) => updateCustomSection(section.id, 'content', e.target.value)}
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>
        ))}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Add Custom Section
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Section</DialogTitle>
              <DialogDescription>
                Create a new section for your CV. Examples: Certifications, Volunteer Work, Publications, Languages.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="sectionName">Section Name *</Label>
                <Input
                  id="sectionName"
                  placeholder="e.g., Certifications"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sectionContent">Content</Label>
                <Textarea
                  id="sectionContent"
                  placeholder="Enter the content for this section..."
                  value={newSectionContent}
                  onChange={(e) => setNewSectionContent(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addCustomSection} disabled={!newSectionName.trim()}>
                Add Section
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default CustomSectionsSection;
