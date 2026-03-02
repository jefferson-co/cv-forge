import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, FileDown, Check, Pencil, Sparkles, Target, LayoutDashboard } from "lucide-react";
import { useCVForm } from "@/contexts/CVFormContext";
import { COUNTRIES, TEMPLATES } from "@/types/cv";
import CreateCVLayout from "@/components/create-cv/CreateCVLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { generatePDF, generateDOCX } from "@/lib/cv-generator";

const DownloadPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formData, selectedCountry, selectedTemplate, resetForm } = useCVForm();
  const [saveToAccount, setSaveToAccount] = useState(true);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const countryData = COUNTRIES.find(c => c.code === selectedCountry);
  const templateData = TEMPLATES.find(t => t.id === selectedTemplate);
  
  // Countries that expect photos on CVs
  const photoCountries = ['NG', 'DE', 'FR'];
  const shouldIncludePhoto = photoCountries.includes(selectedCountry) && !!formData.photoUrl;

  const generateCVContent = () => {
    // Simple text-based CV format
    return `${formData.fullName}
${formData.professionalTitle}
${formData.email} | ${formData.phone} | ${formData.location}
${formData.linkedinUrl ? `LinkedIn: ${formData.linkedinUrl}` : ''}
${formData.portfolioUrl ? `Portfolio: ${formData.portfolioUrl}` : ''}

PROFESSIONAL SUMMARY
${formData.summary}

EDUCATION
${formData.education.map(e => 
  `${e.degree}
${e.institution}${e.location ? `, ${e.location}` : ''}
${e.startDate} - ${e.isCurrentlyStudying ? 'Present' : e.endDate}
${e.gpa ? `GPA: ${e.gpa}` : ''}
${e.coursework ? `Relevant Coursework: ${e.coursework}` : ''}`
).join('\n\n')}

${formData.workExperience.length > 0 ? `WORK EXPERIENCE
${formData.workExperience.map(w => 
  `${w.jobTitle}
${w.company}${w.location ? `, ${w.location}` : ''}
${w.startDate} - ${w.isCurrentlyWorking ? 'Present' : w.endDate}
${w.responsibilities}`
).join('\n\n')}` : ''}

SKILLS
${formData.skills.join(' • ')}

${formData.projects.length > 0 ? `PROJECTS
${formData.projects.map(p => 
  `${p.title}${p.role ? ` - ${p.role}` : ''}${p.date ? ` (${p.date})` : ''}
${p.description}
${p.link ? `Link: ${p.link}` : ''}`
).join('\n\n')}` : ''}

${formData.customSections.map(s => `${s.name.toUpperCase()}\n${s.content}`).join('\n\n')}`;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      await generatePDF(formData, shouldIncludePhoto);
      setHasDownloaded(true);
      
      if (saveToAccount) {
        await saveCV();
      }
      
      toast({
        title: "CV Downloaded!",
        description: "Your CV has been downloaded as PDF.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadDOCX = async () => {
    setIsDownloading(true);
    try {
      await generateDOCX(formData);
      setHasDownloaded(true);
      
      if (saveToAccount) {
        await saveCV();
      }
      
      toast({
        title: "CV Downloaded!",
        description: "Your CV has been downloaded as Word document.",
      });
    } catch (error) {
      console.error('Error generating DOCX:', error);
      toast({
        title: "Error",
        description: "Failed to generate Word document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const saveCV = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const cvContent = JSON.parse(JSON.stringify({
        ...formData,
        selectedCountry,
        selectedTemplate,
      }));

      // Remove any draft and save as completed CV
      await supabase
        .from('cvs')
        .delete()
        .eq('user_id', user.id)
        .eq('type', 'draft');

      await supabase
        .from('cvs')
        .insert({
          user_id: user.id,
          title: `${formData.fullName}'s CV`,
          content: cvContent,
          type: 'scratch',
        });

      toast({
        title: "CV saved!",
        description: "Your CV has been saved to your account.",
      });
    } catch (error) {
      console.error('Error saving CV:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateAnother = () => {
    resetForm();
    navigate('/create-cv');
  };

  return (
    <CreateCVLayout showBackButton={false}>
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          {hasDownloaded ? (
            <Check className="w-8 h-8 text-primary" />
          ) : (
            <FileText className="w-8 h-8 text-primary" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {hasDownloaded ? 'Your CV has been downloaded!' : 'Your CV is complete! 🎉'}
        </h1>
        <p className="text-muted-foreground">
          {hasDownloaded 
            ? 'What would you like to do next?' 
            : 'Review one last time, then download'}
        </p>
      </div>

      {!hasDownloaded && (
        <>
          {/* CV Preview */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-1 text-sm">
                  <span className="text-muted-foreground">Format:</span>
                  <span className="font-medium">{countryData?.flag} {countryData?.name}</span>
                  <span className="mx-1 text-muted-foreground">•</span>
                  <span className="text-muted-foreground">Template:</span>
                  <span className="font-medium">{templateData?.name}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/create-cv/form')}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
              <div className="bg-white text-gray-900 border rounded-lg p-8 min-h-[400px] font-mono text-sm whitespace-pre-wrap overflow-auto max-h-[500px]">
                {/* Show photo for countries that expect it */}
                {shouldIncludePhoto && (
                  <div className="flex justify-end mb-4">
                    <img 
                      src={formData.photoUrl} 
                      alt="Profile" 
                      className="w-24 h-32 object-cover border rounded"
                    />
                  </div>
                )}
                {generateCVContent()}
              </div>
            </CardContent>
          </Card>

          {/* Download Options */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button size="lg" onClick={handleDownloadPDF} disabled={isDownloading} className="gap-2">
              <FileDown className="w-5 h-5" />
              {isDownloading ? 'Generating...' : 'Download as PDF'}
            </Button>
            <Button size="lg" variant="outline" onClick={handleDownloadDOCX} disabled={isDownloading} className="gap-2">
              <FileText className="w-5 h-5" />
              {isDownloading ? 'Generating...' : 'Download as Word'}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 mb-8">
            <Checkbox 
              id="save" 
              checked={saveToAccount}
              onCheckedChange={(checked) => setSaveToAccount(!!checked)}
            />
            <Label htmlFor="save" className="cursor-pointer">
              Save this CV to my account
            </Label>
          </div>
        </>
      )}

      {hasDownloaded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={handleCreateAnother}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Create another CV</h3>
                <p className="text-sm text-muted-foreground">Start fresh with a new CV</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate('/tailor')}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Tailor this CV</h3>
                <p className="text-sm text-muted-foreground">Customize for a specific job</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate('/ats-check')}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Check ATS score</h3>
                <p className="text-sm text-muted-foreground">Analyze CV compatibility</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate('/dashboard')}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Return to dashboard</h3>
                <p className="text-sm text-muted-foreground">View all your CVs</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </CreateCVLayout>
  );
};

export default DownloadPage;
