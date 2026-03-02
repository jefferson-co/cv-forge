import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, X, ArrowRight, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { useTailorCV } from "@/contexts/TailorCVContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import CreateCVLayout from "@/components/create-cv/CreateCVLayout";
import { toast } from "@/hooks/use-toast";
import { parseCV, buildCVFormDataForAI, ParsedCVResult } from "@/lib/cv-parser";

const UploadPage = () => {
  const navigate = useNavigate();
  const { data, setJobDescription, setOriginalCV } = useTailorCV();
  const [jobDescription, setLocalJobDescription] = useState(data.jobDescription);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedCVResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

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
          description: `Extracted ${result.rawText.length} characters from your CV.`,
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

  const canProceed = jobDescription.trim().length > 0 && selectedFile !== null && parsedResult !== null && !parseError && !isParsing;

  const handleAnalyze = () => {
    if (!canProceed || !selectedFile || !parsedResult) return;
    
    const fileUrl = URL.createObjectURL(selectedFile);
    
    // Build CV form data with the parsed raw text for AI processing
    const cvFormData = buildCVFormDataForAI(
      parsedResult.rawText,
      parsedResult.fileName,
      parsedResult.extractedInfo
    );
    
    setOriginalCV(cvFormData, selectedFile.name, fileUrl);

    navigate('/tailor-cv/processing');
  };

  return (
    <CreateCVLayout backTo="/dashboard">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Tailor Your CV to a Job
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload your CV and paste the job description. We'll optimize your CV to match the role.
          </p>
        </div>

        {/* Step 1: Job Description */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <Label className="text-lg font-semibold mb-4 block">
              Step 1: Add the Job Description
            </Label>
            <Textarea
              placeholder="Paste the job description here... Include the role, responsibilities, required skills, and qualifications."
              className="min-h-[200px] resize-y"
              value={jobDescription}
              onChange={handleJobDescriptionChange}
            />
            <p className="text-sm text-muted-foreground mt-2">
              {jobDescription.length} characters
            </p>
          </CardContent>
        </Card>

        {/* Step 2: CV Upload */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <Label className="text-lg font-semibold mb-4 block">
              Step 2: Upload Your Current CV
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
                  Supported formats: PDF, DOCX • Max size: 10MB
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
                
                {/* Parsing status */}
                {isParsing && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground p-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extracting content from your CV...</span>
                  </div>
                )}
                
                {parsedResult && !parseError && !isParsing && (
                  <div className="flex items-center gap-2 text-sm text-green-600 p-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>CV content extracted ({parsedResult.rawText.length} characters)</span>
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

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="gap-2 hidden sm:inline-flex">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <Button 
            onClick={handleAnalyze} 
            disabled={!canProceed}
            className="gap-2 w-full sm:w-auto"
            size="lg"
          >
            {isParsing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Parsing CV...
              </>
            ) : (
              <>
                Analyze & Tailor CV
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </CreateCVLayout>
  );
};

export default UploadPage;
