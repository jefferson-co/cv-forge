import { createContext, useContext, useState, ReactNode } from 'react';
import { CVFormData } from '@/types/cv';

export interface CVChange {
  id: string;
  type: 'add' | 'remove' | 'modify';
  section: string;
  before: string;
  after: string;
  explanation: string;
}

export interface JobAnalysis {
  jobTitle: string;
  companyName: string;
  requiredSkills: string[];
  preferredQualifications: string[];
  keyResponsibilities: string[];
  industryKeywords: string[];
  experienceLevel: string;
  roleType: string;
}

export interface TailorCVData {
  jobDescription: string;
  originalCVContent: CVFormData | null;
  originalCVFileUrl: string;
  originalCVFileName: string;
  tailoredCVContent: CVFormData | null;
  jobAnalysis: JobAnalysis | null;
  changes: CVChange[];
  matchScore: number;
  keywordsAdded: string[];
  selectedCountry: string;
  selectedTemplate: string;
  customName: string;
}

interface TailorCVContextType {
  data: TailorCVData;
  setJobDescription: (description: string) => void;
  setOriginalCV: (content: CVFormData, fileName: string, fileUrl?: string) => void;
  setTailoredCV: (content: CVFormData) => void;
  setJobAnalysis: (analysis: JobAnalysis) => void;
  setChanges: (changes: CVChange[]) => void;
  setMatchScore: (score: number) => void;
  setKeywordsAdded: (keywords: string[]) => void;
  setSelectedCountry: (country: string) => void;
  setSelectedTemplate: (template: string) => void;
  setCustomName: (name: string) => void;
  updateTailoredCVField: (field: keyof CVFormData, value: any) => void;
  resetTailorData: () => void;
}

const initialData: TailorCVData = {
  jobDescription: '',
  originalCVContent: null,
  originalCVFileUrl: '',
  originalCVFileName: '',
  tailoredCVContent: null,
  jobAnalysis: null,
  changes: [],
  matchScore: 0,
  keywordsAdded: [],
  selectedCountry: 'US',
  selectedTemplate: 'modern',
  customName: '',
};

const TailorCVContext = createContext<TailorCVContextType | undefined>(undefined);

export const TailorCVProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<TailorCVData>(initialData);

  const setJobDescription = (description: string) => {
    setData(prev => ({ ...prev, jobDescription: description }));
  };

  const setOriginalCV = (content: CVFormData, fileName: string, fileUrl?: string) => {
    setData(prev => ({ 
      ...prev, 
      originalCVContent: content,
      originalCVFileName: fileName,
      originalCVFileUrl: fileUrl || ''
    }));
  };

  const setTailoredCV = (content: CVFormData) => {
    setData(prev => ({ ...prev, tailoredCVContent: content }));
  };

  const setJobAnalysis = (analysis: JobAnalysis) => {
    setData(prev => ({ ...prev, jobAnalysis: analysis }));
  };

  const setChanges = (changes: CVChange[]) => {
    setData(prev => ({ ...prev, changes }));
  };

  const setMatchScore = (score: number) => {
    setData(prev => ({ ...prev, matchScore: score }));
  };

  const setKeywordsAdded = (keywords: string[]) => {
    setData(prev => ({ ...prev, keywordsAdded: keywords }));
  };

  const setSelectedCountry = (country: string) => {
    setData(prev => ({ ...prev, selectedCountry: country }));
  };

  const setSelectedTemplate = (template: string) => {
    setData(prev => ({ ...prev, selectedTemplate: template }));
  };

  const setCustomName = (name: string) => {
    setData(prev => ({ ...prev, customName: name }));
  };

  const updateTailoredCVField = (field: keyof CVFormData, value: any) => {
    setData(prev => ({
      ...prev,
      tailoredCVContent: prev.tailoredCVContent 
        ? { ...prev.tailoredCVContent, [field]: value }
        : null
    }));
  };

  const resetTailorData = () => {
    setData(initialData);
  };

  return (
    <TailorCVContext.Provider value={{
      data,
      setJobDescription,
      setOriginalCV,
      setTailoredCV,
      setJobAnalysis,
      setChanges,
      setMatchScore,
      setKeywordsAdded,
      setSelectedCountry,
      setSelectedTemplate,
      setCustomName,
      updateTailoredCVField,
      resetTailorData,
    }}>
      {children}
    </TailorCVContext.Provider>
  );
};

export const useTailorCV = () => {
  const context = useContext(TailorCVContext);
  if (!context) {
    throw new Error('useTailorCV must be used within a TailorCVProvider');
  }
  return context;
};
