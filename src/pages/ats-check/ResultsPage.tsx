import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, XCircle, Info, ChevronDown, ChevronUp, Download, Target, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useATSCheck } from "@/contexts/ATSCheckContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import CreateCVLayout from "@/components/create-cv/CreateCVLayout";
import { useState, useEffect } from "react";

const getScoreColor = (score: number) => {
  if (score <= 50) return 'text-red-500';
  if (score <= 75) return 'text-amber-500';
  if (score <= 90) return 'text-emerald-500';
  return 'text-green-600';
};

const getScoreBgColor = (score: number) => {
  if (score <= 50) return 'bg-red-500';
  if (score <= 75) return 'bg-amber-500';
  if (score <= 90) return 'bg-emerald-500';
  return 'bg-green-600';
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />;
    case 'pass':
      return <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />;
    default:
      return <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />;
  }
};

const ResultsPage = () => {
  const navigate = useNavigate();
  const { data, resetATSData } = useATSCheck();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    format: true,
    structure: true,
    keywords: true,
    content: true,
  });

  const result = data.analysisResult;

  useEffect(() => {
    if (!result) {
      navigate('/ats-check');
    }
  }, [result, navigate]);

  if (!result) {
    return null;
  }

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCheckAnother = () => {
    resetATSData();
    navigate('/ats-check');
  };

  const handleTailorCV = () => {
    navigate('/tailor-cv');
  };

  return (
    <CreateCVLayout backTo="/dashboard">
      <div className="max-w-4xl mx-auto">
        {/* Header with Score */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Your ATS Score: <span className={getScoreColor(result.overallScore)}>{result.overallScore}/100</span>
          </h1>
          <p className="text-muted-foreground">
            Based on analysis of your CV{data.hasJobDescription ? ' and the job description' : ''}
          </p>
        </motion.div>

        {/* Overall Assessment Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
        >
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Score Circle */}
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(result.overallScore / 100) * 352} 352`}
                    strokeLinecap="round"
                    className={getScoreColor(result.overallScore)}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${getScoreColor(result.overallScore)}`}>
                    {result.overallScore}
                  </span>
                  <span className="text-xs text-muted-foreground">out of 100</span>
                </div>
              </div>

              {/* Status and Summary */}
              <div className="flex-1 text-center md:text-left">
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${
                  result.overallScore <= 50 ? 'bg-red-100 text-red-700' :
                  result.overallScore <= 75 ? 'bg-amber-100 text-amber-700' :
                  result.overallScore <= 90 ? 'bg-emerald-100 text-emerald-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {result.scoreLabel}
                </div>
                <p className="text-muted-foreground">
                  {result.summary}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Critical Issues Panel (if score < 60) */}
        {result.criticalIssues.length > 0 && result.overallScore < 60 && (
          <Card className="mb-6 border-red-200 bg-red-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                Critical Issues - Fix These First
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {result.criticalIssues.map((issue, index) => (
                  <li key={issue.id} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{issue.title}</p>
                      <p className="text-sm text-muted-foreground">{issue.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Score Breakdown Sections */}
        <div className="space-y-4 mb-8">
          {/* Format Compatibility */}
          <Collapsible open={openSections.format} onOpenChange={() => toggleSection('format')}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">Format Compatibility</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {result.breakdown.formatCompatibility.score}/{result.breakdown.formatCompatibility.maxScore} points
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress 
                        value={(result.breakdown.formatCompatibility.score / result.breakdown.formatCompatibility.maxScore) * 100} 
                        className="w-24 h-2"
                      />
                      {openSections.format ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {result.breakdown.formatCompatibility.findings.map((finding) => (
                      <div key={finding.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                        {getSeverityIcon(finding.severity)}
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{finding.title}</p>
                          <p className="text-sm text-muted-foreground">{finding.description}</p>
                          {finding.recommendation && (
                            <p className="text-sm text-primary mt-1">{finding.recommendation}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Structure & Organization */}
          <Collapsible open={openSections.structure} onOpenChange={() => toggleSection('structure')}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">Structure & Organization</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {result.breakdown.structureOrganization.score}/{result.breakdown.structureOrganization.maxScore} points
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress 
                        value={(result.breakdown.structureOrganization.score / result.breakdown.structureOrganization.maxScore) * 100} 
                        className="w-24 h-2"
                      />
                      {openSections.structure ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {result.breakdown.structureOrganization.findings.map((finding) => (
                      <div key={finding.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                        {getSeverityIcon(finding.severity)}
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{finding.title}</p>
                          <p className="text-sm text-muted-foreground">{finding.description}</p>
                          {finding.recommendation && (
                            <p className="text-sm text-primary mt-1">{finding.recommendation}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Keyword Match (only if job description provided) */}
          {data.hasJobDescription && (
            <Collapsible open={openSections.keywords} onOpenChange={() => toggleSection('keywords')}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <div>
                          <CardTitle className="text-lg">Keyword Match</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {result.breakdown.keywordMatch.score}/{result.breakdown.keywordMatch.maxScore} points
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Progress 
                          value={(result.breakdown.keywordMatch.score / result.breakdown.keywordMatch.maxScore) * 100} 
                          className="w-24 h-2"
                        />
                        {openSections.keywords ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {/* Keywords grid */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-foreground mb-3">Keyword Analysis</p>
                      <div className="flex flex-wrap gap-2">
                        {result.breakdown.keywordMatch.keywords.map((kw, idx) => (
                          <span 
                            key={idx}
                            className={`px-3 py-1 rounded-full text-sm ${
                              kw.found 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {kw.found ? '✓' : '✗'} {kw.keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {result.breakdown.keywordMatch.findings.map((finding) => (
                        <div key={finding.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                          {getSeverityIcon(finding.severity)}
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{finding.title}</p>
                            <p className="text-sm text-muted-foreground">{finding.description}</p>
                            {finding.recommendation && (
                              <p className="text-sm text-primary mt-1">{finding.recommendation}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {/* Content Quality */}
          <Collapsible open={openSections.content} onOpenChange={() => toggleSection('content')}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">Content Quality</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {result.breakdown.contentQuality.score}/{result.breakdown.contentQuality.maxScore} points
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress 
                        value={(result.breakdown.contentQuality.score / result.breakdown.contentQuality.maxScore) * 100} 
                        className="w-24 h-2"
                      />
                      {openSections.content ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {result.breakdown.contentQuality.findings.map((finding) => (
                      <div key={finding.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                        {getSeverityIcon(finding.severity)}
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{finding.title}</p>
                          <p className="text-sm text-muted-foreground">{finding.description}</p>
                          {finding.recommendation && (
                            <p className="text-sm text-primary mt-1">{finding.recommendation}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        {/* Before & After Examples */}
        {result.beforeAfterExamples.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Before & After Examples</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.beforeAfterExamples.map((example, idx) => (
                <div key={idx} className="space-y-2">
                  <p className="font-medium text-foreground">{example.title}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800">
                      <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">❌ Before</p>
                      <p className="text-sm text-red-900 dark:text-red-200">{example.before}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800">
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">✓ After</p>
                      <p className="text-sm text-green-900 dark:text-green-200">{example.after}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="w-full sm:w-auto gap-2">
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </Button>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={handleCheckAnother} className="w-full sm:w-auto">
              Check Another CV
            </Button>
            {data.hasJobDescription && (
              <Button onClick={handleTailorCV} className="w-full sm:w-auto gap-2">
                <Target className="w-4 h-4" />
                Tailor CV to This Job
              </Button>
            )}
          </div>
        </div>
      </div>
    </CreateCVLayout>
  );
};

export default ResultsPage;
