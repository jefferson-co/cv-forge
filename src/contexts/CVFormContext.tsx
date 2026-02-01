import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CVFormData, ExperienceLevel } from '@/types/cv';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const defaultFormData: CVFormData = {
  experienceLevel: 'no-experience',
  cvTitle: '',
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
};

interface CVFormContextType {
  formData: CVFormData;
  setFormData: React.Dispatch<React.SetStateAction<CVFormData>>;
  updateField: <K extends keyof CVFormData>(field: K, value: CVFormData[K]) => void;
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
  saveDraft: () => Promise<void>;
  isSaving: boolean;
  lastSaved: Date | null;
  resetForm: () => void;
}

const CVFormContext = createContext<CVFormContextType | undefined>(undefined);

export const CVFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CVFormData>(defaultFormData);
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Pre-fill email from user account
  useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: user.email || '' }));
    }
  }, [user?.email]);

  const updateField = useCallback(<K extends keyof CVFormData>(field: K, value: CVFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const saveDraft = useCallback(async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Check if draft exists
      const { data: existingDraft } = await supabase
        .from('cvs')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'draft')
        .maybeSingle();

      const cvContent = JSON.parse(JSON.stringify(formData));

      const cvTitle = formData.cvTitle || (formData.fullName ? `${formData.fullName}'s CV` : 'Untitled CV');

      if (existingDraft) {
        await supabase
          .from('cvs')
          .update({
            title: cvTitle,
            content: cvContent,
            type: 'draft',
          })
          .eq('id', existingDraft.id);
      } else {
        await supabase
          .from('cvs')
          .insert({
            user_id: user.id,
            title: cvTitle,
            content: cvContent,
            type: 'draft',
          });
      }

      setLastSaved(new Date());
      toast({
        title: "Draft saved",
        description: "Your progress has been saved.",
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error saving draft",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [user, formData]);

  const resetForm = useCallback(() => {
    setFormData(defaultFormData);
    setSelectedCountry('US');
    setSelectedTemplate('modern');
    setLastSaved(null);
  }, []);

  return (
    <CVFormContext.Provider
      value={{
        formData,
        setFormData,
        updateField,
        selectedCountry,
        setSelectedCountry,
        selectedTemplate,
        setSelectedTemplate,
        saveDraft,
        isSaving,
        lastSaved,
        resetForm,
      }}
    >
      {children}
    </CVFormContext.Provider>
  );
};

export const useCVForm = () => {
  const context = useContext(CVFormContext);
  if (!context) {
    throw new Error('useCVForm must be used within CVFormProvider');
  }
  return context;
};
