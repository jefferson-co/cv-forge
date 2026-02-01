import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, X, ArrowRight, ArrowLeft } from "lucide-react";
import { useTailorCV } from "@/contexts/TailorCVContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import CreateCVLayout from "@/components/create-cv/CreateCVLayout";
import { toast } from "@/hooks/use-toast";

const UploadPage = () => {
  const navigate = useNavigate();
  const { data, setJobDescription, setOriginalCV } = useTailorCV();
  const [jobDescription, setLocalJobDescription] = useState(data.jobDescription);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalJobDescription(e.target.value);
    setJobDescription(e.target.value);
  };

  const handleFileSelect = useCallback((file: File) => {
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
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const canProceed = jobDescription.trim().length > 0 && selectedFile !== null;

  const handleAnalyze = () => {
    if (!canProceed || !selectedFile) return;
    
    // Store the file info - actual parsing happens in processing page
    // For now, we'll pass the file via URL.createObjectURL
    const fileUrl = URL.createObjectURL(selectedFile);
    
    // We'll parse the CV content in the processing page
    setOriginalCV({
      experienceLevel: 'experienced',
      cvTitle: selectedFile.name.replace(/\.[^/.]+$/, ''),
      fullName: '',
      professionalTitle: '',
      email: '',
      phone: '',
      location: '',
      linkedinUrl: '',
      portfolioUrl: '',
      photoUrl: '',
      summary: '',
      education: [],
      workExperience: [],
      skills: [],
      projects: [],
      customSections: [],
    }, selectedFile.name, fileUrl);

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
                <Button variant="ghost" size="icon" onClick={removeFile}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

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
            Analyze & Tailor CV
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </CreateCVLayout>
  );
};

export default UploadPage;
