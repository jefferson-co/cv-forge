import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Eye, Sparkles, Check } from "lucide-react";
import { useTailorCV } from "@/contexts/TailorCVContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import CreateCVLayout from "@/components/create-cv/CreateCVLayout";

const EditPage = () => {
  const navigate = useNavigate();
  const { data, setTailoredCV } = useTailorCV();
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: data.tailoredCVContent?.fullName || '',
    professionalTitle: data.tailoredCVContent?.professionalTitle || '',
    email: data.tailoredCVContent?.email || '',
    phone: data.tailoredCVContent?.phone || '',
    location: data.tailoredCVContent?.location || '',
    summary: data.tailoredCVContent?.summary || '',
    skills: data.tailoredCVContent?.skills?.join(', ') || '',
  });

  useEffect(() => {
    if (!data.tailoredCVContent) {
      navigate('/tailor-cv');
    }
  }, [data.tailoredCVContent, navigate]);

  // Auto-save every 10 seconds
  useEffect(() => {
    if (!hasChanges) return;
    
    const timer = setTimeout(() => {
      handleSave(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, [formData, hasChanges]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = (showToast: boolean = true) => {
    if (!data.tailoredCVContent) return;

    const updatedCV = {
      ...data.tailoredCVContent,
      fullName: formData.fullName,
      professionalTitle: formData.professionalTitle,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      summary: formData.summary,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
    };

    setTailoredCV(updatedCV);
    setHasChanges(false);
    setLastSaved(new Date());

    if (showToast) {
      toast({
        title: "Changes saved",
        description: "Your edits have been saved successfully.",
      });
    }
  };

  const handleContinue = () => {
    if (hasChanges) {
      handleSave(false);
    }
    navigate('/tailor-cv/country');
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/tailor-cv/comparison');
      }
    } else {
      navigate('/tailor-cv/comparison');
    }
  };

  return (
    <CreateCVLayout backTo="/tailor-cv/comparison">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Edit Your Tailored CV
            </h1>
            <p className="text-muted-foreground">
              Make any final adjustments before downloading
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {hasChanges ? (
              <span className="text-yellow-600">Unsaved changes</span>
            ) : lastSaved ? (
              <span className="flex items-center gap-1 text-green-600">
                <Check className="w-4 h-4" />
                Saved
              </span>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="professionalTitle">Professional Title</Label>
                    <Input
                      id="professionalTitle"
                      value={formData.professionalTitle}
                      onChange={(e) => handleInputChange('professionalTitle', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Professional Summary</h3>
                <Textarea
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  className="min-h-[150px]"
                  placeholder="Write a compelling professional summary..."
                />
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Skills</h3>
                <Textarea
                  value={formData.skills}
                  onChange={(e) => handleInputChange('skills', e.target.value)}
                  placeholder="Enter skills separated by commas (e.g., JavaScript, React, Node.js)"
                  className="min-h-[100px]"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Separate skills with commas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* AI Assistant Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Assistant
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Need help improving your CV? Try these AI-powered actions:
                </p>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                    <Sparkles className="w-4 h-4" />
                    Improve Summary
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                    <Sparkles className="w-4 h-4" />
                    Add Keywords
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                    <Sparkles className="w-4 h-4" />
                    Check Grammar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  These features use AI to enhance your content while maintaining accuracy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t">
          <Button variant="outline" onClick={handleCancel} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Cancel
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => handleSave(true)} className="gap-2">
              <Save className="w-4 h-4" />
              Save
            </Button>
            <Button onClick={handleContinue} className="gap-2">
              Save & Continue
            </Button>
          </div>
        </div>
      </div>
    </CreateCVLayout>
  );
};

export default EditPage;
