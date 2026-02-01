import { useNavigate } from "react-router-dom";
import { Info, ArrowLeft } from "lucide-react";
import { useTailorCV } from "@/contexts/TailorCVContext";
import { COUNTRIES } from "@/types/cv";
import CreateCVLayout from "@/components/create-cv/CreateCVLayout";
import ProgressIndicator from "@/components/create-cv/ProgressIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const CountryPage = () => {
  const navigate = useNavigate();
  const { data, setSelectedCountry } = useTailorCV();

  const generateCVText = () => {
    const cv = data.tailoredCVContent;
    if (!cv) return 'No content available';
    
    return `${cv.fullName || 'Name not provided'}
${cv.professionalTitle || ''}
${[cv.email, cv.phone, cv.location].filter(Boolean).join(' | ')}

PROFESSIONAL SUMMARY
${cv.summary || 'No summary provided'}

${cv.workExperience?.length > 0 ? `WORK EXPERIENCE
${cv.workExperience.map(w => 
  `${w.jobTitle}
${w.company}${w.location ? `, ${w.location}` : ''}
${w.startDate} - ${w.isCurrentlyWorking ? 'Present' : w.endDate}
${w.responsibilities}`
).join('\n\n')}` : ''}

EDUCATION
${cv.education?.length > 0 
  ? cv.education.map(e => 
      `${e.degree}
${e.institution}${e.location ? `, ${e.location}` : ''}
${e.startDate} - ${e.isCurrentlyStudying ? 'Present' : e.endDate}`
    ).join('\n\n')
  : 'No education entries'}

SKILLS
${cv.skills?.length > 0 ? cv.skills.join(' • ') : 'No skills listed'}`;
  };

  const selectedCountryData = COUNTRIES.find(c => c.code === data.selectedCountry);

  return (
    <CreateCVLayout backTo="/tailor-cv/comparison">
      <ProgressIndicator 
        currentStep={1} 
        totalSteps={3} 
        stepLabels={['Country', 'Template', 'Download']} 
      />

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Choose Your Target Country
        </h1>
        <p className="text-muted-foreground">
          Different countries have different CV standards. We'll adjust your CV accordingly.
        </p>
      </div>

      <Tabs value={data.selectedCountry} onValueChange={setSelectedCountry} className="mb-8">
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
                  <div className="bg-white border rounded-lg p-8 min-h-[500px] font-mono text-sm whitespace-pre-wrap">
                    {generateCVText()}
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
          <Button variant="outline" onClick={() => navigate('/tailor-cv/comparison')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button onClick={() => navigate('/tailor-cv/template')}>
            Select {selectedCountryData?.name} Format
          </Button>
        </div>
      </div>

      <div className="h-24" />
    </CreateCVLayout>
  );
};

export default CountryPage;
