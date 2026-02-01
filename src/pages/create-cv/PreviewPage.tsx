import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Info } from "lucide-react";
import { useCVForm } from "@/contexts/CVFormContext";
import { COUNTRIES } from "@/types/cv";
import CreateCVLayout from "@/components/create-cv/CreateCVLayout";
import ProgressIndicator from "@/components/create-cv/ProgressIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const PreviewPage = () => {
  const navigate = useNavigate();
  const { formData, selectedCountry, setSelectedCountry } = useCVForm();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [cvContent, setCvContent] = useState<string>('');

  useEffect(() => {
    const analyzeAndGenerate = async () => {
      setIsAnalyzing(true);
      try {
        const { data, error } = await supabase.functions.invoke('generate-cv-content', {
          body: { 
            prompt: `Format this CV data for ${selectedCountry} standards. Include all provided information in a clean, professional format suitable for that country.

CV Data:
Name: ${formData.fullName}
Title: ${formData.professionalTitle}
Email: ${formData.email}
Phone: ${formData.phone}
Location: ${formData.location}
${formData.linkedinUrl ? `LinkedIn: ${formData.linkedinUrl}` : ''}
${formData.portfolioUrl ? `Portfolio: ${formData.portfolioUrl}` : ''}
${formData.photoUrl ? `Photo: [Profile photo included]` : ''}

Summary: ${formData.summary}

Education:
${formData.education.map(e => `- ${e.degree} at ${e.institution} (${e.startDate} - ${e.isCurrentlyStudying ? 'Present' : e.endDate})`).join('\n')}

${formData.workExperience.length > 0 ? `Work Experience:
${formData.workExperience.map(w => `- ${w.jobTitle} at ${w.company} (${w.startDate} - ${w.isCurrentlyWorking ? 'Present' : w.endDate})\n${w.responsibilities}`).join('\n\n')}` : ''}

Skills: ${formData.skills.join(', ')}

${formData.projects.length > 0 ? `Projects:
${formData.projects.map(p => `- ${p.title}: ${p.description}`).join('\n')}` : ''}

${formData.customSections.length > 0 ? formData.customSections.map(s => `${s.name}:\n${s.content}`).join('\n\n') : ''}

Return a clean, formatted version of this CV optimized for ${COUNTRIES.find(c => c.code === selectedCountry)?.name || 'US'} job applications. ${['NG', 'DE', 'FR'].includes(selectedCountry) && formData.photoUrl ? 'This country expects a photo on the CV - include a placeholder note for the photo position.' : ''}`,
            type: 'preview'
          }
        });

        if (error) throw error;
        
        if (data?.content) {
          setCvContent(data.content);
        }
      } catch (error) {
        console.error('Error generating preview:', error);
        // Generate a simple preview on error
        setCvContent(`${formData.fullName}
${formData.professionalTitle}
${formData.email} | ${formData.phone} | ${formData.location}

SUMMARY
${formData.summary}

EDUCATION
${formData.education.map(e => `${e.degree} - ${e.institution} (${e.startDate} - ${e.isCurrentlyStudying ? 'Present' : e.endDate})`).join('\n')}

${formData.workExperience.length > 0 ? `EXPERIENCE
${formData.workExperience.map(w => `${w.jobTitle} - ${w.company} (${w.startDate} - ${w.isCurrentlyWorking ? 'Present' : w.endDate})
${w.responsibilities}`).join('\n\n')}` : ''}

SKILLS
${formData.skills.join(' • ')}

${formData.projects.length > 0 ? `PROJECTS
${formData.projects.map(p => `${p.title}${p.role ? ` (${p.role})` : ''}\n${p.description}`).join('\n\n')}` : ''}`);
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeAndGenerate();
  }, [selectedCountry, formData]);

  const selectedCountryData = COUNTRIES.find(c => c.code === selectedCountry);

  if (isAnalyzing) {
    return (
      <CreateCVLayout showBackButton={false}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Analyzing your information...
          </h2>
          <p className="text-muted-foreground">
            Generating your CV preview. This will take just a few seconds.
          </p>
        </div>
      </CreateCVLayout>
    );
  }

  return (
    <CreateCVLayout backTo="/create-cv/form">
      <ProgressIndicator 
        currentStep={2} 
        totalSteps={3} 
        stepLabels={['Your Information', 'Preview', 'Download']} 
      />

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Your CV is ready! Let's preview it
        </h1>
        <p className="text-muted-foreground">
          Different countries have different CV standards. See how your CV adapts.
        </p>
      </div>

      <Tabs value={selectedCountry} onValueChange={setSelectedCountry} className="mb-8">
        <ScrollArea className="w-full">
          <TabsList className="inline-flex h-auto p-1 w-max min-w-full justify-start">
            {COUNTRIES.map((country) => (
              <TabsTrigger 
                key={country.code} 
                value={country.code}
                className="px-4 py-2 gap-2 whitespace-nowrap"
              >
                <span>{country.flag}</span>
                <span className="hidden sm:inline">{country.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        {COUNTRIES.map((country) => (
          <TabsContent key={country.code} value={country.code}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* CV Preview */}
              <Card className="lg:col-span-2">
                <CardContent className="p-6">
                  <div className="bg-white border rounded-lg p-8 min-h-[600px] font-mono text-sm whitespace-pre-wrap">
                    {/* Show photo for countries that expect it */}
                    {['NG', 'DE', 'FR'].includes(country.code) && formData.photoUrl && (
                      <div className="flex justify-end mb-4">
                        <img 
                          src={formData.photoUrl} 
                          alt="Profile" 
                          className="w-24 h-32 object-cover border rounded"
                        />
                      </div>
                    )}
                    {cvContent}
                  </div>
                </CardContent>
              </Card>

              {/* Country Notes */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    {country.name} CV Standards
                  </h3>
                  <ul className="space-y-3">
                    {country.notes.map((note, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-1">•</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border py-4 px-6 z-40">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/create-cv/form')}>
            Back to Edit
          </Button>
          <Button onClick={() => navigate('/create-cv/template')}>
            Select {selectedCountryData?.name} Format
          </Button>
        </div>
      </div>

      <div className="h-24" />
    </CreateCVLayout>
  );
};

export default PreviewPage;
