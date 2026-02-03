import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, X, ArrowRight, ArrowLeft, Loader2, CheckCircle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { useATSCheck } from "@/contexts/ATSCheckContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import CreateCVLayout from "@/components/create-cv/CreateCVLayout";
import { toast } from "@/hooks/use-toast";
import { parseCV, ParsedCVResult } from "@/lib/cv-parser";

const ATSUploadPage = () => {
  const navigate = useNavigate();
  const { data, setCVFile, setJobDescription } = useATSCheck();
  const [localJobDescription, setLocalJobDescription] = useState(data.jobDescription);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedCVResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isWhyATSOpen, setIsWhyATSOpen] = useState(false);

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalJobDescription(e.target.value);
    setJobDescription(e.target.value);
  };

  const handleFileSelect = useCallback(async (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document (.pdf, .docx)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "File must be under 10MB. Please compress and try again.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setParseError(null);
    setParsedResult(null);
    setIsParsing(true);

    try {
      const result = await parseCV(file);
      setParsedResult(result);
      
      if (result.rawText.trim().length < 50) {
        setParseError("Unable to extract meaningful content from this file. Please try a different file.");
        toast({
          title: "Parsing issue",
          description: "The file appears to be empty or the content couldn't be extracted.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "CV parsed successfully",
          description: `Ready for ATS analysis.`,
        });
      }
    } catch (error) {
      console.error('CV parsing error:', error);
      setParseError(error instanceof Error ? error.message : "Failed to parse CV");
      toast({
        title: "Unable to read CV",
        description: "Please try a different file format or version.",
        variant: "destructive",
      });
    } finally {
      setIsParsing(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setParsedResult(null);
    setParseError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const canProceed = selectedFile !== null && parsedResult !== null && !parseError && !isParsing;

  const handleAnalyze = () => {
    if (!canProceed || !selectedFile || !parsedResult) return;
    
    setCVFile(selectedFile, selectedFile.name, parsedResult.rawText);
    navigate('/ats-check/analyzing');
  };

  return (
    <CreateCVLayout backTo="/dashboard">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-3">
            ATS Compatibility Check
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload your CV and paste a job description to see how well it will perform in Applicant Tracking Systems
          </p>
        </div>

        {/* Step 1: CV Upload */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <Label className="text-lg font-semibold mb-4 block">
              Step 1: Upload Your CV
            </Label>
            
            {!selectedFile ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  isDragging 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById('cv-upload')?.click()}
              >
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-foreground font-medium mb-2">
                  Drag and drop your CV here, or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  PDF or DOCX • Max size: 10MB
                </p>
                <input
                  type="file"
                  id="cv-upload"
                  className="hidden"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileInputChange}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={removeFile} disabled={isParsing}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                {isParsing && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground p-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extracting content from your CV...</span>
                  </div>
                )}
                
                {parsedResult && !parseError && !isParsing && (
                  <div className="flex items-center gap-2 text-sm text-green-600 p-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>CV ready for ATS analysis</span>
                  </div>
                )}
                
                {parseError && (
                  <div className="text-sm text-destructive p-2">
                    {parseError}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Job Description (only show after CV is uploaded) */}
        {parsedResult && !parseError && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <Label className="text-lg font-semibold mb-4 block">
                Step 2: Add Job Description (Optional but Recommended)
              </Label>
              
              {/* Info callout */}
              <div className="bg-muted/50 rounded-lg p-4 mb-4 flex gap-3">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Adding a job description helps us check if your CV matches the role's requirements and keywords. Skip this step for a general ATS check.
                </p>
              </div>
              
              <Textarea
                placeholder="Paste the job description here... Include the role, responsibilities, required skills, and qualifications for best results."
                className="min-h-[200px] resize-y"
                value={localJobDescription}
                onChange={handleJobDescriptionChange}
              />
              {localJobDescription.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {localJobDescription.length} characters
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Why ATS Matters - Collapsible */}
        <Collapsible open={isWhyATSOpen} onOpenChange={setIsWhyATSOpen} className="mb-8">
          <Card>
            <CollapsibleTrigger asChild>
              <CardContent className="p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">Why does ATS compatibility matter?</span>
                  {isWhyATSOpen ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 px-4 pb-4">
                <p className="text-muted-foreground mb-3">
                  Up to 75% of resumes are rejected by ATS before a human ever sees them. These systems scan for:
                </p>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Relevant keywords and skills
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Proper formatting and structure
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Standard section headings
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Readable fonts and layouts
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Absence of images, tables, and complex formatting
                  </li>
                </ul>
                <p className="text-muted-foreground text-sm mt-3">
                  Our ATS check analyzes all these factors and more.
                </p>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <Button 
            onClick={handleAnalyze} 
            disabled={!canProceed}
            className="gap-2"
            size="lg"
          >
            {isParsing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Parsing CV...
              </>
            ) : (
              <>
                Check ATS Score
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </CreateCVLayout>
  );
};

export default ATSUploadPage;
