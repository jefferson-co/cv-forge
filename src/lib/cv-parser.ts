import { supabase } from "@/integrations/supabase/client";
import { CVFormData } from "@/types/cv";

export interface ParsedCVResult {
  rawText: string;
  fileName: string;
  extractedInfo: {
    fullName: string;
    email: string;
    phone: string;
    linkedinUrl: string;
  };
}

/**
 * Parse a CV file using the server-side edge function
 */
export async function parseCV(file: File): Promise<ParsedCVResult> {
  const formData = new FormData();
  formData.append("file", file);

  const { data, error } = await supabase.functions.invoke("parse-cv", {
    body: formData,
  });

  if (error) {
    throw new Error(error.message || "Failed to parse CV");
  }

  if (!data.success) {
    throw new Error(data.error || "Failed to parse CV");
  }

  return {
    rawText: data.rawText,
    fileName: data.fileName,
    extractedInfo: data.extractedInfo,
  };
}

/**
 * Build a CV form data structure from parsed results for AI processing
 */
export function buildCVFormDataForAI(
  rawText: string,
  fileName: string,
  extractedInfo: ParsedCVResult["extractedInfo"]
): CVFormData {
  return {
    experienceLevel: "experienced",
    cvTitle: fileName.replace(/\.[^/.]+$/, ""),
    fullName: extractedInfo.fullName,
    professionalTitle: "",
    email: extractedInfo.email,
    phone: extractedInfo.phone,
    location: "",
    linkedinUrl: extractedInfo.linkedinUrl,
    portfolioUrl: "",
    photoUrl: "",
    summary: rawText, // Pass the full raw text so AI can process it
    education: [],
    workExperience: [],
    skills: [],
    projects: [],
    customSections: [],
  };
}
