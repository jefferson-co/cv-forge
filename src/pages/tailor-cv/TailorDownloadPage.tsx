import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, FileDown, Check, Pencil, Sparkles, Target, LayoutDashboard } from "lucide-react";
import { useTailorCV } from "@/contexts/TailorCVContext";
import { COUNTRIES, TEMPLATES } from "@/types/cv";
import CreateCVLayout from "@/components/create-cv/CreateCVLayout";
import ProgressIndicator from "@/components/create-cv/ProgressIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { generatePDF, generateDOCX } from "@/lib/cv-generator";

const TailorDownloadPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, setCustomName, resetTailorData } = useTailorCV();
  const [saveToAccount, setSaveToAccount] = useState(true);
  const [customName, setLocalCustomName] = useState(data.customName || '');
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const countryData = COUNTRIES.find(c => c.code === data.selectedCountry);
  const templateData = TEMPLATES.find(t => t.id === data.selectedTemplate);

  const generateCVContent = () => {
    const cv = data.tailoredCVContent;
    if (!cv) return 'No content available';

    // Helper to safely get date range
    const getDateRange = (item: any) => {
      if (item.duration) return item.duration;
      if (item.year) return item.year;
      const start = item.startDate || '';
      const end = item.isCurrentlyStudying || item.isCurrentlyWorking ? 'Present' : (item.endDate || '');
      if (!start && !end) return '';
      return `${start}${start && end ? ' - ' : ''}${end}`;
    };

    // Helper to get description/responsibilities
    const getDescription = (item: any) => {
      return item.responsibilities || item.description || '';
    };

    const lines = [
      cv.fullName || 'Name not provided',
      cv.professionalTitle || '',
      [cv.email, cv.phone, cv.location].filter(Boolean).join(' | '),
      cv.linkedinUrl ? `LinkedIn: ${cv.linkedinUrl}` : '',
      cv.portfolioUrl ? `Portfolio: ${cv.portfolioUrl}` : '',
      '',
      'PROFESSIONAL SUMMARY',
      cv.summary || 'No summary provided',
      '',
    ];

    if (cv.workExperience?.length > 0) {
      lines.push('WORK EXPERIENCE');
      cv.workExperience.forEach((w: any) => {
        lines.push(w.jobTitle || w.title || 'Position not specified');
        lines.push(`${w.company || 'Company not specified'}${w.location ? `, ${w.location}` : ''}`);
        const dateRange = getDateRange(w);
        if (dateRange) lines.push(dateRange);
        const desc = getDescription(w);
        if (desc) lines.push(desc);
        lines.push('');
      });
    }

    lines.push('EDUCATION');
    if (cv.education?.length > 0) {
      cv.education.forEach((e: any) => {
        lines.push(e.degree || 'Degree not specified');
        lines.push(`${e.institution || 'Institution not specified'}${e.location ? `, ${e.location}` : ''}`);
        const dateRange = getDateRange(e);
        if (dateRange) lines.push(dateRange);
        if (e.gpa) lines.push(`GPA: ${e.gpa}`);
        if (e.coursework) lines.push(`Relevant Coursework: ${e.coursework}`);
        if (e.description) lines.push(e.description);
        lines.push('');
      });
    } else {
      lines.push('No education entries');
    }

    lines.push('SKILLS');
    lines.push(cv.skills?.length > 0 ? cv.skills.join(' • ') : 'No skills listed');

    if (cv.projects?.length > 0) {
      lines.push('');
      lines.push('PROJECTS');
      cv.projects.forEach((p: any) => {
        const title = p.title || p.name || 'Project';
        lines.push(`${title}${p.role ? ` - ${p.role}` : ''}${p.date ? ` (${p.date})` : ''}`);
        if (p.description) lines.push(p.description);
        if (p.link) lines.push(`Link: ${p.link}`);
        lines.push('');
      });
    }

    if (cv.customSections?.length > 0) {
      cv.customSections.filter((s: any) => s && s.name).forEach((s: any) => {
        lines.push('');
        lines.push(s.name.toUpperCase());
        if (s.content) lines.push(s.content);
      });
    }

    return lines.filter(line => line !== undefined).join('\n');
  };

  const handleDownloadPDF = async () => {
    if (!data.tailoredCVContent) return;
    
    setIsDownloading(true);
    try {
      const photoCountries = ['NG', 'DE', 'FR'];
      const shouldIncludePhoto = photoCountries.includes(data.selectedCountry) && !!data.tailoredCVContent.photoUrl;
      
      await generatePDF(data.tailoredCVContent, shouldIncludePhoto);
      setHasDownloaded(true);
      
      if (saveToAccount) {
        await saveToDatabase();
      }
      
      toast({
        title: "CV Downloaded!",
        description: "Your tailored CV has been downloaded as PDF.",
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
    if (!data.tailoredCVContent) return;
    
    setIsDownloading(true);
    try {
      await generateDOCX(data.tailoredCVContent);
      setHasDownloaded(true);
      
      if (saveToAccount) {
        await saveToDatabase();
      }
      
      toast({
        title: "CV Downloaded!",
        description: "Your tailored CV has been downloaded as Word document.",
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

  const saveToDatabase = async () => {
    if (!user || !data.tailoredCVContent) return;
    
    setIsSaving(true);
    try {
      const cvContent = {
        ...data.tailoredCVContent,
        selectedCountry: data.selectedCountry,
        selectedTemplate: data.selectedTemplate,
      };

      // Save to cv_tailoring_jobs table
      const { error: tailoringError } = await supabase
        .from('cv_tailoring_jobs')
        .insert([{
          user_id: user.id,
          job_description: data.jobDescription,
          job_title: data.jobAnalysis?.jobTitle || null,
          company_name: data.jobAnalysis?.companyName || null,
          original_cv_content: JSON.parse(JSON.stringify(data.originalCVContent)),
          tailored_cv_content: JSON.parse(JSON.stringify(cvContent)),
          changes_made: JSON.parse(JSON.stringify(data.changes)),
          match_score: data.matchScore,
          keywords_added: data.keywordsAdded,
          selected_country: data.selectedCountry,
          selected_template: data.selectedTemplate,
          custom_name: customName || `Tailored CV - ${data.jobAnalysis?.jobTitle || 'Unknown Role'}`,
        }]);

      if (tailoringError) {
        console.error('Error saving to cv_tailoring_jobs:', tailoringError);
      }

      // Also save to cvs table for dashboard
      const { error: cvsError } = await supabase
        .from('cvs')
        .insert([{
          user_id: user.id,
          title: customName || `Tailored: ${data.jobAnalysis?.jobTitle || 'Unknown Role'}`,
          content: JSON.parse(JSON.stringify(cvContent)),
          type: 'tailored',
          ats_score: data.matchScore,
        }]);

      if (cvsError) {
        console.error('Error saving to cvs:', cvsError);
      }

      toast({
        title: "CV saved!",
        description: "Your tailored CV has been saved to your account.",
      });
    } catch (error) {
      console.error('Error saving CV:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateAnother = () => {
    resetTailorData();
    navigate('/tailor-cv');
  };

  return (
    <CreateCVLayout showBackButton={false}>
      <ProgressIndicator 
        currentStep={3} 
        totalSteps={3} 
        stepLabels={['Country', 'Template', 'Download']} 
      />

      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          {hasDownloaded ? (
            <Check className="w-8 h-8 text-primary" />
          ) : (
            <FileText className="w-8 h-8 text-primary" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {hasDownloaded ? 'Your CV has been downloaded!' : 'Your Tailored CV is Ready! 🎉'}
        </h1>
        {data.jobAnalysis?.jobTitle && (
          <p className="text-muted-foreground mb-2">
            Optimized for: <span className="font-medium">{data.jobAnalysis.jobTitle}</span>
            {data.jobAnalysis.companyName && ` at ${data.jobAnalysis.companyName}`}
          </p>
        )}
        <Badge className="bg-green-500 text-white">
          {data.matchScore}% Match to Job Description
        </Badge>
      </div>

      {!hasDownloaded && (
        <>
          {/* CV Preview */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm text-muted-foreground">Format:</span>
                  <span className="ml-2 font-medium">{countryData?.flag} {countryData?.name}</span>
                  <span className="mx-2 text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">Template:</span>
                  <span className="ml-2 font-medium">{templateData?.name}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/tailor-cv/edit')}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
              <div className="bg-white border rounded-lg p-8 min-h-[400px] font-mono text-sm whitespace-pre-wrap overflow-auto max-h-[500px]">
                {generateCVContent()}
              </div>
            </CardContent>
          </Card>

          {/* Name Input */}
          <div className="max-w-md mx-auto mb-6">
            <Label htmlFor="cvName" className="mb-2 block">Name this version (optional)</Label>
            <Input
              id="cvName"
              placeholder={`e.g., ${data.jobAnalysis?.jobTitle || 'Software Engineer'} - ${data.jobAnalysis?.companyName || 'Google'}`}
              value={customName}
              onChange={(e) => {
                setLocalCustomName(e.target.value);
                setCustomName(e.target.value);
              }}
            />
          </div>

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
              Save this tailored CV to my account
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
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Tailor to another job</h3>
                <p className="text-sm text-muted-foreground">Optimize for a different role</p>
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
            onClick={() => navigate('/create-cv')}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Create new CV</h3>
                <p className="text-sm text-muted-foreground">Start fresh from scratch</p>
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

export default TailorDownloadPage;
