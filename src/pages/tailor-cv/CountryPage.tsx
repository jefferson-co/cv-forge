import { useNavigate } from "react-router-dom";
import { Info, ArrowLeft, Camera, AlertTriangle, Check } from "lucide-react";
import { useTailorCV } from "@/contexts/TailorCVContext";
import { COUNTRIES } from "@/types/cv";
import CreateCVLayout from "@/components/create-cv/CreateCVLayout";
import ProgressIndicator from "@/components/create-cv/ProgressIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

// Countries that require or commonly expect a photo
const PHOTO_REQUIRED_COUNTRIES = ['NG', 'DE', 'FR'];
const PHOTO_OPTIONAL_COUNTRIES = ['NL'];

// Countries that typically expect date of birth
const DOB_EXPECTED_COUNTRIES = ['NG', 'DE', 'FR'];

// Country-specific formatting rules
const COUNTRY_FORMAT_RULES: Record<string, {
  includePhoto: boolean;
  includeDOB: boolean;
  maxPages: number;
  includeReferences: boolean;
  dateFormat: string;
  sectionOrder: string[];
}> = {
  NG: {
    includePhoto: true,
    includeDOB: true,
    maxPages: 2,
    includeReferences: true,
    dateFormat: 'DD/MM/YYYY',
    sectionOrder: ['personal', 'summary', 'education', 'experience', 'skills', 'references']
  },
  US: {
    includePhoto: false,
    includeDOB: false,
    maxPages: 1,
    includeReferences: false,
    dateFormat: 'MM/YYYY',
    sectionOrder: ['summary', 'experience', 'education', 'skills']
  },
  CA: {
    includePhoto: false,
    includeDOB: false,
    maxPages: 2,
    includeReferences: false,
    dateFormat: 'MM/YYYY',
    sectionOrder: ['summary', 'experience', 'education', 'skills']
  },
  GB: {
    includePhoto: false,
    includeDOB: false,
    maxPages: 2,
    includeReferences: false,
    dateFormat: 'MM/YYYY',
    sectionOrder: ['summary', 'experience', 'education', 'skills']
  },
  DE: {
    includePhoto: true,
    includeDOB: true,
    maxPages: 2,
    includeReferences: false,
    dateFormat: 'DD.MM.YYYY',
    sectionOrder: ['personal', 'summary', 'experience', 'education', 'skills']
  },
  SE: {
    includePhoto: false,
    includeDOB: false,
    maxPages: 2,
    includeReferences: false,
    dateFormat: 'YYYY-MM',
    sectionOrder: ['summary', 'experience', 'education', 'skills']
  },
  NZ: {
    includePhoto: false,
    includeDOB: false,
    maxPages: 2,
    includeReferences: true,
    dateFormat: 'MM/YYYY',
    sectionOrder: ['summary', 'experience', 'education', 'skills']
  },
  AU: {
    includePhoto: false,
    includeDOB: false,
    maxPages: 3,
    includeReferences: true,
    dateFormat: 'MM/YYYY',
    sectionOrder: ['summary', 'experience', 'education', 'skills', 'references']
  },
  FR: {
    includePhoto: true,
    includeDOB: true,
    maxPages: 2,
    includeReferences: false,
    dateFormat: 'DD/MM/YYYY',
    sectionOrder: ['personal', 'summary', 'experience', 'education', 'skills']
  },
  NL: {
    includePhoto: false,
    includeDOB: false,
    maxPages: 2,
    includeReferences: false,
    dateFormat: 'DD-MM-YYYY',
    sectionOrder: ['summary', 'experience', 'education', 'skills']
  }
};

