import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { useATSCheck } from "@/contexts/ATSCheckContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
}

const funFacts = [
  "Did you know? ATS systems reject CVs with tables and text boxes.",
  "Tip: Using standard section headings like 'Work Experience' improves ATS scores.",
  "Fun fact: Over 98% of Fortune 500 companies use ATS to filter candidates.",
  "Tip: Keep your CV to a single column layout for best ATS compatibility.",
  "Did you know? ATS can't read text embedded in images or graphics.",
];

const AnalyzingPage = () => {
  const navigate = useNavigate();
  const { data, setAnalysisResult } = useATSCheck();
  const [error, setError] = useState<string | null>(null);
  const [currentFact, setCurrentFact] = useState(0);
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { id: 'parse', label: 'Parsing your CV', status: 'pending' },
    { id: 'format', label: 'Checking formatting', status: 'pending' },
    { id: 'keywords', label: 'Analyzing keywords', status: 'pending' },
    ...(data.hasJobDescription ? [{ id: 'compare', label: 'Comparing to job requirements', status: 'pending' as const }] : []),
    { id: 'issues', label: 'Identifying issues', status: 'pending' },
    { id: 'recommendations', label: 'Generating recommendations', status: 'pending' },
  ]);

  const updateStepStatus = (stepId: string, status: ProcessingStep['status']) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  // Rotate fun facts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFact(prev => (prev + 1) % funFacts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const runAnalysis = async () => {
      if (!data.cvRawText) {
        navigate('/ats-check');
        return;
      }

      try {
        // Step 1: Parsing CV
        updateStepStatus('parse', 'processing');
        await new Promise(resolve => setTimeout(resolve, 800));
        updateStepStatus('parse', 'complete');

        // Step 2: Checking formatting
        updateStepStatus('format', 'processing');
        await new Promise(resolve => setTimeout(resolve, 600));
        updateStepStatus('format', 'complete');

        // Step 3: Analyzing keywords
        updateStepStatus('keywords', 'processing');

        // Call the ATS analysis edge function
        const { data: atsResponse, error: atsError } = await supabase.functions.invoke('analyze-ats', {
          body: {
            cvText: data.cvRawText,
            jobDescription: data.hasJobDescription ? data.jobDescription : null,
          }
        });

        if (atsError) {
          throw new Error(atsError.message || 'ATS analysis service temporarily unavailable');
        }

        updateStepStatus('keywords', 'complete');

        // Step 4: Comparing to job requirements (if applicable)
        if (data.hasJobDescription) {
          updateStepStatus('compare', 'processing');
          await new Promise(resolve => setTimeout(resolve, 500));
          updateStepStatus('compare', 'complete');
        }

        // Step 5: Identifying issues
        updateStepStatus('issues', 'processing');
        await new Promise(resolve => setTimeout(resolve, 400));
        updateStepStatus('issues', 'complete');

        // Step 6: Generating recommendations
        updateStepStatus('recommendations', 'processing');
        await new Promise(resolve => setTimeout(resolve, 300));
        updateStepStatus('recommendations', 'complete');

        // Process response and store results
        if (atsResponse) {
          setAnalysisResult(atsResponse);
        }

        // Navigate to results
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate('/ats-check/results');

      } catch (err) {
        console.error('ATS analysis error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to analyze CV';
        setError(errorMessage);
        
        // Mark remaining steps as error
        setSteps(prev => prev.map(step => 
          step.status === 'processing' || step.status === 'pending' 
            ? { ...step, status: 'error' } 
            : step
        ));

        toast({
          title: "Analysis failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };

    runAnalysis();
  }, []);

  const handleRetry = () => {
    navigate('/ats-check');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {!error ? (
          <>
            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Analyzing your CV for ATS compatibility...
            </h1>
            <p className="text-muted-foreground mb-8">
              This will take 15-30 seconds
            </p>

            <div className="space-y-3 text-left mb-8">
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

            {/* Fun fact */}
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              {funFacts[currentFact]}
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

export default AnalyzingPage;
