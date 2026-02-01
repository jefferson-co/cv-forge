import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { CVFormData } from '@/types/cv';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs`;

export interface ParsedCVContent {
  rawText: string;
  sections: {
    summary?: string;
    workExperience?: string[];
    education?: string[];
    skills?: string[];
    projects?: string[];
    contact?: string;
  };
}

/**
 * Parse a PDF file and extract text content
 */
async function parsePDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText;
}

/**
 * Parse a DOCX file and extract text content
 */
async function parseDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/**
 * Try to extract structured sections from raw CV text
 */
function extractSections(rawText: string): ParsedCVContent['sections'] {
  const sections: ParsedCVContent['sections'] = {};
  const text = rawText.toLowerCase();
  
  // Common section headers
  const sectionPatterns = {
    summary: /(?:professional\s+)?summary|profile|objective|about\s+me/i,
    workExperience: /(?:work\s+)?experience|employment|career\s+history|professional\s+experience/i,
    education: /education|academic|qualifications|degrees/i,
    skills: /skills|competencies|technical\s+skills|expertise/i,
    projects: /projects|portfolio|work\s+samples/i,
  };
  
  // Split by common delimiters and try to identify sections
  const lines = rawText.split(/\n+/);
  let currentSection = '';
  let currentContent: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Check if this line is a section header
    let isHeader = false;
    for (const [section, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(trimmedLine) && trimmedLine.length < 50) {
        // Save previous section
        if (currentSection && currentContent.length > 0) {
          if (currentSection === 'summary') {
            sections.summary = currentContent.join(' ');
          } else if (['workExperience', 'education', 'projects'].includes(currentSection)) {
            (sections as any)[currentSection] = currentContent;
          } else if (currentSection === 'skills') {
            sections.skills = currentContent;
          }
        }
        
        currentSection = section;
        currentContent = [];
        isHeader = true;
        break;
      }
    }
    
    if (!isHeader && currentSection) {
      currentContent.push(trimmedLine);
    }
  }
  
  // Save last section
  if (currentSection && currentContent.length > 0) {
    if (currentSection === 'summary') {
      sections.summary = currentContent.join(' ');
    } else if (['workExperience', 'education', 'projects'].includes(currentSection)) {
      (sections as any)[currentSection] = currentContent;
    } else if (currentSection === 'skills') {
      sections.skills = currentContent;
    }
  }
  
  return sections;
}

/**
 * Extract email from text
 */
function extractEmail(text: string): string {
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  return emailMatch ? emailMatch[0] : '';
}

/**
 * Extract phone number from text
 */
function extractPhone(text: string): string {
  const phoneMatch = text.match(/(?:\+\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/);
  return phoneMatch ? phoneMatch[0] : '';
}

/**
 * Extract LinkedIn URL from text
 */
function extractLinkedIn(text: string): string {
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i);
  return linkedinMatch ? linkedinMatch[0] : '';
}

/**
 * Parse uploaded CV file and return structured data
 */
export async function parseCV(file: File): Promise<{ rawText: string; formData: Partial<CVFormData> }> {
  let rawText = '';
  
  if (file.type === 'application/pdf') {
    rawText = await parsePDF(file);
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    rawText = await parseDOCX(file);
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
  }
  
  const sections = extractSections(rawText);
  const email = extractEmail(rawText);
  const phone = extractPhone(rawText);
  const linkedinUrl = extractLinkedIn(rawText);
  
  // Build partial CV form data from extracted content
  const formData: Partial<CVFormData> = {
    experienceLevel: 'experienced',
    cvTitle: file.name.replace(/\.[^/.]+$/, ''),
    email,
    phone,
    linkedinUrl,
    summary: sections.summary || '',
    // Store raw text in a way the AI can process
    // The AI will properly structure this data
  };
  
  return { rawText, formData };
}

/**
 * Build a CV form data structure that includes the raw text for AI processing
 */
export function buildCVFormDataForAI(rawText: string, fileName: string): CVFormData {
  const email = extractEmail(rawText);
  const phone = extractPhone(rawText);
  const linkedinUrl = extractLinkedIn(rawText);
  
  // Extract the first line that might be a name (usually at the top)
  const lines = rawText.split(/\n+/).filter(l => l.trim());
  const possibleName = lines[0]?.trim() || '';
  
  return {
    experienceLevel: 'experienced',
    cvTitle: fileName.replace(/\.[^/.]+$/, ''),
    fullName: possibleName.length < 50 ? possibleName : '',
    professionalTitle: '',
    email,
    phone,
    location: '',
    linkedinUrl,
    portfolioUrl: '',
    photoUrl: '',
    summary: rawText, // Pass the full raw text as summary so AI can process it
    education: [],
    workExperience: [],
    skills: [],
    projects: [],
    customSections: [],
  };
}