const CountryPage = () => {
  const navigate = useNavigate();
  const { data, setSelectedCountry } = useTailorCV();

  const formatRules = COUNTRY_FORMAT_RULES[data.selectedCountry] || COUNTRY_FORMAT_RULES['US'];
  const requiresPhoto = PHOTO_REQUIRED_COUNTRIES.includes(data.selectedCountry);
  const hasPhoto = data.tailoredCVContent?.photoUrl;

  // Generate CV text formatted according to country standards
  const generateCountryFormattedCV = () => {
    const cv = data.tailoredCVContent;
    if (!cv) return 'No content available';

    const lines: string[] = [];
    
    // Helper functions
    const getDateRange = (item: any) => {
      if (item.duration) return item.duration;
      if (item.year) return item.year;
      const start = item.startDate || '';
      const end = item.isCurrentlyStudying || item.isCurrentlyWorking ? 'Present' : (item.endDate || '');
      if (!start && !end) return '';
      return `${start}${start && end ? ' - ' : ''}${end}`;
    };

    const getDescription = (item: any) => {
      return item.responsibilities || item.description || '';
    };

    // Header based on country format
    lines.push('═'.repeat(50));
    lines.push(cv.fullName?.toUpperCase() || 'NAME NOT PROVIDED');
    lines.push(cv.professionalTitle || '');
    lines.push('═'.repeat(50));
    lines.push('');

    // Contact info (varies by country)
    const contactItems = [cv.email, cv.phone, cv.location].filter(Boolean);
    if (contactItems.length > 0) {
      lines.push(contactItems.join(' │ '));
    }
    if (cv.linkedinUrl) lines.push(`LinkedIn: ${cv.linkedinUrl}`);
    if (cv.portfolioUrl) lines.push(`Portfolio: ${cv.portfolioUrl}`);

    // Personal details section (for countries that expect it)
    if (formatRules.includeDOB) {
      lines.push('');
      lines.push('─'.repeat(30));
      lines.push('PERSONAL DETAILS');
      lines.push('─'.repeat(30));
      if (requiresPhoto && !hasPhoto) {
        lines.push('📷 [Photo Required]');
      }
      lines.push('Date of Birth: [To be added]');
      lines.push('Nationality: [To be added]');
    }

    lines.push('');

    // Build sections according to country order
    formatRules.sectionOrder.forEach(section => {
      switch (section) {
        case 'summary':
          lines.push('─'.repeat(30));
          lines.push('PROFESSIONAL SUMMARY');
          lines.push('─'.repeat(30));
          lines.push(cv.summary || 'No summary provided');
          lines.push('');
          break;

        case 'experience':
          if (cv.workExperience?.length > 0) {
            lines.push('─'.repeat(30));
            lines.push('WORK EXPERIENCE');
            lines.push('─'.repeat(30));
            cv.workExperience.forEach((w: any) => {
              lines.push(`▪ ${w.jobTitle || w.title || 'Position'}`);
              lines.push(`  ${w.company || 'Company'}${w.location ? `, ${w.location}` : ''}`);
              const dateRange = getDateRange(w);
              if (dateRange) lines.push(`  ${dateRange}`);
              const desc = getDescription(w);
              if (desc) {
                desc.split('\n').forEach((line: string) => {
                  lines.push(`  ${line.trim()}`);
                });
              }
              lines.push('');
            });
          }
          break;

        case 'education':
          lines.push('─'.repeat(30));
          lines.push('EDUCATION');
          lines.push('─'.repeat(30));
          if (cv.education?.length > 0) {
            cv.education.forEach((e: any) => {
              lines.push(`▪ ${e.degree || 'Degree'}`);
              lines.push(`  ${e.institution || 'Institution'}${e.location ? `, ${e.location}` : ''}`);
              const dateRange = getDateRange(e);
              if (dateRange) lines.push(`  ${dateRange}`);
              if (e.gpa) lines.push(`  GPA: ${e.gpa}`);
              if (e.coursework) lines.push(`  Relevant Coursework: ${e.coursework}`);
              if (e.description) lines.push(`  ${e.description}`);
              lines.push('');
            });
          } else {
            lines.push('No education entries found');
            lines.push('');
          }
          break;

        case 'skills':
          lines.push('─'.repeat(30));
          lines.push('SKILLS');
          lines.push('─'.repeat(30));
          if (cv.skills?.length > 0) {
            // Format skills in a grid-like display
            const skillsPerLine = 3;
            for (let i = 0; i < cv.skills.length; i += skillsPerLine) {
              const chunk = cv.skills.slice(i, i + skillsPerLine);
              lines.push(chunk.map((s: string) => `• ${s}`).join('  '));
            }
          } else {
            lines.push('No skills listed');
          }
          lines.push('');
          break;

        case 'references':
          if (formatRules.includeReferences) {
            lines.push('─'.repeat(30));
            lines.push('REFERENCES');
            lines.push('─'.repeat(30));
            lines.push('Available upon request');
            lines.push('');
          }
          break;
      }
    });

    // Projects (if any)
    if (cv.projects?.length > 0) {
      lines.push('─'.repeat(30));
      lines.push('PROJECTS');
      lines.push('─'.repeat(30));
      cv.projects.forEach((p: any) => {
        const title = p.title || p.name || 'Project';
        lines.push(`▪ ${title}${p.role ? ` - ${p.role}` : ''}${p.date ? ` (${p.date})` : ''}`);
        if (p.description) lines.push(`  ${p.description}`);
        if (p.link) lines.push(`  Link: ${p.link}`);
        lines.push('');
      });
    }

    // Custom sections
    if (cv.customSections?.length > 0) {
      cv.customSections.filter((s: any) => s && s.name).forEach((s: any) => {
        lines.push('─'.repeat(30));
        lines.push(s.name.toUpperCase());
        lines.push('─'.repeat(30));
        if (s.content) lines.push(s.content);
        lines.push('');
      });
    }

    // Page count note
    lines.push('');
    lines.push(`[Formatted for ${formatRules.maxPages === 1 ? 'single page' : `up to ${formatRules.maxPages} pages`} - ${COUNTRIES.find(c => c.code === data.selectedCountry)?.name} standard]`);

    return lines.filter(line => line !== undefined).join('\n');
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
          We'll format your CV according to the standards of your selected country.
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
                {PHOTO_REQUIRED_COUNTRIES.includes(country.code) && (
                  <Camera className="w-3 h-3 text-orange-500" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        {COUNTRIES.map((country) => {
          const countryRules = COUNTRY_FORMAT_RULES[country.code] || COUNTRY_FORMAT_RULES['US'];
          const countryRequiresPhoto = PHOTO_REQUIRED_COUNTRIES.includes(country.code);
          
          return (
            <TabsContent key={country.code} value={country.code}>
              {/* Photo Requirement Alert */}
              {countryRequiresPhoto && (
                <Alert variant="destructive" className="mb-4 border-orange-300 bg-orange-50 text-orange-900">
                  <Camera className="h-4 w-4" />
                  <AlertTitle className="text-orange-900">Photo Required</AlertTitle>
                  <AlertDescription className="text-orange-800">
                    CVs in {country.name} typically include a professional photo. 
                    {!hasPhoto && " You'll need to add a photo in the final download step."}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* CV Preview */}
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Formatted for {country.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ScrollArea className="h-[500px]">
                      <div className="bg-white border rounded-lg p-6 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                        {generateCountryFormattedCV()}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Country Info Panel */}
                <div className="space-y-4">
                  {/* Format Requirements */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Info className="w-4 h-4 text-primary" />
                        {country.name} CV Requirements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Photo</span>
                        <Badge variant={countryRequiresPhoto ? "destructive" : "secondary"}>
                          {countryRequiresPhoto ? 'Required' : 'Not Required'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Date of Birth</span>
                        <Badge variant={countryRules.includeDOB ? "outline" : "secondary"}>
                          {countryRules.includeDOB ? 'Expected' : 'Not Required'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Max Pages</span>
                        <Badge variant="outline">{countryRules.maxPages}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">References</span>
                        <Badge variant="secondary">
                          {countryRules.includeReferences ? 'Include' : 'On Request'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Date Format</span>
                        <Badge variant="outline">{countryRules.dateFormat}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Country Notes */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Additional Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {country.notes.map((note, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Warning if photo needed but missing */}
                  {countryRequiresPhoto && !hasPhoto && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Action Needed</AlertTitle>
                      <AlertDescription className="text-sm">
                        You'll be prompted to upload a professional photo on the download page.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border py-4 px-6 z-40">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/tailor-cv/comparison')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            {requiresPhoto && !hasPhoto && (
              <span className="text-sm text-orange-600 hidden sm:inline">
                <Camera className="w-4 h-4 inline mr-1" />
                Photo needed
              </span>
            )}
            <Button onClick={() => navigate('/tailor-cv/template')}>
              Continue with {selectedCountryData?.name} Format
            </Button>
          </div>
        </div>
      </div>

      <div className="h-24" />
    </CreateCVLayout>
  );
};

export default CountryPage;
