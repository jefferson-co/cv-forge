import { createContext, useContext, useState, ReactNode } from 'react';

export interface ATSFinding {
  id: string;
  severity: 'critical' | 'warning' | 'info' | 'pass';
  title: string;
  description: string;
  recommendation?: string;
}

export interface KeywordAnalysis {
  keyword: string;
  found: boolean;
  location?: string;
}

export interface ScoreBreakdown {
  formatCompatibility: {
    score: number;
    maxScore: number;
    findings: ATSFinding[];
  };
  structureOrganization: {
    score: number;
    maxScore: number;
    findings: ATSFinding[];
  };
  keywordMatch: {
    score: number;
    maxScore: number;
    findings: ATSFinding[];
    keywords: KeywordAnalysis[];
  };
  contentQuality: {
    score: number;
    maxScore: number;
    findings: ATSFinding[];
  };
}

export interface ATSAnalysisResult {
  overallScore: number;
  scoreLabel: 'Needs Improvement' | 'Good' | 'Very Good' | 'Excellent';
  summary: string;
  breakdown: ScoreBreakdown;
  criticalIssues: ATSFinding[];
  beforeAfterExamples: {
    title: string;
    before: string;
    after: string;
  }[];
}

export interface ATSCheckData {
  cvFile: File | null;
  cvFileName: string;
  cvRawText: string;
  jobDescription: string;
  hasJobDescription: boolean;
  analysisResult: ATSAnalysisResult | null;
}

interface ATSCheckContextType {
  data: ATSCheckData;
  setCVFile: (file: File | null, fileName: string, rawText: string) => void;
  setJobDescription: (description: string) => void;
  setHasJobDescription: (has: boolean) => void;
  setAnalysisResult: (result: ATSAnalysisResult) => void;
  resetATSData: () => void;
}

const initialData: ATSCheckData = {
  cvFile: null,
  cvFileName: '',
  cvRawText: '',
  jobDescription: '',
  hasJobDescription: false,
  analysisResult: null,
};

const ATSCheckContext = createContext<ATSCheckContextType | undefined>(undefined);

export const ATSCheckProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<ATSCheckData>(initialData);

  const setCVFile = (file: File | null, fileName: string, rawText: string) => {
    setData(prev => ({ 
      ...prev, 
      cvFile: file,
      cvFileName: fileName,
      cvRawText: rawText
    }));
  };

  const setJobDescription = (description: string) => {
    setData(prev => ({ 
      ...prev, 
      jobDescription: description,
      hasJobDescription: description.trim().length > 0
    }));
  };

  const setHasJobDescription = (has: boolean) => {
    setData(prev => ({ ...prev, hasJobDescription: has }));
  };

  const setAnalysisResult = (result: ATSAnalysisResult) => {
    setData(prev => ({ ...prev, analysisResult: result }));
  };

  const resetATSData = () => {
    setData(initialData);
  };

  return (
    <ATSCheckContext.Provider value={{
      data,
      setCVFile,
      setJobDescription,
      setHasJobDescription,
      setAnalysisResult,
      resetATSData,
    }}>
      {children}
    </ATSCheckContext.Provider>
  );
};

export const useATSCheck = () => {
  const context = useContext(ATSCheckContext);
  if (!context) {
    throw new Error('useATSCheck must be used within an ATSCheckProvider');
  }
  return context;
};
