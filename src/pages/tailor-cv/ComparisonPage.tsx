import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Check, Target, FileText, Sparkles, TrendingUp } from "lucide-react";
import { useTailorCV } from "@/contexts/TailorCVContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateCVLayout from "@/components/create-cv/CreateCVLayout";

const ComparisonPage = () => {
  const navigate = useNavigate();
  const { data } = useTailorCV();
  const [activeTab, setActiveTab] = useState<'before' | 'after' | 'changes'>('after');

  const generateCVText = (cv: typeof data.originalCVContent) => {
    if (!cv) return 'No content available';
    
    return `${cv.fullName || 'Name not provided'}
${cv.professionalTitle || ''}
${[cv.email, cv.phone, cv.location].filter(Boolean).join(' | ')}
${cv.linkedinUrl ? `LinkedIn: ${cv.linkedinUrl}` : ''}
${cv.portfolioUrl ? `Portfolio: ${cv.portfolioUrl}` : ''}

PROFESSIONAL SUMMARY
${cv.summary || 'No summary provided'}

EDUCATION
${cv.education?.length > 0 
  ? cv.education.map(e => 
      `${e.degree}
${e.institution}${e.location ? `, ${e.location}` : ''}
${e.startDate} - ${e.isCurrentlyStudying ? 'Present' : e.endDate}`
    ).join('\n\n')
  : 'No education entries'}

${cv.workExperience?.length > 0 ? `WORK EXPERIENCE
${cv.workExperience.map(w => 
  `${w.jobTitle}
${w.company}${w.location ? `, ${w.location}` : ''}
${w.startDate} - ${w.isCurrentlyWorking ? 'Present' : w.endDate}
${w.responsibilities}`
).join('\n\n')}` : ''}

SKILLS
${cv.skills?.length > 0 ? cv.skills.join(' • ') : 'No skills listed'}

${cv.projects?.length > 0 ? `PROJECTS
${cv.projects.map(p => 
  `${p.title}${p.role ? ` - ${p.role}` : ''}${p.date ? ` (${p.date})` : ''}
${p.description}`
).join('\n\n')}` : ''}`;
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'add': return '➕';
      case 'remove': return '➖';
      case 'modify': return '✏️';
      default: return '🔄';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <CreateCVLayout backTo="/tailor-cv">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Your Tailored CV
          </h1>
          <p className="text-muted-foreground mb-4">
            Review the changes we made to match the job description
          </p>
          <Badge 
            className={`text-lg px-4 py-1 text-white ${getMatchScoreColor(data.matchScore)}`}
          >
            {data.matchScore}% Match
          </Badge>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Target className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{data.matchScore}%</p>
                <p className="text-xs text-muted-foreground">Match Score</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Pencil className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{data.changes.length}</p>
                <p className="text-xs text-muted-foreground">Changes Made</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{data.keywordsAdded.length}</p>
                <p className="text-xs text-muted-foreground">Keywords Added</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">High</p>
                <p className="text-xs text-muted-foreground">ATS Optimization</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Tabs / Desktop Split View */}
        <div className="block lg:hidden mb-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="before">Before</TabsTrigger>
              <TabsTrigger value="after">After</TabsTrigger>
              <TabsTrigger value="changes">Changes</TabsTrigger>
            </TabsList>
            <TabsContent value="before">
              <Card>
                <CardContent className="p-4">
                  <Badge variant="secondary" className="mb-4">Before</Badge>
                  <ScrollArea className="h-[400px]">
                    <div className="font-mono text-sm whitespace-pre-wrap">
                      {generateCVText(data.originalCVContent)}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="after">
              <Card>
                <CardContent className="p-4">
                  <Badge className="mb-4 bg-green-500">After</Badge>
                  <ScrollArea className="h-[400px]">
                    <div className="font-mono text-sm whitespace-pre-wrap">
                      {generateCVText(data.tailoredCVContent)}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="changes">
              <Card>
                <CardContent className="p-4">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {data.changes.length > 0 ? (
                        data.changes.map((change, index) => (
                          <div key={change.id || index} className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-start gap-2 mb-2">
                              <span>{getChangeIcon(change.type)}</span>
                              <span className="font-medium text-sm">{change.explanation}</span>
                            </div>
                            {change.before && (
                              <p className="text-xs text-muted-foreground line-through mb-1">
                                Before: {change.before}
                              </p>
                            )}
                            {change.after && (
                              <p className="text-xs text-green-600">
                                After: {change.after}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center py-4">
                          No changes recorded
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop Split View */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-6 mb-6">
          {/* Before Panel */}
          <Card>
            <CardContent className="p-4">
              <Badge variant="secondary" className="mb-4">Before</Badge>
              <ScrollArea className="h-[500px]">
                <div className="font-mono text-sm whitespace-pre-wrap bg-white p-4 rounded border">
                  {generateCVText(data.originalCVContent)}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* After Panel */}
          <Card>
            <CardContent className="p-4">
              <Badge className="mb-4 bg-green-500 text-white">After</Badge>
              <ScrollArea className="h-[500px]">
                <div className="font-mono text-sm whitespace-pre-wrap bg-white p-4 rounded border">
                  {generateCVText(data.tailoredCVContent)}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Changes List (Desktop) */}
        <Card className="hidden lg:block mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Changes Made ({data.changes.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.changes.length > 0 ? (
                data.changes.map((change, index) => (
                  <div key={change.id || index} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <span>{getChangeIcon(change.type)}</span>
                      <span className="font-medium text-sm">{change.explanation}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground col-span-2 text-center py-4">
                  Your CV was already well-optimized for this role!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
          <Button variant="outline" onClick={() => navigate('/tailor-cv')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/tailor-cv/edit')} className="gap-2">
              <Pencil className="w-4 h-4" />
              Edit Manually
            </Button>
            <Button onClick={() => navigate('/tailor-cv/country')} className="gap-2">
              <Check className="w-4 h-4" />
              Approve Changes
            </Button>
          </div>
        </div>
      </div>
    </CreateCVLayout>
  );
};

export default ComparisonPage;
