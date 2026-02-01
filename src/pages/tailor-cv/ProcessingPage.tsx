import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { useTailorCV } from "@/contexts/TailorCVContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
}

const ProcessingPage = () => {
  const navigate = useNavigate();
  const { 
    data, 
    setTailoredCV, 
    setJobAnalysis, 
    setChanges, 
    setMatchScore, 
    setKeywordsAdded 
  } = useTailorCV();
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { id: 'parse', label: 'Analyzing job description', status: 'pending' },
    { id: 'extract', label: 'Extracting key requirements', status: 'pending' },
    { id: 'analyze', label: 'Analyzing your CV', status: 'pending' },
    { id: 'match', label: 'Matching skills and experience', status: 'pending' },
    { id: 'rewrite', label: 'Rewriting content to match role', status: 'pending' },
    { id: 'optimize', label: 'Optimizing for keywords', status: 'pending' },
  ]);

  const updateStepStatus = (stepId: string, status: ProcessingStep['status']) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  useEffect(() => {
    const processTailoring = async () => {
      if (!data.jobDescription || !data.originalCVFileUrl) {
        navigate('/tailor-cv');
        return;
      }

      try {
        // Step 1: Analyzing job description
        updateStepStatus('parse', 'processing');
        await new Promise(resolve => setTimeout(resolve, 800));
        updateStepStatus('parse', 'complete');

        // Step 2: Extracting requirements
        updateStepStatus('extract', 'processing');
        await new Promise(resolve => setTimeout(resolve, 600));
        updateStepStatus('extract', 'complete');

        // Step 3: Analyzing CV
        updateStepStatus('analyze', 'processing');
        await new Promise(resolve => setTimeout(resolve, 700));
        updateStepStatus('analyze', 'complete');

        // Step 4: Matching skills
        updateStepStatus('match', 'processing');

        // Call AI to tailor the CV
        const { data: aiResponse, error: aiError } = await supabase.functions.invoke('tailor-cv', {
          body: {
            jobDescription: data.jobDescription,
            originalCV: data.originalCVContent,
          }
        });

        if (aiError) {
          throw new Error(aiError.message || 'AI service temporarily unavailable');
        }

        updateStepStatus('match', 'complete');

        // Step 5: Rewriting content
        updateStepStatus('rewrite', 'processing');
        await new Promise(resolve => setTimeout(resolve, 500));
        updateStepStatus('rewrite', 'complete');

        // Step 6: Optimizing keywords
        updateStepStatus('optimize', 'processing');
        await new Promise(resolve => setTimeout(resolve, 400));
        updateStepStatus('optimize', 'complete');

        // Process AI response
        if (aiResponse) {
          if (aiResponse.tailoredCV) {
            setTailoredCV(aiResponse.tailoredCV);
          }
          if (aiResponse.jobAnalysis) {
            setJobAnalysis(aiResponse.jobAnalysis);
          }
          if (aiResponse.changes) {
            setChanges(aiResponse.changes);
          }
          if (aiResponse.matchScore !== undefined) {
            setMatchScore(aiResponse.matchScore);
          }
          if (aiResponse.keywordsAdded) {
            setKeywordsAdded(aiResponse.keywordsAdded);
          }
        }

        // Navigate to comparison
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate('/tailor-cv/comparison');

      } catch (err) {
        console.error('Tailoring error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to tailor CV';
        setError(errorMessage);
        
        // Mark remaining steps as error
        setSteps(prev => prev.map(step => 
          step.status === 'processing' || step.status === 'pending' 
            ? { ...step, status: 'error' } 
            : step
        ));

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };

    processTailoring();
  }, []);

  const handleRetry = () => {
    navigate('/tailor-cv');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {!error ? (
          <>
            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Tailoring your CV to this job...
            </h1>
            <p className="text-muted-foreground mb-8">
              This usually takes 15-30 seconds
            </p>

            <div className="space-y-3 text-left">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center gap-3">
                  {step.status === 'complete' && (
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}
                  {step.status === 'processing' && (
                    <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
                  )}
                  {step.status === 'pending' && (
                    <div className="w-5 h-5 rounded-full border-2 border-muted flex-shrink-0" />
                  )}
                  {step.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  )}
                  <span className={`text-sm ${
                    step.status === 'complete' ? 'text-foreground' :
                    step.status === 'processing' ? 'text-foreground font-medium' :
                    step.status === 'error' ? 'text-destructive' :
                    'text-muted-foreground'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Something went wrong
            </h1>
            <p className="text-muted-foreground mb-6">
              {error}
            </p>
            <Button onClick={handleRetry} size="lg">
              Try Again
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProcessingPage;
